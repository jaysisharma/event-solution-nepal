'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';
import { parseSortDate } from '@/lib/dateUtils';

const prisma = new PrismaClient();

export async function getHeroSlides() {
    try {
        const slides = await prisma.heroSlide.findMany();

        // Custom sort: Featured First, then Upcoming (ASC), then Completed (DESC)
        const sortedSlides = slides.sort((a, b) => {
            // Featured comes first
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;

            // Then Upcoming before Completed
            if (a.status === 'UPCOMING' && b.status === 'COMPLETED') return -1;
            if (a.status === 'COMPLETED' && b.status === 'UPCOMING') return 1;

            const dateA = a.eventDate ? new Date(a.eventDate) : new Date(0);
            const dateB = b.eventDate ? new Date(b.eventDate) : new Date(0);

            if (a.status === 'UPCOMING') {
                return dateA - dateB; // ASC (closer first)
            } else {
                return dateB - dateA; // DESC (most recent first)
            }
        });

        return { success: true, data: sortedSlides };
    } catch (error) {
        console.error('Failed to fetch hero slides:', error);
        return { success: false, error: 'Failed to fetch slides' };
    }
}

// Helper to determine status from date
function determineStatus(dateString) {
    if (!dateString) return "UPCOMING";
    const eventDate = parseSortDate(dateString);
    if (!eventDate) return "UPCOMING"; // Default if unparseable

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today ? "COMPLETED" : "UPCOMING";
}

export async function createHeroSlide(formData) {
    try {
        const image = formData.get('image');
        const label = formData.get('label');
        const title = formData.get('title');
        const rating = formData.get('rating') || "4.9";
        const ratingLabel = formData.get('ratingLabel') || "Average Rating";
        const capacity = formData.get('capacity') || "Handling events up to 10k guests.";
        const capacityLabel = formData.get('capacityLabel') || "Capacity";

        const ratingIcon = formData.get('ratingIcon') || "Star";
        const capacityIcon = formData.get('capacityIcon') || "Users";
        const showStats = formData.get('showStats') === 'true';
        const isFeatured = formData.get('isFeatured') === 'true';

        const eventDateStr = formData.get('eventDate');
        const eventDate = eventDateStr ? new Date(eventDateStr) : null;
        const status = determineStatus(eventDateStr);

        if (!image || !label || !title) {
            return { success: false, error: 'Missing required fields' };
        }

        // Handle Image Upload
        let imagePath = '';
        if (typeof image === 'string') {
            imagePath = image;
        } else if (image && typeof image === 'object' && image.size > 0) {
            imagePath = await saveFile(image, 'hero');
        }

        if (!imagePath) {
            return { success: false, error: 'Failed to upload image. Please try again.' };
        }

        // Get max order to append to end
        const maxOrder = await prisma.heroSlide.aggregate({
            _max: { order: true }
        });
        const newOrder = (maxOrder._max.order || 0) + 1;

        await prisma.heroSlide.create({
            data: {
                image: imagePath,
                label,
                title,
                order: newOrder,
                rating,
                ratingLabel,
                ratingIcon,
                capacity,
                capacityLabel,
                capacityIcon,
                showStats,
                isFeatured,
                status,
                eventDate,
                sortDate
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to create hero slide:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create slide';
        return { success: false, error: errorMessage };
    }
}

export async function deleteHeroSlide(id) {
    try {
        await prisma.heroSlide.delete({
            where: { id },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete hero slide:', error);
        return { success: false, error: 'Failed to delete slide' };
    }
}

// HeroSettings actions removed as per request to keep left side static.

export async function updateHeroSlide(id, formData) {
    try {
        const image = formData.get('image'); // Optional if not changing
        const label = formData.get('label');
        const title = formData.get('title');

        const eventDate = formData.get('eventDate') || '';
        const sortDate = parseSortDate(eventDate);
        const status = determineStatus(eventDate);
        const isFeatured = formData.get('isFeatured') === 'true';

        const dataToUpdate = {
            label,
            title,
            isFeatured,
            status,
            eventDate,
            sortDate
        };

        // Conditionally update other fields only if present in formData
        if (formData.has('rating')) dataToUpdate.rating = formData.get('rating');
        if (formData.has('ratingLabel')) dataToUpdate.ratingLabel = formData.get('ratingLabel');
        if (formData.has('ratingIcon')) dataToUpdate.ratingIcon = formData.get('ratingIcon');

        if (formData.has('capacity')) dataToUpdate.capacity = formData.get('capacity');
        if (formData.has('capacityLabel')) dataToUpdate.capacityLabel = formData.get('capacityLabel');
        if (formData.has('capacityIcon')) dataToUpdate.capacityIcon = formData.get('capacityIcon');

        if (formData.has('showStats')) dataToUpdate.showStats = formData.get('showStats') === 'true';

        if (image) {
            if (typeof image === 'object' && image.size > 0) {
                // New image provided as File
                const imagePath = await saveFile(image, 'hero');
                if (imagePath) dataToUpdate.image = imagePath;
            } else if (typeof image === 'string') {
                // New image provided as URL (background upload)
                dataToUpdate.image = image;
            }
        }

        await prisma.heroSlide.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update hero slide:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update slide';
        return { success: false, error: errorMessage };
    }
}


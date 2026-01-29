'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

const prisma = new PrismaClient();

export async function getHeroSlides() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: {
                order: 'asc',
            },
        });
        return { success: true, data: slides };
    } catch (error) {
        console.error('Failed to fetch hero slides:', error);
        return { success: false, error: 'Failed to fetch slides' };
    }
}

// Helper to determine status from date
function determineStatus(dateString) {
    console.log("determineStatus called with:", dateString);
    if (!dateString) return "UPCOMING";
    const eventDate = new Date(dateString);
    const today = new Date();
    // Reset time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    console.log("Event Date:", eventDate.toString());
    console.log("Today:", today.toString());
    console.log("Comparison result:", eventDate < today);
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

        const eventDate = formData.get('eventDate') || null;
        const status = determineStatus(eventDate);

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
                eventDate
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
        const rating = formData.get('rating');
        const ratingLabel = formData.get('ratingLabel');
        const ratingIcon = formData.get('ratingIcon');
        const capacity = formData.get('capacity');
        const capacityLabel = formData.get('capacityLabel');
        const capacityIcon = formData.get('capacityIcon');
        const showStats = formData.get('showStats') === 'true';
        const isFeatured = formData.get('isFeatured') === 'true';
        const eventDate = formData.get('eventDate');
        const status = determineStatus(eventDate);

        const dataToUpdate = {
            label,
            title,
            rating,
            ratingLabel,
            ratingIcon,
            capacity,
            capacityLabel,
            capacityIcon,
            showStats,
            isFeatured,
            status,
            eventDate
        };

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


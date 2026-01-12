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

        if (!image || !label || !title) {
            return { success: false, error: 'Missing required fields' };
        }

        // Handle Image Upload
        const imagePath = await saveFile(image, 'hero');
        if (!imagePath) {
            return { success: false, error: 'Failed to upload image' };
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
                showStats
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to create hero slide:', error);
        return { success: false, error: 'Failed to create slide' };
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

        const dataToUpdate = {
            label,
            title,
            rating,
            ratingLabel,
            ratingIcon,
            capacity,
            capacityLabel,
            capacityIcon,
            showStats
        };

        if (image && image.size > 0) {
            // New image provided
            const imagePath = await saveFile(image, 'hero');
            if (imagePath) {
                dataToUpdate.image = imagePath;
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
        return { success: false, error: 'Failed to update slide' };
    }
}


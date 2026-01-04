'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

export async function getGalleryItems() {
    try {
        const items = await prisma.galleryItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: items };
    } catch (e) {
        return { success: false, error: 'Failed to fetch gallery items' };
    }
}

export async function createGalleryItem(formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const size = formData.get('size');
    const imageFile = formData.get('src');

    try {
        const imagePath = await saveFile(imageFile, 'gallery');

        await prisma.galleryItem.create({
            data: {
                title,
                category,
                size,
                src: imagePath || ''
            }
        });

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (e) {
        console.error("Create Gallery Error:", e);
        return { success: false, error: 'Failed to create gallery item.' };
    }
}

export async function deleteGalleryItem(id) {
    try {
        await prisma.galleryItem.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete gallery item.' };
    }
}

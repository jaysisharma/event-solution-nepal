'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile, deleteFile } from '@/lib/upload';

// Standalone actions for Auto-Upload
export async function uploadGalleryImage(formData) {
    const image = formData.get("image");
    const folder = formData.get("folder") || "gallery";

    if (!image) return { success: false, error: "No image provided" };

    try {
        const imagePath = await saveFile(image, folder);
        if (!imagePath) throw new Error("Upload failed");
        return { success: true, url: imagePath };
    } catch (error) {
        console.error("Auto-upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function deleteGalleryImageAction(url) {
    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

export async function getGalleryItems() {
    try {
        const items = await prisma.galleryItem.findMany({
            orderBy: { date: 'desc' }
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
    const dateStr = formData.get('date');
    const imageSource = formData.get('src');

    try {
        let imagePath = imageSource;

        // If it's a file object (fallback), upload it
        if (imageSource && typeof imageSource === 'object' && imageSource.size > 0) {
            imagePath = await saveFile(imageSource, 'gallery');
        }

        await prisma.galleryItem.create({
            data: {
                title,
                category,
                size,
                src: imagePath || '',
                date: dateStr ? new Date(dateStr) : new Date()
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

export async function updateGalleryItem(formData) {
    const id = formData.get('id');
    const title = formData.get('title');
    const category = formData.get('category');
    const size = formData.get('size');
    const dateStr = formData.get('date');
    const imageSource = formData.get('src');

    if (!id) return { success: false, error: "No ID provided" };

    try {
        let imagePath = imageSource;

        // If it's a file object (fallback), upload it
        if (imageSource && typeof imageSource === 'object' && imageSource.size > 0) {
            imagePath = await saveFile(imageSource, 'gallery');
        }

        await prisma.galleryItem.update({
            where: { id: parseInt(id) },
            data: {
                title,
                category,
                size,
                src: imagePath || '',
                date: dateStr ? new Date(dateStr) : new Date()
            }
        });

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (e) {
        console.error("Update Gallery Error:", e);
        return { success: false, error: 'Failed to update gallery item.' };
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

export async function getGalleryCategories() {
    try {
        const categories = await prisma.galleryItem.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        return { success: true, data: categories.map(c => c.category) };
    } catch (e) {
        return { success: false, error: 'Failed to fetch categories' };
    }
}

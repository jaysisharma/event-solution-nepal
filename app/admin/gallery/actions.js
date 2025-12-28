'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createGalleryItem(prevState, formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const size = formData.get('size');
    const src = formData.get('src');

    try {
        await prisma.galleryItem.create({
            data: {
                title,
                category,
                size,
                src
            }
        });
    } catch (e) {
        return { error: 'Failed to create gallery item.' };
    }

    revalidatePath('/gallery');
    revalidatePath('/admin/gallery');
    redirect('/admin/gallery');
}

export async function deleteGalleryItem(id) {
    try {
        await prisma.galleryItem.delete({
            where: { id: parseInt(id) }
        });
    } catch (e) {
        return { error: 'Failed to delete gallery item.' };
    }

    revalidatePath('/gallery');
    revalidatePath('/admin/gallery');
}

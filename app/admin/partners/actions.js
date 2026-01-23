'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { saveFile } from '@/lib/upload';

export async function addPartner(formData) {
    let name = formData.get('name');
    const imageFile = formData.get('image');

    // If no name, use filename or default
    if (!name && imageFile && imageFile.name) {
        name = imageFile.name.split('.')[0]; // precise enough for auto-name
    }
    if (!name) name = `Partner ${Date.now()}`;

    const imagePath = await saveFile(imageFile, 'partners');

    await prisma.partner.create({
        data: {
            name,
            image: imagePath || ''
        },
    });

    revalidatePath('/admin/partners');
    revalidatePath('/'); // Update homepage
}

export async function deletePartner(id) {
    if (id instanceof FormData) {
        id = id.get('id');
    }

    if (!id) return { success: false, error: "Invalid ID" };

    try {
        await prisma.partner.delete({
            where: { id: parseInt(id) },
        });

        revalidatePath('/admin/partners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Delete Partner Error:", error);
        return { success: false, error: "Failed to delete partner" };
    }
}

export async function updatePartner(formData) {
    const id = formData.get('id');
    const name = formData.get('name');
    if (!id || !name) return;

    await prisma.partner.update({
        where: { id: parseInt(id) },
        data: { name },
    });

    revalidatePath('/admin/partners');
    revalidatePath('/');
}

'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createService(prevState, formData) {
    const title = formData.get('title');
    const description = formData.get('description');
    const image = formData.get('image');
    const tagsVal = formData.get('tags');

    let tags = "[]";
    if (tagsVal) {
        tags = JSON.stringify(tagsVal.split(',').map(s => s.trim()));
    }

    try {
        await prisma.service.create({
            data: {
                title,
                description,
                image,
                tags
            }
        });
    } catch (e) {
        return { error: 'Failed to create service.' };
    }

    revalidatePath('/services');
    revalidatePath('/admin/services');
    redirect('/admin/services');
}

export async function deleteService(id) {
    try {
        await prisma.service.delete({
            where: { id: parseInt(id) }
        });
    } catch (e) {
        return { error: 'Failed to delete service.' };
    }

    revalidatePath('/services');
    revalidatePath('/admin/services');
}

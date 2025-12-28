'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addEvent(formData) {
    const title = formData.get('title');
    const date = formData.get('date');
    const month = formData.get('month');
    const location = formData.get('location');
    const time = formData.get('time');
    const image = formData.get('image');

    if (!title || !date || !month) return; // Basic validation

    await prisma.event.create({
        data: {
            title,
            date,
            month,
            location: location || '',
            time: time || '',
            image: image || '',
        },
    });

    revalidatePath('/admin/events');
    revalidatePath('/');
}

export async function deleteEvent(formData) {
    const id = formData.get('id');
    if (!id) return;

    await prisma.event.delete({
        where: { id: parseInt(id) },
    });

    revalidatePath('/admin/events');
    revalidatePath('/');
}

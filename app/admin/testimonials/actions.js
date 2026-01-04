'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

export async function addTestimonial(formData) {
    const name = formData.get('name');
    const role = formData.get('role');
    const quote = formData.get('quote');
    const imageFile = formData.get('image');
    // Rating is optional, default to 5 in schema, but we can pass it if we add a field later

    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
        imagePath = await saveFile(imageFile, 'testimonials');
    }

    try {
        await prisma.testimonial.create({
            data: {
                name,
                role,
                quote,
                avatar: imagePath,
            },
        });
        revalidatePath('/admin/testimonials');
        revalidatePath('/'); // Revalidate home page where testimonials might be shown
        return { success: true };
    } catch (error) {
        console.error('Error adding testimonial:', error);
        return { success: false, error: 'Failed to add testimonial' };
    }
}

export async function deleteTestimonial(id) {
    try {
        await prisma.testimonial.delete({
            where: { id: parseInt(id) },
        });
        revalidatePath('/admin/testimonials');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return { success: false, error: 'Failed to delete testimonial' };
    }
}

export async function updateTestimonial(formData) {
    const id = formData.get('id');
    const name = formData.get('name');
    const role = formData.get('role');
    const quote = formData.get('quote');
    const imageFile = formData.get('image');

    const data = {
        name,
        role,
        quote,
    };

    if (imageFile && imageFile.size > 0) {
        data.avatar = await saveFile(imageFile, 'testimonials');
    }

    try {
        await prisma.testimonial.update({
            where: { id: parseInt(id) },
            data,
        });
        revalidatePath('/admin/testimonials');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return { success: false, error: 'Failed to update testimonial' };
    }
}

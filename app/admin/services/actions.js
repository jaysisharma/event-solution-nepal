'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

export async function getServices() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { id: 'asc' }
        });
        return { success: true, data: services };
    } catch (e) {
        return { success: false, error: 'Failed to fetch services' };
    }
}

export async function createService(formData) {
    const title = formData.get('title');
    const description = formData.get('description');
    const imageFile = formData.get('image');
    const tagsVal = formData.get('tags');

    try {
        let imagePath = imageFile;
        if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
            imagePath = await saveFile(imageFile, 'services');
        }

        let tags = "[]";
        if (tagsVal) {
            tags = JSON.stringify(tagsVal.split(',').map(s => s.trim()));
        }

        await prisma.service.create({
            data: {
                title,
                description,
                image: imagePath || '',
                tags
            }
        });

        revalidatePath('/services');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (e) {
        console.error("Create Service Error:", e);
        return { success: false, error: 'Failed to create service.' };
    }
}

export async function updateService(id, formData) {
    const title = formData.get('title');
    const description = formData.get('description');
    const tagsVal = formData.get('tags');
    const imageFile = formData.get('image'); // New image file (optional)

    try {
        let updateData = {
            title,
            description,
        };

        // Handle Tags
        if (tagsVal) {
            updateData.tags = JSON.stringify(tagsVal.split(',').map(s => s.trim()));
        }

        // Handle Image Update
        // Handle Image Update
        if (imageFile) {
            if (typeof imageFile === 'object' && imageFile.size > 0) {
                const imagePath = await saveFile(imageFile, 'services');
                if (imagePath) updateData.image = imagePath;
            } else if (typeof imageFile === 'string') {
                updateData.image = imageFile;
            }
        }

        // If no new image is provided, calling update will typically NOT clear the existing one 
        // unless we explicitly set it to null, which we are not doing here.
        // Prisma updates only fields present in 'data'.

        await prisma.service.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        revalidatePath('/services');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (e) {
        console.error("Update Service Error:", e);
        return { success: false, error: 'Failed to update service.' };
    }
}

export async function deleteService(id) {
    try {
        await prisma.service.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/services');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete service.' };
    }
}

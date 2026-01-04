'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

export async function getProjects() {
    try {
        const projects = await prisma.workProject.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: projects };
    } catch (e) {
        return { success: false, error: 'Failed to fetch projects' };
    }
}

export async function createProject(formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const year = formData.get('year');
    const isFeatured = formData.get('isFeatured') === 'true';
    const imageFiles = formData.getAll('images'); // Get all files

    try {
        // Upload all images
        const uploadPromises = imageFiles.map(file => {
            if (file.size > 0) return saveFile(file, 'projects');
            return null;
        });
        const paths = await Promise.all(uploadPromises);

        // Filter out nulls (failed uploads or non-files)
        const validPaths = paths.filter(p => p !== null);
        const images = JSON.stringify(validPaths);

        await prisma.workProject.create({
            data: {
                title,
                category,
                year,
                images,
                isFeatured
            }
        });

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (e) {
        console.error("Create Project Error:", e);
        return { success: false, error: 'Failed to create project.' };
    }
}

export async function updateProject(id, formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const year = formData.get('year');

    const isFeatured = formData.get('isFeatured') === 'true';

    try {
        // Existing images passed as JSON string
        let existingImages = [];
        try {
            const existing = formData.get('existingImages');
            if (existing) existingImages = JSON.parse(existing);
        } catch (e) { console.error("Error parsing existing images", e); }

        // New images to upload
        const newImageFiles = formData.getAll('newImages');
        let newImagePaths = [];

        if (newImageFiles && newImageFiles.length > 0) {
            const uploadPromises = newImageFiles.map(file => {
                if (file.size > 0) return saveFile(file, 'projects');
                return null;
            });
            const paths = await Promise.all(uploadPromises);
            newImagePaths = paths.filter(p => p !== null);
        }

        // Combine
        const finalImages = [...existingImages, ...newImagePaths];

        await prisma.workProject.update({
            where: { id: parseInt(id) },
            data: {
                title,
                category,
                year,
                images: JSON.stringify(finalImages),
                isFeatured
            }
        });

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (e) {
        console.error("Update Project Error:", e);
        return { success: false, error: 'Failed to update project.' };
    }
}

export async function deleteProject(id) {
    try {
        await prisma.workProject.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete project.' };
    }
}

export async function toggleFeaturedProject(id) {
    try {
        const project = await prisma.workProject.findUnique({
            where: { id: parseInt(id) }
        });

        if (!project) return { success: false, error: 'Project not found' };

        await prisma.workProject.update({
            where: { id: parseInt(id) },
            data: { isFeatured: !project.isFeatured }
        });

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        revalidatePath('/'); // Update homepage
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to toggle featured status.' };
    }
}

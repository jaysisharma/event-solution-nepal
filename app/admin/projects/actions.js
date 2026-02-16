'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile, deleteFile } from '@/lib/upload';

// Standalone actions for Auto-Upload
export async function uploadProjectImage(formData) {
    const image = formData.get("image");
    const folder = formData.get("folder") || "projects";

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

export async function deleteProjectImageAction(url) {
    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

export async function getProjects() {
    try {
        const projects = await prisma.workProject.findMany({
            orderBy: { order: 'asc' }
        });
        return { success: true, data: projects };
    } catch (e) {
        return { success: false, error: 'Failed to fetch projects' };
    }
}

export async function reorderProjects(orderedIds) {
    if (!orderedIds || !Array.isArray(orderedIds)) return { success: false, message: "Invalid data" };

    try {
        await prisma.$transaction(
            orderedIds.map((id, index) =>
                prisma.workProject.update({
                    where: { id: parseInt(id) },
                    data: { order: index },
                })
            )
        );

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, message: "Order updated successfully" };
    } catch (error) {
        console.error("Error reordering projects:", error);
        return { success: false, message: "Failed to update order" };
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
            // Handle background uploaded URLs (string)
            if (typeof file === 'string') return Promise.resolve(file);

            if (file && typeof file === 'object' && file.size > 0) return saveFile(file, 'projects');
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
                if (typeof file === 'string') return Promise.resolve(file);
                if (file && typeof file === 'object' && file.size > 0) return saveFile(file, 'projects');
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
        const project = await prisma.workProject.findUnique({
            where: { id: parseInt(id) }
        });

        if (project && project.images) {
            try {
                const images = JSON.parse(project.images);
                if (Array.isArray(images)) {
                    for (const img of images) {
                        await deleteFile(img);
                    }
                }
            } catch (e) { }
        }

        await prisma.workProject.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (e) {
        console.error("Delete Project Error:", e);
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

export async function getProjectCategories() {
    try {
        const categories = await prisma.workProject.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        return { success: true, data: categories.map(c => c.category) };
    } catch (e) {
        return { success: false, error: 'Failed to fetch categories' };
    }
}

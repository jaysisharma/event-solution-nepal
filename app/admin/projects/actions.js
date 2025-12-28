'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(prevState, formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const year = formData.get('year');
    const imagesVal = formData.get('images'); // text area input with comma separated urls or JSON

    // Simple parsing for now - generic string splitting if not JSON
    let images = [];
    try {
        images = JSON.stringify(imagesVal.split(',').map(s => s.trim()));
    } catch (e) {
        images = "[]";
    }

    try {
        await prisma.workProject.create({
            data: {
                title,
                category,
                year,
                images
            }
        });
    } catch (e) {
        return { error: 'Failed to create project.' };
    }

    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    redirect('/admin/projects');
}

export async function updateProject(id, prevState, formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const year = formData.get('year');
    const imagesVal = formData.get('images');

    let images = [];
    try {
        // assuming input is comma separated
        images = JSON.stringify(imagesVal.split(',').map(s => s.trim()));
    } catch (e) {
        images = "[]";
    }

    try {
        await prisma.workProject.update({
            where: { id: parseInt(id) },
            data: {
                title,
                category,
                year,
                images
            }
        });
    } catch (e) {
        return { error: 'Failed to update project.' };
    }

    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    redirect('/admin/projects');
}

export async function deleteProject(id) {
    try {
        await prisma.workProject.delete({
            where: { id: parseInt(id) }
        });
    } catch (e) {
        return { error: 'Failed to delete project.' };
    }

    revalidatePath('/projects');
    revalidatePath('/admin/projects');
}

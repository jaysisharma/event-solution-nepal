'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { saveFile, deleteFile } from '@/lib/upload';

export async function getAboutData() {
    try {
        let about = await prisma.aboutPage.findFirst();
        if (!about) {
            about = await prisma.aboutPage.create({
                data: {
                    title: "Our Story",
                    subtitle: "Founded in 2014, Event Solution Nepal has been creating meaningful and memorable events.",
                    description: "We bring your vision to life with care, creativity, and professionalism.",
                    image: "/images/about-hero.jpg",
                }
            });
        }
        return { success: true, data: about };
    } catch (error) {
        console.error("Error fetching about data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}

export async function updateAboutData(formData) {
    try {
        const title = formData.get('title');
        const subtitle = formData.get('subtitle');
        const description = formData.get('description');

        // Check if there's an existing record
        const existing = await prisma.aboutPage.findFirst();
        const id = existing ? existing.id : undefined;

        await prisma.aboutPage.upsert({
            where: { id: id || 0 }, // 0 or any dummy ID if creating for the first time, but findFirst handles the real ID 
            update: { title, subtitle, description },
            create: { title, subtitle, description }
        });

        revalidatePath('/about');
        revalidatePath('/admin/about');
        return { success: true };
    } catch (error) {
        console.error("Error updating about data:", error);
        return { success: false, error: "Failed to update data" };
    }
}

export async function uploadAboutImage(formData) {
    try {
        const file = formData.get('image');
        if (!file) return { success: false, error: "No file provided" };

        const existing = await prisma.aboutPage.findFirst();

        // Delete old image if it's a local upload
        if (existing?.image && existing.image.startsWith('/uploads/')) {
            await deleteFile(existing.image);
        }

        const fileName = await saveFile(file, 'about');

        // Update DB
        if (existing) {
            await prisma.aboutPage.update({
                where: { id: existing.id },
                data: { image: fileName }
            });
        } else {
            await prisma.aboutPage.create({
                data: {
                    image: fileName
                }
            });
        }

        revalidatePath('/about');
        revalidatePath('/admin/about');
        return { success: true, url: fileName };

    } catch (error) {
        console.error("Error upload about image:", error);
        return { success: false, error: "Upload failed" };
    }
}

'use server';

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function getTimelineMemories() {
    try {
        const memories = await prisma.timelineMemory.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return { success: true, data: memories };
    } catch (error) {
        console.error("Failed to fetch timeline memories:", error);
        return { success: false, error: "Failed to fetch memories" };
    }
}

export async function createTimelineMemory(formData) {
    const image = formData.get("image");
    const alt = formData.get("alt");
    const year = formData.get("year");

    if (!image || !alt || !year) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Handle Image Upload
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'timeline');
        await mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const imagePath = `/uploads/timeline/${filename}`;

        const newMemory = await prisma.timelineMemory.create({
            data: {
                image: imagePath,
                alt,
                year,
                size: formData.get('size') || "normal",
            },
        });
        revalidatePath("/");
        revalidatePath("/admin/timeline");
        return { success: true, data: newMemory };
    } catch (error) {
        console.error("Failed to create timeline memory:", error);
        return { success: false, error: "Failed to create memory" };
    }
}

export async function updateTimelineMemory(id, formData) {
    const alt = formData.get("alt");
    const year = formData.get("year");
    const size = formData.get("size") || "normal";
    const image = formData.get("image");

    try {
        let imageData = {};

        // Only process image if a new one is uploaded
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Ensure directory exists
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'timeline');
            await mkdir(uploadDir, { recursive: true });

            const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            imageData.image = `/uploads/timeline/${filename}`;
        }

        const updatedMemory = await prisma.timelineMemory.update({
            where: { id: parseInt(id) },
            data: {
                alt,
                year,
                size,
                ...imageData
            },
        });

        revalidatePath("/");
        revalidatePath("/admin/timeline");
        return { success: true, data: updatedMemory };
    } catch (error) {
        console.error("Failed to update timeline memory:", error);
        return { success: false, error: "Failed to update memory" };
    }
}

export async function deleteTimelineMemory(id) {
    try {
        await prisma.timelineMemory.delete({
            where: { id: parseInt(id) },
        });
        revalidatePath("/");
        revalidatePath("/admin/timeline");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete timeline memory:", error);
        return { success: false, error: "Failed to delete memory" };
    }
}

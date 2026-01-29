'use server';

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { saveFile, deleteFile } from "@/lib/upload";

const prisma = new PrismaClient();

// Standalone actions for Auto-Upload
export async function uploadTimelineImage(formData) {
    const image = formData.get("image");
    if (!image) return { success: false, error: "No image provided" };

    try {
        const imagePath = await saveFile(image, "timeline");
        if (!imagePath) throw new Error("Upload failed");
        return { success: true, url: imagePath };
    } catch (error) {
        console.error("Auto-upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function deleteTimelineImageAction(url) {
    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

export async function getTimelineMemories() {
    try {
        const memories = await prisma.timelineMemory.findMany({
            orderBy: {
                year: 'desc', // Order by Year logically, or createdAt if preferred
            },
        });
        // Secondary sort by createdAt if years are same? 
        // Or just let Prisma handle it. For now keeping simple.
        // Actually user might want manual order, but let's stick to year desc for timeline nature.
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
    const size = formData.get("size") || "normal";

    if (!image || !alt || !year) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        let imagePath = '';
        if (typeof image === 'string') {
            imagePath = image;
        } else if (image && typeof image === 'object' && image.size > 0) {
            imagePath = await saveFile(image, "timeline");
        }

        if (!imagePath) throw new Error("Image upload failed");

        const newMemory = await prisma.timelineMemory.create({
            data: {
                image: imagePath,
                alt,
                year,
                size,
            },
        });
        revalidatePath("/");
        revalidatePath("/admin/timeline");
        revalidatePath("/about");
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
        const dataToUpdate = {
            alt,
            year,
            size,
        };

        if (image) {
            if (typeof image === 'object' && image.size > 0) {
                const imagePath = await saveFile(image, "timeline");
                if (imagePath) dataToUpdate.image = imagePath;
            } else if (typeof image === 'string') {
                dataToUpdate.image = image;
            }
        }

        const updatedMemory = await prisma.timelineMemory.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });

        revalidatePath("/");
        revalidatePath("/admin/timeline");
        revalidatePath("/about");
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

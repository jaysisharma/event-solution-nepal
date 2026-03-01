'use server';

import { saveFile, deleteFile } from '@/lib/upload';
import { getSession } from '@/lib/auth';

export async function uploadImageAction(formData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const image = formData.get("image");
    const folder = formData.get("folder") || "general";

    if (!image) return { success: false, error: "No image provided" };

    try {
        const imagePath = await saveFile(image, folder);
        if (!imagePath) throw new Error("Upload failed");
        return { success: true, url: imagePath };
    } catch (error) {
        console.error(`Auto-upload to ${folder} failed:`, error);
        return { success: false, error: "Upload failed" };
    }
}

export async function deleteImageAction(url) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

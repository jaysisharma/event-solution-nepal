'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveFile, deleteFile } from '@/lib/upload';

// Standalone actions for Auto-Upload
export async function uploadTeamImage(formData) {
    const image = formData.get("image");
    const folder = formData.get("folder") || "team";

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

export async function deleteTeamImageAction(url) {
    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

export async function getTeamMembers() {
    try {
        const team = await prisma.teamMember.findMany({
            orderBy: { id: 'asc' }
        });
        return { success: true, data: team };
    } catch (e) {
        return { success: false, error: 'Failed to fetch team members' };
    }
}

export async function createTeamMember(formData) {
    const name = formData.get('name');
    const role = formData.get('role');
    const imageSource = formData.get('image');

    try {
        let imagePath = imageSource;
        if (imageSource && typeof imageSource === 'object' && imageSource.size > 0) {
            imagePath = await saveFile(imageSource, 'team');
        }

        await prisma.teamMember.create({
            data: {
                name,
                role,
                image: imagePath || ''
            }
        });

        revalidatePath('/about');
        revalidatePath('/admin/team');
        return { success: true };
    } catch (e) {
        console.error("Create Team Error:", e);
        return { success: false, error: 'Failed to create team member.' };
    }
}

export async function updateTeamMember(id, formData) {
    const name = formData.get('name');
    const role = formData.get('role');
    const imageFile = formData.get('image');

    try {
        const data = { name, role };

        // Only update image if a new one is provided
        if (imageFile && imageFile.size > 0 && typeof imageFile !== 'string') {
            const imagePath = await saveFile(imageFile, 'team');
            if (imagePath) {
                data.image = imagePath;
            }
        }

        await prisma.teamMember.update({
            where: { id: parseInt(id) },
            data
        });

        revalidatePath('/about');
        revalidatePath('/admin/team');
        return { success: true };
    } catch (e) {
        console.error("Update Team Error:", e);
        return { success: false, error: 'Failed to update team member.' };
    }
}

export async function deleteTeamMember(id) {
    try {
        await prisma.teamMember.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/about');
        revalidatePath('/admin/team');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete team member.' };
    }
}

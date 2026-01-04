'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { saveFile } from '@/lib/upload';

// Helper to resolve entity fields
function resolveEntityFields(formData) {
    const manageType = formData.get('manageType');
    let organizer = formData.get('organizer');
    let managedBy = formData.get('managedBy');
    const combinedName = formData.get('combinedName');

    if (manageType === 'SAME') {
        organizer = combinedName;
        managedBy = combinedName;
    } else if (manageType === 'ORGANIZER_ONLY') {
        managedBy = '';
    } else if (manageType === 'MANAGER_ONLY') {
        organizer = '';
    }

    return { organizer, managedBy };
}

import { isEventCompleted } from '@/lib/eventUtils';

export async function addEvent(formData) {
    const title = formData.get('title');
    const date = formData.get('date');
    const month = formData.get('month');
    const year = formData.get('year') || new Date().getFullYear().toString();
    const location = formData.get('location');
    const time = formData.get('time');
    const imageFile = formData.get('image');
    // const status = formData.get('status') || 'UPCOMING'; // Removed manual status

    // Resolve logic
    const { organizer, managedBy } = resolveEntityFields(formData);

    const description = formData.get('description'); // Catch description here too if needed for validation on server side, though client side handles it.

    if (!title || !date || !month) return { success: false, message: "Missing required fields" };

    try {
        const imagePath = await saveFile(imageFile, 'events');

        await prisma.event.create({
            data: {
                title,
                date,
                month,
                year,
                location: location || '',
                time: time || '',
                image: imagePath || '',
                status: isEventCompleted(month, date, year) ? 'COMPLETED' : 'UPCOMING',
                organizer,
                managedBy,
                description: description || '',
                isFeatured: formData.get('isFeatured') === 'on',
            },
        });

        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true, message: "Event created successfully" };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, message: "Failed to create event" };
    }
}

export async function deleteEvent(formData) {
    const id = formData.get('id');
    if (!id) return { success: false, message: "No ID provided" };

    try {
        await prisma.event.delete({
            where: { id: parseInt(id) },
        });

        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true, message: "Event deleted successfully" };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, message: "Failed to delete event" };
    }
}

export async function updateEvent(formData) {
    const id = formData.get('id');
    const title = formData.get('title');
    const date = formData.get('date');
    const month = formData.get('month');
    const year = formData.get('year') || new Date().getFullYear().toString();
    const location = formData.get('location');
    const time = formData.get('time');
    // const status = formData.get('status'); // Auto-calculated
    const description = formData.get('description');
    const imageFile = formData.get('image');

    // Resolve logic
    const { organizer, managedBy } = resolveEntityFields(formData);

    if (!id || !title) return { success: false, message: "Missing required fields" };

    try {
        const data = {
            title,
            date,
            month,
            year,
            location: location || '',
            time: time || '',
            status: isEventCompleted(month, date, year) ? 'COMPLETED' : 'UPCOMING',
            organizer,
            managedBy,
            description: description || '',
            isFeatured: formData.get('isFeatured') === 'on',
        };

        const imagePath = await saveFile(imageFile, 'events');
        if (imagePath) {
            data.image = imagePath;
        }

        await prisma.event.update({
            where: { id: parseInt(id) },
            data,
        });

        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true, message: "Event updated successfully" };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, message: "Failed to update event" };
    }
}

export async function toggleFeatured(id, currentStatus) {
    try {
        await prisma.event.update({
            where: { id: parseInt(id) },
            data: { isFeatured: !currentStatus },
        });
        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true, message: "Featured status updated" };
    } catch (error) {
        console.error("Error toggling featured:", error);
        return { success: false, message: "Failed to update featured status" };
    }
}

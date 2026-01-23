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
    const ticketTemplateFile = formData.get('ticketTemplate');
    const ticketConfig = formData.get('ticketConfig');
    const ticketPrice = formData.get('ticketPrice') || "0";
    const ticketTypes = formData.get('ticketTypes');
    const formConfig = formData.get('formConfig');
    // const status = formData.get('status') || 'UPCOMING'; // Removed manual status

    // Resolve logic
    const { organizer, managedBy } = resolveEntityFields(formData);

    const description = formData.get('description');

    if (!title || !date || !month || !year || !location || !time) {
        return { success: false, message: "Missing required fields (Title, Date, Month, Year, Location, Time)" };
    }

    // Validation
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2000 || year > currentYear + 10) {
        return { success: false, message: "Invalid year. Please enter a valid 4-digit year." };
    }

    if (isNaN(date) || date < 1 || date > 31) {
        return { success: false, message: "Invalid date. Please enter a day between 1 and 31." };
    }

    // Check if month is valid (simple check)
    const validMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    if (!validMonths.includes(month.toUpperCase())) {
        return { success: false, message: "Invalid month. Please use standard full name or 3-letter abbreviation." };
    }

    try {
        const imagePath = await saveFile(imageFile, 'events');
        const ticketTemplatePath = await saveFile(ticketTemplateFile, 'tickets');

        await prisma.event.create({
            data: {
                title,
                date,
                month,
                year,
                location: location || '',
                time: time || '',
                image: imagePath || '',
                ticketTemplate: ticketTemplatePath || '',
                ticketConfig: ticketConfig || null,
                ticketPrice: ticketPrice,
                ticketTypes: ticketTypes || null,
                formConfig: formConfig || null,
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
        // Check for common specific errors if any specific ones are known, otherwise return message
        // Prisma errors usually have codes, but we can return the error message directly for now if it's safe, 
        // or map common ones.
        return { success: false, message: error.message || "Failed to create event" };
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
    const ticketTemplateFile = formData.get('ticketTemplate');
    const ticketConfig = formData.get('ticketConfig');
    const ticketPrice = formData.get('ticketPrice');
    const ticketTypes = formData.get('ticketTypes');

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
            ticketPrice: ticketPrice || "0",
            ticketTypes: ticketTypes || null,
            formConfig: formData.get('formConfig') || null,
        };

        const imagePath = await saveFile(imageFile, 'events');
        if (imagePath) {
            data.image = imagePath;
        }

        const ticketTemplatePath = await saveFile(ticketTemplateFile, 'tickets');
        if (ticketTemplatePath) {
            data.ticketTemplate = ticketTemplatePath;
        }

        if (ticketConfig) {
            data.ticketConfig = ticketConfig;
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
    }
}

export async function getEvents() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

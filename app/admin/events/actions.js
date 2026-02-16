'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { saveFile, deleteFile } from '@/lib/upload';

// Standalone actions for Auto-Upload
export async function uploadEventImage(formData) {
    const image = formData.get("image");
    const folder = formData.get("folder") || "events"; // Support subfolders like 'events/tickets'

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

export async function deleteEventImageAction(url) {
    if (!url) return { success: false };
    try {
        await deleteFile(url);
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}

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

function parseEventDate(monthStr, dateStr, yearStr) {
    const monthMap = {
        "JAN": 0, "FEB": 1, "MAR": 2, "APR": 3, "MAY": 4, "JUN": 5,
        "JUL": 6, "AUG": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11,
        "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, "MAY": 4, "JUNE": 5,
        "JULY": 6, "AUGUST": 7, "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11
    };
    if (!monthStr || !dateStr) return null;
    const mStr = monthStr.split('-').pop().toUpperCase().trim().substring(0, 3);
    const dStr = dateStr.includes('-') ? dateStr.split('-').pop().trim() : dateStr;
    const d = parseInt(dStr);
    const y = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    if (monthMap[mStr] === undefined || isNaN(d)) return null;
    return new Date(y, monthMap[mStr], d);
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
        let imagePath = '';
        if (typeof imageFile === 'string') {
            imagePath = imageFile;
        } else if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
            imagePath = await saveFile(imageFile, 'events');
        }

        let ticketTemplatePath = '';
        if (typeof ticketTemplateFile === 'string') {
            ticketTemplatePath = ticketTemplateFile;
        } else if (ticketTemplateFile && typeof ticketTemplateFile === 'object' && ticketTemplateFile.size > 0) {
            ticketTemplatePath = await saveFile(ticketTemplateFile, 'tickets');
        }

        await prisma.event.create({
            data: {
                title,
                date,
                month,
                year,
                location: location || '',
                time: time || '',
                image: imagePath,
                ticketTemplate: ticketTemplatePath,
                ticketConfig: ticketConfig || null,
                ticketPrice: ticketPrice,
                ticketTypes: ticketTypes || null,
                formConfig: formConfig || null,
                status: isEventCompleted(month, date, year) ? 'COMPLETED' : 'UPCOMING',
                organizer,
                managedBy,
                eventDate: parseEventDate(month, date, year),
                description: description || '',
                isFeatured: formData.get('isFeatured') === 'on',
            },
        });

        // Log success
        console.log("Event created successfully");

        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true, message: "Event created successfully" };
    } catch (error) {
        console.error("Error creating event:", error);
        // Serialize the error message safely
        const errorMessage = error instanceof Error ? error.message : "Failed to create event";
        return { success: false, message: errorMessage };
    }
}

export async function deleteEvent(formData) {
    const id = formData.get('id');
    if (!id) return { success: false, message: "No ID provided" };

    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
        });

        if (event) {
            if (event.image) await deleteFile(event.image);
            if (event.ticketTemplate) await deleteFile(event.ticketTemplate);
        }

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
        const existingEvent = await prisma.event.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingEvent) {
            return { success: false, message: "Event not found" };
        }
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
            eventDate: parseEventDate(month, date, year),
            description: description || '',
            isFeatured: formData.get('isFeatured') === 'on',
            ticketPrice: ticketPrice || "0",
            ticketTypes: ticketTypes || null,
            formConfig: formData.get('formConfig') || null,
        };

        if (imageFile) {
            if (typeof imageFile === 'object' && imageFile.size > 0) {
                const imagePath = await saveFile(imageFile, 'events');
                if (imagePath) {
                    data.image = imagePath;
                    if (existingEvent.image) await deleteFile(existingEvent.image);
                }
            } else if (typeof imageFile === 'string') {
                data.image = imageFile;
            }
        }

        if (ticketTemplateFile) {
            if (typeof ticketTemplateFile === 'object' && ticketTemplateFile.size > 0) {
                const ticketTemplatePath = await saveFile(ticketTemplateFile, 'tickets');
                if (ticketTemplatePath) {
                    data.ticketTemplate = ticketTemplatePath;
                    if (existingEvent.ticketTemplate) await deleteFile(existingEvent.ticketTemplate);
                }
            } else if (typeof ticketTemplateFile === 'string') {
                data.ticketTemplate = ticketTemplateFile;
            }
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
            orderBy: { eventDate: 'desc' },
        });
        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Submit a new ticket request
export async function submitTicketRequest(formData) {
    try {
        console.log("Server Action: Received form data:", formData);
        const { name, number, email, address, title, organization, website, eventName } = formData;

        if (!name || !number || !email || !eventName) {
            console.error("Server Action: Missing fields", { name, number, email, eventName });
            return { success: false, error: "Missing required fields" };
        }

        const result = await prisma.ticketRequest.create({
            data: {
                name,
                number,
                email,
                address: address || null,
                title: title || null,
                organization: organization || null,
                website: website || null,
                eventName,
                status: "PENDING"
            }
        });
        console.log("Server Action: Created ticket request:", result);

        // Revalidate admin path so new requests appear immediately
        revalidatePath('/admin/requests');
        return { success: true };
    } catch (error) {
        console.error("Error submitting ticket request:", error);
        return { success: false, error: "Failed to submit request" };
    }
}

// Get all ticket requests (for admin)
export async function getTicketRequests() {
    try {
        const requests = await prisma.ticketRequest.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return { success: true, data: requests };
    } catch (error) {
        console.error("Error fetching ticket requests:", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

// Update request status (e.g. mark as Contacted)
export async function updateTicketRequestStatus(id, newStatus) {
    try {
        const updatedRequest = await prisma.ticketRequest.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });

        // Trigger Email if Resolved
        if (newStatus === 'RESOLVED') {
            console.log(`Request ${id} resolved. Attempting to send ticket...`);

            // 1. Find the Event to get the template
            const event = await prisma.event.findFirst({
                where: { title: updatedRequest.eventName }
            });

            if (event && event.ticketTemplate) {
                try {
                    const { generateTicketImage } = await import('@/lib/ticketGenerator');
                    const { sendTicketEmail } = await import('@/lib/email');

                    const ticketBuffer = await generateTicketImage(event.ticketTemplate, updatedRequest, event);

                    const emailResult = await sendTicketEmail(updatedRequest.email, ticketBuffer, event, updatedRequest);

                    if (emailResult.success) {
                        console.log(`Ticket sent to ${updatedRequest.email}`);
                    } else {
                        console.error(`Failed to send ticket email: ${emailResult.error}`);
                    }
                } catch (innerError) {
                    console.error("Error during ticket generation/sending:", innerError);
                }
            } else {
                console.warn(`No event or ticket template found for event: ${updatedRequest.eventName}`);
            }
        }

        revalidatePath('/admin/requests');
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket request status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// Delete a request
export async function deleteTicketRequest(id) {
    try {
        await prisma.ticketRequest.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/admin/requests');
        return { success: true };
    } catch (error) {
        console.error("Error deleting ticket request:", error);
        return { success: false, error: "Failed to delete request" };
    }
}

"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Submit a new ticket request
export async function submitTicketRequest(formData) {
    try {
        console.log("Server Action: Received form data:", formData);
        const { name, number, email, address, title, organization, website, eventName, eventId, totalPrice, ticketDetails, paymentMethod } = formData;

        if (!name || !number || !email || !eventName) {
            console.error("Server Action: Missing fields", { name, number, email, eventName });
            return { success: false, error: "Missing required fields" };
        }

        // Get Event Logic
        let event;
        if (eventId) {
            event = await prisma.event.findUnique({
                where: { id: parseInt(eventId) }
            });
        } else {
            // Fallback to title match
            event = await prisma.event.findFirst({
                where: { title: eventName },
                orderBy: { createdAt: 'desc' }
            });
        }

        let ticketCost = 0;
        if (totalPrice !== undefined && totalPrice !== null) {
            // Trust client-side calculation for multiple types (security: could validate against stored types)
            ticketCost = parseInt(totalPrice);
        } else {
            // Legacy/Single Price Fallback
            const price = event?.ticketPrice ? parseInt(event.ticketPrice) : 0;
            ticketCost = isNaN(price) ? 0 : price;
        }

        console.log(`Server Action: Final Ticket Cost for ${eventName}: ${ticketCost}`);

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
                status: "PENDING",
                amount: ticketCost * 100, // Store in Paisa
                // If cost is 0, it's PAID (free). If Fonepay, we mark UNPAID initially until manual verify.
                paymentStatus: ticketCost > 0 ? "UNPAID" : "PAID",
                ticketDetails: ticketDetails ? JSON.stringify(ticketDetails) : null
            }
        });
        console.log("Server Action: Created ticket request:", result);

        let paymentUrl = null;
        if (ticketCost > 0) {
            if (paymentMethod === 'khalti' || !paymentMethod) {
                // Initialize Khalti Logic
                try {
                    const { initializeKhaltiPayment } = await import('@/lib/khalti');
                    const paymentInit = await initializeKhaltiPayment({
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://eventsolutionnepal.com.np')}/api/payment/callback`,
                        website_url: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://eventsolutionnepal.com.np'),
                        amount: ticketCost * 100, // Rs to Paisa
                        purchase_order_id: result.id,
                        purchase_order_name: `Ticket for ${eventName}`,
                        customer_info: {
                            name,
                            email,
                            phone: number
                        }
                    });
                    console.log("Khalti Init Response:", paymentInit);
                    paymentUrl = paymentInit.payment_url;

                    if (!paymentUrl) {
                        console.warn("Khalti response missing payment_url");
                        return { success: false, error: "Failed to initiate payment." };
                    }
                } catch (err) {
                    console.error("Failed to init payment:", err);
                    return { success: false, error: "Failed to initiate payment. Please try again." };
                }
            } else if (paymentMethod === 'fonepay') {
                try {
                    const { generateFonepayUrl } = await import('@/lib/fonepay');
                    // Ensure amount is in standard decimal format for Fonepay (e.g., 100.00 or 100)
                    // Our ticketCost is integer Rupee (e.g. 200). 
                    paymentUrl = generateFonepayUrl({
                        amount: ticketCost,
                        purchase_order_id: result.id,
                        purchase_order_name: `Ticket-${eventName}`,
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://eventsolutionnepal.com.np')}/api/payment/fonepay-callback`
                    });
                    console.log("Fonepay URL generated:", paymentUrl);
                } catch (e) {
                    console.error("Fonepay Gen Error:", e);
                    return { success: false, error: "Failed to generate Fonepay URL" };
                }
            }
        }

        revalidatePath('/admin/requests');
        return { success: true, paymentUrl };

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

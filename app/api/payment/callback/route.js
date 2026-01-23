
import { NextResponse } from 'next/server';
import { verifyKhaltiPayment } from '@/lib/khalti';
import { PrismaClient } from '@prisma/client';
import { generateTicketImage } from '@/lib/ticketGenerator';
import { sendTicketEmail } from '@/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const pidx = searchParams.get('pidx');
    const status = searchParams.get('status');
    const transaction_id = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const purchase_order_id = searchParams.get('purchase_order_id');

    console.log("Khalti Callback:", { pidx, status, purchase_order_id });

    if (!pidx || !purchase_order_id) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        // Verify with Khalti
        const verification = await verifyKhaltiPayment(pidx);
        console.log("Khalti Verification:", verification);

        if (verification.status === 'Completed') {
            // 1. Update Request to PAID
            const updatedRequest = await prisma.ticketRequest.update({
                where: { id: parseInt(purchase_order_id) },
                data: {
                    paymentStatus: 'PAID',
                    status: 'RESOLVED', // Automatically mark resolved
                    pidx: pidx,
                    transactionId: transaction_id || verification.transaction_id,
                    amount: parseInt(amount || verification.total_amount)
                }
            });

            // 2. Fetch Event Details for Ticket Generation
            const event = await prisma.event.findFirst({
                where: { title: updatedRequest.eventName }
            });

            if (event && event.ticketTemplate) {
                try {
                    // 3. Generate Ticket Image
                    console.log("Generating ticket for:", updatedRequest.name);
                    const ticketBuffer = await generateTicketImage(event.ticketTemplate, updatedRequest, event);

                    // 4. Send Email
                    console.log("Sending email to:", updatedRequest.email);
                    const emailResult = await sendTicketEmail(updatedRequest.email, ticketBuffer, event, updatedRequest);

                    if (emailResult.success) {
                        console.log(`Ticket email sent successfully to ${updatedRequest.email}`);
                    } else {
                        console.error("Failed to send ticket email:", emailResult.error);
                    }
                } catch (ticketError) {
                    console.error("Error generating/sending ticket:", ticketError);
                    // Don't fail the request, just log it. Admin can resend later.
                }
            } else {
                console.warn("No event or ticket template found, skipping email.");
            }

            // Redirect to success page
            return NextResponse.redirect(new URL(`/payment/success?id=${purchase_order_id}`, request.url));
        } else {
            // Payment Failed/Cancelled
            await prisma.ticketRequest.update({
                where: { id: parseInt(purchase_order_id) },
                data: {
                    paymentStatus: 'FAILED',
                    pidx: pidx
                }
            });
            return NextResponse.redirect(new URL(`/payment/failed?id=${purchase_order_id}`, request.url));
        }
    } catch (error) {
        console.error("Payment Callback Error:", error);
        return NextResponse.redirect(new URL(`/payment/failed?error=verification_failed`, request.url));
    }
}

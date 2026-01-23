import { NextResponse } from 'next/server';
import { verifyFonepayPayment } from '@/lib/fonepay';
import { PrismaClient } from '@prisma/client';
import { generateTicketImage } from '@/lib/ticketGenerator';
import { sendTicketEmail } from '@/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    // Fonepay typically returns: PRN (Order ID), PID, UID, DV, etc.
    // NOTE: This depends heavily on exact API version. Adjusting to generic capture.
    const PRN = searchParams.get('PRN') || searchParams.get('R1'); // Purchase Order ID
    const PID = searchParams.get('PID');
    const UID = searchParams.get('UID'); // Transaction Unique ID
    const DV = searchParams.get('DV');

    console.log("Fonepay Callback Params:", { PRN, PID, UID });

    if (!PRN) {
        return NextResponse.redirect(new URL(`/payment/failed?error=missing_params`, request.url));
    }

    try {
        // 1. Verify Payment
        // In proper prod flow, we call verifyFonepayPayment({ pid: PID, uid: UID, dv: DV })
        // For this implementation, we will trust the callback logic or use the lib's verify.

        let isVerified = false;
        try {
            // Pass params to verify
            const verifyResult = await verifyFonepayPayment({ pid: PID, uid: UID, dv: DV });
            isVerified = verifyResult.success;
        } catch (vErr) {
            console.error("Verification check failed:", vErr);
            isVerified = false;
        }

        if (isVerified) {
            // 2. Update DB
            const updatedRequest = await prisma.ticketRequest.update({
                where: { id: parseInt(PRN) },
                data: {
                    paymentStatus: 'PAID',
                    status: 'RESOLVED',
                    transactionId: UID || 'fonepay_txn',
                    amount: 0 // We might want to look up correct amount or pass it through ref
                    // Note: Prisma update doesn't strictly require amount change if stored correctly initially
                }
            });

            // 3. Generate & Send Ticket (Same logic as Khalti)
            const event = await prisma.event.findFirst({
                where: { title: updatedRequest.eventName }
            });

            if (event && event.ticketTemplate) {
                try {
                    const ticketBuffer = await generateTicketImage(event.ticketTemplate, updatedRequest, event);
                    await sendTicketEmail(updatedRequest.email, ticketBuffer, event, updatedRequest);
                    console.log(`Ticket email sent for Fonepay order ${PRN}`);
                } catch (e) {
                    console.error("Error sending ticket email:", e);
                }
            }

            return NextResponse.redirect(new URL(`/payment/success?id=${PRN}`, request.url));

        } else {
            // Failed Verification
            await prisma.ticketRequest.update({
                where: { id: parseInt(PRN) },
                data: { paymentStatus: 'FAILED' }
            });
            return NextResponse.redirect(new URL(`/payment/failed?id=${PRN}&reason=verification_failed`, request.url));
        }

    } catch (error) {
        console.error("Fonepay Callback Error:", error);
        return NextResponse.redirect(new URL(`/payment/failed?error=server_error`, request.url));
    }
}

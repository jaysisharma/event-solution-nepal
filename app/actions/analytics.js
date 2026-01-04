"use server";

import prisma from '@/lib/db';
import { headers } from 'next/headers';

export async function recordVisit(path) {
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || 'unknown';

        // Simple IP handling (in production usually passed via x-forwarded-for)
        // For privacy, we usually hash this, but for simple internal stats raw/partial is fine or we skip it.
        // We'll store it simply for unique visitor counting if needed later.

        await prisma.pageView.create({
            data: {
                path,
                userAgent: userAgent.substring(0, 200), // Limit length
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to record visit:", error);
        return { success: false };
    }
}

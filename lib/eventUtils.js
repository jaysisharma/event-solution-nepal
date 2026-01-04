import prisma from '@/lib/db';

import { isEventCompleted } from './dateUtils';
export { isEventCompleted };

export async function updateEventStatuses() {
    try {
        // Fetch all UPCOMING events
        const upcomingEvents = await prisma.event.findMany({
            where: { status: 'UPCOMING' }
        });

        const updates = [];

        for (const event of upcomingEvents) {
            if (isEventCompleted(event.month, event.date, event.year)) {
                updates.push(prisma.event.update({
                    where: { id: event.id },
                    data: { status: 'COMPLETED' }
                }));
            }
        }

        if (updates.length > 0) {
            await prisma.$transaction(updates);
            console.log(`Auto-updated ${updates.length} events to COMPLETED.`);
        }
    } catch (error) {
        console.error("Error auto-updating event statuses:", error);
    }
}

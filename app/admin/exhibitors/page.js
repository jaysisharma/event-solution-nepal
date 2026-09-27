import React from 'react';
import prisma from '@/lib/db';
import { seedDefaultExhibitorsIfEmpty } from '@/lib/exhibitorService';
import ExhibitorsDashboard from './ExhibitorsDashboard';

export const metadata = {
    title: 'Exhibitions & Exhibitors | Admin Panel',
};

export const dynamic = 'force-dynamic';

export default async function AdminExhibitorsPage() {
    // Ensure default data is seeded if database was empty
    await seedDefaultExhibitorsIfEmpty();

    let events = [];
    try {
        events = await prisma.exhibitorEvent.findMany({
            include: {
                editions: {
                    include: {
                        exhibitors: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { year: 'desc' }
                }
            },
            orderBy: { order: 'asc' }
        });
    } catch (err) {
        console.error("Error fetching exhibitors admin data:", err);
    }

    return <ExhibitorsDashboard initialEvents={events} />;
}

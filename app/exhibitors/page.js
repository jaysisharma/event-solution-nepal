import React from 'react';
import ExhibitorsClient from '@/components/ExhibitorsClient';
import { getAllExhibitorEvents } from '@/lib/exhibitorService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
    title: "Exhibitors Directory | Event Solution Nepal",
    description: "Explore participating companies, exhibitors, and sponsors across Nepal's leading trade exhibitions and conferences by event edition.",
    keywords: [
        "Exhibitors Nepal",
        "Trade Shows Kathmandu",
        "Event Solution Nepal Exhibitors",
        "Nepal Medical Expo Exhibitors",
        "Himalayan Auto Expo Brands",
        "Nepal Hospitality Expo"
    ]
};

export default async function ExhibitorsPage() {
    const events = await getAllExhibitorEvents();
    return <ExhibitorsClient events={events} />;
}

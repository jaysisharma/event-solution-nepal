import React from 'react';
import { notFound } from 'next/navigation';
import { getExhibitorData } from '@/lib/exhibitorService';
import ExhibitorDetailClient from '@/components/ExhibitorDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { eventSlug, year, exhibitorId } = await params;
    const data = await getExhibitorData(eventSlug, year, exhibitorId);
    if (!data) return { title: "Exhibitor Details | Event Solution Nepal" };
    return {
        title: `${data.exhibitor.name} | ${data.event.title} ${data.edition.year} | Event Solution Nepal`,
        description: `Showcase images, video presentation, and verified contact details for ${data.exhibitor.name} at ${data.event.title} ${data.edition.year}.`,
    };
}

export default async function ExhibitorDetailPage({ params }) {
    const { eventSlug, year, exhibitorId } = await params;
    const data = await getExhibitorData(eventSlug, year, exhibitorId);

    if (!data) {
        notFound();
    }

    return (
        <ExhibitorDetailClient
            event={data.event}
            edition={data.edition}
            exhibitor={data.exhibitor}
        />
    );
}

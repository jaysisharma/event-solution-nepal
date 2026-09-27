import React from 'react';
import { notFound } from 'next/navigation';
import { getEditionData } from '@/lib/exhibitorService';
import ExhibitorEditionClient from '@/components/ExhibitorEditionClient';

export async function generateMetadata({ params }) {
    const { eventSlug, year } = await params;
    const data = await getEditionData(eventSlug, year);
    if (!data) return { title: "Exhibitors | Event Solution Nepal" };
    return {
        title: `${data.event.title} (${data.edition.year}) Exhibitors | Event Solution Nepal`,
        description: `Explore participating companies and exhibitors for ${data.event.title} ${data.edition.year} edition.`,
    };
}

export default async function ExhibitorEditionPage({ params }) {
    const { eventSlug, year } = await params;
    const data = await getEditionData(eventSlug, year);

    if (!data) {
        notFound();
    }

    return <ExhibitorEditionClient event={data.event} edition={data.edition} />;
}

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEditionData } from '@/lib/exhibitorService';
import styles from '../../exhibitorsAdmin.module.css';
import EditionExhibitorsTable from './EditionExhibitorsTable';
import {
    ArrowLeft,
    Plus,
    ExternalLink
} from 'lucide-react';

export async function generateMetadata({ params }) {
    const { eventSlug, year } = await params;
    const data = await getEditionData(eventSlug, year);
    if (!data) return { title: 'Exhibitors | Admin' };
    return {
        title: `${data.event.title} (${data.edition.year}) Exhibitors | Admin Panel`,
    };
}

export default async function AdminEditionExhibitorsPage({ params }) {
    const { eventSlug, year } = await params;
    const data = await getEditionData(eventSlug, year, { includeAll: true });

    if (!data) {
        notFound();
    }

    const { event, edition } = data;
    const exhibitors = edition.exhibitors || [];

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.titleGroup}>
                    <Link
                        href="/admin/exhibitors"
                        className={styles.btnSecondary}
                        style={{ width: 'fit-content', padding: '0.35rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.35rem' }}
                    >
                        <ArrowLeft size={14} /> Back to All Exhibitions
                    </Link>
                    <h1 className={styles.pageTitle}>
                        {event.title} — {edition.year}
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Managing {exhibitors.length} participating brand exhibitors for this edition.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <Link
                        href={`/exhibitors/${event.slug}/${edition.year}`}
                        target="_blank"
                        className={styles.btnSecondary}
                    >
                        <ExternalLink size={15} />
                        View Live Page
                    </Link>
                    <Link
                        href={`/admin/exhibitors/${event.slug}/${edition.year}/new`}
                        className={styles.btnPrimary}
                    >
                        <Plus size={16} />
                        Add Exhibitor
                    </Link>
                </div>
            </div>

            {/* Interactive Exhibitors Table with Search & A-Z / Z-A Sorting */}
            <EditionExhibitorsTable
                initialExhibitors={exhibitors}
                event={event}
                edition={edition}
            />
        </div>
    );
}

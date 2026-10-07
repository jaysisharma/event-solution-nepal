import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getExhibitorData } from '@/lib/exhibitorService';
import ExhibitorForm from '../../../ExhibitorForm';
import styles from '../../../exhibitorsAdmin.module.css';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { eventSlug, year, exhibitorId } = await params;
    const data = await getExhibitorData(eventSlug, year, exhibitorId);
    if (!data) return { title: 'Edit Exhibitor | Admin' };
    return {
        title: `Edit ${data.exhibitor.name} | Admin Panel`,
    };
}

export default async function EditExhibitorPage({ params }) {
    const { eventSlug, year, exhibitorId } = await params;
    const data = await getExhibitorData(eventSlug, year, exhibitorId, { includeAll: true });

    if (!data) {
        notFound();
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.titleGroup}>
                    <Link
                        href={`/admin/exhibitors/${eventSlug}/${year}`}
                        className={styles.btnSecondary}
                        style={{ width: 'fit-content', marginBottom: '0.5rem' }}
                    >
                        <ArrowLeft size={15} /> Back to Exhibitors List
                    </Link>
                    <h1 className={styles.pageTitle}>
                        Edit: {data.exhibitor.name}
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Updating profile in {data.event.title} — Edition {data.edition.year}
                    </p>
                </div>
            </div>

            <ExhibitorForm
                editionId={data.edition.id}
                eventSlug={eventSlug}
                year={year}
                eventName={data.event.title}
                initialData={data.exhibitor}
                isEdit={true}
            />
        </div>
    );
}

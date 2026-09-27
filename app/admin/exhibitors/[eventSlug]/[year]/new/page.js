import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEditionData } from '@/lib/exhibitorService';
import ExhibitorForm from '../../../ExhibitorForm';
import styles from '../../../exhibitorsAdmin.module.css';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Add New Exhibitor | Admin Panel',
};

export default async function NewExhibitorPage({ params }) {
    const { eventSlug, year } = await params;
    const data = await getEditionData(eventSlug, year);

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
                        Add New Exhibitor
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Adding to {data.event.title} — Edition {data.edition.year}
                    </p>
                </div>
            </div>

            <ExhibitorForm
                editionId={data.edition.id}
                eventSlug={eventSlug}
                year={year}
                eventName={data.event.title}
                isEdit={false}
            />
        </div>
    );
}

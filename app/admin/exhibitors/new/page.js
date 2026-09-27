import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import ExhibitorForm from '../ExhibitorForm';
import styles from '../exhibitorsAdmin.module.css';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';

export const metadata = {
    title: 'Add New Exhibitor | Admin Panel',
};

export default async function GeneralNewExhibitorPage({ searchParams }) {
    const sParams = await searchParams;
    const requestedEventSlug = sParams?.event;
    const requestedYear = sParams?.year;

    const events = await prisma.exhibitorEvent.findMany({
        include: {
            editions: {
                orderBy: { year: 'desc' }
            }
        },
        orderBy: { order: 'asc' }
    });

    if (!events || events.length === 0) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.emptyState}>
                    <Building2 size={40} opacity={0.4} />
                    <span>No exhibition events found. Please create an exhibition event first.</span>
                    <Link href="/admin/exhibitors" className={styles.btnPrimary}>
                        Go to Exhibitors Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Determine target event and edition
    let targetEvent = events.find((e) => e.slug === requestedEventSlug) || events[0];
    let targetEdition = (targetEvent.editions || []).find((ed) => ed.year === requestedYear) || (targetEvent.editions || [])[0];

    // If an edition was found, redirect to the canonical path for consistency
    if (targetEvent && targetEdition) {
        redirect(`/admin/exhibitors/${targetEvent.slug}/${targetEdition.year}/new`);
    }

    // Fallback if no editions exist yet
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.titleGroup}>
                    <Link href="/admin/exhibitors" className={styles.btnSecondary} style={{ width: 'fit-content' }}>
                        <ArrowLeft size={15} /> Back to Dashboard
                    </Link>
                    <h1 className={styles.pageTitle}>Add Exhibitor</h1>
                    <p className={styles.pageSubtitle}>
                        No edition found for {targetEvent.title}. Please create an annual edition first.
                    </p>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { seedDefaultExhibitorsIfEmpty } from '@/lib/exhibitorService';
import PublicExhibitorForm from './PublicExhibitorForm';
import styles from './PublicExhibitorForm.module.css';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Exhibit Yourself | Event Solution Nepal',
    description: 'Exhibit yourself and showcase your brand, products, and services at upcoming Event Solution Nepal exhibitions.',
};

export default async function PublicExhibitorApplyPage({ searchParams }) {
    await seedDefaultExhibitorsIfEmpty();

    const sParams = await searchParams;
    const defaultEventSlug = sParams?.event || '';
    const defaultYear = sParams?.year || '';

    let events = [];
    try {
        events = await prisma.exhibitorEvent.findMany({
            include: {
                editions: {
                    orderBy: { year: 'desc' }
                }
            },
            orderBy: { order: 'asc' }
        });
    } catch (err) {
        console.error("Error loading events for public exhibitor form:", err);
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <Link
                        href={defaultEventSlug && defaultYear ? `/exhibitors/${defaultEventSlug}/${defaultYear}` : '/exhibitors'}
                        className={styles.backLink}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Exhibition Directory</span>
                    </Link>
                    <span className={styles.kicker}>Exhibitor Portal</span>
                    <h1 className={styles.title}>Exhibit Yourself</h1>
                    <p className={styles.subtitle}>
                        Showcase your brand, launch products, and connect with over 100K+ visitors and industry leaders.
                        Register your brand below to exhibit with us at our flagship editions.
                    </p>
                </header>

                <PublicExhibitorForm
                    events={events}
                    defaultEventSlug={defaultEventSlug}
                    defaultYear={defaultYear}
                />
            </div>
        </main>
    );
}

"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';
import styles from './HomeExhibitors.module.css';
import { useTheme } from '@/context/ThemeContext';
import { EXHIBITOR_EVENTS } from '@/data/exhibitorsData';

export default function HomeExhibitors() {
    const { theme } = useTheme();

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.container}>
                {/* Header matching Homepage standard */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <span className={styles.label}>
                            <Building2 size={16} /> Exhibitions &amp; Trade Shows
                        </span>
                        <h2 className={styles.title}>
                            Featured <span className={styles.highlight}>Exhibitors</span> &amp; Editions
                        </h2>
                        <p className={styles.description}>
                            Connect with leading national and global companies showcasing their innovations across 2024, 2025, and 2026 event editions.
                        </p>
                    </div>

                    <Link href="/exhibitors">
                        <button className={styles.viewAllBtn}>
                            Explore Exhibitor Directory <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>

                {/* Event Deck Grid */}
                <div className={styles.eventsGrid}>
                    {EXHIBITOR_EVENTS.map((event) => (
                        <div key={event.id} className={styles.eventCard}>
                            {/* Thumbnail */}
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={event.previewImage || event.bannerImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"}
                                    alt={event.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className={styles.eventImage}
                                />
                                <div className={styles.badgeOverlay}>
                                    <span className={styles.categoryBadge}>
                                        {event.category ? event.category.split("&")[0].trim() : event.title}
                                    </span>
                                    <span className={styles.editionCountBadge}>
                                        {event.editions?.length || 0} Editions
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{event.title}</h3>
                                <p className={styles.cardTagline}>{event.tagline || event.description}</p>

                                {/* Edition Tags */}
                                <div className={styles.editionsList}>
                                    {event.editions?.map((ed) => (
                                        <Link
                                            key={ed.year}
                                            href={`/exhibitors/${event.slug}/${ed.year}`}
                                            className={styles.editionTag}
                                        >
                                            {ed.year}
                                        </Link>
                                    ))}
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={styles.exhibitorPreviewCount}>
                                        {event.editions?.reduce((acc, ed) => acc + (ed.exhibitors?.length || 0), 0) || 1}+ Companies Listed
                                    </span>
                                    <Link href={`/exhibitors`} className={styles.exploreLink}>
                                        View Showcase <ArrowRight size={15} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import styles from './ExhibitorEdition.module.css';
import { useTheme } from '@/context/ThemeContext';

export default function ExhibitorEditionClient({ event, edition }) {
    const { theme } = useTheme();
    const exhibitors = edition.exhibitors || [];

    return (
        <main className={`${styles.main} ${theme === 'dark' ? styles.dark : ''}`}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.topBar}>
                        <Link href="/exhibitors" className={styles.backLink}>
                            <ArrowLeft size={15} /> Back to Directory
                        </Link>
                        <Link
                            href={`/exhibitors/apply?event=${event.slug}&year=${edition.year}`}
                            className={styles.applyLink}
                        >
                            <span>Exhibit Yourself</span> →
                        </Link>
                    </div>

                    <div className={styles.headerTitleRow}>
                        <div className={styles.titleWrapper}>
                            <span className={styles.editionKicker}>
                                Exhibitors Directory // {edition.year}
                            </span>
                            <h1 className={styles.pageTitle}>
                                <span className={styles.textRed}>{event.title}</span>{" "}
                                <span className={styles.textBlue}>{edition.year}</span>
                            </h1>
                        </div>

                        {/* 3 Telemetry Metrics */}
                        <div className={styles.statsStrip}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>100K+</span>
                                <span className={styles.statLabel}>Attendees</span>
                            </div>
                            <span className={styles.statDivider}>/</span>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{exhibitors.length}</span>
                                <span className={styles.statLabel}>Exhibitors</span>
                            </div>
                            <span className={styles.statDivider}>/</span>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    {edition.venue?.split(',')?.[0]?.trim() || "Kathmandu"}
                                </span>
                                <span className={styles.statLabel}>
                                    {edition.dates?.split('-')?.[0]?.trim() || "Annual"}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Exhibitors Name & Logo/Strip List / Grid */}
                <div className={styles.exhibitorSection}>
                    {exhibitors.length === 0 ? (
                        <div className={styles.emptyCard}>
                            <p>No exhibitors listed for this edition.</p>
                        </div>
                    ) : (
                        <div className={styles.exhibitorsGrid}>
                            {exhibitors.map((company, index) => {
                                return (
                                    <Link
                                        key={company.id}
                                        id={company.id}
                                        href={`/exhibitors/${event.slug}/${edition.year}/${company.id}`}
                                        className={styles.exhibitorCard}
                                        title={`View ${company.name} Showcase & Details`}
                                    >
                                        {/* Company Logo from public/company */}
                                        <div className={styles.logoWrapper}>
                                            <Image
                                                src={company.logo || '/placeholder-logo.svg'}
                                                alt={`${company.name} Logo`}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                className={styles.companyLogoImg}
                                            />
                                        </div>

                                        <div className={styles.cardContent}>
                                            <h3 className={styles.companyName}>{company.name}</h3>
                                            <span className={styles.websiteTag}>
                                                View Showcase & Details →
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer: Other Editions Switcher */}
                {event.editions && event.editions.length > 1 && (
                    <footer className={styles.editionFooter}>
                        <div className={styles.editionSwitcher}>
                            <span className={styles.switcherHeading}>Explore Other Editions:</span>
                            <div className={styles.switcherList}>
                                {event.editions.map((ed) => {
                                    const isCurrent = ed.year === edition.year;
                                    return (
                                        <Link
                                            key={ed.year}
                                            href={`/exhibitors/${event.slug}/${ed.year}`}
                                            className={`${styles.switcherChip} ${isCurrent ? styles.switcherChipActive : ''}`}
                                        >
                                            <span>Edition {ed.year}</span>
                                            {isCurrent && <span className={styles.currentBadge}>Active</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </main>
    );
}

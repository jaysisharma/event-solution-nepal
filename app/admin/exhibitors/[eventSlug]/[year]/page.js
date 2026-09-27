import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getEditionData } from '@/lib/exhibitorService';
import styles from '../../exhibitorsAdmin.module.css';
import DeleteExhibitorButton from './DeleteExhibitorButton';
import {
    ArrowLeft,
    Plus,
    ExternalLink,
    Pencil,
    Globe,
    Phone,
    User,
    Store
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

            {/* Exhibitors Table */}
            <div className={styles.tableContainer}>
                {exhibitors.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Store size={40} opacity={0.4} />
                        <span>No exhibitors registered for this edition yet.</span>
                        <Link
                            href={`/admin/exhibitors/${event.slug}/${edition.year}/new`}
                            className={styles.btnPrimary}
                            style={{ marginTop: '0.5rem' }}
                        >
                            <Plus size={15} /> Add First Exhibitor
                        </Link>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '64px' }}>Logo</th>
                                <th>Exhibitor Name & Category</th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Website</th>
                                <th>Booth / Stall</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exhibitors.map((company) => (
                                <tr key={company.id}>
                                    <td>
                                        <div className={styles.logoThumb}>
                                            {company.logo ? (
                                                <Image
                                                    src={company.logo}
                                                    alt={company.name}
                                                    fill
                                                    sizes="52px"
                                                    className={styles.logoImg}
                                                />
                                            ) : (
                                                <Store size={18} color="#94a3b8" />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong style={{ color: '#0f172a' }}>{company.name}</strong>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{company.category || 'Exhibition Showcase'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                                            <User size={13} color="#94a3b8" />
                                            {company.contactPerson || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        {company.contact ? (
                                            <a
                                                href={`tel:${company.contact}`}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem' }}
                                            >
                                                <Phone size={13} />
                                                {company.contact}
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        {company.website ? (
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                                            >
                                                <Globe size={13} />
                                                Visit
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                                            {company.booth || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionsCell}>
                                            <Link
                                                href={`/admin/exhibitors/${event.slug}/${edition.year}/${company.id}`}
                                                className={styles.btnIcon}
                                                title="Edit Exhibitor"
                                            >
                                                <Pencil size={14} />
                                            </Link>
                                            <Link
                                                href={`/exhibitors/${event.slug}/${edition.year}/${company.id}`}
                                                target="_blank"
                                                className={styles.btnIcon}
                                                title="View Public Page"
                                            >
                                                <ExternalLink size={14} />
                                            </Link>
                                            <DeleteExhibitorButton
                                                id={company.dbId || company.id}
                                                name={company.name}
                                                eventSlug={event.slug}
                                                year={edition.year}
                                                iconOnly={true}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

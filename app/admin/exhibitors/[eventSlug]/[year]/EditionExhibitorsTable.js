'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../exhibitorsAdmin.module.css';
import DeleteExhibitorButton from './DeleteExhibitorButton';
import {
    ArrowUpDown,
    ArrowUpAZ,
    ArrowDownZA,
    Search,
    Store,
    User,
    Phone,
    Globe,
    Pencil,
    ExternalLink,
    Plus,
    X,
    Filter
} from 'lucide-react';

export default function EditionExhibitorsTable({ initialExhibitors, event, edition }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('default'); // 'default', 'az', 'za', 'booth', 'category'

    const filteredAndSortedExhibitors = useMemo(() => {
        let list = [...initialExhibitors];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((item) => {
                const name = (item.name || '').toLowerCase();
                const category = (item.category || '').toLowerCase();
                const contactPerson = (item.contactPerson || '').toLowerCase();
                const contact = (item.contact || '').toLowerCase();
                const booth = (item.booth || '').toLowerCase();
                return (
                    name.includes(q) ||
                    category.includes(q) ||
                    contactPerson.includes(q) ||
                    contact.includes(q) ||
                    booth.includes(q)
                );
            });
        }

        // Sorting
        switch (sortMode) {
            case 'az':
                list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
                break;
            case 'za':
                list.sort((a, b) => (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' }));
                break;
            case 'booth':
                list.sort((a, b) => (a.booth || '').localeCompare(b.booth || '', undefined, { numeric: true, sensitivity: 'base' }));
                break;
            case 'category':
                list.sort((a, b) => (a.category || '').localeCompare(b.category || '', undefined, { sensitivity: 'base' }));
                break;
            case 'default':
            default:
                // Preserve natural order (order field or original sequence)
                list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                break;
        }

        return list;
    }, [initialExhibitors, searchQuery, sortMode]);

    return (
        <div>
            {/* Filter & Sorting Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Search Box */}
                <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search exhibitors, booths, or contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.45rem 1.75rem 0.45rem 2rem',
                            fontSize: '0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            outline: 'none',
                            color: '#0f172a'
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: 0
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Sorting Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpDown size={14} /> Sort:
                    </span>

                    {/* A to Z button */}
                    <button
                        type="button"
                        onClick={() => setSortMode(sortMode === 'az' ? 'default' : 'az')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: sortMode === 'az' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: sortMode === 'az' ? '#eff6ff' : '#ffffff',
                            color: sortMode === 'az' ? '#1d4ed8' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                        title="Sort Alphabetically A to Z"
                    >
                        <ArrowUpAZ size={15} color={sortMode === 'az' ? '#2563eb' : '#64748b'} />
                        <span>A → Z</span>
                    </button>

                    {/* Z to A button */}
                    <button
                        type="button"
                        onClick={() => setSortMode(sortMode === 'za' ? 'default' : 'za')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: sortMode === 'za' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: sortMode === 'za' ? '#eff6ff' : '#ffffff',
                            color: sortMode === 'za' ? '#1d4ed8' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                        title="Sort Alphabetically Z to A"
                    >
                        <ArrowDownZA size={15} color={sortMode === 'za' ? '#2563eb' : '#64748b'} />
                        <span>Z → A</span>
                    </button>

                    {/* Quick Select Dropdown for Extra Sorts */}
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                        style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="default">Default Order</option>
                        <option value="az">Name (A to Z)</option>
                        <option value="za">Name (Z to A)</option>
                        <option value="booth">Stall / Booth No</option>
                        <option value="category">Category</option>
                    </select>

                    {/* Results count pill */}
                    <div style={{
                        padding: '0.35rem 0.65rem',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569'
                    }}>
                        Showing {filteredAndSortedExhibitors.length} of {initialExhibitors.length}
                    </div>
                </div>
            </div>

            {/* Exhibitors Table */}
            <div className={styles.tableContainer}>
                {filteredAndSortedExhibitors.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Store size={40} opacity={0.4} />
                        <span>
                            {searchQuery ? `No exhibitors match "${searchQuery}".` : 'No exhibitors registered for this edition yet.'}
                        </span>
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className={styles.btnSecondary}
                                style={{ marginTop: '0.5rem' }}
                            >
                                Clear Search Filter
                            </button>
                        ) : (
                            <Link
                                href={`/admin/exhibitors/${event.slug}/${edition.year}/new`}
                                className={styles.btnPrimary}
                                style={{ marginTop: '0.5rem' }}
                            >
                                <Plus size={15} /> Add First Exhibitor
                            </Link>
                        )}
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '64px' }}>Logo</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => setSortMode(sortMode === 'az' ? 'za' : 'az')} title="Click to toggle A-Z / Z-A">
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        <span>Exhibitor Name & Category</span>
                                        {sortMode === 'az' && <ArrowUpAZ size={13} color="#2563eb" />}
                                        {sortMode === 'za' && <ArrowDownZA size={13} color="#2563eb" />}
                                    </div>
                                </th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Website</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => setSortMode(sortMode === 'booth' ? 'default' : 'booth')} title="Click to sort by Stall No">
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        <span>Booth / Stall</span>
                                        {sortMode === 'booth' && <ArrowUpDown size={12} color="#2563eb" />}
                                    </div>
                                </th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedExhibitors.map((company) => (
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
                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
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

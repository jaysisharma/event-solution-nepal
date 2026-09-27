'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COMPANY_LOGOS } from '@/data/exhibitorsData';
import { createExhibitor, updateExhibitor } from './actions';
import styles from './exhibitorsAdmin.module.css';
import {
    ArrowLeft,
    Check,
    Upload,
    Building2,
    Calendar,
    Phone,
    Globe,
    Mail,
    User,
    Video,
    ImageIcon,
    MapPin
} from 'lucide-react';

export default function ExhibitorForm({
    editionId,
    eventSlug,
    year,
    eventName = '',
    initialData = null,
    isEdit = false
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedLogo, setSelectedLogo] = useState(initialData?.logo || COMPANY_LOGOS[0]);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const formData = new FormData(e.currentTarget);
            formData.set('logoSelected', selectedLogo);

            let res;
            if (isEdit) {
                res = await updateExhibitor(formData);
            } else {
                res = await createExhibitor(formData);
            }

            if (res.success) {
                router.push(`/admin/exhibitors/${eventSlug}/${year}`);
                router.refresh();
            } else {
                setErrorMsg(res.error || 'Failed to save exhibitor.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formCard}>
            <input type="hidden" name="editionId" value={editionId} />
            <input type="hidden" name="eventSlug" value={eventSlug} />
            <input type="hidden" name="year" value={year} />
            {isEdit && <input type="hidden" name="id" value={initialData.dbId || initialData.id} />}

            {/* Prominent Target Event & Edition Context Banner */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={16} color="#2563eb" />
                    <span style={{ color: '#64748b' }}>Event:</span>
                    <strong style={{ color: '#1e40af' }}>{eventName || eventSlug}</strong>
                </div>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} color="#2563eb" />
                    <span style={{ color: '#64748b' }}>Edition:</span>
                    <strong style={{ color: '#1e40af' }}>Year {year}</strong>
                </div>
            </div>

            {errorMsg && (
                <div style={{ padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', color: '#dc2626', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {errorMsg}
                </div>
            )}

            <div className={styles.formGrid}>
                {/* Basic Details */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Company / Exhibitor Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        defaultValue={initialData?.name || ''}
                        placeholder="e.g. Nepal Brand Clearance Alliance"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Category / Industry
                    </label>
                    <input
                        type="text"
                        name="category"
                        defaultValue={initialData?.category || ''}
                        placeholder="e.g. Retail & Consumer Goods, Electronics"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Exhibition Stall / Booth
                    </label>
                    <input
                        type="text"
                        name="booth"
                        defaultValue={initialData?.booth || ''}
                        placeholder="e.g. Stall A-12, Main Pavilion"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Slug (URL identifier)
                    </label>
                    <input
                        type="text"
                        name="slug"
                        defaultValue={initialData?.slug || initialData?.id || ''}
                        placeholder="e.g. nepal-brand-clearance (auto-generated if empty)"
                        className={styles.formInput}
                    />
                </div>

                {/* Interactive Logo Picker (public/company) */}
                <div className={styles.formGroupFull}>
                    <label className={styles.formLabel}>
                        Company Logo (Choose from public/company or Upload)
                    </label>

                    <div className={styles.logoPickerSection}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                                Select one of {COMPANY_LOGOS.length} Brand Logos from /public/company:
                            </span>
                            {selectedLogo && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                                    <span>Selected</span>
                                    <div style={{ position: 'relative', width: 44, height: 28, border: '1px solid #10b981', borderRadius: '4px', overflow: 'hidden', background: '#fff' }}>
                                        <Image src={selectedLogo} alt="Selected Logo" fill sizes="44px" style={{ objectFit: 'contain' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.logoPickerGrid}>
                            {COMPANY_LOGOS.map((logoPath, idx) => {
                                const isSelected = selectedLogo === logoPath;
                                return (
                                    <button
                                        type="button"
                                        key={idx}
                                        onClick={() => setSelectedLogo(logoPath)}
                                        className={`${styles.logoOption} ${isSelected ? styles.logoOptionSelected : ''}`}
                                        title={`Logo ${idx + 1}`}
                                    >
                                        <Image
                                            src={logoPath}
                                            alt={`Logo Option ${idx + 1}`}
                                            fill
                                            sizes="80px"
                                            style={{ objectFit: 'contain', padding: '2px' }}
                                        />
                                        {isSelected && (
                                            <span className={styles.selectedCheckBadge}>
                                                <Check size={9} strokeWidth={4} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                                <Upload size={14} /> Or Upload Custom Logo Image:
                            </label>
                            <input
                                type="file"
                                name="logoFile"
                                accept="image/png, image/jpeg, image/webp"
                                className={styles.formInput}
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information (Revealed in 3-Dot details sheet on live page) */}
                <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                        Contact Details (Displayed in 3-Dot Menu)
                    </h3>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Contact Person Name
                    </label>
                    <input
                        type="text"
                        name="contactPerson"
                        defaultValue={initialData?.contactPerson || ''}
                        placeholder="e.g. Ramesh Adhikari (Exhibition Head)"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Phone Number
                    </label>
                    <input
                        type="text"
                        name="contact"
                        defaultValue={initialData?.contact || ''}
                        placeholder="e.g. +977-1-5533110"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Official Website
                    </label>
                    <input
                        type="url"
                        name="website"
                        defaultValue={initialData?.website || ''}
                        placeholder="https://brandclearance.np"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={initialData?.email || ''}
                        placeholder="info@brandclearance.np"
                        className={styles.formInput}
                    />
                </div>

                {/* Showcase Media */}
                <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                        Showcase Media (Video & Gallery Photos)
                    </h3>
                </div>

                <div className={styles.formGroupFull}>
                    <label className={styles.formLabel}>
                        <Video size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Showcase Video URL (MP4)
                    </label>
                    <input
                        type="url"
                        name="videoUrl"
                        defaultValue={initialData?.video?.url || initialData?.videoUrl || ''}
                        placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Gallery Photo 1 URL
                    </label>
                    <input
                        type="url"
                        name="photo1"
                        defaultValue={initialData?.photos?.[0] || ''}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Gallery Photo 2 URL
                    </label>
                    <input
                        type="url"
                        name="photo2"
                        defaultValue={initialData?.photos?.[1] || ''}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroupFull}>
                    <label className={styles.formLabel}>
                        <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Gallery Photo 3 URL
                    </label>
                    <input
                        type="url"
                        name="photo3"
                        defaultValue={initialData?.photos?.[2] || ''}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={styles.formInput}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className={styles.formActions}>
                <Link
                    href={`/admin/exhibitors/${eventSlug}/${year}`}
                    className={styles.btnSecondary}
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className={styles.btnPrimary}
                >
                    {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Exhibitor'}
                </button>
            </div>
        </form>
    );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COMPANY_LOGOS } from '@/data/exhibitorsData';
import { createExhibitor, updateExhibitor, getCompanyLogos, uploadCompanyLogos } from './actions';
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
    MapPin,
    Plus,
    Loader2
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
    const [availableLogos, setAvailableLogos] = useState(COMPANY_LOGOS);
    const [selectedLogo, setSelectedLogo] = useState(initialData?.logo || COMPANY_LOGOS[0]);
    const [errorMsg, setErrorMsg] = useState('');
    const [uploadingLogos, setUploadingLogos] = useState(false);
    const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
    const fileInputRef = useRef(null);

    // Fetch existing logos dynamically from public/company on mount
    useEffect(() => {
        let isMounted = true;
        async function fetchLogos() {
            try {
                const res = await getCompanyLogos();
                if (res?.success && Array.isArray(res.logos) && res.logos.length > 0 && isMounted) {
                    // Combine with COMPANY_LOGOS to guarantee uniqueness
                    const combined = Array.from(new Set([...res.logos, ...COMPANY_LOGOS]));
                    setAvailableLogos(combined);
                }
            } catch (e) {
                console.error("Failed to load company logos dynamically:", e);
            }
        }
        fetchLogos();
        return () => { isMounted = false; };
    }, []);

    const handleBatchLogoUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingLogos(true);
        setErrorMsg('');
        setUploadSuccessMsg('');

        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('logoFiles', files[i]);
            }

            const res = await uploadCompanyLogos(formData);
            if (res.success && res.uploadedUrls?.length > 0) {
                // Update available logos list with newly uploaded logos at the front
                const updatedList = Array.from(new Set([...res.uploadedUrls, ...availableLogos]));
                setAvailableLogos(updatedList);
                // Automatically select the first newly uploaded logo
                setSelectedLogo(res.uploadedUrls[0]);
                setUploadSuccessMsg(`Successfully uploaded ${res.uploadedUrls.length} new logo(s)! They are added to the library below.`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setErrorMsg(res.error || 'Failed to upload logo files.');
            }
        } catch (err) {
            console.error("Batch logo upload error:", err);
            setErrorMsg(err.message || 'Error occurred while uploading logos.');
        } finally {
            setUploadingLogos(false);
        }
    };

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
                        Company Logo (Choose from library or Upload Multiple)
                    </label>

                    <div className={styles.logoPickerSection}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                                    Brand Logo Library ({availableLogos.length} Logos)
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    Select from /public/company or upload custom files below
                                </span>
                            </div>

                            {selectedLogo && (
                                <div style={{
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.6rem 1rem 0.6rem 0.75rem',
                                    background: '#ffffff',
                                    border: '2px solid #10b981',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{
                                        position: 'relative',
                                        width: 160,
                                        height: 90,
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'inset 0 0 4px rgba(0,0,0,0.03)'
                                    }}>
                                        <Image
                                            src={selectedLogo}
                                            alt="Selected Logo Preview"
                                            fill
                                            sizes="160px"
                                            style={{ objectFit: 'contain', padding: '6px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: '#059669',
                                            fontWeight: 800,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Check size={14} strokeWidth={3} /> Selected Preview
                                        </span>
                                        <span style={{
                                            fontSize: '0.775rem',
                                            color: '#334155',
                                            fontWeight: 500,
                                            maxWidth: '190px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} title={selectedLogo}>
                                            {selectedLogo.split('/').pop().replace(/%20/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {uploadSuccessMsg && (
                            <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#047857', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Check size={14} color="#10b981" />
                                {uploadSuccessMsg}
                            </div>
                        )}

                        <div className={styles.logoPickerGrid}>
                            {availableLogos.map((logoPath, idx) => {
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

                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                                    <Upload size={15} color="#2563eb" /> Upload Custom Brand Logo(s) (Multiple allowed):
                                </label>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    PNG, JPG, WEBP, SVG • Select multiple files at once
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="logoFiles"
                                    multiple
                                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                    onChange={handleBatchLogoUpload}
                                    disabled={uploadingLogos}
                                    className={styles.formInput}
                                    style={{ flex: 1, minWidth: '220px', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                                />
                                {uploadingLogos && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                                        <Loader2 size={16} className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span>Uploading & Adding to Library...</span>
                                    </div>
                                )}
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                                💡 Tip: You can select and upload multiple logos simultaneously. They will be saved to <code>/public/company</code> and will automatically appear in the library above!
                            </span>
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

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    CheckCircle,
    Building2,
    Calendar,
    User,
    Phone,
    Mail,
    Globe,
    Upload,
    Video,
    ImageIcon,
    ArrowRight,
    Loader2
} from 'lucide-react';
import styles from './PublicExhibitorForm.module.css';
import { submitPublicExhibitorApplication } from '@/app/admin/exhibitors/actions';

export default function PublicExhibitorForm({
    events = [],
    defaultEventSlug = '',
    defaultYear = ''
}) {
    const [selectedEventSlug, setSelectedEventSlug] = useState(() => {
        if (defaultEventSlug && events.some((e) => e.slug === defaultEventSlug)) {
            return defaultEventSlug;
        }
        return events[0]?.slug || '';
    });

    const activeEvent = useMemo(() => {
        return events.find((e) => e.slug === selectedEventSlug) || events[0] || null;
    }, [events, selectedEventSlug]);

    const availableEditions = useMemo(() => {
        return activeEvent?.editions || [];
    }, [activeEvent]);

    const [selectedYear, setSelectedYear] = useState(() => {
        if (defaultYear && availableEditions.some((ed) => ed.year === defaultYear)) {
            return defaultYear;
        }
        return availableEditions[0]?.year || '';
    });

    // Update year when event changes
    React.useEffect(() => {
        if (availableEditions.length > 0) {
            if (!availableEditions.some((ed) => ed.year === selectedYear)) {
                setSelectedYear(availableEditions[0].year);
            }
        } else {
            setSelectedYear('');
        }
    }, [availableEditions, selectedYear]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Image preview state
    const [logoPreview, setLogoPreview] = useState(null);

    const handleLogoFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const formData = new FormData(e.currentTarget);
            formData.set('eventSlug', selectedEventSlug);
            formData.set('year', selectedYear);

            const res = await submitPublicExhibitorApplication(formData);
            if (res.success) {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setErrorMsg(res.error || 'Failed to submit your application. Please check your inputs.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className={styles.successCard}>
                <div className={styles.successIcon}>
                    <CheckCircle size={36} />
                </div>
                <h2 className={styles.successTitle}>Registration Received!</h2>
                <p className={styles.successMessage}>
                    Thank you for registering to exhibit at <strong>{activeEvent?.title} ({selectedYear})</strong>.
                    Our curation team will review your profile and contact your representative shortly.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <Link
                        href={`/exhibitors/${selectedEventSlug}/${selectedYear}`}
                        className={styles.submitBtn}
                        style={{ textDecoration: 'none' }}
                    >
                        View {activeEvent?.title} Directory →
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setIsSubmitted(false);
                            setLogoPreview(null);
                        }}
                        style={{
                            background: 'transparent',
                            border: '1px solid #cbd5e1',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.65rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Exhibit Another Brand
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formCard}>
            {errorMsg && (
                <div style={{
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '0.65rem',
                    color: '#dc2626',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem'
                }}>
                    {errorMsg}
                </div>
            )}

            {/* Step 1: Exhibition Target */}
            <h3 className={styles.sectionTitle}>
                <Building2 size={18} color="var(--primary, #EB1F26)" />
                1. Target Exhibition & Edition
            </h3>

            <div className={styles.grid2}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Exhibition Event *</label>
                    <select
                        value={selectedEventSlug}
                        onChange={(e) => setSelectedEventSlug(e.target.value)}
                        className={styles.select}
                        required
                    >
                        {events.map((ev) => (
                            <option key={ev.slug} value={ev.slug}>
                                {ev.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Annual Edition *</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className={styles.select}
                        required
                        disabled={availableEditions.length === 0}
                    >
                        {availableEditions.map((ed) => (
                            <option key={ed.year} value={ed.year}>
                                Edition {ed.year} {ed.dates ? `(${ed.dates})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Step 2: Company Information */}
            <h3 className={styles.sectionTitle}>
                <Building2 size={18} color="var(--primary, #EB1F26)" />
                2. Brand & Company Profile
            </h3>

            <div className={styles.grid2}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Company / Brand Name *</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Kathmandu Footwear Factory Outlet"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Industry / Product Category</label>
                    <input
                        type="text"
                        name="category"
                        placeholder="e.g. Footwear & Leathercraft, Electronics, Food & Beverage"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Brand Tagline / Slogan</label>
                    <input
                        type="text"
                        name="tagline"
                        placeholder="e.g. Premium handcrafted Himalayan leather shoes"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Space / Booth Preference</label>
                    <input
                        type="text"
                        name="booth"
                        placeholder="e.g. Standard Stall (3x3m), Corner Booth, or Custom Pavilion"
                        className={styles.input}
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Company Overview & Showcase Description</label>
                    <textarea
                        name="description"
                        placeholder="Briefly describe what your brand will be showcasing, key attractions, or discounts..."
                        className={styles.textarea}
                        rows={3}
                    />
                </div>
            </div>

            {/* Step 3: Contact Representative */}
            <h3 className={styles.sectionTitle}>
                <User size={18} color="var(--primary, #EB1F26)" />
                3. Authorized Contact Person
            </h3>

            <div className={styles.grid2}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Representative Name *</label>
                    <input
                        type="text"
                        name="contactPerson"
                        required
                        placeholder="e.g. Rajesh Shrestha"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Direct Contact Phone *</label>
                    <input
                        type="tel"
                        name="contact"
                        required
                        placeholder="e.g. +977 9851000000"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Official Business Email *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. info@company.com"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Website URL</label>
                    <input
                        type="url"
                        name="website"
                        placeholder="https://yourbrand.com.np"
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Step 4: Brand Assets & Media */}
            <h3 className={styles.sectionTitle}>
                <ImageIcon size={18} color="var(--primary, #EB1F26)" />
                4. Brand Logo & Showcase Media
            </h3>

            <div className={styles.grid2}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Upload Company Logo *</label>
                    <input
                        type="file"
                        name="logoFile"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className={styles.input}
                    />
                    <span className={styles.helpText}>PNG or SVG with transparent background recommended.</span>
                    {logoPreview && (
                        <div className={styles.previewThumb}>
                            <Image
                                src={logoPreview}
                                alt="Logo Preview"
                                fill
                                style={{ objectFit: 'contain', padding: '4px' }}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Or Logo Image URL</label>
                    <input
                        type="text"
                        name="logoSelected"
                        placeholder="https://... or /company/..."
                        className={styles.input}
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Showcase Video URL (Optional)</label>
                    <input
                        type="url"
                        name="videoUrl"
                        placeholder="e.g. https://... or direct MP4 reel link"
                        className={styles.input}
                    />
                    <span className={styles.helpText}>Optional high-definition video reel to feature on your showcase.</span>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Showcase Photo 1</label>
                    <input
                        type="file"
                        name="photoFile1"
                        accept="image/*"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Showcase Photo 2</label>
                    <input
                        type="file"
                        name="photoFile2"
                        accept="image/*"
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
                <Link
                    href={`/exhibitors/${selectedEventSlug}/${selectedYear}`}
                    style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting || availableEditions.length === 0}
                    className={styles.submitBtn}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Submitting Details...
                        </>
                    ) : (
                        <>
                            <span>Exhibit Yourself</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

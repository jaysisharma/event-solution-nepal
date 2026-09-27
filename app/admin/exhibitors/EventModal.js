'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import styles from './exhibitorsAdmin.module.css';
import { createEvent, updateEvent } from './actions';

export default function EventModal({ isOpen, onClose, event = null, onSuccess }) {
    const isEdit = Boolean(event && event.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [chronicleNumber, setChronicleNumber] = useState('01');
    const [description, setDescription] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setSlug(event.slug || '');
            setChronicleNumber(event.chronicleNumber || '01');
            setDescription(event.description || '');
            setPreviewImage(event.previewImage || '');
        } else {
            setTitle('');
            setSlug('');
            setChronicleNumber('01');
            setDescription('');
            setPreviewImage('');
        }
        setError('');
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (!isEdit && !slug) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            let res;
            if (isEdit) {
                res = await updateEvent(formData);
            } else {
                res = await createEvent(formData);
            }

            if (res.success) {
                onSuccess?.(isEdit ? 'Event updated successfully' : 'Event created successfully');
                onClose();
            } else {
                setError(res.error || 'Failed to save event');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        {isEdit ? 'Edit Exhibition Event' : 'Create Exhibition Event'}
                    </h3>
                    <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {isEdit && <input type="hidden" name="id" value={event.id} />}
                    
                    <div className={styles.modalBody}>
                        {error && (
                            <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Event Title *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="e.g. Stock Clearance Mela"
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>URL Slug</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g. stock-clearance"
                                    className={styles.formInput}
                                />
                                <span className={styles.formHelp}>Leave blank to auto-generate</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Chronicle Index</label>
                                <input
                                    type="text"
                                    name="chronicleNumber"
                                    value={chronicleNumber}
                                    onChange={(e) => setChronicleNumber(e.target.value)}
                                    placeholder="e.g. 01, 02"
                                    className={styles.formInput}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief overview of this exhibition series..."
                                className={styles.formTextarea}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Preview / Banner Image URL</label>
                            <input
                                type="text"
                                name="previewImage"
                                value={previewImage}
                                onChange={(e) => setPreviewImage(e.target.value)}
                                placeholder="https://... or /images/..."
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Or Upload Banner File</label>
                            <input
                                type="file"
                                name="previewImageFile"
                                accept="image/*"
                                className={styles.formInput}
                            />
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> {isEdit ? 'Update Event' : 'Create Event'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

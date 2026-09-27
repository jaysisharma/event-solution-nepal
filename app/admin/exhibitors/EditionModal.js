'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import styles from './exhibitorsAdmin.module.css';
import { createEdition, updateEdition } from './actions';

export default function EditionModal({
    isOpen,
    onClose,
    events = [],
    selectedEventId = null,
    edition = null,
    onSuccess
}) {
    const isEdit = Boolean(edition && edition.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [eventId, setEventId] = useState(selectedEventId || (events[0]?.id ? String(events[0].id) : ''));
    const [year, setYear] = useState('');
    const [title, setTitle] = useState('');
    const [dates, setDates] = useState('');
    const [venue, setVenue] = useState('Bhrikutimandap Exhibition Hall, Kathmandu');
    const [attendees, setAttendees] = useState('100K+');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        if (edition) {
            setEventId(String(edition.eventId || selectedEventId || ''));
            setYear(edition.year || '');
            setTitle(edition.title || '');
            setDates(edition.dates || '');
            setVenue(edition.venue || 'Bhrikutimandap Exhibition Hall, Kathmandu');
            setAttendees(edition.attendees || '100K+');
            setPreviewImage(edition.previewImage || '');
        } else {
            setEventId(selectedEventId ? String(selectedEventId) : (events[0]?.id ? String(events[0].id) : ''));
            setYear(new Date().getFullYear().toString());
            setTitle('');
            setDates('');
            setVenue('Bhrikutimandap Exhibition Hall, Kathmandu');
            setAttendees('100K+');
            setPreviewImage('');
        }
        setError('');
    }, [edition, isOpen, selectedEventId, events]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            let res;
            if (isEdit) {
                res = await updateEdition(formData);
            } else {
                res = await createEdition(formData);
            }

            if (res.success) {
                onSuccess?.(isEdit ? 'Edition updated successfully' : 'Edition created successfully');
                onClose();
            } else {
                setError(res.error || 'Failed to save edition');
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
                        {isEdit ? 'Edit Annual Edition' : 'Create New Edition'}
                    </h3>
                    <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {isEdit && <input type="hidden" name="id" value={edition.id} />}
                    
                    <div className={styles.modalBody}>
                        {error && (
                            <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        {!isEdit && (
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Exhibition Series *</label>
                                <select
                                    name="eventId"
                                    required
                                    value={eventId}
                                    onChange={(e) => setEventId(e.target.value)}
                                    className={styles.formSelect}
                                >
                                    {events.map((ev) => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.chronicleNumber ? `[${ev.chronicleNumber}] ` : ''}{ev.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Edition Year *</label>
                                <input
                                    type="text"
                                    name="year"
                                    required
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="e.g. 2025"
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Edition Title / Slogan</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. 10th National Edition"
                                    className={styles.formInput}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Dates *</label>
                            <input
                                type="text"
                                name="dates"
                                value={dates}
                                onChange={(e) => setDates(e.target.value)}
                                placeholder="e.g. November 21 - 25, 2025"
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Venue / Location *</label>
                            <input
                                type="text"
                                name="venue"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                placeholder="e.g. Bhrikutimandap Exhibition Hall, Kathmandu"
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Target Attendees Badge</label>
                            <input
                                type="text"
                                name="attendees"
                                value={attendees}
                                onChange={(e) => setAttendees(e.target.value)}
                                placeholder="e.g. 100K+ Attendees"
                                className={styles.formInput}
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
                                    <Save size={16} /> {isEdit ? 'Update Edition' : 'Create Edition'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

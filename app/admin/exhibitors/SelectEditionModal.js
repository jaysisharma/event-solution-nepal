'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Store, Calendar, Building2, Plus } from 'lucide-react';
import styles from './exhibitorsAdmin.module.css';

export default function SelectEditionModal({
    isOpen,
    onClose,
    events = [],
    onCreateEditionClick
}) {
    const router = useRouter();

    const [selectedEventId, setSelectedEventId] = useState(() => {
        return events[0]?.id ? String(events[0].id) : '';
    });

    // Update selectedEventId if events change
    React.useEffect(() => {
        if (events.length > 0 && !selectedEventId) {
            setSelectedEventId(String(events[0].id));
        }
    }, [events, selectedEventId]);

    const activeEvent = useMemo(() => {
        return events.find((ev) => String(ev.id) === String(selectedEventId)) || events[0] || null;
    }, [events, selectedEventId]);

    const availableEditions = useMemo(() => {
        return activeEvent?.editions || [];
    }, [activeEvent]);

    const [selectedYear, setSelectedYear] = useState('');

    React.useEffect(() => {
        if (availableEditions.length > 0) {
            setSelectedYear(availableEditions[0].year);
        } else {
            setSelectedYear('');
        }
    }, [availableEditions]);

    if (!isOpen) return null;

    const handleContinue = () => {
        if (!activeEvent || !selectedYear) return;
        onClose();
        router.push(`/admin/exhibitors/${activeEvent.slug}/${selectedYear}/new`);
    };

    const selectedEdition = availableEditions.find((ed) => ed.year === selectedYear);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div className={styles.modalHeader}>
                    <div>
                        <h3 className={styles.modalTitle}>Add New Exhibitor</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                            Select which exhibition event and annual edition to add this exhibitor to
                        </p>
                    </div>
                    <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* Step 1: Select Event */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <Building2 size={15} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                            1. Select Exhibition Event
                        </label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => {
                                setSelectedEventId(e.target.value);
                            }}
                            className={styles.formSelect}
                        >
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.chronicleNumber ? `[${ev.chronicleNumber}] ` : ''}{ev.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Step 2: Select Edition */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <Calendar size={15} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                            2. Select Annual Edition (Year)
                        </label>

                        {availableEditions.length === 0 ? (
                            <div style={{
                                padding: '1rem',
                                background: '#f8fafc',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '8px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    No editions exist for this event yet.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onCreateEditionClick?.(activeEvent?.id);
                                    }}
                                    className={styles.btnPrimary}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                    <Plus size={14} /> Create an Edition First
                                </button>
                            </div>
                        ) : (
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className={styles.formSelect}
                            >
                                {availableEditions.map((ed) => (
                                    <option key={ed.id || ed.year} value={ed.year}>
                                        Edition {ed.year} {ed.title ? `— ${ed.title}` : ''} ({ed.exhibitorCount ?? ed.exhibitors?.length ?? 0} exhibitors)
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Target Context Summary Box */}
                    {activeEvent && selectedEdition && (
                        <div style={{
                            padding: '0.85rem 1rem',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            fontSize: '0.85rem'
                        }}>
                            <div style={{ fontWeight: 600, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Store size={14} /> Adding exhibitor to:
                            </div>
                            <div style={{ color: '#1e3a8a', fontWeight: 500 }}>
                                {activeEvent.title} — Edition {selectedEdition.year}
                            </div>
                            {selectedEdition.venue && (
                                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                    Venue: {selectedEdition.venue}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleContinue}
                        disabled={!activeEvent || !selectedYear || availableEditions.length === 0}
                    >
                        <span>Continue to Add Exhibitor</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getEvents, deleteEvent } from './actions';
import { Trash2, Pencil, Plus, CheckCircle, AlertCircle, X, Image as ImageIcon, MapPin, Calendar, Loader2 } from 'lucide-react';
import styles from '../admin.module.css';
import Link from 'next/link';
import FeaturedToggle from './FeaturedToggle';

const Snackbar = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', backgroundColor: bgColor, color: 'white',
            padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
        </div>
    );
};

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [snackbar, setSnackbar] = useState(null);

    const fetchEvents = React.useCallback(async () => {
        setIsLoading(true);
        const res = await getEvents();
        if (res.success) {
            setEvents(res.data);
        } else {
            console.error(res.error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        setDeletingId(id);
        const formData = new FormData();
        formData.append('id', id);
        const res = await deleteEvent(formData);

        if (res.success) {
            setSnackbar({ message: 'Event deleted', type: 'success' });
            fetchEvents();
        } else {
            setSnackbar({ message: 'Failed to delete event', type: 'error' });
        }
        setDeletingId(null);
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Events</h1>
                    <p className={styles.pageSubtitle}>Manage your upcoming events schedule</p>
                </div>
                <Link href="/admin/events/new" className={styles.btnAddNew}>
                    <Plus size={18} /> Add New Event
                </Link>
            </div>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading events...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Event Details</th>
                                <th style={{ width: '150px' }}>Location</th>
                                <th style={{ width: '120px' }}>Date</th>
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '120px' }}>Featured</th>
                                <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState} style={{ padding: '3rem' }}>No events found.</td></tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.id}>
                                        <td>
                                            <div className={styles.itemContent}>
                                                <div className={styles.thumbnailMd}>
                                                    {event.image ? (
                                                        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <ImageIcon size={20} style={{ margin: 'auto', display: 'block', height: '100%', opacity: 0.3 }} />
                                                    )}
                                                </div>
                                                <div style={{ marginLeft: '12px' }}>
                                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>{event.title}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{event.time}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={14} /> {event.location}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <Calendar size={14} /> {event.month} {event.date}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{event.year}</span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                                                backgroundColor: event.status === 'COMPLETED' ? '#ecfdf5' : '#eff6ff',
                                                color: event.status === 'COMPLETED' ? '#10b981' : '#3b82f6',
                                                border: `1px solid ${event.status === 'COMPLETED' ? '#a7f3d0' : '#bfdbfe'}`
                                            }}>
                                                {event.status || 'UPCOMING'}
                                            </span>
                                        </td>
                                        <td>
                                            <FeaturedToggle eventId={event.id} isFeatured={event.isFeatured} />
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <Link href={`/admin/events/${event.id}`} className={styles.btnIcon} title="Edit">
                                                    <Pencil size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className={styles.btnIcon}
                                                    style={{
                                                        color: '#ef4444',
                                                        backgroundColor: '#fef2f2',
                                                        borderColor: '#fee2e2',
                                                        cursor: deletingId === event.id ? 'not-allowed' : 'pointer',
                                                        opacity: deletingId === event.id ? 0.7 : 1
                                                    }}
                                                    disabled={deletingId === event.id}
                                                    title="Delete"
                                                >
                                                    {deletingId === event.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

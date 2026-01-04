import prisma from '@/lib/db';
import { addEvent, deleteEvent } from './actions';
import { Trash2, Pencil, Plus } from 'lucide-react';
import styles from '../admin.module.css';
import Link from 'next/link';
import DeleteEventButton from './DeleteEventButton';
import FeaturedToggle from './FeaturedToggle';

import { updateEventStatuses } from '@/lib/eventUtils';

export default async function EventsPage() {
    await updateEventStatuses();

    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Events</h1>
                    <p className={styles.pageSubtitle}>Manage your upcoming events schedule</p>
                </div>
                <Link href="/admin/events/new" className={styles.btnAddNew}>
                    <Plus size={18} />
                    Add New Event
                </Link>

            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Event Details</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Featured</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td>
                                    <div className={styles.itemContent}>
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className={styles.itemImage} />
                                        ) : (
                                            <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                Img
                                            </div>
                                        )}
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{event.title}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{event.time}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{event.location}</td>
                                <td>
                                    <span style={{ fontWeight: 500 }}>{event.month} {event.date}</span>
                                </td>
                                <td>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: event.status === 'COMPLETED' ? '#ecfdf5' : '#eff6ff',
                                        color: event.status === 'COMPLETED' ? '#10b981' : '#3b82f6',
                                    }}>
                                        {event.status || 'UPCOMING'}
                                    </span>
                                </td>
                                <td>
                                    <FeaturedToggle eventId={event.id} isFeatured={event.isFeatured} />
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/events/${event.id}`} className={styles.btnIcon} title="Edit">
                                            <Pencil size={18} />
                                        </Link>
                                        <DeleteEventButton id={event.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {events.length === 0 && (
                    <div className={styles.emptyState}>
                        No events found. Click &quot;Add New Event&quot; to create one.
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Clock, Ticket } from 'lucide-react';
import styles from './UpcomingEvents.module.css';
import { useTheme } from '@/context/ThemeContext';

const UpcomingEvents = ({ events }) => {
    const { theme } = useTheme();
    const eventList = events || [];

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <span className={styles.label}>Mark Your Calendar</span>
                        <h2 className={styles.title}>
                            Upcoming <span className={styles.highlight}>Events</span>
                        </h2>
                        <p className={styles.description}>
                            Join us at our upcoming productions. Experience the magic firsthand.
                        </p>
                    </div>
                    <Link href="/events">
                        <button className={styles.viewAllBtn}>
                            View All Events <ArrowRight size={18} style={{ marginLeft: '0.5rem', transition: 'transform 0.3s' }} className="group-hover:translate-x-1" />
                        </button>
                    </Link>
                </div>

                {/* Events Grid/List */}
                <div className={styles.eventList}>
                    {eventList.map((event) => (
                        <div key={event.id} className={styles.eventCard}>

                            {/* Image */}
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={styles.eventImage}
                                />
                                <div className={styles.imageOverlay}></div>
                            </div>

                            {/* Date Block */}
                            <div className={styles.dateBlock}>
                                <span className={styles.month}>{event.month}</span>
                                <span className={styles.date}>{event.date}</span>
                            </div>

                            {/* Info */}
                            <div className={styles.eventInfo}>
                                <h3 className={styles.eventTitle}>
                                    {event.title}
                                </h3>
                                <div className={styles.eventMeta}>
                                    <span className={styles.metaItem}><MapPin size={16} className={styles.metaIcon} /> {event.location}</span>
                                    <span className={styles.divider}>|</span>
                                    <span className={styles.metaItem}><Clock size={16} className={styles.metaIcon} /> {event.time}</span>
                                </div>

                                {/* Organizer Info */}
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {event.organizer && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>Organized By:</span>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{event.organizer}</span>
                                        </div>
                                    )}
                                    {event.managedBy && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>Managed By:</span>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{event.managedBy}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className={styles.ticketBtnWrapper} style={{ display: 'flex', gap: '10px' }}>
                                <Link
                                    href={`/events/${event.id}`}
                                    className={styles.ticketBtn}
                                    style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', textDecoration: 'none' }}
                                >
                                    View Details
                                </Link>
                                <Link
                                    href={`/events/${event.id}`}
                                    className={styles.ticketBtn}
                                    style={{ flex: 1, textDecoration: 'none' }}
                                >
                                    <Ticket size={18} />
                                    Tickets
                                </Link>
                            </div>

                        </div>
                    ))}
                    {eventList.length === 0 && (
                        <div className={styles.noEvents}>
                            <p>No upcoming events at the moment. Stay tuned!</p>
                        </div>
                    )}
                </div>

                <div className={styles.mobileBtnWrapper}>
                    <Link href="/events">
                        <button className={styles.mobileBtn}>
                            View All Events <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </Link>
                </div>

            </div>

        </section >
    );
};

export default UpcomingEvents;

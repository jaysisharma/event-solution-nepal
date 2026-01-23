'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Ticket } from 'lucide-react';
import styles from './UpcomingEvents.module.css';
import { useTheme } from '@/context/ThemeContext';

const EventsListClient = ({ events }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedEvent, setSelectedEvent] = useState(null);

    const upcomingEvents = events.filter(e => e.status === 'UPCOMING');
    const pastEvents = events.filter(e => e.status === 'COMPLETED');

    const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

    const handleTicketClick = (e) => {
        e.preventDefault();
        const androidPackage = "com.nepatronix.eventsolutions";
        const playStoreUrl = `https://play.google.com/store/apps/details?id=${androidPackage}&hl=en`;
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isAndroid = /android/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        if (isAndroid) {
            window.location.href = playStoreUrl;
        } else if (isIOS) {
            alert("The iOS App is coming soon! Please stay tuned.");
        } else {
            window.open(playStoreUrl, '_blank');
        }
    };

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} style={{ paddingTop: '0' }}>
            <div className={styles.container}>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '3rem',
                    borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                    paddingBottom: '1rem',
                    marginTop: '2rem',
                }}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: activeTab === 'upcoming' ? 'var(--secondary)' : 'transparent',
                            color: activeTab === 'upcoming' ? 'white' : 'var(--foreground)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                    >
                        Upcoming Events ({upcomingEvents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: activeTab === 'past' ? 'var(--secondary)' : 'transparent',
                            color: activeTab === 'past' ? 'white' : 'var(--foreground)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                    >
                        Past Events ({pastEvents.length})
                    </button>
                </div>

                <div className={styles.eventList}>
                    {displayedEvents.map((event) => (
                        <div key={event.id} className={styles.eventCard}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={event.image || '/images/placeholder-event.jpg'}
                                    alt={event.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={styles.eventImage}
                                />
                                <div className={styles.imageOverlay}></div>
                            </div>

                            <div className={styles.dateBlock}>
                                <span className={styles.month}>{event.month}</span>
                                <span className={styles.date}>{event.date}</span>
                            </div>

                            <div className={styles.eventInfo}>
                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                <div className={styles.eventMeta}>
                                    <span className={styles.metaItem}><MapPin size={16} className={styles.metaIcon} /> {event.location}</span>
                                    {event.time && (
                                        <>
                                            <span className={styles.divider}>|</span>
                                            <span className={styles.metaItem}><Clock size={16} className={styles.metaIcon} /> {event.time}</span>
                                        </>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                    {event.organizer && <div><strong>Organized By:</strong> {event.organizer}</div>}
                                </div>
                            </div>

                            <div className={styles.ticketBtnWrapper} style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setSelectedEvent(event)}
                                    className={styles.ticketBtn}
                                    style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                                >
                                    Details
                                </button>
                                {activeTab === 'upcoming' && (
                                    <a href="#" onClick={handleTicketClick} className={styles.ticketBtn} style={{ flex: 1 }}>
                                        <Ticket size={18} /> Tickets
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {displayedEvents.length === 0 && (
                        <div className={styles.noEvents}>
                            <p>No {activeTab} events found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Reusing the same style as UpcomingEvents.js */}
            {selectedEvent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedEvent(null)}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                            <Image src={selectedEvent.image} alt={selectedEvent.title} fill style={{ objectFit: 'cover' }} />
                            <button onClick={() => setSelectedEvent(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>✕</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>{selectedEvent.month} {selectedEvent.date}, {selectedEvent.year}</span>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#1E293B' }}>{selectedEvent.title}</h2>
                            <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '0.9rem', marginBottom: '24px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {selectedEvent.location}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {selectedEvent.time}</span>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization Details</h4>
                                {selectedEvent.organizer && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}><span style={{ color: '#64748B' }}>Organized By:</span><span style={{ fontWeight: 500, color: '#1E293B' }}>{selectedEvent.organizer}</span></div>}
                                {selectedEvent.managedBy && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span style={{ color: '#64748B' }}>Managed By:</span><span style={{ fontWeight: 500, color: '#1E293B' }}>{selectedEvent.managedBy}</span></div>}
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: '#1E293B' }}>About Event</h4>
                            <p style={{ lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap' }}>{selectedEvent.description || "No description available for this event."}</p>
                            {selectedEvent.status === 'UPCOMING' && (
                                <div style={{ marginTop: '32px' }}>
                                    <Link
                                        href={`/events/${selectedEvent.id}`}
                                        style={{ display: 'block', width: '100%', backgroundColor: '#2563EB', color: 'white', textAlign: 'center', padding: '14px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                        Get Tickets
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EventsListClient;

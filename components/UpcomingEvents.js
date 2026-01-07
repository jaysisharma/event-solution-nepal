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
    const [selectedEvent, setSelectedEvent] = React.useState(null);

    const handleTicketClick = (e, eventLink) => {
        e.preventDefault();
        const androidPackage = "com.nepatronix.eventsolutions";
        // Direct Play Store URL is more reliable than intent:// on modern Android browsers
        const playStoreUrl = `https://play.google.com/store/apps/details?id=${androidPackage}&hl=en`;

        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isAndroid = /android/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        if (isAndroid) {
            // Opening the HTTPS link will automatically trigger the Play Store app if installed
            window.location.href = playStoreUrl;
        } else if (isIOS) {
            // Placeholder for iOS until app is available
            alert("The iOS App is coming soon! Please stay tuned.");
        } else {
            // Desktop/Other: Open Play Store in new tab
            window.open(playStoreUrl, '_blank');
        }
    };

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
                                <button
                                    onClick={() => setSelectedEvent(event)}
                                    className={styles.ticketBtn}
                                    style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155' }}
                                >
                                    View Details
                                </button>
                                <a
                                    href="#"
                                    onClick={(e) => handleTicketClick(e)}
                                    className={styles.ticketBtn}
                                    style={{ flex: 1 }}
                                >
                                    <Ticket size={18} />
                                    Tickets
                                </a>
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

            {/* Modal */}
            {selectedEvent && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            animation: 'scaleIn 0.3s ease'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header Image */}
                        <div style={{ position: 'relative', height: 'auto', width: '100%' }}>
                            <Image
                                src={selectedEvent.image}
                                alt={selectedEvent.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 800px"
                                style={{ objectFit: 'cover' }}
                            />
                            <button
                                onClick={() => setSelectedEvent(null)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '24px' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                borderRadius: '100px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                marginBottom: '12px'
                            }}>
                                {selectedEvent.month} {selectedEvent.date}
                            </span>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#1E293B' }}>
                                {selectedEvent.title}
                            </h2>

                            <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '0.9rem', marginBottom: '24px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={16} /> {selectedEvent.location}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={16} /> {selectedEvent.time}
                                </span>
                            </div>

                            <div style={{
                                backgroundColor: '#F8FAFC',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #E2E8F0'
                            }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Organization Details
                                </h4>
                                {selectedEvent.organizer && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#64748B' }}>Organized By:</span>
                                        <span style={{ fontWeight: 500, color: '#1E293B' }}>{selectedEvent.organizer}</span>
                                    </div>
                                )}
                                {selectedEvent.managedBy && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#64748B' }}>Managed By:</span>
                                        <span style={{ fontWeight: 500, color: '#1E293B' }}>{selectedEvent.managedBy}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: '#1E293B' }}>About Event</h4>
                                <p style={{ lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                    {selectedEvent.description || "No description available for this event."}
                                </p>
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <a
                                    href="#"
                                    onClick={handleTicketClick}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        backgroundColor: '#2563EB',
                                        color: 'white',
                                        textAlign: 'center',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    Get Tickets via App
                                </a>
                            </div>
                        </div>
                    </div>
                    <style jsx global>{`
                        @keyframes scaleIn {
                            from { transform: scale(0.95); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </section>
    );
};

export default UpcomingEvents;

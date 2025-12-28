"use client";
import React from 'react';
import { ArrowRight, MapPin, Clock, Ticket } from 'lucide-react';
import styles from './UpcomingEvents.module.css';

const UpcomingEvents = ({ events }) => {
    const eventList = events || [];

    return (
        <section className={styles.section}>
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
                    <button className={styles.viewAllBtn}>
                        View All Events <ArrowRight size={18} style={{ marginLeft: '0.5rem', transition: 'transform 0.3s' }} className="group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Events Grid/List */}
                <div className={styles.eventList}>
                    {eventList.map((event) => (
                        <div key={event.id} className={styles.eventCard}>

                            {/* Image */}
                            <div className={styles.imageWrapper}>
                                <img
                                    src={event.image}
                                    alt={event.title}
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
                            </div>

                            {/* Button */}
                            <div className={styles.ticketBtnWrapper}>
                                <button className={styles.ticketBtn}>
                                    <Ticket size={18} />
                                    Get Tickets
                                </button>
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
                    <button className={styles.mobileBtn}>
                        View All Events <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default UpcomingEvents;

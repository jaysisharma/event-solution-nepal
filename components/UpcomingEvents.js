"use client";
import React from 'react';
import { ArrowRight, MapPin, Clock, Ticket } from 'lucide-react';
import styles from './UpcomingEvents.module.css';

const UpcomingEvents = () => {
    const events = [
        {
            id: 1,
            date: "12",
            month: "OCT",
            title: "Global Tech Summit 2025",
            location: "San Francisco, CA",
            time: "09:00 AM - 06:00 PM",
            image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 2,
            date: "28",
            month: "NOV",
            title: "Neon Music Festival",
            location: "Miami, FL",
            time: "04:00 PM - 02:00 AM",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 3,
            date: "15",
            month: "DEC",
            title: "Startup Charity Gala",
            location: "New York, NY",
            time: "07:00 PM - 11:00 PM",
            image: "https://images.unsplash.com/photo-1519671482502-9759101d4561?q=80&w=1000&auto=format&fit=crop"
        }
    ];

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
                    {events.map((event) => (
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

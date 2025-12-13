"use client";
import React from 'react';
import { ArrowRight, MapPin, Clock, Ticket } from 'lucide-react';
import styles from './UpcomingEvents.module.css';

const UpcomingEvents = () => {
    const events = [
        {
            id: 1,
            date: "14",
            month: "APR",
            title: "Nepali New Year 2082 Celebration",
            location: "Hotel Yak & Yeti, Kathmandu",
            time: "06:00 PM - 12:00 AM",
            image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 2,
            date: "25",
            month: "MAY",
            title: "Kathmandu Music Festival",
            location: "Tudikhel Ground, Kathmandu",
            time: "02:00 PM - 10:00 PM",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 3,
            date: "10",
            month: "JUN",
            title: "Pokhara Corporate Retreat",
            location: "Lakeside, Pokhara",
            time: "09:00 AM - 05:00 PM",
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

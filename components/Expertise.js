"use client";
import React from 'react';
import { Calendar, Layers, Sparkles, Briefcase, PartyPopper, Speaker, ArrowUpRight, ArrowRight } from 'lucide-react';
import styles from './Expertise.module.css';

const Expertise = () => {
    const services = [
        {
            id: 0,
            title: "Event Planning & Concept Development",
            subtitle: "Stress-Free Planning",
            image: "/services/event_management.png",
            icon: Calendar,
        },
        {
            id: 1,
            title: "Marketing & Promotion",
            subtitle: "Premium Equipment",
            image: "/services/marketing.png",
            icon: Layers,
        },
        {
            id: 2,
            title: "Event Organizer",
            subtitle: "Aesthetic Excellence",
            image: "/services/organizer.png",
            icon: Sparkles,
        },
        {
            id: 3,
            title: "Pre & Post-Event Management",
            subtitle: "Professional Impact",
            image: "/services/preandpost.png",
            icon: Briefcase,
        },
        {
            id: 4,
            title: "Event Rentals",
            subtitle: "Unforgettable Moments",
            image: "/services/event_rentals.png",
            icon: PartyPopper,
        },
        {
            id: 5,
            title: "Production & Execution",
            subtitle: "Technical Mastery",
            image: "/services/production.png",
            icon: Speaker,
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* Section Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        {/* <span className={styles.label}>Our Expertise</span> */}
                        <h2 className={styles.title}>
                            Our Core <span className={styles.highlight}>Services</span>
                        </h2>
                        <p className={styles.description}>
                            Services provided by event solution that put a real impact on your event.
                        </p>
                    </div>

                </div>

                {/* Grid Layout */}
                <div className={styles.grid}>
                    {services.map((service) => (
                        <div key={service.id} className={`${styles.card} service-card`}>

                            {/* Background Image */}
                            <img
                                src={service.image}
                                alt={service.title}
                                className={styles.bgImage}
                            />

                            {/* Overlay Gradient */}
                            <div className={styles.overlay}></div>

                            {/* Floating Icon Badge */}
                            <div className={styles.iconBadge}>
                                <service.icon size={20} />
                            </div>

                            {/* Content */}
                            <div className={styles.cardContent}>
                                <div className={styles.subtitleWrapper}>
                                    <div className={styles.line}></div>
                                    <span className={styles.subtitle}>{service.subtitle}</span>
                                </div>

                                <h3 className={styles.cardTitle}>
                                    {service.title}
                                </h3>

                                {/* <div className={styles.explore}>
                                    <span>Explore Service</span>
                                    <div className={styles.arrowCircle}>
                                        <ArrowUpRight size={14} />
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.mobileBtn}>
                    <button className={styles.btn}>
                        View All Services <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Expertise;

"use client";
import React from 'react';
import { Calendar, Layers, Sparkles, Briefcase, PartyPopper, Speaker, ArrowUpRight, ArrowRight } from 'lucide-react';
import styles from './Expertise.module.css';

const Expertise = () => {
    const services = [
        {
            id: 0,
            title: "Event Management",
            subtitle: "Stress-Free Planning",
            image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop",
            icon: Calendar,
        },
        {
            id: 1,
            title: "Event Rentals",
            subtitle: "Premium Equipment",
            image: "https://chiceventrentals.com/images/tile-tenting.jpg",
            icon: Layers,
        },
        {
            id: 2,
            title: "Decoration & Lighting",
            subtitle: "Aesthetic Excellence",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
            icon: Sparkles,
        },
        {
            id: 3,
            title: "Corporate Events",
            subtitle: "Professional Impact",
            image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop",
            icon: Briefcase,
        },
        {
            id: 4,
            title: "Wedding Planning",
            subtitle: "Unforgettable Moments",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
            icon: PartyPopper,
        },
        {
            id: 5,
            title: "Sound & Stage Setup",
            subtitle: "Technical Mastery",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
            icon: Speaker,
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* Section Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <span className={styles.label}>Our Expertise</span>
                        <h2 className={styles.title}>
                            Designed for <span className={styles.highlight}>Impact</span>
                        </h2>
                        <p className={styles.description}>
                            Explore our comprehensive range of services crafted to elevate every occasion.
                        </p>
                    </div>
                    <div className={styles.seeAll}>
                        <a href="#" className={styles.seeAllLink}>
                            See All Categories <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                        </a>
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

                                <div className={styles.explore}>
                                    <span>Explore Service</span>
                                    <div className={styles.arrowCircle}>
                                        <ArrowUpRight size={14} />
                                    </div>
                                </div>
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

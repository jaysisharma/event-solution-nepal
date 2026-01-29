"use client";
import React, { useRef } from 'react';
import { Calendar, Layers, Sparkles, Briefcase, PartyPopper, Speaker, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from './MagneticButton';
import styles from './Expertise.module.css';
import { useTheme } from '@/context/ThemeContext';
import JsonLd from './JsonLd';

gsap.registerPlugin(ScrollTrigger);

const Expertise = () => {
    const { theme } = useTheme();
    const container = useRef(null);
    const cardsRef = useRef([]);

    const services = [
        {
            id: 0,
            title: "Event Planning & Concept Development",
            subtitle: "Visionary Strategy",
            image: "/services/event_planning_concept_v3.png",
            icon: Calendar,
        },
        {
            id: 1,
            title: "Marketing & Promotion",
            subtitle: "Strategic Reach",
            image: "/services/marketing_promotion_v3.png",
            icon: Layers,
        },
        {
            id: 2,
            title: "Event Organizer",
            subtitle: "Seamless Management",
            image: "/services/event_organizer_v2.png",
            icon: Sparkles,
        },
        {
            id: 3,
            title: "Pre & Post-Event Management",
            subtitle: "Full Cycle Support",
            image: "/services/pre_post_management_v3.png",
            icon: Briefcase,
        },
        {
            id: 4,
            title: "Event Rentals",
            subtitle: "Premium Inventory",
            image: "/services/event_rentals_v4.png",
            icon: PartyPopper,
        },
        {
            id: 5,
            title: "Production & Execution",
            subtitle: "Technical Precision",
            image: "/services/production_v6.png",
            icon: Speaker,
        }
    ];

    useGSAP(() => {
        let mm = gsap.matchMedia();

        mm.add("(min-width: 0px)", () => {
            const cards = cardsRef.current;
            const totalCards = cards.length;

            cards.forEach((card, index) => {
                if (!card) return;

                ScrollTrigger.create({
                    trigger: card,
                    start: "top top+=120",
                    end: "bottom bottom",
                    endTrigger: container.current,
                    pin: true,
                    pinSpacing: false,
                    id: `service-card-${index}`,
                });

                if (index < totalCards - 1) {
                    const nextCard = cards[index + 1];
                    gsap.to(card, {
                        scale: 0.95,
                        filter: "brightness(0.5)", // Darken previous cards more for this design
                        scrollTrigger: {
                            trigger: nextCard,
                            start: "top top+=200",
                            end: "top top+=120",
                            scrub: true,
                        }
                    });
                }
            });
        });

    }, { scope: container });

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.container}>
                {/* Section Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.title}>
                            Our Core <span className={styles.highlight}>Services</span>
                        </h2>
                        <p className={styles.description}>
                            Services provided by event solution that put a real impact on your event.
                        </p>
                    </div>
                </div>

                {/* Stacking Cards Wrapper (formerly grid) */}
                <div className={styles.grid} ref={container}>
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            className={`${styles.card} service-card`}
                            ref={el => cardsRef.current[index] = el}
                        >
                            {/* Background Image */}
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className={styles.bgImage}
                                style={{ objectFit: 'cover' }}
                            />

                            {/* Overlay Gradient */}
                            <div className={styles.overlay}></div>

                            {/* Content Structure */}
                            <div className={styles.contentBody}>
                                {/* Floating Icon Badge */}
                                <div className={styles.iconBadge}>
                                    <service.icon size={20} />
                                </div>

                                <div className={styles.subtitleWrapper}>
                                    <div className={styles.line}></div>
                                    <span className={styles.subtitle}>{service.subtitle}</span>
                                </div>

                                <h3 className={styles.cardTitle}>
                                    {service.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.mobileBtn}>
                    <MagneticButton>
                        <Link href="/services" className={styles.btn}>
                            View All Services <ArrowRight size={20} style={{ marginLeft: '0.75rem' }} />
                        </Link>
                    </MagneticButton>
                </div>
            </div>


            {/* Service Schema for SEO */}
            <JsonLd data={services.map(service => ({
                "@context": "https://schema.org",
                "@type": "Service",
                "name": service.title,
                "description": `${service.subtitle} - Professional ${service.title} services in Kathmandu, Lalitpur, and Bhaktapur.`,
                "provider": {
                    "@type": "Organization",
                    "name": "Event Solution Nepal",
                    "url": "https://eventsolutionnepal.com.np"
                },
                "areaServed": [
                    { "@type": "City", "name": "Kathmandu" },
                    { "@type": "City", "name": "Lalitpur" },
                    { "@type": "City", "name": "Bhaktapur" }
                ],
                "image": `https://eventsolutionnepal.com.np${service.image}`
            }))} />

        </section >
    );
};

export default Expertise;
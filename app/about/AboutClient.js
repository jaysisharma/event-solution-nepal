"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/Button';
import { Target, Lightbulb, Shield, Heart } from 'lucide-react';
import styles from './about.module.css';

gsap.registerPlugin(ScrollTrigger);

const AboutClient = () => {
    const containerRef = useRef(null);

    const team = [
        { name: "Sunil Bhandari", role: "Chairman", image: "https://eventsolutionnepal.com.np/images/leaders/Sunil.jpg" },
        { name: "Bijay Sagar Pradhan", role: "Managing Director", image: "https://eventsolutionnepal.com.np/images/leaders/Bijay.jpg" },
        { name: "Nabin Bhatta", role: "Marketing Director", image: "https://eventsolutionnepal.com.np/images/leaders/Nabin.jpg" },
        { name: "Vinesh Choradia", role: "IM Director", image: "https://eventsolutionnepal.com.np/images/leaders/Vinesh.jpg" },
        // New Members
        { name: "Anita Sherpa", role: "Creative Lead", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop" },
        { name: "Rajesh Thapa", role: "Logistics Manager", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop" },
        { name: "Meera Joshi", role: "Client Relations", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" },
        { name: "Suresh Tamang", role: "Technical Head", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop" },
    ];

    const values = [
        { id: "01", title: "Precision", desc: "We believe perfection is in the details. Every element is meticulously planned and executed.", icon: Target },
        { id: "02", title: "Creativity", desc: "We don't follow trends; we set them. Innovating constantly to bring fresh concepts to life.", icon: Lightbulb },
        { id: "03", title: "Integrity", desc: "Transparent pricing, honest communication, and delivering exactly what we promise.", icon: Shield },
        { id: "04", title: "Passion", desc: "We love what we do, and that energy resonates in every event we produce.", icon: Heart },
    ];

    useGSAP(() => {
        // Hero Reveal
        gsap.from(`.${styles.heroTitle}`, {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out",
            skewY: 2
        });

        // Story Image Parallax
        gsap.to(`.${styles.storyImage}`, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
                trigger: `.${styles.storySection}`,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Team Fade In
        gsap.utils.toArray(`.${styles.teamCard}`).forEach((card, i) => {
            gsap.from(card, {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%"
                }
            });
        });

    }, { scope: containerRef });

    return (
        <div className={styles.page} ref={containerRef}>

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <h1 className={styles.heroTitle}>
                        <span className={styles.textRed}>Who We</span> <span className={styles.textBlue}>Are</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        We are the architects of memory, crafting moments that define a lifetime.
                    </p>
                </div>
            </section>

            {/* Editorial Story */}
            <section className={styles.storySection}>
                <div className={styles.container}>
                    <div className={styles.storyGrid}>
                        <div>
                            <p className={styles.storyText}>
                                Founded in 2015, Event Solution Nepal began with a singular vision: to transform the ordinary into the extraordinary.
                                <span className={styles.highlight}> What started as a small passionate team has grown into Nepal's premier event management firm.</span>
                            </p>
                            <br />
                            <p className={styles.storyText} style={{ fontSize: '1.25rem', color: '#525252' }}>
                                We bridge the gap between logistical precision and artistic expression. Whether it's a high-stakes corporate summit or an intimate destination wedding,
                                we bring the same level of discipline and flair. We don't just manage events; we design experiences that linger.
                            </p>
                        </div>
                        <div className={styles.storyImageWrapper}>
                            <Image
                                src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"
                                alt="Our Story"
                                fill
                                className={styles.storyImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal Stats */}
            <section className={styles.statsSection}>
                <div className={styles.container}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>10+</span>
                            <span className={styles.statLabel}>Years Experience</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>500+</span>
                            <span className={styles.statLabel}>Events Managed</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>50+</span>
                            <span className={styles.statLabel}>Team Members</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>98%</span>
                            <span className={styles.statLabel}>Client Retention</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Our Core Values</h2>
                    </div>
                    <div className={styles.valuesGrid}>
                        {values.map((val) => (
                            <div key={val.id} className={styles.valueItem}>
                                <div className={styles.iconWrapper}>
                                    <val.icon className={styles.valueIcon} size={32} />
                                </div>
                                <h3 className={styles.valueTitle}>{val.title}</h3>
                                <p className={styles.valueDesc}>{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clean Team Grid */}
            <section className={styles.teamSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Meet The Team</h2>
                        <p className={styles.sectionDesc}>The creative minds and dedicated hands behind your success.</p>
                    </div>
                    <div className={styles.marqueeContainer}>
                        <div className={styles.marqueeTrack}>
                            {/* Duplicate team list for seamless loop */}
                            {[...team, ...team].map((member, index) => (
                                <div key={`${member.name}-${index}`} className={styles.teamCard}>
                                    <div className={styles.memberImageWrapper}>
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className={styles.memberImage}
                                        />
                                    </div>
                                    <h3 className={styles.memberName}>{member.name}</h3>
                                    <p className={styles.memberRole}>{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <hr className={styles.sectionSeparator} />
                </div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <h2 className={styles.ctaTitle}>Join Our Story.</h2>
                    <Button href="/contact" variant="primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
                        Start Your Project
                    </Button>
                </div>
            </section>

        </div>
    );
};

export default AboutClient;

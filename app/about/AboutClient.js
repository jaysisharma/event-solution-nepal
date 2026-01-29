"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/Button';
import { Target, Lightbulb, Shield, Heart } from 'lucide-react';
import styles from './about.module.css';
import { useTheme } from '@/context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const AboutClient = ({ initialTeam, initialAbout }) => {
    const { theme } = useTheme();
    const containerRef = useRef(null);

    const team = initialTeam || [];

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



        // Story Fade Up
        gsap.fromTo(`.${styles.storyText}`,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: `.${styles.storySection}`,
                    start: "top 80%"
                }
            }
        );

        // Stats Stagger
        gsap.fromTo(`.${styles.statItem}`,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                scrollTrigger: {
                    trigger: `.${styles.statsSection}`,
                    start: "top 85%"
                }
            }
        );

        // Values Stagger
        gsap.fromTo(`.${styles.valueItem}`,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: `.${styles.valuesSection}`,
                    start: "top 80%"
                }
            }
        );

        // Team Fade In (Modified to target marquee items if visible/needed, or keep as is)
        // Since Marquee scrolls, maybe skip individual fade for now or keep generic
        // Team Fade In
        gsap.utils.toArray(`.${styles.teamCard}`).forEach((card, i) => {
            gsap.fromTo(card,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    scrollTrigger: {
                        trigger: `.${styles.teamSection}`,
                        start: "top 75%"
                    }
                }
            );
        });

    }, { scope: containerRef });

    return (
        <div className={`${styles.page} ${theme === 'dark' ? styles.dark : ''}`} ref={containerRef}>

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
                                {initialAbout?.subtitle || "Founded in 2014, Event Solution Nepal has been creating meaningful and memorable events for over a decade bringing your vision to life with care, creativity, and professionalism."}
                            </p>
                            <br />
                            <div className={styles.storyText} style={{ fontSize: '1.25rem', color: '#525252' }}>
                                {initialAbout?.description ? (
                                    <p style={{ whiteSpace: 'pre-line' }}>{initialAbout.description}</p>
                                ) : (
                                    <p>
                                        We bridge the gap between logistical precision and artistic expression. Whether it&apos;s a high-stakes corporate summit or an intimate destination wedding,
                                        we bring the same level of discipline and flair. We don&apos;t just manage events; we design experiences that linger.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.storyImageWrapper}>
                            <Image
                                src={initialAbout?.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"}
                                alt={initialAbout?.title || "Our Story"}
                                fill
                                className={styles.storyImage}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
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

            {/* Clean Team Grid with Marquee */}
            <section className={styles.teamSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Meet The Team</h2>
                        <p className={styles.sectionDesc}>The creative minds and dedicated hands behind your success.</p>
                    </div>

                    {/* Marquee Container */}
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
                                            className={`${styles.memberImage} ${member.name.includes('Vinesh') ? styles.noZoom : ''}`}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                                        />
                                    </div>
                                    <h3 className={styles.memberName}>{member.name}</h3>
                                    <p className={styles.memberRole}>{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Separator */}
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

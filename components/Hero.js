'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play, Star, ShieldCheck, Globe, Users, Heart, Trophy, Building, PartyPopper, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import MagneticButton from './MagneticButton';
import { useTheme } from '@/context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
    Star: Star,
    Heart: Heart,
    Trophy: Trophy,
    ShieldCheck: ShieldCheck,
    Users: Users,
    Globe: Globe,
    Building: Building,
    PartyPopper: PartyPopper
};

const TrustBadge = ({ icon: Icon, text }) => (
    <div className={styles.trustBadge}>
        <Icon size={14} className={styles.badgeIcon} />
        <span className={styles.badgeText}>{text}</span>
    </div>
);

// PARTNERS constant removed


// Helper to determine status from date string
const calculateEventStatus = (dateStr, currentStatus) => {
    if (!dateStr) return currentStatus;

    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Compare against start of today

        // 1. Strict ISO Date check (YYYY-MM-DD) - Works everywhere if parsed manually
        const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) {
            const [_, y, m, d] = isoMatch;
            const eventDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            if (eventDate < now) return 'COMPLETED';
            return 'UPCOMING';
        }

        // 2. Handle ranges or other formats
        let datePart = dateStr;

        // processing logic: if it contains " - " (range), take the last part
        if (dateStr.includes(' - ')) {
            const parts = dateStr.split(' - ');
            datePart = parts[parts.length - 1].trim();
        }
        // fallback for other hyphenated ranges that are NOT ISO dates
        else if (dateStr.includes('-') && !isoMatch) {
            const parts = dateStr.split('-');
            // Check if the split destroyed a date (e.g. Jan 12-15).
            // If the last part is just a number (e.g. "15"), we need more context.
            // But if specific format "Jan 12-Jan 15", it works.
            const lastPart = parts[parts.length - 1].trim();
            if (!lastPart.match(/^\d+$/)) {
                datePart = lastPart;
            }
        }

        // 3. Try parsing
        // Replace hyphens in non-ISO strings with slashes for Safari compatibility (e.g. "05-12-2025")
        // though usually "Month DD YYYY" is best.
        let safeDateStr = datePart;
        // If it looks like MM-DD-YYYY or DD-MM-YYYY using hyphens, swap to slashes
        if (safeDateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
            safeDateStr = safeDateStr.replace(/-/g, '/');
        }

        const eventDate = new Date(safeDateStr);
        if (!isNaN(eventDate.getTime())) {
            if (eventDate < now) return 'COMPLETED';
        }
    } catch (e) {
        console.error("Date parse error", e);
    }

    return currentStatus;
};

const Hero = ({ partners, partnerLogos, slides }) => {
    const { theme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const taglineRef = useRef(null);
    const headingRef = useRef(null);
    const subtextRef = useRef(null);
    const buttonsRef = useRef(null);
    const rightContentRef = useRef(null);

    const partnerList = (partners && partners.length > 0) ? partners.map(p => p.name) : [];
    const dbImages = partners?.filter(p => p.image).map(p => p.image) || [];
    const allLogos = [...dbImages, ...(partnerLogos || [])];
    const hasLogos = allLogos.length > 0;
    const itemsToRender = hasLogos ? allLogos : partnerList;

    // defaultImages removed


    const heroContent = (slides && slides.length > 0) ? slides.map(s => ({
        src: s.image,
        label: s.label,
        title: s.title,
        rating: s.rating || "4.9",
        ratingLabel: s.ratingLabel || "Average Rating",
        ratingIcon: s.ratingIcon || "Star",
        capacity: s.capacity || "Handling events up to 10k guests.",
        capacityLabel: s.capacityLabel || "Capacity",
        capacityIcon: s.capacityIcon || "Users",
        showStats: s.showStats,
        status: calculateEventStatus(s.eventDate, s.status),
        eventDate: s.eventDate
    })) : [];

    const activeSlide = heroContent[currentIndex];

    useEffect(() => {
        if (heroContent.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroContent.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroContent.length]);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true });

        if (taglineRef.current) {
            gsap.set([taglineRef.current, headingRef.current, subtextRef.current, buttonsRef.current, rightContentRef.current], { y: 50, opacity: 0 });
            tl.to(taglineRef.current, { y: 0, opacity: 1, duration: 0.8 })
                .to(headingRef.current, { y: 0, opacity: 1, duration: 1 }, "-=0.4")
                .to(subtextRef.current, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
                .to(buttonsRef.current, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
                .to(rightContentRef.current, { y: 0, opacity: 1, duration: 1 }, "-=0.8");
        }

        const runAnimation = () => { tl.play(); };

        const preloaderShown = sessionStorage.getItem("preloaderShown");
        if (preloaderShown) {
            runAnimation();
        } else {
            const handlePreloaderComplete = () => { runAnimation(); };
            window.addEventListener('preloader-complete', handlePreloaderComplete);
            return () => { window.removeEventListener('preloader-complete', handlePreloaderComplete); };
        }
    }, { scope: containerRef });

    return (
        <div className={`${styles.hero} ${theme === 'dark' ? styles.dark : ''}`} ref={containerRef} suppressHydrationWarning>
            <div className={styles.contentWrapper}>
                <div className={styles.flexContainer}>
                    {/* Left Content */}
                    <div className={styles.leftContent}>
                        <span className={styles.tagline} ref={taglineRef}>Be a guest at your own event</span>
                        <h1 className={styles.heading} ref={headingRef}>
                            Events that <br />
                            <span className={styles.highlightBlue}>Inspire</span> & <span className={styles.highlightRed}>Delight</span>
                        </h1>

                        <p className={styles.subtext} ref={subtextRef}>
                            Founded in 2014 A.D , Event Solution Nepal has been creating meaningful and memorable events for over a decade bringing your vision to life with care, creativity, and professionalism.
                        </p>

                        <div className={styles.buttonGroup} ref={buttonsRef}>
                            <MagneticButton>
                                <Link href="/quote" className={styles.btnPrimary}>
                                    Plan Your Event
                                    <ArrowRight size={18} className={styles.arrowIcon} />
                                </Link>
                            </MagneticButton>

                            <MagneticButton>
                                <Link href="/projects" className={styles.btnSecondary}>
                                    <div className={styles.playIconWrapper}>
                                        <Play size={10} className={styles.playIcon} />
                                    </div>
                                    See Our Work
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>

                    {/* Right Visuals */}
                    <div className={styles.rightContent} ref={rightContentRef}>
                        <div className={styles.imageContainer}>
                            <div className={styles.mainImageWrapper}>
                                {heroContent.map((img, index) => {
                                    // Optimization: Only render the current, previous, and next slides
                                    // This prevents loading all 9+ high-res images at once which crashes iOS
                                    const len = heroContent.length;
                                    const isCurrent = index === currentIndex;
                                    const isNext = index === (currentIndex + 1) % len;
                                    const isPrev = index === (currentIndex - 1 + len) % len;
                                    const shouldRender = isCurrent || isNext || isPrev;

                                    return (
                                        <div
                                            key={index}
                                            className={`${styles.fadingSlide} ${index === currentIndex ? styles.activeSlide : ''}`}
                                        >
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                {shouldRender && (
                                                    <Image
                                                        src={img.src}
                                                        alt={img.title}
                                                        fill
                                                        priority={index === 0}
                                                        sizes="100vw"
                                                        className={styles.mainImage}
                                                        quality={90}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.imageOverlay}></div>
                                            <div className={styles.imageText}>
                                                <p className={styles.imageLabel}>{img.label}</p>
                                                <p className={styles.imageTitle}>{img.title}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Floating Elements - Status Card */}
                            {(activeSlide?.status || activeSlide?.eventDate) && (
                                <div className={styles.statusFloatCard}>
                                    <div className={`${styles.statusPill} ${activeSlide.status === 'UPCOMING' ? styles.pillUpcoming : styles.pillCompleted}`}>
                                        <span className={styles.statusDot}></span>
                                        {activeSlide.status || "EVENT"}
                                    </div>
                                    <div className={styles.dateLarge}>
                                        {activeSlide.eventDate || "Date TBA"}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Decorative Circle Behind */}
                        <div className={styles.decorativeCircle1}></div>
                        <div className={styles.decorativeCircle2}></div>
                    </div>
                </div>
            </div>

            {/* Ticker */}
            <div className={styles.tickerStrip}>
                <div className={styles.tickerTrack}>
                    {[0, 1].map((setIndex) => (
                        <div key={setIndex} className={styles.tickerContent}>
                            {itemsToRender.map((item, index) => {
                                if (hasLogos) {
                                    return (
                                        <div key={`${setIndex}-${index}`} className={styles.logoWrapper} style={{ height: '60px', position: 'relative', width: '120px', margin: '0 2rem' }}>
                                            <Image
                                                src={item}
                                                alt="Partner Logo"
                                                fill
                                                sizes="120px"
                                                className={styles.partnerLogo}
                                                style={{ objectFit: 'contain', scale: '1.8' }}
                                            />
                                        </div>
                                    )
                                } else {
                                    const fontStyle = [styles.sans, styles.italic][index % 4];
                                    return (
                                        <span key={`${setIndex}-${index}`} className={`${styles.brandLogo} ${fontStyle}`}>
                                            {item}
                                        </span>
                                    );
                                }
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;

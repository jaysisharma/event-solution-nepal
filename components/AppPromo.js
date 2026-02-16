"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGooglePlay, FaApple } from 'react-icons/fa';
import styles from './AppPromo.module.css';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from '@/context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const AppPromo = () => {
    const { theme } = useTheme();

    const handleGooglePlayClick = (e) => {
        e.preventDefault();
        const androidPackage = "com.nepatronix.eventsolutions";
        const playStoreUrl = `https://play.google.com/store/apps/details?id=${androidPackage}&hl=en`;

        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isAndroid = /android/i.test(userAgent);

        if (isAndroid) {
            // Direct HTTPS link handles the intent automatically on modern Android
            window.location.href = playStoreUrl;
        } else {
            window.open(playStoreUrl, '_blank');
        }
    };

    useGSAP(() => {
        gsap.fromTo(
            `.${styles.content}`,
            { x: -50, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: `.${styles.section}`,
                    start: "top 70%",
                },
            }
        );

        gsap.fromTo(
            `.${styles.imageWrapper}`,
            { x: 50, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                delay: 0.3,
                scrollTrigger: {
                    trigger: `.${styles.section}`,
                    start: "top 70%",
                },
            }
        );

    });

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} id="get-app" suppressHydrationWarning>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>
                        Event Solution Nepal is Now on Mobile
                    </h2>
                    <p className={styles.description}>
                        Experience the easiest way to plan your events. Browse our extensive catalogue of rentals,
                        manage your bookings, and get real-time updates—all from the palm of your hand.
                    </p>

                    <div className={styles.buttonGroup}>
                        <a href="#" onClick={handleGooglePlayClick} className={styles.storeButton}>
                            <FaGooglePlay className={styles.icon} />
                            <div className={styles.textContainer}>
                                <span className={styles.smallText}>GET IT ON</span>
                                <span className={styles.bigText}>Google Play</span>
                            </div>
                        </a>

                        <a href="#" onClick={(e) => e.preventDefault()} className={`${styles.storeButton} ${styles.disabled}`}>
                            <FaApple className={styles.icon} />
                            <div className={styles.textContainer}>
                                <span className={styles.smallText}>Coming Soon</span>
                                <span className={styles.bigText}>App Store</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className={styles.imageWrapper}>
                    <Image
                        src="/mobile_app_mockup.png"
                        alt="Event Solution Nepal Mobile App"
                        width={600}
                        height={600}
                        className={styles.mockupImage}
                        quality={80}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={false}
                    />
                </div>
            </div>
        </section>
    );
};

export default AppPromo;

"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, ShieldCheck, Globe, Users } from 'lucide-react';
import styles from './Hero.module.css';

const TrustBadge = ({ icon: Icon, text }) => (
    <div className={styles.trustBadge}>
        <Icon size={14} className={styles.badgeIcon} />
        <span className={styles.badgeText}>{text}</span>
    </div>
);

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const helperImages = [
        {
            src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop",
            label: "Latest Project",
            title: "Tech Innovators Summit 2024"
        },
        {
            src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
            label: "Wedding Series",
            title: "Royal Palace Celebration"
        },
        {
            src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
            label: "Concert Tour",
            title: "Neon Nights Festival"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % helperImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.hero}>
            {/* Soft Background Gradients */}
            <div className={styles.gradients}>
                <div className={styles.gradientBlob1}></div>
                <div className={styles.gradientBlob2}></div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.flexContainer}>

                    {/* Left Content */}
                    <div className={styles.leftContent}>

                        {/* Trust Badges Row */}


                        <span className={styles.tagline}>Be a guest at your own event</span>
                        <h1 className={styles.heading}>
                            Events that <br />
                            <span className={styles.highlightBlue}>Inspire</span> & <span className={styles.highlightRed}>Delight</span>
                        </h1>

                        <p className={styles.subtext}>
                            We streamline the chaos of event planning into a seamless, unforgettable experience. From concept to applause, Event Solution is your partner in excellence.
                        </p>

                        <div className={styles.buttonGroup}>
                            <button className={styles.btnPrimary}>
                                Plan Your Event
                                <ArrowRight size={18} className={styles.arrowIcon} />
                            </button>

                            <button className={styles.btnSecondary}>
                                <div className={styles.playIconWrapper}>
                                    <Play size={10} className={styles.playIcon} />
                                </div>
                                See Our Work
                            </button>
                        </div>

                        <div className={styles.socialProof}>
                            <div className={styles.avatars}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={styles.avatar}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className={styles.avatarImg} />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className={styles.boldText}>Kathmandu's Top</span> companies</p>
                        </div>
                    </div>

                    {/* Right Visuals - Organic Pill Layout */}
                    <div className={styles.rightContent}>
                        <div className={styles.imageContainer}>

                            {/* Main Image */}
                            <div className={styles.mainImageWrapper}>
                                {helperImages.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.fadingSlide} ${index === currentIndex ? styles.activeSlide : ''}`}
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.title}
                                            className={styles.mainImage}
                                        />
                                        <div className={styles.imageOverlay}></div>
                                        <div className={styles.imageText}>
                                            <p className={styles.imageLabel}>{img.label}</p>
                                            <p className={styles.imageTitle}>{img.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Element 1 (Top Right) */}
                            <div className={styles.floatingCard1}>
                                <div className={styles.starIconWrapper}>
                                    <Star className={styles.highlightBlue} size={20} fill="#064EA1" />
                                </div>
                                <p className={styles.ratingNumber}>4.9</p>
                                <p className={styles.ratingLabel}>Average Rating</p>
                            </div>

                            {/* Floating Element 2 (Bottom Right) */}
                            <div className={styles.floatingCard2}>
                                <div className={styles.cardHeader}>
                                    <Users size={20} color="white" style={{ opacity: 0.8 }} />
                                    <span className={styles.cardLabel}>Capacity</span>
                                </div>
                                <p className={styles.cardText}>Handling events up to 10k guests.</p>
                            </div>

                        </div>

                        {/* Decorative Circle Behind */}
                        <div className={styles.decorativeCircle1}></div>
                        <div className={styles.decorativeCircle2}></div>
                    </div>

                </div>
            </div>

            {/* Bottom ticker/strip */}
            <div className={styles.tickerStrip}>
                <div className={styles.tickerTrack}>
                    {/* Original Set */}
                    <div className={styles.tickerContent}>
                        <span className={`${styles.brandLogo} ${styles.sans}`}>Ncell</span>
                        <span className={`${styles.brandLogo} ${styles.serif}`}>Nepal Telecom</span>
                        <span className={`${styles.brandLogo} ${styles.mono}`}>eSewa</span>
                        <span className={`${styles.brandLogo} ${styles.italic}`}>Daraz</span>
                        <span className={`${styles.brandLogo} ${styles.sans}`}>Chaudhary Group</span>
                    </div>
                    {/* Duplicate Set for Loop */}
                    <div className={styles.tickerContent}>
                        <span className={`${styles.brandLogo} ${styles.sans}`}>Ncell</span>
                        <span className={`${styles.brandLogo} ${styles.serif}`}>Nepal Telecom</span>
                        <span className={`${styles.brandLogo} ${styles.mono}`}>eSewa</span>
                        <span className={`${styles.brandLogo} ${styles.italic}`}>Daraz</span>
                        <span className={`${styles.brandLogo} ${styles.sans}`}>Chaudhary Group</span>
                    </div>
                    {/* Triplicate Set for Loop smoothness on wide screens */}
                    <div className={styles.tickerContent}>
                        <span className={`${styles.brandLogo} ${styles.sans}`}>Ncell</span>
                        <span className={`${styles.brandLogo} ${styles.serif}`}>Nepal Telecom</span>
                        <span className={`${styles.brandLogo} ${styles.mono}`}>eSewa</span>
                        <span className={`${styles.brandLogo} ${styles.italic}`}>Daraz</span>
                        <span className={`${styles.brandLogo} ${styles.sans}`}>Chaudhary Group</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

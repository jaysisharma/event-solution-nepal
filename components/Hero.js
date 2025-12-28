"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, ShieldCheck, Globe, Users } from 'lucide-react';
import Link from 'next/link';
import styles from './Hero.module.css';

const TrustBadge = ({ icon: Icon, text }) => (
    <div className={styles.trustBadge}>
        <Icon size={14} className={styles.badgeIcon} />
        <span className={styles.badgeText}>{text}</span>
    </div>
);

const PARTNERS = [
    "Lalitpur Metropolitan City",
    "Kathmandu Metropolitan City (SIP Mela)",
    "Nepal Tourism Board",
    "Confederation of Nepalese Industry (CNI)",
    "Independent Power Producers Association Nepal (IPPAN)",
    "Nepal Chamber of Commerce",
    "Nepal German Chamber of Commerce & Industries (NGCCI)",
    "Federation Of Nepal Cottage & Small Industries (FNCSI)",
    "Federation of Handicraft Associations of Nepal (FHAN)",
    "Federation of Women Entrepreneurs Association of Nepal (FWEAN)",
    "Nepal Furniture & Furnishing Association",
    "Footwear Manufacturers Association of Nepal (FMAN)",
    "Plast Nepal Foundation",
    "Australian Embassy Nepal",
    "British Embassy Kathmandu",
    "Swiss Embassy",
    "German Embassy",
    "Pakistan Embassy",
    "Embassy of India",
    "Hotel Association Nepal (HAN)",
    "Pacific Asia Travel Association (PATA)",
    "Trinity International SS & College",
    "Uniglobe College",
    "Southwestern State College",
    "Herald College",
    "Webtuned Studio",
    "Global Reach",
    "Hi-AIM Conference Pvt. Ltd. (India)",
    "Eleven Eleven",
    "AN Holding",
    "Autism Care Nepal Society",
    "Nepal Art Council",
    "Cricket Association of Nepal (CAN)",
    "NMB Bank",
    "Yamaha (MAW Enterprises)",
    "Bajaj",
    "Toyota",
    "Rotary Club",
    "Lions Club",
    "Ncell Axiata",
    "Nepal Telecom",
    "Chaudhary Group (CG)",
    "Himalayan Bank",
    "Siddhartha Bank",
    "Daraz Nepal",
    "WorldLink Communications"
];

const Hero = ({ partners, partnerLogos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const partnerList = (partners && partners.length > 0) ? partners.map(p => p.name) : PARTNERS;

    // Use logos if provided, otherwise use text
    const hasLogos = partnerLogos && partnerLogos.length > 0;
    const itemsToRender = hasLogos ? partnerLogos : partnerList;

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
                            Founded in <span style={{ fontWeight: 'bold', color: "black" }}> 2014 A.D</span> , Event Solution Nepal has been creating meaningful and memorable events for over a decade bringing your vision to life with care, creativity, and professionalism. </p>

                        <div className={styles.buttonGroup}>
                            <Link href="/quote" className={styles.btnPrimary}>
                                Plan Your Event
                                <ArrowRight size={18} className={styles.arrowIcon} />
                            </Link>

                            <Link href="/projects" className={styles.btnSecondary}>
                                <div className={styles.playIconWrapper}>
                                    <Play size={10} className={styles.playIcon} />
                                </div>
                                See Our Work
                            </Link>
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
                    {[0, 1].map((setIndex) => (
                        <div key={setIndex} className={styles.tickerContent}>
                            {itemsToRender.map((item, index) => {
                                if (hasLogos) {
                                    return (
                                        <div key={`${setIndex}-${index}`} className={styles.logoWrapper} style={{ height: '60px', position: 'relative', width: '120px', margin: '0 2rem' }}>
                                            {/* Standard img for now, could act as optimization later. using <img /> to avoid next/image setup complexity for dynamic paths if strictly needed, but let's try standard img for simplicity with local files */}
                                            <img
                                                src={item}
                                                alt="Partner Logo"
                                                style={{ height: '100%', width: '100%', objectFit: 'contain', scale: 1.8 }}
                                                className={styles.partnerLogo}
                                            />
                                        </div>
                                    )
                                } else {
                                    const fontStyle = [styles.sans, styles.italic][index % 4];
                                    return (
                                        <span key={`${setIndex}-${index}`} className={`${styles.brandLogo} ${fontStyle}`} style={{ color: "black" }}>
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

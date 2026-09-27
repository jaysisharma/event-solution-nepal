"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Exhibitors.module.css';
import { useTheme } from '@/context/ThemeContext';

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const PROCESS_SECTIONS = [
    {
        id: "01",
        slug: "stock-clearance",
        title: "Stock Clearance",
        description: "Every successful website starts with a clear plan. Guided by this plan, I design websites that evoke emotions, build trust, and strategically turn visitors into customers.",
        subItems: [
            {
                id: "01",
                title: "Edition 2023",
                year: "2023",
                href: "/exhibitors/stock-clearance/2023",
                image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "02",
                title: "Edition 2024",
                year: "2024",
                href: "/exhibitors/stock-clearance/2024",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "03",
                title: "Edition 2025",
                year: "2025",
                href: "/exhibitors/stock-clearance/2025",
                image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            },
        ]
    },
    {
        id: "02",
        slug: "family-baby-expo",
        title: "Family Baby Expo",
        description: "I transform the design into a living, fluid web experience. With Framer, I build everything to load fast, run stable, and allow you to update content yourself anytime.",
        subItems: [
            {
                id: "01",
                title: "Edition 2021",
                year: "2021",
                href: "/exhibitors/family-baby-expo/2021",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "02",
                title: "Edition 2023",
                year: "2023",
                href: "/exhibitors/family-baby-expo/2023",
                image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "03",
                title: "Edition 2024",
                year: "2024",
                href: "/exhibitors/family-baby-expo/2024",
                image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80"
            },
        ]
    },
    {
        id: "03",
        slug: "global-expo",
        title: "Global Expo",
        description: "Bringing your website to the world with precision. I handle performance tuning, technical SEO, and domain deployment so your digital presence makes an immediate impact.",
        subItems: [
            {
                id: "01",
                title: "Edition 2022",
                year: "2022",
                href: "/exhibitors/global-expo/2022",
                image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "02",
                title: "Edition 2023",
                year: "2023",
                href: "/exhibitors/global-expo/2023",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "03",
                title: "Edition 2024",
                year: "2024",
                href: "/exhibitors/global-expo/2024",
                image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "04",
                title: "Edition 2025",
                year: "2025",
                href: "/exhibitors/global-expo/2025",
                image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80"
            },
        ]
    }
];

export default function ExhibitorsClient({ events }) {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const rowsRef = useRef([]);

    // Floating Image on Hover State
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useGSAP(() => {
        let mm = gsap.matchMedia();

        // Desktop only: Pin each section container so they stack borderless
        mm.add("(min-width: 769px)", () => {
            const rows = rowsRef.current.filter(Boolean);

            rows.forEach((row, index) => {
                if (!row) return;

                ScrollTrigger.create({
                    trigger: row,
                    start: "top top+=110",
                    end: "bottom bottom",
                    endTrigger: containerRef.current,
                    pin: true,
                    pinSpacing: false,
                    id: `section-pin-${index}`
                });
            });
        });

        ScrollTrigger.refresh();
    }, { scope: containerRef });

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.container}>
                {/* Left-Aligned Header */}
                <div className={styles.header} style={{ maxWidth: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ maxWidth: '850px' }}>
                            <span className={styles.label}>
                                <Building2 size={16} /> Exhibitor Showcase &amp; Directory
                            </span>
                            <h1 className={styles.title}>
                                <span className={styles.textRed}>Explore Our</span> <span className={styles.textBlue}>Exhibitors</span>
                            </h1>
                            <p className={styles.description}>
                                Discover leading national and global companies showcasing their latest innovations, products, and technology across our flagship event editions.
                            </p>
                        </div>
                        <div style={{ paddingTop: '0.5rem' }}>
                            <Link
                                href="/exhibitors/apply"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.6rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: '#ffffff',
                                    background: '#EB1F26',
                                    borderRadius: '9999px',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(235, 31, 38, 0.25)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <span>Exhibit Yourself</span> →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Split Rows Container with Section Pinning */}
                <div className={styles.rowsContainer} ref={containerRef}>
                    {PROCESS_SECTIONS.map((section, index) => (
                        <div
                            key={section.id}
                            className={styles.splitRow}
                            style={{ zIndex: index + 1 }}
                            ref={(el) => {
                                if (el) rowsRef.current[index] = el;
                            }}
                        >
                            {/* Left Side: 20% */}
                            <div className={styles.leftCol}>
                                <span className={styles.largeNumber}>{section.id}</span>
                            </div>

                            {/* Right Side: 80% */}
                            <div className={styles.rightCol}>
                                <h2 className={styles.itemTitle}>{section.title}</h2>
                                <p className={styles.itemText}>{section.description}</p>

                                <div className={styles.subItemsList}>
                                    {section.subItems.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={sub.href}
                                            className={styles.subItem}
                                            onMouseEnter={(e) => {
                                                setHoveredItem({
                                                    image: sub.image,
                                                    title: `${section.title} • ${sub.title}`
                                                });
                                                setMousePos({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseMove={(e) => {
                                                setMousePos({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <div className={styles.subItemLeft}>
                                                <span className={styles.subNumber}>{sub.id}</span>
                                                <span className={styles.subTitle}>{sub.title}</span>
                                            </div>
                                            <div className={styles.subItemRight}>
                                                <span className={styles.subItemHint}>View Exhibitors</span>
                                                <ArrowUpRight size={18} className={styles.subItemArrow} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Image Preview on Hover */}
            {hoveredItem && (
                <div
                    className={styles.floatingPreview}
                    style={{
                        left: `${mousePos.x + 24}px`,
                        top: `${mousePos.y - 100}px`
                    }}
                >
                    <div className={styles.floatingImageWrapper}>
                        <Image
                            src={hoveredItem.image}
                            alt={hoveredItem.title}
                            fill
                            sizes="320px"
                            className={styles.floatingImage}
                        />
                    </div>
                    <div className={styles.floatingTitle}>{hoveredItem.title}</div>
                </div>
            )}
        </section>
    );
}

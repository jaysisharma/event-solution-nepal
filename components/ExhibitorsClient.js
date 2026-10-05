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

export default function ExhibitorsClient({ events }) {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const rowsRef = useRef([]);

    // Normalize sections directly from database events
    const sections = (events && events.length > 0)
        ? events.map((ev, eIdx) => ({
            id: ev.chronicleNumber || String(eIdx + 1).padStart(2, '0'),
            slug: ev.slug,
            title: ev.title,
            description: ev.description || '',
            subItems: (ev.editions && ev.editions.length > 0)
                ? ev.editions.map((ed, edIdx) => ({
                    id: String(edIdx + 1).padStart(2, '0'),
                    title: ed.title || `Edition ${ed.year}`,
                    year: ed.year,
                    href: `/exhibitors/${ev.slug}/${ed.year}`,
                    image: ed.previewImage || ev.previewImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
                }))
                : []
        }))
        : [];

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
                    {sections.length === 0 ? (
                        <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                            <p style={{ fontSize: '1rem', fontWeight: 500 }}>No exhibition events are currently published.</p>
                        </div>
                    ) : (
                        sections.map((section, index) => (
                            <div
                                key={section.slug || section.id || index}
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
                                                key={sub.year || sub.id}
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
                        ))
                    )}
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

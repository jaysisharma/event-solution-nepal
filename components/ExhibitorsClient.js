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
        slug: "family-baby-expo",
        title: "Family & Baby Expo",
        description: "A dedicated platform bringing together leading brands, businesses, and service providers focused on families, children, parenting, and everyday family needs. Explore the exhibitors and brands that have participated across previous editions.",
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
        id: "02",
        slug: "global-consumer-expo",
        title: "Global Consumer Expo",
        description: "A dynamic consumer exhibition connecting brands and businesses with a wide audience through products, services, innovations, and emerging market opportunities. Discover the companies that have showcased their offerings at the expo.",
        subItems: [
            {
                id: "01",
                title: "Edition 2022",
                year: "2022",
                href: "/exhibitors/global-consumer-expo/2022",
                image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "02",
                title: "Edition 2023",
                year: "2023",
                href: "/exhibitors/global-consumer-expo/2023",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "03",
                title: "Edition 2024",
                year: "2024",
                href: "/exhibitors/global-consumer-expo/2024",
                image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "04",
                title: "Edition 2025",
                year: "2025",
                href: "/exhibitors/global-consumer-expo/2025",
                image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80"
            },
        ]
    },
    {
        id: "03",
        slug: "the-hotel-expo",
        title: "The Hotel Expo",
        description: "A dedicated platform for the hospitality and hotel industry, bringing together businesses, suppliers, manufacturers, and service providers. Explore the brands and companies showcasing solutions for hotels, restaurants, and the wider hospitality sector.",
        subItems: [
            {
                id: "01",
                title: "Edition 2023",
                year: "2023",
                href: "/exhibitors/the-hotel-expo/2023",
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "02",
                title: "Edition 2024",
                year: "2024",
                href: "/exhibitors/the-hotel-expo/2024",
                image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
            },
            {
                id: "03",
                title: "Edition 2025",
                year: "2025",
                href: "/exhibitors/the-hotel-expo/2025",
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
            },
        ]
    },
    {
        id: "04",
        slug: "stock-clearance",
        title: "Stock Clearance",
        description: "A premier consumer shopping and clearance festival connecting leading manufacturers, retail distributors, and domestic brands directly with shoppers. Discover the participating companies and outlets offering exceptional deals, seasonal clearances, and wholesale bargains across previous editions.",
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
    }
];

export default function ExhibitorsClient({ events }) {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const rowsRef = useRef([]);

    // Normalize sections from database events if available, falling back to static PROCESS_SECTIONS
    const sections = (events && events.length > 0)
        ? events.map((ev, eIdx) => {
            const fallbackSection = PROCESS_SECTIONS.find(s => s.slug === ev.slug || s.id === ev.chronicleNumber) || PROCESS_SECTIONS[eIdx];
            return {
                id: ev.chronicleNumber || `0${eIdx + 1}`,
                slug: ev.slug,
                title: ev.title || fallbackSection?.title,
                description: ev.description || fallbackSection?.description,
                subItems: (ev.editions && ev.editions.length > 0)
                    ? ev.editions.map((ed, edIdx) => {
                        const fallbackSub = fallbackSection?.subItems?.find(s => s.year === ed.year) || fallbackSection?.subItems?.[edIdx];
                        return {
                            id: `0${edIdx + 1}`,
                            title: ed.title || `Edition ${ed.year}`,
                            year: ed.year,
                            href: `/exhibitors/${ev.slug}/${ed.year}`,
                            image: ed.previewImage || fallbackSub?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
                        };
                    })
                    : (fallbackSection?.subItems || [])
            };
        })
        : PROCESS_SECTIONS;

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
                    {sections.map((section, index) => (
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

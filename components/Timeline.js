"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./Timeline.module.css";
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Timeline({ memories }) {
    const { theme } = useTheme();
    const sectionRef = useRef(null);
    const lineRef = useRef(null);

    // Group memories by year then by category
    const memoriesByYear = useMemo(() => {
        const groups = {};
        if (!memories) return groups;
        memories.forEach(m => {
            if (!groups[m.year]) groups[m.year] = {};
            if (!groups[m.year][m.category]) groups[m.year][m.category] = [];
            groups[m.year][m.category].push(m);
        });
        return groups;
    }, [memories]);

    const years = useMemo(() => Object.keys(memoriesByYear).sort((a, b) => b - a), [memoriesByYear]);

    const [activeYear, setActiveYear] = useState(null);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        if (years.length > 0 && !activeYear) {
            setActiveYear(years[0]);
        }
    }, [years, activeYear]);

    const categoriesInYear = useMemo(() => {
        if (!activeYear || !memoriesByYear[activeYear]) return [];
        return ["All", ...Object.keys(memoriesByYear[activeYear]).sort()];
    }, [activeYear, memoriesByYear]);

    useEffect(() => {
        if (activeCategory !== "All" && !categoriesInYear.includes(activeCategory)) {
            setActiveCategory("All");
        }
    }, [activeYear, categoriesInYear, activeCategory]);

    const filteredMemories = useMemo(() => {
        if (!activeYear || !memoriesByYear[activeYear]) return [];

        let result = [];
        if (activeCategory === "All") {
            result = Object.values(memoriesByYear[activeYear]).flat();
        } else {
            result = memoriesByYear[activeYear][activeCategory] || [];
        }

        // Sort within the year if needed, here just return
        return result;
    }, [activeYear, activeCategory, memoriesByYear]);

    useGSAP(() => {
        if (!sectionRef.current) return;

        // Timeline line animation
        gsap.fromTo(lineRef.current,
            { scaleY: 0 },
            {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    end: "bottom 80%",
                    scrub: true,
                    id: "timeline-line"
                }
            }
        );

        // Memory cards animation
        const cards = gsap.utils.toArray(`.${styles.timelineItem}`);
        cards.forEach((card, i) => {
            const isLeft = i % 2 === 0;
            gsap.fromTo(card,
                {
                    opacity: 0,
                    x: isLeft ? -50 : 50,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none",
                        id: `timeline-card-${i}`
                    }
                }
            );
        });
    }, { scope: sectionRef, dependencies: [filteredMemories] });

    if (!memories || memories.length === 0) return null;

    return (
        <section ref={sectionRef} className={`${styles.wrapper} ${theme === 'dark' ? styles.dark : ''}`}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className={styles.label}
                    >
                        Our Timeline
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={styles.title}
                    >
                        Moments That <span className={styles.highlight}>Define Us</span>
                    </motion.h2>
                </div>

                {/* Filters */}
                <div className={styles.filtersSection}>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>Year</span>
                        <div className={styles.pillContainer}>
                            {years.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setActiveYear(year)}
                                    className={`${styles.pillBtn} ${styles.yearPill} ${activeYear === year ? styles.activeYear : ''}`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`cats-${activeYear}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={styles.filterGroup}
                        >
                            <div className={styles.pillContainer}>
                                {categoriesInYear.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`${styles.pillBtn} ${styles.categoryPill} ${activeCategory === cat ? styles.activeCategory : ''}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Vertical Timeline */}
                <div className={styles.timelineBody}>
                    <div ref={lineRef} className={styles.mainLine}></div>

                    <div className={styles.itemsColumn}>
                        {filteredMemories.map((event, idx) => (
                            <div key={event.id} className={`${styles.timelineItem} ${idx % 2 === 0 ? styles.left : styles.right}`}>
                                <div className={styles.lineNode}>
                                    <div className={styles.nodeInner}></div>
                                </div>

                                <div className={styles.contentCard}>
                                    <div className={styles.imageBox}>
                                        <Image
                                            src={event.image}
                                            alt={event.alt}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 400px"
                                            className={styles.eventImage}
                                            quality={80}
                                        />
                                        <div className={styles.categoryBadge}>{event.category}</div>
                                    </div>
                                    <div className={styles.textContent}>
                                        <h4 className={styles.eventTitle}>{event.alt}</h4>
                                        <div className={styles.eventYear}>{event.year}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

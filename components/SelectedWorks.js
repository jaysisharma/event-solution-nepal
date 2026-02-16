"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import styles from './SelectedWorks.module.css';
import { useTheme } from '@/context/ThemeContext';

const SelectedWorks = ({ projects: initialProjects }) => {
    const { theme } = useTheme();
    const [hoveredProject, setHoveredProject] = useState(null);
    // GSAP Refs for performance (no re-renders on mousemove)
    const xSet = useRef(null);
    const ySet = useRef(null);
    const imageContainerRef = useRef(null);
    const sectionRef = useRef(null);

    // Parse and format dynamic projects if available
    const projects = initialProjects && initialProjects.length > 0
        ? initialProjects.map(p => {
            let image = "/works/family_baby_expo.PNG"; // Fallback
            try {
                const parsed = JSON.parse(p.images);
                if (parsed && parsed.length > 0) image = parsed[0];
            } catch (e) { }
            return {
                id: p.id,
                category: p.category,
                year: p.year,
                image: image,
                title: p.title
            };
        })
        : [
            {
                id: 1,
                category: "Expo",
                year: "2024",
                image: "/works/family_baby_expo.PNG",
                title: "Family & Baby Expo"
            },
            {
                id: 2,
                category: "Expo",
                year: "2024",
                image: "/works/Global_consumer.jpeg",
                title: "Global Consumer Expo"
            },
            {
                id: 3,
                category: "Expo",
                year: "2024",
                image: "/works/himalayan_hydro_expo.jpg",
                title: "Himalayan Hydro Expo"
            },
            {
                id: 4,
                category: "Festival",
                year: "2024",
                image: "/works/colors_splash.PNG",
                title: "ColorSplash (Holi Event)"
            },
            {
                id: 5,
                category: "Concert",
                year: "2024",
                image: "/works/AD_Concert.PNG",
                title: "1974 AD Concert ( Rock Yatra 2)"
            }
        ];

    useEffect(() => {
        // Safe check for GSAP incase it's not loaded yet or ref is empty
        if (!imageContainerRef.current) return;

        // Create quickSetters for better performance than direct style manipulation
        xSet.current = gsap.quickSetter(imageContainerRef.current, "x", "px");
        ySet.current = gsap.quickSetter(imageContainerRef.current, "y", "px");

        // Center the image on the cursor
        gsap.set(imageContainerRef.current, { xPercent: -50, yPercent: -50 });

        const handleMouseMove = (e) => {
            if (xSet.current && ySet.current) {
                xSet.current(e.clientX);
                ySet.current(e.clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} id="portfolio" ref={sectionRef} suppressHydrationWarning>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <span className={styles.label}>Selected Works</span>
                        <h2 className={styles.title}>
                            Curated <span className={styles.highlight}>Portfolio</span>
                        </h2>
                    </div>
                    <div className={styles.headerRight}>
                        <p>Discover a decade of excellence. Hover over the projects to glimpse into our memorable events.</p>
                    </div>
                </div>

                {/* Interactive List */}
                <div className={styles.list}>
                    {projects.map((project) => (
                        <Link
                            href="/projects"
                            key={project.id}
                            className={styles.projectLink} // Optional: for styling if needed, or inline style
                            style={{ textDecoration: 'none', display: 'block' }}
                        >
                            <div
                                className={`${styles.item} portfolio-item`}
                                onMouseEnter={() => setHoveredProject(project)}
                                onMouseLeave={() => setHoveredProject(null)}
                            >
                                <div className={styles.itemContent}>
                                    <h3 className={styles.projectTitle}>{project.title}</h3>
                                    <div className={styles.itemMeta}>
                                        <span>{project.category}</span>
                                        <span>—</span>
                                        <span>{project.year}</span>
                                    </div>
                                </div>
                                <div className={styles.itemAction}>
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Button */}
                <div className={styles.footer}>
                    <Link href="/projects">
                        <button className={styles.viewAllBtn}>
                            View All Projects <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Floating Image Reveal - Global to Section */}
            <div
                ref={imageContainerRef}
                className={styles.floatingImageContainer}
                style={{
                    opacity: hoveredProject ? 1 : 0,
                    // Transform is handled by GSAP now, initial centering logic moved to CSS or handled by quickSetter logic if needed.
                    // But we want it to follow cursor. The quickSetter sets X/Y.
                    // We need to ensure we offset by -50% -50% in CSS or here. 
                    // Since gsap sets transform matrix, mixing with CSS transform might be tricky.
                    // simpler: just set top/left to 0 in CSS and use x/y for position.
                    // We will add xPercent: -50, yPercent: -50 via GSAP context or initial set? 
                    // Actually, let's keep it simple: styles handle appearance. GSAP handles position.
                    // We'll let GSAP overwrite the transform.
                }}
            >
                {/* Preload images or switch src dynamically */}
                {hoveredProject && (
                    <Image
                        src={hoveredProject.image}
                        alt={hoveredProject.title}
                        fill
                        sizes="30vw"
                        className={styles.floatingImage}
                        quality={75}
                        priority={false}
                    />
                )}
            </div>
        </section>
    );
};

export default SelectedWorks;

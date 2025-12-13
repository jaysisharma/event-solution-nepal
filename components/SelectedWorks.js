"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import styles from './SelectedWorks.module.css';

const SelectedWorks = () => {
    const [hoveredProject, setHoveredProject] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const sectionRef = useRef(null);

    const projects = [
        {
            id: 1,
            category: "Wedding",
            year: "2024",
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
            title: "Royal Palace Wedding"
        },
        {
            id: 2,
            category: "Corporate",
            year: "2023",
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
            title: "Tech Summit Nepal"
        },
        {
            id: 3,
            category: "Concert",
            year: "2024",
            image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
            title: "Summer Music Festival"
        },
        {
            id: 4,
            category: "Decoration",
            year: "2023",
            image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop",
            title: "Floral Elegance"
        },
        {
            id: 5,
            category: "Party",
            year: "2024",
            image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af57?q=80&w=2070&auto=format&fit=crop",
            title: "Neon Night Party"
        }
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className={styles.section} id="portfolio" ref={sectionRef}>
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
                        <div
                            key={project.id}
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
                    ))}
                </div>

                {/* Footer Button */}
                <div className={styles.footer}>
                    <button className={styles.viewAllBtn}>
                        View All Projects <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Floating Image Reveal - Global to Section */}
            {/* Logic: Only show if hoveredProject is not null. Position follows mouse or is fixed center relative to section. 
                Common design pattern is fixed center overlay or following cursor. 
                Let's go with a fixed/absolute position that follows cursor slightly or centrally placed for standard implementation.
                For better performance in this snippet, let's try a fixed position that follows cursor logic via inline styles.
             */}

            <div
                className={styles.floatingImageContainer}
                style={{
                    opacity: hoveredProject ? 1 : 0,
                    transform: `translate(${mousePos.x}px, ${mousePos.y}px) translate(-50%, -50%)`, // Centered on cursor
                    top: 0,
                    left: 0,
                    position: 'fixed'
                }}
            >
                {/* Preload images or switch src dynamically */}
                {hoveredProject && (
                    <img
                        src={hoveredProject.image}
                        alt={hoveredProject.title}
                        className={styles.floatingImage}
                    />
                )}
            </div>

        </section>
    );
};

export default SelectedWorks;

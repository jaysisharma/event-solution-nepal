
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './projects.module.css';

const ProjectsClient = () => {
    const [filter, setFilter] = useState("All");

    const categories = ["All", "Wedding", "Corporate", "Social", "Concert"];

    // Normalized data with MULTIPLE images for slideshow
    const allProjects = [
        {
            id: 1,
            category: "Wedding",
            year: "2024",
            title: "Royal Palace Wedding",
            images: [
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 2,
            category: "Corporate",
            year: "2023",
            title: "Tech Summit Nepal",
            images: [
                "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 3,
            category: "Concert",
            year: "2024",
            title: "Summer Music Festival",
            images: [
                "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 4,
            category: "Social",
            year: "2023",
            title: "Neon Night Party",
            images: [
                "https://images.unsplash.com/photo-1530103862676-de3c9a59af57?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 5,
            category: "Wedding",
            year: "2023",
            title: "Lakeside Nuptials",
            images: [
                "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 6,
            category: "Corporate",
            year: "2024",
            title: "Banking Awards Night",
            images: [
                "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 7,
            category: "Social",
            year: "2024",
            title: "Birthday Bash",
            images: [
                "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=2070&auto=format&fit=crop"
            ]
        },
        {
            id: 8,
            category: "Concert",
            year: "2023",
            title: "Rock in Kathmandu",
            images: [
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"
            ]
        },
    ];

    const filteredProjects = filter === "All"
        ? allProjects
        : allProjects.filter(p => p.category === filter);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    <span className={styles.textRed}>Our</span> <span className={styles.textBlue}>Work</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    A curated selection of our finest work. From intimate gatherings to grand spectacles, we turn vision into reality.
                </p>

                {/* Filters */}
                <div className={styles.filterBar}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${filter === cat ? styles.active : ''} `}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Large Cards Grid */}
            <div className={styles.listContainer}>
                {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};

// Extracted Component for Individual Project Card Logic
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Ref to hold the interval ID so we can clear/reset it on manual interaction
    const intervalRef = React.useRef(null);

    const startInterval = () => {
        // Clear existing interval if any
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Random start delay logic only needed on mount really, but here for simplicity 
        // we'll just set a regular interval. 
        // For smoother re-start, maybe just standard interval is fine.
        const intervalTime = 3000 + Math.random() * 1000;

        intervalRef.current = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
        }, intervalTime);
    };

    useEffect(() => {
        // Initial start
        startInterval();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [project.images.length]);

    const handleNext = (e) => {
        e.stopPropagation(); // Prevent card click if necessary
        setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
        startInterval(); // Reset timer
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
        startInterval(); // Reset timer
    };

    return (
        <div className={styles.projectItem}>
            <div className={styles.imageWrapper}>
                <AnimatePresence mode='popLayout'>
                    <motion.img
                        key={currentImageIndex} // Key change triggers animation
                        src={project.images[currentImageIndex]}
                        alt={project.title}
                        className={styles.projectImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </AnimatePresence>

                {/* Manual Navigation Overlay */}
                <div className={styles.navOverlay}>
                    <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrev}>
                        <ChevronLeft size={20} />
                    </button>
                    <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div className={styles.projectInfo}>
                <span className={styles.projectCategory}>{project.category}</span>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <span className={styles.projectYear}>{project.year}</span>
            </div>
        </div>
    );
};

export default ProjectsClient;



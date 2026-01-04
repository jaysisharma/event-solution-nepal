
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './projects.module.css';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ProjectsClient = ({ initialProjects }) => {
    const [filter, setFilter] = useState("All");
    const [selectedProject, setSelectedProject] = useState(null);

    const categories = ["All", "Wedding", "Corporate", "Social", "Concert"];

    const allProjects = initialProjects || [];

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
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={() => setSelectedProject(project)}
                    />
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <Lightbox
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Lightbox Component ---
const Lightbox = ({ project, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % project.images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % project.images.length);
            if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [project.images.length, onClose]);

    return (
        <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button className={styles.closeBtn} onClick={onClose}>
                <X size={32} />
            </button>

            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.lightboxImageWrapper}>
                    <motion.img
                        key={currentIndex}
                        src={project.images[currentIndex]}
                        alt={project.title}
                        className={styles.lightboxImage}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    />

                    {project.images.length > 1 && (
                        <>
                            <button className={styles.lightboxNavPrev} onClick={handlePrev}>
                                <ChevronLeft size={32} />
                            </button>
                            <button className={styles.lightboxNavNext} onClick={handleNext}>
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.lightboxInfo}>
                    <h3>{project.title}</h3>
                    <p>{currentIndex + 1} / {project.images.length}</p>
                </div>
            </div>
        </motion.div>
    );
};


const ProjectCard = ({ project, onOpen }) => {
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
        <div className={styles.projectItem} onClick={onOpen} style={{ cursor: 'pointer' }}>
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


"use client";
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './GalleryGrid.module.css';

const GalleryGrid = () => {
    const [filter, setFilter] = useState('All');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Initial dummy data with 'size' attributes for Bento Layout: 'normal', 'wide', 'tall', 'large'
    const galleryItems = [
        { id: 1, category: 'Wedding', size: 'large', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop', title: 'Royal Ceremony' },
        { id: 2, category: 'Corporate', size: 'tall', src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop', title: 'Tech Conference' },
        { id: 3, category: 'Concert', size: 'wide', src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop', title: 'Star Light Fest' },
        { id: 4, category: 'Wedding', size: 'normal', src: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=627&auto=format&fit=crop', title: 'Garden Vows' },
        { id: 5, category: 'Party', size: 'tall', src: 'https://images.unsplash.com/photo-1514525253440-b393452e2729?q=80&w=2069&auto=format&fit=crop', title: 'Neon Nights' },
        { id: 6, category: 'Corporate', size: 'normal', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', title: 'Annual Summit' },
        { id: 7, category: 'Decoration', size: 'wide', src: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop', title: 'Floral Arrangement' },
        { id: 8, category: 'Wedding', size: 'tall', src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop', title: 'Reception Hall' },
        { id: 9, category: 'Concert', size: 'large', src: 'https://images.unsplash.com/photo-1459749411177-0473ef7161a8?q=80&w=2070&auto=format&fit=crop', title: 'Acoustic Session' },
        { id: 10, category: 'Party', size: 'normal', src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop', title: 'Birthday Bash' },
    ];

    const categories = ['All', 'Wedding', 'Corporate', 'Concert', 'Party', 'Decoration'];

    const filteredItems = filter === 'All'
        ? galleryItems
        : galleryItems.filter(item => item.category === filter);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % filteredItems.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage(e);
            if (e.key === 'ArrowLeft') prevImage(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen]);

    return (
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                {/* Filter Tabs */}
                <div className={styles.filterContainer}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${filter === cat ? styles.activeFilter : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Bento Grid */}
                <div className={styles.grid}>
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`${styles.gridItem} ${styles[item.size] || ''}`}
                            onClick={() => openLightbox(index)}
                        >
                            <img
                                src={item.src}
                                alt={item.title}
                                className={styles.image}
                                loading="lazy"
                            />
                            <div className={styles.overlay}>
                                <div className={styles.info}>
                                    <span className={styles.category}>{item.category}</span>
                                    <h3 className={styles.title}>{item.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox */}
                {lightboxOpen && (
                    <div className={styles.lightbox} onClick={closeLightbox}>
                        <button className={styles.closeBtn} onClick={closeLightbox}>
                            <X size={32} />
                        </button>

                        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImage}>
                            <ChevronLeft size={32} />
                        </button>

                        <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                            <img
                                src={filteredItems[currentImageIndex].src}
                                alt={filteredItems[currentImageIndex].title}
                                className={styles.lightboxImage}
                            />
                        </div>

                        <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImage}>
                            <ChevronRight size={32} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GalleryGrid;

"use client";
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import styles from './GalleryGrid.module.css';
import { useTheme } from '@/context/ThemeContext';

const GalleryGrid = ({ initialItems }) => {
    const { theme } = useTheme();
    const [filter, setFilter] = useState('All');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const galleryItems = initialItems || [];

    const uniqueCategories = [...new Set(galleryItems.map(item => item.category).filter(Boolean))];
    const categories = ['All', ...uniqueCategories.sort()];

    const filteredItems = filter === 'All'
        ? galleryItems
        : galleryItems.filter(item => item.category === filter);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        }
    }, [lightboxOpen]);

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
        <section className={`${styles.gallerySection} ${theme === 'dark' ? styles.dark : ''}`}>
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
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Image
                                    src={item.src}
                                    alt={item.title}
                                    className={styles.image}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    quality={90}
                                />
                            </div>
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

                        <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '90vw', height: '90vh' }}>
                            <Image
                                src={filteredItems[currentImageIndex].src}
                                alt={filteredItems[currentImageIndex].title}
                                className={styles.lightboxImage}
                                fill
                                style={{ objectFit: 'contain' }}
                                sizes="100vw"
                                quality={100}
                                priority
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

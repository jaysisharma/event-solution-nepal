"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import styles from './rentals.module.css';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Static inventory removed in favor of dynamic DB data
const INVENTORY = [];

export default function RentalsClient({ initialItems }) {
    const { theme } = useTheme();
    // Dynamically extract categories from items
    const dynamicCategories = ["ALL", ...Array.from(new Set(initialItems.map(item => item.category)))].sort();

    // Sort to keep ALL first, then alphabetical (ALL is usually first anyway if I unshift or explicit)
    // Actually, simple sort puts ALL first if A is first... wait.
    // Better:
    const categories = ["ALL", ...Array.from(new Set(initialItems.map(item => item.category))).sort()];

    const [activeFilter, setActiveFilter] = useState("ALL");
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const filteredItems = initialItems.filter(item =>
        activeFilter === "ALL" || item.category === activeFilter
    );

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setSelectedSize(item.availableSizes[0]); // Default to first size
        setCurrentImageIndex(0); // Reset carousel
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (!selectedItem) return;
        setCurrentImageIndex((prev) =>
            prev === selectedItem.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (!selectedItem) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedItem.images.length - 1 : prev - 1
        );
    };

    const handleWhatsappInquiry = () => {
        if (!selectedItem) return;
        const phoneNumber = "+9779703606342"; // Replace with actual number

        const messageText = `Hello, I'm interested in renting the ${selectedItem.title}.
        
Selected Option / Size: ${selectedSize}

Please provide availability and pricing details.`;

        const encodedMessage = encodeURIComponent(messageText);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className={`${styles.page} ${theme === 'dark' ? styles.dark : ''}`}>


            {/* Hero Section / Banner */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className={styles.heroTitle}
                    >
                        RENTALS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className={styles.heroSubtitle}
                    >
                        PREMIUM EVENT EQUIPMENT & INFRASTRUCTURE
                    </motion.p>
                </div>
            </section>

            {/* Filter & Grid Section */}
            <section className={styles.section}>
                <div className={styles.container}>

                    <div className={styles.filterSection}>
                        <div className={styles.filterBar}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`${styles.filterBtn} ${activeFilter === cat ? styles.activeFilter : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        className={styles.grid}
                        layout
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    onClick={() => handleItemClick(item)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className={styles.card}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        <Image
                                            src={item.images[0]} // Show first image in card
                                            alt={item.title}
                                            fill
                                            className={styles.cardImage}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>

                                    <div className={styles.cardOverlay}>
                                        <span className={styles.cardCategory}>{item.category}</span>
                                        <div className={styles.cardContent}>
                                            <h3 className={styles.cardTitle}>{item.title}</h3>

                                        </div>
                                    </div>

                                    <div className={styles.cardArrow}>
                                        <ArrowUpRight size={24} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredItems.length === 0 && (
                            <div className={styles.emptyState}>
                                No items found in this category.
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                                <X size={24} />
                            </button>

                            <div className={styles.modalImageWrapper}>
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                                    >
                                        <Image
                                            src={selectedItem.images[currentImageIndex]}
                                            alt={selectedItem.title}
                                            fill
                                            className={styles.modalImage}
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Helper Controls */}
                                {selectedItem.images.length > 1 && (
                                    <>
                                        <button className={styles.sliderBtnLeft} onClick={prevImage}>
                                            <ChevronLeft size={28} />
                                        </button>
                                        <button className={styles.sliderBtnRight} onClick={nextImage}>
                                            <ChevronRight size={28} />
                                        </button>
                                        <div className={styles.sliderDots}>
                                            {selectedItem.images.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`${styles.dot} ${idx === currentImageIndex ? styles.activeDot : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.modalDetails}>
                                <span className={styles.modalCategory}>{selectedItem.category}</span>
                                <h2 className={styles.modalTitle}>{selectedItem.title}</h2>
                                {/* Price Removed from Modal */}

                                <span className={styles.sizeLabel}>Select Option / Size</span>
                                <div className={styles.sizeOptions}>
                                    {selectedItem.availableSizes.map((size, index) => (
                                        <button
                                            key={size + index}
                                            onClick={() => {
                                                setSelectedSize(size);
                                                setCurrentImageIndex(index);
                                                // Assuming 1:1 mapping between size and image from the new admin flow
                                            }}
                                            className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ''}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>

                                <button className={styles.whatsappBtn} onClick={handleWhatsappInquiry}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.002 2C6.479 2 2.002 6.477 2.002 12c0 2.155.698 4.148 1.884 5.798L2.302 22l4.316-1.547C8.04 21.574 9.968 22 12.002 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18c-1.812 0-3.518-.558-4.945-1.512l-.337-.225-2.857 1.024 1.042-2.735-.237-.369A8.046 8.046 0 0 1 3.998 12c0-4.411 3.593-8 8.004-8 4.411 0 8.004 3.589 8.004 8s-3.593 8-8.004 8zm4.332-6.195c-.242-.121-1.428-.707-1.651-.788-.223-.081-.385-.121-.546.121-.161.242-.626.788-.767.949-.141.161-.282.182-.525.061-.242-.121-1.023-.378-1.95-1.203-.722-.644-1.21-1.44-1.351-1.683-.141-.242-.015-.373.106-.494.108-.108.242-.283.363-.424.121-.141.161-.242.242-.404.081-.161.04-.303-.02-.424-.061-.121-.546-1.313-.748-1.798-.198-.475-.399-.41-.546-.418-.141-.008-.303-.008-.464-.008-.161 0-.424.061-.646.303-.222.242-.848.828-.848 2.019 0 1.191.868 2.342.989 2.504.121.161 1.706 2.605 4.133 3.653.578.249 1.028.398 1.378.509.579.184 1.106.158 1.524.096.467-.069 1.428-.585 1.63-1.15.202-.566.202-1.05.141-1.15-.06-.101-.222-.162-.464-.283z" />
                                    </svg>
                                    Inquire via WhatsApp
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

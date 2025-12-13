"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import styles from './rentals.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const INVENTORY = [
    {
        id: "01",
        title: "German Hangers",
        category: "HANGERS",
        price: "From $500",
        images: ["/rentals/german_hanger.png", "/rentals/german_hanger_inside.png", "/rentals/german_hanger_night.png"],
        size: "large",
        availableSizes: ["40x100 ft", "60x120 ft", "80x150 ft", "Custom Size"]
    },
    {
        id: "02",
        title: "Modular Stalls",
        category: "STALLS",
        price: "$100 / Unit",
        images: ["/rentals/modular_stall.png", "/rentals/modular_stall_detail.png", "/rentals/modular_stall_side.png"],
        size: "standard",
        availableSizes: ["3x3 m (Standard)", "3x6 m (Double)", "Custom Config"]
    },
    {
        id: "03",
        title: "Luxury Pandals",
        category: "PANDALS",
        price: "Custom Quote",
        images: ["/rentals/luxury_pandal.png", "/rentals/luxury_pandal_entry.png", "/rentals/luxury_pandal_decor.png"],
        size: "large",
        availableSizes: ["Wedding Setup", "Corporate Event", "Banquet Style"]
    },
    {
        id: "04",
        title: "Pro Staging",
        category: "STAGE",
        price: "$300 / sq.ft",
        images: ["/rentals/stage_setup.png", "/rentals/stage_side_view.png", "/rentals/stage_concert.png"],
        size: "standard",
        availableSizes: ["20x30 ft", "40x30 ft", "60x40 ft", "Ramp Addition"]
    },
    {
        id: "05",
        title: "P3 LED Walls",
        category: "LED",
        price: "$200 / sq.ft",
        images: ["/rentals/led_wall.png", "/rentals/led_wall_content.png", "/rentals/led_wall_stage.png"],
        size: "standard",
        availableSizes: ["10x8 ft", "20x12 ft", "30x15 ft", "Curved Wall"]
    },
    {
        id: "06",
        title: "Sound Systems",
        category: "AUDIO",
        price: "Custom Quote",
        images: ["/rentals/sound_system.png", "/rentals/sound_system_array.png", "/rentals/sound_system_console.png"],
        size: "standard",
        availableSizes: ["Concert Line Array", "Conference PA", "DJ Setup"]
    },
    {
        id: "07",
        title: "VIP Seating",
        category: "FURNITURE",
        price: "$50 / Seat",
        images: ["/rentals/vip_seating.png", "/rentals/vip_seating_arrangement.png", "/rentals/vip_seating_detail.png"],
        size: "large",
        availableSizes: ["Single Sofa", "3-Seater", "Banquet Chairs", "Coffee Tables"]
    }
];

const CATEGORIES = ["ALL", "HANGERS", "STALLS", "PANDALS", "STAGE", "LED", "AUDIO", "FURNITURE"];

export default function RentalsClient() {
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const filteredItems = INVENTORY.filter(item =>
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
        const phoneNumber = "9779851088888"; // Replace with actual number
        const message = `I am interested in * ${selectedItem.title}*.% 0ASelected Option / Size: * ${selectedSize}*.% 0APlease provide availability and quote.`;
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    return (
        <div className={styles.page}>
            <Navbar />

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
                            {CATEGORIES.map((cat) => (
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
                                    {selectedItem.availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
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

"use client";
import { useState } from 'react';
import styles from './page.module.css';
import Section from '@/components/Section';
import Image from 'next/image';

const categories = ["All", "Weddings", "Corporate", "Parties", "Concerts", "Rentals"];

const portfolioItems = [
    { id: 1, category: "Weddings", image: "https://placehold.co/600x800/EB1F28/FFFFFF/png?text=Wedding+1" },
    { id: 2, category: "Corporate", image: "https://placehold.co/600x600/054F9E/FFFFFF/png?text=Corporate+1" },
    { id: 3, category: "Parties", image: "https://placehold.co/600x800/2B2B2B/FFFFFF/png?text=Party+1" },
    { id: 4, category: "Weddings", image: "https://placehold.co/600x600/F7F8FA/2B2B2B/png?text=Wedding+2" },
    { id: 5, category: "Concerts", image: "https://placehold.co/600x800/EB1F28/FFFFFF/png?text=Concert+1" },
    { id: 6, category: "Rentals", image: "https://placehold.co/600x600/054F9E/FFFFFF/png?text=Rental+1" },
    { id: 7, category: "Corporate", image: "https://placehold.co/600x800/2B2B2B/FFFFFF/png?text=Corporate+2" },
    { id: 8, category: "Parties", image: "https://placehold.co/600x600/F7F8FA/2B2B2B/png?text=Party+2" },
    { id: 9, category: "Weddings", image: "https://placehold.co/600x800/EB1F28/FFFFFF/png?text=Wedding+3" },
];

export default function Portfolio() {
    const [filter, setFilter] = useState("All");
    const [selectedImage, setSelectedImage] = useState(null);

    const filteredItems = filter === "All"
        ? portfolioItems
        : portfolioItems.filter(item => item.category === filter);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Our Portfolio</h1>
                <p className={styles.heroSubtitle}>A showcase of our finest events.</p>
            </div>

            <Section background="white">
                <div className={styles.filters}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.grid}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.item} onClick={() => setSelectedImage(item.image)}>
                            <Image
                                src={item.image}
                                alt={item.category}
                                fill
                                className={styles.image}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className={styles.overlay}>
                                <span className={styles.category}>{item.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {selectedImage && (
                <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
                    <div className={styles.lightboxContent}>
                        <Image
                            src={selectedImage}
                            alt="Full size"
                            width={800}
                            height={600}
                            className={styles.lightboxImage}
                        />
                        <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>&times;</button>
                    </div>
                </div>
            )}
        </div>
    );
}

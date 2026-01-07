"use client";

import React from 'react';
import styles from './gallery.module.css';
import GalleryGrid from '@/components/GalleryGrid';
import CallToAction from '@/components/CallToAction';
import { useTheme } from '@/context/ThemeContext';

export default function GalleryClient({ galleryItems }) {
    const { theme } = useTheme();

    return (
        <main className={`${styles.main} ${theme === 'dark' ? styles.dark : ''}`}>
            {/* Page Header */}
            <div className={styles.header}>
                <span className={styles.subheading}>
                    Portfolio
                </span>
                <h1 className={styles.title} style={{ color: theme === 'dark' ? '#f8fafc' : 'var(--primary)' }}>
                    Captured <span className={styles.highlight}>Moments</span>
                </h1>
                <p className={styles.description}>
                    A curated selection of our most memorable events, showcasing the art of celebration.
                </p>
            </div>

            {/* Gallery Grid */}
            <GalleryGrid initialItems={galleryItems} />

            {/* CTA Section */}
            <CallToAction />
        </main >
    );
}

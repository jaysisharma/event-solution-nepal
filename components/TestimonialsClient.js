"use client";
import React from 'react';
import { Star, Quote, User } from 'lucide-react';
import styles from './Testimonials.module.css';
import { useTheme } from '@/context/ThemeContext';

const TestimonialsClient = ({ initialReviews = [] }) => {
    const { theme } = useTheme();
    // Determine which reviews to show - if DB is empty, maybe show nothing or just a message? 
    // Or we rely on seed data. For now, assume reviews are passed.
    const reviews = initialReviews.length > 0 ? initialReviews : [];

    if (reviews.length === 0) {
        return null; // Or a placeholder section
    }

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.header}>
                <span className={styles.label}>Testimonials</span>
                <h2 className={styles.title}>
                    Client Success <span className={styles.highlight}>Stories</span>
                </h2>
                <p className={styles.description}>
                    Don&apos;t just take our word for it. Hear from the people who have experienced the Event Solution difference.
                </p>
            </div>


            {/* Reviews Marquee OR Grid */}
            <div className={styles.marqueeContainer}>
                <div
                    className={styles.marqueeTrack}
                    style={{
                        animation: reviews.length < 3 ? 'none' : undefined,
                        justifyContent: reviews.length < 3 ? 'center' : undefined,
                        width: reviews.length < 3 ? '100%' : 'max-content',
                        flexWrap: reviews.length < 3 ? 'wrap' : 'nowrap'
                    }}
                >
                    {/* Only duplicate if we are actually scrolling (>= 3 items) */}
                    {(reviews.length < 3 ? reviews : [...reviews, ...reviews]).map((review, index) => (
                        <div key={`${review.id}-${index}`} className={styles.card}>
                            {/* Decorative Quote Icon */}
                            <Quote size={40} className={styles.quoteIcon} fill="currentColor" />

                            {/* Stars */}
                            <div className={styles.stars}>
                                {[...Array(review.rating || 5)].map((_, i) => (
                                    <Star key={i} size={18} className={styles.star} fill="currentColor" />
                                ))}
                            </div>

                            {/* Quote Text */}
                            <p className={styles.quoteText}>
                                &quot;{review.quote}&quot;
                            </p>

                            {/* User Info */}
                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    {review.avatar ? (
                                        <img src={review.avatar} alt={review.name} className={styles.avatar} />
                                    ) : (
                                        <div className={`${styles.avatar} flex items-center justify-center bg-neutral-100 text-neutral-400`}>
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.userDetails}>
                                    <h4 className={styles.userName}>{review.name}</h4>
                                    <p className={styles.userRole}>{review.role}</p>
                                </div>
                            </div>

                            {/* Bottom Line Decor */}
                            <div className={styles.bottomLine}></div>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    );
};

export default TestimonialsClient;

"use client";
import React from 'react';
import Image from 'next/image';
import { Star, Quote, User } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/Draggable';
import styles from './Testimonials.module.css';
import { useTheme } from '@/context/ThemeContext';

gsap.registerPlugin(Draggable);

const TestimonialsClient = ({ initialReviews = [] }) => {
    const { theme } = useTheme();
    // Always double the reviews to create a seamless loop
    const reviews = initialReviews.length > 0 ? [...initialReviews, ...initialReviews] : [];

    // Refs for animation state
    const trackRef = React.useRef(null);
    const xPos = React.useRef(0); // Current global X position

    useGSAP(() => {
        if (reviews.length === 0) return;

        const track = trackRef.current;
        if (!track) return;

        // Measure the width of the *original* content (half of the track)
        // We can approximate or measure. Since we duplicated, total width approx 2x original.
        // Better to get the full scrollWidth and divide by 2.
        const totalWidth = track.scrollWidth;
        const singleSetWidth = totalWidth / 2;

        // Setup GSAP setter for performance
        const setX = gsap.quickSetter(track, "x", "px");

        // Auto-scroll speed (pixels per frame)
        const speed = 0.5;
        let isDragging = false;

        // Ticker for auto-scrolling
        const tick = () => {
            if (isDragging) return;

            xPos.current -= speed;

            // Seamless wrapping logic
            if (xPos.current <= -singleSetWidth) {
                xPos.current += singleSetWidth;
            } else if (xPos.current > 0) {
                xPos.current -= singleSetWidth;
            }

            setX(xPos.current);
        };

        gsap.ticker.add(tick);

        // Configure Draggable
        Draggable.create(track, {
            type: "x",
            trigger: track, // Or container
            inertia: true,
            edgeResistance: 0.65,
            dragClickables: true,
            onPress: () => {
                isDragging = true;
            },
            onRelease: () => {
                isDragging = false;
            },
            onDrag: function () {
                // Sync our internal xPos with the Draggable's x
                xPos.current = this.x;

                // Wrap during drag if needed (optional, but good for infinite feel)
                if (this.x <= -singleSetWidth) {
                    this.x += singleSetWidth;
                    xPos.current += singleSetWidth;
                    setX(xPos.current); // Force visual update
                    this.update(); // Update Draggable's internal state
                } else if (this.x > 0) {
                    this.x -= singleSetWidth;
                    xPos.current -= singleSetWidth;
                    setX(xPos.current);
                    this.update();
                }
            },
            onThrowUpdate: function () {
                // Keep syncing during inertia throw
                xPos.current = this.x;

                if (this.x <= -singleSetWidth) {
                    this.x += singleSetWidth;
                    xPos.current += singleSetWidth;
                    setX(xPos.current);
                    this.update();
                } else if (this.x > 0) {
                    this.x -= singleSetWidth;
                    xPos.current -= singleSetWidth;
                    setX(xPos.current);
                    this.update();
                }
            }
        });

        return () => {
            gsap.ticker.remove(tick);
        };
    }, [reviews]);

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


            {/* Draggable Slider Track */}
            <div className={`${styles.marqueeContainer} slider-container`}>
                <div
                    ref={trackRef}
                    className={`${styles.marqueeTrack} slider-track`}
                    style={{
                        width: 'max-content',
                        cursor: 'grab'
                    }}
                >
                    {reviews.map((review, index) => (
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
                                        <Image
                                            src={review.avatar}
                                            alt={review.name}
                                            width={50}
                                            height={50}
                                            className={styles.avatar}
                                            style={{ objectFit: 'cover' }}
                                        />
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

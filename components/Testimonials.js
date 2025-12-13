"use client";
import React from 'react';
import { Star, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
    const reviews = [
        {
            id: 1,
            name: "Sarah Jenkins",
            role: "Marketing Director, TechGlobal",
            quote: "Event Solution transformed our annual summit. The level of detail and professionalism was simply unmatched. They didn't just plan an event; they created an experience.",
            avatar: "https://i.pravatar.cc/150?img=32",
            rating: 5
        },
        {
            id: 2,
            name: "David Chen",
            role: "CEO, StartUp Inc",
            quote: "From the initial concept to the final applause, everything was seamless. Their team handled the complex logistics with such ease. Highly recommended!",
            avatar: "https://i.pravatar.cc/150?img=11",
            rating: 5
        },
        {
            id: 3,
            name: "Emily & James",
            role: "Wedding Clients",
            quote: "They made our dream wedding a reality. The lighting, the decor, the coordination—it was all perfect. Thank you for making our special day so magical.",
            avatar: "https://i.pravatar.cc/150?img=5",
            rating: 5
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.label}>Testimonials</span>
                    <h2 className={styles.title}>
                        Client Success <span className={styles.highlight}>Stories</span>
                    </h2>
                    <p className={styles.description}>
                        Don&apos;t just take our word for it. Hear from the people who have experienced the Event Solution difference.
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className={styles.grid}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.card}>
                            {/* Decorative Quote Icon */}
                            <Quote size={40} className={styles.quoteIcon} fill="currentColor" />

                            {/* Stars */}
                            <div className={styles.stars}>
                                {[...Array(review.rating)].map((_, i) => (
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
                                    <img src={review.avatar} alt={review.name} className={styles.avatar} />
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
        </section>
    );
};

export default Testimonials;

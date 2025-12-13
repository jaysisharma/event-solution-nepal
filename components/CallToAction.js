"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import styles from './CallToAction.module.css';

const CallToAction = () => {
    return (
        <section className={styles.section} style={{ borderTop: "3px solid #ccc" }}>

            {/* Background Image */}
            <div className={styles.backgroundImageWrapper}>
                <Image
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                    alt="Elegant Event Background"
                    fill
                    className={styles.backgroundImage}
                    quality={80}
                />

                {/* Dark Overlay for Text Readability */}
                <div className={styles.overlay}></div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Let's Build Your Perfect Event
                </h2>

                <p className={styles.description} style={{ color: "black" }}>
                    From weddings to corporate gatherings, our team transforms ideas into
                    extraordinary experiences tailored just for you.
                </p>

                <Link href="/contact" className={styles.buttonLink}>
                    Plan Your Event <FaArrowRight />
                </Link>
            </div>
        </section>
    );
};

export default CallToAction;

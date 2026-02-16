"use client";
import { useTheme } from '@/context/ThemeContext';
import styles from './CallToAction.module.css';
import Image from 'next/image';
import Link from 'next/link';
import MagneticButton from './MagneticButton';
import { FaArrowRight } from 'react-icons/fa';

const CallToAction = () => {
    const { theme } = useTheme();
    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>

            {/* Background Image */}
            <div className={styles.backgroundImageWrapper}>
                <Image
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=70&w=1600&auto=format&fit=crop"
                    alt="Elegant Event Background"
                    fill
                    className={styles.backgroundImage}
                    quality={75}
                    sizes="100vw"
                    priority={false}
                />

                {/* Dark Overlay for Text Readability */}
                <div className={styles.overlay}></div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <h2 className={styles.title}>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    Let's Build Your Perfect Event
                </h2>

                <p className={styles.description}>
                    From weddings to corporate gatherings, our team transforms ideas into
                    extraordinary experiences tailored just for you.
                </p>

                <MagneticButton>
                    <Link href="/contact" className={styles.buttonLink}>
                        Plan Your Event <FaArrowRight />
                    </Link>
                </MagneticButton>
            </div>
        </section>
    );
};

export default CallToAction;

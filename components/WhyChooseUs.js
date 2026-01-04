"use client";
import React from 'react';
import { ShieldCheck, Lightbulb, Award } from 'lucide-react';
import styles from './WhyChooseUs.module.css';
import { useTheme } from '@/context/ThemeContext';

const WhyChooseUs = () => {
    const { theme } = useTheme();
    const reasons = [
        {
            id: "01",
            title: "Strategic Precision",
            desc: "Our logistics team ensures every detail is tracked, timed, and executed to perfection, minimizing risks and maximizing impact.",
            icon: ShieldCheck,
            color: 'blue'
        },
        {
            id: "02",
            title: "Creative Innovation",
            desc: "We don't just follow trends; we set them. Our design team creates immersive environments that tell your brand's unique story.",
            icon: Lightbulb,
            color: 'red'
        },
        {
            id: "03",
            title: "Budget Optimization",
            desc: "Maximum value for your investment. Our industry connections allow us to negotiate the best rates without compromising quality.",
            icon: Award,
            color: 'blue'
        }
    ];

    const stats = [
        { value: "10+", label: "Years Exp.", color: "blue", top: '-40px', left: '10%' },
        { value: "2.5k", label: "Events", color: "red", bottom: '90px', right: '20%' },
        { value: "100%", label: "Satisfaction", color: "blue", top: '10%', right: '-20px' },
    ];

    return (
        <section className={`${styles.section} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>

            {/* Soft, Colorful Background Blurs */}
            <div className={styles.bgBlur1}></div>
            <div className={styles.bgBlur2}></div>

            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.label}>Why Choose Us</span>
                    <h2 className={styles.title}>
                        We Deliver <span className={styles.highlight}>Excellence</span>
                    </h2>
                    <p className={styles.description}>
                        Trust is earned through consistent performance. Here is how we ensure your event is a resounding success.
                    </p>
                </div>

                {/* Floating Cards Container */}
                <div className={styles.cardsWrapper}>

                    {/* Main Center Card (Reason 01) */}
                    <div className={`${styles.card} ${styles.centerCard} why-choose-card`}>
                        <div className={styles.centerContent}>
                            <div className={styles.iconBoxLarge}>
                                <ShieldCheck color="white" size={40} />
                            </div>
                            <h3 className={styles.cardTitleLarge}>{reasons[0].title}</h3>
                            <p className={styles.cardDescLarge}>
                                {reasons[0].desc}
                            </p>
                            <div className={styles.blueLine}></div>
                        </div>
                    </div>

                    {/* Floating Left Card (Creative Innovation - Reason 02) */}
                    <div className={`${styles.card} ${styles.sideCard} ${styles.leftCard} why-choose-card`}>
                        <div className={`${styles.iconBoxSmall} ${styles.iconBlue}`}>
                            <Lightbulb color="white" size={28} />
                        </div>
                        <h3 className={`${styles.cardTitleSmall} ${styles.cardTitleBlue}`}>{reasons[1].title}</h3>
                        <p className={styles.cardDescSmall}>
                            {reasons[1].desc}
                        </p>
                        <div className={`${styles.indicatorLine} ${styles.bgRed}`}></div>
                    </div>

                    {/* Floating Right Card (Budget Optimization - Reason 03) */}
                    <div className={`${styles.card} ${styles.sideCard} ${styles.rightCard} why-choose-card`}>
                        <div className={`${styles.iconBoxSmall} ${styles.iconBlue}`}>
                            <Award color="white" size={28} />
                        </div>
                        <h3 className={styles.cardTitleSmall}>{reasons[2].title}</h3>
                        <p className={styles.cardDescSmall}>
                            {reasons[2].desc}
                        </p>
                        <div className={`${styles.indicatorLine} ${styles.bgBlue}`}></div>
                    </div>

                    {/* Floating Stats Pills */}
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={styles.statPill}
                            style={{
                                top: stat.top || 'auto',
                                left: stat.left || 'auto',
                                bottom: stat.bottom || 'auto',
                                right: stat.right || 'auto',
                                animationDelay: `${index * 0.5}s`
                            }}
                        >
                            <span className={`${styles.statValue} ${stat.color === 'blue' ? styles.textBlue : styles.textRed}`}>
                                {stat.value}
                            </span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;

"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './StackingCards.module.css';

gsap.registerPlugin(ScrollTrigger);

const StackingCards = () => {
    const container = useRef(null);
    const cardsRef = useRef([]);

    const steps = [
        {
            id: 1,
            title: "Initial Consultation",
            description: "We begin by understanding your vision, goals, and requirements. Our team listens specifically to your ideas to build a solid foundation for your event.",
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
            color: "var(--card)"
        },
        {
            id: 2,
            title: "Concept & Design",
            description: "Our creative experts transform your ideas into a concrete concept. We design themes, layouts, and visual elements that reflect your brand.",
            image: "https://images.unsplash.com/photo-1517263904808-5dc8b43d1c2f?q=80&w=2070&auto=format&fit=crop",
            color: "var(--card)"
        },
        {
            id: 3,
            title: "Strategic Planning",
            description: "We develop a comprehensive roadmap covering logistics, timeline, and budget. Every contingency is planned for to ensure a smooth execution.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
            color: "var(--card)"
        },
        {
            id: 4,
            title: "Vendor Coordination",
            description: "Leveraging our vast network, we secure the best vendors for catering, decor, and entertainment. We manage all contracts and communications.",
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
            color: "var(--card)"
        },
        {
            id: 5,
            title: "On-Site Execution",
            description: "On the big day, our team is on the ground managing every detail. From setup to breakdown, we ensure everything runs like clockwork.",
            image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
            color: "var(--card)"
        },
        {
            id: 6,
            title: "Post-Event Analysis",
            description: "After the event, we review the success and gather feedback. We ensure all loose ends are tied up and provide you with a detailed report.",
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
            color: "var(--card)"
        }
    ];

    useGSAP(() => {
        const cards = cardsRef.current;
        const totalCards = cards.length;

        cards.forEach((card, index) => {
            if (!card) return;

            // Calculate dynamic start/end positions
            // We want cards to stack at the top (top: 100px + offset)
            // But we'll let GSAP handle the "stickiness" via pinning or raw ScrollTrigger scrubbing

            // Effect: As each card hits the stacking point, it stays there.
            // As the NEXT card comes up, the CURRENT card scales down slightly.

            ScrollTrigger.create({
                trigger: card,
                start: "top top+=120", // Stack point
                end: "bottom bottom",
                endTrigger: container.current, // Pin until the end of the section
                pin: true,
                pinSpacing: false,
                id: `card-${index}`,
                // markers: true, // debug
            });

            // Optional: Scale effect for previous cards
            // When card[index+1] enters, card[index] scales down
            if (index < totalCards - 1) {
                const nextCard = cards[index + 1];
                gsap.to(card, {
                    scale: 0.95,
                    filter: "brightness(0.8)",
                    scrollTrigger: {
                        trigger: nextCard,
                        start: "top top+=200", // Start scaling when next card overlaps
                        end: "top top+=120",
                        scrub: true,
                    }
                });
            }
        });

    }, { scope: container });

    return (
        <section className={styles.section} ref={container}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        How We Make It <span className={styles.highlight}>Happen</span>
                    </h2>
                    <p className={styles.description}>
                        A seamless journey from concept to reality.
                    </p>
                </div>

                {/* Stacking Cards */}
                <div className={styles.cardsWrapper}>
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={styles.card}
                            ref={el => cardsRef.current[index] = el}
                        // Inline styles removed in favor of GSAP, but basic CSS stacking context is helpful
                        >
                            <div className={styles.cardBody}>
                                <div className={styles.cardContent}>
                                    <span className={styles.stepNumber}>0{step.id}</span>
                                    <h3 className={styles.cardTitle}>{step.title}</h3>
                                    <p className={styles.cardDescription}>{step.description}</p>
                                </div>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        className={styles.cardImage}
                                        priority={index < 2}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StackingCards;

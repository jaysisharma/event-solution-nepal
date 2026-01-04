"use client";
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Plus } from 'lucide-react';
import Button from '@/components/Button';
import styles from './services.module.css';

gsap.registerPlugin(ScrollTrigger);

const ServicesClient = ({ initialServices }) => {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);
    const imagesRef = useRef(null);
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const services = initialServices || [];

    const process = [
        { id: "01", title: "Discovery", desc: "We listen to your vision and objectives." },
        { id: "02", title: "Strategy", desc: "We build a comprehensive roadmap and design." },
        { id: "03", title: "Production", desc: "We coordinate vendors and build the infrastructure." },
        { id: "04", title: "Execution", desc: "We manage the live event for flawless delivery." }
    ];

    const faqs = [
        { q: "What is your typical lead time?", a: "For large-scale events, we recommend engaging 3-6 months in advance. For smaller setups, 4 weeks is often sufficient." },
        { q: "Do you handle travel logistics?", a: "Yes, for destination weddings or out-of-valley events, we manage travel and accommodation for teams and guests." },
        { q: "Can we hire you for just one service?", a: "Absolutely. Whether you only need sound rental or full event management, we tailor our involvement to your needs." },
    ];

    useGSAP(() => {
        // Hero Text Reveal
        gsap.from(`.${styles.heroTitle}`, {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out",
            skewY: 5
        });

        // GSAP Pinning Logic
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const serviceBlocks = gsap.utils.toArray('.service-item');
            const imageItems = gsap.utils.toArray(`.${styles.imageContainer}`);

            // Initial setup
            // 1. Pin the Right Column explicitly logic
            ScrollTrigger.create({
                trigger: wrapperRef.current,
                start: "top top", // Start pinning when the section hits top
                end: "bottom bottom", // Stop when section ends
                pin: imagesRef.current, // PIN THE IMAGES CONTAINER
                pinSpacing: false, // Don't add spacing, just float it
            });

            // 2. Setup initial visible images
            gsap.set(imageItems, { visibility: "hidden", zIndex: 1 });
            gsap.set(imageItems[0], { visibility: "visible", zIndex: 2 });
            gsap.set(serviceBlocks[0], { opacity: 1 });

            // 3. Scroll Interactions
            serviceBlocks.forEach((block, i) => {
                const nextImage = imageItems[i];

                // Active Text Opacity
                ScrollTrigger.create({
                    trigger: block,
                    start: "top center+=100",
                    end: "bottom center+=100",
                    onToggle: (self) => {
                        if (self.isActive) {
                            gsap.to(serviceBlocks, { opacity: 0.3, duration: 0.3 });
                            gsap.to(block, { opacity: 1, duration: 0.3 });
                        }
                    }
                });

                if (i === 0) return;

                // Curtain Reveal Transition (Wipe Up)
                ScrollTrigger.create({
                    trigger: block,
                    start: "top bottom-=100",
                    end: "top center",
                    scrub: true,
                    onEnter: () => {
                        gsap.set(nextImage, { zIndex: i + 2, visibility: "visible" });
                    },
                    animation: gsap.fromTo(nextImage,
                        { clipPath: "inset(100% 0 0 0)" },
                        { clipPath: "inset(0% 0 0 0)" }
                    )
                });
            });
        });

        // Cleanup
        return () => mm.revert();

    }, { scope: containerRef });

    return (
        <div className={styles.page} ref={containerRef}>

            {/* Editorial Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.heroLabel}>Expertise</span>
                    <h1 className={styles.heroTitle}>
                        <span style={{ color: 'var(--primary)' }}>We Build</span> <br />
                        <span style={{ color: 'var(--secondary)' }}>Experiences.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A multidisciplinary event agency blending creative design, technical precision, and logistical mastery.
                    </p>
                </div>
            </section>

            {/* Services List - GSAP Pinning Layout */}
            <section className={styles.servicesSection}>
                <div className={styles.container}>
                    <div className={styles.servicesWrapper} ref={wrapperRef}>

                        {/* Left: Scrolling Text Content */}
                        <div className={styles.servicesContent}>
                            {services.map((service, index) => (
                                <div key={service.id} className={`${styles.serviceBlock} service-item`}>
                                    <span className={styles.serviceIndex}>{`(${index + 1})`}</span>
                                    <h2 className={styles.serviceTitle}>{service.title}</h2>
                                    <p className={styles.serviceDesc}>{service.desc}</p>

                                    {/* Mobile Only: Inline Image */}
                                    <div className={styles.serviceBlockMobileImage}>
                                        <Image
                                            src={service.image}
                                            alt={service.title}
                                            fill
                                            className={styles.serviceImage}
                                        />
                                    </div>

                                    <div className={styles.serviceTags}>
                                        {service.tags.map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right: Explicitly Pinned Image Container */}
                        <div className={styles.servicesImages} ref={imagesRef}>
                            {services.map((service, index) => (
                                <div key={service.id} className={`${styles.imageContainer} image-item-${index}`}>
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        priority={index === 0}
                                        className={styles.serviceImage}
                                    />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* Minimalist Process */}
            <section className={styles.processSection}>
                <div className={styles.container}>
                    <span className={styles.sectionLabel}>Our Methodology</span>
                    <div className={styles.processGrid}>
                        {process.map((step) => (
                            <div key={step.id} className={styles.processStep}>
                                <div className={styles.stepNumber}>{step.id}</div>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDesc}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Minimal */}
            <section className={styles.faqSection}>
                <div className={styles.container}>
                    <span className={styles.sectionLabel}>Inquiries</span>
                    <div className={styles.faqGrid}>
                        {faqs.map((faq, index) => (
                            <div key={index} className={`${styles.faqItem} ${openFaq === index ? styles.active : ''}`}>
                                <button className={styles.faqQuestion} onClick={() => toggleFaq(index)}>
                                    {faq.q}
                                    <Plus className={styles.faqIcon} size={24} />
                                </button>
                                <div className={styles.faqAnswer}>
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Giant CTA */}
            {/* <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <h2 className={styles.ctaTitle}>Let's Create.</h2>
                    <Button href="/contact" variant="primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
                        Start Your Project
                    </Button>
                </div>
            </section> */}

        </div>
    );
};

export default ServicesClient;

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

const ServicesClient = () => {
    const containerRef = useRef(null);
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const services = [
        {
            id: "01",
            title: "Budget Creation & Management",
            desc: "Budgets, tracking and reporting. Site inspection, pre-event, on-site event management and logistics.",
            image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
            tags: ["Financial Planning", "Logistics", "Reporting"]
        },
        {
            id: "02",
            title: "Customized Marketing Strategy",
            desc: "We provide personalized marketing strategies based on the objectives and requirements of the client in order to make your event successful and unforgettable.",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop",
            tags: ["Strategy", "Growth", "Engagement"]
        },
        {
            id: "03",
            title: "Photographs and Videographs",
            desc: "We provide professional event photography and videography services for the corporate, commercial, convention, exhibitions, conferences and many more events.",
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop",
            tags: ["Capture", "Media", "Coverage"]
        },
        {
            id: "04",
            title: "Emcee",
            desc: "We provide you with your favorite Emcee who is master of ceremonies, who has hosted numerous events ranging from webinars to auctions, organizing concerts and festivals.",
            image: "https://images.unsplash.com/photo-1719437364093-82c24d719303?q=80&w=2070&auto=format&fit=crop",
            tags: ["Hosting", "Entertainment", "Stage"]
        },
        {
            id: "05",
            title: "PA System",
            desc: "We provide all Public Address systems, including microphones, amplifiers, loudspeakers, and related equipment, based on the needs of the customer.",
            image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop",
            tags: ["Audio", "Sound", "Equipment"]
        },
        {
            id: "06",
            title: "Digital Marketing and Planning",
            desc: "We assist our customers in promoting their events through public relations, event planning, and social marketing tactics. We devise an effective marketing strategy.",
            image: "https://images.unsplash.com/photo-1585404930046-661b02d11ca9?q=80&w=2070&auto=format&fit=crop",
            tags: ["Social Media", "PR", "Promotion"]
        },
        {
            id: "07",
            title: "Branding",
            desc: "Theme and identity, across all marketing communications and experiential touchpoints.",
            image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=2070&auto=format&fit=crop",
            tags: ["Identity", "Design", "Visibility"]
        },
        {
            id: "08",
            title: "Zoom Conference",
            desc: "We are a fantastic digital host who knows how to keep things moving for everyone. Your online conference/virtual event is a home run thanks to our professional presence!",
            image: "https://images.unsplash.com/photo-1593463405365-c22accdbd09d?q=80&w=2070&auto=format&fit=crop",
            tags: ["Virtual", "Webinar", "Remote"]
        },
        {
            id: "09",
            title: "Online Registration & Management",
            desc: "Save the date, invite to register, RSVPs, motivational teasers, delegate registration, expo online booking app, website and mobile app.",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop",
            tags: ["Registration", "Apps", "Data"]
        },
        {
            id: "10",
            title: "HR Management Service",
            desc: "Depending on the requirements of your event, we provide you HR services. Invest in safety, adhere to proper HR practices, and technology for efficiency.",
            image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop",
            tags: ["Staffing", "Safety", "Coordination"]
        },
        {
            id: "11",
            title: "Artist Management",
            desc: "If you are seeking for artists for any of your events, we provide a service where we will contact your selected artist and book them for your event.",
            image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop",
            tags: ["Talent", "Booking", "Performance"]
        },
        {
            id: "12",
            title: "Graphic Design & Printing",
            desc: "We take your ideas and bring it to life, focusing on its core values and individual element to create visually inspiring graphic design and printing.",
            image: "https://images.unsplash.com/photo-1619190324856-af3f6eb55601?q=80&w=2070&auto=format&fit=crop",
            tags: ["Design", "Print", "Visuals"]
        }
    ];

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

        // Service Block Reveal
        gsap.utils.toArray(`.${styles.serviceBlock}`).forEach((block) => {
            gsap.from(block, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%"
                }
            });
        });

    }, { scope: containerRef });

    return (
        <div className={styles.page} ref={containerRef}>

            {/* Editorial Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.heroLabel}>Expertise</span>
                    <h1 className={styles.heroTitle}>
                        <span style={{ color: 'var(--secondary)' }}>We Build</span> <br />
                        <span style={{ color: 'var(--primary)' }}>Experiences.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A multidisciplinary event agency blending creative design, technical precision, and logistical mastery.
                    </p>
                </div>
            </section>

            {/* Services List - Structural Blocks */}
            <section className={styles.servicesSection}>
                <div className={styles.container}>
                    {services.map((service) => (
                        <div key={service.id} className={styles.serviceBlock}>
                            <span className={styles.serviceIndex}>({service.id})</span>
                            <div className={styles.serviceContent}>
                                <h2 className={styles.serviceTitle}>{service.title}</h2>
                                <p className={styles.serviceDesc}>{service.desc}</p>
                                <div className={styles.serviceTags}>
                                    {service.tags.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.serviceImageWrapper}>
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className={styles.serviceImage}
                                />
                            </div>
                        </div>
                    ))}
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
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <h2 className={styles.ctaTitle}>Let's Create.</h2>
                    <Button href="/contact" variant="primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
                        Start Your Project
                    </Button>
                </div>
            </section>

        </div>
    );
};

export default ServicesClient;

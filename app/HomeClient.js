"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaArrowRight } from "react-icons/fa";
import Hero from "@/components/Hero";
import Expertise from "@/components/Expertise";
import WhyChooseUs from "@/components/WhyChooseUs";
import SelectedWorks from "@/components/SelectedWorks";
import CallToAction from "@/components/CallToAction";
import AppPromo from "@/components/AppPromo";
import styles from "./page.module.css";
import Button from "@/components/Button";
import Testimonials from "@/components/Testimonials";
import UpcomingEvents from "@/components/UpcomingEvents";

gsap.registerPlugin(ScrollTrigger);

export default function HomeClient({ initialPartners, initialEvents, partnerLogos }) {
    const container = useRef();
    useGSAP(() => {
        // Services Animation
        gsap.utils.toArray(".service-card").forEach((card, i) => {
            gsap.fromTo(
                card,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                    },
                }
            );
        });

        // Portfolio Animation
        gsap.utils.toArray(".portfolio-item").forEach((item, i) => {
            gsap.fromTo(
                item,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%",
                    },
                }
            );
        });

    }, { scope: container });

    useGSAP(() => {
        // Why Choose Us Animation
        gsap.utils.toArray(".why-choose-card").forEach((card, i) => {
            gsap.fromTo(
                card,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    },
                }
            );
        });
    }, { scope: container });
    return (
        <div ref={container} className={styles.page}>
            {/* New Hero Section */}
            <Hero partners={initialPartners} partnerLogos={partnerLogos} />

            {/* Services Section - Glassmorphism */}
            <Expertise />

            {/* Portfolio Section */}
            <SelectedWorks />

            {/* Why Choose Us Section */}
            <WhyChooseUs />

            {/* Testimonials Section */}
            <Testimonials />

            {/* Upcoming Events Section */}
            <UpcomingEvents events={initialEvents} />

            {/* App Promotion Section */}
            <AppPromo />

            {/* CTA Section - High Impact */}
            <CallToAction />

        </div>
    );
}

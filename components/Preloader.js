"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import styles from "./Preloader.module.css";

export default function Preloader() {
    const containerRef = useRef(null);
    const counterRef = useRef(null);
    const logoRef = useRef(null);
    const [show, setShow] = useState(true);

    const shutterCount = 5;
    const shutters = Array.from({ length: shutterCount });

    useGSAP(() => {
        // Check if previously shown in this session
        const hasShown = sessionStorage.getItem("preloaderShown");
        if (hasShown) {
            setShow(false);
            return;
        }

        const tl = gsap.timeline({
            onComplete: () => {
                setShow(false);
                document.body.style.overflow = "auto";
                sessionStorage.setItem("preloaderShown", "true");
                window.dispatchEvent(new CustomEvent('preloader-complete'));
            },
        });

        document.body.style.overflow = "hidden";

        const counterObj = { value: 0 };

        // 0. Initial States
        tl.set(logoRef.current, {
            scale: 1.5,
            filter: "blur(10px)",
            opacity: 0
        });
        tl.set(counterRef.current, {
            yPercent: 100,
            opacity: 0
        });

        // 1. Logo Reveal (Zoom In + Blur Out)
        tl.to(logoRef.current, {
            scale: 1,
            filter: "blur(0px)",
            opacity: 1,
            duration: 1.5,
            ease: "power3.out"
        }, 0);

        // 2. Counter Reveal (Slide Up)
        tl.to(counterRef.current, {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, 0.5); // Start slightly after logo

        // 3. Counter Progress
        tl.to(counterObj, {
            value: 100,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                if (counterRef.current) {
                    counterRef.current.textContent = Math.round(counterObj.value);
                }
            },
        }, 0.5);

        // 4. Subtle "Breathing" for Logo while waiting
        tl.to(logoRef.current, {
            scale: 1.05,
            duration: 1,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut"
        }, "-=0.5");

        // 5. Build Out Animation
        // Logo zooms out quickly
        tl.to(logoRef.current, {
            scale: 0.8,
            opacity: 0,
            filter: "blur(5px)",
            duration: 0.5,
            ease: "power2.in"
        });

        // Counter drops down
        tl.to(counterRef.current, {
            yPercent: 100,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in"
        }, "<"); // Run at same time as logo exit

        // 6. Shutter Reveal
        tl.to(`.${styles.shutter}`, {
            height: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.inOut",
        }, "-=0.2");

        // 7. Cleanup
        tl.set(containerRef.current, { display: "none" });

    }, { scope: containerRef });

    if (!show) return null;

    return (
        <div className={styles.preloaderContainer} ref={containerRef}>
            <div className={styles.shutterContainer}>
                {shutters.map((_, i) => (
                    <div key={i} className={styles.shutter}></div>
                ))}
            </div>

            <div className={styles.centerContent}>
                <div className={styles.logoContainer} ref={logoRef}>
                    <Image
                        src="/logo/es_logo.png"
                        alt="Event Solution Nepal"
                        width={400}
                        height={150}
                        className={styles.logo}
                        priority
                    />
                </div>
            </div>

            <div className={styles.counterContainer}>
                <span className={styles.counter} ref={counterRef}>0</span>
            </div>
        </div>
    );
}

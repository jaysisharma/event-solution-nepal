"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./DraggableGallery.module.css";
import { useTheme } from '@/context/ThemeContext';

const IMAGES = [
    { x: "50%", y: "50%", w: 300, h: 400, rot: -5, src: "/rentals/luxury_pandal.png", alt: " 2024 Luxury Pandal Setup" },
    { x: "40%", y: "20%", w: 350, h: 250, rot: 3, src: "/rentals/stage_setup.png", alt: "Grand Concert Stage" },
    { x: "70%", y: "15%", w: 250, h: 300, rot: 8, src: "/rentals/german_hanger_night.png", alt: "Night Gala Event" },
    { x: "20%", y: "50%", w: 400, h: 300, rot: -2, src: "/rentals/led_wall.png", alt: "LED Visuals" },
    { x: "60%", y: "60%", w: 320, h: 450, rot: 5, src: "/rentals/vip_seating.png", alt: "VIP Experience" },
    { x: "85%", y: "45%", w: 280, h: 280, rot: -6, src: "/rentals/modular_stall.png", alt: "Expo Stalls" },
    { x: "30%", y: "80%", w: 350, h: 250, rot: 4, src: "/services/production.png", alt: "Live Production" },
    { x: "75%", y: "75%", w: 300, h: 350, rot: -4, src: "/services/event_management.png", alt: "Team Management" }
];

export default function DraggableGallery({ memories }) {
    const { theme } = useTheme();
    const container = useRef(null);
    const board = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const translate = useRef({ x: 0, y: 0 });

    // Use dynamic memories if available, otherwise fallback to static
    const displayImages = (memories && memories.length > 0)
        ? memories.map((m, i) => {
            const slot = IMAGES[i % IMAGES.length];

            // Auto-sizing Logic: 
            // We keep width fixed (or varied slightly by slot) but let height be AUTO to preserve aspect ratio.
            // This satisfies "frontend it will automatically take that height width"

            let width = slot.w;
            // If the user *did* pick a size, we can still respect it as a width modifier
            if (m.size === 'wide') width = 400;
            if (m.size === 'tall') width = 250;

            // Allow height to be determined by the image's aspect ratio
            const height = 'auto';

            return {
                ...slot,
                w: width,
                h: height,
                src: m.image,
                alt: m.alt,
            };
        })
        : IMAGES;

    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !board.current) return;
        e.preventDefault();
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;

        translate.current = {
            x: translate.current.x + dx,
            y: translate.current.y + dy
        };

        board.current.style.transform = `translate(${translate.current.x}px, ${translate.current.y}px)`;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);

    // Touch Support
    const handleTouchStart = (e) => {
        setIsDragging(true);
        const touch = e.touches[0];
        lastPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !board.current) return;
        // e.preventDefault(); // Sometimes needed, but can block scrolling. unique case here as we cover full screen usually? 
        // For a full-screen drag area, we might want to prevent default to stop scrolling the page while dragging the board.
        // But since this is a section within a page, we might want to be careful. 
        // However, this is a "gallerySection" likely meant to be explored. Let's try preventing default to allow smooth dragging.
        // Note: strictly preventing default on touchmove requires { passive: false } if attached via JS, but React handles differently.

        const touch = e.touches[0];
        const dx = touch.clientX - lastPos.current.x;
        const dy = touch.clientY - lastPos.current.y;

        translate.current = {
            x: translate.current.x + dx,
            y: translate.current.y + dy
        };

        board.current.style.transform = `translate(${translate.current.x}px, ${translate.current.y}px)`;
        lastPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => setIsDragging(false);

    useEffect(() => {
        if (board.current) {
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            translate.current = {
                x: -(viewportW * 2 - viewportW) / 2,
                y: -(viewportH * 2 - viewportH) / 2
            };
            board.current.style.transform = `translate(${translate.current.x}px, ${translate.current.y}px)`;
        }
    }, []);

    return (
        <div className={`${styles.wrapper} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.header}>
                <h2 className={styles.title}>Our Timeline</h2>
                <p className={styles.subtitle}>A visual journey through our most memorable events.</p>
            </div>
            <div
                ref={container}
                className={styles.gallerySection}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div ref={board} className={styles.board}>
                    {displayImages.map((img, i) => (
                        <div
                            key={i}
                            className={styles.polaroid}
                            style={{
                                left: img.x,
                                top: img.y,
                                width: `calc(${img.w}px * var(--card-scale, 1))`,
                                height: img.h === 'auto' ? 'auto' : `calc(${img.h}px * var(--card-scale, 1))`,
                                transform: `translate(-50%, -50%) rotate(${img.rot}deg)`
                            }}
                        >
                            <img src={img.src} className={styles.photo} alt={img.alt} style={{ height: 'auto' }} />
                            <div className={styles.caption}>{img.alt}</div>
                        </div>
                    ))}
                </div>
                <div className={styles.tips}>DRAG TO EXPLORE</div>
            </div>
        </div>
    );
}

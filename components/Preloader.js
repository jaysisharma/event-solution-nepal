"use client";
import React, { useRef, useState, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const BlindLayer = ({ imageSrc, zIndex, className }) => {
    // Create 5 strips
    const strips = Array.from({ length: 5 });

    return (
        <div
            className={`blind-layer ${className || ''}`}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: zIndex,
                display: 'flex',
                pointerEvents: 'none'
            }}
        >
            {strips.map((_, i) => (
                <div
                    key={i}
                    className="blind-strip"
                    style={{
                        position: 'relative',
                        width: '20%',
                        height: '100%',
                        overflow: 'hidden',
                        // Initial state: hidden (height 0) - GSAP will animate this
                        // actually, we can transform scaleY or just height. 
                        // Let's rely on GSAP `from` so we render them full layout first?
                        // Better: Set styles logic in GSAP for control.
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: `${-(i * 100)}%`, // Shift image left to align
                            width: '500%', // 5 strips * 100% = 500% width relative to strip
                            height: '100%',
                        }}
                    >
                        {imageSrc && (
                            <Image
                                src={imageSrc}
                                alt="Service"
                                fill
                                sizes="100vw"
                                style={{ objectFit: 'cover' }}
                                priority
                                quality={90}
                            />
                        )}
                        {/* Overlay for text contrast */}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const Preloader = () => {
    const containerRef = useRef(null);
    const [isComplete, setIsComplete] = useState(false);

    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                setIsComplete(true);
                document.body.style.overflow = '';
            }
        });

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Select Layers
        // Layer 0: Events (Base, visible)
        // Layer 1: Weddings (Strips animate in)
        // Layer 2: Exhibitions (Strips animate in)
        // Layer 3: Brand (Strips animate in)

        const layer1Strips = gsap.utils.toArray('.layer-1 .blind-strip');
        const layer2Strips = gsap.utils.toArray('.layer-2 .blind-strip');
        const layer3Strips = gsap.utils.toArray('.layer-3 .blind-strip'); // Brand Layer
        const finalLogo = containerRef.current.querySelector('.preloader-final-logo');

        // Initial States
        // Base Layer (Events) is statically visible behind everything
        // Other layers strips start at height: 0 (from top or bottom? let's do top)

        gsap.set([layer1Strips, layer2Strips, layer3Strips], { height: 0 });
        gsap.set(finalLogo, { autoAlpha: 0, scale: 0.8 });

        // Animation Sequence - FASTER

        // 1. Reveal Weddings (Layer 1)
        tl.to(layer1Strips, {
            height: '100%',
            duration: 0.7, // Was 1.0
            stagger: 0.05, // Was 0.1
            ease: "power3.inOut"
        }, "+=0.3"); // Was +=0.8

        // 2. Reveal Exhibitions (Layer 2)
        tl.to(layer2Strips, {
            height: '100%',
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.inOut"
        }, "+=0.2"); // Was +=0.5

        // 3. Reveal Brand Layer (Layer 3 - White)
        tl.to(layer3Strips, {
            height: '100%',
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.inOut"
        }, "+=0.2");

        // 4. Logo Reveal
        tl.to(finalLogo, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)"
        }, "-=0.1");

        // Hold
        tl.to({}, { duration: 0.4 }); // Was 0.8

        // 5. Curtain Lift
        tl.to(containerRef.current, {
            yPercent: -100,
            duration: 1.0, // A bit faster exit
            ease: "expo.inOut"
        });

    }, { scope: containerRef });

    if (isComplete) return null;

    return (
        <div
            ref={containerRef}
            className="preloader-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#111111',
                zIndex: 99999,
                overflow: 'hidden'
            }}
        >
            {/* Layer 0: Events (Static Base) */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Image src="/services/event_management.png" alt="Events" fill sizes="100vw" style={{ objectFit: 'cover' }} priority quality={90} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                {/* Optional Label (Static) - Or we can skip labels for this "Shutter" effect to count on visuals */}
                {/* Let's keep labels attached to layers? Or just center label that changes? 
                    Simplest is no labels, just visuals + final logo. Or labels inside the strips (harder to align).
                    Let's Add a Centered Text Layer that changes? 
                    Let's Stick to Images Only as requested "shutter effect" usually implies visual focus.
                */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em', zIndex: 2 }}>
                    EVENTS
                </div>
            </div>

            {/* Layer 1: Weddings */}
            <BlindLayer imageSrc="/services/prod.png" zIndex={10} className="layer-1" />

            {/* Layer 1 Label (We need to handle text separately or it gets sliced weirdly if inside strips. 
                Actually, putting text BEHIND the strips is tricky.
                Let's put text ON TOP of everything and change it? 
                Or just accept the text is part of the image slice. 
                For `BlindLayer`, if we put content inside the strip, it gets sliced perfectly. 
                Let's try putting the text INSIDE the BlindLayer logic.
            */}
            <div className="layer-1-text" style={{ position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none' }}>
                {/* 
                    NOTE: To make text slice properly, it MUST be inside the strips.
                    Since `BlindLayer` only accepts imageSrc, let's modify it to accept children for "Content".
                    BUT for now, let's just use a simple Crossfade text on top to avoid complex DOM slicing of text.
                    Actually, the user asked for "Shutter Blinds" - usually images.
                    Let's leave texts out for the intermediate steps to keep it clean, OR just crossfade them.
                    
                    Wait, I'll add a separate text container on top that syncs with timeline?
                    Nah, let's put the text into the BlindLayer manually by overlaying it on the imageSrc.
                    The current helper `BlindLayer` renders image. 
                    Let's simply add the text to the `BlindLayer` manually by rendering it 5 times...
                    
                    Actually, simple solution:
                    Just overlay the text "WEDDINGS" on top. 
                    Timeline:
                    1. Stagger strips In.
                    2. Simulatneously change Text "EVENTS" -> "WEDDINGS".
                    
                    Let's do that.
                */}
            </div>

            {/* Layer 1 Text Overlay (Managed via GSAP separately?) 
                Actually, cleaner to have no text for the intermediate steps, ensuring focus on the high-tech transition?
                Or sticking to the "Content" cycle.
                Let's add simple "WEDDINGS" text that fades in when strips start?
                Let's try to include text IN the strips for perfect sync.
                Redefining BlindLayer below to allow flexible content.
            */}

            {/* Just overriding BlindLayer usage for simplicity in this file */}
            <div className="blind-layer layer-1" style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', pointerEvents: 'none' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="blind-strip" style={{ position: 'relative', width: '20%', height: '100%', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: `${-(i * 100)}%`, width: '500%', height: '100%' }}>
                            <Image src="/services/prod.png" alt="Weddings" fill sizes="100vw" style={{ objectFit: 'cover' }} priority quality={90} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em' }}>
                                WEDDINGS
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Layer 2: Exhibitions */}
            <div className="blind-layer layer-2" style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', pointerEvents: 'none' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="blind-strip" style={{ position: 'relative', width: '20%', height: '100%', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: `${-(i * 100)}%`, width: '500%', height: '100%' }}>
                            <Image src="/services/marketing.png" alt="Exhibitions" fill sizes="100vw" style={{ objectFit: 'cover' }} priority quality={90} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em' }}>
                                EXHIBITIONS
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Layer 3: Brand (White Background) */}
            <div className="blind-layer layer-3" style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', pointerEvents: 'none' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="blind-strip" style={{ position: 'relative', width: '20%', height: '100%', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                        {/* No image here, just white strips */}
                    </div>
                ))}
            </div>

            {/* Final Logo (On top of Layer 3) */}
            <div
                className="preloader-final-logo"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    zIndex: 40,
                    width: '40vw',
                    maxWidth: '400px',
                    minWidth: '200px',
                    visibility: 'hidden' // GSAP controls this
                }}
            >
                <Image
                    src="/logo/es_logo.png"
                    alt="Event Solution Logo"
                    width={500}
                    height={200}
                    style={{ width: '100%', height: 'auto' }}
                    priority
                />
            </div>

        </div>
    );
};

export default Preloader;

'use client';
import { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';
import styles from './BeforeAfter.module.css';

const BeforeAfter = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (event) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

        setSliderPosition(percent);
    };

    const handleTouchMove = (event) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const touch = event.touches[0];
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

        setSliderPosition(percent);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchend', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchend', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isDragging]);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Transforming Spaces</h2>
                    <p className={styles.subtitle}>See the magic we bring to empty venues.</p>
                </div>

                <div
                    className={styles.sliderContainer}
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    {/* Before Image (Base) */}
                    <div className={styles.imageWrapper}>
                        <img
                            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop"
                            alt="Empty Hall"
                            className={styles.image}
                        />
                        <span className={styles.labelBefore}>Before</span>
                    </div>

                    {/* After Image (Overlay) */}
                    <div
                        className={styles.imageWrapperAfter}
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop"
                            alt="Decorated Event"
                            className={styles.image}
                        />
                        <span className={styles.labelAfter}>After</span>
                    </div>

                    {/* Slider Handle */}
                    <div
                        className={styles.handle}
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className={styles.handleLine}></div>
                        <div className={styles.handleButton}>
                            <MoveHorizontal size={20} color="#064EA1" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BeforeAfter;

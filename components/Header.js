"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Button from './Button';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleScroll = () => {
            if (typeof window !== 'undefined' && window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            {/* Logo Left */}
            <div className={styles.logoWrapper}>
                <Link href="/" className={styles.logo}>
                    Event Solution
                </Link>
            </div>

            {/* Nav Pill Center */}
            <div className={styles.navWrapper}>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/about" className={styles.link}>About</Link>
                    <Link href="/services" className={styles.link}>Services</Link>
                    <Link href="/portfolio" className={styles.link}>Portfolio</Link>
                    <Link href="/contact" className={styles.link}>Contact</Link>
                </nav>
            </div>

            {/* CTA Right */}
            <div className={styles.ctaWrapper}>
                <Button href="/contact" variant={isScrolled ? "primary" : "outline"}>Let&apos;s Talk</Button>
            </div>

            {/* Mobile Hamburger */}
            <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
            </button>

            {/* Mobile Menu Overlay (Simplified for now) */}
            {isMenuOpen && (
                <div className={styles.nav + ' ' + styles.open}>
                    <Link href="/" className={styles.link} onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/about" className={styles.link} onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link href="/services" className={styles.link} onClick={() => setIsMenuOpen(false)}>Services</Link>
                    <Link href="/portfolio" className={styles.link} onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
                    <Link href="/contact" className={styles.link} onClick={() => setIsMenuOpen(false)}>Contact</Link>
                </div>
            )}
        </header>
    );
};

export default Header;

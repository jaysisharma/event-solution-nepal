"use client";
import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { FaGooglePlay } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import styles from './Navbar.module.css';
import MagneticButton from './MagneticButton';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <nav className={`${styles.navbar} ${theme === 'dark' ? styles.dark : ''}`} suppressHydrationWarning>
            <div className={styles.container}>
                <div className={styles.navContent}>
                    {/* Logo */}
                    <div className={styles.logoWrapper}>
                        <Link href="/" className={styles.logoLink}>
                            <Image
                                src="/logo/es_logo.png"
                                alt="Event Solution"
                                width={180}
                                height={60}
                                priority
                                style={{ height: '60px', width: 'auto' }}
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className={styles.desktopMenu}>
                        {[
                            { name: 'Home', path: '/' },
                            { name: 'Services', path: '/services' },
                            { name: 'Rentals', path: '/rentals' },
                            { name: 'About', path: '/about' },
                            { name: 'Projects', path: '/projects' },
                            { name: 'Gallery', path: '/gallery' },
                            { name: 'Contact Us', path: '/contact' }
                        ].map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <MagneticButton key={item.name}>
                                    <Link
                                        href={item.path}
                                        className={`${styles.menuLink} ${isActive ? styles.active : ''}`}
                                    >
                                        {item.name}
                                    </Link>
                                </MagneticButton>
                            );
                        })}
                    </div>

                    {/* CTA Buttons */}
                    <div className={styles.ctaWrapper}>
                        {/* Theme Switch Toggle */}
                        <label className={styles.switch} aria-label="Toggle Dark Mode">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} aria-label="Switch Theme" />
                            <span className={styles.slider}>
                                <span className={styles.iconSun}><Sun size={14} color="#f59e0b" /></span>
                                <span className={styles.iconMoon}><Moon size={14} color="#f59e0b" /></span>
                            </span>
                        </label>

                        <MagneticButton>
                            <Link href="https://play.google.com/store/apps/details?id=com.nepatronix.eventsolutions&hl=en" target="_blank" className={styles.btnApp} aria-label="Get the Event Solution App on Google Play">
                                <FaGooglePlay style={{ marginRight: '8px' }} /> Get <br /> Event Solution App
                            </Link>
                        </MagneticButton>
                        <MagneticButton>
                            <Link href="/quote" className={styles.btnQuote}>
                                Get a Quote
                            </Link>
                        </MagneticButton>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className={styles.mobileNav}>
                        <button onClick={() => setIsOpen(!isOpen)} className={styles.mobileToggle} aria-label="Toggle Mobile Menu">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                                <span className={styles.slider}>
                                    <span className={styles.iconSun}><Sun size={14} color="#f59e0b" /></span>
                                    <span className={styles.iconMoon}><Moon size={14} color="#f59e0b" /></span>
                                </span>
                            </label>
                        </div>
                        {[
                            { name: 'Services', path: '/services' },
                            { name: 'Rentals', path: '/rentals' },
                            { name: 'About', path: '/about' },
                            { name: 'Projects', path: '/projects' },
                            { name: 'Gallery', path: '/gallery' },
                            { name: 'Contact Us', path: '/contact' }
                        ].map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`${styles.mobileLink} ${isActive ? styles.active : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className={styles.mobileBtnWrapper}>
                            <Link href="https://play.google.com/store/apps/details?id=com.nepatronix.eventsolutions&hl=en" target="_blank" className={styles.btnAppMobile} onClick={() => setIsOpen(false)}>
                                <FaGooglePlay style={{ marginRight: '8px' }} /> Get Event Solution App
                            </Link>
                            <Link href="/quote" className={styles.btnQuoteMobile} onClick={() => setIsOpen(false)}>
                                Get a Quote
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

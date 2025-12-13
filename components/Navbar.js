"use client";
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.navContent}>
                    {/* Logo */}
                    <div className={styles.logoWrapper}>
                        <Link href="/" className={styles.logoLink}>
                            <img
                                src="/logo/es_logo.png"
                                alt="Event Solution"
                                style={{ height: '60px', width: 'auto' }}
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className={styles.desktopMenu}>
                        {[
                            { name: 'Services', path: '/services' },
                            { name: 'Rentals', path: '/rentals' },
                            { name: 'About', path: '/about' },
                            { name: 'Projects', path: '/projects' },
                            { name: 'Gallery', path: '/gallery' },
                            { name: 'Contact Us', path: '/contact' }
                        ].map((item) => (
                            <Link key={item.name} href={item.path} className={styles.menuLink}>
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className={styles.ctaWrapper}>
                        <span className={styles.phone}> +977-01-5260535</span>
                        <Link href="/quote" className={styles.btnQuote}>
                            Get a Quote
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className={styles.mobileNav}>
                        <button onClick={() => setIsOpen(!isOpen)} className={styles.mobileToggle}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        {[
                            { name: 'Services', path: '/services' },
                            { name: 'Rentals', path: '/rentals' },
                            { name: 'About', path: '/about' },
                            { name: 'Projects', path: '/projects' },
                            { name: 'Gallery', path: '/gallery' },
                            { name: 'Contact Us', path: '/contact' }
                        ].map((item) => (
                            <Link key={item.name} href={item.path} className={styles.mobileLink} onClick={() => setIsOpen(false)}>
                                {item.name}
                            </Link>
                        ))}
                        <div className={styles.mobileBtnWrapper}>
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

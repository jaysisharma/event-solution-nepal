"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaWhatsapp, FaViber, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { useSettings } from '@/context/SettingsContext';
import styles from './Footer.module.css';

const Footer = () => {
    const pathname = usePathname();
    const settings = useSettings();
    const whatsappNum = settings?.whatsappNumber || '9779851336342';

    const footerRef = React.useRef(null);

    const [footerHeight, setFooterHeight] = React.useState(0);
    /* Wait, I can't leave invalid syntax. I'll replace the top part of the function. */

    React.useEffect(() => {
        if (!footerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setFooterHeight(entry.borderBoxSize[0].blockSize);
            }
        });

        observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, []);

    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            {/* Spacer to push content up */}
            <div className={styles.spacer} style={{ height: footerHeight }} />

            {/* Fixed Footer */}
            <div
                ref={footerRef}
                className={styles.footerWrapper}
            >
                <footer className={styles.footer}>
                    <div className={styles.container}>
                        <div className={styles.grid}>
                            {/* Column 1: Brand & About */}
                            <div className={styles.column}>
                                <Link href="/" className={styles.brandLogo}>
                                    <Image
                                        src="/logo/es_logo_white.png"
                                        alt="Event Solution"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ height: '80px', width: 'auto' }}
                                    />
                                </Link>
                                <p className={styles.text}>
                                    Founded in 2014 A.D , Event Solution Nepal has been creating meaningful and memorable events for over a decade bringing your vision to life with care, creativity, and professionalism.
                                </p>
                                <div className={styles.socials}>
                                    <a href="https://www.facebook.com/eventsolutionnepal/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook"><FaFacebookF /></a>
                                    <a href="https://www.instagram.com/eventsolutionnepal/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram"><FaInstagram /></a>
                                    <a href="https://www.tiktok.com/@eventsolutionnp" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="TikTok"><FaTiktok /></a>
                                    <a href="https://np.linkedin.com/company/event-solution-np" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn"><FaLinkedinIn /></a>
                                    <a href="https://invite.viber.com/?g2=AQAxZOgB%2B7IeSktn9WPCFT5HGWrBuv%2FG4NoMztJCNGbEFghBBsF4feQQnwPWpAe3&lang=en" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Viber"><FaViber /></a>
                                </div>
                            </div>

                            {/* Column 2: Quick Links */}
                            <div className={styles.column}>
                                <h3 className={styles.heading}>Explore</h3>
                                <ul className={styles.list}>
                                    <li><Link href="/about" className={styles.link}>About Us</Link></li>
                                    <li><Link href="/services" className={styles.link}>Our Services</Link></li>
                                    <li><Link href="/projects" className={styles.link}>Portfolio</Link></li>
                                    <li><Link href="/contact" className={styles.link}>Contact</Link></li>
                                </ul>
                            </div>

                            {/* Column 3: Services */}
                            <div className={styles.column}>
                                <h3 className={styles.heading}>Services</h3>
                                <ul className={styles.list}>
                                    <li><Link href="/services" className={styles.link}>Wedding Planning</Link></li>
                                    <li><Link href="/services" className={styles.link}>Corporate Events</Link></li>
                                    <li><Link href="/services" className={styles.link}>Concerts</Link></li>
                                    <li><Link href="/services" className={styles.link}>Decoration</Link></li>
                                </ul>
                            </div>

                            {/* Column 4: Contact */}
                            <div className={styles.column}>

                                <h3 className={styles.heading}>Get in Touch</h3>
                                <ul className={styles.list}>
                                    <li className={styles.contactItem}>
                                        <FaMapMarkerAlt className={styles.contactIcon} />
                                        <span>Jwagal, Lalitpur, Nepal</span>
                                    </li>
                                    <li className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
                                        <FaPhoneAlt className={styles.contactIcon} style={{ marginTop: '5px' }} />
                                        <div className={styles.phoneGroup}>
                                            <a href="tel:+977015260535" className={styles.link}>+977-01-5260535</a>
                                            <a href="tel:+977015260103" className={styles.link}>+977-01-5260103</a>
                                        </div>
                                    </li>
                                    <li className={styles.contactItem}>
                                        <FaEnvelope className={styles.contactIcon} />
                                        <a href="mailto:info@eventsolutionnepal.com.np" className={styles.link}>info@eventsolutionnepal.com.np</a>
                                    </li>
                                    <li className={styles.contactItem}>
                                        <FaWhatsapp className={styles.contactIcon} style={{ color: '#25D366' }} />
                                        <a href={`https://wa.me/${whatsappNum}`} target="_blank" className={styles.link} style={{ color: '#25D366' }}>
                                            Chat on WhatsApp
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className={styles.bottom}>
                            <p>&copy; {new Date().getFullYear()} Event Solution Nepal. All rights reserved.</p>
                            <div className={styles.bottomLinks}>
                                <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
                                <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Footer;

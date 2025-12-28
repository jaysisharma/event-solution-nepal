"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
    const pathname = usePathname();

    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Column 1: Brand & About */}
                    <div className={styles.column}>
                        <Link href="/" className={styles.brandLogo}>
                            <img
                                src="/logo/es_logo_white.png"
                                alt="Event Solution"
                                style={{ height: '80px', width: 'auto' }}
                            />
                        </Link>
                        <p className={styles.text}>
                            Crafting unforgettable experiences since 2014. We specialize in turning your vision into reality with precision, creativity, and passion.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialLink} aria-label="Facebook"><FaFacebookF /></a>
                            <a href="#" className={styles.socialLink} aria-label="Instagram"><FaInstagram /></a>
                            <a href="#" className={styles.socialLink} aria-label="TikTok"><FaTiktok /></a>
                            <a href="#" className={styles.socialLink} aria-label="LinkedIn"><FaLinkedinIn /></a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className={styles.column}>
                        <h3 className={styles.heading}>Explore</h3>
                        <ul className={styles.list}>
                            <li><Link href="/about" className={styles.link}>About Us</Link></li>
                            <li><Link href="/services" className={styles.link}>Our Services</Link></li>
                            <li><Link href="/portfolio" className={styles.link}>Portfolio</Link></li>
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
                            <li><a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Jwagal, Lalitpur, Nepal</a></li>
                            <li><a href="tel:+977015260535" className={styles.link}>+977-01-5260535 / +977-01-5260103</a></li>
                            <li><a href="mailto:info@eventsolutionnepal.com.np" className={styles.link}>info@eventsolutionnepal.com.np</a></li>
                            <li>
                                <a href="https://wa.me/9779800000000" className={styles.link} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', color: '#25D366' }}>
                                    <FaWhatsapp /> Chat on WhatsApp
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
    );
};

export default Footer;

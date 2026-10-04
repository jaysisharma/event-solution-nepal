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

    // Dynamic brand & social links
    const aboutText = settings?.footerAbout || "Founded in 2014 A.D , Event Solution Nepal has been creating meaningful and memorable events for over a decade bringing your vision to life with care, creativity, and professionalism.";
    const facebookUrl = settings?.facebookUrl || "https://www.facebook.com/eventsolutionnepal/";
    const instagramUrl = settings?.instagramUrl || "https://www.instagram.com/eventsolutionnepal/";
    const tiktokUrl = settings?.tiktokUrl || "https://www.tiktok.com/@eventsolutionnp";
    const linkedinUrl = settings?.linkedinUrl || "https://np.linkedin.com/company/event-solution-np";
    const viberUrl = settings?.viberUrl || "https://invite.viber.com/?g2=AQAxZOgB%2B7IeSktn9WPCFT5HGWrBuv%2FG4NoMztJCNGbEFghBBsF4feQQnwPWpAe3&lang=en";

    // Dynamic Quick Links (Column 2)
    const quickLinksTitle = settings?.quickLinksTitle || "Explore";
    let quickLinks = [
        { label: "About Us", url: "/about" },
        { label: "Exhibitors", url: "/exhibitors" },
        { label: "Our Services", url: "/services" },
        { label: "Portfolio", url: "/projects" },
        { label: "Contact", url: "/contact" }
    ];
    if (settings?.quickLinks) {
        try {
            const parsed = typeof settings.quickLinks === 'string' ? JSON.parse(settings.quickLinks) : settings.quickLinks;
            if (Array.isArray(parsed) && parsed.length > 0) quickLinks = parsed;
        } catch (e) {
            console.error("Failed to parse quick links:", e);
        }
    }

    // Dynamic Services (Column 3)
    const servicesTitle = settings?.servicesTitle || "Services";
    let servicesLinks = [
        { label: "Expo Management", url: "/services" },
        { label: "Conference Management", url: "/services" },
        { label: "Product Launching Management", url: "/services" },
        { label: "Wedding Management", url: "/services" }
    ];
    if (settings?.servicesLinks) {
        try {
            const parsed = typeof settings.servicesLinks === 'string' ? JSON.parse(settings.servicesLinks) : settings.servicesLinks;
            if (Array.isArray(parsed) && parsed.length > 0) servicesLinks = parsed;
        } catch (e) {
            console.error("Failed to parse services links:", e);
        }
    }

    // Dynamic Contact Info (Column 4)
    const contactAddress = settings?.contactAddress || "Jwagal, Lalitpur, Nepal";
    const phone1 = settings?.phone1 || "+977-01-5260535";
    const phone2 = settings?.phone2 || "+977-01-5260103";
    const contactEmail = settings?.contactEmail || "info@eventsolutionnepal.com.np";

    const cleanTel1 = phone1 ? phone1.replace(/[^0-9+]/g, '') : '';
    const cleanTel2 = phone2 ? phone2.replace(/[^0-9+]/g, '') : '';

    // Bottom Bar
    const copyrightText = settings?.copyrightText || "Event Solution Nepal. All rights reserved.";
    const privacyPolicyUrl = settings?.privacyPolicyUrl || "/privacy-policy";
    const termsOfServiceUrl = settings?.termsOfServiceUrl || "/terms-of-service";

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
                                        width={240}
                                        height={80}
                                        style={{ height: '80px', width: 'auto' }}
                                    />
                                </Link>
                                <p className={styles.text}>
                                    {aboutText}
                                </p>
                                <div className={styles.socials}>
                                    {facebookUrl && (
                                        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                                            <FaFacebookF />
                                        </a>
                                    )}
                                    {instagramUrl && (
                                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                                            <FaInstagram />
                                        </a>
                                    )}
                                    {tiktokUrl && (
                                        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="TikTok">
                                            <FaTiktok />
                                        </a>
                                    )}
                                    {linkedinUrl && (
                                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                                            <FaLinkedinIn />
                                        </a>
                                    )}
                                    {viberUrl && (
                                        <a href={viberUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Viber">
                                            <FaViber />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Quick Links */}
                            <div className={styles.column}>
                                <h3 className={styles.heading}>{quickLinksTitle}</h3>
                                <ul className={styles.list}>
                                    {quickLinks.map((link, idx) => (
                                        <li key={idx}>
                                            <Link href={link.url} className={styles.link}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 3: Services */}
                            <div className={styles.column}>
                                <h3 className={styles.heading}>{servicesTitle}</h3>
                                <ul className={styles.list}>
                                    {servicesLinks.map((service, idx) => (
                                        <li key={idx}>
                                            <Link href={service.url} className={styles.link}>
                                                {service.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 4: Contact */}
                            <div className={styles.column}>
                                <h3 className={styles.heading}>Get in Touch</h3>
                                <ul className={styles.list}>
                                    {contactAddress && (
                                        <li className={styles.contactItem}>
                                            <FaMapMarkerAlt className={styles.contactIcon} />
                                            <span>{contactAddress}</span>
                                        </li>
                                    )}
                                    {(phone1 || phone2) && (
                                        <li className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
                                            <FaPhoneAlt className={styles.contactIcon} style={{ marginTop: '5px' }} />
                                            <div className={styles.phoneGroup}>
                                                {phone1 && <a href={`tel:${cleanTel1}`} className={styles.link}>{phone1}</a>}
                                                {phone2 && <a href={`tel:${cleanTel2}`} className={styles.link}>{phone2}</a>}
                                            </div>
                                        </li>
                                    )}
                                    {contactEmail && (
                                        <li className={styles.contactItem}>
                                            <FaEnvelope className={styles.contactIcon} />
                                            <a href={`mailto:${contactEmail}`} className={styles.link}>{contactEmail}</a>
                                        </li>
                                    )}
                                    {whatsappNum && (
                                        <li className={styles.contactItem}>
                                            <FaWhatsapp className={styles.contactIcon} style={{ color: '#25D366' }} />
                                            <a href={`https://wa.me/${whatsappNum}`} target="_blank" className={styles.link} style={{ color: '#25D366' }}>
                                                Chat on WhatsApp
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className={styles.bottom}>
                            <p>&copy; {new Date().getFullYear()} {copyrightText}</p>
                            <div className={styles.bottomLinks}>
                                <Link href={privacyPolicyUrl} className={styles.bottomLink}>Privacy Policy</Link>
                                <Link href={termsOfServiceUrl} className={styles.bottomLink}>Terms of Service</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Footer;

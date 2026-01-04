"use client";

import styles from './contact.module.css';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaViber, FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '@/context/SettingsContext';

export default function ContactClient() {
    const settings = useSettings();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const eventType = formData.get('eventType');
        const message = formData.get('message');

        // Construct WhatsApp Message
        const text = `New Event Inquiry%0A%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone}%0AType: ${eventType}%0AMessage: ${message}`;

        const phoneNumber = settings?.whatsappNumber || "9779851336342"; // Target WhatsApp Number

        window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
    };

    return (
        <main className={styles.main}>
            {/* Header */}
            <section className={styles.headerSection}>
                <span className={styles.subheading}>Get in Touch</span>
                <h1 className={styles.title}>
                    Let&apos;s Plan Your <span className={styles.highlight}>Event</span>
                </h1>
                <p className={styles.description}>
                    Whether it&apos;s a grand wedding or an intimate corporate gathering, we are here to bring your vision to life.
                </p>
            </section>

            {/* Split Content */}
            <div className={styles.container}>
                {/* Left: Contact Info */}
                <div className={styles.infoColumn}>
                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Chat with us</span>
                        <div className={styles.whatsappBlock} style={{ marginTop: '0.5rem' }}>
                            <a
                                href={`https://wa.me/${settings?.whatsappNumber || '9779851336342'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#25D366',
                                    fontWeight: '500',
                                    fontSize: '1.1rem',
                                    textDecoration: 'none'
                                }}
                            >
                                <FaWhatsapp size={24} />
                                +{settings?.whatsappNumber || '9779851336342'}
                            </a>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Follow us</span>
                        <div className={styles.socialLinks}>
                            <a href="https://www.facebook.com/eventsolutionnepal/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                                <FaFacebookF size={20} />
                            </a>
                            <a href="https://www.instagram.com/eventsolutionnepal/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                                <FaInstagram size={20} />
                            </a>
                            <a href="https://np.linkedin.com/company/event-solution-np" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                                <FaLinkedinIn size={20} />
                            </a>
                            <a href="https://www.tiktok.com/@eventsolutionnp" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="TikTok">
                                <FaTiktok size={20} />
                            </a>
                            <a href="https://invite.viber.com/?g2=AQAxZOgB%2B7IeSktn9WPCFT5HGWrBuv%2FG4NoMztJCNGbEFghBBsF4feQQnwPWpAe3&lang=en" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Viber">
                                <FaViber size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: Inquiry Form */}
                <div className={styles.formColumn}>
                    <form className={styles.formGrid} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input name="name" type="text" className={styles.input} placeholder="Your name" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input name="email" type="email" className={styles.input} placeholder="your@email.com" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone</label>
                            <input name="phone" type="tel" className={styles.input} placeholder="+977" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Event Type</label>
                            <select name="eventType" className={styles.select}>
                                <option>Wedding</option>
                                <option>Corporate</option>
                                <option>Private Party</option>
                                <option>Concert</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Tell us about your event</label>
                            <textarea name="message" className={styles.textarea} placeholder="Date, venue, estimated guests, or any specific ideas..." required></textarea>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Send via WhatsApp
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

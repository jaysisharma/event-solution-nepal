import styles from './contact.module.css';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

export const metadata = {
    title: "Contact Us | Event Solution Nepal",
    description: "Get in touch to plan your next memorable event.",
};

export default function Contact() {
    return (
        <main className={styles.main}>
            {/* Header */}
            <section className={styles.headerSection}>
                <span className={styles.subheading}>Get in Touch</span>
                <h1 className={styles.title}>
                    Let’s Plan Your <span className={styles.highlight}>Event</span>
                </h1>
                <p className={styles.description}>
                    Whether it's a grand wedding or an intimate corporate gathering, we are here to bring your vision to life.
                </p>
            </section>

            {/* Split Content */}
            <div className={styles.container}>
                {/* Left: Contact Info */}
                <div className={styles.infoColumn}>
                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Chat with us</span>
                        <a href="mailto:info@eventsolution.com" className={styles.infoValue}>
                            info@eventsolution.com
                        </a>
                    </div>

                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Call us</span>
                        <a href="tel:+9779800000000" className={styles.infoValue}>
                            +977 980-0000000
                        </a>
                    </div>

                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Visit us</span>
                        <span className={styles.infoValue}>
                            Lazimpat, Kathmandu<br />
                            Nepal
                        </span>
                    </div>

                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Follow us</span>
                        <div className={styles.socialLinks}>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: Inquiry Form */}
                <div className={styles.formColumn}>
                    <form className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input type="text" className={styles.input} placeholder="Your name" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input type="email" className={styles.input} placeholder="your@email.com" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone</label>
                            <input type="tel" className={styles.input} placeholder="+977" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Event Type</label>
                            <select className={styles.select}>
                                <option>Wedding</option>
                                <option>Corporate</option>
                                <option>Private Party</option>
                                <option>Concert</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Tell us about your event</label>
                            <textarea className={styles.textarea} placeholder="Date, venue, estimated guests, or any specific ideas..."></textarea>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

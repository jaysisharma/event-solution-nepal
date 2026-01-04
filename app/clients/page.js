import styles from './page.module.css';
import Section from '@/components/Section';
import Image from 'next/image';

export const metadata = {
    title: "Our Clients | Event Solution Nepal",
    description: "See who trusts Event Solution Nepal and read testimonials from our happy clients.",
};

const testimonials = [
    { id: 1, name: "John Doe", role: "CEO, Tech Corp", text: "Event Solution Nepal delivered beyond our expectations. Highly professional team!" },
    { id: 2, name: "Jane Smith", role: "Event Planner", text: "The best event rental service in Kathmandu. Quality equipment and timely delivery." },
    { id: 3, name: "Ram Sharma", role: "Groom", text: "They made our wedding day magical. The decoration was stunning." },
];

export default function Clients() {
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Our Clients</h1>
                <p className={styles.heroSubtitle}>Trusted by leading brands and happy individuals.</p>
            </div>

            <Section background="white">
                <h2 className={`${styles.sectionTitle} ${styles.center}`}>Trusted By</h2>
                <div className={styles.logoGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className={styles.logoItem}>
                            <Image
                                src={`https://placehold.co/200x100/F7F8FA/2B2B2B/png?text=Client+${i}`}
                                alt={`Client ${i}`}
                                width={200}
                                height={100}
                                className={styles.logo}
                            />
                        </div>
                    ))}
                </div>
            </Section>

            <Section background="light">
                <h2 className={`${styles.sectionTitle} ${styles.center}`}>What They Say</h2>
                <div className={styles.testimonialGrid}>
                    {testimonials.map(t => (
                        <div key={t.id} className={styles.testimonialCard}>
                            <p className={styles.testimonialText}>&quot;{t.text}&quot;</p>
                            <div className={styles.testimonialAuthor}>
                                <h4 className={styles.authorName}>{t.name}</h4>
                                <p className={styles.authorRole}>{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}

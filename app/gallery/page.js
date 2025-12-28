import GalleryGrid from '@/components/GalleryGrid';
import CallToAction from '@/components/CallToAction';
import styles from './gallery.module.css';

export const metadata = {
    title: "Gallery | Event Solution Nepal",
    description: "Visual stories from our memorable events.",
};

import prisma from "@/lib/db";

export default async function Gallery() {
    const galleryItems = await prisma.galleryItem.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <main className={styles.main}>
            {/* Page Header */}
            <div className={styles.header}>
                <span className={styles.subheading}>
                    Portfolio
                </span>
                <h1 className={styles.title}>
                    Captured <span className={styles.highlight}>Moments</span>
                </h1>
                <p className={styles.description}>
                    A curated selection of our most memorable events, showcasing the art of celebration.
                </p>
            </div>

            {/* Gallery Grid */}
            <GalleryGrid initialItems={galleryItems} />

            {/* CTA Section */}
            <CallToAction />
        </main>
    );
}

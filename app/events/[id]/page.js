import React from 'react';
import prisma from '@/lib/db';
import Image from 'next/image';
import { MapPin, Clock, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TicketRequestForm from '@/components/TicketRequestForm';
import styles from './page.module.css';

// Force dynamic rendering since we are fetching specific IDs
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const event = await prisma.event.findUnique({
        where: { id: id },
    });

    if (!event) {
        return {
            title: 'Event Not Found',
        };
    }

    return {
        title: `${event.title} | Event Solution Nepal`,
        description: event.description ? event.description.substring(0, 160) : `Join us for ${event.title}`,
    };
}

export default async function EventDetailsPage({ params }) {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
        notFound();
    }

    const event = await prisma.event.findUnique({
        where: { id: id },
    });

    if (!event) {
        notFound();
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Navigation */}
                <nav className={styles.navBar}>
                    <Link href="/#upcoming-events" className={styles.backLink}>
                        <ArrowLeft size={18} /> Back to Events
                    </Link>
                </nav>

                {/* Header Removed */}

                {/* Hero Image Removed */}
                {/* {event.image && (
                    <div className={styles.heroImageWrapper}>
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className={styles.heroImage}
                            priority
                        />
                    </div>
                )} */}

                {/* Main Content - Form Only */}
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <TicketRequestForm
                        eventName={event.title}
                        eventId={event.id}
                        ticketPrice={event.ticketPrice}
                        ticketTypes={event.ticketTypes}
                    />
                </div>
            </div>
        </main>
    );
}

import prisma from "@/lib/db";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EventsListClient from "@/components/EventsListClient";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Events | Event Solution Nepal",
    description: "Stay updated with our latest and upcoming events. Browse through our upcoming productions and past event highlights.",
};

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        where: {
            OR: [
                { status: 'UPCOMING' },
                { status: 'COMPLETED' }
            ]
        },
        orderBy: { eventDate: 'desc' },
    });

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem 1rem' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '1rem'
                }}>
                    <ArrowLeft size={20} /> Back to Home
                </Link>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                    All <span style={{ color: 'var(--secondary)' }}>Events</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '40rem' }}>
                    Explore our journey through spectacular events, from upcoming productions to celebrated memories.
                </p>
            </div>

            <EventsListClient events={events} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "itemListElement": events.map((event, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "url": `https://eventsolutionnepal.com.np/events/${event.id}`,
                            "name": event.title
                        }))
                    })
                }}
            />
        </div>
    );
}

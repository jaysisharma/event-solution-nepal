import prisma from "@/lib/db";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UpcomingEvents from "@/components/UpcomingEvents";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Upcoming Events | Event Solution Nepal",
    description: "Stay updated with our latest and upcoming events. From concerts to corporate gatherings, see what Event Solution Nepal is planning next.",
};

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        where: {
            status: 'UPCOMING'
        },
        orderBy: { date: 'asc' },
    });

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem 2rem' }}>
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
            </div>

            {/* Reuse the component but pass ALL events */}
            <UpcomingEvents events={events} showViewAll={false} />
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

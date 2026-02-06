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
                </nav >

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                    {/* Event Details Column */}
                    <div>
                        {/* Hero Image */}
                        {event.image && (
                            <div className={styles.heroImageWrapper} style={{ position: 'relative', height: '400px', width: '100%', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem' }}>
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className={styles.heroImage}
                                    style={{ objectFit: 'cover' }}
                                    priority
                                    sizes="(max-width: 1200px) 100vw, 1200px"
                                />
                            </div>
                        )}

                        {/* Title & Date */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
                                {event.month} {event.date}, {event.year}
                            </span>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                                {event.title}
                            </h1>
                        </div>

                        {/* Meta Info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#64748B', fontSize: '1rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={20} color="#2563EB" />
                                <span style={{ fontWeight: 500 }}>{event.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={20} color="#2563EB" />
                                <span style={{ fontWeight: 500 }}>{event.time}</span>
                            </div>
                        </div>

                        {/* Organization Details */}
                        <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Organization Details
                            </h4>
                            <div style={{ display: 'grid', gap: '1rem', sm: { gridTemplateColumns: '1fr 1fr' } }}>
                                {event.organizer && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Organized By</span>
                                        <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '1.1rem' }}>{event.organizer}</span>
                                    </div>
                                )}
                                {event.managedBy && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Managed By</span>
                                        <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '1.1rem' }}>{event.managedBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>About Event</h3>
                            <p style={{ lineHeight: '1.8', color: '#475569', whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>
                                {event.description || "No description available for this event."}
                            </p>
                        </div>
                    </div>

                    {/* Ticket Form Column (or Bottom Section) */}
                    <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
                        {event.ticketTemplate ? (
                            <div id="get-tickets" style={{ scrollMarginTop: '100px' }}>
                                <TicketRequestForm
                                    eventName={event.title}
                                    eventId={event.id}
                                    ticketPrice={event.ticketPrice}
                                    ticketTypes={event.ticketTypes}
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
                                    Registration Information
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                                    Online registration is not available for this event. Please contact the organizers directly for more information.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div >
        </main >
    );
}

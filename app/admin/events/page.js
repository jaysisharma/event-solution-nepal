import prisma from '@/lib/db';
import { addEvent, deleteEvent } from './actions';
import { Trash2 } from 'lucide-react';

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Manage Events</h1>

            {/* Add Form */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Add New Event</h3>
                <form action={addEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input name="title" placeholder="Event Title" required style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />
                    <input name="location" placeholder="Location" required style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input name="date" placeholder="Date (e.g. 14)" required style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />
                        <input name="month" placeholder="Month (e.g. APR)" required style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />
                    </div>
                    <input name="time" placeholder="Time (e.g. 06:00 PM)" required style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />
                    <input name="image" placeholder="Image URL" style={{ gridColumn: 'span 2', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />

                    <button
                        type="submit"
                        style={{ gridColumn: 'span 2', padding: '0.75rem', backgroundColor: '#EB1F26', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Add Event
                    </button>
                </form>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.map((event) => (
                    <div key={event.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div>
                            <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{event.title}</h4>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{event.date} {event.month} | {event.location} | {event.time}</p>
                        </div>
                        <form action={deleteEvent}>
                            <input type="hidden" name="id" value={event.id} />
                            <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <Trash2 size={20} />
                            </button>
                        </form>
                    </div>
                ))}
                {events.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                        No events found.
                    </div>
                )}
            </div>
        </div>
    );
}

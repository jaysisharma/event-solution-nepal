import prisma from '@/lib/db';
import styles from './admin.module.css'; // Reuse basic styles or inline for now

export default async function AdminDashboard() {
    const partnerCount = await prisma.partner.count();
    const eventCount = await prisma.event.count();

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1e293b' }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Total Partners</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#064EA1', marginTop: '0.5rem' }}>{partnerCount}</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Upcoming Events</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EB1F26', marginTop: '0.5rem' }}>{eventCount}</p>
                </div>
            </div>
        </div>
    );
}

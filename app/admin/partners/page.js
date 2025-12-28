import prisma from '@/lib/db';
import { addPartner, deletePartner } from './actions';
import { Trash2 } from 'lucide-react'; // Using lucide-react as it is installed

export default async function PartnersPage() {
    const partners = await prisma.partner.findMany({
        orderBy: { createdAt: 'asc' }, // Maintain insertion order roughly
    });

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Manage Partners</h1>

            {/* Add Form */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Add New Partner</h3>
                <form action={addPartner} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        name="name"
                        placeholder="Partner Name"
                        required
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
                    />
                    <button
                        type="submit"
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#064EA1', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Add
                    </button>
                </form>
            </div>

            {/* List */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.map((partner) => (
                            <tr key={partner.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '1rem', color: '#334155' }}>{partner.name}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <form action={deletePartner} style={{ display: 'inline-block' }}>
                                        <input type="hidden" name="id" value={partner.id} />
                                        <button
                                            type="submit"
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {partners.length === 0 && (
                            <tr>
                                <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No partners found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

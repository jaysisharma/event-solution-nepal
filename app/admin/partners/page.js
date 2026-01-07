
import prisma from '@/lib/db';
import { addPartner, deletePartner } from './actions';
import { Trash2, Plus } from 'lucide-react';
import styles from '../admin.module.css';

export default async function PartnersPage() {
    const partners = await prisma.partner.findMany({
        orderBy: { createdAt: 'asc' },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Partners</h1>
                    <p className={styles.pageSubtitle}>Manage trusted partners and clients</p>
                </div>
            </div>

            {/* Add Form */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Add New Partner</h3>
                <form action={addPartner} className={styles.formGrid} style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem' }}>Logo (Required)</label>
                        <input name="image" type="file" accept="image/*" required className={styles.input} style={{ paddingTop: '0.5rem' }} />
                    </div>
                    <button type="submit" className={styles.btnAddNew} style={{ marginBottom: '2px' }}>
                        <Plus size={18} /> Add Partner
                    </button>
                </form>
            </div>

            {/* List */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.map((partner) => (
                            <tr key={partner.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {partner.image && (
                                            <img src={partner.image} alt={partner.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#fff', border: '1px solid #eee' }} />
                                        )}
                                        <span style={{ fontWeight: 500 }}>{partner.name}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <form action={deletePartner}>
                                        <input type="hidden" name="id" value={partner.id} />
                                        <button
                                            type="submit"
                                            className={`${styles.btnIcon} delete`}
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
                                <td colSpan="2">
                                    <div className={styles.emptyState} style={{ border: 'none', padding: '2rem 0' }}>
                                        No partners found.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

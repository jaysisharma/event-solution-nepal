
import prisma from '@/lib/db';
import { addPartner } from './actions';
import { Plus } from 'lucide-react';
import styles from '../admin.module.css';
import DeletePartnerButton from './DeletePartnerButton';
import AddPartnerForm from './AddPartnerForm';

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
                <AddPartnerForm />
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
                                    <DeletePartnerButton id={partner.id} />
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

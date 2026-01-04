import prisma from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';
import styles from '../admin.module.css';
import DeleteRentalButton from './DeleteRentalButton';

export const dynamic = 'force-dynamic';

export default async function RentalsPage() {
    const rentals = await prisma.rentalItem.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Rentals Management</h1>
                <Link href="/admin/rentals/new" className={styles.btnAddNew}>
                    <Plus size={18} /> Add New Item
                </Link>
            </div>

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Sizes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.emptyState}>No rental items found.</td>
                            </tr>
                        ) : (
                            rentals.map((item) => {
                                let imageSrc = '';
                                try {
                                    const images = JSON.parse(item.images);
                                    if (images.length > 0) imageSrc = images[0];
                                } catch (e) { }

                                let sizesCount = 0;
                                try {
                                    sizesCount = JSON.parse(item.availableSizes).length;
                                } catch (e) { }

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            {imageSrc && (
                                                <img
                                                    src={imageSrc}
                                                    alt={item.title}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            )}
                                        </td>
                                        <td>{item.title}</td>
                                        <td><span className={styles.badge}>{item.category}</span></td>
                                        <td>{sizesCount} sizes</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link href={`/admin/rentals/${item.id}`} className={styles.btnIcon} title="Edit">
                                                    <Edit size={16} />
                                                </Link>
                                                <DeleteRentalButton id={item.id} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import prisma from '@/lib/db';
import Link from 'next/link';
import { Plus, MessageSquare } from 'lucide-react';
import DeleteTestimonialButton from './DeleteTestimonialButton';
import styles from '../admin.module.css';

export default async function AdminTestimonialsPage() {
    const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Testimonials</h1>
                    <p className={styles.pageSubtitle}>Manage client success stories and reviews</p>
                </div>
                <Link
                    href="/admin/testimonials/new"
                    className={styles.btnAddNew}
                >
                    <Plus size={18} />
                    Add Testimonial
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Role</th>
                            <th>Quote Preview</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testimonials.map((testimonial) => (
                            <tr key={testimonial.id}>
                                <td>
                                    <div className={styles.itemContent}>
                                        {testimonial.avatar ? (
                                            <img src={testimonial.avatar} alt={testimonial.name} className={styles.itemImage} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                        ) : (
                                            <div className={styles.itemImage} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {testimonial.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className={styles.itemInfo} style={{ fontWeight: 500 }}>{testimonial.name}</span>
                                    </div>
                                </td>
                                <td>
                                    {testimonial.role}
                                </td>
                                <td>
                                    <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                                        {testimonial.quote}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className={styles.itemActions} style={{ justifyContent: 'flex-end' }}>
                                        <Link
                                            href={`/admin/testimonials/${testimonial.id}`}
                                            className={`${styles.btnIcon} ${styles.btnSecondary}`}
                                        >
                                            Edit
                                        </Link>
                                        <DeleteTestimonialButton id={testimonial.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {testimonials.length === 0 && (
                            <tr>
                                <td colSpan="4">
                                    <div className={styles.emptyState}>
                                        <MessageSquare size={48} style={{ margin: '0 auto 1rem', color: 'var(--border)' }} />
                                        <p>No testimonials found. Add your first client review!</p>
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

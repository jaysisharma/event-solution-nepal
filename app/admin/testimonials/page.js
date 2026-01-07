import prisma from '@/lib/db';
import Link from 'next/link';
import { Plus, MessageSquare, Edit2, Star, User } from 'lucide-react';
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

            {testimonials.length === 0 ? (
                <div className={styles.card} style={{ padding: '4rem 2rem' }}>
                    <div className={styles.emptyState}>
                        <MessageSquare size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                        <h3>No testimonials found</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Start collecting client success stories to showcase your amazing work!
                        </p>
                        <Link href="/admin/testimonials/new" className={styles.btnAddNew}>
                            <Plus size={18} /> Add Your First Testimonial
                        </Link>
                    </div>
                </div>
            ) : (
                <div className={styles.gridList}>
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className={styles.testimonialCard}>
                            <div className={styles.testimonialCardHeader}>
                                {testimonial.avatar ? (
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className={styles.testimonialAvatar}
                                    />
                                ) : (
                                    <div className={styles.testimonialAvatar}>
                                        <User size={20} />
                                    </div>
                                )}
                                <div className={styles.testimonialMeta}>
                                    <h4 className={styles.testimonialName}>{testimonial.name}</h4>
                                    <p className={styles.testimonialRole}>{testimonial.role}</p>
                                </div>
                            </div>

                            <div className={styles.testimonialRating}>
                                {[...Array(testimonial.rating || 5)].map((_, i) => (
                                    <Star key={i} size={14} fill="currentColor" />
                                ))}
                            </div>

                            <blockquote className={styles.testimonialQuote}>
                                "{testimonial.quote}"
                            </blockquote>

                            <div className={styles.testimonialActions}>
                                <Link
                                    href={`/admin/testimonials/${testimonial.id}`}
                                    className={`${styles.btnIcon} ${styles.btnSecondary}`}
                                    title="Edit Testimonial"
                                >
                                    <Edit2 size={16} />
                                </Link>
                                <DeleteTestimonialButton id={testimonial.id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

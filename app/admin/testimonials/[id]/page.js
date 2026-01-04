
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import TestimonialForm from '../TestimonialForm';
import styles from '../../admin.module.css';

export default async function EditTestimonialPage(props) {
    const params = await props.params;
    const testimonial = await prisma.testimonial.findUnique({
        where: { id: parseInt(params.id) },
    });

    if (!testimonial) {
        notFound();
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link
                        href="/admin/testimonials"
                        className={styles.btnIcon}
                        style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className={styles.pageTitle}>Edit Testimonial</h1>
                        <p className={styles.pageSubtitle}>Update client review details</p>
                    </div>
                </div>
            </div>

            <TestimonialForm testimonial={testimonial} />
        </div>
    );
}

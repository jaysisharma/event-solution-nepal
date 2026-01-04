export const dynamic = "force-dynamic";

import TestimonialForm from '../TestimonialForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from '../../admin.module.css';

export default function NewTestimonialPage() {
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
                        <h1 className={styles.pageTitle}>Add Testimonial</h1>
                        <p className={styles.pageSubtitle}>Create a new client success story</p>
                    </div>
                </div>
            </div>

            <TestimonialForm />
        </div>
    );
}

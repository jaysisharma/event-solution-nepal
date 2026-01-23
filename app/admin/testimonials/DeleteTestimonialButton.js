'use client';

import { deleteTestimonial } from './actions';
import { useToast } from '@/components/admin/ToastContext';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import styles from '../admin.module.css';

export default function DeleteTestimonialButton({ id }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        setIsDeleting(true);
        const result = await deleteTestimonial(id);

        if (result.success) {
            showToast('Testimonial deleted successfully', 'success');
        } else {
            showToast(result.error || 'Failed to delete', 'error');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={styles.btnIcon}
            title="Delete"
            style={{
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                borderColor: '#fee2e2',
                opacity: isDeleting ? 0.7 : 1,
                cursor: isDeleting ? 'not-allowed' : 'pointer'
            }}
        >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}

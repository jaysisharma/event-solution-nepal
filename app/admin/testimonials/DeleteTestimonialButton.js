'use client';

import { deleteTestimonial } from './actions';
import { useToast } from '@/components/admin/ToastContext';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

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
            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
        </button>
    );
}

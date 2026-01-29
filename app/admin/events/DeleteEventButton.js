'use client';

import { Trash2 } from 'lucide-react';
import { deleteEvent } from './actions';
import styles from '../admin.module.css';
import { useToast } from '@/context/ToastContext';

export default function DeleteEventButton({ id }) {
    const { showToast } = useToast();

    const handleDelete = async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            const formData = new FormData();
            formData.append('id', id);

            try {
                const result = await deleteEvent(formData);
                if (result && result.success) {
                    showToast(result.message, "success");
                } else {
                    showToast(result?.message || "Failed to delete", "error");
                }
            } catch (error) {
                showToast("An error occurred during deletion", "error");
            }
        }
    };

    return (
        <button onClick={handleDelete} className={`${styles.btnIcon} delete`} title="Delete">
            <Trash2 size={18} />
        </button>
    );
}

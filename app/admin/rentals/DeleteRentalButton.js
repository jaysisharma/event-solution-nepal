'use client';

import { useToast } from '@/components/admin/ToastContext';
import { deleteRental } from './actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import styles from '../admin.module.css';

export default function DeleteRentalButton({ id }) {
    const { showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this rental item?")) return;
        setIsDeleting(true);
        const formData = new FormData();
        formData.append('id', id);

        const res = await deleteRental(formData);
        if (res.success) {
            showToast(res.message, "success");
        } else {
            showToast(res.message, "error");
        }
        setIsDeleting(false);
    };

    return (
        <button onClick={handleDelete} disabled={isDeleting} className={styles.btnIcon} title="Delete">
            <Trash2 size={16} color="red" />
        </button>
    );
}

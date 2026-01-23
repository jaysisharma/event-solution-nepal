'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import styles from '../admin.module.css';
import { deletePartner } from './actions';

export default function DeletePartnerButton({ id }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this partner?')) return;

        setIsDeleting(true);
        // We don't have global toast here accessible easily as it's a server page parent, 
        // but revalidatePath in action will refresh the list.
        // We'll just stop loading on complete.
        await deletePartner(id);
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`${styles.btnIcon} delete`}
            title="Delete"
            style={{
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                borderColor: '#fee2e2'
            }}
        >
            {isDeleting ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <Trash2 size={18} />
            )}
        </button>
    );
}

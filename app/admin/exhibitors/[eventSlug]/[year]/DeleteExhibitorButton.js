'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteExhibitor } from '../../actions';
import styles from '../../exhibitorsAdmin.module.css';

export default function DeleteExhibitorButton({ id, name, eventSlug, year, iconOnly = true }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete exhibitor "${name}"?`)) return;
        setLoading(true);
        try {
            await deleteExhibitor(id, eventSlug, year);
        } catch (err) {
            alert(err.message || "Failed to delete");
        } finally {
            setLoading(false);
        }
    };

    if (iconOnly) {
        return (
            <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                title="Delete Exhibitor"
            >
                <Trash2 size={14} />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={styles.btnDanger}
            title="Delete Exhibitor"
        >
            <Trash2 size={14} />
            <span>{loading ? 'Deleting...' : 'Delete'}</span>
        </button>
    );
}

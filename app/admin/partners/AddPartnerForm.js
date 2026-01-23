'use client';

import { useState } from 'react';
import { addPartner } from './actions';
import { Plus, Loader2 } from 'lucide-react';
import styles from '../admin.module.css';

export default function AddPartnerForm() {
    const [uploadTime, setUploadTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const sizeInMB = file.size / (1024 * 1024);
            const estTime = Math.ceil(sizeInMB * 2);
            setUploadTime(estTime < 1 ? '< 1s' : `~${estTime}s`);
        } else {
            setUploadTime(null);
        }
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        await addPartner(formData);
        setIsSubmitting(false);
        setUploadTime(null);
        // Reset form manually or rely on action? Server action might not reset form if just passed to action prop.
        // It's better to wrap in onSubmit if we want to reset, but action prop is simple.
        // For now, let's keep it simple with action prop but we can' easily clear state without a ref.
        // Actually, let's use onSubmit to handle state correctly.
    };

    return (
        <form action={async (formData) => {
            setIsSubmitting(true);
            await addPartner(formData);
            setIsSubmitting(false);
            setUploadTime(null);
            document.getElementById('add-partner-form').reset();
        }} id="add-partner-form" className={styles.formGrid} style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
            <div className={styles.formGroup}>
                <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem' }}>Logo (Required)</label>
                <input
                    name="image"
                    type="file"
                    accept="image/*"
                    required
                    className={styles.input}
                    style={{ paddingTop: '0.5rem' }}
                    onChange={handleFileChange}
                />
                {uploadTime && (
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Est. Upload: {uploadTime}
                    </span>
                )}
            </div>
            <button type="submit" disabled={isSubmitting} className={styles.btnAddNew} style={{ marginBottom: '2px' }}>
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {isSubmitting ? ' Adding...' : ' Add Partner'}
            </button>
        </form>
    );
}

'use client';

import { useState } from 'react';
import { uploadPartnerImage, deletePartnerImageAction, addPartner } from './actions';
import { Plus, Loader2, X, CheckCircle, Upload } from 'lucide-react';
import styles from '../admin.module.css';
import { compressImage } from '@/lib/compress';

export default function AddPartnerForm() {
    const [uploadTime, setUploadTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            setUploadTime("Uploading...");
            try {
                // Auto cleanup old image
                if (uploadedImageUrl) {
                    await deletePartnerImageAction(uploadedImageUrl);
                }

                const compressed = await compressImage(file);

                const formData = new FormData();
                formData.append('image', compressed);
                formData.append('folder', 'partners');

                const response = await uploadPartnerImage(formData);

                if (response.success && response.url) {
                    setUploadedImageUrl(response.url);
                    setUploadTime("Upload Complete");
                } else {
                    setUploadTime("Failed");
                }
            } catch (err) {
                console.error(err);
                setUploadTime("Error");
            } finally {
                setIsUploading(false);
            }
        } else {
            // Do not clear everything if cancelled, stick to current if any or just do nothing
            // But if file input is cleared...
            // setUploadedImageUrl(null); // Keep previous if user cancels dialog? 
            // Logic: Input file change to empty means clear?
            // Let's rely on explicit remove button for clearing.
        }
    };

    const handleRemoveImage = async () => {
        if (uploadedImageUrl) {
            await deletePartnerImageAction(uploadedImageUrl);
            setUploadedImageUrl(null);
            setUploadTime(null);
            // Reset file input value if possible, but React uncontrolled input... 
            // We can just rely on UI state.
            const fileInput = document.getElementById('partner-file-input');
            if (fileInput) fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isUploading) return;

        setIsSubmitting(true);
        const formData = new FormData(e.target);

        // Use uploaded URL
        if (uploadedImageUrl) {
            formData.set('image', uploadedImageUrl);
        }

        await addPartner(formData);

        setIsSubmitting(false);
        setUploadTime(null);
        setUploadedImageUrl(null);
        e.target.reset();
    };

    return (
        <form onSubmit={handleSubmit} id="add-partner-form" className={styles.formGrid} style={{ gridTemplateColumns: 'minmax(200px, 1fr) auto', alignItems: 'end', gap: '1rem' }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem' }}>Partner Logo (Required) <span style={{ fontSize: '0.8em', color: '#64748b', fontWeight: 400 }}>(Ratio 1:1)</span></label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Preview Box */}
                    <div style={{ position: 'relative', width: '48px', height: '48px', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                        {isUploading ? (
                            <Loader2 size={16} className="animate-spin" style={{ color: '#64748b' }} />
                        ) : uploadedImageUrl ? (
                            <>
                                <img src={uploadedImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        background: 'red',
                                        color: 'white',
                                        border: '1px solid white',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                    }}
                                >
                                    <X size={10} />
                                </button>
                            </>
                        ) : (
                            <Upload size={16} style={{ color: '#94a3b8' }} />
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <input
                            id="partner-file-input"
                            name="image_file"
                            type="file"
                            accept="image/*"
                            // required={!uploadedImageUrl} // Conditional required
                            className={styles.input}
                            style={{ paddingTop: '0.4rem', fontSize: '0.85rem' }}
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        {uploadedImageUrl && !isUploading && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Ready
                            </div>
                        )}
                        {uploadTime && !uploadedImageUrl && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{uploadTime}</div>
                        )}
                    </div>
                </div>
            </div>
            <button type="submit" disabled={isSubmitting || isUploading || !uploadedImageUrl} className={styles.btnAddNew} style={{ marginBottom: '2px', opacity: (isSubmitting || isUploading || !uploadedImageUrl) ? 0.7 : 1, height: '42px' }}>
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {isSubmitting ? ' Adding...' : ' Add Partner'}
            </button>
        </form>
    );
}

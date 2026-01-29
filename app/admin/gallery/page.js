
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { createGalleryItem, deleteGalleryItem, getGalleryItems, uploadGalleryImage, deleteGalleryImageAction } from './actions';
import styles from '../admin.module.css';
import { compressImage } from '@/lib/compress';

const Snackbar = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', backgroundColor: bgColor, color: 'white',
            padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
        </div>
    );
};

export default function AdminGallery() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [snackbar, setSnackbar] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form inputs
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Wedding');
    const [size, setSize] = useState('normal');
    // const [file, setFile] = useState(null); // No longer needed
    // const [preview, setPreview] = useState(null); // No longer needed

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setIsLoading(true);
        const res = await getGalleryItems();
        if (res.success) setGalleryItems(res.data);
        setIsLoading(false);
    };

    const handleAddNew = () => {
        // Reset form
        setTitle('');
        setCategory('Wedding');
        setSize('normal');
        // setFile(null);
        // setPreview(null);
        setUploadedImageUrl(null);
        setIsUploading(false);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = async () => {
        // Clean up any uploaded but unsaved image
        if (uploadedImageUrl) {
            await deleteGalleryImageAction(uploadedImageUrl);
        }
        setShowForm(false);
        setUploadedImageUrl(null);
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];

            // Start background upload
            setIsUploading(true);
            try {
                // Delete old image if new one selected
                if (uploadedImageUrl) {
                    await deleteGalleryImageAction(uploadedImageUrl);
                }

                const compressed = await compressImage(f);

                const formData = new FormData();
                formData.append('image', compressed); // Use 'image' key
                formData.append('folder', 'gallery');

                const res = await uploadGalleryImage(formData);

                if (res.success && res.url) {
                    setUploadedImageUrl(res.url); // Use returned URL
                    setSnackbar({ message: 'Image uploaded successfully', type: 'success' });
                } else {
                    setSnackbar({ message: res.error || 'Upload failed', type: 'error' });
                }
            } catch (err) {
                console.error("Upload error:", err);
                setSnackbar({ message: 'Upload failed due to network error', type: 'error' });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveImage = async () => {
        if (uploadedImageUrl) {
            await deleteGalleryImageAction(uploadedImageUrl);
            setUploadedImageUrl(null);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!uploadedImageUrl) {
            setSnackbar({ message: 'Please wait for image to finish uploading', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('size', size);
            formData.append('src', uploadedImageUrl);

            const res = await createGalleryItem(formData);
            if (res.success) {
                setSnackbar({ message: 'Item added successfully!', type: 'success' });
                // Reset form
                setTitle('');
                setCategory('Wedding');
                setSize('normal');
                setUploadedImageUrl(null);
                setShowForm(false); // Close form
                fetchGallery();
            } else {
                setSnackbar({ message: res.error || 'Failed to add item', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ message: 'Unexpected error', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        setDeletingId(id);
        const res = await deleteGalleryItem(id);

        if (res.success) {
            setSnackbar({ message: 'Image deleted', type: 'success' });
            fetchGallery();
        } else {
            setSnackbar({ message: res.error || 'Failed to delete', type: 'error' });
        }
        setDeletingId(null);
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Gallery</h1>
                    <p className={styles.pageSubtitle}>Manage your image gallery</p>
                </div>
                {!showForm && (
                    <button onClick={handleAddNew} className={styles.btnAddNew}>
                        <Plus size={18} /> Add New Image
                    </button>
                )}
            </div>

            {showForm && (
                <div style={{ marginBottom: '2rem', animation: 'slideDown 0.3s ease-out' }}>
                    <div className={styles.card} style={{ border: '1px solid #3b82f6', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 className={styles.cardTitle} style={{ margin: 0, color: '#3b82f6' }}>Add Gallery Item</h3>
                            <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    type="text"
                                    required
                                    placeholder="Image Title"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.select}>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Concert">Concert</option>
                                    <option value="Party">Party</option>
                                    <option value="Decoration">Decoration</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Size</label>
                                <select value={size} onChange={(e) => setSize(e.target.value)} className={styles.select}>
                                    <option value="normal">Normal</option>
                                    <option value="wide">Wide</option>
                                    <option value="tall">Tall</option>
                                    <option value="large">Large</option>
                                </select>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                                    {size === 'normal' && 'Recommended: 800x600px'}
                                    {size === 'wide' && 'Recommended: 1200x600px'}
                                    {size === 'tall' && 'Recommended: 600x900px'}
                                    {size === 'large' && 'Recommended: 1200x900px'}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Gallery Image</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: isUploading ? 'not-allowed' : 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                                    />

                                    {isUploading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}>
                                            <Loader2 size={24} className="animate-spin" />
                                            <span style={{ fontSize: '0.8rem', marginTop: '8px' }}>Uploading...</span>
                                        </div>
                                    ) : uploadedImageUrl ? (
                                        <div style={{ position: 'relative', marginTop: '0.5rem', display: 'inline-block', maxWidth: '300px', width: '100%' }}>
                                            <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                <img
                                                    src={uploadedImageUrl}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        display: 'block'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); handleRemoveImage(); }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s',
                                                        zIndex: 20
                                                    }}
                                                    title="Remove Selection"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={14} /> Ready to save
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '8px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                            <Plus size={24} />
                                            <span style={{ fontSize: '0.9rem', marginTop: '4px' }}>Click to Upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.fullWidth}>
                                <button type="submit" disabled={isSubmitting || isUploading || !uploadedImageUrl} className={styles.btnAddNew} style={{ opacity: (isSubmitting || isUploading || !uploadedImageUrl) ? 0.7 : 1, display: 'flex', gap: '8px' }}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    {isSubmitting ? 'Saving...' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading gallery...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {galleryItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {item.src && (
                                                <img src={item.src} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            )}
                                            <span style={{ fontWeight: 500 }}>{item.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td>{item.size}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className={`${styles.btnIcon} delete`}
                                            title="Delete"
                                            disabled={deletingId === item.id}
                                            style={{
                                                cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                                                opacity: deletingId === item.id ? 0.7 : 1
                                            }}
                                        >
                                            {deletingId === item.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
                }
                {
                    !isLoading && galleryItems.length === 0 && (
                        <div className={styles.emptyState} style={{ border: 'none' }}>
                            No images found.
                        </div>
                    )
                }
            </div >
        </div >
    );
}

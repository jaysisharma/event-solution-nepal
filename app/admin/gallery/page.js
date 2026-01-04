export const dynamic = "force-dynamic";

'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { createGalleryItem, deleteGalleryItem, getGalleryItems } from './actions';
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
    const [snackbar, setSnackbar] = useState(null);

    // Form inputs
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Wedding');
    const [size, setSize] = useState('normal');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setIsLoading(true);
        const res = await getGalleryItems();
        if (res.success) setGalleryItems(res.data);
        setIsLoading(false);
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            const objectUrl = URL.createObjectURL(f);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('size', size);

            if (file) {
                const compressed = await compressImage(file);
                formData.append('src', compressed);
            }

            const res = await createGalleryItem(formData);
            if (res.success) {
                setSnackbar({ message: 'Image added successfully!', type: 'success' });
                // Reset form
                setTitle('');
                setCategory('Wedding');
                setSize('normal');
                setFile(null);
                setPreview(null);
                fetchGallery();
            } else {
                setSnackbar({ message: res.error || 'Failed to add image', type: 'error' });
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
        const res = await deleteGalleryItem(id);
        if (res.success) {
            setSnackbar({ message: 'Image deleted', type: 'success' });
            fetchGallery();
        } else {
            setSnackbar({ message: res.error || 'Failed to delete', type: 'error' });
        }
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Gallery</h1>
                    <p className={styles.pageSubtitle}>Manage your image gallery</p>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Add Gallery Item</h3>
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
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Gallery Image</label>
                        <input
                            onChange={handleFileChange}
                            type="file"
                            accept="image/*"
                            className={styles.input}
                            style={{ paddingTop: '0.7rem' }}
                            required
                        />
                        {preview && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #3b82f6' }} />
                            </div>
                        )}
                    </div>
                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnPrimary} style={{ opacity: isSubmitting ? 0.7 : 1, display: 'flex', gap: '8px' }}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            {isSubmitting ? 'Uploading...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>

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
                                        <button onClick={() => handleDelete(item.id)} className={`${styles.btnIcon} delete`} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && galleryItems.length === 0 && (
                    <div className={styles.emptyState} style={{ border: 'none' }}>
                        No images found.
                    </div>
                )}
            </div>
        </div>
    );
}

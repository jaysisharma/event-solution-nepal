'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Save, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { getHeroSlides, createHeroSlide, deleteHeroSlide, updateHeroSlide } from './actions';
import styles from '../admin.module.css';

// --- Reusable UI Components ---

const Snackbar = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#10b981' : '#ef4444';

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: bgColor,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={16} />
            </button>
        </div>
    );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#dc2626' }}>
                    <AlertTriangle size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{title}</h3>
                </div>
                <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#64748b',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function HeroAdminPage() {
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI State
    const [snackbar, setSnackbar] = useState(null); // { message, type }
    const [deleteId, setDeleteId] = useState(null); // ID to delete for dialog

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [label, setLabel] = useState('');
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');

    // Slide-Specific Stats State
    const [rating, setRating] = useState('4.9');
    const [ratingLabel, setRatingLabel] = useState('Average Rating');
    const [ratingIcon, setRatingIcon] = useState('Star');
    const [capacity, setCapacity] = useState('Handling events up to 10k guests.');
    const [capacityLabel, setCapacityLabel] = useState('Capacity');
    const [capacityIcon, setCapacityIcon] = useState('Users');

    const fetchSlides = React.useCallback(async () => {
        setIsLoading(true);
        const res = await getHeroSlides();
        if (res.success) {
            setSlides(res.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        fetchSlides();
    }, [fetchSlides]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = (slide) => {
        setEditingId(slide.id);
        setLabel(slide.label);
        setTitle(slide.title);
        setPreview(slide.image);
        setImage(null);

        setRating(slide.rating || '4.9');
        setRatingLabel(slide.ratingLabel || 'Average Rating');
        setRatingIcon(slide.ratingIcon || 'Star');
        setCapacity(slide.capacity || 'Handling events up to 10k guests.');
        setCapacityLabel(slide.capacityLabel || 'Capacity');
        setCapacityIcon(slide.capacityIcon || 'Users');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setLabel('');
        setTitle('');
        setImage(null);
        setPreview('');
        setRating('4.9');
        setRatingLabel('Average Rating');
        setRatingIcon('Star');
        setCapacity('Handling events up to 10k guests.');
        setCapacityLabel('Capacity');
        setCapacityIcon('Users');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingId && !image) {
            setSnackbar({ message: 'Please select an image', type: 'error' });
            return;
        }
        if (!label || !title) return;

        setIsSubmitting(true);
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('label', label);
        formData.append('title', title);

        // Append Stats
        formData.append('rating', rating);
        formData.append('ratingLabel', ratingLabel);
        formData.append('ratingIcon', ratingIcon);
        formData.append('capacity', capacity);
        formData.append('capacityLabel', capacityLabel);
        formData.append('capacityIcon', capacityIcon);

        let res;
        if (editingId) {
            res = await updateHeroSlide(editingId, formData);
        } else {
            res = await createHeroSlide(formData);
        }

        if (res.success) {
            handleCancelEdit();
            fetchSlides();
            setSnackbar({
                message: editingId ? 'Slide updated successfully!' : 'Slide created successfully!',
                type: 'success'
            });
        } else {
            setSnackbar({ message: 'Operation failed', type: 'error' });
        }
        setIsSubmitting(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        const res = await deleteHeroSlide(deleteId);
        if (res.success) {
            fetchSlides();
            if (editingId === deleteId) handleCancelEdit();
            setSnackbar({ message: 'Slide deleted successfully', type: 'success' });
        } else {
            setSnackbar({ message: 'Failed to delete slide', type: 'error' });
        }
        setDeleteId(null);
    };

    return (
        <div>
            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!deleteId}
                title="Delete Slide"
                message="Are you sure you want to delete this slide? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Manage Hero Slides</h1>
                    <p className={styles.pageSubtitle}>Add or update slides with stats for the carousel</p>
                </div>
            </div>

            <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Form (Create or Edit) */}
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className={styles.cardTitle}>
                            {editingId ? 'Edit Slide' : 'Add New Slide'}
                        </h2>
                        {editingId && (
                            <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                                <X size={16} style={{ marginRight: '4px' }} /> Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.formGroup} style={{ gap: '1.5rem' }}>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                {editingId ? 'Change Image (Optional)' : 'Upload Image (Square 1:1 Recommended)'}
                            </label>
                            <div style={{
                                border: '2px dashed var(--border)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                textAlign: 'center',
                                position: 'relative',
                                cursor: 'pointer',
                                background: '#f8fafc'
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                    required={!editingId}
                                />
                                {preview ? (
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '4px' }} />
                                ) : (
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        <ImageIcon size={32} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                                        <span style={{ fontSize: '0.85rem' }}>Click to upload</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Label (e.g. Latest Project)</label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Title (e.g. Tech Summit)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        {/* Slide Stats */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '1rem' }}>Slide Specific Stats</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Rating Value</label>
                                    <input type="text" value={rating} onChange={(e) => setRating(e.target.value)} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Rating Label</label>
                                    <input type="text" value={ratingLabel} onChange={(e) => setRatingLabel(e.target.value)} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Icon</label>
                                    <select value={ratingIcon} onChange={(e) => setRatingIcon(e.target.value)} className={styles.input}>
                                        <option value="Star">Star</option>
                                        <option value="Heart">Heart</option>
                                        <option value="Trophy">Trophy</option>
                                        <option value="ShieldCheck">Shield</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Capacity Value</label>
                                    <input type="text" value={capacity} onChange={(e) => setCapacity(e.target.value)} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Capacity Label</label>
                                    <input type="text" value={capacityLabel} onChange={(e) => setCapacityLabel(e.target.value)} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Icon</label>
                                    <select value={capacityIcon} onChange={(e) => setCapacityIcon(e.target.value)} className={styles.input}>
                                        <option value="Users">Users</option>
                                        <option value="Globe">Globe</option>
                                        <option value="Building">Building</option>
                                        <option value="PartyPopper">Party</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.btnAddNew}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {isSubmitting ? 'Saving...' : (
                                editingId ? <><Save size={18} /> Update Slide</> : <><Plus size={18} /> Add Slide</>
                            )}
                        </button>
                    </form>
                </div>

                {/* List Slides */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Current Slides</h2>

                    {isLoading ? (
                        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                    ) : slides.length === 0 ? (
                        <div className={styles.emptyState}>No slides found. Add one to get started.</div>
                    ) : (
                        <div className={styles.listStack}>
                            {slides.map((slide) => (
                                <div key={slide.id} className={styles.listItem} style={{ borderColor: editingId === slide.id ? 'var(--primary)' : '' }}>
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemImageWrapper} style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9' }}>
                                            <img
                                                src={slide.image}
                                                alt={slide.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>{slide.label}</p>
                                            <h4>{slide.title}</h4>
                                            <p style={{ fontSize: '0.7em', color: '#64748b' }}>
                                                Stat: {slide.rating} / {slide.capacity}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(slide)}
                                            className={styles.btnIcon}
                                            title="Edit Slide"
                                            style={{ color: '#0ea5e9', background: '#f0f9ff' }}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(slide.id)}
                                            className={`${styles.btnIcon} delete`}
                                            title="Delete Slide"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
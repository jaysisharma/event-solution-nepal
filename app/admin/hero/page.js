'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Save, AlertTriangle, CheckCircle, AlertCircle, Star, Users, Globe, Building, Heart, Trophy, ShieldCheck, PartyPopper } from 'lucide-react';
import { getHeroSlides, createHeroSlide, deleteHeroSlide, updateHeroSlide } from './actions';
import styles from '../admin.module.css';

// --- Icon Mapping ---
const IconMap = {
    Star: <Star size={16} />,
    Heart: <Heart size={16} />,
    Trophy: <Trophy size={16} />,
    ShieldCheck: <ShieldCheck size={16} />,
    Users: <Users size={16} />,
    Globe: <Globe size={16} />,
    Building: <Building size={16} />,
    PartyPopper: <PartyPopper size={16} />
};

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
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
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
            zIndex: 999,
            backdropFilter: 'blur(4px)'
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{title}</h3>
                </div>
                <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onCancel} className={styles.btnSecondary}>Cancel</button>
                    <button
                        onClick={onConfirm}
                        className={styles.btnAddNew}
                        style={{ backgroundColor: '#dc2626' }}
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
    const [snackbar, setSnackbar] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

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

            <div className={styles.formGrid}>
                {/* Form (Create or Edit) */}
                <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className={styles.cardTitle}>
                            {editingId ? <><Pencil size={18} /> Edit Slide</> : <><Plus size={18} /> Add New Slide</>}
                        </h2>
                        {editingId && (
                            <button onClick={handleCancelEdit} className={styles.btnSecondary} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                <X size={14} /> Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.formGroup} style={{ gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Slide Image</label>
                                <div
                                    onClick={() => document.getElementById('slideImageInput').click()}
                                    style={{
                                        border: '2px dashed var(--border-soft)',
                                        borderRadius: '12px',
                                        height: '240px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: '#f8fafc',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-soft)'}
                                >
                                    <input
                                        id="slideImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                        required={!editingId}
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                            <ImageIcon size={40} style={{ marginBottom: '0.5rem' }} />
                                            <p style={{ fontSize: '0.85rem' }}>Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Label (e.g. Latest Project)</label>
                                        <input
                                            type="text"
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                            className={styles.input}
                                            required
                                            placeholder="Latest Event"
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
                                            placeholder="Mega Concert 2024"
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Slide Stats
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Rating Value</label>
                                            <input type="text" value={rating} onChange={(e) => setRating(e.target.value)} className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Rating Label</label>
                                            <input type="text" value={ratingLabel} onChange={(e) => setRatingLabel(e.target.value)} className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Rating Icon</label>
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
                                            <label className={styles.label}>Capacity Icon</label>
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
                                    style={{ alignSelf: 'flex-end', padding: '0.75rem 2rem' }}
                                >
                                    {isSubmitting ? 'Saving...' : (
                                        editingId ? <><Save size={18} /> Update Slide</> : <><Plus size={18} /> Save Slide</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 className={styles.cardTitle} style={{ marginBottom: '1.5rem' }}>Current Slides ({slides.length})</h2>

                {isLoading ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--text-tertiary)' }}>Loading slides...</p>
                    </div>
                ) : slides.length === 0 ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '4rem' }}>
                        <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
                        <h3 style={{ color: 'var(--text-secondary)' }}>No slides found</h3>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Add your first hero slide to showcase on the homepage!</p>
                    </div>
                ) : (
                    <div className={styles.gridList}>
                        {slides.map((slide) => (
                            <div key={slide.id} className={styles.heroCard}>
                                <img src={slide.image} alt={slide.title} className={styles.heroCardImage} />
                                <div className={styles.heroCardBody}>
                                    <span className={styles.heroCardLabel}>{slide.label}</span>
                                    <h3 className={styles.heroCardTitle}>{slide.title}</h3>

                                    <div className={styles.heroCardStats}>
                                        <div className={styles.heroStatItem}>
                                            <div className={styles.heroStatIcon}>
                                                {IconMap[slide.ratingIcon || 'Star']}
                                            </div>
                                            <div className={styles.heroStatText}>
                                                <span className={styles.heroStatValue}>{slide.rating}</span>
                                                <span className={styles.heroStatLabel}>{slide.ratingLabel}</span>
                                            </div>
                                        </div>
                                        <div className={styles.heroStatItem}>
                                            <div className={styles.heroStatIcon}>
                                                {IconMap[slide.capacityIcon || 'Users']}
                                            </div>
                                            <div className={styles.heroStatText}>
                                                <span className={styles.heroStatValue}>{slide.capacity}</span>
                                                <span className={styles.heroStatLabel}>{slide.capacityLabel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.heroCardActions}>
                                    <button
                                        onClick={() => handleEdit(slide)}
                                        className={styles.btnIcon}
                                        title="Edit Slide"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(slide.id)}
                                        className={styles.btnIcon}
                                        style={{ color: '#ef4444' }}
                                        title="Delete Slide"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
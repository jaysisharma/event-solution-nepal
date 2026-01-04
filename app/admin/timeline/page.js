
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Save, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { getTimelineMemories, createTimelineMemory, updateTimelineMemory, deleteTimelineMemory } from './actions';
import styles from '../admin.module.css';

import { compressImage } from '@/lib/compress';

// --- Reusable UI Components ---
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

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
            <div style={{
                backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#dc2626' }}>
                    <AlertTriangle size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{title}</h3>
                </div>
                <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onCancel} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={onConfirm} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default function TimelineAdminPage() {
    const [memories, setMemories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null); // New: Track which item is being edited

    // Form State
    const [alt, setAlt] = useState('');
    const [year, setYear] = useState('');
    const [size, setSize] = useState('normal');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');

    const fetchMemories = React.useCallback(async () => {
        setIsLoading(true);
        const res = await getTimelineMemories();
        if (res.success) {
            setMemories(res.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        fetchMemories();
    }, [fetchMemories]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Validation Logic
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            // 2. Compression (Validation Removed for Flexibility)
            /* 
               User requested "whatever size", so strict ratio warnings are removed.
               Frontend will handle auto-height.
            */

            // 2. Compression
            try {
                const compressedFile = await compressImage(file);
                setImage(compressedFile);
                setPreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Compression Error:", error);
                setSnackbar({ message: 'Compression failed', type: 'error' });
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Image is required only for CREATE, optional for UPDATE
        if (!editingId && !image) {
            setSnackbar({ message: 'Please select an image', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('alt', alt);
        formData.append('year', year);
        formData.append('size', 'normal');

        let res;
        if (editingId) {
            res = await updateTimelineMemory(editingId, formData);
        } else {
            res = await createTimelineMemory(formData);
        }

        if (res.success) {
            fetchMemories();
            // Reset Form
            setAlt('');
            setYear('');
            setSize('normal');
            setImage(null);
            setPreview('');
            setEditingId(null); // Exit edit mode
            setSnackbar({ message: editingId ? 'Memory updated!' : 'Memory added!', type: 'success' });
        } else {
            setSnackbar({ message: 'Operation failed', type: 'error' });
        }
        setIsSubmitting(false);
    };

    const handleEdit = (memory) => {
        setEditingId(memory.id);
        setAlt(memory.alt);
        setYear(memory.year);
        // If API returned size, set it, though we force 'normal' on save
        // Set preview to existing image so user sees what they are editing
        setPreview(memory.image);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setAlt('');
        setYear('');
        setImage(null);
        setPreview('');
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        const res = await deleteTimelineMemory(deleteId);
        if (res.success) {
            fetchMemories();
            setSnackbar({ message: 'Memory deleted successfully', type: 'success' });
        } else {
            setSnackbar({ message: 'Failed to delete memory', type: 'error' });
        }
        setDeleteId(null);
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}
            <ConfirmDialog isOpen={!!deleteId} title="Delete Memory" message="Are you sure? This cannot be undone." onConfirm={handleConfirmDelete} onCancel={() => setDeleteId(null)} />

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Manage Timeline</h1>
                    <p className={styles.pageSubtitle}>Add photos to your timeline journey</p>
                </div>
            </div>

            <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className={styles.cardTitle}>{editingId ? 'Edit Memory' : 'Add New Memory'}</h2>
                        {editingId && (
                            <button onClick={handleCancelEdit} style={{ fontSize: '0.875rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className={styles.formGroup} style={{ gap: '1.5rem' }}>

                        {/* Size Selection Removed - Auto handled */}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Upload Photo</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center', position: 'relative', cursor: 'pointer', background: 'var(--bg-secondary, #f8fafc)' }}>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} required />
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
                            <label className={styles.label}>Caption / Title</label>
                            <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} className={styles.input} placeholder="e.g. First Big Event" required />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Year</label>
                            <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className={styles.input} placeholder="e.g. 2023" required />
                        </div>

                        <button type="submit" disabled={isSubmitting} className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
                            {isSubmitting ? 'Saving...' : <>{editingId ? <Save size={18} /> : <Plus size={18} />} {editingId ? 'Update Memory' : 'Add Memory'}</>}
                        </button>
                    </form>
                </div>

                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Current Timeline</h2>
                    {isLoading ? <p>Loading...</p> : memories.length === 0 ? <div className={styles.emptyState}>No memories found.</div> : (
                        <div className={styles.listStack}>
                            {memories.map((m) => (
                                <div key={m.id} className={styles.listItem}>
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemImageWrapper} style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={m.image} alt={m.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{m.year} • {m.size}</p>
                                            <h4>{m.alt}</h4>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEdit(m)} className={`${styles.btnIcon}`} title="Edit"><Pencil size={18} /></button>
                                        <button onClick={() => setDeleteId(m.id)} className={`${styles.btnIcon} delete`} title="Delete"><Trash2 size={18} /></button>
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

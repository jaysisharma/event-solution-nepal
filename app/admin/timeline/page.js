'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Save, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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



export default function TimelineAdminPage() {
    const [memories, setMemories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Form Toggle
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [alt, setAlt] = useState('');
    const [year, setYear] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploadTime, setUploadTime] = useState(null);

    const fetchMemories = React.useCallback(async () => {
        setIsLoading(true);
        const res = await getTimelineMemories();
        if (res.success) {
            setMemories(res.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchMemories();
    }, [fetchMemories]);

    // --- Handlers ---
    const handleAddClick = () => {
        setEditingId(null);
        setAlt('');
        setYear('');
        setImage(null);
        setPreview('');
        setShowForm(true);
    };

    const handleEditClick = (memory) => {
        setEditingId(memory.id);
        setAlt(memory.alt);
        setYear(memory.year);
        setPreview(memory.image);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setAlt('');
        setYear('');
        setImage(null);
        setPreview('');
        setUploadTime(null);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        // Calc time
        const sizeInMB = file.size / (1024 * 1024);
        const estTime = Math.ceil(sizeInMB * 2); // 0.5MB/s => 2s per MB
        setUploadTime(estTime < 1 ? '< 1s' : `~${estTime}s`);

        try {
            const compressedFile = await compressImage(file);
            setImage(compressedFile);
        } catch (error) {
            console.error("Compression Error:", error);
            setSnackbar({ message: 'Compression failed', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            handleCancelForm();
            setSnackbar({ message: editingId ? 'Memory updated!' : 'Memory added!', type: 'success' });
        } else {
            setSnackbar({ message: 'Operation failed', type: 'error' });
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this memory?')) return;

        setDeletingId(id);
        const res = await deleteTimelineMemory(id);

        if (res.success) {
            fetchMemories();
            setSnackbar({ message: 'Memory deleted successfully', type: 'success' });
        } else {
            setSnackbar({ message: 'Failed to delete memory', type: 'error' });
        }
        setDeletingId(null);
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Timeline</h1>
                </div>
                {!showForm && (
                    <button onClick={handleAddClick} className={styles.btnAddNew}>
                        <Plus size={18} /> Add New
                    </button>
                )}
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className={styles.timelineFormCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{editingId ? 'Edit Memory' : 'Add New Memory'}</h3>
                        <button onClick={handleCancelForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.timelineFormLayout}>
                        {/* Image Input */}
                        <div className={styles.timelineImageSection}>
                            <div className={styles.timelineImageUpload}>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                                {preview ? (
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                            </div>
                            {uploadTime && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                                    Est: {uploadTime}
                                </div>
                            )}
                        </div>

                        {/* Fields */}
                        <div className={styles.timelineFieldsSection}>
                            <div className={styles.timelineInputRow} style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 3 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Caption</label>
                                    <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} placeholder="Event Title" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Year</label>
                                    <input type="text" value={year} onChange={(e) => setYear(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} placeholder="2024" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    {isSubmitting ? 'Saving...' : 'Save Memory'}
                                </button>
                                <button type="button" onClick={handleCancelForm} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Minimal Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Image</th>
                            <th>Caption</th>
                            <th>Year</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</td></tr>
                        ) : memories.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No data found.</td></tr>
                        ) : (
                            memories.map((m) => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9' }}>
                                            <img src={m.image} alt={m.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{m.alt}</td>
                                    <td style={{ color: '#64748b' }}>{m.year}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditClick(m)} className={styles.btnIcon} title="Edit">
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className={styles.btnIcon}
                                                style={{
                                                    color: '#ef4444',
                                                    cursor: deletingId === m.id ? 'not-allowed' : 'pointer',
                                                    opacity: deletingId === m.id ? 0.7 : 1
                                                }}
                                                title="Delete"
                                                disabled={deletingId === m.id}
                                            >
                                                {deletingId === m.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

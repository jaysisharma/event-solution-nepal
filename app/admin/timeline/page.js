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
    const [editingId, setEditingId] = useState(null);

    // Form Toggle
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [alt, setAlt] = useState('');
    const [year, setYear] = useState('');
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
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

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
        <div style={{ paddingBottom: '4rem' }}>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}
            <ConfirmDialog isOpen={!!deleteId} title="Delete Memory" message="Are you sure?" onConfirm={handleConfirmDelete} onCancel={() => setDeleteId(null)} />

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
                <div style={{
                    marginBottom: '2rem',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{editingId ? 'Edit Memory' : 'Add New Memory'}</h3>
                        <button onClick={handleCancelForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Image Input */}
                        <div style={{ width: '120px', height: '120px', flexShrink: 0, position: 'relative', border: '1px dashed #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                            {preview ? (
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                    <ImageIcon size={24} />
                                </div>
                            )}
                        </div>

                        {/* Fields */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Caption</label>
                                    <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Event Title" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Year</label>
                                    <input type="text" value={year} onChange={(e) => setYear(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="2024" />
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
                                            <button onClick={() => handleEditClick(m)} style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => setDeleteId(m.id)} style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete">
                                                <Trash2 size={16} />
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

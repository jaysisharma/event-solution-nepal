export const dynamic = "force-dynamic";

'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Save, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { createTeamMember, updateTeamMember, deleteTeamMember, getTeamMembers } from './actions';
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

export default function AdminTeam() {
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setIsLoading(true);
        const res = await getTeamMembers();
        if (res.success) setTeam(res.data);
        setIsLoading(false);
    };

    const handleEdit = (member) => {
        setEditingId(member.id);
        setName(member.name);
        setRole(member.role);
        setExistingImage(member.image);
        setFile(null);
        setPreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setRole('');
        setFile(null);
        setPreview(null);
        setExistingImage(null);
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
            formData.append('name', name);
            formData.append('role', role);

            if (file) {
                const compressed = await compressImage(file);
                formData.append('image', compressed);
            }

            let res;
            if (editingId) {
                res = await updateTeamMember(editingId, formData);
            } else {
                res = await createTeamMember(formData);
            }

            if (res.success) {
                setSnackbar({ message: editingId ? 'Member updated successfully!' : 'Team member added successfully!', type: 'success' });
                handleCancelEdit();
                fetchTeam();
            } else {
                setSnackbar({ message: res.error || 'Operation failed', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ message: 'Unexpected error', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this member?')) return;
        const res = await deleteTeamMember(id);
        if (res.success) {
            setSnackbar({ message: 'Member deleted', type: 'success' });
            fetchTeam();
        } else {
            setSnackbar({ message: res.error || 'Failed to delete', type: 'error' });
        }
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Team</h1>
                    <p className={styles.pageSubtitle}>Manage your team members</p>
                </div>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className={styles.cardTitle}>{editingId ? 'Edit Member' : 'Add Team Member'}</h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} style={{ fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            required
                            placeholder="Full Name"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Role</label>
                        <input
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            type="text"
                            required
                            placeholder="e.g. CEO, Event Manager"
                            className={styles.input}
                        />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Profile Image</label>
                        <input
                            onChange={handleFileChange}
                            type="file"
                            accept="image/*"
                            className={styles.input}
                            style={{ paddingTop: '0.7rem' }}
                        />
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {preview ? (
                                <img src={preview} alt="New Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #3b82f6' }} />
                            ) : (
                                editingId && existingImage && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current:</span>
                                        <img src={existingImage} alt="Current" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '1px solid #e2e8f0' }} />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnPrimary} style={{ opacity: isSubmitting ? 0.7 : 1, display: 'flex', gap: '8px' }}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                            {isSubmitting ? 'Saving...' : (editingId ? 'Update Member' : 'Add Member')}
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading team...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map(member => (
                                <tr key={member.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {member.image && (
                                                <img src={member.image} alt={member.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                                            )}
                                            <span style={{ fontWeight: 500 }}>{member.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.badge} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(member)} className={styles.btnIcon} title="Edit">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className={`${styles.btnIcon} delete`} title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && team.length === 0 && (
                    <div className={styles.emptyState} style={{ border: 'none' }}>
                        No team members found.
                    </div>
                )}
            </div>
        </div>
    );
}

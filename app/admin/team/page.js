
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Save, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { createTeamMember, updateTeamMember, deleteTeamMember, getTeamMembers, uploadTeamImage, deleteTeamImageAction } from './actions';
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
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    // const [file, setFile] = useState(null); // No longer needed
    // const [preview, setPreview] = useState(null); // No longer needed
    const [uploadTime, setUploadTime] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setIsLoading(true);
        const res = await getTeamMembers();
        if (res.success) setTeam(res.data);
        setIsLoading(false);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setName('');
        setRole('');
        // setFile(null);
        // setPreview(null);
        setExistingImage(null);
        setUploadedImageUrl(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (member) => {
        setEditingId(member.id);
        setName(member.name);
        setRole(member.role);
        setExistingImage(member.image);
        setUploadedImageUrl(null);
        // setFile(null);
        // setPreview(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = async () => {
        // Clean up uncommitted upload
        if (uploadedImageUrl) {
            await deleteTeamImageAction(uploadedImageUrl);
        }
        setShowForm(false);
        setEditingId(null);
        setName('');
        setRole('');
        // setFile(null);
        // setPreview(null);
        setExistingImage(null);
        setUploadedImageUrl(null);
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];

            // Background Upload
            setIsUploading(true);
            setUploadTime("Uploading...");
            try {
                // Auto Cleanup old upload if replacing before submit
                if (uploadedImageUrl) {
                    await deleteTeamImageAction(uploadedImageUrl);
                }

                const compressed = await compressImage(f);

                const formData = new FormData();
                formData.append('image', compressed);
                formData.append('folder', 'team');

                const response = await uploadTeamImage(formData);

                if (response.success && response.url) {
                    setUploadedImageUrl(response.url);
                    setUploadTime("Upload Complete");
                } else {
                    setUploadTime("Failed");
                    setSnackbar({ message: response.error || 'Upload failed', type: 'error' });
                }
            } catch (err) {
                console.error("Upload Error", err);
                setUploadTime("Error");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveImage = async () => {
        if (uploadedImageUrl) {
            await deleteTeamImageAction(uploadedImageUrl);
            setUploadedImageUrl(null);
            setUploadTime(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isUploading) {
            setSnackbar({ message: 'Please wait for image upload', type: 'warning' });
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('role', role);

            // Use uploaded URL if available
            if (uploadedImageUrl) {
                formData.append('image', uploadedImageUrl);
            }

            let res;
            if (editingId) {
                res = await updateTeamMember(editingId, formData);
            } else {
                res = await createTeamMember(formData);
            }

            if (res.success) {
                setSnackbar({ message: editingId ? 'Member updated successfully!' : 'Team member added successfully!', type: 'success' });
                // Don't call handleCancelEdit directly because we don't want to delete the image we just saved to DB
                // Instead, just clear state
                setShowForm(false);
                setEditingId(null);
                setName('');
                setRole('');
                setExistingImage(null);
                setUploadedImageUrl(null);

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

        setDeletingId(id);
        const res = await deleteTeamMember(id);

        if (res.success) {
            setSnackbar({ message: 'Member deleted', type: 'success' });
            fetchTeam();
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
                    <h1 className={styles.pageTitle}>Team</h1>
                    <p className={styles.pageSubtitle}>Manage your team members</p>
                </div>
                {!showForm && (
                    <button onClick={handleAddNew} className={styles.btnAddNew}>
                        <Plus size={18} /> Add New Member
                    </button>
                )}
            </div>

            {showForm && (
                <div style={{ marginBottom: '2rem', animation: 'slideDown 0.3s ease-out' }}>
                    <div className={styles.card} style={{ border: '1px solid #3b82f6', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 className={styles.cardTitle} style={{ margin: 0, color: '#3b82f6' }}>{editingId ? 'Edit Member' : 'Add Team Member'}</h3>
                            <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isUploading ? (
                                            <Loader2 size={24} className="animate-spin" style={{ color: '#64748b' }} />
                                        ) : uploadedImageUrl ? (
                                            <>
                                                <img src={uploadedImageUrl} alt="New" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', color: 'white', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </>
                                        ) : existingImage ? (
                                            <img src={existingImage} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ color: '#94a3b8' }}>N/A</div>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            onChange={handleFileChange}
                                            type="file"
                                            accept="image/*"
                                            className={styles.input}
                                            disabled={isUploading}
                                            style={{ paddingTop: '0.7rem' }}
                                        />
                                        {uploadTime && !isUploading && (
                                            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={14} /> Ready to save
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.fullWidth}>
                                <button type="submit" disabled={isSubmitting || isUploading} className={styles.btnAddNew} style={{ opacity: (isSubmitting || isUploading) ? 0.7 : 1, display: 'flex', gap: '8px' }}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Member' : 'Add Member')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className={styles.btnIcon}
                                                title="Edit"
                                                disabled={deletingId === member.id}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className={`${styles.btnIcon} delete`}
                                                title="Delete"
                                                disabled={deletingId === member.id}
                                                style={{
                                                    cursor: deletingId === member.id ? 'not-allowed' : 'pointer',
                                                    opacity: deletingId === member.id ? 0.7 : 1
                                                }}
                                            >
                                                {deletingId === member.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
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

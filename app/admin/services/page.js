
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createService, updateService, deleteService, getServices } from './actions';

import styles from '../admin.module.css';
import { compressImage } from '@/lib/compress';

// Reuse Snackbar from projects page concept
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

export default function AdminServices() {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadTime, setUploadTime] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        const res = await getServices();
        if (res.success) setServices(res.data);
        setIsLoading(false);
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        setTitle(service.title);
        setDescription(service.description);

        // Parse tags
        try {
            const parsedTags = JSON.parse(service.tags);
            setTags(Array.isArray(parsedTags) ? parsedTags.join(', ') : service.tags);
        } catch (e) {
            setTags(service.tags);
        }

        setExistingImage(service.image);
        setPreview(null); // Clear any new upload preview
        setFile(null);
        setUploadTime(null); // Clear upload time on edit
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setTags('');
        setFile(null);
        setPreview(null);
        setExistingImage(null);
        setUploadTime(null);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));

            // Calculate estimated upload time
            const sizeInMB = selectedFile.size / (1024 * 1024);
            const estTime = Math.ceil(sizeInMB * 2); // Assuming 0.5 MB/s upload speed, so 2 seconds per MB
            setUploadTime(estTime < 1 ? '< 1s' : `~${estTime}s`);
        } else {
            setFile(null);
            setPreview(null);
            setUploadTime(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        setDeletingId(id);
        try {
            const res = await deleteService(id);
            if (res.success) {
                setSnackbar({ message: 'Service deleted successfully', type: 'success' });
                fetchServices();
            } else {
                setSnackbar({ message: res.error || 'Failed to delete service', type: 'error' });
            }
        } catch (error) {
            console.error("Delete Error:", error);
            setSnackbar({ message: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('tags', tags);
            if (file) {
                const compressed = await compressImage(file);
                formData.append('image', compressed);
            }

            let res;
            if (editingId) {
                res = await updateService(editingId, formData);
            } else {
                res = await createService(formData);
            }

            if (res.success) {
                setSnackbar({ message: editingId ? 'Service updated successfully!' : 'Service created successfully!', type: 'success' });
                handleCancelEdit();
                fetchServices();
            } else {
                setSnackbar({ message: res.error || 'Operation failed', type: 'error' });
            }
        } catch (error) {
            console.error("Submission Error:", error);
            setSnackbar({ message: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Services</h1>
                    <p className={styles.pageSubtitle}>Manage your service offerings</p>
                </div>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className={styles.cardTitle}>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} style={{ fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            required
                            placeholder="Service Name"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Service Image</label>
                        <input
                            onChange={handleFileChange}
                            type="file"
                            accept="image/*"
                            className={styles.input}
                            style={{ paddingTop: '0.7rem' }}
                            required={!editingId && !file && !existingImage} // Required only on create if no file and no existing image
                        />
                        {/* Preview Logic */}
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {preview && (
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    {uploadTime && (
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                                            Est. Upload: {uploadTime}
                                        </div>
                                    )}
                                </div>
                            )}
                            {editingId && existingImage && !preview && ( // Show existing image only if editing and no new preview
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current:</span>
                                    <img src={existingImage} alt="Current" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Service description..."
                            className={styles.textarea}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Tags (Comma separated)</label>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            type="text"
                            placeholder="Strategy, Growth, Engagement"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnAddNew} style={{ display: 'flex', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                            {isSubmitting ? 'Saving...' : (editingId ? 'Update Service' : 'Add Service')}
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading services...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {service.image && (
                                                <img src={service.image} alt={service.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            )}
                                            <span style={{ fontWeight: 500 }}>{service.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '300px', color: '#64748b' }}>
                                        {service.description.substring(0, 60)}...
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className={styles.btnIcon}
                                                title="Edit"
                                                disabled={deletingId === service.id}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className={`${styles.btnIcon} delete`}
                                                title="Delete"
                                                disabled={deletingId === service.id}
                                                style={{
                                                    cursor: deletingId === service.id ? 'not-allowed' : 'pointer',
                                                    opacity: deletingId === service.id ? 0.7 : 1
                                                }}
                                            >
                                                {deletingId === service.id ? (
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
                {!isLoading && services.length === 0 && (
                    <div className={styles.emptyState} style={{ border: 'none' }}>
                        No services found.
                    </div>
                )}
            </div>
        </div>
    );
}

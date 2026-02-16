'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X, Save, CheckCircle, AlertCircle, Loader2, Star, Upload, GripVertical } from 'lucide-react';
import { createProject, updateProject, deleteProject, getProjects, toggleFeaturedProject, uploadProjectImage, deleteProjectImageAction, getProjectCategories, reorderProjects } from './actions';
import { motion, Reorder } from 'framer-motion';
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

export default function ProjectAdminPage() {
    const [projects, setProjects] = useState([]);
    const [categoriesList, setCategoriesList] = useState(['Wedding', 'Corporate', 'Concert', 'Social', 'Expo']);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isReordered, setIsReordered] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [category, setCategory] = useState('Wedding');
    const [customCategory, setCustomCategory] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [files, setFiles] = useState(null);
    const [previews, setPreviews] = useState([]);
    const [existingImagesState, setExistingImagesState] = useState([]);

    useEffect(() => {
        fetchProjects();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await getProjectCategories();
        if (res.success) {
            const defaults = ['Wedding', 'Corporate', 'Concert', 'Social', 'Expo'];
            const merged = Array.from(new Set([...defaults, ...res.data])).sort();
            setCategoriesList(merged);
        }
    };

    const fetchProjects = async () => {
        setIsLoading(true);
        const res = await getProjects();
        if (res.success) {
            setProjects(res.data);
            setIsReordered(false);
        }
        setIsLoading(false);
    };

    const handleReorder = (newOrder) => {
        setProjects(newOrder);
        setIsReordered(true);
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        const orderedIds = projects.map(p => p.id);
        try {
            const res = await reorderProjects(orderedIds);
            if (res.success) {
                setSnackbar({ message: 'Order saved successfully!', type: 'success' });
                setIsReordered(false);
            } else {
                setSnackbar({ message: res.message || 'Failed to save order', type: 'error' });
            }
        } catch (error) {
            setSnackbar({ message: 'An unexpected error occurred', type: 'error' });
        } finally {
            setIsSavingOrder(false);
        }
    };

    const validateYear = (val) => {
        const regex = /^\d{4}(-\d{4})?$/;
        return regex.test(val);
    };

    const handleEdit = (project) => {
        setEditingId(project.id);
        setTitle(project.title);
        setYear(project.year);
        setIsFeatured(project.isFeatured || false);

        if (categoriesList.includes(project.category)) {
            setCategory(project.category);
            setCustomCategory('');
        } else {
            setCategory('Other');
            setCustomCategory(project.category);
        }

        try {
            const imgs = JSON.parse(project.images);
            setExistingImagesState(imgs || []);
        } catch (e) {
            setExistingImagesState([]);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setYear('');
        setCategory(categoriesList[0] || 'Wedding');
        setCustomCategory('');
        setIsFeatured(false);
        setFiles(null);
        setPreviews([]);
        setUploadedUrls([]);
        setExistingImagesState([]);
    };

    const handleRemoveImage = (index) => {
        setExistingImagesState(prev => prev.filter((_, i) => i !== index));
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        setDeletingId(id);
        try {
            const res = await deleteProject(id);
            if (res.success) {
                setSnackbar({ message: 'Project deleted successfully', type: 'success' });
                fetchProjects();
            } else {
                setSnackbar({ message: res.error || 'Failed to delete project', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setSnackbar({ message: 'An unexpected error occurred', type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    const [uploadedUrls, setUploadedUrls] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            setUploadProgress(0);
            const newFiles = Array.from(e.target.files);
            const total = newFiles.length;
            let completed = 0;
            const newUrls = [];
            try {
                const uploadPromises = newFiles.map(async (file) => {
                    if (file && file.size > 0) {
                        try {
                            const compressed = await compressImage(file);
                            const formData = new FormData();
                            formData.append('image', compressed);
                            formData.append('folder', 'projects');
                            const res = await uploadProjectImage(formData);
                            if (res.success && res.url) {
                                completed++;
                                setUploadProgress(Math.floor((completed / total) * 100));
                                return res.url;
                            }
                        } catch (err) {
                            console.error("Single file upload error:", err);
                        }
                    }
                    return null;
                });
                const results = await Promise.all(uploadPromises);
                const successfulUrls = results.filter(u => u !== null);
                setUploadedUrls(prev => [...prev, ...successfulUrls]);
                if (successfulUrls.length < total) {
                    setSnackbar({ message: `${total - successfulUrls.length} images failed to upload`, type: 'warning' });
                } else {
                    setSnackbar({ message: 'All images uploaded ready for save', type: 'success' });
                }
            } catch (err) {
                console.error("Upload error", err);
                setSnackbar({ message: 'Error uploading images', type: 'error' });
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
                e.target.value = '';
            }
        }
    };

    const handleRemoveNewImage = async (index) => {
        const urlToRemove = uploadedUrls[index];
        if (urlToRemove) {
            await deleteProjectImageAction(urlToRemove);
        }
        setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUploading) {
            setSnackbar({ message: 'Please wait for images to finish uploading', type: 'warning' });
            return;
        }
        if (!validateYear(year)) {
            setSnackbar({ message: 'Invalid Year format. Use "2024" or "2024-2025".', type: 'error' });
            return;
        }
        const finalCategory = category === 'Other' ? customCategory.trim() : category;
        if (!finalCategory) {
            setSnackbar({ message: 'Please specify a category.', type: 'error' });
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('year', year);
            formData.append('category', finalCategory);
            formData.append('isFeatured', isFeatured);
            if (uploadedUrls.length > 0) {
                const fieldName = editingId ? 'newImages' : 'images';
                uploadedUrls.forEach(url => {
                    formData.append(fieldName, url);
                });
            } else if (files && files.length > 0) {
                const fieldName = editingId ? 'newImages' : 'images';
                for (let i = 0; i < files.length; i++) {
                    formData.append(fieldName, files[i]);
                }
            }
            let res;
            if (editingId) {
                formData.append('existingImages', JSON.stringify(existingImagesState));
                res = await updateProject(editingId, formData);
            } else {
                res = await createProject(formData);
            }
            if (res.success) {
                setSnackbar({ message: editingId ? 'Project updated successfully!' : 'Project created successfully!', type: 'success' });
                handleCancelEdit();
                fetchProjects();
                fetchCategories();
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
                    <h1 className={styles.pageTitle}>Projects</h1>
                    <p className={styles.pageSubtitle}>Showcase your portfolio</p>
                </div>
                {isReordered && (
                    <button
                        onClick={handleSaveOrder}
                        className={styles.btnAddNew}
                        style={{ backgroundColor: '#10b981' }}
                        disabled={isSavingOrder}
                    >
                        {isSavingOrder ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Order
                    </button>
                )}
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className={styles.cardTitle}>{editingId ? 'Edit Project' : 'Add New Project'}</h3>
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
                            placeholder="e.g. Royal Palace Wedding"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={styles.select}
                                style={{ flex: 1 }}
                            >
                                {categoriesList.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="Other">Other (Add New)</option>
                            </select>
                            {category === 'Other' && (
                                <input
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    type="text"
                                    placeholder="Enter Category"
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Year (Format: 2024 or 2024-2025)</label>
                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            type="text"
                            required
                            placeholder="e.g. 2024"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1.8rem' }}>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            id="isFeatured"
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isFeatured" className={styles.label} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Star size={16} fill={isFeatured ? "#f59e0b" : "none"} color={isFeatured ? "#f59e0b" : "#64748b"} />
                            Mark as Featured
                        </label>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                            {editingId ? 'Add More Images (Optional)' : 'Project Images'} <span style={{ fontSize: '0.8em', color: '#64748b', fontWeight: 400 }}>(Ratio 16:9)</span>
                        </label>
                        <input
                            onChange={handleFileChange}
                            type="file"
                            multiple
                            accept="image/*"
                            className={styles.input}
                            style={{ paddingTop: '0.7rem' }}
                            required={!editingId && uploadedUrls.length === 0}
                        />

                        {editingId && existingImagesState.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <label className={styles.label} style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Images:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {existingImagesState.map((img, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={img} alt={`Existing ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(i)}
                                                style={{
                                                    position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%',
                                                    width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uploadedUrls.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <label className={styles.label} style={{ fontSize: '0.8rem', color: '#64748b' }}>New Selection Preview:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {uploadedUrls.map((src, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={src} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3b82f6', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' }} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(i)}
                                                style={{
                                                    position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: '1px solid white', borderRadius: '50%',
                                                    width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                title="Remove Image"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Uploading... {uploadProgress}%</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnAddNew} style={{ display: 'flex', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                            {isSubmitting ? 'Saving...' : (editingId ? 'Update Project' : 'Add Project')}
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading projects...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Title</th>
                                <th style={{ textAlign: 'center' }}>Featured</th>
                                <th>Category</th>
                                <th>Year</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <Reorder.Group
                            as="tbody"
                            axis="y"
                            values={projects}
                            onReorder={handleReorder}
                        >
                            {projects.map(project => (
                                <Reorder.Item
                                    key={project.id}
                                    value={project}
                                    as="tr"
                                    className={`${styles.reorderItem}`}
                                    style={{
                                        background: 'var(--card-bg)',
                                        cursor: 'grab'
                                    }}
                                >
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                                            <GripVertical size={20} />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {(() => {
                                                try {
                                                    const imgs = JSON.parse(project.images);
                                                    if (imgs && imgs.length > 0) {
                                                        const firstImg = Array.isArray(imgs) ? imgs[0] : imgs;
                                                        return (
                                                            <img src={firstImg} alt="Thumbnail" className={styles.thumbnailSm} />
                                                        );
                                                    }
                                                } catch (e) { return null; }
                                            })()}
                                            <span style={{ fontWeight: 500 }}>{project.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await toggleFeaturedProject(project.id);
                                                fetchProjects();
                                            }}
                                            title={project.isFeatured ? "Unmark as Featured" : "Mark as Featured"}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Star size={20} fill={project.isFeatured ? "#f59e0b" : "transparent"} color={project.isFeatured ? "#f59e0b" : "#cbd5e1"} strokeWidth={2} />
                                        </button>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                            {project.category}
                                        </span>
                                    </td>
                                    <td>{project.year}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(project)} className={styles.btnIcon} title="Edit" disabled={deletingId === project.id}><Pencil size={18} /></button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className={styles.btnIconDanger}
                                                title="Delete"
                                                disabled={deletingId === project.id}
                                                style={{ cursor: deletingId === project.id ? 'not-allowed' : 'pointer', opacity: deletingId === project.id ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {deletingId === project.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </table>
                )}
                {!isLoading && projects.length === 0 && (
                    <div className={styles.emptyState} style={{ border: 'none' }}>No projects found.</div>
                )}
            </div>
        </div>
    );
}

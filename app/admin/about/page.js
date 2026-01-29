'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { getAboutData, updateAboutData, uploadAboutImage } from './actions';
import { Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import styles from './about.module.css';

export default function AdminAboutPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getAboutData();
        if (res.success && res.data) {
            setFormData(res.data);
        } else {
            showToast("Failed to load data", "error");
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('description', formData.description);

        const res = await updateAboutData(data);
        if (res.success) {
            showToast("About page updated!", "success");
        } else {
            showToast("Failed to update", "error");
        }
        setSaving(false);
    };

    const [previewUrl, setPreviewUrl] = useState('');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Immediate preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setUploading(true);

        const data = new FormData();
        data.append('image', file);

        try {
            const res = await uploadAboutImage(data);
            if (res.success) {
                setFormData(prev => ({ ...prev, image: res.url }));
                showToast("Image updated!", "success");
            } else {
                showToast("Image upload failed", "error");
                // Revert preview if failed
                setPreviewUrl('');
            }
        } catch (err) {
            console.error(err);
            showToast("Upload error", "error");
            setPreviewUrl('');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className={styles.loading}><Loader2 className="animate-spin" /></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Edit About Page</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                {/* Text Content Form */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Content Details</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Main Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Subtitle (Year/Intro)</label>
                            <textarea
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={3}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Full Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={styles.textarea}
                                style={{ minHeight: '200px' }}
                            />
                        </div>

                        <button type="submit" className={styles.button} disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Image Upload Section */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Featured Image</h2>

                    <div className={styles.imagePreview}>
                        {(previewUrl || formData.image) ? (
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: '8px', overflow: 'hidden' }}>
                                <Image
                                    src={previewUrl || formData.image}
                                    alt="About Hero"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div className={styles.placeholder}>
                                <ImageIcon size={48} color="#cbd5e1" />
                                <p>No image set</p>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label className={styles.uploadButton}>
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploading ? "Uploading..." : "Change Image"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                hidden
                                disabled={uploading}
                            />
                        </label>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                            Recommended: Vertical Portrait (4:5 or 3:4)
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

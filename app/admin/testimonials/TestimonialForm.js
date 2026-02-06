'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadTestimonialImage, deleteTestimonialImageAction, addTestimonial, updateTestimonial } from './actions';
import { Loader2, Upload, MessageSquare, User, Briefcase, Star, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import styles from '../admin.module.css';
import { compressImage } from '@/lib/compress';


export default function TestimonialForm({ testimonial = null }) {
    const isEdit = !!testimonial;
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    // const [imagePreview, setImagePreview] = useState(testimonial?.avatar || null); // Replaced by uploadedImageUrl
    const [uploadTime, setUploadTime] = useState(null);

    const [uploadedImageUrl, setUploadedImageUrl] = useState(testimonial?.avatar || null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Background Upload
            setIsUploading(true);
            setUploadTime("Uploading...");
            try {
                // Auto Cleanup
                if (uploadedImageUrl && uploadedImageUrl !== testimonial?.avatar) {
                    await deleteTestimonialImageAction(uploadedImageUrl);
                }

                const compressed = await compressImage(file);

                const formData = new FormData();
                formData.append('image', compressed);
                formData.append('folder', 'testimonials');

                const res = await uploadTestimonialImage(formData);

                if (res.success && res.url) {
                    setUploadedImageUrl(res.url);
                    setUploadTime("Upload Complete");
                } else {
                    setUploadTime("Failed");
                    showToast("Upload failed", "error");
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
        if (uploadedImageUrl && uploadedImageUrl !== testimonial?.avatar) {
            await deleteTestimonialImageAction(uploadedImageUrl);
        }
        setUploadedImageUrl(null);
        setUploadTime(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isUploading) {
            showToast("Please wait for image upload", "warning");
            return;
        }

        setLoading(true);

        const formData = new FormData(e.target);
        if (isEdit) {
            formData.append('id', testimonial.id);
        }

        if (uploadedImageUrl) {
            formData.append('image', uploadedImageUrl);
        }

        const action = isEdit ? updateTestimonial : addTestimonial;
        const result = await action(formData);

        if (result.success) {
            showToast(isEdit ? 'Testimonial updated successfully' : 'Testimonial added successfully', 'success');
            router.push('/admin/testimonials');
        } else {
            showToast(result.error || 'Something went wrong', 'error');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.card} style={{ maxWidth: '800px' }}>
            {/* Image Upload */}
            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Client Photo (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--light-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isUploading ? (
                            <Loader2 size={24} className="animate-spin" style={{ color: '#64748b' }} />
                        ) : uploadedImageUrl ? (
                            <>
                                <img src={uploadedImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {/* Overlay Remove Button */}
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }}
                                    title="Remove Image"
                                >
                                    <X size={12} />
                                </button>
                            </>
                        ) : (
                            <User size={32} style={{ color: 'var(--text-muted)' }} />
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            name="image_file" // Changed name to avoid direct submission if not handled
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="image-upload"
                            disabled={isUploading}
                        />
                        <label
                            htmlFor="image-upload"
                            className={styles.btnSecondary}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: isUploading ? 0.7 : 1 }}
                        >
                            <Upload size={16} />
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Recommend square 1:1 image</p>
                        {uploadedImageUrl && !isUploading && (
                            <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Image ready
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.formGrid} style={{ marginBottom: '1.5rem' }}>
                {/* Client Name */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} />
                            Client Name
                        </div>
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={testimonial?.name}
                        required
                        className={styles.input}
                        placeholder="John Doe"
                    />
                </div>

                {/* Client Role */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={16} />
                            Role / Company
                        </div>
                    </label>
                    <input
                        type="text"
                        name="role"
                        defaultValue={testimonial?.role}
                        required
                        className={styles.input}
                        placeholder="CEO, Example Inc."
                    />
                </div>
            </div>

            {/* Quote */}
            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={16} />
                        Testimonial Quote
                    </div>
                </label>
                <textarea
                    name="quote"
                    defaultValue={testimonial?.quote}
                    required
                    rows={4}
                    className={styles.textarea}
                    placeholder="The service was exceptional..."
                />
            </div>

            {/* Rating */}
            <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
                <label className={styles.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={16} />
                        Star Rating
                    </div>
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        name="rating"
                        defaultValue={testimonial?.rating || 5}
                        className={styles.input}
                        style={{ width: '120px' }}
                    >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                    </select>
                    <div style={{ display: 'flex', color: 'var(--primary)' }}>
                        <Star size={16} fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div>
                <button
                    type="submit"
                    disabled={loading}

                    style={{ width: '40%', backgroundColor: 'var(--primary)', color: 'var(--white)', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', borderRadius: '5px' }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        isEdit ? 'Update Testimonial' : 'Add Testimonial'
                    )}
                </button>
            </div>
        </form>
    );
}

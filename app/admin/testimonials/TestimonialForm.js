'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addTestimonial, updateTestimonial } from './actions';
import { Loader2, Upload, MessageSquare, User, Briefcase } from 'lucide-react';
import { useToast } from '@/components/admin/ToastContext';
import styles from '../admin.module.css';

export default function TestimonialForm({ testimonial = null }) {
    const isEdit = !!testimonial;
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(testimonial?.avatar || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        if (isEdit) {
            formData.append('id', testimonial.id);
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
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--light-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={32} style={{ color: 'var(--text-muted)' }} />
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className={styles.btnSecondary}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            <Upload size={16} />
                            Upload Photo
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Recommend square 1:1 image</p>
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
            <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
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

            {/* Submit Button */}
            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className={styles.btnPrimary}
                    style={{ width: '100%' }}
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

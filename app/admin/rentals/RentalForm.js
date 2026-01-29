'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Save, ArrowLeft, Loader2, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import imageCompression from 'browser-image-compression';
import { uploadRentalImage, deleteRentalImageAction } from './actions';

// Default categories to bootstrap
const DEFAULT_CATEGORIES = ["HANGERS", "STALLS", "PANDALS", "STAGE", "LED", "AUDIO", "FURNITURE"];

export default function RentalForm({ initialData, action, mode = 'create', existingCategories = [], isInline = false }) {
    const { showToast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [compressingIndex, setCompressingIndex] = useState(null);

    // Parse initial variants or default to one empty row
    const parseInitialVariants = () => {
        if (initialData?.variants) {
            try {
                // Ensure 'file' and 'preview' are not present in initial data from server
                return JSON.parse(initialData.variants).map(v => ({ ...v, file: null, preview: null }));
            } catch (e) { console.error("Error parsing variants", e); }
        }
        // Fallback for legacy: try to map availableSizes if available, else empty
        if (initialData?.availableSizes) {
            try {
                const sizes = JSON.parse(initialData.availableSizes);
                // If there are also legacy images, try to map them 1:1
                const legacyImages = initialData?.images ? JSON.parse(initialData.images) : [];
                return sizes.map((s, index) => ({ size: s, image: legacyImages[index] || null, file: null, preview: null }));
            } catch (e) { }
        }
        return [{ size: '', image: null, file: null, preview: null }];
    };

    const [variants, setVariants] = useState(parseInitialVariants);

    // Update variants if initialData changes (for inline switching)
    useEffect(() => {
        if (initialData) {
            setVariants(parseInitialVariants());
        } else if (mode === 'create') {
            // Reset if switching to create mode
            // Actually, this might cause loop if not careful. 
            // Best to let parent key change trigger remount or use a strict check.
            // For now, assume parent handles key reset or we don't strictly need this if component remounts.
        }
    }, [initialData, mode]);


    // We treat 'image' property in variant as the SERVER path (string).
    // For new uploads, we store 'file' (File object) and 'preview' (blob url).

    // Merge and Dedupe Categories
    const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories])).sort();


    const handleAddVariant = () => {
        setVariants([...variants, { size: '', image: null, file: null, preview: null }]);
    };

    const handleRemoveVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSizeChange = (index, value) => {
        const newVariants = [...variants];
        newVariants[index].size = value;
        setVariants(newVariants);
    };

    // Track upload status per variant index
    const [uploadingStatus, setUploadingStatus] = useState({}); // { [index]: boolean }

    const handleImageChange = async (index, e) => {
        const file = e.target.files[0];
        if (!file) {
            // ... (clear state logic)
            // If clearing via file input cancel, we might want to keep previous?
            // Standard behavior: if user cancels dialog, no change. 
            // If they select nothing... actually file input usually keeps old value if canceled. 
            // If they programmatically clear, handle it.
            return;
        }

        setCompressingIndex(index);
        setUploadingStatus(prev => ({ ...prev, [index]: true }));

        try {
            // Auto-cleanup old image if exists for this variant
            const currentVariant = variants[index];
            if (currentVariant.uploadedUrl) {
                await deleteRentalImageAction(currentVariant.uploadedUrl);
            }

            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // Create preview
            const newVariants = [...variants];
            if (newVariants[index].preview) URL.revokeObjectURL(newVariants[index].preview);
            newVariants[index].file = compressedFile;
            newVariants[index].preview = URL.createObjectURL(compressedFile);
            setVariants(newVariants);

            // Trigger Upload via Server Action
            const formData = new FormData();
            formData.append('image', compressedFile);
            formData.append('folder', 'rentals');

            const res = await uploadRentalImage(formData);

            if (res.success && res.url) {
                setVariants(prev => {
                    const updated = [...prev];
                    updated[index].uploadedUrl = res.url;
                    return updated;
                });
                showToast("Image uploaded", "success");
            } else {
                showToast(res.error || "Upload failed", "error");
            }

        } catch (err) {
            console.error(err);
            showToast("Error processing/uploading image.", "error");
        } finally {
            setCompressingIndex(null);
            setUploadingStatus(prev => ({ ...prev, [index]: false }));
            // URL.revokeObjectURL(objectUrl); // No objectUrl to revoke here
        }
    };

    // New: Remove specific image from variant
    const handleRemoveVariantImage = async (index) => {
        const v = variants[index];
        if (v.uploadedUrl) {
            await deleteRentalImageAction(v.uploadedUrl);
        }

        const newVariants = [...variants];
        newVariants[index].image = null; // Clear server image
        newVariants[index].uploadedUrl = null; // Clear new upload
        newVariants[index].file = null;
        if (newVariants[index].preview) {
            URL.revokeObjectURL(newVariants[index].preview);
            newVariants[index].preview = null;
        }
        setVariants(newVariants);

        // Reset file input if possible (hard with list map, rely on UI state)
    };

    const [remainingTime, setRemainingTime] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        // Block if any uploading
        const isAnyUploading = Object.values(uploadingStatus).some(status => status);
        if (isAnyUploading) {
            showToast("Please wait for all images to upload", "warning");
            return;
        }

        setIsSubmitting(true);
        setRemainingTime(null);

        // ... (removed total bytes estimation as we expect bg upload mostly) ...

        const formData = new FormData(e.currentTarget);

        const variantsData = variants.map((v, i) => ({
            index: i,
            size: v.size,
            // Priority: Uploaded URL -> Existing Server Image -> null
            existingImage: v.uploadedUrl ? v.uploadedUrl : (v.image || null)
        }));

        formData.set('variants_meta', JSON.stringify(variantsData));

        // Only append file if NO uploadedUrl (fallback) AND file exists
        variants.forEach((v, i) => {
            if (v.file && !v.uploadedUrl) {
                formData.append(`variant_file_${i}`, v.file);
            }
        });

        // Price defaults to Custom Quote (hidden)
        if (!formData.get('price')) formData.set('price', "Custom Quote");

        // Start countdown
        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev === null || prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);

        try {
            const result = await action(formData);
            if (result && result.success) {
                showToast(result.message, "success");

                if (isInline) {
                    router.refresh();
                    // Inline mode assumes parent handles state refresh via callback or router
                } else {
                    router.push('/admin/rentals');
                    router.refresh();
                }
            } else {
                showToast(result?.message || "Something went wrong", "error");
            }
        } catch (error) {
            showToast("An unexpected error occurred", "error");
            console.error(error);
        } finally {
            clearInterval(timer);
            setRemainingTime(null);
            // Clean up all object URLs created for previews
            variants.forEach(v => {
                if (v.preview) {
                    URL.revokeObjectURL(v.preview);
                }
            });
            setIsSubmitting(false);
        }
    }

    // Helper text for button
    const getButtonText = () => {
        if (!isSubmitting) {
            return mode === 'create' ? ' Add Rental' : ' Save Changes';
        }
        if (remainingTime !== null) {
            return remainingTime > 0 ? ` Uploading... (~${remainingTime}s)` : ' Finishing up...';
        }
        return mode === 'create' ? ' Adding...' : ' Saving...';
    };

    return (
        <div>
            {!isInline && (
                <div className={styles.pageHeader}>
                    <div>
                        <Link href="/admin/rentals" className={styles.btnSecondary} style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                            <ArrowLeft size={16} /> Back to Rentals
                        </Link>
                        <h1 className={styles.pageTitle}>{mode === 'create' ? 'Add Rental Item' : 'Edit Rental Item'}</h1>
                    </div>
                </div>
            )}

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    {initialData && <input type="hidden" name="id" value={initialData.id} />}
                    {/* Price hidden */}
                    <input type="hidden" name="price" value="Custom Quote" />

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input name="title" defaultValue={initialData?.title} placeholder="e.g. German Hangers" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category</label>
                        <input
                            name="category"
                            list="category-list"
                            defaultValue={initialData?.category}
                            placeholder="Select or type new category..."
                            required
                            className={styles.input}
                            autoComplete="off"
                        />
                        <datalist id="category-list">
                            {allCategories.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    {/* Variants Section */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label} style={{ marginBottom: '10px', display: 'block' }}>Rental Variants / Sizes</label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {variants.map((variant, index) => (
                                <div key={index} className={styles.rentalVariantRow}>

                                    {/* Size Input */}
                                    <div style={{ flex: 1 }}>
                                        <label className={styles.label} style={{ fontSize: '0.8rem' }}>Size / Option</label>
                                        <input
                                            value={variant.size}
                                            onChange={(e) => handleSizeChange(index, e.target.value)}
                                            placeholder="e.g. 10x10 ft"
                                            required
                                            className={styles.input}
                                        />
                                    </div>

                                    {/* Image Input */}
                                    <div style={{ flex: 1 }}>
                                        <label className={styles.label} style={{ fontSize: '0.8rem' }}>Image (1920x1080 / 1280x720)</label>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {(variant.preview || variant.image) ? (
                                                <div style={{ width: '60px', height: '40px', position: 'relative', flexShrink: 0 }}>
                                                    <img
                                                        src={variant.preview || variant.image}
                                                        alt="Preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', opacity: compressingIndex === index ? 0.5 : 1 }}
                                                    />
                                                    {compressingIndex === index ? (
                                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Loader2 className="animate-spin" size={16} color="#3b82f6" />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariantImage(index)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '-6px',
                                                                right: '-6px',
                                                                background: 'red',
                                                                color: 'white',
                                                                border: '1px solid white',
                                                                borderRadius: '50%',
                                                                width: '16px',
                                                                height: '16px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                zIndex: 10
                                                            }}
                                                            title="Remove Image"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ width: '60px', height: '40px', background: '#eee', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {compressingIndex === index ? <Loader2 className="animate-spin" size={16} color="#64748b" /> : <Upload size={16} className="text-gray-400" />}
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(index, e)}
                                                className={styles.input}
                                                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                                                required={!variant.image && !variant.file} // Required if no existing image and no new file
                                                disabled={compressingIndex !== null}
                                            />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <div style={{ marginTop: '28px' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(index)}
                                            className={styles.btnIcon}
                                            style={{ color: 'red', border: '1px solid #fee2e2', background: '#fef2f2' }}
                                            title="Remove Variant"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={handleAddVariant} className={styles.btnAddVariant} style={{ marginTop: '15px' }}>
                            <Plus size={16} /> Add Another Variant
                        </button>
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnAddNew}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (mode === 'create' ? <Plus size={18} /> : <Save size={18} />)}
                            {getButtonText()}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

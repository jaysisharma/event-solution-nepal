'use client';

import { useState } from 'react';
import styles from '../admin.module.css';
import { Plus, Save, ArrowLeft, Loader2, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/ToastContext';

// Default categories to bootstrap
const DEFAULT_CATEGORIES = ["HANGERS", "STALLS", "PANDALS", "STAGE", "LED", "AUDIO", "FURNITURE"];

export default function RentalForm({ initialData, action, mode = 'create', existingCategories = [], isInline = false }) {
    const { showToast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleImageChange = async (index, e) => {
        const file = e.target.files[0];
        if (!file) {
            // If file input is cleared, remove the file and preview from state
            const newVariants = [...variants];
            newVariants[index].file = null;
            if (newVariants[index].preview) {
                URL.revokeObjectURL(newVariants[index].preview); // Clean up old preview URL
                newVariants[index].preview = null;
            }
            setVariants(newVariants);
            return;
        }

        // Validation
        const validResolutions = [
            { w: 1920, h: 1080 },
            { w: 1280, h: 720 }
        ];

        const img = document.createElement('img');
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        try {
            await new Promise(r => img.onload = r);
            const isValid = validResolutions.some(res => res.w === img.naturalWidth && res.h === img.naturalHeight);

            if (!isValid) {
                showToast(`Image invalid! Use 1920x1080 or 1280x720.`, "error");
                e.target.value = ''; // Clear the file input
                URL.revokeObjectURL(objectUrl); // Clean up the object URL
                return;
            }

            const newVariants = [...variants];
            // Clean up previous preview URL if it exists
            if (newVariants[index].preview) {
                URL.revokeObjectURL(newVariants[index].preview);
            }
            newVariants[index].file = file;
            newVariants[index].preview = objectUrl; // For immediate preview
            setVariants(newVariants);

        } catch (err) {
            console.error(err);
            showToast("Error processing image.", "error");
            e.target.value = ''; // Clear the file input
            URL.revokeObjectURL(objectUrl); // Clean up the object URL
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        // Prepare variants data
        // We will send a JSON string describing the structure, and append files with specific keys
        const variantsData = variants.map((v, i) => ({
            index: i,
            size: v.size,
            // If a new file is uploaded, existingImage should be null.
            // Otherwise, send the current server image path.
            existingImage: v.file ? null : v.image
        }));

        formData.set('variants_meta', JSON.stringify(variantsData));

        variants.forEach((v, i) => {
            if (v.file) {
                formData.append(`variant_file_${i}`, v.file);
            }
        });

        // Price defaults to Custom Quote (hidden)
        if (!formData.get('price')) formData.set('price', "Custom Quote");

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
            // Clean up all object URLs created for previews
            variants.forEach(v => {
                if (v.preview) {
                    URL.revokeObjectURL(v.preview);
                }
            });
            setIsSubmitting(false);
        }
    }

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
                                <div key={index} className={styles.card} style={{ padding: '15px', display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#f8f9fa', border: '1px solid #e9ecef' }}>

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
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ width: '60px', height: '40px', background: '#eee', borderRadius: '4px', flexShrink: 0 }}></div>
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(index, e)}
                                                className={styles.input}
                                                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                                                required={!variant.image && !variant.file} // Required if no existing image and no new file
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

                        <button type="button" onClick={handleAddVariant} className={styles.btnSecondary} style={{ marginTop: '15px' }}>
                            <Plus size={16} /> Add Another Variant
                        </button>
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnAddNew}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (mode === 'create' ? <Plus size={18} /> : <Save size={18} />)}
                            {mode === 'create' ? (isSubmitting ? ' Adding...' : ' Add Rental') : (isSubmitting ? ' Saving...' : ' Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

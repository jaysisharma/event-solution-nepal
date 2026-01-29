'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Save, AlertTriangle, CheckCircle, AlertCircle, Star, Users, Globe, Building, Heart, Trophy, ShieldCheck, PartyPopper, Loader2, Crop } from 'lucide-react';
import { getHeroSlides, createHeroSlide, deleteHeroSlide, updateHeroSlide } from './actions';
import styles from '../admin.module.css';

// --- Icon Mapping ---
const IconMap = {
    Star: <Star size={16} />,
    Heart: <Heart size={16} />,
    Trophy: <Trophy size={16} />,
    ShieldCheck: <ShieldCheck size={16} />,
    Users: <Users size={16} />,
    Globe: <Globe size={16} />,
    Building: <Building size={16} />,
    PartyPopper: <PartyPopper size={16} />
};

// --- Reusable UI Components ---

const Snackbar = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#10b981' : '#ef4444';

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: bgColor,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
                <X size={16} />
            </button>
        </div>
    );
};



import Cropper from 'react-easy-crop';

// --- Utility: Get Cropped Image ---
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation);

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    targetWidth = 500,
    targetHeight = 425
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location on image to allow rotating and flipping around the center.
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // Create a new canvas for the final resized output
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const finalCtx = finalCanvas.getContext('2d');

    // Create a temporary canvas to hold the cropped (but not resized) image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelCrop.width;
    tempCanvas.height = pixelCrop.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(data, 0, 0);

    // Draw the temp canvas onto the final canvas, resizing it
    finalCtx.drawImage(tempCanvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, targetWidth, targetHeight);

    // As Blob
    return new Promise((resolve, reject) => {
        finalCanvas.toBlob((file) => {
            resolve(file);
        }, 'image/jpeg', 0.95); // High quality
    });
}

// ... existing Snackbar component ...

export default function HeroAdminPage() {
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI State
    const [snackbar, setSnackbar] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [label, setLabel] = useState('');
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');

    // Cropping State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [cropSize, setCropSize] = useState({ width: 0, height: 0 });

    // Slide-Specific Stats State
    const [isFeatured, setIsFeatured] = useState(false);
    const [eventDate, setEventDate] = useState('');
    const [uploadTime, setUploadTime] = useState(null);

    const fetchSlides = React.useCallback(async () => {
        setIsLoading(true);
        const res = await getHeroSlides();
        if (res.success) {
            setSlides(res.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    // Upload State
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
        setCropSize({ width: croppedAreaPixels.width, height: croppedAreaPixels.height });
    };

    const handleCropConfirm = async () => {
        try {
            // Force 500x425 output
            const croppedImageBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels, 0, { horizontal: false, vertical: false }, 500, 425);

            // Create a File object from Blob to mimic standard file upload
            const file = new File([croppedImageBlob], "cropped-hero-image.jpg", { type: "image/jpeg" });

            setImage(file);
            setPreview(URL.createObjectURL(file));
            setIsCropping(false);

            // Trigger Background Upload
            setIsUploading(true);
            setUploadTime("Uploading...");

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'hero');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (response.ok && data.url) {
                setUploadedImageUrl(data.url);
                setUploadTime("Upload Complete");
            } else {
                setSnackbar({ message: 'Background upload failed', type: 'error' });
                setUploadTime("Failed");
            }

        } catch (e) {
            console.error("Crop/Upload Error", e);
            setSnackbar({ message: 'Failed to process image', type: 'error' });
            setUploadTime("Error");
            setIsUploading(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setCropImageSrc(null);
        // Clear input to allow re-selecting same file
        const input = document.getElementById('slideImageInput');
        if (input) input.value = '';
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation(); // Prevent triggering the file input
        setImage(null);
        setPreview('');
        setCropImageSrc(null); // Clear original source too
        setUploadedImageUrl(null);
        setUploadTime(null);
        const input = document.getElementById('slideImageInput');
        if (input) input.value = '';
    };

    const handleReCrop = (e) => {
        e.stopPropagation();
        if (cropImageSrc) {
            setIsCropping(true);
        }
    };

    const handleEdit = (slide) => {
        setEditingId(slide.id);
        setLabel(slide.label);
        setTitle(slide.title);
        setPreview(slide.image);
        setImage(null);
        setUploadedImageUrl(null); // Reset new upload URL
        // ... rest of handleEdit
        // ... rest of handleEdit
        setIsFeatured(slide.isFeatured || false);
        setEventDate(slide.eventDate || '');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setLabel('');
        setTitle('');
        setImage(null);
        setPreview('');
        setUploadedImageUrl(null);
        setUploadedImageUrl(null);
        setIsFeatured(false);
        setEventDate('');
        setUploadTime(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isUploading) {
            setSnackbar({ message: 'Please wait for image to finish uploading', type: 'warning' });
            return;
        }

        if (!editingId && !uploadedImageUrl && !image) {
            setSnackbar({ message: 'Please select an image', type: 'error' });
            return;
        }
        if (!label || !title) return;

        setIsSubmitting(true);
        const formData = new FormData();

        // Use uploaded URL if available, otherwise fallback (though we try to enforce upload first)
        // For edits, if no new image, we don't send 'image' field or handle it in action
        if (uploadedImageUrl) {
            formData.append('image', uploadedImageUrl);
        } else if (image) {
            formData.append('image', image); // Fallback to file if bg upload failed but user submits
        }

        formData.append('label', label);
        formData.append('title', title);
        formData.append('isFeatured', isFeatured);
        formData.append('eventDate', eventDate);

        let res;
        if (editingId) {
            res = await updateHeroSlide(editingId, formData);
        } else {
            res = await createHeroSlide(formData);
        }

        if (res.success) {
            handleCancelEdit();
            fetchSlides();
            setSnackbar({
                message: editingId ? 'Slide updated successfully!' : 'Slide created successfully!',
                type: 'success'
            });
        } else {
            setSnackbar({ message: 'Operation failed', type: 'error' });
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;

        setDeletingId(id);
        const res = await deleteHeroSlide(id);

        if (res.success) {
            setSnackbar({ message: 'Slide deleted successfully', type: 'success' });
            fetchSlides();
            if (editingId === id) handleCancelEdit();
        } else {
            setSnackbar({ message: 'Failed to delete slide', type: 'error' });
        }
        setDeletingId(null);
    };

    return (
        <div>
            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}

            {/* Crop Modal */}
            {isCropping && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '90%',
                        height: '70%',
                        backgroundColor: '#000',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                    }}>
                        <Cropper
                            image={cropImageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={500 / 425}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            objectFit="contain" // Allow image to be contained within crop area initially
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'white', marginBottom: '1rem' }}>
                        <span>Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="range"
                        />
                        <span style={{ marginLeft: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
                            Size: {cropSize.width} x {cropSize.height} px
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleCropCancel}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid white',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropConfirm}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#10b981',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <CheckCircle size={18} /> Crop & Upload
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Manage Hero Slides</h1>
                    <p className={styles.pageSubtitle}>Add or update slides with stats for the carousel</p>
                </div>
            </div>

            <div className={styles.formGrid}>
                {/* Form (Create or Edit) */}
                <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className={styles.cardTitle}>
                            {editingId ? <><Pencil size={18} /> Edit Slide</> : <><Plus size={18} /> Add New Slide</>}
                        </h2>
                        {editingId && (
                            <button onClick={handleCancelEdit} className={styles.btnSecondary} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                <X size={14} /> Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.formGroup} style={{ gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className={styles.heroFormLayout}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Slide Image</label>
                                    <div
                                        onClick={() => document.getElementById('slideImageInput').click()}
                                        className={styles.imageUploadBox}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-soft)'}
                                    >
                                        <input
                                            id="slideImageInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                            required={!editingId}
                                        />
                                        {preview ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    display: 'flex',
                                                    gap: '8px'
                                                }}>
                                                    {cropImageSrc && (
                                                        <button
                                                            type="button"
                                                            onClick={handleReCrop}
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                height: '28px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                color: '#2563eb'
                                                            }}
                                                            title="Crop Image"
                                                        >
                                                            <Crop size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '28px',
                                                            height: '28px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            color: '#ef4444' // Red for delete
                                                        }}
                                                        title="Remove Image"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                                <ImageIcon size={40} style={{ marginBottom: '0.5rem' }} />
                                                <p style={{ fontSize: '0.85rem' }}>Click to upload image</p>
                                            </div>
                                        )}
                                        {uploadTime && (
                                            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', color: '#64748b', background: 'rgba(255,255,255,0.8)', padding: '4px' }}>
                                                Est. Upload: {uploadTime}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                                    <div className={styles.heroInputsGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Label (e.g. Latest Project)</label>
                                            <input
                                                type="text"
                                                value={label}
                                                onChange={(e) => setLabel(e.target.value)}
                                                className={styles.input}
                                                required
                                                placeholder="Latest Event"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Title (e.g. Tech Summit)</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className={styles.input}
                                                required
                                                placeholder="Mega Concert 2024"
                                            />
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                Options
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isFeatured}
                                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                                    />
                                                    Featured
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup} style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-soft)', paddingTop: '1.5rem' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Event Details</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Event Date (Text or Date)</label>
                                                <input
                                                    type="text"
                                                    value={eventDate}
                                                    onChange={(e) => setEventDate(e.target.value)}
                                                    className={styles.input}
                                                    placeholder="Oct 24, 2025"
                                                />
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                                    Status (Upcoming/Completed) will be automatically set based on this date.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={styles.btnAddNew}
                                        style={{ alignSelf: 'flex-end', padding: '0.75rem 2rem' }}
                                    >
                                        {isSubmitting ? 'Saving...' : (
                                            editingId ? <><Save size={18} /> Update Slide</> : <><Plus size={18} /> Save Slide</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 className={styles.cardTitle} style={{ marginBottom: '1.5rem' }}>Current Slides ({slides.length})</h2>

                {isLoading ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--text-tertiary)' }}>Loading slides...</p>
                    </div>
                ) : slides.length === 0 ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '4rem' }}>
                        <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
                        <h3 style={{ color: 'var(--text-secondary)' }}>No slides found</h3>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Add your first hero slide to showcase on the homepage!</p>
                    </div>
                ) : (
                    <div className={styles.gridList}>
                        {slides.map((slide) => (
                            <div key={slide.id} className={styles.heroCard}>
                                <img src={slide.image} alt={slide.title} className={styles.heroCardImage} />
                                {slide.isFeatured && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 12,
                                        left: 12,
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#ca8a04',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Star size={12} fill="#ca8a04" /> Featured
                                    </div>
                                )}
                                <div className={styles.heroCardBody}>
                                    <span className={styles.heroCardLabel}>{slide.label}</span>
                                    <h3 className={styles.heroCardTitle}>{slide.title}</h3>

                                    {slide.eventDate && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                            Date: {slide.eventDate}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.heroCardActions}>
                                    <button
                                        onClick={() => handleEdit(slide)}
                                        className={styles.btnIcon}
                                        title="Edit Slide"
                                        disabled={deletingId === slide.id}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        className={styles.btnIcon}
                                        style={{
                                            color: '#ef4444',
                                            cursor: deletingId === slide.id ? 'not-allowed' : 'pointer',
                                            opacity: deletingId === slide.id ? 0.7 : 1
                                        }}
                                        title="Delete Slide"
                                        disabled={deletingId === slide.id}
                                    >
                                        {deletingId === slide.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
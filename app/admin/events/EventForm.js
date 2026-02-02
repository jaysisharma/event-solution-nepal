"use client";


import { useState, useEffect, useRef } from 'react';
import styles from '../admin.module.css';
import { Plus, Save, ArrowLeft, Loader2, Trash, X } from 'lucide-react';
import Link from 'next/link';
import TicketCanvas from '@/components/admin/TicketCanvas';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { uploadEventImage, deleteEventImageAction } from './actions';

export default function EventForm({ initialData, action, mode = 'create', isInline = false }) {
    const { showToast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Logic to determine initial type
    const getInitialType = () => {
        if (!initialData) return 'SAME';
        if (initialData.organizer && initialData.managedBy && initialData.organizer === initialData.managedBy) return 'SAME';
        if (initialData.organizer && initialData.managedBy && initialData.organizer !== initialData.managedBy) return 'SEPARATE';
        if (initialData.organizer && !initialData.managedBy) return 'ORGANIZER_ONLY';
        if (!initialData.organizer && initialData.managedBy) return 'MANAGER_ONLY';
        return 'SAME'; // Default
    };

    const [manageType, setManageType] = useState(getInitialType);
    const [compressedFile, setCompressedFile] = useState(null);
    const [uploadTime, setUploadTime] = useState(null);
    const [ticketConfig, setTicketConfig] = useState(initialData?.ticketConfig ? JSON.parse(initialData.ticketConfig) : null);

    const fileInputRef = useRef(null);

    // Initial Form Config Logic
    const getInitialFormConfig = () => {
        if (initialData?.formConfig && initialData.formConfig !== 'null') {
            try {
                const parsed = JSON.parse(initialData.formConfig);
                return parsed;
            } catch (e) { console.error("Error parsing formConfig", e); }
        }
        return {
            address: { show: true, required: false },
            jobTitle: { show: true, required: false },
            organization: { show: true, required: false },
            website: { show: true, required: false }
        };
    };
    const [formConfig, setFormConfig] = useState(getInitialFormConfig);

    const handleFormConfigChange = (field, key, value) => {
        setFormConfig(prev => ({
            ...prev,
            [field]: { ...prev[field], [key]: value }
        }));
    };

    // Initial Ticket Types Logic
    const getInitialTicketTypes = () => {
        if (initialData?.ticketTypes && initialData.ticketTypes !== 'null') {
            try {
                const parsed = JSON.parse(initialData.ticketTypes);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) { console.error("Error parsing types", e); }
        }
        // Fallback for Legacy or New
        if (initialData?.ticketPrice && parseInt(initialData.ticketPrice) > 0) {
            return [{ label: 'General', price: initialData.ticketPrice }];
        }
        return [];
    };

    const [ticketTypes, setTicketTypes] = useState(getInitialTicketTypes);

    // Update state when initialData changes (for inline editing)
    useEffect(() => {
        if (initialData) {
            setManageType(getInitialType());
            setTicketTypes(getInitialTicketTypes());
        }
    }, [initialData]);

    // Upload States
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [uploadedTicketUrl, setUploadedTicketUrl] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingTicket, setIsUploadingTicket] = useState(false);

    // --- Actions Import ---
    // Assuming you import these at the top:
    // import { uploadEventImage, deleteEventImageAction } from './actions';
    // We need to actually import them in the file imports section first, 
    // but here I am replacing the body methods. I'll need to do the import separately or in one go if I replaced the whole file. 
    // Since this tool replaces a chunk, I'll replace the methods.

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setIsUploadingImage(true);
        setUploadTime("Uploading...");

        const validResolutions = [
            { w: 1920, h: 1080 },
            { w: 1280, h: 720 }
        ];

        try {
            const img = document.createElement('img');
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const isValid = validResolutions.some(res => res.w === img.naturalWidth && res.h === img.naturalHeight);

            if (!isValid) {
                showToast("Invalid Size! Use 1920x1080 or 1280x720 only.", "error");
                e.target.value = ''; // Reset input
                setCompressedFile(null);
                URL.revokeObjectURL(objectUrl);
                setIsUploadingImage(false);
                setUploadTime(null);
                return;
            }

            // DELETE OLD IF EXISTS (Auto Cleanup)
            if (uploadedImageUrl) {
                await deleteEventImageAction(uploadedImageUrl);
            }

            // Compress
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    setCompressedFile(newFile);

                    // Server Action Upload
                    const formData = new FormData();
                    formData.append('image', newFile);
                    formData.append('folder', 'events');

                    try {
                        const result = await uploadEventImage(formData);

                        if (result.success && result.url) {
                            setUploadedImageUrl(result.url);
                            setUploadTime("Upload Complete");
                            showToast("Image validated & uploaded!", "success");
                        } else {
                            setUploadTime("Failed");
                            showToast("Upload failed", "error");
                        }
                    } catch (uploadErr) {
                        console.error("Upload error", uploadErr);
                        setUploadTime("Error");
                    } finally {
                        setIsUploadingImage(false);
                    }
                }
                URL.revokeObjectURL(objectUrl);
            }, 'image/jpeg', 0.8);

        } catch (error) {
            console.error("Image processing error:", error);
            showToast("Failed to process image", "error");
            setIsUploadingImage(false);
        }
    };

    const handleRemoveImage = async () => {
        // If we have an uploaded URL (that isn't the initial saved one, OR even if it is? 
        // Ideally we only delete new uploads or if user explicitly wants to remove saved image. 
        // For now, let's delete if it's in uploadedImageUrl which tracks the *current* form session upload.
        if (uploadedImageUrl) {
            await deleteEventImageAction(uploadedImageUrl);
        }

        setCompressedFile(null);
        setUploadedImageUrl(null);
        setUploadTime(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTicketTemplateChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingTicket(true);
        try {
            // Delete old if exists
            if (uploadedTicketUrl) {
                await deleteEventImageAction(uploadedTicketUrl);
            }

            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'events/tickets'); // Helper supports folder param

            const result = await uploadEventImage(formData);

            if (result.success && result.url) {
                setUploadedTicketUrl(result.url);
                showToast("Ticket template uploaded!", "success");
            } else {
                showToast("Ticket upload failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Ticket upload network error", "error");
        } finally {
            setIsUploadingTicket(false);
        }
    };

    // Ticket Type Handlers
    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { label: '', price: '' }]);
    };
    const removeTicketType = (index) => {
        setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    };
    const updateTicketType = (index, field, value) => {
        const newTypes = [...ticketTypes];
        newTypes[index][field] = value;
        setTicketTypes(newTypes);
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (isUploadingImage || isUploadingTicket) {
            showToast("Please wait for images to finish uploading", "warning");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        // Append manageType manually if it wasn't picked up or to ensure it's there
        formData.set('manageType', manageType);
        formData.set('ticketTypes', JSON.stringify(ticketTypes));
        formData.set('formConfig', JSON.stringify(formConfig));
        // Calculate min price for legacy check or display
        const minPrice = ticketTypes.length > 0 ? Math.min(...ticketTypes.map(t => parseInt(t.price) || 0)) : 0;
        formData.set('ticketPrice', minPrice.toString()); // Keep legacy field populated with min price

        // Logic Validation
        let errorMessage = "";
        const title = formData.get('title');
        const location = formData.get('location');
        const time = formData.get('time');
        const month = formData.get('month');
        const date = formData.get('date');
        const year = formData.get('year');
        const description = formData.get('description');
        const combinedName = formData.get('combinedName');
        const organizer = formData.get('organizer');
        const fieldManagedBy = formData.get('managedBy'); // rename to avoid conflict with state
        const isFeatured = formData.get('isFeatured') === 'on';

        if (!title || !location || !time || !month || !date || !year || !description) {
            errorMessage = "Please fill in all required fields (Title, Location, Time, Month, Date, Year, Description).";
        } else if (manageType === 'SAME' && !combinedName) {
            errorMessage = "Please enter the Organized & Managed By name.";
        } else if (manageType === 'SEPARATE' && (!organizer || !fieldManagedBy)) {
            errorMessage = "Please enter both Organizer and Manager names.";
        } else if (manageType === 'ORGANIZER_ONLY' && !organizer) {
            errorMessage = "Please enter the Organizer name.";
        } else if (manageType === 'MANAGER_ONLY' && !fieldManagedBy) {
            errorMessage = "Please enter the Manager name.";
        } else if (mode === 'create' && !uploadedImageUrl && !compressedFile) {
            // For create, image is strictly required (unless we allows generic default, but user said 'invalid' if not entered)
            errorMessage = "Event Image is required for new events.";
        }

        // Validate Ticket Types
        const invalidTicket = ticketTypes.find(t => !t.label || !t.price);
        if (invalidTicket) {
            errorMessage = "All ticket types must have a Label and Price.";
        }

        if (errorMessage) {
            showToast(errorMessage, "error");
            setIsSubmitting(false);
            return;
        }

        // --- CHECK FOR CHANGES ---
        if (mode === 'edit' && initialData) {
            const hasFile = !!(uploadedImageUrl || uploadedTicketUrl || compressedFile); // More robust check

            // Resolve intended organizer/managedBy based on current form state
            let newOrganizer = null;
            let newManagedBy = null;

            if (manageType === 'SAME') {
                newOrganizer = combinedName;
                newManagedBy = combinedName;
            } else if (manageType === 'SEPARATE') {
                newOrganizer = organizer;
                newManagedBy = fieldManagedBy;
            } else if (manageType === 'ORGANIZER_ONLY') {
                newOrganizer = organizer;
                newManagedBy = null;
            } else if (manageType === 'MANAGER_ONLY') {
                newManagedBy = fieldManagedBy;
                newOrganizer = null;
            }

            // Serialize types for comparison
            const typesChanged = JSON.stringify(ticketTypes) !== (initialData.ticketTypes || JSON.stringify(getInitialTicketTypes()));
            const configChanged = JSON.stringify(formConfig) !== (initialData.formConfig || JSON.stringify(getInitialFormConfig()));

            const hasTextChanged = (
                title !== initialData.title ||
                location !== initialData.location ||
                time !== initialData.time ||
                month !== initialData.month ||
                date !== initialData.date ||
                String(year) !== String(initialData.year || '') ||
                description !== initialData.description ||
                isFeatured !== (initialData.isFeatured || false) ||
                (newOrganizer || null) !== (initialData.organizer || null) ||
                (newManagedBy || null) !== (initialData.managedBy || null) ||
                typesChanged ||
                configChanged
            );

            if (!hasFile && !hasTextChanged && !typesChanged && !configChanged) { // Simplified check
                showToast("No changes detected.", "info");
                setIsSubmitting(false);
                return;
            }
        }
        // --- END CHECK ---

        if (uploadedImageUrl) {
            formData.set('image', uploadedImageUrl);
        } else if (compressedFile) {
            // Fallback if background upload failed? Or user re-selected and it's processing?
            // Since we handle upload inside handleMainImageChange, if it failed, uploadedImageUrl is null 
            // but compressedFile is set. We can send file if we want, but better to enforce URL?
            // Lets assume we fallback to file upload.
            formData.set('image', compressedFile);
        }

        if (uploadedTicketUrl) {
            formData.set('ticketTemplate', uploadedTicketUrl);
        }

        try {
            const result = await action(formData);
            if (result && result.success) {
                showToast(result.message, "success");

                if (isInline) {
                    // Refresh handled by parent or router refresh
                    router.refresh();
                    // Ideally check if there is a window event
                    if (window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('event-saved'));
                    }
                } else {
                    router.push('/admin/events');
                    router.refresh();
                }
            } else {
                showToast(result?.message || "Something went wrong", "error");
            }
        } catch (error) {
            showToast("An unexpected error occurred", "error");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Date Range Logic
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        if (fromDate) {
            const start = new Date(fromDate);
            const end = toDate ? new Date(toDate) : start;

            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

            const startDay = start.getDate();
            const startMonth = months[start.getMonth()];
            const startYear = start.getFullYear();

            const endDay = end.getDate();
            const endMonth = months[end.getMonth()];
            const endYear = end.getFullYear();

            let finalMonth = startMonth;
            let finalDate = startDay.toString();
            let finalYear = startYear.toString();

            if (toDate && fromDate !== toDate) {
                if (startYear !== endYear) {
                    finalYear = `${startYear}-${endYear}`;
                    finalMonth = `${startMonth}-${endMonth}`;
                    finalDate = `${startDay}-${endDay}`;
                } else if (startMonth !== endMonth) {
                    finalMonth = `${startMonth}-${endMonth}`;
                    finalDate = `${startDay}-${endDay}`;
                } else {
                    // Same month and year
                    finalDate = `${startDay}-${endDay}`;
                }
            }

            // Update form fields directly if using refs or state, 
            // but since we use uncontrolled inputs with defaultValues, we might need to force update 
            // or switch to controlled inputs.
            // Switching to controlled inputs for these 3 fields for better UX.
            setFormData(prev => ({
                ...prev,
                month: finalMonth,
                date: finalDate,
                year: finalYear
            }));
        }
    }, [fromDate, toDate]);

    const [formData, setFormData] = useState({
        month: initialData?.month || '',
        date: initialData?.date || '',
        year: initialData?.year || new Date().getFullYear(),
        time: initialData?.time || ''
    });

    const handleManualChange = (field, val) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    return (
        <div>
            {!isInline && (
                <div className={styles.pageHeader}>
                    <div>
                        <Link href="/admin/events" className={styles.btnSecondary} style={{ marginBottom: '1rem', display: 'inline-flex', border: 'none', paddingLeft: 0 }}>
                            <ArrowLeft size={16} /> Back to Events
                        </Link>
                        <h1 className={styles.pageTitle}>{mode === 'create' ? 'Create New Event' : 'Edit Event'}</h1>
                    </div>
                </div>
            )}


            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    {initialData && <input type="hidden" name="id" value={initialData.id} />}
                    {/* Pass the type so server knows how to handle it if needed */}
                    <input type="hidden" name="manageType" value={manageType} />
                    <input type="hidden" name="formConfig" value={JSON.stringify(formConfig)} />
                    <input type="hidden" name="ticketConfig" value={JSON.stringify(ticketConfig)} />

                    {/* --- Common Fields --- */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Event Title</label>
                        <input name="title" defaultValue={initialData?.title} placeholder="e.g. Summer Music Festival" required className={styles.input} />
                    </div>

                    {/* --- Logic Section --- */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Organization / Management Type</label>
                        <select
                            className={styles.select}
                            value={manageType}
                            onChange={(e) => setManageType(e.target.value)}
                        >
                            <option value="SAME">Organized & Managed by Same Entity</option>
                            <option value="SEPARATE">Separately Organized & Managed</option>
                            <option value="ORGANIZER_ONLY">Organizer Only</option>
                            <option value="MANAGER_ONLY">Manager Only</option>
                        </select>
                    </div>

                    {/* Dynamic Fields based on Selection */}
                    {manageType === 'SAME' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Organized & Managed By</label>
                            <input
                                name="combinedName"
                                defaultValue={initialData?.organizer}
                                placeholder="e.g. Event Solution Nepal"
                                className={styles.input}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>This value will be saved to both fields.</p>
                        </div>
                    )}

                    {manageType === 'SEPARATE' && (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Organized By</label>
                                <input
                                    name="organizer"
                                    defaultValue={initialData?.organizer}
                                    placeholder="e.g. Acme Corp"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Managed By</label>
                                <input
                                    name="managedBy"
                                    defaultValue={initialData?.managedBy}
                                    placeholder="e.g. Event Solution Nepal"
                                    className={styles.input}
                                />
                            </div>
                        </>
                    )}

                    {manageType === 'ORGANIZER_ONLY' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Organized By</label>
                            <input
                                name="organizer"
                                defaultValue={initialData?.organizer}
                                placeholder="e.g. Acme Corp"
                                className={styles.input}
                            />
                        </div>
                    )}

                    {manageType === 'MANAGER_ONLY' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Managed By</label>
                            <input
                                name="managedBy"
                                defaultValue={initialData?.managedBy}
                                placeholder="e.g. Event Solution Nepal"
                                className={styles.input}
                            />
                        </div>
                    )}

                    {/* --- Rest of Fields --- */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Location</label>
                        <input name="location" defaultValue={initialData?.location} placeholder="e.g. Kathmandu Guest House" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Time</label>
                        <input name="time" value={formData.time} onChange={e => handleManualChange('time', e.target.value)} placeholder="e.g. 06:00 PM" required className={styles.input} />
                    </div>

                    {/* Date Range Generator */}
                    <div className={styles.fullWidth} style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Auto-Generate Date</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className={styles.label} style={{ fontSize: '0.8rem' }}>From Date</label>
                                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={styles.input} />
                            </div>
                            <div>
                                <label className={styles.label} style={{ fontSize: '0.8rem' }}>To Date (Optional)</label>
                                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={styles.input} />
                            </div>
                        </div>
                    </div>

                    {/* Manual Override Fields */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Month</label>
                        <input name="month" value={formData.month} onChange={e => handleManualChange('month', e.target.value)} placeholder="e.g. MAY" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Date</label>
                        <input name="date" value={formData.date} onChange={e => handleManualChange('date', e.target.value)} placeholder="e.g. 14" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Year</label>
                        <input name="year" value={formData.year} onChange={e => handleManualChange('year', e.target.value)} placeholder="e.g. 2025" required className={styles.input} />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Event Description</label>
                        <textarea
                            name="description"
                            defaultValue={initialData?.description}
                            placeholder="Enter detailed event description..."
                            className={styles.textarea}
                            rows={4}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                        />
                    </div>

                    {/* --- Ticket Types Section --- */}
                    <div className={styles.fullWidth} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>Ticket Types</label>
                            <button
                                type="button"
                                onClick={addTicketType}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <Plus size={14} /> Add Type
                            </button>
                        </div>

                        {ticketTypes.map((type, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Label</label>
                                    <input
                                        type="text"
                                        value={type.label}
                                        onChange={(e) => updateTicketType(index, 'label', e.target.value)}
                                        placeholder="e.g. Adult"
                                        className={styles.input}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Price (NPR)</label>
                                    <input
                                        type="number"
                                        value={type.price}
                                        onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                                        placeholder="1000"
                                        className={styles.input}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeTicketType(index)}
                                    style={{
                                        marginBottom: '0.25rem',
                                        padding: '0.6rem',
                                        color: '#ef4444',
                                        backgroundColor: '#fee2e2',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        ))}
                        {ticketTypes.length === 0 && (
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                No ticket types added. This event will be free or unavailable for booking.
                            </p>
                        )}
                    </div>




                    {/* --- Ticket Form Settings Section --- */}
                    <div className={styles.fullWidth} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>Ticket Form Settings</label>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Configure which extra fields are visible on the user registration form.</p>
                        </div>

                        <div className={styles.ticketSettingsGrid}>
                            {['address', 'jobTitle', 'organization', 'website'].map((fieldKey) => (
                                <div key={fieldKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: 500, color: '#334155' }}>
                                        {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <input
                                                type="checkbox"
                                                checked={formConfig[fieldKey]?.show}
                                                onChange={(e) => handleFormConfigChange(fieldKey, 'show', e.target.checked)}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Show</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="isFeatured"
                            defaultChecked={initialData?.isFeatured}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <label className={styles.label} style={{ marginBottom: 0 }}>Featured Event</label>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Event Image {mode === 'edit' && "(Leave empty to keep current)"}</label>
                        <input
                            ref={fileInputRef}
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.input}
                            style={{ paddingTop: '0.7rem' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#eab308', marginTop: '0.5rem' }}>
                            Required Size: 1920x1080 or 1280x720 only.
                        </p>
                        {uploadTime && (
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                Estimated Upload Time: {uploadTime}
                            </p>
                        )}
                        {/* Image Preview with Overlay Remove Button */}
                        {(uploadedImageUrl || (mode === 'edit' && initialData?.image)) && (
                            <div style={{ marginTop: '0.8rem', position: 'relative', display: 'inline-block', maxWidth: '300px', width: '100%' }}>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    {uploadedImageUrl ? 'New Selected Image:' : 'Current Image:'}
                                </p>
                                <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                    <img
                                        src={uploadedImageUrl || initialData.image}
                                        alt="Event Image"
                                        style={{
                                            width: '100%',
                                            display: 'block'
                                        }}
                                    />
                                    {uploadedImageUrl && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            title="Remove Selection"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Ticket Template (Optional)</label>
                        <input
                            name="ticketTemplate"
                            type="file"
                            accept="image/*"
                            onChange={handleTicketTemplateChange}
                            className={styles.input}
                            style={{ paddingTop: '0.7rem' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                            Upload a blank ticket image. We will overlay user details on top of this.
                        </p>
                        {mode === 'edit' && initialData?.ticketTemplate && (
                            <div style={{ marginTop: '0.8rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Current Template:</p>
                                <img
                                    src={initialData.ticketTemplate}
                                    alt="Current Ticket Template"
                                    style={{
                                        width: '100%',
                                        maxWidth: '300px',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                    }}
                                />
                            </div>
                        )}

                        {/* Ticket Editor */}
                        {(mode === 'edit' && initialData?.ticketTemplate) ? (
                            <TicketCanvas
                                templateImage={initialData.ticketTemplate}
                                initialConfig={ticketConfig}
                                onChange={(json) => setTicketConfig(JSON.parse(json))}
                            />
                        ) : (
                            mode === 'edit' && <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>Upload and save a template first to enable the layout editor.</p>
                        )}
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" disabled={isSubmitting} className={styles.btnAddNew}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (mode === 'create' ? <Plus size={18} /> : <Save size={18} />)}
                            {mode === 'create' ? (isSubmitting ? ' Creating...' : ' Create Event') : (isSubmitting ? ' Updating...' : ' Update Event')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}


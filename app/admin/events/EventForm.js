"use client";


import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Save, ArrowLeft, Loader2, Trash } from 'lucide-react';
import Link from 'next/link';
import TicketCanvas from '@/components/admin/TicketCanvas';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/ToastContext';

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

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setCompressedFile(null);
            setUploadTime(null);
            return;
        }

        // Calc time
        const sizeInMB = file.size / (1024 * 1024);
        const estTime = Math.ceil(sizeInMB * 2); // 0.5MB/s => 2s per MB
        setUploadTime(estTime < 1 ? '< 1s' : `~${estTime}s`);

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
                return;
            }

            // Compress
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    setCompressedFile(newFile);
                    showToast("Image validated & compressed!", "success");
                }
                URL.revokeObjectURL(objectUrl);
            }, 'image/jpeg', 0.8);

        } catch (error) {
            console.error("Image processing error:", error);
            showToast("Failed to process image", "error");
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
        e.preventDefault(); // Prevent default since we are using onSubmit
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
        } else if (mode === 'create' && !compressedFile) {
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
            const hasFile = !!compressedFile;

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

        if (compressedFile) {
            formData.set('image', compressedFile);
        }

        try {
            const result = await action(formData);
            if (result && result.success) {
                showToast(result.message, "success");

                if (isInline) {
                    // Refresh handled by parent or router refresh
                    router.refresh();
                    // Ideally we should call a callback here to close form, but for now refresh does the trick if parent reacts to it.
                    // Actually, we need to clear form or close it. 
                    // Dispatch a custom event or let parent handle?
                    // For simplicity, we just rely on parent re-rendering or user closing.
                    // But better DX: 
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
                        <input name="time" defaultValue={initialData?.time} placeholder="e.g. 06:00 PM" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Month</label>
                        <input name="month" defaultValue={initialData?.month} placeholder="e.g. MAY" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Date</label>
                        <input name="date" defaultValue={initialData?.date} placeholder="e.g. 14" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Year</label>
                        <input name="year" defaultValue={initialData?.year || new Date().getFullYear()} placeholder="e.g. 2025" required className={styles.input} />
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
                        {mode === 'edit' && initialData?.image && (
                            <div style={{ marginTop: '0.8rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Current Image:</p>
                                <img
                                    src={initialData.image}
                                    alt="Current Event Image"
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
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Ticket Template (Optional)</label>
                        <input
                            name="ticketTemplate"
                            type="file"
                            accept="image/*"
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


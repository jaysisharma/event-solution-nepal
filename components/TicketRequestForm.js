"use client";
import React, { useState, useEffect } from 'react';
import styles from './TicketRequestForm.module.css';
import { submitTicketRequest } from '@/app/actions/ticketRequest';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const TicketRequestForm = ({ eventName, eventId, ticketPrice, ticketTypes }) => {
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        email: '',
        address: '',
        title: '',
        organization: '',
        website: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('khalti'); // 'khalti' or 'fonepay'

    // Parse ticket types
    const [availableTypes, setAvailableTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        if (ticketTypes) {
            try {
                // Determine if ticketTypes is String or Object
                const types = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
                if (Array.isArray(types) && types.length > 0) {
                    setAvailableTypes(types);
                    setSelectedType(types[0]); // Default to first type
                }
            } catch (e) {
                console.error("Failed to parse ticketTypes", e);
            }
        }
    }, [ticketTypes]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { showToast } = useToast();

    // Logic: If types exist, use selectedType price. Else use default ticketPrice.
    // Quantity is ALWAYS 1.
    const currentPrice = selectedType ? parseInt(selectedType.price) : (ticketPrice ? parseInt(ticketPrice) : 0);
    const total = currentPrice * 1; // Quantity fixed to 1

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (paymentMethod === 'fonepay') {
            showToast("Fonepay integration coming soon! Proceeding with request.", "warning");
        }

        try {
            const result = await submitTicketRequest({
                name: formData.name,
                email: formData.email,
                number: formData.number,
                address: formData.address,
                title: formData.title,
                organization: formData.organization,
                website: formData.website,
                eventName: eventName,
                eventId: eventId,
                totalPrice: total,
                paymentMethod: paymentMethod, // Pass selected method
                ticketDetails: {
                    quantity: 1, // Fixed to 1
                    ticketType: selectedType ? (selectedType.label || selectedType.name) : 'Standard',
                    unitPrice: currentPrice
                }
            });

            if (result.success && result.paymentUrl) {
                showToast("Redirecting to payment...", "success");
                window.location.href = result.paymentUrl;
            } else if (result.success) {
                if (paymentMethod === 'fonepay') {
                    showToast('Request submitted! Contact support for Fonepay.', "success");
                } else {
                    showToast('Ticket request submitted successfully!', "success");
                }
                // Optional: Reset form or redirect
                setFormData({
                    name: '',
                    number: '',
                    email: '',
                    address: '',
                    title: '',
                    organization: '',
                    website: '',
                });
            } else {
                const msg = result.error || 'Something went wrong. Please try again.';
                setError(msg);
                showToast(msg, "error");
            }
        } catch (err) {
            console.error(err);
            setError('Failed to submit request.');
            showToast('Failed to submit request.', "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h3 className={styles.title}>Get Ticket for {eventName}</h3>

            <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="name">Full Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.input}
                        required
                        placeholder="John Doe"
                    />
                </div>

                {/* Contact Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="number">Phone *</label>
                        <input
                            type="tel"
                            id="number"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            placeholder="98XXXXXXXX"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Kathmandu, Nepal"
                    />
                </div>

                {/* Professional Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="title">Job Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Manager"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="organization">Organization</label>
                        <input
                            type="text"
                            id="organization"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Company Details"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="website">Website</label>
                    <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://..."
                    />
                </div>

                {/* Ticket Selection Area */}
                <div className={styles.ticketSection} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <label className={styles.label} style={{ marginBottom: '1rem' }}>Select Ticket Type</label>

                    {availableTypes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {availableTypes.map((type, index) => {
                                const isSelected = (selectedType?.label || selectedType?.name) === (type.label || type.name);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleTypeChange(type)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(156, 163, 175, 0.3)',
                                            background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {/* Custom Checkbox/Radio UI */}
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%', // Round for radio feel, or 4px for checkbox. User said "checkbox" but "1 at a time" implies radio behavior. Round is standard for single select.
                                                border: isSelected ? '5px solid #3b82f6' : '2px solid #9ca3af',
                                                backgroundColor: 'white',
                                                transition: 'all 0.2s'
                                            }}></div>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>{type.label || type.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, class: styles.priceTag }}>Rs. {type.price}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(57, 131, 246, 0.1)',
                            border: '1px solid rgba(57, 131, 246, 0.3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 600 }}>Standard Ticket</span>
                            <span style={{ fontWeight: 700 }}>Rs. {ticketPrice}</span>
                        </div>
                    )}
                </div>

                {/* Payment Method Selection */}
                <div className={styles.paymentMethodSection}>
                    <label className={styles.label}>Select Payment Method</label>
                    <div className={styles.paymentGrid}>
                        <div
                            className={`${styles.paymentOption} ${styles.khalti} ${paymentMethod === 'khalti' ? styles.selected : ''}`}
                            onClick={() => setPaymentMethod('khalti')}
                        >
                            {/* Khalti Logo Placeholder or Text */}
                            <span style={{ fontWeight: 800, color: '#5D2E8E' }}>Khalti</span>
                        </div>
                        <div
                            className={`${styles.paymentOption} ${styles.fonepay} ${paymentMethod === 'fonepay' ? styles.selected : ''}`}
                            onClick={() => setPaymentMethod('fonepay')}
                        >
                            {/* Fonepay Logo Placeholder or Text */}
                            <span style={{ fontWeight: 800, color: '#c60021' }}>Fonepay</span>
                        </div>
                    </div>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>Selected Ticket</span>
                        <span>{selectedType ? (selectedType.label || selectedType.name) : 'Standard'}</span>
                    </div>
                    {/* Quantity Hidden as it's always 1 */}
                    <div className={styles.totalRow}>
                        <span>Total to Pay</span>
                        <span>Rs. {total}</span>
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                    type="submit"
                    className={`${styles.submitBtn} ${paymentMethod === 'khalti' ? styles.khaltiBtn : styles.fonepayBtn}`}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin inline mr-2" size={18} />
                            Processing...
                        </>
                    ) : (
                        `Pay with ${paymentMethod === 'khalti' ? 'Khalti' : 'Fonepay'} (Rs. ${total})`
                    )}
                </button>
            </form>
        </div>
    );
};

export default TicketRequestForm;

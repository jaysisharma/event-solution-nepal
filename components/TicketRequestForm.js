"use client";
import React, { useState } from 'react';
import { submitTicketRequest } from '@/app/actions/ticketRequest';
import styles from './TicketRequestForm.module.css';

const TicketRequestForm = ({ eventName, onCancel, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        email: '',
        address: '',
        title: '',
        organization: '',
        website: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";

        // Validate Phone (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!formData.number.trim()) {
            newErrors.number = "Phone number is required";
        } else if (!phoneRegex.test(formData.number.trim())) {
            newErrors.number = "Please enter a valid 10-digit mobile number";
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Call Server Action
            const result = await submitTicketRequest({
                ...formData,
                eventName // Include event name from props
            });

            if (result.success) {
                if (onSubmit) {
                    await onSubmit(formData); // Optional prop callback
                }
                setSuccess(true);
            } else {
                console.error("Submission failed:", result.error);
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={styles.successMessage}>
                <h3>Request Sent Successfully!</h3>
                <p style={{ marginTop: '0.5rem', color: '#166534' }}>
                    Thank you for your interest in <strong>{eventName}</strong>.<br />
                    We will get back to you shortly with ticket details.
                </p>
                <div className={styles.actions} style={{ justifyContent: 'center' }}>
                    <button
                        onClick={onCancel}
                        className={styles.button}
                        style={{ backgroundColor: '#059669', color: 'white', maxWidth: '200px' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.formContainer}>
            <h3 className={styles.heading}>Get Tickets</h3>
            <p className={styles.subHeading}>
                Request tickets for <span style={{ fontWeight: 600, color: '#334155' }}>{eventName}</span>
            </p>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    {/* Mandatory Fields */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                        <input
                            type="tel"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.number ? styles.inputError : ''}`}
                            placeholder="Enter your mobile number"
                        />
                        {errors.number && <span className={styles.errorText}>{errors.number}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>

                    {/* Optional Fields */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Your address (optional)"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Job Title/Role</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g. Manager"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Organization</label>
                        <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Company name"
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Website</label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`${styles.button} ${styles.cancelBtn}`}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`${styles.button} ${styles.submitBtn}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Request Tickets'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketRequestForm;

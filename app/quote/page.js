"use client";
import React, { useState } from 'react';
import styles from './quote.module.css';
import MagneticButton from '@/components/MagneticButton';
import { useTheme } from '@/context/ThemeContext';

export default function Quote() {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        eventType: '',
        date: '',
        location: '',
        guests: '',
        services: [],
        budget: '',
        details: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => {
                const newServices = checked
                    ? [...prev.services, value]
                    : prev.services.filter(s => s !== value);
                return { ...prev, services: newServices };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = ['name', 'email', 'phone', 'eventType', 'date', 'location', 'guests', 'budget', 'details'];
        const emptyFields = requiredFields.filter(field => !formData[field]);

        if (emptyFields.length > 0) {
            alert(`Please fill in all fields. Missing: ${emptyFields.join(', ')}`);
            return;
        }

        if (formData.services.length === 0) {
            alert("Please select at least one service.");
            return;
        }

        const servicesList = formData.services.join(', ');

        const message = `*New Quote Request*

*Client Details*
Name: ${formData.name}
Company: ${formData.company}
Email: ${formData.email}
Phone: ${formData.phone}

*Event Specifics*
Type: ${formData.eventType}
Date: ${formData.date}
Location: ${formData.location}
Guests: ${formData.guests}

*Requirements*
Services: ${servicesList}
Budget: ${formData.budget}

*Additional Details*
${formData.details}`;


        const phoneNumber = "9779703606340";
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <main className={`${styles.main} ${theme === 'dark' ? styles.dark : ''}`}>
            {/* Header */}
            <section className={styles.headerSection}>
                <span className={styles.subheading}>Request a Proposal</span>
                <h1 className={styles.title}>
                    Tailored to Your <span className={styles.highlight}>Needs</span>
                </h1>
                <p className={styles.description}>
                    Please provide as many details as possible so we can create an accurate and personalized estimate for your event.
                </p>
            </section>

            {/* Quote Form */}
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit}>
                    {/* Section 1: Contact Info */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Client Details</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input name="name" type="text" className={styles.input} placeholder="John Doe" required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Company (Optional)</label>
                                <input name="company" type="text" className={styles.input} placeholder="Company Name" onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input name="email" type="email" className={styles.input} placeholder="john@example.com" required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Phone Number</label>
                                <input name="phone" type="tel" className={styles.input} placeholder="+977" required onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Event Details */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Event Specifics</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Event Type</label>
                                <select name="eventType" className={styles.select} onChange={handleChange} required>
                                    <option value="">Select Type...</option>
                                    <option value="Wedding Ceremony">Wedding Ceremony</option>
                                    <option value="Wedding Reception">Wedding Reception</option>
                                    <option value="Corporate Conference">Corporate Conference</option>
                                    <option value="Product Launch">Product Launch</option>
                                    <option value="Private Party">Private Party</option>
                                    <option value="Concert / Festival">Concert / Festival</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Date of Event</label>
                                <input name="date" type="date" className={styles.input} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Venue Location</label>
                                <input name="location" type="text" className={styles.input} placeholder="City or Venue Name" onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estimated Guest Count</label>
                                <input name="guests" type="number" className={styles.input} placeholder="e.g. 500" onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Requirements */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Services & Budget</h2>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Services Required</label>
                                <div className={styles.checkboxGrid}>
                                    {['Decoration', 'Sound & Light', 'Catering', 'Photography', 'Logistics', 'Artist Mgmt'].map((service) => (
                                        <label key={service} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="services"
                                                value={service}
                                                className={styles.checkboxInput}
                                                onChange={handleChange}
                                            /> {service}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estimated Budget (NPR)</label>
                                <select name="budget" className={styles.select} onChange={handleChange} required>
                                    <option value="">Select Range...</option>
                                    <option value="Below 5 Lakhs">Below 5 Lakhs</option>
                                    <option value="5 - 10 Lakhs">5 - 10 Lakhs</option>
                                    <option value="10 - 20 Lakhs">10 - 20 Lakhs</option>
                                    <option value="20 - 50 Lakhs">20 - 50 Lakhs</option>
                                    <option value="50 Lakhs +">50 Lakhs +</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div className={styles.formSection}>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Additional Details</label>
                                <textarea name="details" className={styles.textarea} placeholder="Tell us more about your vision, themes, or specific requirements..." onChange={handleChange} required></textarea>
                            </div>
                        </div>
                        <MagneticButton>
                            <button type="submit" className={styles.submitBtn}>
                                Submit via WhatsApp
                            </button>
                        </MagneticButton>
                    </div>
                </form>
            </div>
        </main>
    );
}

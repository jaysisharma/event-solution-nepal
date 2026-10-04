'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Loader2,
    Share2,
    Building2,
    Link as LinkIcon,
    Wrench,
    Phone,
    ShieldCheck
} from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '../settings/siteActions';
import { DEFAULT_FOOTER_SETTINGS, DEFAULT_SERVICES_LINKS, DEFAULT_QUICK_LINKS } from '@/lib/siteDefaults';
import styles from '../admin.module.css';

const Snackbar = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#10b981' : '#ef4444';

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', backgroundColor: bgColor, color: 'white',
            padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1100, animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
        </div>
    );
};

export default function AdminFooterPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [snackbar, setSnackbar] = useState(null);

    const [formData, setFormData] = useState({
        footerAbout: DEFAULT_FOOTER_SETTINGS.footerAbout,
        facebookUrl: DEFAULT_FOOTER_SETTINGS.facebookUrl,
        instagramUrl: DEFAULT_FOOTER_SETTINGS.instagramUrl,
        tiktokUrl: DEFAULT_FOOTER_SETTINGS.tiktokUrl,
        linkedinUrl: DEFAULT_FOOTER_SETTINGS.linkedinUrl,
        viberUrl: DEFAULT_FOOTER_SETTINGS.viberUrl,
        quickLinksTitle: DEFAULT_FOOTER_SETTINGS.quickLinksTitle,
        quickLinks: DEFAULT_QUICK_LINKS,
        servicesTitle: DEFAULT_FOOTER_SETTINGS.servicesTitle,
        servicesLinks: DEFAULT_SERVICES_LINKS,
        contactAddress: DEFAULT_FOOTER_SETTINGS.contactAddress,
        phone1: DEFAULT_FOOTER_SETTINGS.phone1,
        phone2: DEFAULT_FOOTER_SETTINGS.phone2,
        contactEmail: DEFAULT_FOOTER_SETTINGS.contactEmail,
        whatsappNumber: DEFAULT_FOOTER_SETTINGS.whatsappNumber,
        copyrightText: DEFAULT_FOOTER_SETTINGS.copyrightText,
        privacyPolicyUrl: DEFAULT_FOOTER_SETTINGS.privacyPolicyUrl,
        termsOfServiceUrl: DEFAULT_FOOTER_SETTINGS.termsOfServiceUrl,
    });

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const res = await getSiteSettings();
            if (res.success && res.data) {
                const d = res.data;
                let parsedServices = DEFAULT_SERVICES_LINKS;
                if (d.servicesLinks) {
                    try {
                        const p = typeof d.servicesLinks === 'string' ? JSON.parse(d.servicesLinks) : d.servicesLinks;
                        if (Array.isArray(p)) parsedServices = p;
                    } catch (e) {
                        console.error('Failed to parse servicesLinks:', e);
                    }
                }

                let parsedQuick = DEFAULT_QUICK_LINKS;
                if (d.quickLinks) {
                    try {
                        const p = typeof d.quickLinks === 'string' ? JSON.parse(d.quickLinks) : d.quickLinks;
                        if (Array.isArray(p)) parsedQuick = p;
                    } catch (e) {
                        console.error('Failed to parse quickLinks:', e);
                    }
                }

                setFormData({
                    footerAbout: d.footerAbout || DEFAULT_FOOTER_SETTINGS.footerAbout,
                    facebookUrl: d.facebookUrl || '',
                    instagramUrl: d.instagramUrl || '',
                    tiktokUrl: d.tiktokUrl || '',
                    linkedinUrl: d.linkedinUrl || '',
                    viberUrl: d.viberUrl || '',
                    quickLinksTitle: d.quickLinksTitle || 'Explore',
                    quickLinks: parsedQuick,
                    servicesTitle: d.servicesTitle || 'Services',
                    servicesLinks: parsedServices,
                    contactAddress: d.contactAddress || '',
                    phone1: d.phone1 || '',
                    phone2: d.phone2 || '',
                    contactEmail: d.contactEmail || '',
                    whatsappNumber: d.whatsappNumber || '',
                    copyrightText: d.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText,
                    privacyPolicyUrl: d.privacyPolicyUrl || '/privacy-policy',
                    termsOfServiceUrl: d.termsOfServiceUrl || '/terms-of-service',
                });
            }
            setIsLoading(false);
        }
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Quick Links helpers
    const handleQuickLinkChange = (index, field, value) => {
        setFormData(prev => {
            const next = [...prev.quickLinks];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, quickLinks: next };
        });
    };

    const addQuickLink = () => {
        setFormData(prev => ({
            ...prev,
            quickLinks: [...prev.quickLinks, { label: '', url: '' }]
        }));
    };

    const removeQuickLink = (index) => {
        setFormData(prev => ({
            ...prev,
            quickLinks: prev.quickLinks.filter((_, i) => i !== index)
        }));
    };

    // Services Links helpers
    const handleServiceLinkChange = (index, field, value) => {
        setFormData(prev => {
            const next = [...prev.servicesLinks];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, servicesLinks: next };
        });
    };

    const addServiceLink = () => {
        setFormData(prev => ({
            ...prev,
            servicesLinks: [...prev.servicesLinks, { label: '', url: '/services' }]
        }));
    };

    const removeServiceLink = (index) => {
        setFormData(prev => ({
            ...prev,
            servicesLinks: prev.servicesLinks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateSiteSettings(formData);
        setIsSaving(false);
        if (res.success) {
            setSnackbar({ message: 'Footer updated successfully!', type: 'success' });
        } else {
            setSnackbar({ message: res.error || 'Failed to update footer', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <div className={styles.mainContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading footer configuration...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.mainContent}>
            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}

            <div className={styles.topbar}>
                <div>
                    <h1 className={styles.pageTitle}>Footer Management</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        Customize all content, links, services, contact details, and social channels displayed in the website footer.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={styles.btnAddNew}
                    style={{ padding: '0.65rem 1.4rem' }}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{isSaving ? 'Saving Changes...' : 'Save Footer'}</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
                {/* 1. Brand & About Column */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Building2 size={20} color="var(--primary)" /> Column 1: Brand & About
                    </h2>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>About Summary / Bio</label>
                        <textarea
                            name="footerAbout"
                            value={formData.footerAbout}
                            onChange={handleChange}
                            rows={3}
                            className={styles.textarea || styles.input}
                            style={{ width: '100%', minHeight: '80px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            placeholder="Brief description of the company displayed under the logo..."
                        />
                    </div>
                </div>

                {/* 2. Social Media Links */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Share2 size={20} color="var(--primary)" /> Social Media Links (Column 1)
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Facebook URL</label>
                            <input
                                name="facebookUrl"
                                value={formData.facebookUrl}
                                onChange={handleChange}
                                type="url"
                                className={styles.input}
                                placeholder="https://www.facebook.com/..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Instagram URL</label>
                            <input
                                name="instagramUrl"
                                value={formData.instagramUrl}
                                onChange={handleChange}
                                type="url"
                                className={styles.input}
                                placeholder="https://www.instagram.com/..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>TikTok URL</label>
                            <input
                                name="tiktokUrl"
                                value={formData.tiktokUrl}
                                onChange={handleChange}
                                type="url"
                                className={styles.input}
                                placeholder="https://www.tiktok.com/@..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>LinkedIn URL</label>
                            <input
                                name="linkedinUrl"
                                value={formData.linkedinUrl}
                                onChange={handleChange}
                                type="url"
                                className={styles.input}
                                placeholder="https://np.linkedin.com/company/..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Viber Invite URL</label>
                            <input
                                name="viberUrl"
                                value={formData.viberUrl}
                                onChange={handleChange}
                                type="url"
                                className={styles.input}
                                placeholder="https://invite.viber.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Column 2: Quick Links (Explore) */}
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <LinkIcon size={20} color="var(--primary)" /> Column 2: Quick Links
                        </h2>
                        <button
                            type="button"
                            onClick={addQuickLink}
                            className={styles.btnSecondary}
                            style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Plus size={16} /> Add Link
                        </button>
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: '1.25rem', maxWidth: '300px' }}>
                        <label className={styles.label}>Column Heading Title</label>
                        <input
                            name="quickLinksTitle"
                            value={formData.quickLinksTitle}
                            onChange={handleChange}
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Explore"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {formData.quickLinks.map((link, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={link.label}
                                    onChange={(e) => handleQuickLinkChange(idx, 'label', e.target.value)}
                                    placeholder="Link Label (e.g. About Us)"
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <input
                                    type="text"
                                    value={link.url}
                                    onChange={(e) => handleQuickLinkChange(idx, 'url', e.target.value)}
                                    placeholder="URL Path (e.g. /about)"
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeQuickLink(idx)}
                                    className={styles.btnIconDanger}
                                    title="Remove link"
                                    style={{ padding: '8px' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Column 3: Services Links */}
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Wrench size={20} color="var(--primary)" /> Column 3: Services List
                        </h2>
                        <button
                            type="button"
                            onClick={addServiceLink}
                            className={styles.btnSecondary}
                            style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Plus size={16} /> Add Service
                        </button>
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: '1.25rem', maxWidth: '300px' }}>
                        <label className={styles.label}>Column Heading Title</label>
                        <input
                            name="servicesTitle"
                            value={formData.servicesTitle}
                            onChange={handleChange}
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Services"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {formData.servicesLinks.map((service, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={service.label}
                                    onChange={(e) => handleServiceLinkChange(idx, 'label', e.target.value)}
                                    placeholder="Service Name (e.g. Expo Management)"
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <input
                                    type="text"
                                    value={service.url}
                                    onChange={(e) => handleServiceLinkChange(idx, 'url', e.target.value)}
                                    placeholder="URL (e.g. /services)"
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeServiceLink(idx)}
                                    className={styles.btnIconDanger}
                                    title="Remove service"
                                    style={{ padding: '8px' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Column 4: Contact Information */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Phone size={20} color="var(--primary)" /> Column 4: Contact & Channels
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Office Address</label>
                            <input
                                name="contactAddress"
                                value={formData.contactAddress}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="Jwagal, Lalitpur, Nepal"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Primary Telephone</label>
                            <input
                                name="phone1"
                                value={formData.phone1}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="+977-01-5260535"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Secondary Telephone</label>
                            <input
                                name="phone2"
                                value={formData.phone2}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="+977-01-5260103"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Official Contact Email</label>
                            <input
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                type="email"
                                className={styles.input}
                                placeholder="info@eventsolutionnepal.com.np"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>WhatsApp Number (Digits only)</label>
                            <input
                                name="whatsappNumber"
                                value={formData.whatsappNumber}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="9779851336342"
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Bottom Bar & Legal */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <ShieldCheck size={20} color="var(--primary)" /> Bottom Bar & Legal Links
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label className={styles.label}>Copyright Notice</label>
                            <input
                                name="copyrightText"
                                value={formData.copyrightText}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="Event Solution Nepal. All rights reserved."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Privacy Policy Link</label>
                            <input
                                name="privacyPolicyUrl"
                                value={formData.privacyPolicyUrl}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="/privacy-policy"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Terms of Service Link</label>
                            <input
                                name="termsOfServiceUrl"
                                value={formData.termsOfServiceUrl}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder="/terms-of-service"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Save Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', marginBottom: '3rem' }}>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={styles.btnAddNew}
                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSaving ? 'Saving Changes...' : 'Save All Footer Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

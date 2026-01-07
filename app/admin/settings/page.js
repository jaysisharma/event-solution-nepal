'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Shield, CheckCircle, AlertCircle, Settings, Lock, Eye, EyeOff } from 'lucide-react';
import { getAdminUsers, createAdminUser, deleteAdminUser, updateAdminPassword } from './actions';
import { getSiteSettings, updateSiteSettings } from './siteActions';
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

const PasswordModal = ({ admin, onClose, onSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateAdminPassword(admin.id, newPassword);
        setIsSaving(false);
        if (res.success) {
            onSuccess(res.success);
            onClose();
        } else {
            alert(res.error);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={20} color="var(--primary)" /> Change Password for <b>{admin.username}</b>
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                className={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className={styles.btnSecondary} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" disabled={isSaving} className={styles.btnAddNew} style={{ flex: 1 }}>
                            {isSaving ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const [admins, setAdmins] = useState([]);
    const [siteSettings, setSiteSettings] = useState({
        whatsappNumber: '',
        contactEmail: '',
        contactAddress: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [snackbar, setSnackbar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null); // For password change modal

    async function loadData() {
        setIsLoading(true);
        const [usersRes, settingsRes] = await Promise.all([
            getAdminUsers(),
            getSiteSettings()
        ]);

        if (usersRes.success) setAdmins(usersRes.data);
        if (settingsRes.success && settingsRes.data) {
            setSiteSettings({
                whatsappNumber: settingsRes.data.whatsappNumber || '',
                contactEmail: settingsRes.data.contactEmail || '',
                contactAddress: settingsRes.data.contactAddress || '',
            });
        }
        setIsLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (formData) => {
        setIsSubmitting(true);
        const res = await createAdminUser(formData);
        setIsSubmitting(false);

        if (res.success) {
            setSnackbar({ message: res.success, type: 'success' });
            loadData();
            document.getElementById('createAdminForm').reset();
        } else {
            setSnackbar({ message: res.error, type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this admin?')) return;
        const res = await deleteAdminUser(id);
        if (res.success) {
            setSnackbar({ message: res.success, type: 'success' });
            loadData();
        } else {
            setSnackbar({ message: res.error, type: 'error' });
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);
        const res = await updateSiteSettings(siteSettings);
        setIsSavingSettings(false);

        if (res.success) {
            setSnackbar({ message: res.success, type: 'success' });
        } else {
            setSnackbar({ message: res.error || 'Failed to update', type: 'error' });
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSiteSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            {snackbar && <Snackbar {...snackbar} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Admin Settings</h1>
                    <p className={styles.pageSubtitle}>Manage system administrators and site configuration</p>
                </div>
            </div>

            <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* General Site Settings Panel */}
                <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={20} /> General Site Settings
                    </h2>
                    <form onSubmit={handleUpdateSettings} className={styles.formGroup} style={{ gap: '1.5rem', marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>WhatsApp Number <span style={{ fontSize: '0.8rem', color: '#666' }}>(e.g. 9779851336342)</span></label>
                            <input
                                name="whatsappNumber"
                                value={siteSettings.whatsappNumber}
                                onChange={handleSettingsChange}
                                type="text"
                                className={styles.input}
                                required
                                placeholder="Enter number without +"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Contact Email <span style={{ fontSize: '0.8rem', color: '#666' }}>(e.g. info@example.com)</span></label>
                            <input
                                name="contactEmail"
                                value={siteSettings.contactEmail}
                                onChange={handleSettingsChange}
                                type="email"
                                className={styles.input}
                                required
                                placeholder="Enter system email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Office Address <span style={{ fontSize: '0.8rem', color: '#666' }}>(e.g. Jwagal, Lalitpur)</span></label>
                            <input
                                name="contactAddress"
                                value={siteSettings.contactAddress}
                                onChange={handleSettingsChange}
                                type="text"
                                className={styles.input}
                                required
                                placeholder="Enter office address"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={isSavingSettings} className={styles.btnAddNew} style={{ width: 'auto', padding: '12px 30px' }}>
                                {isSavingSettings ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Create Admin Panel */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} /> Create New Admin
                    </h2>

                    <form id="createAdminForm" action={handleCreate} className={styles.formGroup} style={{ gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Username</label>
                            <input name="username" type="text" className={styles.input} required placeholder="e.g. admin2" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Password</label>
                            <input name="password" type="password" className={styles.input} required placeholder="Strong password" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className={styles.btnAddNew} style={{ width: '100%', justifyContent: 'center' }}>
                            {isSubmitting ? 'Creating...' : 'Create Admin'}
                        </button>
                    </form>
                </div>

                {/* List Admins Panel */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} /> Existing Admins
                    </h2>

                    {isLoading ? (
                        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading...</p>
                    ) : (
                        <div className={styles.listStack} style={{ marginTop: '1.5rem' }}>
                            {admins.map(admin => (
                                <div key={admin.id} className={styles.listItem}>
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{admin.username}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setSelectedAdmin(admin)}
                                            className={styles.btnIcon}
                                            style={{ color: '#6366f1', background: '#eef2ff' }}
                                            title="Change Password"
                                        >
                                            <Lock size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            className={styles.btnIcon}
                                            style={{ color: '#ef4444', background: '#fee2e2' }}
                                            title="Delete Admin"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {admins.length === 0 && <p>No admins found.</p>}
                        </div>
                    )}
                </div>
            </div>

            {selectedAdmin && (
                <PasswordModal
                    admin={selectedAdmin}
                    onClose={() => setSelectedAdmin(null)}
                    onSuccess={(msg) => setSnackbar({ message: msg, type: 'success' })}
                />
            )}
        </div>
    );
}

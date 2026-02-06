'use client';
import React, { useState, useEffect } from 'react';
import { getRentals, deleteRental, addRental, updateRental, getRentalCategories } from './actions';
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import styles from '../admin.module.css';
import Link from 'next/link';
import RentalForm from './RentalForm';


// We can reuse the same Snackbar component or import it if shared
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
            display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
        </div>
    );
};

export default function RentalsPage() {
    const [rentals, setRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [snackbar, setSnackbar] = useState(null);

    const [deletingId, setDeletingId] = useState(null);

    // Need to fetch categories for the form
    const [existingCategories, setExistingCategories] = useState([]);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        const [rentalsRes, categoriesRes] = await Promise.all([
            getRentals(),
            getRentalCategories()
        ]);

        if (rentalsRes.success) {
            setRentals(rentalsRes.data);
        }
        if (categoriesRes.success) {
            setExistingCategories(categoriesRes.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddNew = () => {
        setEditingItem(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this rental item?")) return;
        setDeletingId(id);
        const formData = new FormData();
        formData.append('id', id);

        try {
            const res = await deleteRental(formData);
            if (res.success) {
                fetchData();
                setSnackbar({ message: 'Item deleted', type: 'success' });
            } else {
                setSnackbar({ message: 'Failed to delete item', type: 'error' });
            }
        } catch (error) {
            setSnackbar({ message: 'An error occurred', type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    // Wrapper for form actions
    const handleFormAction = async (formData) => {
        let res;
        if (editingItem) {
            res = await updateRental(formData);
        } else {
            res = await addRental(formData);
        }

        if (res && res.success) {
            fetchData();
            setShowForm(false);
            setEditingItem(null);
            setSnackbar({ message: editingItem ? 'Item updated!' : 'Item created!', type: 'success' });
        }
        return res;
    };

    return (
        <div>
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Rentals Management</h1>
                    <p className={styles.pageSubtitle} style={{ marginTop: '0.25rem' }}>Manage inventory and pricing</p>
                </div>
                {!showForm && (
                    <button onClick={handleAddNew} className={styles.btnAddNew}>
                        <Plus size={18} /> Add New Item
                    </button>
                )}
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className={styles.rentalPageFormContainer}>
                    <div className={styles.card} style={{ border: 'none', boxShadow: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <h3 className={styles.cardTitle} style={{ margin: 0, color: '#3b82f6' }}>
                                {editingItem ? 'Edit Rental Item' : 'New Rental Details'}
                            </h3>
                            <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <RentalForm
                            initialData={editingItem}
                            action={handleFormAction}
                            mode={editingItem ? 'edit' : 'create'}
                            existingCategories={existingCategories}
                            isInline={true}
                        />
                    </div>
                </div>
            )}

            <div className={styles.card}>
                <div className={styles.tableContainer} style={{ boxShadow: 'none', border: 'none' }}>
                    {isLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading rentals...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Sizes</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyState}>No rental items found.</td>
                                    </tr>
                                ) : (
                                    rentals.map((item) => {
                                        let imageSrc = '';
                                        try {
                                            const images = JSON.parse(item.images);
                                            if (images.length > 0) imageSrc = images[0];
                                        } catch (e) { }

                                        let sizesCount = 0;
                                        try {
                                            sizesCount = JSON.parse(item.availableSizes).length;
                                        } catch (e) { }

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    {imageSrc ? (
                                                        <img
                                                            src={imageSrc}
                                                            alt={item.title}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '4px' }} />
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{item.title}</td>
                                                <td><span className={styles.badge} style={{ background: '#f1f5f9' }}>{item.category}</span></td>
                                                <td><span style={{ color: '#64748b', fontSize: '0.85rem' }}>{sizesCount} sizes</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className={styles.actions} style={{ justifyContent: 'flex-end', display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleEdit(item)} className={styles.btnIcon} title="Edit" disabled={deletingId === item.id}>
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className={styles.btnIcon}
                                                            style={{ color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#fee2e2' }}
                                                            title="Delete"
                                                            disabled={deletingId === item.id}
                                                        >
                                                            {deletingId === item.id ? (
                                                                <Loader2 className="animate-spin" size={16} />
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useEffect, useState } from 'react';
import { getTicketRequests, updateTicketRequestStatus, deleteTicketRequest } from '@/app/actions/ticketRequest';
import AdminLayoutWrapper from '@/app/admin/AdminLayoutWrapper';
import { Trash2, Phone, Mail, CheckCircle, Clock, ExternalLink, Globe, MapPin } from 'lucide-react';
import styles from './requests.module.css';

export default function TicketRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        const res = await getTicketRequests();
        if (res.success) {
            setRequests(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic UI update could be done here, but safe refetch is fine for admin
        if (!confirm(`Mark this request as ${newStatus}?`)) return;

        const res = await updateTicketRequestStatus(id, newStatus);
        if (res.success) {
            fetchRequests();
        } else {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this request? This cannot be undone.")) return;

        const res = await deleteTicketRequest(id);
        if (res.success) {
            fetchRequests();
        } else {
            alert("Failed to delete request");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RESOLVED':
                return <span className={`${styles.statusBadge} ${styles.statusResolved}`}><CheckCircle size={12} /> Resolved</span>;
            case 'CONTACTED':
                return <span className={`${styles.statusBadge} ${styles.statusContacted}`}><Phone size={12} /> Contacted</span>;
            default:
                return <span className={`${styles.statusBadge} ${styles.statusPending}`}><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <AdminLayoutWrapper>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Ticket Requests</h1>
                    <button
                        onClick={fetchRequests}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className={styles.empty}>
                        No ticket requests found.
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Date & Time</th>
                                        <th className={styles.th}>User Details</th>
                                        <th className={styles.th}>Event Interest</th>
                                        <th className={styles.th}>Contact Info</th>
                                        <th className={styles.th}>Professional Info</th>
                                        <th className={styles.th}>Status</th>
                                        <th className={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                <div className={styles.date}>{new Date(request.createdAt).toLocaleDateString()}</div>
                                                <div className={styles.time}>{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.name}>{request.name}</div>
                                                {request.address && (
                                                    <div className={styles.detailItem} style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={12} className={styles.detailLabel} /> {request.address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.eventName}>{request.eventName}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <a href={`tel:${request.number}`} className={styles.contactLink}>
                                                    <Phone size={14} /> {request.number}
                                                </a>
                                                <a href={`mailto:${request.email}`} className={styles.contactLink}>
                                                    <Mail size={14} /> {request.email}
                                                </a>
                                            </td>
                                            <td className={styles.td}>
                                                {request.organization ? (
                                                    <>
                                                        <div className={styles.organization}>🏢 {request.organization}</div>
                                                        {request.title && <div className={styles.detailItem}>{request.title}</div>}
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>N/A</span>
                                                )}
                                                {request.website && (
                                                    <div style={{ marginTop: '4px' }}>
                                                        <a href={request.website} target="_blank" className={styles.websiteLink}>
                                                            <Globe size={12} /> Website <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className={styles.td}>
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.actions}>
                                                    {request.status !== 'RESOLVED' && (
                                                        <button
                                                            onClick={() => handleStatusChange(request.id, 'RESOLVED')}
                                                            title="Mark as Resolved"
                                                            className={`${styles.actionBtn} ${styles.btnResolved}`}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    {request.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleStatusChange(request.id, 'CONTACTED')}
                                                            title="Mark as Contacted"
                                                            className={`${styles.actionBtn} ${styles.btnContacted}`}
                                                        >
                                                            <Phone size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(request.id)}
                                                        title="Delete Request"
                                                        className={`${styles.actionBtn} ${styles.btnDelete}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayoutWrapper>
    );
}

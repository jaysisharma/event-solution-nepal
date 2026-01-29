"use client";
import React, { useEffect, useState } from 'react';
import { getTicketRequests, updateTicketRequestStatus, deleteTicketRequest } from '@/app/actions/ticketRequest';
import AdminLayoutWrapper from '@/app/admin/AdminLayoutWrapper';
import { Trash2, Phone, Mail, CheckCircle, Clock, ExternalLink, Globe, MapPin, Loader2 } from 'lucide-react';
import styles from './requests.module.css';

export default function TicketRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

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

        setDeletingId(id);
        const res = await deleteTicketRequest(id);

        if (res.success) {
            fetchRequests();
        } else {
            alert("Failed to delete request");
        }
        setDeletingId(null);
    };

    // Kanban Grouping
    const pendingRequests = requests.filter(r => r.status === 'PENDING' || !r.status);
    const contactedRequests = requests.filter(r => r.status === 'CONTACTED');
    const resolvedRequests = requests.filter(r => r.status === 'RESOLVED');

    const renderCard = (request) => (
        <div key={request.id} className={styles.kanbanCard}>
            <div className={styles.cardHeader}>
                <span className={styles.date}>
                    {new Date(request.createdAt).toLocaleDateString()}
                    <span className={styles.time}>{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                <button
                    onClick={() => handleDelete(request.id)}
                    className={styles.deleteBtn}
                    disabled={deletingId === request.id}
                    title="Delete"
                >
                    {deletingId === request.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
            </div>

            <div className={styles.cardContent}>
                <h4 className={styles.userName}>{request.name}</h4>
                <div className={styles.eventName}>{request.eventName}</div>

                {/* Ticket Badge */}
                <div className={styles.ticketBadge}>
                    <span className={styles.ticketPrice}>
                        {request.amount > 0 ? `Rs. ${request.amount / 100}` : 'Free'}
                    </span>
                    <span className={styles.ticketType}>
                        {(() => {
                            try {
                                const details = JSON.parse(request.ticketDetails);
                                return details.ticketType ? `${details.quantity || 1}x ${details.ticketType}` : request.ticketDetails;
                            } catch (e) {
                                return request.ticketDetails;
                            }
                        })()}
                    </span>
                </div>

                {/* Contact Condensed */}
                <div className={styles.contactRow}>
                    <a href={`tel:${request.number}`} title={request.number}><Phone size={14} /></a>
                    <a href={`mailto:${request.email}`} title={request.email}><Mail size={14} /></a>
                    {request.organization && <span title={request.organization}>🏢</span>}
                </div>
            </div>

            <div className={styles.cardActions}>
                {request.status === 'PENDING' && (
                    <button onClick={() => handleStatusChange(request.id, 'CONTACTED')} className={styles.moveBtn}>
                        Mark Contacted <CheckCircle size={14} />
                    </button>
                )}
                {request.status === 'CONTACTED' && (
                    <button onClick={() => handleStatusChange(request.id, 'RESOLVED')} className={styles.moveBtn}>
                        Mark Resolved <CheckCircle size={14} />
                    </button>
                )}
                {request.status === 'RESOLVED' && (
                    <div className={styles.resolvedLabel}>
                        <CheckCircle size={14} /> Done
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Ticket Requests</h1>
                <button onClick={fetchRequests} className={styles.refreshBtn}>
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading board...</div>
            ) : (
                <div className={styles.board}>
                    {/* Pending Column */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.headerPending}`}>
                            <span>Pending</span>
                            <span className={styles.countBadge}>{pendingRequests.length}</span>
                        </div>
                        <div className={styles.columnBody}>
                            {pendingRequests.length === 0 ? <div className={styles.emptyCol}>No pending requests</div> : pendingRequests.map(renderCard)}
                        </div>
                    </div>

                    {/* Contacted Column */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.headerContacted}`}>
                            <span>Contacted</span>
                            <span className={styles.countBadge}>{contactedRequests.length}</span>
                        </div>
                        <div className={styles.columnBody}>
                            {contactedRequests.length === 0 ? <div className={styles.emptyCol}>No contacted requests</div> : contactedRequests.map(renderCard)}
                        </div>
                    </div>

                    {/* Resolved Column */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.headerResolved}`}>
                            <span>Resolved</span>
                            <span className={styles.countBadge}>{resolvedRequests.length}</span>
                        </div>
                        <div className={styles.columnBody}>
                            {resolvedRequests.length === 0 ? <div className={styles.emptyCol}>No resolved requests</div> : resolvedRequests.map(renderCard)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

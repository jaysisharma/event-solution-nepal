'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './exhibitorsAdmin.module.css';
import {
    Building2,
    Calendar,
    Users,
    ExternalLink,
    Plus,
    Pencil,
    Trash2,
    Store,
    CheckCircle,
    AlertCircle,
    X,
    Search,
    Filter,
    ArrowRight,
    FileText,
    Check,
    Ban
} from 'lucide-react';
import EventModal from './EventModal';
import EditionModal from './EditionModal';
import SelectEditionModal from './SelectEditionModal';
import {
    deleteEvent,
    deleteEdition,
    deleteExhibitor,
    approveExhibitor,
    rejectExhibitor
} from './actions';

const Snackbar = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3200);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', backgroundColor: bgColor, color: 'white',
            padding: '12px 20px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1100, fontSize: '0.875rem', fontWeight: 500
        }}>
            {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}><X size={15} /></button>
        </div>
    );
};

export default function ExhibitorsDashboard({ initialEvents = [] }) {
    const router = useRouter();
    const [events, setEvents] = useState(initialEvents);
    const [activeTab, setActiveTab] = useState('events'); // 'events' | 'editions' | 'exhibitors' | 'applications'
    const [snackbar, setSnackbar] = useState(null);

    // Event Modal State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Edition Modal State
    const [isEditionModalOpen, setIsEditionModalOpen] = useState(false);
    const [editingEdition, setEditingEdition] = useState(null);
    const [targetEventIdForEdition, setTargetEventIdForEdition] = useState(null);

    // Select Edition Modal State (For Add Exhibitor flow)
    const [isSelectEditionModalOpen, setIsSelectEditionModalOpen] = useState(false);

    // Search and Filters
    const [editionEventFilter, setEditionEventFilter] = useState('all');
    const [exhibitorSearch, setExhibitorSearch] = useState('');
    const [exhibitorEventFilter, setExhibitorEventFilter] = useState('all');

    // Applications Tab Filters
    const [applicationStatusFilter, setApplicationStatusFilter] = useState('ALL');
    const [applicationSearch, setApplicationSearch] = useState('');
    const [applicationEventFilter, setApplicationEventFilter] = useState('all');

    // Flatten Editions
    const allEditions = useMemo(() => {
        const list = [];
        events.forEach((ev) => {
            (ev.editions || []).forEach((ed) => {
                list.push({
                    ...ed,
                    eventId: ev.id,
                    eventTitle: ev.title,
                    eventSlug: ev.slug,
                    eventChronicle: ev.chronicleNumber,
                    exhibitorCount: ed.exhibitors ? ed.exhibitors.length : (ed.exhibitorCount || 0)
                });
            });
        });
        return list;
    }, [events]);

    // Flatten Exhibitors
    const allExhibitors = useMemo(() => {
        const list = [];
        events.forEach((ev) => {
            (ev.editions || []).forEach((ed) => {
                (ed.exhibitors || []).forEach((ex) => {
                    list.push({
                        ...ex,
                        eventTitle: ev.title,
                        eventSlug: ev.slug,
                        editionYear: ed.year,
                        editionTitle: ed.title,
                        status: ex.status || 'APPROVED'
                    });
                });
            });
        });
        return list;
    }, [events]);

    const pendingCount = useMemo(() => {
        return allExhibitors.filter((ex) => ex.status === 'PENDING').length;
    }, [allExhibitors]);

    // Filtered lists
    const filteredEditions = useMemo(() => {
        if (editionEventFilter === 'all') return allEditions;
        return allEditions.filter((ed) => String(ed.eventId) === String(editionEventFilter));
    }, [allEditions, editionEventFilter]);

    const filteredExhibitors = useMemo(() => {
        return allExhibitors.filter((ex) => {
            const matchesEvent = exhibitorEventFilter === 'all' || ex.eventSlug === exhibitorEventFilter;
            const query = exhibitorSearch.toLowerCase().trim();
            const matchesSearch = !query ||
                (ex.name && ex.name.toLowerCase().includes(query)) ||
                (ex.category && ex.category.toLowerCase().includes(query)) ||
                (ex.booth && ex.booth.toLowerCase().includes(query)) ||
                (ex.contactPerson && ex.contactPerson.toLowerCase().includes(query));
            return matchesEvent && matchesSearch;
        });
    }, [allExhibitors, exhibitorEventFilter, exhibitorSearch]);

    const filteredApplications = useMemo(() => {
        return allExhibitors.filter((ex) => {
            const matchesStatus = applicationStatusFilter === 'ALL' || (ex.status || 'APPROVED') === applicationStatusFilter;
            const matchesEvent = applicationEventFilter === 'all' || ex.eventSlug === applicationEventFilter;
            const query = applicationSearch.toLowerCase().trim();
            const matchesSearch = !query ||
                (ex.name && ex.name.toLowerCase().includes(query)) ||
                (ex.contactPerson && ex.contactPerson.toLowerCase().includes(query)) ||
                (ex.email && ex.email.toLowerCase().includes(query)) ||
                (ex.contact && ex.contact.toLowerCase().includes(query));
            return matchesStatus && matchesEvent && matchesSearch;
        });
    }, [allExhibitors, applicationStatusFilter, applicationEventFilter, applicationSearch]);

    // Handle Delete Event
    const handleDeleteEvent = async (id, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This will permanently delete all its editions and exhibitors.`)) return;
        const res = await deleteEvent(id);
        if (res.success) {
            setSnackbar({ message: `Event "${title}" deleted`, type: 'success' });
            router.refresh();
        } else {
            setSnackbar({ message: res.error || 'Failed to delete event', type: 'error' });
        }
    };

    // Handle Delete Edition
    const handleDeleteEdition = async (id, title) => {
        if (!confirm(`Are you sure you want to delete edition "${title}"? This will also delete all exhibitors in this edition.`)) return;
        const res = await deleteEdition(id);
        if (res.success) {
            setSnackbar({ message: `Edition deleted successfully`, type: 'success' });
            router.refresh();
        } else {
            setSnackbar({ message: res.error || 'Failed to delete edition', type: 'error' });
        }
    };

    // Handle Delete Exhibitor
    const handleDeleteExhibitor = async (id, name, eventSlug, year) => {
        if (!confirm(`Delete exhibitor "${name}"?`)) return;
        const res = await deleteExhibitor(id, eventSlug, year);
        if (res.success) {
            setSnackbar({ message: `Exhibitor "${name}" deleted`, type: 'success' });
            router.refresh();
        } else {
            setSnackbar({ message: res.error || 'Failed to delete exhibitor', type: 'error' });
        }
    };

    // Handle Moderation Approve
    const handleApprove = async (id, name) => {
        const res = await approveExhibitor(id);
        if (res.success) {
            setSnackbar({ message: `"${name}" approved and published to public directory!`, type: 'success' });
            router.refresh();
        } else {
            setSnackbar({ message: res.error || 'Failed to approve exhibitor', type: 'error' });
        }
    };

    // Handle Moderation Reject
    const handleReject = async (id, name) => {
        if (!confirm(`Reject exhibitor application for "${name}"?`)) return;
        const res = await rejectExhibitor(id);
        if (res.success) {
            setSnackbar({ message: `"${name}" marked as rejected.`, type: 'success' });
            router.refresh();
        } else {
            setSnackbar({ message: res.error || 'Failed to reject exhibitor', type: 'error' });
        }
    };

    const handleSuccessToast = (msg) => {
        setSnackbar({ message: msg, type: 'success' });
        router.refresh();
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className={`${styles.badge} ${styles.badgeWarning}`}>Pending Review</span>;
            case 'REJECTED':
                return <span className={`${styles.badge} ${styles.badgeDanger}`}>Rejected</span>;
            case 'APPROVED':
            default:
                return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span>;
        }
    };

    return (
        <div className={styles.pageContainer}>
            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}

            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.pageTitle}>Exhibitions & Exhibitors</h1>
                    <p className={styles.pageSubtitle}>
                        Manage exhibition series, annual editions, and participating brand exhibitors
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingEvent(null);
                            setIsEventModalOpen(true);
                        }}
                        className={styles.btnSecondary}
                    >
                        <Plus size={16} /> New Event
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingEdition(null);
                            setTargetEventIdForEdition(events[0]?.id || null);
                            setIsEditionModalOpen(true);
                        }}
                        className={styles.btnSecondary}
                    >
                        <Plus size={16} /> New Edition
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSelectEditionModalOpen(true)}
                        className={styles.btnPrimary}
                    >
                        <Plus size={16} /> Add Exhibitor
                    </button>

                    <Link
                        href="/exhibitors/apply"
                        target="_blank"
                        className={styles.btnSecondary}
                        title="View Public Exhibitor Application Portal"
                    >
                        <ExternalLink size={15} /> Public Apply Form
                    </Link>
                </div>
            </div>

            {/* Minimal KPI Metrics */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Exhibition Series</span>
                        <div className={styles.metricIcon}>
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>{events.length}</div>
                    <div className={styles.metricSubtitle}>Active Exhibition Events</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Annual Editions</span>
                        <div className={styles.metricIcon}>
                            <Calendar size={18} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>{allEditions.length}</div>
                    <div className={styles.metricSubtitle}>Scheduled & Past Editions</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Registered Exhibitors</span>
                        <div className={styles.metricIcon}>
                            <Users size={18} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>
                        {allExhibitors.length}
                        {pendingCount > 0 && (
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706', marginLeft: '8px' }}>
                                ({pendingCount} pending)
                            </span>
                        )}
                    </div>
                    <div className={styles.metricSubtitle}>Brand Showcases & Stalls</div>
                </div>
            </div>

            {/* Minimal Segmented Tabs */}
            <div className={styles.tabNav}>
                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    <Building2 size={16} />
                    Events (Series)
                    <span className={styles.tabCount}>{events.length}</span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'editions' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('editions')}
                >
                    <Calendar size={16} />
                    Annual Editions
                    <span className={styles.tabCount}>{allEditions.length}</span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'exhibitors' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('exhibitors')}
                >
                    <Store size={16} />
                    Exhibitors Directory
                    <span className={styles.tabCount}>{allExhibitors.length}</span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'applications' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('applications')}
                >
                    <FileText size={16} />
                    Applications
                    {pendingCount > 0 ? (
                        <span
                            className={styles.tabCount}
                            style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 800 }}
                        >
                            {pendingCount} Pending
                        </span>
                    ) : (
                        <span className={styles.tabCount}>{allExhibitors.length}</span>
                    )}
                </button>
            </div>

            {/* TAB 1: EVENTS LIST */}
            {activeTab === 'events' && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Index</th>
                                <th>Event Title & Slug</th>
                                <th>Description</th>
                                <th style={{ width: '130px' }}>Editions</th>
                                <th style={{ width: '220px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={styles.emptyState}>
                                        <Building2 size={36} opacity={0.4} />
                                        <span>No exhibition events found.</span>
                                        <button
                                            type="button"
                                            onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                                            className={styles.btnPrimary}
                                            style={{ marginTop: '0.5rem' }}
                                        >
                                            <Plus size={15} /> Create First Event
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                events.map((ev) => (
                                    <tr key={ev.id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                                                {ev.chronicleNumber || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{ev.title}</strong>
                                                <code style={{ fontSize: '0.75rem', color: '#64748b' }}>/exhibitors/{ev.slug}</code>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                {ev.description ? (ev.description.slice(0, 80) + (ev.description.length > 80 ? '...' : '')) : '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditionEventFilter(String(ev.id));
                                                    setActiveTab('editions');
                                                }}
                                                className={styles.badge}
                                                style={{ cursor: 'pointer', border: 'none' }}
                                            >
                                                {(ev.editions || []).length} Editions →
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actionsCell}>
                                                <button
                                                    type="button"
                                                    title={`Add edition to ${ev.title}`}
                                                    onClick={() => {
                                                        setEditingEdition(null);
                                                        setTargetEventIdForEdition(ev.id);
                                                        setIsEditionModalOpen(true);
                                                    }}
                                                    className={styles.btnSecondary}
                                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                                >
                                                    <Plus size={13} /> Add Edition
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Edit Event"
                                                    onClick={() => {
                                                        setEditingEvent(ev);
                                                        setIsEventModalOpen(true);
                                                    }}
                                                    className={styles.btnIcon}
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete Event"
                                                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                                    className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: EDITIONS LIST */}
            {activeTab === 'editions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Filter */}
                    <div className={styles.filterBar}>
                        <div className={styles.filterControls}>
                            <Filter size={15} color="#64748b" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter by Event:</span>
                            <select
                                value={editionEventFilter}
                                onChange={(e) => setEditionEventFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Events ({allEditions.length})</option>
                                {events.map((ev) => (
                                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingEdition(null);
                                setTargetEventIdForEdition(editionEventFilter !== 'all' ? editionEventFilter : (events[0]?.id || null));
                                setIsEditionModalOpen(true);
                            }}
                            className={styles.btnPrimary}
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                            <Plus size={15} /> Add Edition
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Event Series</th>
                                    <th>Edition Year</th>
                                    <th>Dates</th>
                                    <th>Venue</th>
                                    <th>Attendees</th>
                                    <th>Exhibitors</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEditions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.emptyState}>
                                            <Calendar size={36} opacity={0.4} />
                                            <span>No editions found for this selection.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEditions.map((ed) => (
                                        <tr key={ed.id}>
                                            <td>
                                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{ed.eventTitle}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <strong>{ed.year}</strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{ed.title || `Edition ${ed.year}`}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: '#334155' }}>{ed.dates || '—'}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ed.venue || '—'}</span>
                                            </td>
                                            <td>
                                                <span className={styles.badge}>{ed.attendees || '100K+'}</span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/exhibitors/${ed.eventSlug}/${ed.year}`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <span className={styles.badge} style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', cursor: 'pointer' }}>
                                                        {ed.exhibitorCount} Exhibitors →
                                                    </span>
                                                </Link>
                                            </td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    <Link
                                                        href={`/admin/exhibitors/${ed.eventSlug}/${ed.year}/new`}
                                                        title={`Add Exhibitor to ${ed.eventTitle} ${ed.year}`}
                                                        className={styles.btnPrimary}
                                                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                                                    >
                                                        <Plus size={13} /> Add Exhibitor
                                                    </Link>
                                                    <Link
                                                        href={`/admin/exhibitors/${ed.eventSlug}/${ed.year}`}
                                                        title="Manage Exhibitors List"
                                                        className={styles.btnIcon}
                                                    >
                                                        <Store size={14} />
                                                    </Link>
                                                    <Link
                                                        href={`/exhibitors/${ed.eventSlug}/${ed.year}`}
                                                        target="_blank"
                                                        title="Preview Public Page"
                                                        className={styles.btnIcon}
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        title="Edit Edition"
                                                        onClick={() => {
                                                            setEditingEdition(ed);
                                                            setIsEditionModalOpen(true);
                                                        }}
                                                        className={styles.btnIcon}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Delete Edition"
                                                        onClick={() => handleDeleteEdition(ed.id, `${ed.eventTitle} ${ed.year}`)}
                                                        className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: EXHIBITORS DIRECTORY */}
            {activeTab === 'exhibitors' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Filter and Search Bar */}
                    <div className={styles.filterBar}>
                        <div className={styles.filterControls}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by name, category, booth, or contact..."
                                    value={exhibitorSearch}
                                    onChange={(e) => setExhibitorSearch(e.target.value)}
                                    className={styles.searchInput}
                                    style={{ paddingLeft: '32px' }}
                                />
                            </div>

                            <select
                                value={exhibitorEventFilter}
                                onChange={(e) => setExhibitorEventFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Events ({allExhibitors.length})</option>
                                {events.map((ev) => (
                                    <option key={ev.slug} value={ev.slug}>{ev.title}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsSelectEditionModalOpen(true)}
                            className={styles.btnPrimary}
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                            <Plus size={15} /> Add Exhibitor
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '64px' }}>Logo</th>
                                    <th>Exhibitor Name & Category</th>
                                    <th>Event & Edition</th>
                                    <th>Booth</th>
                                    <th>Status</th>
                                    <th>Phone</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExhibitors.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.emptyState}>
                                            <Store size={36} opacity={0.4} />
                                            <span>No exhibitors match your criteria.</span>
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectEditionModalOpen(true)}
                                                className={styles.btnPrimary}
                                                style={{ marginTop: '0.5rem' }}
                                            >
                                                <Plus size={14} /> Add Exhibitor
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExhibitors.map((ex) => (
                                        <tr key={ex.id || ex.slug}>
                                            <td>
                                                <div className={styles.logoThumb}>
                                                    {ex.logo ? (
                                                        <Image
                                                            src={ex.logo}
                                                            alt={ex.name}
                                                            fill
                                                            sizes="52px"
                                                            className={styles.logoImg}
                                                        />
                                                    ) : (
                                                        <Store size={16} color="#94a3b8" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <strong style={{ color: '#0f172a' }}>{ex.name}</strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{ex.category || 'Exhibition Showcase'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>{ex.eventTitle}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Edition {ex.editionYear}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: '#475569' }}>{ex.booth || '—'}</span>
                                            </td>
                                            <td>
                                                {renderStatusBadge(ex.status)}
                                            </td>
                                            <td>
                                                {ex.contact ? (
                                                    <a
                                                        href={`tel:${ex.contact}`}
                                                        style={{ color: '#2563eb', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}
                                                    >
                                                        {ex.contact}
                                                    </a>
                                                ) : '—'}
                                            </td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    <Link
                                                        href={`/admin/exhibitors/${ex.eventSlug}/${ex.editionYear}/${ex.id || ex.slug}`}
                                                        title="Edit Exhibitor"
                                                        className={styles.btnIcon}
                                                    >
                                                        <Pencil size={14} />
                                                    </Link>
                                                    <Link
                                                        href={`/exhibitors/${ex.eventSlug}/${ex.editionYear}/${ex.id || ex.slug}`}
                                                        target="_blank"
                                                        title="View Public Page"
                                                        className={styles.btnIcon}
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        title="Delete Exhibitor"
                                                        onClick={() => handleDeleteExhibitor(ex.id || ex.dbId, ex.name, ex.eventSlug, ex.editionYear)}
                                                        className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: APPLICATIONS MODERATION */}
            {activeTab === 'applications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Applications Filter Bar */}
                    <div className={styles.filterBar}>
                        <div className={styles.filterControls}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Filter by company, contact, or email..."
                                    value={applicationSearch}
                                    onChange={(e) => setApplicationSearch(e.target.value)}
                                    className={styles.searchInput}
                                    style={{ paddingLeft: '32px' }}
                                />
                            </div>

                            <select
                                value={applicationStatusFilter}
                                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="ALL">All Statuses ({allExhibitors.length})</option>
                                <option value="PENDING">Pending Review ({pendingCount})</option>
                                <option value="APPROVED">Approved ({allExhibitors.filter((x) => x.status === 'APPROVED').length})</option>
                                <option value="REJECTED">Rejected ({allExhibitors.filter((x) => x.status === 'REJECTED').length})</option>
                            </select>

                            <select
                                value={applicationEventFilter}
                                onChange={(e) => setApplicationEventFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Events</option>
                                {events.map((ev) => (
                                    <option key={ev.slug} value={ev.slug}>{ev.title}</option>
                                ))}
                            </select>
                        </div>

                        <Link
                            href="/exhibitors/apply"
                            target="_blank"
                            className={styles.btnSecondary}
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                            <ExternalLink size={14} /> Open Public Form
                        </Link>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '64px' }}>Logo</th>
                                    <th>Brand / Company Name</th>
                                    <th>Event & Edition</th>
                                    <th>Contact Representative</th>
                                    <th>Status</th>
                                    <th style={{ width: '220px', textAlign: 'right' }}>Moderation Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyState}>
                                            <FileText size={36} opacity={0.4} />
                                            <span>No applications match your filter.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <tr key={app.id || app.slug}>
                                            <td>
                                                <div className={styles.logoThumb}>
                                                    {app.logo ? (
                                                        <Image
                                                            src={app.logo}
                                                            alt={app.name}
                                                            fill
                                                            sizes="52px"
                                                            className={styles.logoImg}
                                                        />
                                                    ) : (
                                                        <Store size={16} color="#94a3b8" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <strong style={{ color: '#0f172a' }}>{app.name}</strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.category || 'Exhibition Showcase'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>{app.eventTitle}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Edition {app.editionYear}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                                                    <strong style={{ color: '#334155' }}>{app.contactPerson || '—'}</strong>
                                                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{app.contact || app.email || '—'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {renderStatusBadge(app.status)}
                                            </td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    {app.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(app.id, app.name)}
                                                                className={styles.btnApprove}
                                                                title="Approve and Publish to Live Exhibition"
                                                            >
                                                                <Check size={13} /> Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReject(app.id, app.name)}
                                                                className={styles.btnReject}
                                                                title="Reject Application"
                                                            >
                                                                <Ban size={13} /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {app.status === 'REJECTED' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(app.id, app.name)}
                                                            className={styles.btnApprove}
                                                            title="Re-Approve Application"
                                                        >
                                                            <Check size={13} /> Re-Approve
                                                        </button>
                                                    )}

                                                    {app.status === 'APPROVED' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(app.id, app.name)}
                                                            className={styles.btnReject}
                                                            title="Unpublish / Reject"
                                                        >
                                                            <Ban size={13} /> Reject
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/admin/exhibitors/${app.eventSlug}/${app.editionYear}/${app.id || app.slug}`}
                                                        title="Edit Details / Assign Booth"
                                                        className={styles.btnIcon}
                                                    >
                                                        <Pencil size={14} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Delete Application"
                                                        onClick={() => handleDeleteExhibitor(app.id, app.name, app.eventSlug, app.editionYear)}
                                                        className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                }}
                event={editingEvent}
                onSuccess={handleSuccessToast}
            />

            <EditionModal
                isOpen={isEditionModalOpen}
                onClose={() => {
                    setIsEditionModalOpen(false);
                    setEditingEdition(null);
                }}
                events={events}
                selectedEventId={targetEventIdForEdition}
                edition={editingEdition}
                onSuccess={handleSuccessToast}
            />

            <SelectEditionModal
                isOpen={isSelectEditionModalOpen}
                onClose={() => setIsSelectEditionModalOpen(false)}
                events={events}
                onCreateEditionClick={(evtId) => {
                    setEditingEdition(null);
                    setTargetEventIdForEdition(evtId);
                    setIsEditionModalOpen(true);
                }}
            />
        </div>
    );
}

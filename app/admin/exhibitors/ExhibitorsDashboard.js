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
    Ban,
    ChevronRight,
    Sparkles,
    Layers,
    MapPin,
    Phone,
    Globe,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import EventModal from './EventModal';
import EditionModal from './EditionModal';
import SelectEditionModal from './SelectEditionModal';
import {
    deleteEvent,
    deleteEdition,
    deleteExhibitor,
    approveExhibitor,
    rejectExhibitor,
    moveEventOrder
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
    // Simplified into 3 clear primary modes:
    // 'overview' (Exhibition Hub by Event/Editions)
    // 'directory' (Searchable All Exhibitors table)
    // 'applications' (Public applicant moderation)
    const [activeTab, setActiveTab] = useState('overview');
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

    React.useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    const [isReordering, setIsReordering] = useState(false);

    // Handle Move Event Sequence (Up / Down)
    const handleMoveEvent = async (id, direction) => {
        if (isReordering) return;
        setIsReordering(true);

        // Optimistic UI update for instant feedback
        setEvents((prev) => {
            const next = [...prev];
            const idx = next.findIndex((e) => e.id === id);
            if (idx === -1) return prev;
            const target = direction === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= next.length) return prev;
            const temp = next[idx];
            next[idx] = next[target];
            next[target] = temp;
            return next.map((e, i) => ({
                ...e,
                chronicleNumber: String(i + 1).padStart(2, '0')
            }));
        });

        try {
            const res = await moveEventOrder(id, direction);
            if (res.success) {
                setSnackbar({ message: 'Event order updated successfully', type: 'success' });
                router.refresh();
            } else {
                setSnackbar({ message: res.error || 'Failed to reorder event', type: 'error' });
                router.refresh();
            }
        } catch (err) {
            setSnackbar({ message: err.message || 'Error reordering event', type: 'error' });
            router.refresh();
        } finally {
            setIsReordering(false);
        }
    };

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

            {/* Redesigned Clean Header */}
            <div className={styles.pageHeader}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.pageTitle}>Exhibition & Exhibitors Hub</h1>
                    <p className={styles.pageSubtitle}>
                        Select an event below to manage its participating brand stalls and annual editions.
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
                        <Plus size={15} /> New Event
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSelectEditionModalOpen(true)}
                        className={styles.btnPrimary}
                    >
                        <Plus size={15} /> Add Exhibitor
                    </button>

                    <Link
                        href="/exhibitors"
                        target="_blank"
                        className={styles.btnSecondary}
                        title="View Public Exhibitions Directory"
                    >
                        <ExternalLink size={14} /> Public View
                    </Link>
                </div>
            </div>

            {/* Clean Segmented Tab Navigation (Overview, Directory, Applications) */}
            <div className={styles.tabNav}>
                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Layers size={16} />
                    <span>Exhibition Events & Editions</span>
                    <span className={styles.tabCount}>{events.length}</span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'directory' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('directory')}
                >
                    <Store size={16} />
                    <span>All Exhibitors ({allExhibitors.length})</span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'applications' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('applications')}
                >
                    <FileText size={16} />
                    <span>Applications</span>
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

            {/* TAB 1: REDESIGNED CLEAN OVERVIEW (Visual Cards per Event Series) */}
            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Quick Metric Bar */}
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
                            <div className={styles.metricSubtitle}>Recorded Editions</div>
                        </div>

                        <div className={styles.metricCard}>
                            <div className={styles.metricHeader}>
                                <span className={styles.metricLabel}>Total Brand Stalls</span>
                                <div className={styles.metricIcon}>
                                    <Users size={18} />
                                </div>
                            </div>
                            <div className={styles.metricValue}>
                                {allExhibitors.length}
                                {pendingCount > 0 && (
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706', marginLeft: '6px' }}>
                                        ({pendingCount} review)
                                    </span>
                                )}
                            </div>
                            <div className={styles.metricSubtitle}>Participating Exhibitors</div>
                        </div>
                    </div>

                    {/* Event Series Cards Grid */}
                    <div className={styles.eventsHubGrid}>
                        {events.map((ev, evIdx) => {
                            const eventEditions = ev.editions || [];
                            const totalStalls = eventEditions.reduce(
                                (acc, cur) => acc + (cur.exhibitors ? cur.exhibitors.length : 0),
                                0
                            );

                            return (
                                <div key={ev.id} className={styles.eventHubCard}>
                                    <div>
                                        {/* Event Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        fontFamily: 'monospace',
                                                        backgroundColor: '#eff6ff',
                                                        color: '#2563eb',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #bfdbfe'
                                                    }}>
                                                        #{ev.chronicleNumber || '01'}
                                                    </span>
                                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                                                        {ev.title}
                                                    </h3>
                                                </div>
                                                <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                                                    {eventEditions.length} edition{eventEditions.length !== 1 ? 's' : ''} • {totalStalls} registered exhibitor{totalStalls !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    title="Move Earlier in Order (#01, #02...)"
                                                    disabled={evIdx === 0 || isReordering}
                                                    onClick={() => handleMoveEvent(ev.id, 'up')}
                                                    className={styles.btnIcon}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        opacity: evIdx === 0 ? 0.35 : 1,
                                                        cursor: evIdx === 0 ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Move Later in Order"
                                                    disabled={evIdx === events.length - 1 || isReordering}
                                                    onClick={() => handleMoveEvent(ev.id, 'down')}
                                                    className={styles.btnIcon}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        opacity: evIdx === events.length - 1 ? 0.35 : 1,
                                                        cursor: evIdx === events.length - 1 ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Edit Event Title/Image/Order"
                                                    onClick={() => {
                                                        setEditingEvent(ev);
                                                        setIsEventModalOpen(true);
                                                    }}
                                                    className={styles.btnIcon}
                                                    style={{ width: '28px', height: '28px' }}
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete Event Series"
                                                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                                    className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                    style={{ width: '28px', height: '28px' }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {ev.description && (
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: '#64748b',
                                                lineHeight: 1.45,
                                                marginBottom: '1rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {ev.description}
                                            </p>
                                        )}

                                        {/* Available Editions Section */}
                                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' }}>
                                                Annual Editions:
                                            </span>

                                            {eventEditions.length === 0 ? (
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.4rem 0' }}>
                                                    No editions yet.
                                                </div>
                                            ) : (
                                                eventEditions.map((ed) => {
                                                    const count = ed.exhibitors ? ed.exhibitors.length : 0;
                                                    return (
                                                        <Link
                                                            key={ed.id}
                                                            href={`/admin/exhibitors/${ev.slug}/${ed.year}`}
                                                            className={styles.editionPill}
                                                            title={`Manage exhibitors for Year ${ed.year}`}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Calendar size={14} color="#2563eb" />
                                                                <strong style={{ fontSize: '0.875rem' }}>Edition {ed.year}</strong>
                                                                {ed.venue && (
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        • {ed.venue}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700,
                                                                    color: '#15803d',
                                                                    backgroundColor: '#dcfce7',
                                                                    padding: '2px 7px',
                                                                    borderRadius: '999px'
                                                                }}>
                                                                    {count} Brand{count !== 1 ? 's' : ''}
                                                                </span>
                                                                <ChevronRight size={14} color="#94a3b8" />
                                                            </div>
                                                        </Link>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div style={{
                                        marginTop: '1.25rem',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '0.5rem'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingEdition(null);
                                                setTargetEventIdForEdition(ev.id);
                                                setIsEditionModalOpen(true);
                                            }}
                                            className={styles.btnSecondary}
                                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                                        >
                                            <Plus size={13} /> Add Year Edition
                                        </button>

                                        <Link
                                            href={`/exhibitors/${ev.slug}`}
                                            target="_blank"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.775rem',
                                                color: '#2563eb',
                                                fontWeight: 600,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <span>Public Page</span>
                                            <ExternalLink size={12} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: ALL EXHIBITORS DIRECTORY (Searchable Global Table) */}
            {activeTab === 'directory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Filter and Search Bar */}
                    <div className={styles.filterBar}>
                        <div className={styles.filterControls}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by brand name, booth, or contact..."
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
                                    <th>Stall / Booth</th>
                                    <th>Status</th>
                                    <th>Contact</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExhibitors.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.emptyState}>
                                            <Store size={36} opacity={0.4} />
                                            <span>No exhibitors match your filter.</span>
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
                                                <Link
                                                    href={`/admin/exhibitors/${ex.eventSlug}/${ex.editionYear}`}
                                                    style={{ textDecoration: 'none' }}
                                                    title="Open Edition Page"
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>{ex.eventTitle}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Year {ex.editionYear} →</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{ex.booth || '—'}</span>
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

            {/* TAB 3: APPLICATIONS MODERATION */}
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

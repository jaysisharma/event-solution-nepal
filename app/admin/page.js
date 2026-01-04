import prisma from '@/lib/db';
import styles from './admin.module.css';
import Link from 'next/link';
import {
    Users,
    Calendar,
    Package,
    Briefcase,
    Plus,
    TrendingUp,
    ArrowRight,
    Search,
    Bell
} from 'lucide-react';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { getSystemHealth } from './system/actions';

// Server Widget for the Side Panel
async function ServerHealthSummary() {
    let health = null;
    try {
        health = await getSystemHealth();
    } catch (e) { }

    const isLive = health && health.app.status === 'operational';

    return (
        <div className={styles.contentCard} style={{ height: '100%' }}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>System Health</h3>
                <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: isLive ? '#ecfdf5' : '#fef2f2',
                    color: isLive ? '#10b981' : '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 700
                }}>
                    {isLive ? 'OPTIMAL' : 'ISSUES'}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Uptime</div>
                    <div style={{ fontWeight: 600 }}>{health ? Math.floor(health.app.uptime / 3600) + 'h ' + Math.floor((health.app.uptime % 3600) / 60) + 'm' : '--'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Database</div>
                    <div style={{ fontWeight: 600, color: '#10b981' }}>Connected</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Memory Load</div>
                    <div style={{ fontWeight: 600 }}>{health ? health.system.memory.usagePercentage : 0}%</div>
                </div>
            </div>

            <Link href="/admin/system" style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #e2e8f0'
            }}>
                View Full Diagnostics
            </Link>
        </div>
    );
}

export default async function AdminDashboard() {
    const partnerCount = await prisma.partner.count();
    const eventCount = await prisma.event.count();
    const rentalCount = await prisma.rentalItem.count();
    const projectCount = await prisma.workProject.count();

    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <span className={styles.pageSubtitle}>{date}</span>
                    <h1 className={styles.pageTitle}>Good Afternoon, Admin</h1>
                </div>
                <div className={styles.headerActions}>
                    <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Search size={20} color="#64748b" />
                    </div>
                    <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Bell size={20} color="#64748b" />
                    </div>
                </div>
            </div>

            {/* 1. Metrics Grid (Top) */}
            <div className={styles.metricsGrid}>
                {/* Events */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Total Events</span>
                        <div className={styles.metricIcon}>
                            <Calendar size={18} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.metricValue}>{eventCount}</div>
                        <div className={styles.metricTrend}>
                            <span className={styles.trendUp}>+2</span>
                            <span className={styles.trendNeutral}>this month</span>
                        </div>
                    </div>
                </div>

                {/* Rentals */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Equipment</span>
                        <div className={styles.metricIcon}>
                            <Package size={18} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.metricValue}>{rentalCount}</div>
                        <div className={styles.metricTrend}>
                            <span className={styles.trendNeutral}>Inventory active</span>
                        </div>
                    </div>
                </div>

                {/* Projects */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Portfolio</span>
                        <div className={styles.metricIcon}>
                            <Briefcase size={18} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.metricValue}>{projectCount}</div>
                        <div className={styles.metricTrend}>
                            <span className={styles.trendUp}>Updated recently</span>
                        </div>
                    </div>
                </div>

                {/* Partners */}
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>Partners</span>
                        <div className={styles.metricIcon}>
                            <Users size={18} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.metricValue}>{partnerCount}</div>
                        <div className={styles.metricTrend}>
                            <span className={styles.trendNeutral}>Active relations</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Dashboard Content (Charts + Health) */}
            <div className={styles.dashboardGrid}>
                {/* Large Chart Widget */}
                <div className={styles.contentCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Live Server Performance</h3>
                    </div>
                    {/* The Chart Component */}
                    <div className={styles.serverChartContainer}>
                        <DashboardCharts />
                    </div>
                </div>

                {/* Side Health Widget */}
                <ServerHealthSummary />
            </div>

            {/* 3. Quick Actions */}
            <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Quick Management</h3>
            <div className={styles.quickActionsGrid}>
                <Link href="/admin/events/new" className={styles.actionButton}>
                    <div className={styles.actionIcon}><Plus size={20} /></div>
                    <div className={styles.actionText}>
                        <h5>Create Event</h5>
                        <p>Schedule new</p>
                    </div>
                </Link>

                <Link href="/admin/rentals/new" className={styles.actionButton}>
                    <div className={styles.actionIcon} style={{ background: '#ecfdf5', color: '#10b981' }}><Package size={20} /></div>
                    <div className={styles.actionText}>
                        <h5>Add Rental</h5>
                        <p>New item</p>
                    </div>
                </Link>

                <Link href="/admin/projects" className={styles.actionButton}>
                    <div className={styles.actionIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}><Briefcase size={20} /></div>
                    <div className={styles.actionText}>
                        <h5>Update Portfolio</h5>
                        <p>Add project</p>
                    </div>
                </Link>

                <Link href="/admin/gallery" className={styles.actionButton}>
                    <div className={styles.actionIcon} style={{ background: '#fff7ed', color: '#f97316' }}><TrendingUp size={20} /></div>
                    <div className={styles.actionText}>
                        <h5>Manage Gallery</h5>
                        <p>Photos & Media</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

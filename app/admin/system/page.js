
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/app/admin/admin.module.css';
import { getSystemHealth } from './actions';
import {
    Activity,
    Database,
    Server,
    Cpu,
    Clock,
    RefreshCw,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

export default function SystemHealthPage() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchHealth = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSystemHealth();
            setHealth(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch health metrics", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, [fetchHealth, refreshKey]);

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        let result = "";
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        result += `${minutes}m`;
        return result || "Just started";
    };

    const StatusBadge = ({ status }) => {
        if (status === "operational" || status === "connected") {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                }}>
                    <CheckCircle2 size={14} /> Operational
                </span>
            );
        }
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontWeight: '600',
                fontSize: '0.85rem'
            }}>
                <AlertTriangle size={14} /> Check System
            </span>
        );
    };

    const Card = ({ title, icon: Icon, children }) => (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
                <Icon size={20} color="#94a3b8" />
            </div>
            {children}
        </div>
    );

    return (
        <div style={{ padding: '0 0 40px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h1 className={styles.pageTitle}>System Status</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Real-time application performance monitor</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} /> Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#0f172a',
                            fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {!health && loading ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '400px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    color: '#94a3b8'
                }}>
                    Start application to view metrics...
                </div>
            ) : health ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                    {/* Database Health */}
                    <Card title="Database" icon={Database}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <StatusBadge status={health.database.status} />
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                {health.database.latency}ms
                            </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            PostgreSQL Response Latency
                        </div>
                    </Card>

                    {/* App Health */}
                    <Card title="Application" icon={Activity}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <StatusBadge status={health.app.status} />
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                {health.app.latency}ms
                            </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Internal API Latency
                        </div>
                    </Card>

                    {/* Memory Usage */}
                    <Card title="Memory Usage" icon={Server}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {health.system.memory.usedMB} MB
                                </span>
                                <span style={{ fontSize: '0.875rem', color: '#64748b', alignSelf: 'center' }}>
                                    of {health.system.memory.totalMB} MB
                                </span>
                            </div>
                            {/* Progress Bar */}
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min(health.system.memory.usagePercentage, 100)}%`,
                                    height: '100%',
                                    backgroundColor: health.system.memory.usagePercentage > 80 ? '#ef4444' : '#3b82f6',
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Process RAM Consumption
                        </div>
                    </Card>

                    {/* Uptime */}
                    <Card title="System Uptime" icon={Clock}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                            {formatUptime(health.app.uptime)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Since last restart
                        </div>
                    </Card>

                    {/* CPU Info */}
                    <Card title="CPU Load" icon={Cpu}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center',
                                flex: 1,
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>1 Min</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{health.system.cpuLoad[0].toFixed(2)}</div>
                            </div>
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center',
                                flex: 1,
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>5 Min</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{health.system.cpuLoad[1].toFixed(2)}</div>
                            </div>
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center',
                                flex: 1,
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>15 Min</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{health.system.cpuLoad[2].toFixed(2)}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Average Load ({health.system.cpus} Cores)
                        </div>
                    </Card>

                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px' }}>
                    Failed to load system metrics.
                </div>
            )}
        </div>
    );
}

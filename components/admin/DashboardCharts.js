"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    ComposedChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Activity, Users } from 'lucide-react';
import { getSystemHealth } from '@/app/admin/system/actions';
import { getVisitorStats } from '@/app/admin/analytics/actions';
import styles from '@/app/admin/admin.module.css';

export default function DashboardCharts() {
    const [activeTab, setActiveTab] = useState('health'); // 'health' or 'traffic'

    // --- Health State ---
    const [health, setHealth] = useState(null);
    // Initialize with some empty data points to ensure chart renders grid immediately
    const [history, setHistory] = useState(Array(20).fill({ time: '', memory: 0, cpu: 0, latency: 0 }));
    const [healthLoading, setHealthLoading] = useState(true);

    // --- Traffic State ---
    const [traffic, setTraffic] = useState(null);
    const [trafficLoading, setTrafficLoading] = useState(false);

    // Fetch Health (Runs continuously)
    const fetchHealth = useCallback(async () => {
        try {
            const data = await getSystemHealth();
            setHealth(data);

            setHistory(prev => {
                const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const newPoint = {
                    time: now,
                    memory: data.system.memory.usedMB,
                    cpu: (data.system.cpuLoad[0] * 10), // Scaled for visibility
                    latency: data.app.latency,
                };

                // Remove the first element (oldest) and add new one
                const newInfo = [...prev.slice(1), newPoint];
                return newInfo;
            });
        } catch (error) {
            console.error("Failed to fetch health", error);
            // Optional: fallback to simulated data for demo purposes if server fails
        } finally {
            setHealthLoading(false);
        }
    }, []);

    // Fetch Traffic (Runs once on mount or tab switch)
    const fetchTraffic = useCallback(async () => {
        setTrafficLoading(true);
        try {
            const data = await getVisitorStats();
            setTraffic(data);
        } catch (error) {
            console.error("Traffic fetch error", error);
        } finally {
            setTrafficLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 15000); // 15s update to reduce server load
        return () => clearInterval(interval);
    }, [fetchHealth]);

    useEffect(() => {
        if (activeTab === 'traffic' && !traffic) {
            fetchTraffic();
        }
    }, [activeTab, traffic, fetchTraffic]);

    // Derived Values
    const currentMemory = health?.system?.memory?.usedMB || 0;
    const currentCpu = health?.system?.cpuLoad?.[0]?.toFixed(2) || 0;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>

                {/* Custom Tab Switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                    <button
                        onClick={() => setActiveTab('health')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: activeTab === 'health' ? 'white' : 'transparent',
                            color: activeTab === 'health' ? '#0f172a' : '#64748b',
                            boxShadow: activeTab === 'health' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Activity size={14} /> Server Health
                    </button>
                    <button
                        onClick={() => setActiveTab('traffic')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: activeTab === 'traffic' ? 'white' : 'transparent',
                            color: activeTab === 'traffic' ? '#0f172a' : '#64748b',
                            boxShadow: activeTab === 'traffic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Users size={14} /> Visitors
                    </button>
                </div>

                {/* Stats Display (Conditional) */}
                {activeTab === 'health' ? (
                    <div className={styles.chartStats} style={{ gap: '24px' }}>
                        <div className={styles.miniStat}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                                <span className={styles.label}>Memory</span>
                            </div>
                            <span className={styles.value}>{currentMemory} MB</span>
                        </div>
                        <div className={styles.miniStat}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }}></div>
                                <span className={styles.label}>CPU Load</span>
                            </div>
                            <span className={styles.value}>{currentCpu}</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.chartStats} style={{ gap: '24px' }}>
                        <div className={styles.miniStat}>
                            <span className={styles.label}>This Month</span>
                            <span className={styles.value}>{traffic?.trend?.current || 0}</span>
                        </div>
                        <div className={styles.miniStat}>
                            <span className={styles.label}>Total Visits</span>
                            <span className={styles.value}>{traffic?.total || 0}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart Area */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'health' ? (
                        <ComposedChart data={history}>
                            <defs>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide={true} />
                            <YAxis hide={true} domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.98)', }}
                                itemStyle={{ fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorMem)" isAnimationActive={false} />
                            <Bar dataKey="cpu" barSize={6} fill="#06b6d4" opacity={0.3} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        </ComposedChart>
                    ) : (
                        <BarChart data={traffic?.monthly || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis
                                hide={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                            />
                            <Bar
                                dataKey="visits"
                                fill="#2563eb"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}


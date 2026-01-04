"use server";

import prisma from "@/lib/db";
import os from 'os';

export async function getSystemHealth() {
    const start = performance.now();
    let dbStatus = "disconnected";
    let dbLatency = 0;

    // 1. Check Database Connection & Latency
    try {
        const dbStart = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbEnd = performance.now();
        dbLatency = Math.round(dbEnd - dbStart);
        dbStatus = "connected";
    } catch (error) {
        console.error("Health Check DB Error:", error);
        dbStatus = "error";
    }

    // 2. Application Memory Usage
    const memory = process.memoryUsage();
    // Convert bytes to MB
    const usedMemoryMB = Math.round(memory.rss / 1024 / 1024);

    // Note: In Docker/Vercel, os.totalmem() reports the Host/Container limit
    const totalMemoryMB = Math.round(os.totalmem() / 1024 / 1024);

    // 3. Uptime
    const uptimeSeconds = process.uptime();

    // 4. Load Average (Unix only, may not work on all serverless but works on VPS)
    const loadAvg = os.loadavg(); // [1min, 5min, 15min]

    const end = performance.now();
    const appLatency = Math.round(end - start);

    return {
        timestamp: new Date().toISOString(),
        app: {
            status: "operational",
            uptime: uptimeSeconds,
            latency: appLatency,
            environment: process.env.NODE_ENV,
        },
        database: {
            status: dbStatus,
            latency: dbLatency,
        },
        system: {
            memory: {
                usedMB: usedMemoryMB,
                totalMB: totalMemoryMB,
                usagePercentage: Math.round((usedMemoryMB / totalMemoryMB) * 100),
            },
            cpuLoad: loadAvg,
            cpus: os.cpus().length,
        }
    };
}

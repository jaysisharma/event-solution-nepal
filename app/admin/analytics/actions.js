"use server";

import prisma from '@/lib/db';

export async function getVisitorStats() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();

        // 1. Total Cumulative Visitors (All time)
        const totalVisitors = await prisma.pageView.count();

        // 2. Monthly Visits (Current Year)
        // Group by month. Prisma doesn't support complex Date grouping natively in `groupBy` easily without raw query
        // For simplicity/compatibility, we will fetch curr year logs and aggregate in JS (assuming < 1M rows for now)
        // Or use Raw Query for performance. Let's use Raw Query for "industry standard" speed.

        // SQLite/Postgres difference handling: We assume Postgres as per user stack, but `dev.db` suggests SQLite locally?
        // Adjusting for safe standard Prisma aggregation.

        const startOfYear = new Date(currentYear, 0, 1);
        const logsThisYear = await prisma.pageView.findMany({
            where: {
                createdAt: {
                    gte: startOfYear
                }
            },
            select: {
                createdAt: true
            }
        });

        // Process Monthly Data
        const monthlyCounts = Array(12).fill(0);
        logsThisYear.forEach(log => {
            const month = log.createdAt.getMonth(); // 0-11
            monthlyCounts[month]++;
        });

        const monthlyData = monthlyCounts.map((count, index) => ({
            name: new Date(0, index).toLocaleString('default', { month: 'short' }),
            visits: count
        }));

        // 3. Yearly Visits (Last 5 years)
        // We can do a similar aggregation or separate query. 
        // For now, let's just focus on getting this year's monthly breakdown as the primary request.

        // 4. Visitors This Month vs Last Month (Trend)
        const currentMonthIdx = now.getMonth();
        const thisMonthCount = monthlyCounts[currentMonthIdx];
        const lastMonthCount = currentMonthIdx > 0 ? monthlyCounts[currentMonthIdx - 1] : 0; // Handle Jan edge case

        return {
            total: totalVisitors,
            monthly: monthlyData,
            trend: {
                current: thisMonthCount,
                previous: lastMonthCount,
                diff: thisMonthCount - lastMonthCount
            }
        };

    } catch (error) {
        console.error("Failed to fetch visitor stats:", error);
        return {
            total: 0,
            monthly: Array(12).fill({ name: '', visits: 0 }),
            trend: { current: 0, previous: 0, diff: 0 }
        };
    }
}

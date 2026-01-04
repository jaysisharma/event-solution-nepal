"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordVisit } from '@/app/actions/analytics';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const lastPath = useRef(null);

    useEffect(() => {
        // Prevent double counting if valid, though React Strict Mode might invoke twice in dev.
        // In Prod it runs once per route change.
        if (lastPath.current === pathname) return;

        // Optional: specific logic to ignore /admin routes if desired
        if (pathname.startsWith('/admin')) return;

        const track = async () => {
            await recordVisit(pathname);
        };

        // Delay slightly to ensure it's a real visit
        const timer = setTimeout(track, 1000);

        lastPath.current = pathname;
        return () => clearTimeout(timer);
    }, [pathname]);

    return null; // Renderless component
}

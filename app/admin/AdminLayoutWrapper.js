'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import styles from './admin.module.css';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminLayoutWrapper({ children }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isLoginPage = pathname === '/admin/login';

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className={styles.adminLayout}>
            {/* Mobile Topbar */}
            <header className={styles.mobileTopbar}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        src="/logo/es_logo_white.png"
                        alt="Logo"
                        width={140}
                        height={36}
                        style={{ width: 'auto', height: '36px' }}
                        priority
                    />
                </div>
                <button
                    className={styles.menuButton}
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={28} />
                </button>
            </header>

            {/* Backdrop */}
            <div
                className={`${styles.backdrop} ${isSidebarOpen ? styles.backdropVisible : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}

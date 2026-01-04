'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import styles from './admin.module.css';

export default function AdminLayoutWrapper({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from './actions';
import styles from './admin.module.css';

export default function AdminSidebar() {
    const pathname = usePathname();

    if (pathname === '/admin/login') {
        return null;
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <h2>ESN Admin</h2>
            </div>
            <nav className={styles.nav}>
                <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`}>Dashboard</Link>
                <Link href="/admin/partners" className={`${styles.navLink} ${pathname === '/admin/partners' ? styles.active : ''}`}>Partners</Link>
                <Link href="/admin/events" className={`${styles.navLink} ${pathname === '/admin/events' ? styles.active : ''}`}>Events</Link>
                <Link href="/admin/projects" className={`${styles.navLink} ${pathname === '/admin/projects' ? styles.active : ''}`}>Projects</Link>
                <Link href="/admin/services" className={`${styles.navLink} ${pathname === '/admin/services' ? styles.active : ''}`}>Services</Link>
                <Link href="/admin/team" className={`${styles.navLink} ${pathname === '/admin/team' ? styles.active : ''}`}>Team</Link>
                <Link href="/admin/gallery" className={`${styles.navLink} ${pathname === '/admin/gallery' ? styles.active : ''}`}>Gallery</Link>
            </nav>
            <div className={styles.logoutWrapper}>
                <form action={logoutAction}>
                    <button type="submit" className={styles.logoutBtn}>Logout</button>
                </form>
            </div>
        </aside>
    );
}

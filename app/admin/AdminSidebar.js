'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAction } from './actions';
import styles from './admin.module.css';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    Wrench,
    Image as ImageIcon,
    LogOut,
    Package,
    MessageSquare,
    Clock,
    Settings,
    Activity
} from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Hero Slides', path: '/admin/hero', icon: ImageIcon },
        { name: 'Timeline', path: '/admin/timeline', icon: Clock },
        { name: 'Events', path: '/admin/events', icon: Calendar },
        { name: 'Rentals', path: '/admin/rentals', icon: Package },
        { name: 'Partners', path: '/admin/partners', icon: Users },
        { name: 'Projects', path: '/admin/projects', icon: Briefcase },
        { name: 'Services', path: '/admin/services', icon: Wrench },
        { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
        { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
        { name: 'System Status', path: '/admin/system', icon: Activity },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Brand */}
            <div className={styles.brand}>
                <Link href="/admin">
                    <Image
                        src="/logo/es_logo_white.png"
                        alt="Event Solution"
                        width={150}
                        height={40}
                        style={{ width: 'auto', height: '40px' }}
                        priority
                    />
                </Link>
            </div>

            {/* Nav */}
            <nav className={styles.nav}>
                <div className={styles.navSection}>
                    <div className={styles.navLabel}>Main Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                    <Link
                        href="/admin/team"
                        className={`${styles.navLink} ${pathname === '/admin/team' ? styles.active : ''}`}
                    >
                        <Users size={20} />
                        Team
                    </Link>
                </div>
            </nav>

            {/* Bottom/Logout */}
            <div className={styles.bottomBar}>
                <form action={logoutAction}>
                    <button type="submit" className={styles.navLink} style={{ width: '100%', color: '#ef4444', justifyContent: 'flex-start', paddingLeft: 0 }}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    );
}

export const dynamic = "force-dynamic";

import AdminLayoutWrapper from './AdminLayoutWrapper';
import { ToastProvider } from '@/context/ToastContext';

export default function AdminLayout({ children }) {
    return (
        <ToastProvider>
            <AdminLayoutWrapper>
                {children}
            </AdminLayoutWrapper>
        </ToastProvider>
    );
}

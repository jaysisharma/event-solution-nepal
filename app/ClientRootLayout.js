'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import BackToTop from "@/components/BackToTop";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { GoogleAnalytics } from '@next/third-parties/google';
import JsonLd from "@/components/JsonLd";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/SettingsContext";

export default function ClientRootLayout({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return (
            <SettingsProvider>
                <ThemeProvider>
                    {/* Admin pages might need providers, but usually manage their own layout structure. 
                         However, RootLayout wraps everything, so we just render children here. 
                         AdminLayout (in app/admin/layout.js) will handle the rest. 
                      */}
                    {children}
                </ThemeProvider>
            </SettingsProvider>
        );
    }

    return (
        <SettingsProvider>
            <ThemeProvider>
                <SmoothScroll />
                <Preloader />
                <Cursor />
                <AnalyticsTracker />
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 80px - 300px)', paddingTop: '80px', position: 'relative', zIndex: 10, backgroundColor: 'var(--background)' }}>
                    {children}
                </main>
                <BackToTop />
                <WhatsAppFloat />
                <Footer />
                {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
                <JsonLd data={{
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Event Solution Nepal",
                    "url": "https://eventsolutionnepal.com.np",
                    "logo": "https://eventsolutionnepal.com.np/logo.png",
                    "sameAs": [
                        "https://www.facebook.com/eventsolutionnepal",
                        "https://www.instagram.com/eventsolutionnepal"
                    ],
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+977-9851182375",
                        "contactType": "customer service"
                    },
                    "areaServed": [
                        { "@type": "City", "name": "Kathmandu" },
                        { "@type": "City", "name": "Lalitpur" },
                        { "@type": "City", "name": "Bhaktapur" }
                    ]
                }} />
            </ThemeProvider>
        </SettingsProvider>
    );
}

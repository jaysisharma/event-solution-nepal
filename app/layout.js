import { Poppins, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { GoogleAnalytics } from '@next/third-parties/google';
import JsonLd from "@/components/JsonLd";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/SettingsContext";
import BackToTop from "@/components/BackToTop";


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  metadataBase: new URL('https://eventsolutionnepal.com.np'),
  title: {
    default: "Event Solution Nepal | Premier Event Management Company",
    template: "%s | Event Solution Nepal"
  },
  description: "Leading event management company in Nepal since 2014. We specialize in weddings, corporate events, private parties, and concerts. Bringing your vision to life.",
  keywords: ["Event Management Nepal", "Wedding Planner Nepal", "Corporate Events Kathmandu", "Event Solution Nepal", "Party Palace", "Concert Organizer"],
  authors: [{ name: "Event Solution Nepal" }],
  creator: "Event Solution Nepal",
  publisher: "Event Solution Nepal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "google-site-verification-code", // Placeholder
  },
  openGraph: {
    title: "Event Solution Nepal | Premier Event Management",
    description: "Creating meaningful and memorable events for over a decade. Your trusted partner for planning, executing, and managing events.",
    url: 'https://eventsolutionnepal.com.np',
    siteName: 'Event Solution Nepal',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Event Solution Nepal",
    description: "Premier Event Management Company in Nepal.",
    creator: "@eventsolutionnepal", // Placeholder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} ${playfair.variable}`} suppressHydrationWarning={true}>
        <SettingsProvider>
          <ThemeProvider>
            <SmoothScroll />
            <Preloader />
            <Cursor />
            <AnalyticsTracker />
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 80px - 300px)', position: 'relative', zIndex: 10, backgroundColor: 'var(--background)' }}>
              {children}
            </main>
            <BackToTop />
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
              }
            }} />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

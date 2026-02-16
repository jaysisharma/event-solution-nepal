import { Poppins, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientRootLayout from "./ClientRootLayout";

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
  description: "Leading event management company in Nepal since 2014. We specialize in weddings, corporate events, and concerts across Kathmandu, Lalitpur, and Bhaktapur.",
  keywords: ["Event Management Nepal", "Wedding Planner Nepal", "Corporate Events Kathmandu", "Event Management Lalitpur", "Event Management Bhaktapur", "Event Solution Nepal", "Party Palace", "Concert Organizer"],
  authors: [{ name: "Event Solution Nepal" }],
  creator: "Event Solution Nepal",
  publisher: "Event Solution Nepal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "C7F_d0m... placeholder", // User can replace this with actual token
  },
  openGraph: {
    title: "Event Solution Nepal | Premier Event Management",
    description: "Creating meaningful and memorable events in Kathmandu, Lalitpur, and Bhaktapur. Your trusted partner since 2014.",
    url: 'https://eventsolutionnepal.com.np',
    siteName: 'Event Solution Nepal',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Event Solution Nepal",
    description: "Premier Event Management in Kathmandu, Lalitpur, and Bhaktapur.",
    site: "@eventsolution", // Removed placeholder .nepal
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
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${poppins.variable} ${inter.variable} ${playfair.variable}`} suppressHydrationWarning={true}>
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  );
}

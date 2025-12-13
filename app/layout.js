import { Poppins, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  title: "Event Solution Nepal",
  description: "Your trusted partner for planning, executing, and managing events since 2014.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} ${playfair.variable}`}>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

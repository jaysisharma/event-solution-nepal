'use client';

import { Inter, Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

// Re-declare fonts as they might not be available if RootLayout fails
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

export default function GlobalError({ error, reset }) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} ${inter.variable} ${playfair.variable}`}>
                <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-gray-950">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                        Critical System Error
                    </h1>
                    <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
                        A critical error halted the application explicitly. We are notified and working on a fix.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="rounded-full bg-blue-600 px-8 py-3 font-medium text-white transition-opacity hover:opacity-90"
                    >
                        Refresh Application
                    </button>
                </div>
            </body>
        </html>
    );
}

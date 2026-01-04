'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                Something went wrong!
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={reset}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="rounded-full border border-gray-300 bg-transparent px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

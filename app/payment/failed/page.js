'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function PaymentFailedPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const error = searchParams.get('error');

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
                <AlertCircle size={64} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Failed</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px' }}>
                We couldn't process your payment. Please try again or contact support.
                {error && <br />}
                {error && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>Error: {error}</span>}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/" style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 600
                }}>
                    Return Home
                </Link>
            </div>
        </div>
    );
}

'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

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
            <div style={{ color: '#16a34a', marginBottom: '1rem' }}>
                <CheckCircle size={64} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Successful!</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px' }}>
                Thank you for your purchase. Your ticket request has been confirmed.
                <br /><br />
                <span style={{ color: '#0f172a', fontWeight: 600 }}>We have sent the ticket to your email address.</span>
                {id && <span><br />Reference ID: #{id}</span>}
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

'use client';

import { useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminError({ error, reset }) {
    useEffect(() => {
        console.error('Admin Error:', error);
    }, [error]);

    return (
        <div style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center',
            color: '#ef4444'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong!</h2>
            <p style={{ color: '#64748b' }}>We encountered an error while loading this page.</p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: '#1e293b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}
            >
                Try Again
            </button>
        </div>
    );
}

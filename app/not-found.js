"use client";
import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h1 style={{
                fontSize: 'clamp(6rem, 15vw, 12rem)',
                fontWeight: '800',
                color: 'var(--primary)',
                lineHeight: 1,
                marginBottom: '1rem'
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '1rem'
            }}>
                Page Not Found
            </h2>
            <p style={{
                color: '#64748b',
                fontSize: '1.125rem',
                maxWidth: '500px',
                marginBottom: '2.5rem',
                lineHeight: 1.6
            }}>
                Oops! The page you are looking for has been moved or doesn't exist.
                Let's get you back on track.
            </p>
            <Link href="/" passHref>
                <Button variant="primary" style={{ padding: '1rem 2.5rem' }}>
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}

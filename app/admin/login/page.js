'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: pending ? '#94a3b8' : '#064EA1',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: pending ? 'not-allowed' : 'pointer',
            }}
        >
            {pending ? 'Logging in...' : 'Login'}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(loginAction, null);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    color: '#1e293b'
                }}>Admin Login</h1>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem'
                            }}
                        />
                    </div>

                    {state?.error && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>
                            {state.error}
                        </p>
                    )}

                    <SubmitButton />
                </form>
            </div>
        </div>
    );
}


'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '../actions';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            className={styles.submitBtn}
            disabled={pending}
        >
            {pending ? (
                <>Logging in...</>
            ) : (
                <>Login <ArrowRight size={18} /></>
            )}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(loginAction, null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    return (
        <div className={styles.container}>
            {/* Left Side - Image */}
            <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                    <div className={styles.logoOverlay}>
                        <Image
                            src="/logo/es_logo_white.png"
                            alt="Event Solution"
                            width={180}
                            height={50}
                            style={{ width: 'auto', height: '50px' }}
                            priority
                        />
                    </div>
                    <Image
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
                        alt="Event Atmosphere"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    <div className={styles.overlay}>
                        <div className={styles.quoteConfig}>
                            <p className={styles.quoteText}>"Be A Guest At Your Own Event"</p>
                            {/* <p className={styles.quoteAuthor}>Event Solution Nepal</p> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className={styles.formSection}>
                <div className={styles.formCard}>
                    <div className={styles.logoArea}>
                        <Link href="/" className={styles.brandLink}>
                            <Image
                                src="/logo/es_logo.png"
                                alt="Event Solution"
                                width={200}
                                height={60}
                                style={{ width: 'auto', height: '60px' }}
                                priority
                            />
                        </Link>
                    </div>

                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Please enter your credentials to sign in.</p>

                    <form action={formAction} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Username</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className={styles.input}
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="**********"
                                    className={styles.input}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <SubmitButton />

                        {state?.error && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={16} />
                                <span>{state.error}</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

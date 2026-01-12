"use client";
import React, { useState } from 'react';
import { FaWhatsapp, FaTimes, FaPaperPlane } from 'react-icons/fa';
import styles from './WhatsAppFloat.module.css';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';


import { usePathname } from 'next/navigation';

const WhatsAppFloat = () => {
    const pathname = usePathname();
    const settings = useSettings();
    const phoneNumber = settings?.whatsappNumber || '9779851336342';
    const [isOpen, setIsOpen] = useState(false);

    if (pathname.startsWith('/admin')) return null;

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.container}>
            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Image src="/logo/es_logo_white.png" alt="Event Solution Nepal" width={40} height={35} style={{ objectFit: 'contain' }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Event Solution</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Typically replies in minutes</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.chatBody}>
                        <div className={styles.message}>
                            Hi there! 👋<br />
                            How can we help you plan your next event?
                            <span className={styles.timestamp}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <div className={styles.chatFooter}>
                        <a
                            href={`https://wa.me/${phoneNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.startChatBtn}
                        >
                            <FaWhatsapp size={20} />
                            Start Chat
                        </a>
                    </div>
                </div>
            )}

            {!isOpen && <span className={styles.tooltip}>Chat with us</span>}

            <button
                className={styles.button}
                onClick={toggleChat}
                aria-label={isOpen ? "Close Chat" : "Open WhatsApp Chat"}
            >
                {isOpen ? <FaTimes className={styles.icon} /> : <FaWhatsapp className={styles.icon} />}
            </button>
        </div>
    );
};

export default WhatsAppFloat;

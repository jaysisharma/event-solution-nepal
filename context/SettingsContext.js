"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings } from '@/app/admin/settings/siteActions';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        whatsappNumber: '9779851336342', // Fallback default
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await getSiteSettings();
            if (res.success && res.data) {
                setSettings({
                    whatsappNumber: res.data.whatsappNumber || '9779851336342',
                });
            }
        };
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

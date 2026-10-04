"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings } from '@/app/admin/settings/siteActions';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/siteDefaults';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_FOOTER_SETTINGS);

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await getSiteSettings();
            if (res.success && res.data) {
                setSettings(res.data);
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

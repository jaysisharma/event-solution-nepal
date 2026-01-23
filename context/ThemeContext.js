"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    // Initial load from local storage
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
        setMounted(true);
    }, []);

    // Update document attribute and local storage when theme changes
    useEffect(() => {
        if (!mounted) return;

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Avoid hydration mismatch by not rendering children until mounted (optional, but cleaner for UI consistent with theme)
    // However, to avoid blank screen, we just render children. The theme might flash if we don't block.
    // For now, let's render children immediately but the "dark" class comes in after mount.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

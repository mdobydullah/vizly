"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { config } from '@/lib/config';

export type Theme = 'dark' | 'light';

interface SettingsContextType {
    readonly animationSpeed: number; // multiplier: 0.25 (fast) to 2.0 (slow)
    setAnimationSpeed: (speed: number) => void;
    readonly isSettingsOpen: boolean;
    setIsSettingsOpen: (open: boolean) => void;
    readonly theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        if (globalThis.window !== undefined) {
            const saved = localStorage.getItem('theme');
            if (saved === 'light' || saved === 'dark') return saved;
        }
        return config.app.defaultTheme;
    });

    useEffect(() => {
        const savedSpeed = localStorage.getItem('animation_speed');
        if (savedSpeed !== null) {
            setAnimationSpeed(Number.parseFloat(savedSpeed));
        }
    }, []);

    // Keep DOM in sync with React state
    useEffect(() => {
        document.documentElement.dataset.theme = currentTheme;
    }, [currentTheme]);

    const applyTheme = useCallback((newTheme: Theme) => {
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        setCurrentTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            return next;
        });
    }, [applyTheme]);

    const contextValue = useMemo(() => ({
        animationSpeed,
        setAnimationSpeed: (speed: number) => {
            setAnimationSpeed(speed);
            localStorage.setItem('animation_speed', String(speed));
        },
        isSettingsOpen,
        setIsSettingsOpen,
        theme: currentTheme,
        setTheme,
        toggleTheme,
    }), [animationSpeed, isSettingsOpen, currentTheme, setTheme, toggleTheme]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

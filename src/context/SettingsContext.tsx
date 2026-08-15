"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { config } from '@/lib/config';

export type Theme = 'dark' | 'light' | 'white';

const THEME_CYCLE: Theme[] = ['white', 'light', 'dark'];

// 'white' is a variant of light: it keeps data-theme="light" (so all light-mode
// CSS selectors apply) and adds data-theme-variant="white" for token overrides.
function applyDomTheme(theme: Theme) {
    const root = document.documentElement;
    root.dataset.theme = theme === 'white' ? 'light' : theme;
    if (theme === 'white') {
        root.dataset.themeVariant = 'white';
    } else {
        delete root.dataset.themeVariant;
    }
}

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
            if (saved === 'light' || saved === 'dark' || saved === 'white') return saved;
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
        applyDomTheme(currentTheme);
    }, [currentTheme]);

    const applyTheme = useCallback((newTheme: Theme) => {
        applyDomTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        setCurrentTheme(prev => {
            const next = THEME_CYCLE[(THEME_CYCLE.indexOf(prev) + 1) % THEME_CYCLE.length];
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

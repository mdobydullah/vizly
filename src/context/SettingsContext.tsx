"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface SettingsContextType {
    readonly animationSpeed: number; // multiplier: 0.25 (fast) to 2.0 (slow)
    setAnimationSpeed: (speed: number) => void;
    readonly isSettingsOpen: boolean;
    setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const savedSpeed = localStorage.getItem('animation_speed');
        if (savedSpeed !== null) {
            setAnimationSpeed(Number.parseFloat(savedSpeed));
        }
    }, []);

    const contextValue = useMemo(() => ({
        animationSpeed,
        setAnimationSpeed: (speed: number) => {
            setAnimationSpeed(speed);
            localStorage.setItem('animation_speed', String(speed));
        },
        isSettingsOpen,
        setIsSettingsOpen
    }), [animationSpeed, isSettingsOpen]);

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

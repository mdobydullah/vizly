"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface SettingsContextType {
    readonly animationsEnabled: boolean;
    setAnimationsEnabled: (enabled: boolean) => void;
    readonly animationSpeed: number; // multiplier: 0.25 (fast) to 2.0 (slow)
    setAnimationSpeed: (speed: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [animationSpeed, setAnimationSpeed] = useState(1);

    useEffect(() => {
        const savedEnabled = localStorage.getItem('animations_enabled');
        if (savedEnabled !== null) {
            setAnimationsEnabled(savedEnabled === 'true');
        }
        const savedSpeed = localStorage.getItem('animation_speed');
        if (savedSpeed !== null) {
            setAnimationSpeed(Number.parseFloat(savedSpeed));
        }
    }, []);

    const contextValue = useMemo(() => ({
        animationsEnabled,
        setAnimationsEnabled: (enabled: boolean) => {
            setAnimationsEnabled(enabled);
            localStorage.setItem('animations_enabled', String(enabled));
        },
        animationSpeed,
        setAnimationSpeed: (speed: number) => {
            setAnimationSpeed(speed);
            localStorage.setItem('animation_speed', String(speed));
        }
    }), [animationsEnabled, animationSpeed]);

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

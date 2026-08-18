"use client";

import React, { useEffect, useCallback } from 'react';
import { Settings, X, Zap, Turtle, Rocket } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const SPEEDS = [
    { label: 'Slow', hint: '0.5×', value: 2, Icon: Turtle },
    { label: 'Normal', hint: '1×', value: 1, Icon: Zap },
    { label: 'Turbo', hint: '4×', value: 0.25, Icon: Rocket },
];

export function SettingsModal() {
    const {
        isSettingsOpen,
        setIsSettingsOpen,
        animationSpeed,
        setAnimationSpeed
    } = useSettings();

    // Close on escape key
    const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
        if (e instanceof KeyboardEvent) {
            if (e.key === 'Escape') setIsSettingsOpen(false);
        } else if (e.key === 'Enter' || e.key === ' ') {
            setIsSettingsOpen(false);
        }
    }, [setIsSettingsOpen]);

    useEffect(() => {
        if (isSettingsOpen) {
            globalThis.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            globalThis.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isSettingsOpen, handleKeyDown]);

    if (!isSettingsOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                background: 'color-mix(in srgb, var(--bg) 75%, transparent)',
                animation: 'modalFadeIn 0.3s ease-out'
            }}
            onClick={() => setIsSettingsOpen(false)}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
                    position: 'relative',
                    animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.1rem 1.4rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Settings size={16} style={{ color: 'var(--cyan)' }} />
                        <h2 id="settings-title" style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: 'var(--text-hi)',
                            letterSpacing: '-0.01em',
                            fontFamily: 'var(--font-display)'
                        }}>
                            Settings
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(false)}
                        aria-label="Close settings"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="close-hover"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Settings Body */}
                <div style={{ padding: '1.3rem 1.4rem 1.4rem' }}>
                    <section>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--text-dim)',
                            marginBottom: '0.7rem'
                        }}>
                            Animation Speed
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.5rem'
                        }}>
                            {SPEEDS.map(({ label, hint, value, Icon }) => {
                                const active = animationSpeed === value;
                                return (
                                    <button
                                        key={value}
                                        onClick={() => setAnimationSpeed(value)}
                                        aria-pressed={active}
                                        className={active ? '' : 'speed-hover'}
                                        style={{
                                            padding: '0.8rem 0 0.7rem',
                                            borderRadius: '12px',
                                            border: active
                                                ? '1px solid color-mix(in srgb, var(--cyan) 45%, transparent)'
                                                : '1px solid var(--border)',
                                            background: active
                                                ? 'color-mix(in srgb, var(--cyan) 9%, transparent)'
                                                : 'transparent',
                                            color: active ? 'var(--cyan)' : 'var(--text-dim)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}
                                    >
                                        <Icon size={18} />
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.72rem',
                                            fontWeight: active ? 700 : 500,
                                            color: active ? 'var(--text-hi)' : 'var(--text-dim)'
                                        }}>
                                            {label}
                                        </span>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.6rem',
                                            opacity: 0.7
                                        }}>
                                            {hint}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Footer note */}
                    <p style={{
                        margin: '1.2rem 0 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--text-dim)',
                        opacity: 0.8,
                        textAlign: 'center'
                    }}>
                        Saved to your browser · applies to all guides
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .close-hover:hover {
                    color: var(--text-hi) !important;
                    background: var(--surface2) !important;
                }
                .speed-hover:hover {
                    border-color: var(--border2) !important;
                    color: var(--text-hi) !important;
                    background: var(--surface2) !important;
                }
            `}</style>
        </div >
    );
}

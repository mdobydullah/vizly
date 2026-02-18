"use client";

import React, { useEffect, useCallback } from 'react';
import { Settings, X, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

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
                background: 'rgba(5, 7, 10, 0.75)',
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
                    maxWidth: '420px',
                    background: '#0d1117',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 32px rgba(0, 229, 255, 0.1)',
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
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(168, 85, 247, 0.1))',
                            border: '1px solid rgba(0, 229, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--cyan)'
                        }}>
                            <Settings size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', letterSpacing: '-0.02em' }}>
                                Settings
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                Customize your visual experience
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(false)}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="close-hover"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Settings Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Animation Speed */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Zap size={16} style={{ color: 'var(--cyan)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-hi)' }}>Animation Speed</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.4rem',
                            borderRadius: '14px',
                            border: '1px solid var(--border)'
                        }}>
                            {[
                                { label: 'Slow', value: 2, icon: '🐢' },
                                { label: 'Normal', value: 1, icon: '⚡' },
                                { label: 'Turbo', value: 0.25, icon: '🚀' }
                            ].map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => setAnimationSpeed(s.value)}
                                    style={{
                                        padding: '0.75rem 0',
                                        fontSize: '0.75rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: animationSpeed === s.value ? 'var(--cyan)' : 'transparent',
                                        color: animationSpeed === s.value ? '#000' : 'var(--text-dim)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: animationSpeed === s.value ? 700 : 500,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.2rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                        Settings are automatically saved to your browser and applied across all visual guides in Vizly.
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
                    color: var(--cyan) !important;
                    border-color: var(--cyan) !important;
                    background: rgba(0, 229, 255, 0.05) !important;
                }
            `}</style>
        </div >
    );
}

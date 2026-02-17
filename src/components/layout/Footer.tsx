"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Heart, Settings, X, Play, Square } from "lucide-react";
import { config } from "@/lib/config";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
    const { animationsEnabled, setAnimationsEnabled, animationSpeed, setAnimationSpeed } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <footer style={{
            marginTop: 'auto',
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid var(--border)',
            background: 'rgba(8, 11, 16, .9)',
            padding: 'clamp(2rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem) 1.5rem'
        }}>
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'clamp(1.5rem, 3vw, 2rem)'
            }}>
                <div>
                    <Link href="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.6rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        marginBottom: '.8rem'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '.7rem',
                            fontWeight: 700,
                            color: '#000',
                            fontFamily: 'var(--font-mono)',
                            flexShrink: 0
                        }}>
                            &lt;/&gt;
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: 'var(--text-hi)',
                            letterSpacing: '-.01em'
                        }}>
                            {config.app.name.split('ly')[0]}<span style={{ color: 'var(--cyan)' }}>ly</span>
                        </span>
                    </Link>
                    <p style={{
                        fontSize: '.76rem',
                        color: 'var(--text-dim)',
                        lineHeight: 1.6,
                        maxWidth: '220px'
                    }}>
                        Visual, animated guides to engineering concepts for modern engineers.
                    </p>
                </div>
                <div>
                    <h4 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '.8rem',
                        color: 'var(--text-hi)',
                        marginBottom: '.8rem',
                        letterSpacing: '.02em'
                    }}>Topics</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                        <Link href="/jwt" style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            JSON Web Tokens
                        </Link>
                        <a style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            OAuth 2.0
                        </a>
                        <a style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            REST vs GraphQL
                        </a>
                        <a style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            Caching
                        </a>
                    </div>
                </div>
                <div>
                    <h4 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '.8rem',
                        color: 'var(--text-hi)',
                        marginBottom: '.8rem',
                        letterSpacing: '.02em'
                    }}>Resources</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                        <a style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            System Design Handbook
                        </a>
                        <a style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            Cheat Sheets
                        </a>
                        <a style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            Newsletter
                        </a>
                        <a href="https://github.com/mdobydullah" target="_blank" rel="noopener noreferrer" style={{
                            fontSize: '.75rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="footer-link">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
            <div style={{
                maxWidth: '1100px',
                margin: '2rem auto 0',
                paddingTop: '1.2rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '.7rem',
                color: 'var(--text-dim)',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                    © {new Date().getFullYear()} {config.app.name} · Made with Love <Heart size={14} style={{ display: 'inline-block', verticalAlign: 'middle', color: '#ef4444' }} /> by Obydul
                </span>
                <div style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid var(--border2)',
                            background: isSettingsOpen ? 'rgba(0, 229, 255, .1)' : 'var(--surface)',
                            color: isSettingsOpen ? 'var(--cyan)' : 'var(--text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all .2s'
                        }}
                        className="social-btn"
                        aria-label="Settings"
                    >
                        <Settings size={14} />
                    </button>
                    <a href="https://www.linkedin.com/in/obydul/" target="_blank" rel="noopener noreferrer" style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid var(--border2)',
                        background: 'var(--surface)',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all .2s',
                        textDecoration: 'none'
                    }} className="social-btn" aria-label="LinkedIn">
                        <Linkedin size={14} />
                    </a>
                    <a href="https://x.com/0xObydul" target="_blank" rel="noopener noreferrer" style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid var(--border2)',
                        background: 'var(--surface)',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all .2s',
                        textDecoration: 'none'
                    }} className="social-btn" aria-label="Twitter">
                        <Twitter size={14} />
                    </a>
                    <a href="https://github.com/mdobydullah" target="_blank" rel="noopener noreferrer" style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid var(--border2)',
                        background: 'var(--surface)',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all .2s',
                        textDecoration: 'none'
                    }} className="social-btn" aria-label="GitHub">
                        <Github size={14} />
                    </a>
                </div>
            </div>

            {/* Settings Popup */}
            {isSettingsOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '25px',
                    width: '280px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    animation: 'popupIn 0.3s ease'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '.9rem', fontWeight: 700, color: 'var(--text-hi)' }}>Preferences</h3>
                        <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '.8rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                            <div style={{ color: animationsEnabled ? 'var(--cyan)' : 'var(--text-dim)' }}>
                                {animationsEnabled ? <Play size={16} /> : <Square size={16} />}
                            </div>
                            <span style={{ fontSize: '.82rem', color: 'var(--text)' }}>Animations</span>
                        </div>
                        <button
                            onClick={() => setAnimationsEnabled(!animationsEnabled)}
                            style={{
                                width: '36px',
                                height: '20px',
                                borderRadius: '10px',
                                background: animationsEnabled ? 'var(--cyan)' : '#333',
                                border: 'none',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.3s'
                            }}
                        >
                            <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: animationsEnabled ? '19px' : '3px',
                                transition: 'left 0.3s'
                            }} />
                        </button>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.6rem' }}>
                            <Settings size={14} style={{ color: 'var(--text-dim)' }} />
                            <span style={{ fontSize: '.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Speed</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '.4rem',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '.25rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border)'
                        }}>
                            {[
                                { label: 'Slow', value: 2 },
                                { label: 'Norm', value: 1 },
                                { label: 'Fast', value: 0.25 }
                            ].map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => setAnimationSpeed(s.value)}
                                    style={{
                                        padding: '.4rem 0',
                                        fontSize: '.7rem',
                                        borderRadius: '7px',
                                        border: 'none',
                                        background: animationSpeed === s.value ? 'var(--cyan)' : 'transparent',
                                        color: animationSpeed === s.value ? '#000' : 'var(--text-dim)',
                                        cursor: 'pointer',
                                        transition: 'all .2s',
                                        fontWeight: animationSpeed === s.value ? 700 : 500
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: '.68rem', color: 'var(--text-dim)', marginTop: '1rem', lineHeight: '1.4' }}>
                        Toggling animations affects visual explanations and guide transitions.
                    </p>
                </div>
            )}

            <style jsx>{`
                .footer-link:hover {
                    color: var(--cyan);
                }
                .social-btn:hover {
                    border-color: var(--cyan);
                    color: var(--cyan);
                    background: rgba(0, 229, 255, .06);
                }
                
                @keyframes popupIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 640px) {
                    div:has(.social-btn) {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </footer>
    );
}

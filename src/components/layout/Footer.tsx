"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Heart } from "lucide-react";
import { config } from "@/lib/config";

export default function Footer() {
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
                <div style={{ display: 'flex', gap: '.8rem' }}>
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
            <style jsx>{`
                .footer-link:hover {
                    color: var(--cyan);
                }
                .social-btn:hover {
                    border-color: var(--cyan);
                    color: var(--cyan);
                    background: rgba(0, 229, 255, .06);
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

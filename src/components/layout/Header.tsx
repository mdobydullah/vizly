"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { config } from "@/lib/config";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on scroll or resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMenuOpen(false);
            }
        };

        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMenuOpen]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(8, 11, 16, .85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            padding: '0 clamp(1rem, 4vw, 2rem)',
            height: 'clamp(56px, 10vw, 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                maxWidth: '1100px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.6rem',
                    cursor: 'pointer',
                    textDecoration: 'none'
                }} onClick={() => setIsMenuOpen(false)}>
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
                        Viz<span style={{ color: 'var(--cyan)' }}>ly</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(.8rem, 2vw, 1.6rem)'
                }}>
                    <div className="nav-desktop-links" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(.8rem, 2vw, 1.6rem)'
                    }}>
                        <Link href="/guides" style={{
                            color: 'var(--text-dim)',
                            fontSize: '.8rem',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-mono)',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="nav-link">
                            Guides
                        </Link>
                        <Link href="/jobs" style={{
                            color: 'var(--text-dim)',
                            fontSize: '.8rem',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-mono)',
                            transition: 'color .2s',
                            cursor: 'pointer'
                        }} className="nav-link">
                            Jobs
                        </Link>
                        <button
                            onClick={() => window.open(config.urls.githubRepo, '_blank')}
                            style={{
                                background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '.75rem',
                                fontFamily: 'var(--font-mono)',
                                border: 'none',
                                padding: '.4rem 1rem',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'opacity .2s, transform .15s',
                                whiteSpace: 'nowrap'
                            }}
                            className="header-cta"
                        >
                            GitHub →
                        </button>
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        className="hamburger-btn"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-hi)',
                            cursor: 'pointer',
                            display: 'none',
                            padding: '4px',
                            marginLeft: '4px'
                        }}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-links">
                    <Link href="/guides" onClick={() => setIsMenuOpen(false)} className="mobile-link" style={{ textDecoration: 'none', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                        <span className="mobile-link-text" style={{ textDecoration: 'none', border: 'none' }}>Guides</span>
                    </Link>

                    <hr className="mobile-divider" />

                    <Link href="/jobs" onClick={() => setIsMenuOpen(false)} className="mobile-link" style={{ textDecoration: 'none', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                        <span className="mobile-link-text" style={{ textDecoration: 'none', border: 'none' }}>Jobs</span>
                    </Link>

                    <button
                        onClick={() => {
                            window.open(config.urls.githubRepo, '_blank');
                            setIsMenuOpen(false);
                        }}
                        className="mobile-github-link"
                    >
                        GitHub Repository &rarr;
                    </button>
                </div>
            </div>
        </header>
    );
}

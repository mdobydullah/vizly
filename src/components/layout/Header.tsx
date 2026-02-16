"use client";

import Link from "next/link";

export default function Header() {
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
                        Program<span style={{ color: 'var(--cyan)' }}>ly</span>
                    </span>
                </Link>
                <nav className="nav-desktop" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(.8rem, 2vw, 1.6rem)'
                }}>
                    <Link href="/visuals" style={{
                        color: 'var(--text-dim)',
                        fontSize: '.8rem',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                        transition: 'color .2s',
                        cursor: 'pointer'
                    }} className="nav-link">
                        Visuals
                    </Link>
                    <button
                        onClick={() => window.open('https://github.com/mdobydullah/programly', '_blank')}
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
                </nav>
            </div>
            <style jsx>{`
                .nav-link:hover {
                    color: var(--cyan);
                }
                .header-cta:hover {
                    opacity: .85;
                    transform: translateY(-1px);
                }
                
                @media (max-width: 768px) {
                    .nav-desktop .nav-link {
                        display: none;
                    }
                    .header-cta {
                        font-size: .7rem;
                        padding: .35rem .8rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .header-cta {
                        font-size: .65rem;
                        padding: .3rem .6rem;
                    }
                }
            `}</style>
        </header>
    );
}

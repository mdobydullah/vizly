"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { config } from "@/lib/config";
import { Menu, X, Sun, Moon, Lightbulb, ChevronDown, CodeXml } from "lucide-react";
import { GithubIcon } from "@/components/icons/social";
import { useSettings } from "@/context/SettingsContext";

interface NavItem {
    href: string;
    label: string;
    children?: { href: string; label: string }[];
}

const NAV_LINKS: NavItem[] = [
    { href: '/guides', label: 'Guides' },
    { href: '/articles', label: 'Articles' },
    { href: '/series', label: 'Series' },
    { href: '/learning-paths', label: 'Paths' },
    {
        href: '/theory/backend-engineer',
        label: 'Theory',
        children: [
            { href: '/theory/backend-engineer', label: 'Backend Engineer' },
        ],
    },
    { href: '/shorts', label: 'Shorts' },
    { href: '/jobs', label: 'Jobs' },
];

const NEXT_THEME = { white: 'light', light: 'dark', dark: 'white' } as const;
const THEME_LABEL = { dark: 'Dark Mode', light: 'Light Mode', white: 'White Mode' } as const;

export default function Header() {
    const { theme, toggleTheme } = useSettings();
    const nextTheme = NEXT_THEME[theme];
    const NextThemeIcon = { dark: Moon, light: Sun, white: Lightbulb }[nextTheme];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dropdownClosed, setDropdownClosed] = useState(false);
    const pathname = usePathname();

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
            background: 'var(--header-bg)',
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
                    <CodeXml size={24} strokeWidth={2.4} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
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
                        {NAV_LINKS.map(({ href, label, children }) => {
                            const base = children ? href.split('/').slice(0, 2).join('/') : href;
                            const isActive = pathname === base || pathname.startsWith(base + '/');
                            const linkStyle = {
                                color: isActive ? 'var(--text-hi)' : 'var(--text-dim)',
                                fontSize: '.8rem',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-mono)',
                                transition: 'color .2s',
                                cursor: 'pointer',
                                borderBottom: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                                paddingBottom: '2px',
                            } as const;
                            if (!children) {
                                return (
                                    <Link key={href} href={href} style={linkStyle} className="nav-link">
                                        {label}
                                    </Link>
                                );
                            }
                            return (
                                <div key={href} className="nav-dropdown" onMouseLeave={() => setDropdownClosed(false)}>
                                    <Link href={href} style={{ ...linkStyle, display: 'inline-flex', alignItems: 'center', gap: '3px' }} className="nav-link">
                                        {label}
                                        <ChevronDown size={12} className="nav-dropdown-chevron" />
                                    </Link>
                                    <div className={`nav-dropdown-menu${dropdownClosed ? ' is-closed' : ''}`}>
                                        <div className="nav-dropdown-menu-inner">
                                            {children.map(child => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={`nav-dropdown-item${pathname === child.href ? ' is-active' : ''}`}
                                                    onClick={e => { e.currentTarget.blur(); setDropdownClosed(true); }}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid var(--border2)',
                                background: 'var(--surface)',
                                color: 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all .2s',
                                flexShrink: 0
                            }}
                            className="theme-toggle-btn"
                            aria-label={`Switch to ${nextTheme} mode`}
                            title={`Switch to ${nextTheme} mode`}
                        >
                            <NextThemeIcon size={15} />
                        </button>
                        <button
                            onClick={() => window.open(config.urls.githubRepo, '_blank')}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid var(--border2)',
                                background: 'var(--surface)',
                                color: 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all .2s',
                                flexShrink: 0
                            }}
                            className="header-cta"
                            aria-label="GitHub repository"
                            title="GitHub repository"
                        >
                            <GithubIcon width={15} height={15} />
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
                    {NAV_LINKS.map(({ href, label, children }, i) => {
                        const isActive = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <span key={href}>
                                {children ? (
                                    <span>
                                        <span className="mobile-link-text mobile-group-label">{label}</span>
                                        {children.map(child => (
                                            <Link key={child.href} href={child.href} onClick={() => setIsMenuOpen(false)} className="mobile-link" style={{ textDecoration: 'none', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                                                <span className="mobile-link-text mobile-sublink" style={{ textDecoration: 'none', border: 'none', color: pathname === child.href ? 'var(--cyan)' : undefined }}>
                                                    {child.label}
                                                </span>
                                            </Link>
                                        ))}
                                    </span>
                                ) : (
                                    <Link href={href} onClick={() => setIsMenuOpen(false)} className="mobile-link" style={{ textDecoration: 'none', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                                        <span className="mobile-link-text" style={{ textDecoration: 'none', border: 'none', color: isActive ? 'var(--cyan)' : undefined }}>
                                            {label}
                                        </span>
                                    </Link>
                                )}
                                {i < NAV_LINKS.length - 1 && <hr className="mobile-divider" />}
                            </span>
                        );
                    })}

                    <button
                        onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                        className="mobile-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%' }}
                    >
                        <span className="mobile-link-text" style={{ textDecoration: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <NextThemeIcon size={18} />
                            {THEME_LABEL[nextTheme]}
                        </span>
                    </button>

                    <hr className="mobile-divider" />

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

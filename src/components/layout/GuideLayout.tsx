"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';
import { Contributor } from '@/types/guides';
import { Github, Twitter, Linkedin, Globe, Mail, ExternalLink, ArrowUp } from 'lucide-react';
import { config } from '@/lib/config';

interface GuideLayoutProps {
    category: string;
    title: string;
    description: string;
    primaryColor?: string;
    onReplay?: () => void;
    children: React.ReactNode;
    contributors?: Contributor[];
    githubPath?: string;
}

export function GuideLayout({
    category,
    title,
    description,
    primaryColor = 'var(--cyan)',
    children,
    contributors,
    githubPath,
}: Readonly<GuideLayoutProps>) {

    // Scroll to top and Initialize Visual environment
    useEffect(() => {
        window.scrollTo(0, 0);

        // Initialize Mermaid (common for guides)
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'var(--font-mono)',
            themeVariables: {
                primaryColor: primaryColor, // Use dynamic primary color
                primaryTextColor: '#fff',
                primaryBorderColor: primaryColor,
                lineColor: '#5a6a7e',
                secondaryColor: '#b985f4',
                tertiaryColor: '#3effa3'
            }
        });
        mermaid.contentLoaded();
    }, [primaryColor]);

    const [isExpanded, setIsExpanded] = React.useState(false);
    const [shouldShowExpand, setShouldShowExpand] = React.useState(false);
    const [showScrollTop, setShowScrollTop] = React.useState(false);
    const [mounted, setMounted] = useState(false);
    const contributorsRef = React.useRef<HTMLDivElement>(null);
    const descriptionRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Track scroll position to show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Check if description is long enough to expand
    useEffect(() => {
        if (descriptionRef.current) {
            const hasOverflow = descriptionRef.current.scrollHeight > 65; // slightly more than 62px threshold
            setShouldShowExpand(hasOverflow);
        }
    }, [description]);

    // Scroll to bottom contributors section
    const scrollToContributors = () => {
        contributorsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Prepare contributor names string
    const getContributorString = () => {
        if (!contributors || contributors.length === 0) return '';
        const names = contributors.slice(0, 5).map(c => c.name).join(', ');
        const str = `by ${names}`;
        return str.length > 50 ? str.substring(0, 47) + '...' : str;
    };

    return (
        <div className="viz-container">
            {/* Section Title */}
            <div className="section-title-container" style={{
                padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem) 0.5rem',
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '.7rem',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                    color: primaryColor,
                    marginBottom: '0.2rem',
                    opacity: .8
                }}>
                    {category}
                </div>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--text-hi)',
                    letterSpacing: '-.02em',
                    marginBottom: '0.2rem'
                }}>{title}</h2>

                {contributors && contributors.length > 0 && (
                    <button
                        onClick={scrollToContributors}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease',
                            marginBottom: '1rem'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
                        onFocus={(e) => (e.currentTarget.style.opacity = '1')}
                        onBlur={(e) => (e.currentTarget.style.opacity = '0.7')}
                    >
                        {getContributorString()}
                    </button>
                )}

                {description && (
                    <div style={{
                        maxWidth: '860px',
                        margin: '0 auto 1.5rem',
                        padding: '1.25rem 1.5rem',
                        background: `${primaryColor}0D`,
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div
                            ref={descriptionRef}
                            style={{
                                fontSize: '.88rem',
                                color: 'var(--text)',
                                lineHeight: '1.7',
                                textAlign: 'center',
                                maxHeight: shouldShowExpand && !isExpanded ? '62px' : '1000px',
                                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {description}
                            {shouldShowExpand && !isExpanded && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '24px',
                                    background: `linear-gradient(transparent, ${primaryColor}0D)`,
                                    pointerEvents: 'none'
                                }} />
                            )}
                        </div>

                        {shouldShowExpand && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{
                                    display: 'block',
                                    margin: '0.5rem auto 0',
                                    background: 'none',
                                    border: 'none',
                                    color: primaryColor,
                                    fontSize: '0.7rem',
                                    fontFamily: 'var(--font-mono)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    padding: '0.2rem 0.5rem',
                                    opacity: 0.8,
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.8')}
                                onFocus={(e) => (e.currentTarget.style.opacity = '1')}
                                onBlur={(e) => (e.currentTarget.style.opacity = '0.8')}
                            >
                                {isExpanded ? '↑ Show less' : '↓ Read full description'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {children}

            <div
                ref={contributorsRef}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '4rem',
                    paddingBottom: '4rem',
                    width: '100%',
                    maxWidth: '1100px',
                    margin: '4rem auto 0',
                }}>

                {/* <div style={{
                    width: '100%',
                    borderTop: '1px solid var(--border)',
                    marginBottom: contributors && contributors.length > 0 ? '3rem' : '0',
                }} /> */}

                {contributors && contributors.length > 0 && (
                    <div style={{
                        width: '100%',
                    }}>
                        <h3 style={{
                            fontSize: '.65rem',
                            textTransform: 'uppercase',
                            color: 'var(--text-dim)',
                            letterSpacing: '.15em',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)'
                        }}>Guide Contributors</h3>

                        <div className="contributors-grid" style={{
                            marginTop: '2rem',
                            width: '100%',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '2rem'
                        }}>
                            {contributors.map((contributor) => (
                                <div key={contributor.username}
                                    className="viz-box viz-reveal visible card-cyan"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        padding: '2.2rem 0.75rem',
                                        height: '100%',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    }}>
                                    <span className="viz-label" style={{
                                        maxWidth: '90%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>{contributor.name}</span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-dim)',
                                        marginBottom: '1.5rem',
                                        fontFamily: 'var(--font-mono)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.02em',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: '3.6em', // maintain height for 3 lines
                                        width: '100%',
                                        lineHeight: '1.4'
                                    }}>
                                        {contributor.bio}
                                    </span>

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.8rem',
                                        marginTop: 'auto',
                                        zIndex: 20
                                    }}>
                                        {contributor.handles.slice(0, 5).map((handle) => (
                                            <a
                                                key={handle.url}
                                                href={handle.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-dim)',
                                                    textDecoration: 'none',
                                                    padding: '0.5rem',
                                                    borderRadius: '10px',
                                                    background: 'var(--bg)',
                                                    border: '1px solid var(--border2)',
                                                    transition: 'all 0.2s ease',
                                                    width: '38px',
                                                    height: '38px'
                                                }}
                                                className="contributor-handle"
                                                title={handle.url.split('//').pop()?.split('/')[0] || 'Link'}
                                            >
                                                {(() => {
                                                    const url = handle.url.toLowerCase();
                                                    const iconSize = 18;
                                                    if (url.includes('github.com')) return <Github size={iconSize} />;
                                                    if (url.includes('twitter.com') || url.includes('x.com')) return <Twitter size={iconSize} />;
                                                    if (url.includes('linkedin.com')) return <Linkedin size={iconSize} />;
                                                    if (url.includes('mailto:')) return <Mail size={iconSize} />;
                                                    if (url.startsWith('http')) return <Globe size={iconSize} />;
                                                    return <ExternalLink size={iconSize} />;
                                                })()}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Contribute Link */}
            <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                paddingBottom: '2rem'
            }}>
                <a
                    href={`${config.urls.githubRepo}/${githubPath ? 'blob/main/' + githubPath : 'tree/main/src/data/guides'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: '.85rem',
                        color: 'var(--text-dim)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        transition: 'color .2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                    <span>Found an issue? Edit this page on GitHub</span>
                    <span style={{ fontSize: '1rem' }}>↗</span>
                </a>
            </div>

            <style jsx>{`
                .contributors-grid > div {
                    flex: 0 1 240px;
                    min-width: 200px;
                }

                @media (min-width: 1025px) {
                    .contributors-grid > div {
                        flex: 0 1 calc(25% - 1.6rem);
                    }
                }

                @media (max-width: 1024px) {
                    .contributors-grid > div {
                        flex: 0 1 calc(50% - 1rem);
                    }
                }

                @media (max-width: 640px) {
                    .contributors-grid > div {
                        flex: 1 1 100%;
                    }
                }

                .contributor-handle:hover {
                    background: ${primaryColor}20 !important;
                    border-color: ${primaryColor}80 !important;
                    transform: translateY(-3px);
                    color: ${primaryColor} !important;
                    box-shadow: 0 4px 12px ${primaryColor}30;
                }

                .scroll-to-top-btn {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    color: ${primaryColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 100;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .scroll-to-top-btn.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
            `}</style>

            {mounted && createPortal(
                <button
                    className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    title="Scroll to top"
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 9999, // Ensure it's above everything including footer
                        opacity: showScrollTop ? 1 : 0,
                        visibility: showScrollTop ? 'visible' : 'hidden',
                        transform: showScrollTop ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${primaryColor}20`;
                        e.currentTarget.style.borderColor = primaryColor;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface2)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                    }}
                >
                    <ArrowUp size={20} />
                </button>,
                document.body
            )
            }
        </div >
    );
}

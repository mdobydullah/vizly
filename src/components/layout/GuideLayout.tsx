"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';
import { Contributor } from '@/types/guides';
import { Github, Twitter, Linkedin, Globe, Mail, ExternalLink, ArrowUp } from 'lucide-react';

interface GuideLayoutProps {
    category: string;
    title: string;
    description: string;
    primaryColor?: string;
    onReplay?: () => void;
    children: React.ReactNode;
    contributors?: Contributor[];
}

export function GuideLayout({
    category,
    title,
    description,
    primaryColor = 'var(--cyan)',
    children,
    contributors
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
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '2rem',
                            width: '100%',
                            padding: '1rem 0'
                        }}>
                            {contributors.map((contributor) => (
                                <div key={contributor.username}
                                    className="contributor-card"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        background: 'linear-gradient(145deg, var(--surface2) 0%, rgba(21, 28, 39, 0.6) 100%)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '16px',
                                        padding: '2.5rem 2rem',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: '100%',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }}>
                                    <span style={{
                                        fontWeight: 700,
                                        color: 'var(--text-hi)',
                                        fontSize: '1rem',
                                        fontFamily: 'var(--font-display)',
                                        marginBottom: '0.3rem',
                                        lineHeight: '1.3',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {contributor.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-dim)',
                                        marginBottom: '1.5rem',
                                        fontFamily: 'var(--font-mono)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: '2.4em' // maintain height for alignment
                                    }}>
                                        {contributor.bio}
                                    </span>

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.8rem',
                                        marginTop: 'auto'
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

            <style jsx>{`
                .contributor-handle:hover {
                    background: ${primaryColor}20 !important;
                    border-color: ${primaryColor}80 !important;
                    transform: translateY(-3px);
                    color: ${primaryColor} !important;
                    box-shadow: 0 4px 12px ${primaryColor}30;
                }
                
                .contributor-card:hover {
                    border-color: ${primaryColor}60 !important;
                    transform: translateY(-8px) !important;
                    box-shadow: 0 20px 40px -10px ${primaryColor}20 !important;
                    background: linear-gradient(145deg, var(--surface2) 0%, ${primaryColor}08 100%) !important;
                }
                
                .contributor-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, ${primaryColor}, transparent);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .contributor-card:hover::before {
                    opacity: 1;
                }

                @media (max-width: 1024px) {
                    .contributors-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 1rem !important;
                    }
                }

                @media (max-width: 640px) {
                    .contributors-grid {
                        grid-template-columns: 1fr !important;
                    }
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

import React, { useEffect } from 'react';
import mermaid from 'mermaid';
import { Contributor } from '@/types/visuals';
import { Github, Twitter, Linkedin, Globe, Mail, ExternalLink } from 'lucide-react';

interface VisualLayoutProps {
    category: string;
    title: string;
    description: string;
    primaryColor?: string;
    onReplay: () => void;
    children: React.ReactNode;
    contributors?: Contributor[];
}

export function VisualLayout({
    category,
    title,
    description,
    primaryColor = 'var(--cyan)',
    children,
    contributors
}: Readonly<VisualLayoutProps>) {

    // Scroll to top and Initialize Visual environment
    useEffect(() => {
        window.scrollTo(0, 0);

        // Initialize Mermaid (common for visuals)
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

    // Scroll to top and Initialize Visual environment
    useEffect(() => {
        window.scrollTo(0, 0);

        // Initialize Mermaid (common for visuals)
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
    const contributorsRef = React.useRef<HTMLDivElement>(null);
    const descriptionRef = React.useRef<HTMLDivElement>(null);

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
                    maxWidth: '860px',
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
                        }}>Visual Contributors</h3>

                        <div className="contributors-grid" style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: 'clamp(1.5rem, 4vw, 3rem)',
                            maxHeight: contributors.length > 3 ? '450px' : 'auto',
                            overflowY: contributors.length > 3 ? 'auto' : 'visible',
                            padding: '1.5rem 1rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${primaryColor}40 transparent`,
                            width: '100%'
                        }}>
                            {contributors.map((contributor) => (
                                <div key={contributor.username} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    minWidth: '200px'
                                }}>
                                    <span style={{
                                        fontWeight: 700,
                                        color: 'var(--text-hi)',
                                        fontSize: '0.95rem',
                                        fontFamily: 'var(--font-display)',
                                        marginBottom: '0.2rem'
                                    }}>
                                        {contributor.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-dim)',
                                        marginBottom: '0.8rem',
                                        fontFamily: 'var(--font-mono)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {contributor.role}
                                    </span>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {contributor.handles.map((handle) => (
                                            <a
                                                key={handle.url}
                                                href={handle.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: primaryColor,
                                                    textDecoration: 'none',
                                                    padding: '0.5rem',
                                                    borderRadius: '8px',
                                                    background: `${primaryColor}10`,
                                                    border: `1px solid ${primaryColor}30`,
                                                    transition: 'all 0.2s ease',
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                                className="contributor-handle"
                                                title={handle.url.split('//').pop()?.split('/')[0] || 'Link'}
                                            >
                                                {(() => {
                                                    const url = handle.url.toLowerCase();
                                                    const iconSize = 16;
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
                    border-color: ${primaryColor}60 !important;
                    transform: translateY(-1px);
                }
                
                @media (max-width: 640px) {
                    .contributors-grid {
                        gap: 2rem !important;
                        padding: 1rem 0 !important;
                    }
                }

                @media (max-width: 480px) {
                    .contributors-grid > div {
                        min-width: 100% !important;
                    }
                }
                
                div::-webkit-scrollbar {
                    width: 4px;
                }
                
                div::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                div::-webkit-scrollbar-thumb {
                    background: ${primaryColor}40;
                    border-radius: 10px;
                }
                
                div::-webkit-scrollbar-thumb:hover {
                    background: ${primaryColor}60;
                }
            `}</style>
        </div>
    );
}

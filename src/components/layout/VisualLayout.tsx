import React, { useEffect } from 'react';
import mermaid from 'mermaid';

interface VisualLayoutProps {
    category: string;
    title: string;
    description: string;
    introText?: string;
    primaryColor?: string;
    onReplay: () => void;
    children: React.ReactNode;
}

export function VisualLayout({
    category,
    title,
    description,
    introText,
    primaryColor = 'var(--cyan)',
    onReplay,
    children
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

    // Handle replay with scroll reset
    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        onReplay();
    };

    return (
        <div className="visual-container">
            {/* Section Title */}
            <div className="section-title-container" style={{
                padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem)',
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
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
                    letterSpacing: '-.02em'
                }}>{title}</h2>
                <p className="section-hint" style={{
                    color: 'var(--text-dim)',
                    fontSize: '.8rem',
                    maxWidth: '500px',
                    textAlign: 'center'
                }}>{description}</p>
            </div>

            {introText && (
                <div style={{
                    maxWidth: '860px',
                    margin: '0 auto 2.5rem',
                    padding: '1.5rem',
                    background: `${primaryColor}0D`, // approx 0.03 opacity in hex
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '.88rem',
                    color: 'var(--text)',
                    lineHeight: '1.7',
                    textAlign: 'center'
                }}>
                    {introText}
                </div>
            )}

            {children}

            <button className="replay-btn" onClick={handleReplay} style={{
                borderColor: primaryColor,
                color: primaryColor
            }}>
                ↺ Replay animation
            </button>
        </div>
    );
}

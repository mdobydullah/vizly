"use client";

import Link from "next/link";
import { Github as GitHubIcon, Heart, Zap } from "lucide-react";

export default function AboutPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* ── HERO SECTION ── */}
            <section style={{
                position: 'relative',
                padding: 'clamp(4rem, 10vw, 6rem) clamp(1rem, 4vw, 2rem) 3rem',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <div style={{
                    content: '',
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(185, 133, 244, .08) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    display: 'inline-block',
                    marginBottom: '1.2rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.72rem',
                    letterSpacing: '.12em',
                    color: 'var(--purple)',
                    border: '1px solid rgba(185, 133, 244, .3)',
                    background: 'rgba(185, 133, 244, .05)',
                    padding: '.3em 1em',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    animation: 'fadeUp .6s ease .1s both'
                }}>
                    ✦ The Story Behind Vizly
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-hero)',
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: 'var(--text-hi)',
                    letterSpacing: '-.04em',
                    marginBottom: '1.5rem',
                    animation: 'fadeUp .6s ease .2s both'
                }}>
                    Visualizing the <br />
                    <span style={{
                        background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Abstract</span>
                </h1>

                <p style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    color: 'var(--text)',
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    fontWeight: 500,
                    animation: 'fadeUp .6s ease .3s both'
                }}>
                    Vizly was created with a simple philosophy: if you can see it, you can understand it—and more importantly, you can retain it.
                </p>
            </section>

            {/* ── CONTENT SECTION ── */}
            <section style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '0 clamp(1rem, 4vw, 2rem) 6rem',
                animation: 'fadeUp .6s ease .4s both'
            }}>
                <div style={{
                    display: 'grid',
                    gap: '3rem',
                    background: 'rgba(15, 20, 28, 0.5)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: 'clamp(2rem, 6vw, 4rem)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.8rem',
                            color: 'var(--text-hi)',
                            fontWeight: 800
                        }}>The Problem</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.8 }}>
                            Software engineering is packed with abstract concepts that are often difficult to keep in your head.
                            Whether it's the internal flow of a JWT handshake, the complexity of a B-Tree, or the intricate nodes
                            of a distributed system—we often find ourselves rereading the same documentation over and over just
                            to recall the details.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.8rem',
                            color: 'var(--text-hi)',
                            fontWeight: 800
                        }}>A Personal Notebook</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.8 }}>
                            Initially, **Obydul** created Vizly as a private "visual notebook" for himself.
                            Like many engineers, he found that personal notes are essential, but text-heavy summaries
                            often fail to capture the "flow" of technical logic. He needed a way to distill complex
                            topics into interactive, glanceable animations that could trigger memory and provide
                            instant clarity at a single glance.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.8rem',
                            color: 'var(--text-hi)',
                            fontWeight: 800
                        }}>The Mission</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.8 }}>
                            Today, Vizly has evolved into an open-source project dedicated to helping modern engineers
                            master technical concepts through high-fidelity visualization. It's built for those who learn
                            better by seeing things in motion. Whether you're preparing for an interview or just need a
                            quick refresher on a deep-tech topic, Vizly is here to make knowledge stick.
                        </p>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .btn-primary:hover {
                    box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);
                    transform: translateY(-2px);
                }
                .btn-ghost:hover {
                    border-color: var(--cyan);
                    color: var(--cyan) !important;
                    transform: translateY(-2px);
                }
                b, strong {
                    color: var(--cyan);
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
}

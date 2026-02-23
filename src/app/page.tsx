"use client";

import { GuideCard } from "@/components/home/GuideCard";
import guidesData from "@/data/guides";
import { useRouter } from "next/navigation";

const data = guidesData;

export default function Home() {
    const router = useRouter();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* ── HERO SECTION ── */}
            <section style={{
                position: 'relative',
                zIndex: 1,
                padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem) clamp(2.5rem, 6vw, 3.5rem)',
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
                    background: 'radial-gradient(ellipse, rgba(0, 229, 255, .07) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    display: 'inline-block',
                    marginBottom: '1.2rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.72rem',
                    letterSpacing: '.12em',
                    color: 'var(--cyan)',
                    border: '1px solid rgba(0, 229, 255, .3)',
                    background: 'rgba(0, 229, 255, .05)',
                    padding: '.3em 1em',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    animation: 'fadeUp .6s ease .1s both'
                }}>
                    ✦ Visualize → Grasp → Retain
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-hero)',
                    fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: 'var(--text-hi)',
                    letterSpacing: '-.04em',
                    marginBottom: '1rem',
                    animation: 'fadeUp .6s ease .2s both'
                }}>
                    Learn Through <em style={{
                        fontStyle: 'normal',
                        background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Visuals</em>
                </h1>

                <p style={{
                    maxWidth: '520px',
                    margin: '0 auto 2rem',
                    color: 'var(--text-dim)',
                    fontSize: '.9rem',
                    lineHeight: 1.7,
                    animation: 'fadeUp .6s ease .3s both'
                }}>
                    Visual guides for complex technical topics — DSA, system design, security, cloud, AI, and beyond. Learn through interactive animations and flowcharts.
                </p>

                <div style={{
                    display: 'flex',
                    gap: '.8rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    animation: 'fadeUp .6s ease .4s both'
                }}>
                    <button onClick={() => {
                        router.push('/guides');
                    }} style={{
                        background: 'var(--cyan)',
                        color: '#000',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '.8rem',
                        border: 'none',
                        padding: '.6rem 1.4rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all .2s'
                    }} className="btn-primary">
                        All Guides →
                    </button>
                    <button
                        onClick={() => window.open('https://github.com/mdobydullah/vizly', '_blank')}
                        style={{
                            display: 'none',
                            background: 'transparent',
                            color: 'var(--text)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '.8rem',
                            border: '1px solid var(--border2)',
                            padding: '.6rem 1.4rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all .2s'
                        }} className="btn-ghost">
                        GitHub
                    </button>
                </div>
            </section>

            {/* Stats Row */}
            <div style={{
                display: 'none',
                // display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(2rem, 5vw, 3rem)',
                padding: 'clamp(1.2rem, 3vw, 1.6rem) clamp(1rem, 4vw, 2rem) 0',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1,
                borderTop: '1px solid var(--border)',
                maxWidth: '700px',
                margin: '0 auto',
                animation: 'fadeUp .6s ease .5s both'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-hi)',
                        display: 'block'
                    }}>24+</span>
                    <span style={{
                        fontSize: '.72rem',
                        color: 'var(--text-dim)',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase'
                    }}>Topics</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-hi)',
                        display: 'block'
                    }}>60k</span>
                    <span style={{
                        fontSize: '.72rem',
                        color: 'var(--text-dim)',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase'
                    }}>Readers</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-hi)',
                        display: 'block'
                    }}>100%</span>
                    <span style={{
                        fontSize: '.72rem',
                        color: 'var(--text-dim)',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase'
                    }}>Free</span>
                </div>
            </div>

            {/* Section Title */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Latest Guides</h2>
                <p className="viz-section-hint">Click any card to explore an interactive guide.</p>
            </div>

            {/* Cards Grid */}
            <div className="viz-grid">
                {[...data.guides]
                    .sort((a, b) => {
                        // Sort by link availability first (available before upcoming)
                        const aHasLink = a.link !== '#' && a.link !== null;
                        const bHasLink = b.link !== '#' && b.link !== null;
                        if (aHasLink !== bHasLink) return bHasLink ? 1 : -1;
                        // Then by date
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .slice(0, 9)
                    .map((guide, index) => (
                        <GuideCard key={guide.id} guide={guide} index={index} />
                    ))}
            </div>

        </div>
    );
}

"use client";

const sections = [
    {
        title: "The Problem",
        body: <>Software engineering is packed with abstract concepts that are hard to keep in your head. The internal flow of a JWT handshake, the shape of a B-Tree, the moving parts of a distributed system. We end up rereading the same documentation again and again just to recall the details.</>,
    },
    {
        title: "A Personal Notebook",
        body: <>Initially, <strong style={{ color: 'var(--cyan)', fontWeight: 700 }}>Obydul</strong> created Vizly as a private visual notebook for himself. Like many engineers, he found that personal notes are essential, but text-heavy summaries often fail to capture the flow of technical logic. He needed a way to distill complex topics into interactive, glanceable animations that trigger memory and give instant clarity.</>,
    },
    {
        title: "The Mission",
        body: <>Today, Vizly has evolved into an open-source project dedicated to helping modern engineers master technical concepts through high-fidelity visualization. It is built for those who learn better by seeing things in motion. Whether you are preparing for an interview or just need a quick refresher on a deep-tech topic, Vizly is here to make knowledge stick.</>,
    },
];

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
                    Vizly was built on a simple philosophy: if you can see it, you can understand it. And if you can understand it, you can retain it.
                </p>
            </section>

            {/* ── CONTENT SECTION ── */}
            <section style={{
                maxWidth: '760px',
                width: '100%',
                margin: '0 auto',
                padding: '0 clamp(1rem, 4vw, 2rem) 6rem',
                display: 'grid',
                gap: '1.5rem',
                animation: 'fadeUp .6s ease .4s both'
            }}>
                {sections.map(({ title, body }) => (
                    <div key={title} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: 'clamp(1.5rem, 4vw, 2.2rem)',
                        display: 'grid',
                        gap: '.9rem'
                    }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.35rem',
                            color: 'var(--text-hi)',
                            fontWeight: 800
                        }}>{title}</h2>
                        <p style={{ color: 'var(--text)', fontSize: '.95rem', lineHeight: 1.8 }}>
                            {body}
                        </p>
                    </div>
                ))}
            </section>

        </div>
    );
}

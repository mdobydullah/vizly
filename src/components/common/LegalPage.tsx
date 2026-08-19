import React from "react";

export type LegalSection = {
    title: string;
    body: React.ReactNode;
};

type Props = {
    eyebrow: string;
    title: string;
    intro: string;
    updated: string;
    sections: LegalSection[];
};

export default function LegalPage({ eyebrow, title, intro, updated, sections }: Props) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <section style={{
                position: 'relative',
                padding: 'clamp(3.5rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem) 2.5rem',
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
                    textTransform: 'uppercase'
                }}>
                    {eyebrow}
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-hero)',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: 'var(--text-hi)',
                    letterSpacing: '-.04em',
                    marginBottom: '1.25rem'
                }}>
                    {title}
                </h1>

                <p style={{
                    maxWidth: '620px',
                    margin: '0 auto',
                    color: 'var(--text)',
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    fontWeight: 500
                }}>
                    {intro}
                </p>

                <p style={{
                    marginTop: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.78rem',
                    color: 'var(--text)',
                    opacity: .7
                }}>
                    Last updated {updated}
                </p>
            </section>

            <section style={{
                maxWidth: '760px',
                width: '100%',
                margin: '0 auto',
                padding: '0 clamp(1rem, 4vw, 2rem) 6rem',
                display: 'grid',
                gap: '1.25rem'
            }}>
                {sections.map(({ title: heading, body }) => (
                    <div key={heading} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: 'clamp(1.4rem, 4vw, 2rem)',
                        display: 'grid',
                        gap: '.8rem'
                    }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.2rem',
                            color: 'var(--text-hi)',
                            fontWeight: 800
                        }}>{heading}</h2>
                        <div style={{ color: 'var(--text)', fontSize: '.95rem', lineHeight: 1.8 }}>
                            {body}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

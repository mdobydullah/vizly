import type { Metadata } from "next";
import Link from "next/link";
import { LightboxImage } from "@/components/common/LightboxImage";

export const metadata: Metadata = {
    title: "Goodbye, Shouts.dev",
    description: "After 9 years, Shouts.dev is closing. Thank you to 60,000+ monthly readers.",
};

export default function GoodbyeShoutsdevPage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: 'clamp(3rem, 8vw, 5rem) clamp(1.5rem, 4vw, 2rem)',
            textAlign: 'center',
        }}>
            <div style={{ maxWidth: '640px', width: '100%' }}>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--text-dim)',
                    letterSpacing: '0.1em',
                    marginBottom: '1.5rem',
                }}>
                    2017 — 2026
                </p>

                <h1 style={{
                    fontFamily: 'var(--font-hero)',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 900,
                    color: 'var(--text-hi)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: '2rem',
                }}>
                    Goodbye, Shouts.dev
                </h1>

                <p style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                    color: 'var(--text)',
                    lineHeight: 1.75,
                    marginBottom: '1.5rem',
                }}>
                    What started as <strong style={{ color: 'var(--text-hi)' }}>mynotepaper.com</strong> in April 2017 grew into{' '}
                    <strong style={{ color: 'var(--text-hi)' }}>Shouts.dev</strong> — a place where 60,000+ monthly readers came to
                    learn, debug, and build together.
                </p>

                <p style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                    color: 'var(--text)',
                    lineHeight: 1.75,
                    marginBottom: '3rem',
                }}>
                    Today, I&apos;m closing this chapter. Every visit, every comment, every
                    share meant the world to me. Thank you for reading.
                </p>

                {/* Old memory */}
                <div style={{
                    margin: '0 auto 3rem',
                    maxWidth: '320px',
                }}>
                    <LightboxImage
                        src="/images/got-50k-clicks-shoutsdev.jpg"
                        alt="Google Search Impact — Shouts.dev reached 50K clicks from Google Search, Jun 24, 2022"
                    />
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--text-dim)',
                        textAlign: 'center',
                        marginTop: '0.6rem',
                        opacity: 0.7,
                    }}>
                        A small milestone from the journey.
                    </p>
                </div>

                <hr style={{
                    border: 'none',
                    height: '1px',
                    background: 'var(--border)',
                    margin: '0 auto 3rem',
                    maxWidth: '400px',
                }} />

                <p style={{
                    fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)',
                    color: 'var(--text-dim)',
                    lineHeight: 1.8,
                    fontStyle: 'italic',
                    marginBottom: '2rem',
                }}>
                    I wish you clean builds, zero bugs, and endless curiosity.<br />
                    Keep shipping.
                </p>

                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--text-dim)',
                    marginBottom: '2rem',
                }}>
                    11th April 2017 — 2nd April 2026
                </p>

                <div style={{ marginBottom: '3rem' }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-dim)',
                        marginBottom: '0.3rem',
                    }}>
                        — <a
                            href="https://obydul.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-dim)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                        >Md Obydullah</a>
                    </p>
                    <a
                        href="mailto:hi@obydul.me"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            color: 'var(--text-dim)',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                        }}
                    >
                        hi@obydul.me
                    </a>
                </div>

                <hr style={{
                    border: 'none',
                    height: '1px',
                    background: 'var(--border)',
                    margin: '0 auto 2.5rem',
                    maxWidth: '400px',
                }} />

                <div style={{ marginBottom: '1rem' }}>
                    <p style={{
                        fontSize: '0.95rem',
                        color: 'var(--text)',
                        marginBottom: '1.2rem',
                        lineHeight: 1.7,
                    }}>
                        The journey continues. I&apos;m now building <strong style={{ color: 'var(--text-hi)' }}>Vizly</strong> — interactive
                        visual guides and in-depth articles on system design, algorithms, AI, and engineering concepts.
                    </p>
                    <Link
                        href="/"
                        style={{
                            display: 'inline-block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#000',
                            background: 'var(--cyan)',
                            padding: '0.6rem 1.6rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        Explore Vizly →
                    </Link>
                </div>
            </div>
        </div>
    );
}

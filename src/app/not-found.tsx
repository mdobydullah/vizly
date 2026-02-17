import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import visualsData from "@/data/visuals";

export default function NotFound() {
    // Get some featured visuals to show
    const featuredVisuals = visualsData.visuals.slice(0, 3);

    return (
        <div className="viz-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '85vh',
            textAlign: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background 404 Text */}
            <div style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(10rem, 40vw, 25rem)',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.02)',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 0,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.05em'
            }}>
                404
            </div>

            <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp 1s ease-out' }}>
                <div style={{
                    position: 'relative',
                    marginBottom: '2.5rem',
                    display: 'inline-block'
                }}>
                    <div style={{
                        background: 'rgba(255, 107, 157, 0.12)',
                        padding: '2.8rem',
                        borderRadius: '35% 65% 70% 30% / 30% 40% 60% 70%',
                        border: '1px solid rgba(255, 107, 157, 0.25)',
                        boxShadow: '0 0 60px rgba(255, 107, 157, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'floating 6s ease-in-out infinite'
                    }}>
                        <Search size={58} color="var(--pink)" strokeWidth={1.2} />
                    </div>
                    {/* Ring Decors */}
                    <div style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        right: '-10%',
                        bottom: '-10%',
                        border: '1px dashed rgba(255, 107, 157, 0.15)',
                        borderRadius: '50%',
                        animation: 'spin 20s linear infinite'
                    }}></div>
                </div>

                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    color: 'var(--pink)',
                    marginBottom: '1.2rem',
                    letterSpacing: '0.3em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    opacity: 0.8
                }}>
                    Signal Interrupted
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.2rem, 9vw, 3.8rem)',
                    marginBottom: '1.5rem',
                    color: 'var(--text-hi)',
                    letterSpacing: '-0.04em',
                    fontWeight: 900,
                    lineHeight: 1,
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    Lost in the <br />
                    <span style={{
                        background: 'linear-gradient(to right, var(--cyan), var(--purple))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}>Digital Void</span>
                </h1>

                <p style={{
                    color: 'var(--text-dim)',
                    maxWidth: '520px',
                    margin: '0 auto 4rem',
                    fontSize: '1.05rem',
                    lineHeight: '1.7',
                    fontWeight: 400
                }}>
                    The information packet you're looking for was either de-indexed from our servers or has entered a terminal event horizon.
                </p>

                <Link href="/" className="btn-ghost" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '1.1rem 2.5rem',
                    borderRadius: '50px',
                    border: '1px solid var(--border)',
                    color: 'var(--text-hi)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <ArrowLeft size={20} />
                    Reset Connection
                </Link>
            </div>

            {/* Recommendations Section */}
            <div style={{
                marginTop: '8rem',
                width: '100%',
                maxWidth: '1000px',
                padding: '0 1rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, var(--border))' }}></div>
                    <h3 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '.75rem',
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        whiteSpace: 'nowrap'
                    }}>Guided learning paths</h3>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, var(--border))' }}></div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {featuredVisuals.map(v => (
                        <Link key={v.id} href={`/visuals/${v.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                            <div className="topic-card card-cyan" style={{
                                padding: '2rem',
                                background: 'rgba(14, 18, 25, 0.5)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border)',
                                borderRadius: '24px',
                                textAlign: 'left',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    color: 'var(--cyan)',
                                    fontSize: '0.7rem',
                                    marginBottom: '0.8rem',
                                    fontFamily: 'var(--font-mono)',
                                    textTransform: 'uppercase',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em'
                                }}>{v.category}</div>
                                <h4 style={{
                                    color: 'var(--text-hi)',
                                    fontSize: '1.25rem',
                                    marginBottom: '0.8rem',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.01em'
                                }}>{v.title}</h4>
                                <p style={{
                                    color: 'var(--text-dim)',
                                    fontSize: '0.9rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: '1.6',
                                    marginTop: 'auto'
                                }}>{v.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(0, 229, 255, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(185, 133, 244, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
            }}></div>
        </div>
    );
}

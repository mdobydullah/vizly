"use client";

import { useState } from "react";

interface LightboxImageProps {
    src: string;
    alt: string;
}

export function LightboxImage({ src, alt }: Readonly<LightboxImageProps>) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <img
                src={src}
                alt={alt}
                onClick={() => setOpen(true)}
                style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    cursor: 'zoom-in',
                    transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        cursor: 'zoom-out',
                        animation: 'lbFadeIn 0.2s ease-out',
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            borderRadius: '16px',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                            animation: 'lbScaleIn 0.2s ease-out',
                        }}
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes lbFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes lbScaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}

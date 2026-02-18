"use client";

import React from 'react';

export const GuideLoader = () => (
    <div className="viz-loader-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '2.5rem',
        padding: '2rem'
    }}>
        {/* Skeleton Card */}
        <div style={{
            width: '100%',
            maxWidth: '860px',
            height: '240px',
            background: 'var(--surface2)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
            <div className="skeleton-pulse" style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.08), transparent)',
            }} />
        </div>

        {/* Loading Text & Spinner */}
        <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '.75rem',
            color: 'var(--cyan)',
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem',
            opacity: 0.8
        }}>
            <div className="viz-spinner"></div>
            <span>Init guide environment...</span>
        </div>

        <style jsx>{`
            .skeleton-pulse {
                animation: scan 2s infinite ease-in-out;
                width: 200%;
            }
            @keyframes scan {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(50%); }
            }
            .viz-spinner {
                width: 28px;
                height: 28px;
                border: 2px solid rgba(0, 229, 255, 0.1);
                border-top-color: var(--cyan);
                border-radius: 50%;
                animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

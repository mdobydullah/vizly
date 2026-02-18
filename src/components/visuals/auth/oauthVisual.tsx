"use client";

import React from 'react';
import { Youtube, Globe, BookOpen, ExternalLink } from 'lucide-react';
import visualsData from "@/data/visuals";
import { VisualLayout } from '@/components/layout/VisualLayout';

const visual = visualsData.visuals.find(v => v.id === "oauth")!;

const RESOURCES = [
    { title: "OAuth 2.0 Simplified", type: "web", url: "https://www.oauth.com/" },
    { title: "An Introduction to OAuth 2", type: "web", url: "https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2" },
    { title: "OAuth 2.0 and OpenID Connect (in plain English)", type: "youtube", url: "https://www.youtube.com/watch?v=996OiexHze0" },
    { title: "RFC 6749: The OAuth 2.0 Authorization Framework", type: "web", url: "https://datatracker.ietf.org/doc/html/rfc6749" },
];

export function OauthVisual() {
    return (
        <VisualLayout
            category={visual.category}
            title={visual.title}
            description={visual.description}
            primaryColor={visual.colorConfig.primary}
            contributors={visual.contributors}
        >
            {/* ═══════════════ ROLES ═══════════════ */}
            <h2 className="section-title">Key Players in OAuth 2.0</h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    maxWidth: '1000px',
                    margin: '0 auto 1.4rem'
                }}
            >
                {/* Resource Owner */}
                <div className="viz-box viz-reveal card-cyan visible">
                    <span className="viz-label">Resource Owner</span>
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <div style={{
                            background: 'rgba(0, 229, 255, 0.03)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.8rem',
                            fontSize: '2rem',
                            border: '1px dashed rgba(0, 229, 255, 0.2)'
                        }}>👤</div>
                        <div style={{
                            fontSize: '.65rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--cyan)',
                            background: 'rgba(0, 229, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.5rem'
                        }}>User Agent</div>
                        <p style={{ fontSize: '0.72rem', opacity: 0.8, lineHeight: 1.4 }}>The end-user who grants access to their data.</p>
                    </div>
                </div>

                {/* Client */}
                <div className="viz-box viz-reveal card-purple visible">
                    <span className="viz-label">Client</span>
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <div style={{
                            background: 'rgba(185, 133, 244, 0.03)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.8rem',
                            fontSize: '2rem',
                            border: '1px dashed rgba(185, 133, 244, 0.2)'
                        }}>📱</div>
                        <div style={{
                            fontSize: '.65rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--purple)',
                            background: 'rgba(185, 133, 244, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.5rem'
                        }}>App / Website</div>
                        <p style={{ fontSize: '0.72rem', opacity: 0.8, lineHeight: 1.4 }}>The application requesting access to the resource.</p>
                    </div>
                </div>

                {/* Authorization Server */}
                <div className="viz-box viz-reveal card-yellow visible">
                    <span className="viz-label">Auth Server</span>
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <div style={{
                            background: 'rgba(255, 209, 102, 0.03)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.8rem',
                            fontSize: '2rem',
                            border: '1px dashed rgba(255, 209, 102, 0.2)'
                        }}>🔐</div>
                        <div style={{
                            fontSize: '.65rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--yellow)',
                            background: 'rgba(255, 209, 102, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.5rem'
                        }}>OAuth Provider</div>
                        <p style={{ fontSize: '0.72rem', opacity: 0.8, lineHeight: 1.4 }}>Authenticates user and issues Access Tokens.</p>
                    </div>
                </div>

                {/* Resource Server */}
                <div className="viz-box viz-reveal card-pink visible">
                    <span className="viz-label">Resource Server</span>
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <div style={{
                            background: 'rgba(255, 107, 157, 0.03)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.8rem',
                            fontSize: '2rem',
                            border: '1px dashed rgba(255, 107, 157, 0.2)'
                        }}>🗄️</div>
                        <div style={{
                            fontSize: '.65rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--pink)',
                            background: 'rgba(255, 107, 157, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.5rem'
                        }}>API / Data</div>
                        <p style={{ fontSize: '0.72rem', opacity: 0.8, lineHeight: 1.4 }}>The API holding the protected user data.</p>
                    </div>
                </div>
            </div>
            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <h2 className="section-title">Authorization Code Flow</h2>

            <div className="flow-wrap">
                <div className="flow-step s1 visible">
                    <div className="step-num">1</div>
                    <div className="step-body">
                        <div className="step-actor">👤 User → 📱 Client</div>
                        <div className="step-desc">User wants to log in or connect their account and clicks <strong>"Connect"</strong>.</div>
                    </div>
                </div>

                <div className="flow-step s2 visible">
                    <div className="step-num">2</div>
                    <div className="step-body">
                        <div className="step-actor">📱 Client → 🔐 Auth Server</div>
                        <div className="step-desc">Client redirects User to the Auth Server with <code>client_id</code> and <code>scopes</code>.</div>
                    </div>
                </div>

                <div className="flow-step s3 visible">
                    <div className="step-num">3</div>
                    <div className="step-body">
                        <div className="step-actor">👤 User &amp; 🔐 Auth Server</div>
                        <div className="step-desc">User authenticates (logs in) and <strong>denies/grants</strong> requested permissions.</div>
                    </div>
                </div>

                <div className="flow-step s4 visible">
                    <div className="step-num">4</div>
                    <div className="step-body">
                        <div className="step-actor">🔐 Auth Server → 📱 Client</div>
                        <div className="step-desc">Server redirects back to Client's <code>redirect_uri</code> with a temporary <strong>Auth Code</strong>.</div>
                    </div>
                </div>

                <div className="flow-step s5 visible">
                    <div className="step-num">5</div>
                    <div className="step-body">
                        <div className="step-actor">📱 Client → 🔐 Auth Server</div>
                        <div className="step-desc">Client sends <strong>Auth Code + Client Secret</strong> to the server (back-channel).</div>
                    </div>
                </div>

                <div className="flow-step s6 visible">
                    <div className="step-num">6</div>
                    <div className="step-body">
                        <div className="step-actor">🔐 Auth Server</div>
                        <div className="step-desc">Server validates the code and secret, then issues an <strong>Access Token</strong> (and Refresh Token).</div>
                    </div>
                </div>

                <div className="flow-step s7 visible">
                    <div className="step-num">7</div>
                    <div className="step-body">
                        <div className="step-actor">📱 Client → 🗄️ Resource Server</div>
                        <div className="step-desc">Client requests data using the <strong>Access Token</strong> in the <code>Authorization</code> header.</div>
                    </div>
                </div>

                <div className="flow-step s8 visible">
                    <div className="step-num">8</div>
                    <div className="step-body">
                        <div className="step-actor">🗄️ Resource Server</div>
                        <div className="step-desc">Server validates the token and returns the <strong>Protected Resource/Data</strong>.</div>
                    </div>
                </div>
            </div>

            <div id="full-oauth-flow" className="viz-fade-up visible" style={{
                paddingTop: '3rem',
            }}>
                {/* ═══════════════ MERMAID FLOW ═══════════════ */}
                <h2 className="section-title">Sequence Diagram</h2>

                <div className="viz-mermaid-wrap">
                    <div className="mermaid">
                        {`sequenceDiagram
    autonumber
    participant U as 👤 User
    participant C as 📱 Client App
    participant AS as 🔐 Auth Server
    participant RS as 🗄️ Resource Server

    U->>C: 1. Click "Login/Connect"
    C->>AS: 2. Redirect to Login (client_id, scope)
    U->>AS: 3. Authenticate & Authorize
    AS->>C: 4. Redirect with Auth Code
    C->>AS: 5. Exchange Code + Secret for Token
    AS->>C: 6. Return Access Token
    C->>RS: 7. Request Data with Token
    RS->>C: 8. Return Protected Resource 🎉`}
                    </div>
                </div>
            </div>

            {/* ═══════════════ RESOURCES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Resources</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Title</th>
                            <th style={{ width: '20%' }}>Type</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCES.map((res) => (
                            <tr key={res.title}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{res.title}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ResourceIcon type={res.type} />
                                        <span style={{ textTransform: 'capitalize' }}>{res.type}</span>
                                    </div>
                                </td>
                                <td>
                                    <a
                                        href={`${res.url}${res.url.includes('?') ? '&' : '?'}ref=vizly.dev`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: 'var(--blue)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                        className="hover:underline"
                                    >
                                        Open <ExternalLink size={14} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </VisualLayout >
    );
}

function ResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'course': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, PlayCircle, Globe, ExternalLink, Server, Smartphone, Play, Pause, RotateCcw } from 'lucide-react';
import mermaid from 'mermaid';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/stateful-stateless.css';

const guide = guidesData.guides.find(v => v.id === "stateful-stateless-architecture")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    text: string;
    action: 'request' | 'process' | 'response' | 'error';
    target?: string;
    details?: string;
};

const SIMULATION_STEPS = {
    stateful: [
        { text: "Client sends login credentials", action: "request", target: "server", details: "POST /login" },
        { text: "Server verifies credentials", action: "process", target: "server", details: "Validating..." },
        { text: "Server creates session in memory", action: "process", target: "server", details: "SessionID: 123 -> User: Alice" },
        { text: "Server sends SessionID cookie", action: "response", target: "client", details: "Set-Cookie: sid=123" },
        { text: "Client requests dashboard with Cookie", action: "request", target: "server", details: "GET /dash; Cookie: sid=123" },
        { text: "Server looks up SessionID in memory", action: "process", target: "server", details: "Found sid=123 -> Active" },
        { text: "Server returns sensitive data", action: "response", target: "client", details: "200 OK" }
    ],
    stateless: [
        { text: "Client sends login credentials", action: "request", target: "server", details: "POST /login" },
        { text: "Server verifies credentials", action: "process", target: "server", details: "Validating..." },
        { text: "Server signs JWT (self-contained)", action: "process", target: "server", details: "Sign(User: Alice, Secret)" },
        { text: "Server sends JWT token", action: "response", target: "client", details: "Token: eyJhbG..." },
        { text: "Client requests dashboard with Token", action: "request", target: "server", details: "GET /dash; Auth: Bearer eyJ..." },
        { text: "Server verifies Token signature", action: "process", target: "server", details: "Signature Valid -> User: Alice" },
        { text: "Server returns sensitive data", action: "response", target: "client", details: "200 OK" }
    ]
};

const COMPARISON = [
    { feature: "Scalability", stateful: "Hard (Sticky Sessions needed)", stateless: "Easy (Horizontal scaling)", winner: "Stateless" },
    { feature: "Complexity", stateful: "Low (Simple logic)", stateless: "Medium (Token management)", winner: "Stateful" },
    { feature: "Server Memory", stateful: "High (Stores all sessions)", stateless: "Low (No storage)", winner: "Stateless" },
    { feature: "Revocation", stateful: "Instant (Delete session)", stateless: "Hard (Need blocklist/short try)", winner: "Stateful" },
    { feature: "Bandwidth", stateful: "Low (Small cookie ID)", stateless: "Medium (Large tokens)", winner: "Stateful" },
    { feature: "Resilience", stateful: "Low (Session lost on crash)", stateless: "High (Any server works)", winner: "Stateless" },
];

const RESOURCES = [
    { title: "Stateful vs Stateless Architecture", type: "web", url: "https://www.redhat.com/en/topics/cloud-native-apps/stateful-vs-stateless" },
    { title: "REST API Design: Statelessness", type: "web", url: "https://restfulapi.net/statelessness/" },
    { title: "System Design: Scaling From Zero to Millions", type: "youtube", url: "https://www.youtube.com/watch?v=kKjm4ehcZFg" },
    { title: "Session vs Token Authentication", type: "web", url: "https://auth0.com/blog/session-cookies-vs-token-authentication-explained/" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function StatefulStatelessGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activeTab, setActiveTab] = useState<'stateful' | 'stateless'>('stateful');
    const [currentStep, setCurrentStep] = useState(-1);

    const [isPlaying, setIsPlaying] = useState(true);
    const [replayCount, setReplayCount] = useState(0);

    const activeSteps = SIMULATION_STEPS[activeTab];

    // Re-run mermaid when tab changes
    useEffect(() => {
        // Short timeout to ensure DOM is updated
        const t = setTimeout(() => {
            mermaid.contentLoaded();
        }, 100);
        return () => clearTimeout(t);
    }, [activeTab]);

    const playAnimation = useCallback(() => {
        setCurrentStep(-1);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        let t: NodeJS.Timeout;
        if (isPlaying) {
            if (currentStep < activeSteps.length - 1) {
                const stepTime = 2000 * animationSpeed;
                t = setTimeout(() => {
                    setCurrentStep(prev => prev + 1);
                }, currentStep === -1 ? 500 : stepTime);
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearTimeout(t);
    }, [isPlaying, currentStep, activeSteps.length, animationSpeed]);

    useEffect(() => {
        playAnimation();
    }, [activeTab, playAnimation, replayCount]);

    const handleReplay = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setReplayCount(prev => prev + 1);
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/infrastructure/StatefulStatelessArchitectureGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ VERTICAL SECTIONS ═══════════════ */}
            <h2 className="section-title">
                Stateful Architecture
            </h2>
            <div className="architecture-section stateful">
                <div className="architecture-content">
                    <div>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            In a stateful architecture, the server retains information (state) about client sessions between requests.
                            The server "remembers" who you are.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--green)' }}>✓</span> Simpler to implement initially
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--red)' }}>✗</span> Hard to scale (needs Sticky Sessions)
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--red)' }}>✗</span> Single point of failure (memory loss)
                            </li>
                        </ul>
                    </div>
                    <div className="viz-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                        <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '1rem', borderRadius: '8px', width: '100%', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Server Memory</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--orange)', marginTop: '0.5rem' }}>Session: User_123</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Server must trigger memory lookup</div>
                    </div>
                </div>
            </div>

            <h2 className="section-title">
                Stateless Architecture
            </h2>
            <div className="architecture-section stateless">
                <div className="architecture-content">
                    <div>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            In a stateless architecture, the server does not hold any data between requests.
                            Each request is independent and must contain all necessary information (e.g., via a Token).
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--green)' }}>✓</span> Easy horizontal scaling
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--green)' }}>✓</span> Resilient (any server can handle any request)
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--orange)' }}>!</span> More complex validation (Cryptography)
                            </li>
                        </ul>
                    </div>
                    <div className="viz-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                        <div style={{ background: 'rgba(34, 211, 238, 0.2)', padding: '1rem', borderRadius: '8px', width: '100%', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Client Request</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--cyan)', marginTop: '0.5rem' }}>Token: "I am User_123"</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Server validates signature only</div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ SIMULATOR ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Interactive Simulator</h2>
            </div>

            <div className="simulator-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                        className={`sim-btn ${activeTab === 'stateful' ? 'active-stateful' : ''}`}
                        onClick={() => setActiveTab('stateful')}
                    >
                        Stateful Flow
                    </button>
                    <button
                        className={`sim-btn ${activeTab === 'stateless' ? 'active-stateless' : ''}`}
                        onClick={() => setActiveTab('stateless')}
                    >
                        Stateless Flow
                    </button>
                </div>
                <div className="viz-playback-controls" style={{ marginLeft: '1rem' }}>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="viz-ctrl-btn"
                        title={isPlaying ? "Pause" : "Play"}
                        aria-label={isPlaying ? "Pause Animation" : "Play Animation"}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={handleReplay}
                        className="viz-ctrl-btn"
                        title="Replay"
                        aria-label="Replay Animation"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="viz-ctrl-btn"
                        title="Settings"
                        aria-label="Settings"
                    >
                        <Settings size={14} />
                    </button>
                </div>
            </div>

            <div className="simulator-container">
                {/* Client Node */}
                <div className={`flow-node client ${currentStep >= 0 && activeSteps[currentStep].target === 'client' ? 'active' : ''}`}>
                    <Smartphone size={24} color="var(--blue)" />
                    <span style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Client</span>
                </div>

                {/* Server Node */}
                <div className={`flow-node server ${currentStep >= 0 && activeSteps[currentStep].target === 'server' ? 'active' : ''} ${activeTab === 'stateful' && currentStep > 1 ? 'has-memory' : ''}`}>
                    <Server size={24} color={activeTab === 'stateful' ? 'var(--orange)' : 'var(--cyan)'} />
                    <span style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Server</span>

                    {/* Active Memory Indicator */}
                    {activeTab === 'stateful' && (
                        <div className="server-memory">
                            💾 Session: 123
                        </div>
                    )}
                </div>


                {/* Animated Packet */}
                {currentStep >= 0 && activeSteps[currentStep].action === 'request' && (
                    <div className="flow-packet animate-request" key={`req-${currentStep}`}>
                        <div className="packet-label">{activeSteps[currentStep].details}</div>
                    </div>
                )}

                {currentStep >= 0 && activeSteps[currentStep].action === 'response' && (
                    <div className="flow-packet animate-response" key={`res-${currentStep}`}>
                        <div className="packet-label">{activeSteps[currentStep].details}</div>
                    </div>
                )}

                {/* Steps List */}
                <div className="sim-steps-container">
                    {activeSteps.map((step) => (
                        <div
                            key={`${activeTab}-${step.text}`}
                            className={`sim-step 
                                ${currentStep === activeSteps.indexOf(step) ? 'active' : ''} 
                                ${currentStep === activeSteps.indexOf(step) && activeTab === 'stateful' ? 'active-stateful' : ''}
                            `}
                        >
                            <div className="sim-step-num">{activeSteps.indexOf(step) + 1}</div>
                            <div className="sim-step-text">{step.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════ MERMAID ═══════════════ */}
            <div className="viz-fade-up visible" style={{ marginTop: '4rem' }}>
                <h2 className="section-title">
                    {activeTab === 'stateful' ? 'Stateful' : 'Stateless'} Sequence Diagram
                </h2>

                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        className={`sim-btn ${activeTab === 'stateful' ? 'active-stateful' : ''}`}
                        onClick={() => setActiveTab('stateful')}
                    >
                        Stateful Flow
                    </button>
                    <button
                        className={`sim-btn ${activeTab === 'stateless' ? 'active-stateless' : ''}`}
                        onClick={() => setActiveTab('stateless')}
                    >
                        Stateless Flow
                    </button>
                </div>

                <div className="viz-mermaid-wrap">
                    <div className="mermaid" key={activeTab}>
                        {activeTab === 'stateful' ? `
sequenceDiagram
    participant C as Client
    participant S as Server
    participant M as Memory/DB

    C->>S: 1. Login
    S->>M: 2. Create Session (ID: 123)
    S-->>C: 3. Set-Cookie: sid=123
    
    C->>S: 4. Request (Cookie: sid=123)
    S->>M: 5. Verify Session 123
    M-->>S: 6. Session Valid
    S-->>C: 7. Response Data
                        ` : `
sequenceDiagram
    participant C as Client
    participant S as Server

    C->>S: 1. Login
    Note right of S: 2. Generate Token (Sign)
    S-->>C: 3. Return Token (JWT)
    
    C->>S: 4. Request (Auth: Bearer Token)
    Note right of S: 5. Verify Signature
    S-->>C: 6. Response Data
                        `}
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Comparison</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Stateful</th>
                            <th>Stateless</th>
                            <th>Winner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map((row) => (
                            <tr key={row.feature} className="comparison-row-table">
                                <td style={{ fontWeight: 'bold', color: 'var(--text-hi)' }}>{row.feature}</td>
                                <td style={{ color: 'var(--orange)' }}>{row.stateful}</td>
                                <td style={{ color: 'var(--cyan)' }}>{row.stateless}</td>
                                <td>
                                    <span className={`viz-tag ${row.winner === 'Stateless' ? 'cyan' : 'orange'}`}>
                                        {row.winner}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

        </GuideLayout>
    );
}

function ResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <PlayCircle size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        default: return <ExternalLink size={18} />;
    }
}

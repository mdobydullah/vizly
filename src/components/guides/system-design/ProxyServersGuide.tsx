"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Settings, Youtube, Globe, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/system-design/proxy-servers.css';

const guide = guidesData.guides.find(v => v.id === "proxy-servers")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    text: string;
    activeNodes: string[];
    packetPos?: string; // 'client-proxy', 'proxy-internet', 'internet-server', 'server-proxy', etc.
    packetDir?: 'forward' | 'reverse';
    message?: string;
};

type Pattern = {
    title: string;
    label: string;
    steps: Step[];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'forward': {
        title: 'Forward Proxy Flow (Client-Side)',
        label: 'Forward Proxy',
        steps: [
            { text: 'Client initiates a request to a website', activeNodes: ['client'], packetPos: 'client-proxy', packetDir: 'forward' },
            { text: 'Proxy intercepts request — hides client IP and identity', activeNodes: ['proxy'], message: 'Masking IP...' },
            { text: 'Proxy forwards request to the web server via Internet', activeNodes: ['internet', 'server'], packetPos: 'proxy-internet', packetDir: 'forward' },
            { text: 'Server returns the data back to the proxy', activeNodes: ['server', 'internet'], packetPos: 'internet-proxy', packetDir: 'reverse' },
            { text: 'Proxy delivers the response to the client', activeNodes: ['proxy', 'client'], packetPos: 'proxy-client', packetDir: 'reverse' }
        ]
    },
    'reverse': {
        title: 'Reverse Proxy Flow (Server-Side)',
        label: 'Reverse Proxy',
        steps: [
            { text: 'Client sends request to a public domain', activeNodes: ['client', 'internet'], packetPos: 'client-internet', packetDir: 'forward' },
            { text: 'Reverse Proxy terminates SSL and filters request', activeNodes: ['proxy'], message: 'SSL Check / WAF' },
            { text: 'Proxy routes request to an internal service', activeNodes: ['service-a'], packetPos: 'proxy-server', packetDir: 'forward' },
            { text: 'Service processes request and returns data', activeNodes: ['service-a'], packetPos: 'server-proxy', packetDir: 'reverse' },
            { text: 'Reverse Proxy sends response while hiding backend IPs', activeNodes: ['proxy', 'client'], packetPos: 'proxy-client', packetDir: 'reverse' }
        ]
    },
    'caching': {
        title: 'Caching Proxy (Optimization)',
        label: 'Caching',
        steps: [
            { text: 'Client requests a resource (e.g., logo.png)', activeNodes: ['client'], packetPos: 'client-proxy', packetDir: 'forward' },
            { text: 'Proxy checks its local cache storage', activeNodes: ['proxy'], message: 'Cache Lookup...' },
            { text: 'CACHE HIT: Valid copy found!', activeNodes: ['proxy'], message: 'Found! (TTL Valid)' },
            { text: 'Returns data to client IMMEDIATELY — skipping backend', activeNodes: ['client'], packetPos: 'proxy-client', packetDir: 'reverse' },
            { text: 'Latency reduced by omitting network roundtrip', activeNodes: ['client', 'proxy'] }
        ]
    },
    'load-balancing': {
        title: 'Load Balancing (Reverse Proxy)',
        label: 'Load Balancing',
        steps: [
            { text: 'High volume of traffic arriving at the gateway', activeNodes: ['client', 'internet'], packetPos: 'client-internet', packetDir: 'forward' },
            { text: 'Reverse Proxy selects Service B (Round Robin)', activeNodes: ['proxy', 'service-b'], packetPos: 'proxy-server-b', packetDir: 'forward' },
            { text: 'Request #2 arrives — Proxy selects Service A', activeNodes: ['proxy', 'service-a'], packetPos: 'proxy-server-a', packetDir: 'forward' },
            { text: 'Traffic effectively distributed across pool', activeNodes: ['proxy', 'service-a', 'service-b'] }
        ]
    }
};

const COMPARISON = [
    { name: "Forward Proxy", purpose: "Protect Client", visibility: "Hides IP from Server", useCase: "VPN, Org Filtering", complexity: 2 },
    { name: "Reverse Proxy", purpose: "Protect Server", visibility: "Hides Server from Client", useCase: "Nginx, Cloudflare", complexity: 4 },
];

const TABLE_COMPREHENSIVE = [
    { feature: "Client Privacy", forward: "Primary Goal", reverse: "Incidental" },
    { feature: "Server Security", forward: "Incidental", reverse: "Primary Goal" },
    { feature: "SSL Termination", forward: "Rare", reverse: "Common" },
    { feature: "Load Balancing", forward: "Rare", reverse: "Standard" },
    { feature: "Caching", forward: "Outbound", reverse: "Inbound" },
];

const RESOURCES = [
    { title: "What is a Reverse Proxy?", type: "web", url: "https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/" },
    { title: "What is a Forward Proxy?", type: "web", url: "https://www.zscaler.com/resources/security-terms-glossary/what-is-forward-proxy" },
    { title: "NGINX Reverse Proxy - Documentation & Setup", type: "web", url: "https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/" },
    { title: "Understanding Proxy, Forward Proxy, and Reverse Proxy", type: "youtube", url: "https://www.youtube.com/watch?v=HrG0MHkSsCA" },
    { title: "Difference between Forward Proxy and Reverse Proxy", type: "web", url: "https://www.geeksforgeeks.org/system-design/difference-between-forward-proxy-and-reverse-proxy/" },
    { title: "What is Load Balancing? | DigitalOcean Guide", type: "web", url: "https://www.digitalocean.com/community/tutorials/what-is-load-balancing" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function ProxyServersGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('forward');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const playPattern = useCallback((patternKey: string) => {
        setActivePatternKey(patternKey);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    // Core Animation Loop
    useEffect(() => {
        if (!isPlaying) return;

        const pattern = FLOW_PATTERNS[activePatternKey];
        const stepTime = 2000 * animationSpeed;

        if (currentStepIdx < pattern.steps.length - 1) {
            const nextIdx = currentStepIdx + 1;
            const delay = currentStepIdx === -1 ? 500 : stepTime;

            const t = setTimeout(() => {
                setCurrentStepIdx(nextIdx);
            }, delay);

            return () => clearTimeout(t);
        } else {
            setIsPlaying(false);
        }
    }, [currentStepIdx, isPlaying, activePatternKey, animationSpeed]);

    const activePattern = FLOW_PATTERNS[activePatternKey];
    const currentStep = currentStepIdx >= 0 ? activePattern.steps[currentStepIdx] : null;

    const handleReplay = () => {
        playPattern(activePatternKey);
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/system-design/ProxyServersGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            tags={guide.tags}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPT GRID ═══════════════ */}
            <h2 className="section-title">Core Proxy Concepts</h2>
            <div className="proxy-grid">
                <div className="viz-card proxy-card card-cyan-accent" onClick={() => playPattern('forward')}>
                    <div className="proxy-card-header">
                        <div className="proxy-card-icon">🔜</div>
                        <div className="proxy-card-name">Forward Proxy</div>
                    </div>
                    <p className="proxy-card-desc">Sits on the client side. Requests go through the proxy to reach the public internet. Used to bypass restrictions and stay anonymous.</p>
                    <div className="proxy-card-stats">
                        <span className="proxy-stat-chip hi">Client-Side</span>
                        <span className="proxy-stat-chip">Anonymity</span>
                    </div>
                    <div className="proxy-use-case"><strong>Use case:</strong> Corporate web filters, VPNs.</div>
                </div>

                <div className="viz-card proxy-card card-purple" onClick={() => playPattern('reverse')}>
                    <div className="proxy-card-header">
                        <div className="proxy-card-icon">🔙</div>
                        <div className="proxy-card-name">Reverse Proxy</div>
                    </div>
                    <p className="proxy-card-desc">Sits on the server perimeter. Internet traffic hits the proxy first before entering the private server network.</p>
                    <div className="proxy-card-stats">
                        <span className="proxy-stat-chip hi">Server-Side</span>
                        <span className="proxy-stat-chip">Security</span>
                    </div>
                    <div className="proxy-use-case"><strong>Use case:</strong> Nginx, HAProxy, Cloudflare.</div>
                </div>

                <div className="viz-card proxy-card card-orange" onClick={() => playPattern('load-balancing')}>
                    <div className="proxy-card-header">
                        <div className="proxy-card-icon">⚖️</div>
                        <div className="proxy-card-name">Load Balancing</div>
                    </div>
                    <p className="proxy-card-desc">Distributes incoming requests across multiple backend servers to prevent overload and ensure high availability.</p>
                    <div className="proxy-card-stats">
                        <span className="proxy-stat-chip hi">Scalability</span>
                        <span className="proxy-stat-chip">Uptime</span>
                    </div>
                    <div className="proxy-use-case"><strong>Use case:</strong> Scaling high-traffic applications.</div>
                </div>

                <div className="viz-card proxy-card card-green" onClick={() => playPattern('caching')}>
                    <div className="proxy-card-header">
                        <div className="proxy-card-icon">⚡</div>
                        <div className="proxy-card-name">Caching Proxy</div>
                    </div>
                    <p className="proxy-card-desc">Stores copies of frequent responses. Returns static content without querying the origin server every time.</p>
                    <div className="proxy-card-stats">
                        <span className="proxy-stat-chip hi">Performance</span>
                        <span className="proxy-stat-chip">Efficiency</span>
                    </div>
                    <div className="proxy-use-case"><strong>Use case:</strong> CDNs, Static Asset Serving.</div>
                </div>
            </div>

            {/* ═══════════════ MERMAID ARCHITECTURE ═══════════════ */}
            <h2 className="section-title">Visualizing the Perimeters</h2>
            <div className="proxy-mermaid-wrap">
                <div style={{ width: '100%', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--cyan)', fontFamily: 'var(--font-hero)', fontWeight: 600 }}>Forward Proxy (Client Perimeter)</div>
                    <pre className="mermaid">
                        {`
                        graph LR
                            C[Client Device] --> FP(["Forward Proxy\n(Org Network)"])
                            FP --> I1[Internet]
                            I1 --> S1[Destination Server]

                            style FP fill:#12161f,stroke:#84ffff,color:#fff
                            style C fill:#0d1117,stroke:#84ffff,color:#fff
                            style I1 fill:#00000033,stroke:#aaa,color:#aaa
                            style S1 fill:#1a1f2b,stroke:#c6ff00,color:#fff
                        `}
                    </pre>
                </div>

                <div style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--purple)', fontFamily: 'var(--font-hero)', fontWeight: 600 }}>Reverse Proxy (Server Perimeter)</div>
                    <pre className="mermaid">
                        {`
                        graph LR
                            C2[Public User] --> I2[Internet]
                            I2 --> RP(["Reverse Proxy\n(Gateway)"])
                            RP --> S2[Service A]
                            RP --> S3[Service B]

                            style RP fill:#12161f,stroke:#e040fb,color:#fff
                            style C2 fill:#0d1117,stroke:#84ffff,color:#fff
                            style I2 fill:#00000033,stroke:#aaa,color:#aaa
                            style S2 fill:#1a1f2b,stroke:#c6ff00,color:#fff
                            style S3 fill:#1a1f2b,stroke:#c6ff00,color:#fff
                        `}
                    </pre>
                </div>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Request Lifecycle</h2>
                <p className="viz-section-hint">Choose a pattern to see how packets move through the network</p>
            </div>

            <div className="proxy-flow-section">
                <div className="proxy-flow-controls-row">
                    <div className="proxy-flow-controls">
                        {Object.keys(FLOW_PATTERNS).map(key => (
                            <button
                                key={key}
                                className={`proxy-flow-btn ${activePatternKey === key ? 'active' : ''}`}
                                onClick={() => playPattern(key)}
                            >
                                {FLOW_PATTERNS[key].label}
                            </button>
                        ))}
                    </div>

                    {/* Integrated Playback Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                                background: isPlaying ? 'rgba(132, 255, 255, 0.1)' : 'transparent',
                                color: isPlaying ? 'var(--cyan)' : 'var(--text-dim)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
                            }}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={() => playPattern(activePatternKey)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                            title="Replay"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <div style={{ width: '1px', height: '14px', background: 'var(--border2)', margin: '0 4px' }} />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                            title="Settings"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>

                <div className="proxy-flow-diagram">
                    <div className="proxy-flow-header">
                        <h3 className="proxy-flow-title">{activePattern.title}</h3>
                        <div className="proxy-flow-subtitle">{activePattern.steps[currentStepIdx >= 0 ? currentStepIdx : 0]?.text}</div>
                    </div>

                    <div className="proxy-nodes-container">
                        <Node id="client" active={currentStep?.activeNodes.includes('client')}>
                            <div className="proxy-node-icon">💻</div>
                            <span>Client</span>
                        </Node>

                        <div className="proxy-connection active">
                            {currentStep?.packetPos === 'client-proxy' && <Packet dir={currentStep.packetDir} />}
                            {currentStep?.packetPos === 'proxy-client' && <Packet dir={currentStep.packetDir} />}
                            {currentStep?.packetPos === 'client-internet' && <Packet dir={currentStep.packetDir} />}
                        </div>

                        {activePatternKey === 'forward' || activePatternKey === 'caching' ? (
                            <>
                                <Node id="proxy" active={currentStep?.activeNodes.includes('proxy')}>
                                    <div className="proxy-node-icon">🛡️</div>
                                    <span>Proxy</span>
                                    {currentStep?.message && <div className="viz-label">{currentStep.message}</div>}
                                </Node>
                                <div className="proxy-connection active">
                                    {(currentStep?.packetPos === 'proxy-internet' || currentStep?.packetPos === 'internet-proxy') && <Packet dir={currentStep.packetDir} />}
                                </div>
                                <Node id="internet" active={currentStep?.activeNodes.includes('internet')} className="internet">
                                    <span>Internet</span>
                                </Node>
                                <div className="proxy-connection active">
                                    {(currentStep?.packetPos === 'internet-server' || currentStep?.packetPos === 'server-internet') && <Packet dir={currentStep.packetDir} />}
                                </div>
                                <Node id="server" active={currentStep?.activeNodes.includes('server')}>
                                    <div className="proxy-node-icon">☁️</div>
                                    <span>Server</span>
                                </Node>
                            </>
                        ) : (
                            <>
                                <Node id="internet" active={currentStep?.activeNodes.includes('internet')} className="internet">
                                    <span>Internet</span>
                                </Node>
                                <div className="proxy-connection active">
                                    {(currentStep?.packetPos === 'internet-proxy' || currentStep?.packetPos === 'proxy-internet') && <Packet dir={currentStep.packetDir} />}
                                </div>
                                <Node id="proxy" active={currentStep?.activeNodes.includes('proxy')}>
                                    <div className="proxy-node-icon">🛡️</div>
                                    <span>Gateway</span>
                                    {currentStep?.message && <div className="viz-label">{currentStep.message}</div>}
                                </Node>
                                <div className="proxy-connection active">
                                    {currentStep?.packetPos?.includes('proxy-server') && <Packet dir={currentStep.packetDir} />}
                                    {currentStep?.packetPos?.includes('server-proxy') && <Packet dir={currentStep.packetDir} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <Node id="service-a" active={currentStep?.activeNodes.includes('service-a')}>
                                        <span>Service A</span>
                                    </Node>
                                    <Node id="service-b" active={currentStep?.activeNodes.includes('service-b')}>
                                        <span>Service B</span>
                                    </Node>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Progress & Current Step Display */}
                    <div className="proxy-progress-container">
                        <div className="proxy-current-step-display">
                            <div className="proxy-step-text-large">
                                {currentStepIdx >= 0 ? activePattern.steps[currentStepIdx].text : "Get started by playing the simulation"}
                            </div>
                            <div className="proxy-step-counter">
                                {currentStepIdx + 1} / {activePattern.steps.length}
                            </div>
                        </div>
                        <div className="proxy-progress-bar-wrap">
                            <div
                                className="proxy-progress-bar-fill"
                                style={{ width: `${((currentStepIdx + 1) / activePattern.steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Forward vs Reverse Proxy</h2>
                <p className="viz-section-hint">Comparison of architecture and operational goals</p>
            </div>

            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Proxy Type</th>
                            <th>Complexity</th>
                            <th>Primary Purpose</th>
                            <th>Visibility</th>
                            <th>Standard Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.complexity} /></td>
                                <td>{row.purpose}</td>
                                <td>{row.visibility}</td>
                                <td style={{ color: 'var(--text-dim)' }}>{row.useCase}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="viz-comparison-table-wrap" style={{ marginTop: '2rem' }}>
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Forward Proxy</th>
                            <th>Reverse Proxy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TABLE_COMPREHENSIVE.map(row => (
                            <tr key={row.feature}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{row.feature}</td>
                                <td>{row.forward}</td>
                                <td>{row.reverse}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══════════════ RESOURCES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Resources & Deep Dive</h2>
            </div>
            <div className="viz-comparison-table-wrap" style={{ marginBottom: '4rem' }}>
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50%', color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.1rem' }}>TITLE</th>
                            <th style={{ width: '25%', color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.1rem' }}>FORMAT</th>
                            <th style={{ color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.1rem' }}>LINK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCES.map((res) => (
                            <tr key={res.title}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{res.title}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-hi)', fontSize: '0.9rem' }}>
                                        <ResourceIcon type={res.type} />
                                        <span style={{ textTransform: 'capitalize' }}>{res.type === 'web' ? 'Web' : 'Video'}</span>
                                    </div>
                                </td>
                                <td>
                                    <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            color: 'var(--cyan)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
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

// ════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════

function Node({ id, active, children, className = '' }: { id: string, active?: boolean, children: React.ReactNode, className?: string }) {
    return (
        <div id={id} className={`proxy-node ${active ? 'active' : ''} ${className}`}>
            {children}
        </div>
    );
}

function Packet({ dir = 'forward' }: { dir?: 'forward' | 'reverse' }) {
    const animationName = dir === 'forward' ? 'move-packet' : 'move-packet-back';
    return (
        <div
            className={`proxy-packet ${dir === 'reverse' ? 'reverse' : ''}`}
            style={{ animation: `${animationName} 0.8s ease-in-out forwards` }}
        />
    );
}

function Rating({ dots }: { dots: number }) {
    return (
        <div className="proxy-rating">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`proxy-dot ${i <= dots ? 'on' : ''}`} />
            ))}
        </div>
    );
}

function ResourceIcon({ type }: { type: string }) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        default: return <ExternalLink size={18} />;
    }
}

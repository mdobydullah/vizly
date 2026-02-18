"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/load-balancing.css';

const guide = guidesData.guides.find(v => v.id === "load-balancing")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type ServerNode = {
    id: string;
    name: string;
    load: number;
    healthy: boolean;
    weight?: number;
};

type Step = {
    text: string;
    target: number | number[] | null; // index in servers array
    highlight?: boolean; // blue processing color
    unhealthy?: boolean; // red error color
};

type Pattern = {
    title: string;
    algo: string;
    servers: ServerNode[];
    steps: Step[];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'round-robin': {
        title: 'Round Robin Algorithm',
        algo: 'Round Robin',
        servers: [
            { id: 's1', name: 'Server 1', load: 0, healthy: true },
            { id: 's2', name: 'Server 2', load: 0, healthy: true },
            { id: 's3', name: 'Server 3', load: 0, healthy: true },
            { id: 's4', name: 'Server 4', load: 0, healthy: true }
        ],
        steps: [
            { text: 'Request #1 → Server 1 (sequential)', target: 0 },
            { text: 'Request #2 → Server 2 (next in rotation)', target: 1 },
            { text: 'Request #3 → Server 3 (continue rotation)', target: 2 },
            { text: 'Request #4 → Server 4 (last server)', target: 3 },
            { text: 'Request #5 → Server 1 (back to start)', target: 0 },
            { text: 'Request #6 → Server 2 (cycle repeats)', target: 1 }
        ]
    },
    'least-conn': {
        title: 'Least Connections Algorithm',
        algo: 'Least Connections',
        servers: [
            { id: 's1', name: 'Server 1', load: 20, healthy: true },
            { id: 's2', name: 'Server 2', load: 60, healthy: true },
            { id: 's3', name: 'Server 3', load: 10, healthy: true },
            { id: 's4', name: 'Server 4', load: 40, healthy: true }
        ],
        steps: [
            { text: 'Request arrives — check active connections', target: null },
            { text: 'Server 3 has fewest connections (10)', target: 2, highlight: true },
            { text: 'Route request to Server 3', target: 2 },
            { text: 'Server 3 load increases (10 → 25)', target: 2 },
            { text: 'Next request — Server 1 now has least (20)', target: 0, highlight: true },
            { text: 'Dynamically balances based on active sessions', target: null }
        ]
    },
    'weighted': {
        title: 'Weighted Round Robin',
        algo: 'Weighted RR',
        servers: [
            { id: 's1', name: 'Server 1', load: 30, healthy: true, weight: 1 },
            { id: 's2', name: 'Server 2', load: 60, healthy: true, weight: 2 },
            { id: 's3', name: 'Server 3', load: 70, healthy: true, weight: 3 },
            { id: 's4', name: 'Server 4', load: 80, healthy: true, weight: 4 }
        ],
        steps: [
            { text: 'Server 4 has weight=4 (most powerful)', target: 3, highlight: true },
            { text: 'Server 4 receives 4 out of 10 requests', target: 3 },
            { text: 'Server 3 has weight=3 → 3/10 requests', target: 2 },
            { text: 'Server 2 has weight=2 → 2/10 requests', target: 1 },
            { text: 'Server 1 has weight=1 → 1/10 requests', target: 0 },
            { text: 'More powerful servers handle more traffic', target: null }
        ]
    },
    'health': {
        title: 'Health Check & Failover',
        algo: 'Active Health',
        servers: [
            { id: 's1', name: 'Server 1', load: 40, healthy: true },
            { id: 's2', name: 'Server 2', load: 30, healthy: true },
            { id: 's3', name: 'Server 3', load: 0, healthy: false },
            { id: 's4', name: 'Server 4', load: 50, healthy: true }
        ],
        steps: [
            { text: 'LB sends health check probe to all servers', target: null },
            { text: 'Server 3 fails health check (timeout/500 error)', target: 2, unhealthy: true },
            { text: 'LB marks Server 3 as unhealthy — remove from pool', target: 2, unhealthy: true },
            { text: 'Incoming requests skip Server 3', target: null },
            { text: 'Traffic distributed only to healthy servers (1,2,4)', target: [0, 1, 3] },
            { text: 'LB continues probing — auto-recovers when healthy', target: null }
        ]
    }
};

const COMPARISON = [
    { name: "Round Robin", complexity: 1, session: false, loadAware: false, bestFor: "Stateless apps, equal servers" },
    { name: "Least Connections", complexity: 3, session: false, loadAware: true, bestFor: "Long-lived connections, WebSockets" },
    { name: "Weighted Round Robin", complexity: 2, session: false, loadAware: true, bestFor: "Mixed hardware, different specs" },
    { name: "IP Hash", complexity: 2, session: true, loadAware: false, bestFor: "Stateful apps, session caching" },
    { name: "Least Response Time", complexity: 4, session: false, loadAware: true, bestFor: "Performance-critical, geo-distributed" },
    { name: "Consistent Hashing", complexity: 5, session: true, loadAware: false, bestFor: "Distributed caches, CDN routing" },
];

const RESOURCES = [
    { title: "System Design Primer - Load Balancing", type: "youtube", url: "https://www.youtube.com/watch?v=K0Ta65OqQkY" },
    { title: "NGINX Load Balancing Guide", type: "web", url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/" },
    { title: "AWS ELB Documentation", type: "web", url: "https://aws.amazon.com/elasticloadbalancing/" },
    { title: "Grokking System Design Interview", type: "course", url: "https://www.educative.io/courses/grokking-the-system-design-interview" },
];

const LAYERS = [
    {
        id: 'L4',
        title: 'Layer 4 (Transport)',
        subtitle: 'TCP/UDP • IP + PORT BASED',
        color: 'var(--cyan)',
        features: [
            { icon: '⚡', text: 'Fast — Routes based on IP:Port' },
            { icon: '🔒', text: 'Protocol Agnostic — Any TCP/UDP app' },
            { icon: '📦', text: 'Lower Overhead — No SSL termination' },
            { icon: '🎯', text: 'Connection-Based Routing' }
        ],
        useCases: 'High-throughput, DBs, gaming, VoIP'
    },
    {
        id: 'L7',
        title: 'Layer 7 (Application)',
        subtitle: 'HTTP/HTTPS • CONTENT-AWARE',
        color: 'var(--purple)',
        features: [
            { icon: '🔍', text: 'Content-Based — URL, headers, cookies' },
            { icon: '🛡️', text: 'SSL Termination — Decrypt & inspect' },
            { icon: '🎨', text: 'Advanced — Caching, compression, WAF' },
            { icon: '📊', text: 'Request-Based Routing' }
        ],
        useCases: 'Microservices, A/B testing, API gateways'
    }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function LoadBalancingGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('round-robin');

    // Animation State
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [requestCount, setRequestCount] = useState(0);
    const [lbActive, setLbActive] = useState(false);

    // Current server state (cloned from pattern initially, but we might animate it)
    // For simplicity, we'll derive visual state from step index + base data
    // But we need to highlight specific servers based on the step.

    const animRef = useRef<NodeJS.Timeout[]>([]);

    const scheduleStep = useCallback((step: Step, i: number, stepTime: number) => {
        const t = setTimeout(() => {
            setLbActive(true);
            setCurrentStepIdx(i);

            if (step.target !== null && step.target !== undefined && !step.unhealthy) {
                setRequestCount(prev => prev + 1);
            }

            // Reset LB active after a short bit for pulse effect
            const tReset = setTimeout(() => {
                setLbActive(false);
            }, 800);
            if (animRef.current) animRef.current.push(tReset);

        }, i * stepTime);
        if (animRef.current) animRef.current.push(t);
    }, []);

    const playPattern = useCallback((patternKey: string) => {
        // Clear existing
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActivePatternKey(patternKey);
        setCurrentStepIdx(-1);
        setLbActive(false);
        setRequestCount(0); // Always reset count when starting a pattern

        const pattern = FLOW_PATTERNS[patternKey];
        const stepTime = 1800 * animationSpeed;

        pattern.steps.forEach((step, i) => {
            scheduleStep(step, i, stepTime);
        });

    }, [animationSpeed, scheduleStep]);

    useEffect(() => {
        // Auto-play on mount
        const t = setTimeout(() => playPattern('round-robin'), 500);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
        setRequestCount(0);
    };

    const activePattern = FLOW_PATTERNS[activePatternKey];

    return (
        <GuideLayout
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ ALGORITHMS GRID ═══════════════ */}
            <h2 className="section-title">Load Balancing Algorithms</h2>
            <div className="lb-grid">
                {/* Round Robin */}
                <div className="viz-card lb-card card-pink">
                    <div className="lb-card-header">
                        <div className="lb-card-icon">🔄</div>
                        <div className="lb-card-name">Round Robin</div>
                    </div>
                    <p className="lb-card-desc">Requests distributed in fixed circular order. Perfect for identical backend servers.</p>
                    <div className="lb-card-stats">
                        <span className="lb-stat-chip hi">Simplicity</span>
                        <span className="lb-stat-chip">Stateless</span>
                    </div>
                    <div className="lb-use-case"><strong>Use case:</strong> Simple APIs, mirrored web servers</div>
                </div>

                {/* Least Connections */}
                <div className="viz-card lb-card card-purple">
                    <div className="lb-card-header">
                        <div className="lb-card-icon">📉</div>
                        <div className="lb-card-name">Least Connections</div>
                    </div>
                    <p className="lb-card-desc">Routes to the server with fewest active requests. Ideal for long-lived connections.</p>
                    <div className="lb-card-stats">
                        <span className="lb-stat-chip hi">Adaptive</span>
                        <span className="lb-stat-chip">WebSocket</span>
                    </div>
                    <div className="lb-use-case"><strong>Use case:</strong> Database pools, long-poll APIs</div>
                </div>

                {/* Weighted RR */}
                <div className="viz-card lb-card card-cyan">
                    <div className="lb-card-header">
                        <div className="lb-card-icon">⚖️</div>
                        <div className="lb-card-name">Weighted Round Robin</div>
                    </div>
                    <p className="lb-card-desc">Assigns more traffic to powerful servers. Distributes by capacity weight index.</p>
                    <div className="lb-card-stats">
                        <span className="lb-stat-chip hi">Hybrid Pool</span>
                        <span className="lb-stat-chip">Capacity</span>
                    </div>
                    <div className="lb-use-case"><strong>Use case:</strong> Mixing old and new hardware</div>
                </div>

                {/* IP Hash */}
                <div className="viz-card lb-card card-blue">
                    <div className="lb-card-header">
                        <div className="lb-card-icon">🔑</div>
                        <div className="lb-card-name">IP Hash / Sticky</div>
                    </div>
                    <p className="lb-card-desc">Client IP determines server mapping. Ensures same user visits same server (Sticky Session).</p>
                    <div className="lb-card-stats">
                        <span className="lb-stat-chip hi">Affinity</span>
                        <span className="lb-stat-chip">Session</span>
                    </div>
                    <div className="lb-use-case"><strong>Use case:</strong> Caching, session-based auth</div>
                </div>

                {/* Least Response Time */}
                <div className="viz-card lb-card card-green">
                    <div className="lb-card-header">
                        <div className="lb-card-icon">⚡</div>
                        <div className="lb-card-name">Least Response Time</div>
                    </div>
                    <p className="lb-card-desc">Routes to server with lowest latency and fewest connections. Performance-aware.</p>
                    <div className="lb-card-stats">
                        <span className="lb-stat-chip hi">Performance</span>
                        <span className="lb-stat-chip">Latency</span>
                    </div>
                    <div className="lb-use-case"><strong>Use case:</strong> Geo-distributed, latency-sensitive</div>
                </div>

                {/* Consistent Hashing */}
                <div className="viz-card lb-card card-orange">
                    <div className="lb-card-header">
                        <div className="lb-card-icon">🎯</div>
                        <div className="lb-card-name">Consistent Hashing</div>
                    </div>
                    <p className="lb-card-desc">Hash ring algorithm. Only affected keys remapped when servers change. Minimal cache invalidation.</p>
                    <div className="lb-card-stats">
                        <span className="lb-stat-chip hi">Scalable</span>
                        <span className="lb-stat-chip">Caching</span>
                    </div>
                    <div className="lb-use-case"><strong>Use case:</strong> Distributed caches, CDNs</div>
                </div>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Traffic Distribution in Action</h2>
                <p className="viz-section-hint">Visualize how requests are routed in real-time</p>
            </div>

            <div className="lb-flow-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div className="lb-flow-controls" style={{ marginBottom: 0 }}>
                        {Object.keys(FLOW_PATTERNS).map(key => (
                            <button
                                key={key}
                                className={`lb-flow-btn ${activePatternKey === key ? 'active' : ''}`}
                                onClick={() => playPattern(key)}
                            >
                                {FLOW_PATTERNS[key].algo}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid var(--border2)',
                            background: 'var(--surface)',
                            color: 'var(--text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all .2s'
                        }}
                        className="social-btn"
                        aria-label="Settings"
                    >
                        <Settings size={14} />
                    </button>
                </div>

                <div className="lb-flow-diagram">
                    <h3 className="lb-flow-title">{activePattern.title}</h3>

                    {/* Client */}
                    <div className="lb-client-section">
                        <div className="lb-client-node">👥 Clients</div>
                        <div className="lb-client-label">Multiple incoming requests</div>
                    </div>

                    <div className="lb-arrow-down">▼</div>

                    {/* LB */}
                    <div className="lb-section">
                        <div className={`lb-node ${lbActive ? 'active' : ''}`}>
                            <span>⚖️ Load Balancer</span>
                            <span className="lb-algo">{activePattern.algo}</span>
                        </div>
                        <div className="lb-label">Nginx / HAProxy / ELB</div>
                    </div>

                    <div className="lb-arrow-down">▼</div>

                    {/* Server Pool */}
                    <div className="lb-server-pool">
                        {activePattern.servers.map((server, idx) => (
                            <ServerNodeDisplay
                                key={server.id}
                                server={server}
                                step={currentStepIdx >= 0 ? activePattern.steps[currentStepIdx] : null}
                                idx={idx}
                            />
                        ))}
                    </div>

                    {/* Counter */}
                    <div className="lb-request-counter">
                        <div>Requests processed: <span className="lb-counter-value">{requestCount}</span></div>
                    </div>

                    {/* Steps Overlay / List */}
                    <div className="lb-flow-steps">
                        {activePattern.steps.map((step, i) => (
                            <div key={step.text} className={`lb-step ${currentStepIdx === i ? 'active' : ''}`}>
                                <div className="lb-step-num">{i + 1}</div>
                                <div className="lb-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="lb-legend">
                    <div className="lb-legend-item">
                        <div className="lb-legend-box leg-healthy"></div> Healthy
                    </div>
                    <div className="lb-legend-item">
                        <div className="lb-legend-box leg-unhealthy"></div> Unhealthy
                    </div>
                    <div className="lb-legend-item">
                        <div className="lb-legend-box leg-active"></div> Active
                    </div>
                    <div className="lb-legend-item">
                        <div className="lb-legend-box leg-processing"></div> Processing
                    </div>
                </div>

                <button className="lb-replay-btn" onClick={() => playPattern(activePatternKey)}>
                    ↺ Replay Animation
                </button>
            </div>

            {/* ═══════════════ L4 vs L7 ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Layer 4 vs Layer 7</h2>
                <p className="viz-section-hint">Transport layer vs Application layer routing</p>
            </div>

            <div className="lb-layer-comparison">
                {LAYERS.map(layer => (
                    <div key={layer.id} className="lb-layer-card" style={{ '--layer-color': layer.color } as React.CSSProperties}>
                        <div className="lb-layer-title">{layer.title}</div>
                        <div className="lb-layer-subtitle">{layer.subtitle}</div>

                        <div className="lb-layer-features">
                            {layer.features.map(f => (
                                <div key={f.text} className="lb-feature-item">
                                    <div className="lb-feature-icon">{f.icon}</div>
                                    <div>{f.text}</div>
                                </div>
                            ))}
                        </div>

                        <div className="lb-layer-usecases">
                            <strong>Use Cases:</strong> {layer.useCases}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ HEALTH CHECKS ═══════════════ */}
            <h2 className="section-title">Health Check Mechanisms</h2>
            <div className="lb-health-section">
                <div className="lb-health-title">How Load Balancers Detect Failures</div>
                <div className="lb-health-types">
                    <div className="lb-health-type" style={{ '--health-color': 'var(--green)' } as React.CSSProperties}>
                        <div className="lb-health-type-title">Passive Checks</div>
                        <div className="lb-health-type-desc">Monitor real traffic. Mark unhappy after N failed user requests.</div>
                    </div>
                    <div className="lb-health-type" style={{ '--health-color': 'var(--cyan)' } as React.CSSProperties}>
                        <div className="lb-health-type-title">Active Checks</div>
                        <div className="lb-health-type-desc">Periodic probes (HTTP GET /health). LB pings every X seconds.</div>
                    </div>
                    <div className="lb-health-type" style={{ '--health-color': 'var(--purple)' } as React.CSSProperties}>
                        <div className="lb-health-type-title">Deep Checks</div>
                        <div className="lb-health-type-desc">App-aware. Verify DB & Cache connections before 200 OK.</div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Algorithm Comparison</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Algorithm</th>
                            <th>Complexity</th>
                            <th>Session Affinity</th>
                            <th>Load Aware</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.complexity} /></td>
                                <td>{row.session ? <span className="lb-check">✓ Yes</span> : <span className="lb-cross">✗ No</span>}</td>
                                <td>{row.loadAware ? <span className="lb-check">✓ Yes</span> : <span className="lb-cross">✗ No</span>}</td>
                                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{row.bestFor}</td>
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

// ════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════

function ServerNodeDisplay({ server, step, idx }: Readonly<{ server: ServerNode, step: Step | null, idx: number }>) {
    // Calculate visual state based on current step
    let className = `lb-server-node`;
    let healthy = server.healthy;

    // Check if this server is targeted by the step
    const isTarget = step?.target !== null && (Array.isArray(step?.target) ? step?.target.includes(idx) : step?.target === idx);

    if (isTarget) {
        if (step?.unhealthy) {
            className += ' unhealthy';
            healthy = false; // Force visual healthy state to false if step says so
        } else {
            className += step?.highlight ? ' processing' : ' active';
        }
    } else {
        className += healthy ? ' healthy' : ' unhealthy';
    }

    // Dynamic load simulation (visual only)
    let load = server.load;
    if (activeAndHealth(isTarget, healthy) && !step?.highlight) {
        // Just for visual effect, bump load slightly when active
    }

    return (
        <div className={className} id={server.id}>
            {server.name}
            {server.weight && <div style={{ fontSize: '.6rem', color: 'var(--text-dim)', marginTop: '.2rem' }}>weight: {server.weight}</div>}
            <div className="lb-server-load">{load}% load</div>
            <div className="lb-load-bar">
                <div className="lb-load-fill" style={{ width: `${load}%` }}></div>
            </div>
        </div>
    );
}

function activeAndHealth(isTarget: boolean, healthy: boolean) {
    return isTarget && healthy;
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="lb-rating">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`lb-dot ${i <= dots ? 'on' : ''}`} />
            ))}
        </div>
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

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Settings, Youtube, Globe, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/system-design/client-server-architecture.css';

const guide = guidesData.guides.find(v => v.id === "client-server-architecture")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type NodeState = 'idle' | 'active' | 'processing' | 'success' | 'error';

type Step = {
    text: string;
    nodeStates: Record<string, NodeState>;
    conn1?: 'fwd' | 'bwd' | 'green' | null;
    conn2?: 'fwd' | 'bwd' | 'green' | null;
    badge?: { node: string; text: string; color: 'cyan' | 'purple' | 'green' };
};

type Pattern = {
    title: string;
    label: string;
    steps: Step[];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'http-request': {
        title: 'HTTP Request-Response Cycle',
        label: 'HTTP Request',
        steps: [
            {
                text: 'User enters a URL — the browser (client) prepares an HTTP GET request',
                nodeStates: { client: 'active', internet: 'idle', server: 'idle' },
                conn1: null, conn2: null,
                badge: { node: 'client', text: 'GET /home', color: 'cyan' }
            },
            {
                text: 'HTTP request travels over the network to the server',
                nodeStates: { client: 'active', internet: 'active', server: 'idle' },
                conn1: 'fwd', conn2: null
            },
            {
                text: 'Request reaches the server — server processes it (reads DB, renders HTML)',
                nodeStates: { client: 'idle', internet: 'idle', server: 'processing' },
                conn1: 'fwd', conn2: 'fwd',
                badge: { node: 'server', text: 'Processing…', color: 'purple' }
            },
            {
                text: 'Server sends back HTTP 200 OK with the HTML content',
                nodeStates: { client: 'idle', internet: 'active', server: 'success' },
                conn1: 'bwd', conn2: 'bwd',
                badge: { node: 'server', text: '200 OK', color: 'green' }
            },
            {
                text: 'Browser receives response and renders the page — cycle complete!',
                nodeStates: { client: 'success', internet: 'idle', server: 'idle' },
                conn1: null, conn2: null,
                badge: { node: 'client', text: 'Page Loaded', color: 'green' }
            }
        ]
    },
    'rest-api': {
        title: 'REST API Call with Authentication',
        label: 'REST API',
        steps: [
            {
                text: 'Mobile app sends POST /login with credentials (HTTPS encrypted)',
                nodeStates: { client: 'active', internet: 'idle', server: 'idle' },
                conn1: null, conn2: null,
                badge: { node: 'client', text: 'POST /login', color: 'cyan' }
            },
            {
                text: 'Request traverses the internet over TLS-encrypted connection',
                nodeStates: { client: 'active', internet: 'active', server: 'idle' },
                conn1: 'fwd', conn2: 'fwd'
            },
            {
                text: 'API Server validates credentials against the database',
                nodeStates: { client: 'idle', internet: 'idle', server: 'processing' },
                badge: { node: 'server', text: 'Auth Check', color: 'purple' }
            },
            {
                text: 'Server returns 200 OK with a signed JWT token in JSON body',
                nodeStates: { client: 'idle', internet: 'active', server: 'success' },
                conn1: 'bwd', conn2: 'bwd',
                badge: { node: 'server', text: 'JWT Issued', color: 'green' }
            },
            {
                text: 'Client stores the token and uses it for all future API calls',
                nodeStates: { client: 'success', internet: 'idle', server: 'idle' },
                badge: { node: 'client', text: 'Token Saved', color: 'green' }
            }
        ]
    },
    'websocket': {
        title: 'WebSocket — Persistent Bidirectional Connection',
        label: 'WebSocket',
        steps: [
            {
                text: 'Client sends HTTP Upgrade request to establish WebSocket connection',
                nodeStates: { client: 'active', internet: 'idle', server: 'idle' },
                conn1: 'fwd', conn2: null,
                badge: { node: 'client', text: 'WS Upgrade', color: 'cyan' }
            },
            {
                text: 'Server acknowledges — connection upgraded from HTTP to WebSocket',
                nodeStates: { client: 'idle', internet: 'active', server: 'active' },
                conn1: null, conn2: 'fwd',
                badge: { node: 'server', text: '101 Switching', color: 'purple' }
            },
            {
                text: 'Persistent tunnel established — both ends can now send messages freely',
                nodeStates: { client: 'active', internet: 'active', server: 'active' },
                conn1: 'fwd', conn2: 'fwd',
                badge: { node: 'internet', text: 'Tunnel Open', color: 'green' }
            },
            {
                text: 'Server pushes a real-time event (e.g., new chat message) without any client request',
                nodeStates: { client: 'idle', internet: 'active', server: 'success' },
                conn1: 'bwd', conn2: 'bwd',
                badge: { node: 'server', text: 'Push Event', color: 'cyan' }
            },
            {
                text: 'Client receives the push instantly — no polling, zero latency overhead',
                nodeStates: { client: 'success', internet: 'idle', server: 'idle' },
                badge: { node: 'client', text: 'Received!', color: 'green' }
            }
        ]
    },
    'cache': {
        title: 'Cache-First Strategy',
        label: 'Caching',
        steps: [
            {
                text: 'Client requests a resource (e.g., user profile data)',
                nodeStates: { client: 'active', internet: 'idle', server: 'idle' },
                badge: { node: 'client', text: 'GET /profile', color: 'cyan' }
            },
            {
                text: 'Request hits the cache layer (Redis / CDN edge node) first',
                nodeStates: { client: 'idle', internet: 'active', server: 'idle' },
                conn1: 'fwd',
                badge: { node: 'internet', text: 'Cache Check', color: 'purple' }
            },
            {
                text: 'CACHE HIT — valid cached response found (TTL not expired)',
                nodeStates: { client: 'idle', internet: 'success', server: 'idle' },
                badge: { node: 'internet', text: '✓ Cache Hit!', color: 'green' }
            },
            {
                text: 'Response returned directly from cache — origin server never queried',
                nodeStates: { client: 'success', internet: 'idle', server: 'idle' },
                conn1: 'bwd',
                badge: { node: 'client', text: 'Fast Response', color: 'green' }
            },
            {
                text: 'Result: ~10x faster response time, drastically reduced server load',
                nodeStates: { client: 'success', internet: 'idle', server: 'idle' },
                badge: { node: 'client', text: 'Latency ↓↓', color: 'green' }
            }
        ]
    }
};

const COMPARISON = [
    { name: 'HTTP/REST', protocol: 'Stateless', direction: 'Request-Response', latency: 2, useCase: 'Web APIs, CRUD' },
    { name: 'WebSocket', protocol: 'Stateful', direction: 'Bidirectional', latency: 1, useCase: 'Chat, Live Data' },
    { name: 'GraphQL', protocol: 'Stateless', direction: 'Query-Based', latency: 2, useCase: 'Flexible APIs' },
    { name: 'gRPC', protocol: 'Stateful', direction: 'Bidirectional', latency: 1, useCase: 'Microservices' },
];

const TABLE_FEATURES = [
    { feature: 'Initiated by', client: 'Client (always)', server: 'Server (push only with WS)' },
    { feature: 'Connection lifetime', client: 'Short (per request)', server: 'Can be long-lived (WS)' },
    { feature: 'State ownership', client: 'UI state, tokens', server: 'Sessions, DB, business logic' },
    { feature: 'Security concern', client: 'XSS, token theft', server: 'SQL injection, DDoS' },
    { feature: 'Scalability role', client: 'Stateless (easy to scale)', server: 'Bottleneck (needs strategies)' },
];

const RESOURCES = [
    { title: 'Client-Server Model — MDN Web Docs', type: 'web', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview' },
    { title: 'HTTP Overview — MDN Web Docs', type: 'web', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview' },
    { title: 'WebSockets API — MDN Web Docs', type: 'web', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
    { title: 'REST API Design Best Practices — freeCodeCamp', type: 'web', url: 'https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/' },
    { title: 'Client Server Architecture Explained', type: 'youtube', url: 'https://www.youtube.com/watch?v=L5BlpPU_muY' },
    { title: 'How the Web Works — HTTP & Browsers', type: 'youtube', url: 'https://www.youtube.com/watch?v=hJHvdBlSxug' },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function ClientServerArchitectureGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('http-request');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const playPattern = useCallback((key: string) => {
        setActivePatternKey(key);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    // Progressive animation loop
    useEffect(() => {
        if (!isPlaying) return;

        const pattern = FLOW_PATTERNS[activePatternKey];
        const stepTime = 2000 * animationSpeed;

        if (currentStepIdx < pattern.steps.length - 1) {
            const delay = currentStepIdx === -1 ? 500 : stepTime;
            const t = setTimeout(() => setCurrentStepIdx(i => i + 1), delay);
            return () => clearTimeout(t);
        } else {
            setIsPlaying(false);
        }
    }, [currentStepIdx, isPlaying, activePatternKey, animationSpeed]);

    const activePattern = FLOW_PATTERNS[activePatternKey];
    const currentStep = currentStepIdx >= 0 ? activePattern.steps[currentStepIdx] : null;

    const nodeState = (id: string): NodeState =>
        currentStep?.nodeStates[id] ?? 'idle';

    const handleCardClick = (key: string) => {
        const el = document.getElementById('csa-flow-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        playPattern(key);
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/system-design/ClientServerArchitectureGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            tags={guide.tags}
            primaryColor={guide.colorConfig.primary}
            onReplay={() => playPattern(activePatternKey)}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPT GRID ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="guide-concept-grid">
                <div className="guide-concept-card" onClick={() => handleCardClick('http-request')}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🌐</div>
                        <div className="guide-concept-name">Client-Server Model</div>
                    </div>
                    <p className="guide-concept-desc">
                        A distributed architecture where <strong>clients</strong> initiate requests and
                        <strong> servers</strong> listen and respond. Every web page load, API call, or app interaction follows this model.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Foundational</span>
                        <span className="guide-concept-chip">Request-Response</span>
                    </div>
                    <div className="csa-use-case"><strong>Examples:</strong> Web browsers, mobile apps, IoT devices.</div>
                </div>

                <div className="guide-concept-card" onClick={() => handleCardClick('http-request')}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">📡</div>
                        <div className="guide-concept-name">HTTP Request-Response</div>
                    </div>
                    <p className="guide-concept-desc">
                        The backbone of the web. A <strong>stateless</strong> protocol where the client sends a method
                        (GET, POST, PUT, DELETE), the server processes it, and returns a status code + body.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Stateless</span>
                        <span className="guide-concept-chip">HTTP/HTTPS</span>
                    </div>
                    <div className="csa-use-case"><strong>Standard:</strong> REST APIs, web pages, file downloads.</div>
                </div>

                <div className="guide-concept-card" onClick={() => handleCardClick('rest-api')}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🔑</div>
                        <div className="guide-concept-name">REST API Design</div>
                    </div>
                    <p className="guide-concept-desc">
                        REST (Representational State Transfer) defines a uniform interface for client-server communication.
                        Resources are identified by URLs, actions by HTTP verbs, and responses in JSON/XML.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">JSON</span>
                        <span className="guide-concept-chip">CRUD</span>
                    </div>
                    <div className="csa-use-case"><strong>Tools:</strong> Express.js, FastAPI, Spring Boot.</div>
                </div>

                <div className="guide-concept-card" onClick={() => handleCardClick('websocket')}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">⚡</div>
                        <div className="guide-concept-name">WebSocket (Real-Time)</div>
                    </div>
                    <p className="guide-concept-desc">
                        Upgrades HTTP to a <strong>persistent, bidirectional</strong> connection. The server can push data to the client at any time — no polling required.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Stateful</span>
                        <span className="guide-concept-chip">Bidirectional</span>
                    </div>
                    <div className="csa-use-case"><strong>Use cases:</strong> Chat apps, live dashboards, multiplayer games.</div>
                </div>

                <div className="guide-concept-card" onClick={() => handleCardClick('cache')}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🗄️</div>
                        <div className="guide-concept-name">Caching Layer</div>
                    </div>
                    <p className="guide-concept-desc">
                        A cache sits between client and server to store frequent responses. On a
                        <strong> cache hit</strong>, the origin server is bypassed entirely — slashing latency and cost.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Performance</span>
                        <span className="guide-concept-chip">CDN / Redis</span>
                    </div>
                    <div className="csa-use-case"><strong>Benefit:</strong> Up to 10x faster responses at scale.</div>
                </div>

                <div className="guide-concept-card">
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🔒</div>
                        <div className="guide-concept-name">Security & HTTPS</div>
                    </div>
                    <p className="guide-concept-desc">
                        All modern client-server communication should use <strong>TLS (HTTPS)</strong> to encrypt data in transit.
                        Authentication (JWTs, sessions) controls who can access server resources.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">TLS/SSL</span>
                        <span className="guide-concept-chip">Auth</span>
                    </div>
                    <div className="csa-use-case"><strong>Key concepts:</strong> HTTPS, CORS, JWT, OAuth 2.0.</div>
                </div>
            </div>

            {/* ═══════════════ MERMAID ═══════════════ */}
            <h2 className="section-title">Architecture Overview</h2>
            <div className="csa-mermaid-wrap">
                <pre className="mermaid">
                    {`
                    flowchart LR
                        C["Client\n(Browser / App)"]
                        N["Network\n(Internet / TLS)"]
                        S["Server\n(API / Origin)"]
                        D["Database"]

                        C -->|"HTTP Request"| N
                        N -->|"Forward"| S
                        S -->|"Query"| D
                        D -->|"Rows"| S
                        S -->|"HTTP 200 + JSON"| N
                        N -->|"Response"| C

                        style C fill:#12161f,stroke:#00b0ff,color:#fff
                        style N fill:#0d1117,stroke:#7c4dff,color:#aaa
                        style S fill:#12161f,stroke:#1de9b6,color:#fff
                        style D fill:#0d1117,stroke:#ff9100,color:#fff
                    `}
                </pre>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Live Request Simulation</h2>
                <p className="viz-section-hint">Select a pattern to watch how data flows between client and server</p>
            </div>

            <div className="csa-flow-section" id="csa-flow-section">
                <div className="csa-flow-controls-row">
                    <div className="csa-flow-controls">
                        {Object.keys(FLOW_PATTERNS).map(key => (
                            <button
                                key={key}
                                className={`csa-flow-btn ${activePatternKey === key ? 'active' : ''}`}
                                onClick={() => playPattern(key)}
                            >
                                {FLOW_PATTERNS[key].label}
                            </button>
                        ))}
                    </div>

                    {/* Playback Controls */}
                    <div className="csa-playback-controls">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`csa-ctrl-btn ${isPlaying ? 'playing' : ''}`}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={() => playPattern(activePatternKey)}
                            className="csa-ctrl-btn"
                            title="Replay"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <div className="csa-ctrl-divider" />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="csa-ctrl-btn"
                            title="Settings"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>

                <div className="csa-diagram">
                    <div className="csa-diagram-header">
                        <div className="csa-diagram-title">{activePattern.title}</div>
                        <div className="csa-diagram-subtitle">
                            {currentStepIdx >= 0
                                ? activePattern.steps[currentStepIdx].text
                                : 'Press Play to start the simulation'}
                        </div>
                    </div>

                    <div className="csa-nodes-row">
                        {/* CLIENT NODE */}
                        <CsaNode id="client" state={nodeState('client')}>
                            {currentStep?.badge?.node === 'client' && (
                                <div className={`csa-node-badge ${currentStep.badge.color}`}>
                                    {currentStep.badge.text}
                                </div>
                            )}
                            <div className="csa-node-emoji">💻</div>
                            <div className="csa-node-label">Client</div>
                            <div className="csa-node-sublabel">Browser / App</div>
                        </CsaNode>

                        {/* CONN 1: client ↔ network */}
                        <div className={`csa-connection ${connClass(currentStep?.conn1)}`}>
                            {currentStep?.conn1 && (
                                <div className={`csa-packet ${currentStep.conn1 === 'bwd' ? 'bwd' : currentStep.conn1 === 'green' ? 'green' : 'fwd'}`} />
                            )}
                        </div>

                        {/* NETWORK / CACHE NODE */}
                        <CsaNode id="internet" state={nodeState('internet')}>
                            {currentStep?.badge?.node === 'internet' && (
                                <div className={`csa-node-badge ${currentStep.badge.color}`}>
                                    {currentStep.badge.text}
                                </div>
                            )}
                            <div className="csa-node-emoji">🌐</div>
                            <div className="csa-node-label">Network</div>
                            <div className="csa-node-sublabel">Internet / Cache</div>
                        </CsaNode>

                        {/* CONN 2: network ↔ server */}
                        <div className={`csa-connection ${connClass(currentStep?.conn2)}`}>
                            {currentStep?.conn2 && (
                                <div className={`csa-packet ${currentStep.conn2 === 'bwd' ? 'bwd' : currentStep.conn2 === 'green' ? 'green' : 'fwd'}`} />
                            )}
                        </div>

                        {/* SERVER NODE */}
                        <CsaNode id="server" state={nodeState('server')}>
                            {currentStep?.badge?.node === 'server' && (
                                <div className={`csa-node-badge ${currentStep.badge.color}`}>
                                    {currentStep.badge.text}
                                </div>
                            )}
                            <div className="csa-node-emoji">🖧</div>
                            <div className="csa-node-label">Server</div>
                            <div className="csa-node-sublabel">API / Origin</div>
                        </CsaNode>
                    </div>

                    {/* Progress Block */}
                    <div className="csa-progress-block">
                        <div className="csa-progress-row">
                            <div className="csa-step-text">
                                {currentStepIdx >= 0
                                    ? activePattern.steps[currentStepIdx].text
                                    : 'Get started by playing the simulation'}
                            </div>
                            <div className="csa-step-counter">
                                {Math.max(0, currentStepIdx + 1)} / {activePattern.steps.length}
                            </div>
                        </div>
                        <div className="csa-bar-wrap">
                            <div
                                className="csa-bar-fill"
                                style={{ width: `${((Math.max(0, currentStepIdx + 1)) / activePattern.steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Protocol Comparison</h2>
                <p className="viz-section-hint">Choosing the right communication protocol for your use case</p>
            </div>

            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Protocol</th>
                            <th>Latency</th>
                            <th>State</th>
                            <th>Direction</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.latency} /></td>
                                <td>{row.protocol}</td>
                                <td>{row.direction}</td>
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
                            <th>Client</th>
                            <th>Server</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TABLE_FEATURES.map(row => (
                            <tr key={row.feature}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{row.feature}</td>
                                <td>{row.client}</td>
                                <td>{row.server}</td>
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
                        {RESOURCES.map(res => (
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
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            color: '#00b0ff', textDecoration: 'none',
                                            fontSize: '0.9rem', fontWeight: 600, transition: 'opacity 0.2s'
                                        }}
                                        onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
                                        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
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

function CsaNode({ id, state, children }: { id: string; state: NodeState; children: React.ReactNode }) {
    return (
        <div id={id} className={`csa-node ${state !== 'idle' ? state : ''}`}>
            {children}
        </div>
    );
}

function connClass(conn?: 'fwd' | 'bwd' | 'green' | null) {
    if (!conn) return '';
    if (conn === 'bwd') return 'lit-back';
    if (conn === 'green') return 'lit-green';
    return 'lit';
}

function Rating({ dots }: { dots: number }) {
    return (
        <div className="csa-rating">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`csa-dot ${i <= dots ? 'on' : ''}`} />
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

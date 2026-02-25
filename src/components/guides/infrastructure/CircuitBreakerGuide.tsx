"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/circuit-breaker.css';

const guide = guidesData.guides.find(v => v.id === "circuit-breaker")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    text: string;
    nodes: string[];
    active?: boolean;
    processing?: boolean;
    success?: boolean;
    error?: boolean;
    breakerState?: 'CLOSED' | 'OPEN' | 'HALF-OPEN';
};

type Pattern = {
    title: string;
    nodes: NodeDef[];
    steps: Step[];
};

type NodeDef = {
    id: string;
    label: string;
    icon?: string;
    isBreaker?: boolean;
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'closed-success': {
        title: 'Normal Operation (CLOSED State)',
        nodes: [
            { id: 'client', label: 'Client', icon: '💻' },
            { id: 'breaker', label: 'Circuit Breaker', icon: '⚡', isBreaker: true },
            { id: 'service', label: 'External Service', icon: '🌍' }
        ],
        steps: [
            { text: '1. Client sends request to API', nodes: ['client'], active: true, breakerState: 'CLOSED' },
            { text: '2. Circuit is CLOSED, request passes through', nodes: ['client', 'breaker'], active: true, breakerState: 'CLOSED' },
            { text: '3. Request reaches External Service', nodes: ['breaker', 'service'], processing: true, breakerState: 'CLOSED' },
            { text: '4. Service processes successfully (200 OK)', nodes: ['service'], success: true, breakerState: 'CLOSED' },
            { text: '5. Response returned to Client', nodes: ['client', 'breaker', 'service'], success: true, breakerState: 'CLOSED' }
        ]
    },
    'closed-failure': {
        title: 'Failures Triggering Circuit (CLOSED → OPEN)',
        nodes: [
            { id: 'client', label: 'Client', icon: '💻' },
            { id: 'breaker', label: 'Circuit Breaker', icon: '⚡', isBreaker: true },
            { id: 'service', label: 'External Service\n(Unhealthy)', icon: '🔥' }
        ],
        steps: [
            { text: '1. Client sends request', nodes: ['client'], active: true, breakerState: 'CLOSED' },
            { text: '2. Request passes to External Service', nodes: ['breaker', 'service'], processing: true, breakerState: 'CLOSED' },
            { text: '3. External Service times out / fails', nodes: ['service'], error: true, breakerState: 'CLOSED' },
            { text: '4. Breaker records failure (1/3)', nodes: ['breaker'], error: true, breakerState: 'CLOSED' },
            { text: '5. Successive failures reach threshold (3/3)', nodes: ['breaker'], error: true, breakerState: 'CLOSED' },
            { text: '6. Breaker trips to OPEN state', nodes: ['breaker'], error: true, breakerState: 'OPEN' }
        ]
    },
    'open-failfast': {
        title: 'Fail Fast (OPEN State)',
        nodes: [
            { id: 'client', label: 'Client', icon: '💻' },
            { id: 'breaker', label: 'Circuit Breaker', icon: '⚡', isBreaker: true },
            { id: 'service', label: 'External Service', icon: '🌍' }
        ],
        steps: [
            { text: '1. Client sends request', nodes: ['client'], active: true, breakerState: 'OPEN' },
            { text: '2. Breaker intercepts request (Circuit is OPEN)', nodes: ['breaker'], error: true, breakerState: 'OPEN' },
            { text: '3. Immediate fallback/error returned (Fail Fast)', nodes: ['client'], error: true, breakerState: 'OPEN' },
            { text: '✓ No resources wasted waiting on unhealthy service', nodes: [], success: true, breakerState: 'OPEN' }
        ]
    },
    'half-open-recovery': {
        title: 'Recovery (HALF-OPEN → CLOSED)',
        nodes: [
            { id: 'client', label: 'Client', icon: '💻' },
            { id: 'breaker', label: 'Circuit Breaker', icon: '⚡', isBreaker: true },
            { id: 'service', label: 'External Service\n(Recovered)', icon: '🌍' }
        ],
        steps: [
            { text: '1. Open timeout expires, breaker enters HALF-OPEN', nodes: ['breaker'], active: true, breakerState: 'HALF-OPEN' },
            { text: '2. Next client request is let through as a test', nodes: ['client', 'breaker'], active: true, breakerState: 'HALF-OPEN' },
            { text: '3. Request reaches External Service', nodes: ['breaker', 'service'], processing: true, breakerState: 'HALF-OPEN' },
            { text: '4. Service responds successfully (200 OK)', nodes: ['service'], success: true, breakerState: 'HALF-OPEN' },
            { text: '5. Breaker records success, resets and enters CLOSED', nodes: ['breaker'], success: true, breakerState: 'CLOSED' }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    'closed-success': 'Normal (Closed)',
    'closed-failure': 'Failures (Trip)',
    'open-failfast': 'Fail Fast (Open)',
    'half-open-recovery': 'Recovery (Half-Open)'
};

const PATTERNS = [
    {
        id: 'closed',
        title: "Closed State",
        icon: "🟢",
        colorClass: "card-cyan",
        description: "The default state. Requests flow freely to the external service. The circuit breaker monitors responses for errors or timeouts.",
        tags: [
            { text: "Pass-through", highlight: "highlight-cyan" },
            { text: "Monitoring", highlight: "" }
        ]
    },
    {
        id: 'open',
        title: "Open State",
        icon: "🔴",
        colorClass: "card-pink",
        description: "When the failure rate exceeds a threshold, the circuit trips. All requests immediately fail-fast or return a fallback, preventing cascading failures.",
        tags: [
            { text: "Fail-Fast", highlight: "highlight-pink" },
            { text: "Fallback", highlight: "" }
        ]
    },
    {
        id: 'half-open',
        title: "Half-Open State",
        icon: "🟡",
        colorClass: "card-orange",
        description: "After a timeout, the breaker tests the external service by allowing a limited number of requests. If they succeed, it closes; if they fail, it re-opens.",
        tags: [
            { text: "Recovery", highlight: "highlight-orange" },
            { text: "Testing", highlight: "" }
        ]
    }
];

const COMPARISON = [
    { name: "Timeouts", complexity: 1, cascadingPrevention: 2, recoverySpeed: 2, implementationApp: "API Gateway, Service Mesh, Code" },
    { name: "Retries w/ Backoff", complexity: 2, cascadingPrevention: 1, recoverySpeed: 3, implementationApp: "Code, Service Mesh" },
    { name: "Circuit Breaker", complexity: 4, cascadingPrevention: 5, recoverySpeed: 4, implementationApp: "Resilience4j, Istio" },
    { name: "Rate Limiting", complexity: 3, cascadingPrevention: 4, recoverySpeed: 4, implementationApp: "API Gateway, Redis" },
];

const KEY_CONCEPTS = [
    {
        title: "Failure Threshold",
        color: "var(--pink)",
        desc: "The percentage or absolute number of failures required to trip the circuit (e.g., 50% failure rate over a sliding window of 100 requests).",
        example: "Tip: Use sliding windows (count-based or time-based) to track failures accurately."
    },
    {
        title: "Wait Duration (Timeout)",
        color: "var(--orange)",
        desc: "The time the circuit stays OPEN before entering HALF-OPEN state to test recovery.",
        example: "Tip: Implement exponential backoff for the wait duration to avoid overwhelming slow-recovering services."
    },
    {
        title: "Fallbacks",
        color: "var(--cyan)",
        desc: "A graceful degradation strategy when the circuit is OPEN. instead of throwing an error, return cached data or a default value.",
        example: "Tip: E-commerce product recommendations can return generic 'bestsellers' if the custom recommendation service is down."
    }
];

const MERMAID_CHART = `flowchart TD
    C[🟢 CLOSED\nNormal Operation] -->|Failures > Threshold| O[🔴 OPEN\nFail Fast]
    O -->|Wait Duration Expires| H[🟡 HALF-OPEN\nTest Recovery]
    H -->|Test Success| C
    H -->|Test Failure| O

    classDef closed fill:#0f3a2b,stroke:#69f0ae,stroke-width:2px,color:#fff
    classDef open fill:#4a151b,stroke:#ff5252,stroke-width:2px,color:#fff
    classDef halfopen fill:#4d2d0c,stroke:#ff9100,stroke-width:2px,color:#fff
    class C closed
    class O open
    class H halfopen`;

const RESOURCES = [
    { title: "Circuit Breaker Pattern — Microsoft Docs", type: "web", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker" },
    { title: "Martin Fowler - Circuit Breaker", type: "web", url: "https://martinfowler.com/bliki/CircuitBreaker.html" },
    { title: "Resilience4j - Circuit Breaker", type: "web", url: "https://resilience4j.readme.io/docs/circuitbreaker" },
    { title: "System Design: Circuit Breaker", type: "youtube", url: "https://www.youtube.com/watch?v=ADHcBxEXvFA" }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function CircuitBreakerGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePattern, setActivePattern] = useState('closed-success');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playPattern = useCallback((patternKey: string) => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActivePattern(patternKey);
        setCurrentStepIdx(-1);

        const pattern = FLOW_PATTERNS[patternKey];
        const stepTime = 1600 * animationSpeed;

        pattern.steps.forEach((_, i) => {
            const t = setTimeout(() => {
                setCurrentStepIdx(i);
            }, i * stepTime);
            animRef.current.push(t);
        });
    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playPattern('closed-success'), 1500);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const handleCardClick = (patternId: string) => {
        const section = document.getElementById('action-section');
        section?.scrollIntoView({ behavior: 'smooth' });

        // Map card click to a pattern
        let patternToPlay = 'closed-success';
        if (patternId === 'open') patternToPlay = 'open-failfast';
        if (patternId === 'half-open') patternToPlay = 'half-open-recovery';

        setTimeout(() => playPattern(patternToPlay), 400);
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/infrastructure/CircuitBreakerGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ PATTERN GRID ═══════════════ */}
            <h2 className="section-title">Circuit Breaker States</h2>
            <div className="cb-grid">
                {PATTERNS.map((s) => (
                    <div
                        key={s.id}
                        className={`viz-card cb-card ${s.colorClass}`}
                        onClick={() => handleCardClick(s.id)}
                    >
                        <div className="cb-card-header">
                            <div className="cb-card-icon">{s.icon}</div>
                            <div className="cb-card-title">{s.title}</div>
                        </div>
                        <div className="cb-card-description">{s.description}</div>
                        <div className="cb-card-tags">
                            {s.tags.map(tag => (
                                <span key={tag.text} className={`cb-tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">State Transitions</h2>
                <p className="viz-section-hint">How a Circuit Breaker moves between states</p>
            </div>
            <div className="cb-mermaid-wrap">
                <pre className="mermaid">{MERMAID_CHART}</pre>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" id="action-section">
                <h2 className="viz-section-title">Interactive Operation Flow</h2>
                <p className="viz-section-hint">Explore the pattern with step-by-step animations</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="cb-flow-controls" style={{ marginBottom: 0 }}>
                    {Object.keys(FLOW_PATTERNS).map(key => (
                        <button
                            key={key}
                            className={`cb-tab-btn ${activePattern === key ? 'active' : ''}`}
                            onClick={() => playPattern(key)}
                        >
                            {TAB_LABELS[key]}
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
                <button
                    onClick={() => playPattern(activePattern)}
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
                    aria-label="Replay Animation"
                >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '-2px' }}>↺</span>
                </button>
            </div>

            <div className="cb-flow-diagram">
                <div className="cb-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : 'var(--cyan)'
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${FLOW_PATTERNS[activePattern].steps.length}`}
                </div>

                <h3 className="cb-flow-title">
                    {FLOW_PATTERNS[activePattern].title}
                </h3>

                <div className="cb-nodes">
                    {FLOW_PATTERNS[activePattern].nodes.map((node) => (
                        <CBNode
                            key={node.id}
                            node={node}
                            activeIdx={currentStepIdx}
                            pattern={activePattern}
                        />
                    ))}
                </div>

                <div className="flow-wrap" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {FLOW_PATTERNS[activePattern].steps.map((step, i) => (
                        <div key={step.text} className={`flow-step ${currentStepIdx >= i ? 'visible' : ''}`} style={{ opacity: currentStepIdx === i ? 1 : 0.4 }}>
                            <div className="step-num" style={{
                                borderColor: currentStepIdx === i ? 'var(--cyan)' : 'var(--border2)',
                                color: currentStepIdx === i ? 'var(--cyan)' : 'var(--text-dim)',
                                background: currentStepIdx === i ? 'rgba(0, 229, 255, 0.08)' : 'transparent'
                            }}>{i + 1}</div>
                            <div className="step-body" style={{
                                background: currentStepIdx === i ? 'rgba(0, 229, 255, 0.05)' : 'var(--dim)',
                                borderLeft: currentStepIdx === i ? '2px solid var(--cyan)' : '2px solid transparent'
                            }}>
                                <div className="step-desc" style={{ color: currentStepIdx === i ? 'var(--text-hi)' : 'var(--text-dim)' }}>{step.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cb-legend">
                <div className="cb-legend-item">
                    <div className="cb-legend-box leg-client"></div> Client
                </div>
                <div className="cb-legend-item">
                    <div className="cb-legend-box leg-breaker"></div> Circuit Breaker
                </div>
                <div className="cb-legend-item">
                    <div className="cb-legend-box leg-service"></div> Target Service
                </div>
            </div>

            {/* ═══════════════ KEY CONCEPTS ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Key Concepts</h2>
                <p className="viz-section-hint">Tuning criteria to fit your application's needs</p>
            </div>
            <div className="cb-concepts-grid">
                {KEY_CONCEPTS.map((c) => (
                    <div key={c.title} className="cb-concept-card" style={{ '--card-color': c.color } as React.CSSProperties}>
                        <div className="cb-concept-title">{c.title}</div>
                        <div className="cb-concept-desc">{c.desc}</div>
                        <div className="cb-concept-example">{c.example}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Resilience Patterns Comparison</h2>
                <p className="viz-section-hint">How different patterns handle failures in distributed systems</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Complexity</th>
                            <th>Cascading Prevention</th>
                            <th>Recovery Speed</th>
                            <th>Common Implementations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.complexity} /></td>
                                <td><Rating dots={row.cascadingPrevention} /></td>
                                <td><Rating dots={row.recoverySpeed} /></td>
                                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{row.implementationApp}</td>
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

function CBNode({ node, activeIdx, pattern }: Readonly<{ node: NodeDef, activeIdx: number, pattern: string }>) {
    const step = activeIdx >= 0 ? FLOW_PATTERNS[pattern].steps[activeIdx] : null;
    const isActive = step?.nodes.includes(node.id);
    const isProcessing = step?.processing && step?.nodes.includes(node.id);
    const isSuccess = step?.success && step?.nodes.includes(node.id);
    const isError = step?.error && step?.nodes.includes(node.id);

    let statusClass = '';
    if (isActive) statusClass = 'active';
    if (isProcessing) statusClass = 'processing';
    if (isSuccess) statusClass = 'success';
    if (isError) statusClass = 'error';

    // Determine current breaker state
    const breakerState = step?.breakerState || 'CLOSED'; // Default closed

    return (
        <div className="cb-node-container">
            <div className={`cb-node-box ${node.isBreaker ? 'breaker' : ''} ${statusClass}`}>
                <span style={{ fontSize: '1.8rem' }}>{node.icon}</span>
                {node.isBreaker && (
                    <div className={`cb-breaker-status ${breakerState.toLowerCase()}`}>
                        {breakerState}
                    </div>
                )}
            </div>
            <div className="cb-node-label" style={{ whiteSpace: 'pre-line' }}>{node.label}</div>
        </div>
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="cb-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`cb-dot ${i <= dots ? 'on' : ''}`} />
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

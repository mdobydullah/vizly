"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/async/event-driven-architecture.css';

const guide = guidesData.guides.find(v => v.id === "event-driven-architecture")!;

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
};

type Pattern = {
    title: string;
    nodes: NodeDef[];
    steps: Step[];
};

type NodeDef = {
    id: string;
    label: string;
    sublabel: string;
    isEventBus?: boolean;
    icon?: string;
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'pubsub': {
        title: 'Publish/Subscribe: Decouple Producers from Consumers',
        nodes: [
            { id: 'publisher', label: 'Publisher', sublabel: 'Order Service', icon: '📤' },
            { id: 'eventbus', label: 'Event Bus', sublabel: 'Kafka / SNS', isEventBus: true, icon: '⚡' },
            { id: 'sub1', label: 'Sub A', sublabel: 'Inventory', icon: '📦' },
            { id: 'sub2', label: 'Sub B', sublabel: 'Notifications', icon: '🔔' }
        ],
        steps: [
            { text: '1. Publisher emits "OrderCreated" event', nodes: ['publisher'], active: true },
            { text: '2. Event Bus receives and stores the event', nodes: ['publisher', 'eventbus'], active: true },
            { text: '3. Event Bus routes event to all subscribers', nodes: ['eventbus'], processing: true },
            { text: '4. Inventory service processes order event', nodes: ['eventbus', 'sub1'], processing: true },
            { text: '5. Notification service sends confirmation', nodes: ['eventbus', 'sub2'], processing: true },
            { text: '6. Both subscribers ACK independently', nodes: ['sub1', 'sub2'], success: true },
            { text: '✓ Loose coupling — Publisher never knows about subscribers', nodes: [], success: true }
        ]
    },
    'event-sourcing': {
        title: 'Event Sourcing: Persist State as Events',
        nodes: [
            { id: 'command', label: 'Command', sublabel: 'User Action', icon: '🎯' },
            { id: 'aggregate', label: 'Aggregate', sublabel: 'Domain Logic', icon: '🧩' },
            { id: 'eventstore', label: 'Event Store', sublabel: 'Append-Only Log', isEventBus: true, icon: '📜' },
            { id: 'projection', label: 'Projection', sublabel: 'Read Model', icon: '👁️' }
        ],
        steps: [
            { text: '1. Command arrives: "PlaceOrder(item, qty)"', nodes: ['command'], active: true },
            { text: '2. Aggregate validates business rules', nodes: ['command', 'aggregate'], processing: true },
            { text: '3. Aggregate emits "OrderPlaced" event', nodes: ['aggregate'], active: true },
            { text: '4. Event appended to immutable Event Store', nodes: ['aggregate', 'eventstore'], active: true },
            { text: '5. Projection rebuilds read model from events', nodes: ['eventstore', 'projection'], processing: true },
            { text: '6. Full audit trail preserved — state is replayable', nodes: ['eventstore'], success: true },
            { text: '✓ Complete history: Replay events to reconstruct any past state', nodes: [], success: true }
        ]
    },
    'cqrs': {
        title: 'CQRS: Separate Read & Write Paths',
        nodes: [
            { id: 'wapi', label: 'Write API', sublabel: 'Command Side', icon: '✏️' },
            { id: 'wdb', label: 'Write DB', sublabel: 'Event Store', isEventBus: true, icon: '💾' },
            { id: 'projector', label: 'Projector', sublabel: 'Event Handler', icon: '⚙️' },
            { id: 'rdb', label: 'Read DB', sublabel: 'Optimized View', icon: '👁️' }
        ],
        steps: [
            { text: '1. Client sends write command to Write API', nodes: ['wapi'], active: true },
            { text: '2. Write API validates and persists events', nodes: ['wapi', 'wdb'], active: true },
            { text: '3. Projector subscribes to new events', nodes: ['wdb', 'projector'], processing: true },
            { text: '4. Projector updates denormalized Read DB', nodes: ['projector', 'rdb'], processing: true },
            { text: '5. Clients query fast, optimized Read DB', nodes: ['rdb'], success: true },
            { text: '✓ Independent scaling: Read and Write sides scale separately', nodes: [], success: true }
        ]
    },
    'saga': {
        title: 'Saga Pattern: Distributed Transactions',
        nodes: [
            { id: 'orchestrator', label: 'Orchestrator', sublabel: 'Saga Manager', icon: '🎭' },
            { id: 'svc1', label: 'Payment', sublabel: 'Service A', icon: '💳' },
            { id: 'svc2', label: 'Inventory', sublabel: 'Service B', icon: '📦' },
            { id: 'svc3', label: 'Shipping', sublabel: 'Service C', icon: '🚚' }
        ],
        steps: [
            { text: '1. Orchestrator starts saga for new order', nodes: ['orchestrator'], active: true },
            { text: '2. Payment service charges customer', nodes: ['orchestrator', 'svc1'], processing: true },
            { text: '3. Payment confirms — move to inventory', nodes: ['svc1'], success: true },
            { text: '4. Inventory reserves items', nodes: ['orchestrator', 'svc2'], processing: true },
            { text: '5. Inventory confirms — trigger shipping', nodes: ['svc2'], success: true },
            { text: '6. Shipping schedules delivery', nodes: ['orchestrator', 'svc3'], processing: true },
            { text: '✓ If any step fails → compensating actions roll back prior steps', nodes: [], error: true }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    'pubsub': 'Pub/Sub',
    'event-sourcing': 'Event Sourcing',
    'cqrs': 'CQRS',
    'saga': 'Saga Pattern'
};

const PATTERNS = [
    {
        id: 'pubsub',
        title: "Publish/Subscribe",
        icon: "📡",
        colorClass: "card-cyan",
        description: "Producers publish events without knowing who consumes them. Subscribers listen for events they care about, enabling loose coupling between services.",
        tags: [
            { text: "Decoupling", highlight: "highlight-cyan" },
            { text: "Fan-out", highlight: "" },
            { text: "Topics", highlight: "" }
        ],
        useCase: "Order events distributed to inventory, notifications, and analytics services simultaneously"
    },
    {
        id: 'event-sourcing',
        title: "Event Sourcing",
        icon: "📜",
        colorClass: "card-purple",
        description: "Store every state change as an immutable event. Reconstruct current state by replaying the event log. Full audit trail and time-travel debugging.",
        tags: [
            { text: "Immutable", highlight: "highlight-purple" },
            { text: "Audit Trail", highlight: "" },
            { text: "Replay", highlight: "" }
        ],
        useCase: "Banking ledger, e-commerce order history, version control systems"
    },
    {
        id: 'cqrs',
        title: "CQRS",
        icon: "✂️",
        colorClass: "card-green",
        description: "Command Query Responsibility Segregation separates read and write models for independent scaling, optimization, and security. Often paired with Event Sourcing.",
        tags: [
            { text: "Read/Write Split", highlight: "highlight-green" },
            { text: "Scaling", highlight: "" },
            { text: "Projections", highlight: "" }
        ],
        useCase: "High-traffic dashboards reading from optimized views while writes go through domain validation"
    },
    {
        id: 'saga',
        title: "Saga Pattern",
        icon: "🎭",
        colorClass: "card-orange",
        description: "Manage distributed transactions across microservices using a sequence of local transactions with compensating actions for rollback on failure.",
        tags: [
            { text: "Distributed Tx", highlight: "highlight-orange" },
            { text: "Compensation", highlight: "" },
            { text: "Orchestration", highlight: "" }
        ],
        useCase: "E-commerce checkout: payment → inventory → shipping, with automatic rollback if any step fails"
    }
];

const COMPARISON = [
    { name: "Pub/Sub", complexity: 2, scalability: 5, consistency: 3, debugging: 3, bestFor: "Loose coupling, fan-out, event broadcasting" },
    { name: "Event Sourcing", complexity: 4, scalability: 5, consistency: 5, debugging: 5, bestFor: "Audit trails, replay, temporal queries" },
    { name: "CQRS", complexity: 4, scalability: 5, consistency: 3, debugging: 3, bestFor: "Read-heavy workloads, independent scaling" },
    { name: "Saga", complexity: 5, scalability: 4, consistency: 4, debugging: 2, bestFor: "Distributed transactions, compensating actions" },
];

const KEY_CONCEPTS = [
    {
        title: "Idempotency",
        color: "var(--cyan)",
        desc: "Events may be delivered more than once. Consumers must handle duplicates gracefully — processing the same event twice should produce the same result.",
        example: "Tip: Use unique event IDs + a processed events table to deduplicate"
    },
    {
        title: "Event Ordering",
        color: "var(--purple)",
        desc: "In distributed systems, events may arrive out of order. Use sequence numbers, timestamps, or partition keys to maintain ordering guarantees where needed.",
        example: "Tip: Kafka guarantees order within a partition; use consistent partition keys"
    },
    {
        title: "Schema Evolution",
        color: "var(--green)",
        desc: "As your system evolves, event schemas change. Use versioning (v1, v2) and backward-compatible changes to avoid breaking existing consumers.",
        example: "Tip: Use Avro/Protobuf with a schema registry for safe evolution"
    }
];

const MERMAID_CHART = `sequenceDiagram
    participant P as Publisher
    participant EB as Event Bus
    participant S1 as Subscriber A
    participant S2 as Subscriber B
    participant ES as Event Store

    P->>EB: Emit OrderCreated Event
    EB->>ES: Persist Event (Append-Only)
    EB-->>S1: Deliver Event
    EB-->>S2: Deliver Event
    S1->>S1: Process (Update Inventory)
    S2->>S2: Process (Send Notification)
    S1-->>EB: ACK
    S2-->>EB: ACK
    Note over ES: Full audit trail preserved
    Note over EB: Events are immutable & replayable`;

const RESOURCES = [
    { title: "Event-Driven Architecture — Martin Fowler", type: "web", url: "https://martinfowler.com/articles/201701-event-driven.html" },
    { title: "Master Event Sourcing in Just 10 Minutes", type: "youtube", url: "https://www.youtube.com/watch?v=ID-_ic1fLkY" },
    { title: "Mastering CQRS in Just 5 Minutes", type: "youtube", url: "https://www.youtube.com/watch?v=SvjdJoNPcHs" },
    { title: "CQRS Pattern — Microsoft Docs", type: "web", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs" },
    { title: "Saga Pattern — Microservices.io", type: "web", url: "https://microservices.io/patterns/data/saga.html" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function EventDrivenArchitectureGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePattern, setActivePattern] = useState('pubsub');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const playPattern = useCallback((patternKey: string) => {
        setActivePattern(patternKey);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        if (!isPlaying) return;

        const pattern = FLOW_PATTERNS[activePattern];
        const stepTime = 1600 * animationSpeed;

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
    }, [currentStepIdx, isPlaying, activePattern, animationSpeed]);

    useEffect(() => {
        playPattern('pubsub');
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const handleCardClick = (patternId: string) => {
        const section = document.getElementById('action-section');
        section?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => playPattern(patternId), 400);
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/async/EventDrivenArchitectureGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ PATTERN GRID ═══════════════ */}
            <h2 className="eda-section-title">Core Patterns</h2>
            <div className="eda-grid">
                {PATTERNS.map((s) => (
                    <div
                        key={s.id}
                        className={`viz-card eda-card ${s.colorClass}`}
                        onClick={() => handleCardClick(s.id)}
                    >
                        <div className="eda-card-header">
                            <div className="eda-card-icon">{s.icon}</div>
                            <div className="eda-card-title">{s.title}</div>
                        </div>
                        <div className="eda-card-description">{s.description}</div>
                        <div className="eda-card-tags">
                            {s.tags.map(tag => (
                                <span key={tag.text} className={`eda-tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                        <div className="eda-card-info-sections">
                            <div className="eda-info-box">
                                <span className="eda-info-label">Use case:</span>
                                <span className="eda-info-value">{s.useCase}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Architecture Overview</h2>
                <p className="viz-section-hint">How events flow through an event-driven system</p>
            </div>
            <div className="eda-mermaid-wrap">
                <pre className="mermaid">{MERMAID_CHART}</pre>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" id="action-section">
                <h2 className="viz-section-title">Interactive Flow Patterns</h2>
                <p className="viz-section-hint">Explore event-driven patterns with step-by-step animations</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="eda-flow-controls" style={{ marginBottom: 0 }}>
                    {Object.keys(FLOW_PATTERNS).map(key => (
                        <button
                            key={key}
                            className={`eda-tab-btn ${activePattern === key ? 'active' : ''}`}
                            onClick={() => playPattern(key)}
                        >
                            {TAB_LABELS[key]}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: isPlaying ? 'rgba(29, 233, 182, 0.1)' : 'transparent', color: isPlaying ? 'var(--cyan)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={() => playPattern(activePattern)}
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

            <div className="eda-flow-diagram">
                <div className="eda-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : 'var(--cyan)'
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${FLOW_PATTERNS[activePattern].steps.length}`}
                </div>

                <h3 className="eda-flow-title">
                    {FLOW_PATTERNS[activePattern].title}
                </h3>

                <div className="eda-nodes">
                    {FLOW_PATTERNS[activePattern].nodes.map((node) => (
                        <EDANode
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

            <div className="eda-legend">
                <div className="eda-legend-item">
                    <div className="eda-legend-box leg-publisher"></div> Publisher / Command
                </div>
                <div className="eda-legend-item">
                    <div className="eda-legend-box leg-event-bus"></div> Event Bus / Store
                </div>
                <div className="eda-legend-item">
                    <div className="eda-legend-box leg-subscriber"></div> Subscriber / Handler
                </div>
                <div className="eda-legend-item">
                    <div className="eda-legend-box leg-store"></div> Persistence
                </div>
            </div>

            {/* ═══════════════ KEY CONCEPTS ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Key Concepts</h2>
                <p className="viz-section-hint">Essential principles for building robust event-driven systems</p>
            </div>
            <div className="eda-concepts-grid">
                {KEY_CONCEPTS.map((c) => (
                    <div key={c.title} className="eda-concept-card" style={{ '--card-color': c.color } as React.CSSProperties}>
                        <div className="eda-concept-title">{c.title}</div>
                        <div className="eda-concept-desc">{c.desc}</div>
                        <div className="eda-concept-example">{c.example}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Pattern Comparison</h2>
                <p className="viz-section-hint">Compare event-driven patterns by key characteristics</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Complexity</th>
                            <th>Scalability</th>
                            <th>Consistency</th>
                            <th>Debuggability</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.complexity} /></td>
                                <td><Rating dots={row.scalability} /></td>
                                <td><Rating dots={row.consistency} /></td>
                                <td><Rating dots={row.debugging} /></td>
                                <td>{row.bestFor}</td>
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

function EDANode({ node, activeIdx, pattern }: Readonly<{ node: NodeDef, activeIdx: number, pattern: string }>) {
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

    return (
        <div className="eda-node-container">
            <div className={`eda-node-box ${node.isEventBus ? 'event-bus' : ''} ${statusClass}`}>
                <span style={{ fontSize: '1.4rem', marginBottom: '2px' }}>{node.icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{node.id.toUpperCase()}</span>
                {node.isEventBus && (
                    <div className="eda-event-indicator">
                        <div className={`eda-event-dot ${isActive ? 'active' : ''}`}></div>
                        <div className={`eda-event-dot ${isActive ? 'active' : ''}`}></div>
                        <div className={`eda-event-dot ${isActive ? 'active' : ''}`}></div>
                    </div>
                )}
            </div>
            <div className="eda-node-label">{node.sublabel}</div>
        </div>
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="eda-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`eda-dot ${i <= dots ? 'on' : ''}`} />
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

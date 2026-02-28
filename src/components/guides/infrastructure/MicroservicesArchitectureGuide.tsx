"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Settings, ExternalLink, Play, Pause, RotateCcw, Youtube, Globe, BookOpen } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/microservices-architecture.css';

const guide = guidesData.guides.find(v => v.id === "microservices-architecture")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    text: string;
    nodes: string[];
    highlight?: boolean;
    success?: boolean;
    error?: boolean;
};

type Pattern = {
    title: string;
    description: string;
    nodes: NodeDef[];
    steps: Step[];
};

type NodeDef = {
    id: string;
    label: string;
    icon?: string;
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'monolith': {
        title: 'Monolithic Architecture',
        description: 'All features tightly coupled in a single codebase',
        nodes: [
            { id: 'user', label: 'Users', icon: '👥' },
            { id: 'lb', label: 'Load Balancer', icon: '⚖️' },
            { id: 'mono1', label: 'Monolith\n(Auth + Cart +\nPayment +\nShipping)', icon: '📦' },
            { id: 'mono2', label: 'Monolith\n(Auth + Cart +\nPayment +\nShipping)', icon: '📦' },
            { id: 'db', label: 'Single DB', icon: '🗄️' }
        ],
        steps: [
            { text: '1. All requests route through Load Balancer', nodes: ['user', 'lb'], highlight: true },
            { text: '2. Each instance contains entire codebase', nodes: ['mono1', 'mono2'], highlight: true },
            { text: '3. All instances share single database', nodes: ['db'], highlight: true },
            { text: '✗ Scaling: Must replicate entire monolith', nodes: ['mono1', 'mono2'], error: true },
            { text: '✗ Deployment: One bug breaks entire system', nodes: ['mono1', 'mono2'], error: true },
            { text: '✗ Tech stack: All services use same language', nodes: ['mono1', 'mono2'], error: true }
        ]
    },
    'microservices': {
        title: 'Microservices Architecture',
        description: 'Independent, loosely-coupled services with own databases',
        nodes: [
            { id: 'user', label: 'Users', icon: '👥' },
            { id: 'api', label: 'API Gateway', icon: '🚪' },
            { id: 'auth', label: 'Auth\nService', icon: '🔐' },
            { id: 'cart', label: 'Cart\nService', icon: '🛒' },
            { id: 'pay', label: 'Payment\nService', icon: '💳' },
            { id: 'ship', label: 'Shipping\nService', icon: '📦' },
            { id: 'msg', label: 'Message\nQueue', icon: '📨' },
            { id: 'db1', label: 'Auth DB', icon: '🗄️' },
            { id: 'db2', label: 'Cart DB', icon: '🗄️' },
            { id: 'db3', label: 'Payment DB', icon: '🗄️' },
            { id: 'db4', label: 'Shipping DB', icon: '🗄️' }
        ],
        steps: [
            { text: '1. API Gateway routes requests intelligently', nodes: ['user', 'api'], highlight: true },
            { text: '2. Auth Service handles login/tokens', nodes: ['auth', 'db1'], success: true },
            { text: '3. Cart Service manages cart independently', nodes: ['cart', 'db2'], success: true },
            { text: '4. Payment Service processes payments', nodes: ['pay', 'db3'], success: true },
            { text: '5. Shipping Service handles fulfillment', nodes: ['ship', 'db4'], success: true },
            { text: '6. Services communicate via API or Message Queue', nodes: ['msg'], highlight: true },
            { text: '✓ Scaling: Scale only Cart Service during sales', nodes: ['cart'], success: true },
            { text: '✓ Deployment: Payment update doesn\'t affect Auth', nodes: ['pay'], success: true },
            { text: '✓ Tech stack: Auth in Node, Payment in Python, Cart in Go', nodes: ['auth', 'pay', 'cart'], success: true }
        ]
    },
    'communication-sync': {
        title: 'Synchronous Communication (REST/gRPC)',
        description: 'Direct request-response between services',
        nodes: [
            { id: 'client', label: 'Client', icon: '💻' },
            { id: 'api', label: 'API Gateway', icon: '🚪' },
            { id: 'order', label: 'Order\nService', icon: '📦' },
            { id: 'inv', label: 'Inventory\nService', icon: '📊' },
            { id: 'pay', label: 'Payment\nService', icon: '💳' }
        ],
        steps: [
            { text: '1. Client submits order', nodes: ['client'], highlight: true },
            { text: '2. API Gateway routes to Order Service', nodes: ['api', 'order'], highlight: true },
            { text: '3. Order Service calls Inventory Service (REST)', nodes: ['order', 'inv'], highlight: true },
            { text: '4. Inventory confirms stock available', nodes: ['inv'], success: true },
            { text: '5. Order Service calls Payment Service', nodes: ['order', 'pay'], highlight: true },
            { text: '6. Payment processes and returns success', nodes: ['pay'], success: true },
            { text: '7. Order confirmed to Client (immediate)', nodes: ['client'], success: true },
            { text: '⚠ Tight coupling: If Payment is slow, order is slow', nodes: ['pay', 'order'], error: true }
        ]
    },
    'communication-async': {
        title: 'Asynchronous Communication (Message Queues)',
        description: 'Loose coupling via event-driven messaging',
        nodes: [
            { id: 'client', label: 'Client', icon: '💻' },
            { id: 'api', label: 'API Gateway', icon: '🚪' },
            { id: 'order', label: 'Order\nService', icon: '📦' },
            { id: 'queue', label: 'Message Queue\n(Kafka/RabbitMQ)', icon: '📨' },
            { id: 'inv', label: 'Inventory\nService', icon: '📊' },
            { id: 'pay', label: 'Payment\nService', icon: '💳' }
        ],
        steps: [
            { text: '1. Client submits order', nodes: ['client'], highlight: true },
            { text: '2. API Gateway routes to Order Service', nodes: ['api', 'order'], highlight: true },
            { text: '3. Order Service publishes "OrderCreated" event', nodes: ['order', 'queue'], success: true },
            { text: '4. Order confirmed to Client (returns immediately)', nodes: ['client'], success: true },
            { text: '5. Inventory Service consumes event asynchronously', nodes: ['inv', 'queue'], highlight: true },
            { text: '6. Payment Service consumes event asynchronously', nodes: ['pay', 'queue'], highlight: true },
            { text: '7. Services process independently & publish own events', nodes: ['inv', 'pay'], success: true },
            { text: '✓ Loose coupling: Slow services don\'t block clients', nodes: ['queue'], success: true }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    'monolith': 'Monolith',
    'microservices': 'Microservices',
    'communication-sync': 'Sync (REST)',
    'communication-async': 'Async (Events)'
};

const CONCEPTS = [
    {
        title: "Independent Services",
        icon: "🏢",
        colorClass: "card-cyan",
        description: "Each microservice is a small, focused service responsible for a specific business capability. Services are independently deployable units.",
        example: "Auth, Payment, Shipping, Inventory, Notification services"
    },
    {
        title: "Loose Coupling",
        icon: "🔗",
        colorClass: "card-purple",
        description: "Services communicate through well-defined APIs or message queues, not internal function calls. Changes to one service don't require changes to others.",
        example: "Payment service doesn't need to know Payment implementation details"
    },
    {
        title: "Resilience & Fault Isolation",
        icon: "🛡️",
        colorClass: "card-pink",
        description: "If one service fails, others continue operating. Failures are isolated and don't cascade through the system.",
        example: "Payment service down ≠ Shopping cart broken; users can still browse"
    },
    {
        title: "Independent Scalability",
        icon: "📈",
        colorClass: "card-teal",
        description: "Each service scales based on its own load. No need to scale the entire monolith when only one feature needs more resources.",
        example: "10× Cart services during Black Friday, 2× Payment services normally"
    },
    {
        title: "Technology Diversity",
        icon: "🛠️",
        colorClass: "card-orange",
        description: "Each team chooses the best technology for their service. One team uses Go, another Python, another Node.js — they communicate via standard APIs.",
        example: "Cart: Go, Payment: Python, Auth: Node.js, Search: Rust"
    },
    {
        title: "Team Ownership",
        icon: "👥",
        colorClass: "card-green",
        description: "Each team owns a service end-to-end: design, development, deployment, monitoring. Reduces inter-team dependencies and speeds up delivery.",
        example: "Payment team controls entire Payment service from code to infrastructure"
    }
];

const COMPARISON_TABLE = [
    { aspect: "Scalability", monolith: "2", microservices: "5", microservicesDesc: "Scale individual services as needed" },
    { aspect: "Deployment Risk", monolith: "1", microservices: "5", microservicesDesc: "Deploy one service without affecting others" },
    { aspect: "Technology Diversity", monolith: "1", microservices: "5", microservicesDesc: "Each service chooses optimal tech stack" },
    { aspect: "Team Autonomy", monolith: "1", microservices: "5", microservicesDesc: "Teams move independently" },
    { aspect: "Complexity", monolith: "5", microservices: "2", microservicesDesc: "Distributed systems are harder to debug" },
    { aspect: "Network Latency", monolith: "5", microservices: "2", microservicesDesc: "Network calls are slower than function calls" },
    { aspect: "Data Consistency", monolith: "5", microservices: "2", microservicesDesc: "Eventual consistency instead of ACID" },
    { aspect: "Operational Overhead", monolith: "5", microservices: "2", microservicesDesc: "Need monitoring, logging, service mesh" }
];

const ARCHITECTURE_DIAGRAM = `graph TB
    User["👥 User"]
    CDN["🌍 CDN"]
    AG["🚪 API Gateway\n(Routing, Auth, Rate Limiting)"]
    
    AuthSvc["🔐 Auth Service\n(Node.js)"]
    AuthDB["🗄️ Auth DB"]
    
    CartSvc["🛒 Cart Service\n(Go)"]
    CartDB["🗄️ Cart DB"]
    
    PaySvc["💳 Payment Service\n(Python)"]
    PayDB["🗄️ Payment DB"]
    
    ShipSvc["📦 Shipping Service\n(Java)"]
    ShipDB["🗄️ Shipping DB"]
    
    Queue["📨 Message Queue\n(Kafka/RabbitMQ)"]
    Cache["⚡ Cache Layer\n(Redis)"]
    
    ServiceMesh["🕸️ Service Mesh\n(Istio/Linkerd)\nCircuit Breaker, Retries"]
    Monitor["📊 Monitoring\n(Prometheus/Grafana)"]
    Log["📝 Logging\n(ELK Stack)"]
    
    User -->|HTTPS| CDN
    CDN -->|Route| AG
    
    AG -->|REST/gRPC| AuthSvc
    AG -->|REST/gRPC| CartSvc
    AG -->|REST/gRPC| PaySvc
    AG -->|REST/gRPC| ShipSvc
    
    AuthSvc --> AuthDB
    CartSvc --> CartDB
    PaySvc --> PayDB
    ShipSvc --> ShipDB
    
    AuthSvc -->|async events| Queue
    CartSvc -->|async events| Queue
    PaySvc -->|async events| Queue
    ShipSvc -->|async events| Queue
    
    CartSvc -->|cache| Cache
    PaySvc -->|cache| Cache
    
    AuthSvc -->|observability| ServiceMesh
    CartSvc -->|observability| ServiceMesh
    PaySvc -->|observability| ServiceMesh
    ShipSvc -->|observability| ServiceMesh
    
    ServiceMesh -->|metrics| Monitor
    AuthSvc -->|logs| Log
    CartSvc -->|logs| Log
    PaySvc -->|logs| Log
    ShipSvc -->|logs| Log
    
    classDef gateway fill:#1a1f2b,stroke:#00e5ff,stroke-width:2px,color:#fff
    classDef service fill:#12161f,stroke:#7c4dff,stroke-width:2px,color:#fff
    classDef data fill:#0d1117,stroke:#3effab,stroke-width:2px,color:#fff
    classDef infra fill:#1a1f2b,stroke:#ff9100,stroke-width:2px,color:#fff
    classDef user fill:#12161f,stroke:#ff4081,stroke-width:2px,color:#fff
    
    class User user
    class AG gateway
    class AuthSvc,CartSvc,PaySvc,ShipSvc service
    class AuthDB,CartDB,PayDB,ShipDB,Cache,Queue data
    class CDN,ServiceMesh,Monitor,Log infra`;

const RESOURCES = [
    { title: "Building Microservices — Sam Newman", type: "web", url: "https://samnewman.io/books/building_microservices/" },
    { title: "Microservices Patterns — Chris Richardson", type: "web", url: "https://microservices.io/" },
    { title: "Martin Fowler - Microservices", type: "web", url: "https://martinfowler.com/articles/microservices.html" },
    { title: "AWS Microservices Best Practices", type: "web", url: "https://aws.amazon.com/microservices/" },
    { title: "Netflix Microservices Architecture", type: "web", url: "https://www.youtube.com/results?search_query=netflix+microservices" }
];

const BENEFITS = [
    { title: "Independent Deployment", desc: "Deploy services without coordination" },
    { title: "Technology Freedom", desc: "Choose the right tool for each job" },
    { title: "Team Scaling", desc: "Teams work independently and in parallel" },
    { title: "Partial Scaling", desc: "Scale only services under heavy load" },
    { title: "Fault Isolation", desc: "Failures don't cascade across system" },
    { title: "Better Resilience", desc: "Use patterns like circuit breakers, retries" }
];

const CHALLENGES = [
    { title: "Complexity", desc: "Distributed systems are harder to understand" },
    { title: "Network Latency", desc: "RPC is slower than local function calls" },
    { title: "Consistency Issues", desc: "Managing distributed transactions is hard" },
    { title: "Operational Overhead", desc: "Need monitoring, logging, tracing tools" },
    { title: "Debugging Difficulty", desc: "Following requests across services is complex" },
    { title: "Data Ownership", desc: "Each service owns its data; cross-service joins are hard" }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function MicroservicesGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('microservices');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const playPattern = useCallback((patternKey: string) => {
        setActivePatternKey(patternKey);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        let t: NodeJS.Timeout;
        if (isPlaying) {
            const pattern = FLOW_PATTERNS[activePatternKey];
            if (currentStepIdx < pattern.steps.length - 1) {
                const stepTime = currentStepIdx === -1 ? 500 : 1400 * animationSpeed;
                t = setTimeout(() => {
                    setCurrentStepIdx(prev => prev + 1);
                }, stepTime);
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearTimeout(t);
    }, [isPlaying, currentStepIdx, activePatternKey, animationSpeed]);

    useEffect(() => {
        playPattern('microservices');
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const activePattern = FLOW_PATTERNS[activePatternKey];
    const pattern = activePattern;

    return (
        <GuideLayout
            githubPath="src/components/guides/infrastructure/MicroservicesArchitectureGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPTS GRID ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="ms-concepts-grid">
                {CONCEPTS.map((concept) => (
                    <div key={concept.title} className={`viz-card ms-concept-card ${concept.colorClass}`}>
                        <div className="ms-concept-icon">{concept.icon}</div>
                        <h3 className="ms-concept-title">{concept.title}</h3>
                        <p className="ms-concept-desc">{concept.description}</p>
                        <div className="ms-concept-example">
                            <strong>Example:</strong> {concept.example}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ ARCHITECTURE DIAGRAM ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
                Real-World Architecture
            </h2>
            <div className="ms-mermaid-wrap">
                <pre className="mermaid">
                    {ARCHITECTURE_DIAGRAM}
                </pre>
            </div>

            {/* ═══════════════ BENEFITS & CHALLENGES ═══════════════ */}
            <div className="ms-tradeoffs-section">
                <div className="ms-tradeoff-column">
                    <h3 className="ms-tradeoff-title benefits">✅ Benefits</h3>
                    <div className="ms-benefit-list">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.title} className="ms-benefit-item">
                                <div className="ms-benefit-icon">+</div>
                                <div>
                                    <div className="ms-benefit-name">{benefit.title}</div>
                                    <div className="ms-benefit-desc">{benefit.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="ms-tradeoff-column">
                    <h3 className="ms-tradeoff-title challenges">⚠️ Challenges</h3>
                    <div className="ms-challenge-list">
                        {CHALLENGES.map((challenge) => (
                            <div key={challenge.title} className="ms-challenge-item">
                                <div className="ms-challenge-icon">!</div>
                                <div>
                                    <div className="ms-challenge-name">{challenge.title}</div>
                                    <div className="ms-challenge-desc">{challenge.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div id="flow-section" className="viz-section-header">
                <h2 className="viz-section-title">Microservices vs Monolith</h2>
                <p className="viz-section-hint">Visualize architectural differences and communication patterns</p>
            </div>

            <div className="ms-flow-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="ms-flow-controls">
                        {Object.keys(FLOW_PATTERNS).map(key => (
                            <button
                                key={key}
                                className={`ms-flow-btn ${activePatternKey === key ? 'active' : ''}`}
                                onClick={() => playPattern(key)}
                            >
                                {TAB_LABELS[key]}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                                background: isPlaying ? 'rgba(124, 77, 255, 0.1)' : 'transparent',
                                color: isPlaying ? 'var(--purple)' : 'var(--text-dim)',
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

                <div className="ms-flow-container">
                    <div className="ms-flow-header">
                        <h3 className="ms-flow-title">{pattern.title}</h3>
                        <p className="ms-flow-desc">{pattern.description}</p>
                    </div>

                    <div className="ms-flow-diagram">
                        {pattern.nodes.map(node => {
                            const isActive = currentStepIdx !== -1 && activePattern.steps[currentStepIdx]?.nodes.includes(node.id);
                            return (
                                <div
                                    key={node.id}
                                    className={`ms-node ${isActive ? 'active' : ''}`}
                                >
                                    <div className="ms-node-icon">{node.icon}</div>
                                    <div className="ms-node-label">{node.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="ms-step-indicator">
                        {currentStepIdx === -1 ? (
                            <p className="ms-step-text">Click play to start the visualization</p>
                        ) : (
                            <>
                                <p className="ms-step-text">
                                    {activePattern.steps[currentStepIdx]?.text}
                                </p>
                                <div className="ms-step-progress">
                                    <div className="ms-step-bar">
                                        <div
                                            className="ms-step-fill"
                                            style={{
                                                width: `${((currentStepIdx + 1) / activePattern.steps.length) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="ms-step-count">
                                        {currentStepIdx + 1} / {activePattern.steps.length}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
                Monolith vs Microservices Comparison
            </h2>
            <div className="ms-comparison-wrap">
                <table className="ms-comparison-table">
                    <thead>
                        <tr>
                            <th>Aspect</th>
                            <th className="monolith-col">Monolith</th>
                            <th className="ms-col">Microservices</th>
                            <th className="desc-col">Why?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON_TABLE.map((row) => (
                            <tr key={row.aspect}>
                                <td className="aspect-cell">{row.aspect}</td>
                                <td className="monolith-col score">{row.monolith}/5</td>
                                <td className="ms-col score">{row.microservices}/5</td>
                                <td className="desc-cell">{row.microservicesDesc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══════════════ RESOURCES ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
                Deep Dives & Resources
            </h2>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Title</th>
                            <th style={{ width: '20%' }}>Format</th>
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
                                            color: 'var(--cyan)',
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

function ResourceIcon({ type }: { type: string }) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'course': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

export default MicroservicesGuide;

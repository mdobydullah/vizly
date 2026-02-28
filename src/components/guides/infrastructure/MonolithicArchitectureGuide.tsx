"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Settings, ExternalLink, Play, Pause, RotateCcw, Youtube, Globe, BookOpen } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/monolithic-architecture.css';

const guide = guidesData.guides.find(v => v.id === "monolithic-architecture")!;

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
    'request-flow': {
        title: 'Standard Request Flow',
        description: 'How a request is processed in a monolithic system',
        nodes: [
            { id: 'user', label: 'Users', icon: '👥' },
            { id: 'lb', label: 'Load Balancer', icon: '⚖️' },
            { id: 'mono', label: 'Monolith\n(Logic + UI + Data)', icon: '📦' },
            { id: 'db', label: 'Database', icon: '🗄️' }
        ],
        steps: [
            { text: '1. User sends request to the system', nodes: ['user'], highlight: true },
            { text: '2. Load Balancer routes to an available instance', nodes: ['lb', 'mono'], highlight: true },
            { text: '3. Monolith processes business logic internally', nodes: ['mono'], success: true },
            { text: '4. Queries shared database for data', nodes: ['mono', 'db'], highlight: true },
            { text: '5. Response generated and sent back to user', nodes: ['mono', 'user'], success: true }
        ]
    },
    'scaling': {
        title: 'Scaling a Monolith',
        description: 'Scaling requires replicating the entire application',
        nodes: [
            { id: 'lb', label: 'Load Balancer', icon: '⚖️' },
            { id: 'instance1', label: 'Instance 1\n(All Services)', icon: '📦' },
            { id: 'instance2', label: 'Instance 2\n(All Services)', icon: '📦' },
            { id: 'instance3', label: 'Instance 3\n(All Services)', icon: '📦' }
        ],
        steps: [
            { text: '1. High traffic arrives at Load Balancer', nodes: ['lb'], highlight: true },
            { text: '2. Extra instances added to handle load', nodes: ['instance1', 'instance2', 'instance3'], success: true },
            { text: '3. Each instance contains components that might not need scaling', nodes: ['instance1', 'instance2', 'instance3'], error: true },
            { text: '✗ Resource Heavy: Replicating everything consumes more RAM/CPU', nodes: ['instance1', 'instance2', 'instance3'], error: true }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    'request-flow': 'Request Flow',
    'scaling': 'Scaling Pattern'
};

const CONCEPTS = [
    {
        title: "Unified Codebase",
        icon: "📂",
        colorClass: "card-cyan",
        description: "All application logic (Auth, Cart, Payment, etc.) resides within a single project and repository.",
        example: "A single Ruby on Rails or Django project containing all features"
    },
    {
        title: "Single Deployment Unit",
        icon: "🚀",
        colorClass: "card-blue",
        description: "The entire application is packaged and deployed as a single file or container. One version for everything.",
        example: "A single .war file or Docker image deployed to a server"
    },
    {
        title: "Shared Database",
        icon: "🗄️",
        colorClass: "card-teal",
        description: "All components share a single, central database. Cross-component data access is simple and happens via SQL joins.",
        example: "One PostgreSQL instance for all application modules"
    },
    {
        title: "Tight Coupling",
        icon: "🔗",
        colorClass: "card-orange",
        description: "Components interact via local function calls. This is fast but makes it hard to change one part without affecting others.",
        example: "Order service calling Payment class directly in the same memory"
    },
    {
        title: "Simplicity in Dev",
        icon: "✨",
        colorClass: "card-green",
        description: "Easy to set up, test, and debug locally. No need to manage complex distributed networking during development.",
        example: "Run 'npm start' and the entire system is live on localhost"
    },
    {
        title: "Scaling Constraints",
        icon: "📉",
        colorClass: "card-pink",
        description: "Cannot scale features independently. If only 'Payment' is slow, you must scale the entire monolith.",
        example: "Scaling up image processing scales up the login page too"
    }
];

const ARCHITECTURE_DIAGRAM = `graph TD
    User["👥 User"]
    Proxy["🛡️ Reverse Proxy/LB"]
    
    subgraph Monolith ["📦 Monolithic Application Server"]
        UI["🎨 UI Layer"]
        Auth["🔐 Auth Service"]
        Cart["🛒 Cart Service"]
        Pay["💳 Payment Service"]
        Report["📊 Reporting Service"]
    end
    
    DB[("🗄️ Shared Database")]
    File["📁 Local File System"]
    
    User -->|HTTPS| Proxy
    Proxy -->|Request| Monolith
    
    UI <--> Auth
    Auth <--> Cart
    Cart <--> Pay
    Pay <--> Report
    
    Monolith <--> DB
    Monolith <--> File
    
    classDef main fill:#1a1f2b,stroke:#22d3ee,stroke-width:2px,color:#fff
    classDef secondary fill:#12161f,stroke:#1de9b6,stroke-width:1px,color:#fff
    classDef storage fill:#0d1117,stroke:#ff9100,stroke-width:2px,color:#fff
    
    class Monolith main
    class UI,Auth,Cart,Pay,Report secondary
    class DB,File storage`;

const COMPARISON_TABLE = [
    { aspect: "Scalability", monolith: "2", microservices: "5", desc: "Scale everything vs scale specific services" },
    { aspect: "Deployment Speed", monolith: "5", microservices: "2", desc: "One pipeline vs many complex pipelines" },
    { aspect: "Maintenance", monolith: "4", microservices: "2", desc: "Everything in one place vs distributed complexity" },
    { aspect: "Perf (Network)", monolith: "5", microservices: "3", desc: "In-memory calls vs network RPC/REST overhead" },
    { aspect: "Reliability", monolith: "2", microservices: "4", desc: "Single point of failure vs fault isolation" },
    { aspect: "Cost (Dev)", monolith: "5", microservices: "2", desc: "Cheaper early on vs expensive orchestration" },
    { aspect: "Tech Stack", monolith: "1", microservices: "5", desc: "Locked to one language vs tech polyglotism" }
];

const RESOURCES = [
    { title: "The Majestic Monolith", type: "web", url: "https://signalvnoise.com/svn3/the-majestic-monolith/" },
    { title: "Martin Fowler: MonolithFirst", type: "web", url: "https://martinfowler.com/bliki/MonolithFirst.html" },
    { title: "Monolith vs Microservices vs Modular Monoliths", type: "web", url: "https://blog.bytebytego.com/p/monolith-vs-microservices-vs-modular" },
];

const BENEFITS = [
    { title: "Simple to Develop", desc: "Standardized IDE support and simple local setup" },
    { title: "Easy Testing", desc: "End-to-end testing is straightforward in one process" },
    { title: "Faster Performance", desc: "No network latency between components/modules" },
    { title: "Simple Deployment", desc: "Just one file to move to the production server" },
    { title: "Lower Op Overhead", desc: "Fewer moving parts to monitor and manage" }
];

const CHALLENGES = [
    { title: "Maintenance", desc: "Codebase becomes a 'Big Ball of Mud' over time" },
    { title: "Slow Start Time", desc: "Large applications take longer to boot up" },
    { title: "Single Failure Point", desc: "A bug in one module can crash the entire system" },
    { title: "Tech Lockdown", desc: "Extremely difficult to change tech stack or version" },
    { title: "Deployment Bottleneck", desc: "Scaling and updating requires coordinated releases" }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function MonolithicArchitectureGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('request-flow');
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
        playPattern('request-flow');
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const activePattern = FLOW_PATTERNS[activePatternKey];
    const pattern = activePattern;

    return (
        <GuideLayout
            githubPath="src/components/guides/infrastructure/MonolithicArchitectureGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPTS GRID ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="mono-concepts-grid">
                {CONCEPTS.map((concept) => (
                    <div key={concept.title} className={`viz-card mono-concept-card ${concept.colorClass}`}>
                        <div className="mono-concept-icon">{concept.icon}</div>
                        <h3 className="mono-concept-title">{concept.title}</h3>
                        <p className="mono-concept-desc">{concept.description}</p>
                        <div className="mono-concept-example">
                            <strong>Example:</strong> {concept.example}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ ARCHITECTURE DIAGRAM ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '3.5rem' }}>
                Inside the Monolith
            </h2>
            <div className="mono-mermaid-wrap">
                <pre className="mermaid">
                    {ARCHITECTURE_DIAGRAM}
                </pre>
            </div>

            {/* ═══════════════ BENEFITS & CHALLENGES ═══════════════ */}
            <div className="mono-tradeoffs-section">
                <div className="mono-tradeoff-column">
                    <h3 className="mono-tradeoff-title benefits">✅ Benefits</h3>
                    <div className="mono-benefit-list">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.title} className="mono-benefit-item">
                                <div className="mono-benefit-icon">+</div>
                                <div>
                                    <div className="mono-benefit-name">{benefit.title}</div>
                                    <div className="mono-benefit-desc">{benefit.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mono-tradeoff-column">
                    <h3 className="mono-tradeoff-title challenges">⚠️ Challenges</h3>
                    <div className="mono-challenge-list">
                        {CHALLENGES.map((challenge) => (
                            <div key={challenge.title} className="mono-challenge-item">
                                <div className="mono-challenge-icon">!</div>
                                <div>
                                    <div className="mono-challenge-name">{challenge.title}</div>
                                    <div className="mono-challenge-desc">{challenge.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div id="flow-section" className="viz-section-header">
                <h2 className="viz-section-title">Interactive Visualization</h2>
                <p className="viz-section-hint">Explore request flows and scaling challenges</p>
            </div>

            <div className="mono-flow-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="mono-flow-controls">
                        {Object.keys(FLOW_PATTERNS).map(key => (
                            <button
                                key={key}
                                className={`mono-flow-btn ${activePatternKey === key ? 'active' : ''}`}
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
                                background: isPlaying ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
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

                <div className="mono-flow-container">
                    <div className="mono-flow-header">
                        <h3 className="mono-flow-title">{pattern.title}</h3>
                        <p className="mono-flow-desc">{pattern.description}</p>
                    </div>

                    <div className="mono-flow-diagram">
                        {pattern.nodes.map(node => {
                            const isActive = currentStepIdx !== -1 && activePattern.steps[currentStepIdx]?.nodes.includes(node.id);
                            return (
                                <div
                                    key={node.id}
                                    className={`mono-node ${isActive ? 'active' : ''}`}
                                >
                                    <div className="mono-node-icon">{node.icon}</div>
                                    <div className="mono-node-label">{node.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mono-step-indicator">
                        {currentStepIdx === -1 ? (
                            <p className="mono-step-text">Click play to start the visualization</p>
                        ) : (
                            <>
                                <p className="mono-step-text">
                                    {activePattern.steps[currentStepIdx]?.text}
                                </p>
                                <div className="mono-step-progress">
                                    <div className="mono-step-bar">
                                        <div
                                            className="mono-step-fill"
                                            style={{
                                                width: `${((currentStepIdx + 1) / activePattern.steps.length) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="mono-step-count">
                                        {currentStepIdx + 1} / {activePattern.steps.length}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '3.5rem' }}>
                Choosing Between Patterns
            </h2>
            <div className="mono-comparison-wrap">
                <table className="mono-comparison-table">
                    <thead>
                        <tr>
                            <th>Aspect</th>
                            <th className="monolith-highlight">Monolith</th>
                            <th className="microservices-dim">Microservices</th>
                            <th>Key Difference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON_TABLE.map((row) => (
                            <tr key={row.aspect}>
                                <td className="mono-aspect-cell">{row.aspect}</td>
                                <td className="monolith-highlight score-mono">{row.monolith}/5</td>
                                <td className="microservices-dim score-ms">{row.microservices}/5</td>
                                <td className="mono-desc-cell" style={{ fontSize: '.75rem', color: 'var(--text-dim)', padding: '.8rem' }}>
                                    {row.desc}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══════════════ RESOURCES ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '3.5rem' }}>
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

export default MonolithicArchitectureGuide;

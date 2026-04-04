"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/system-design/cap-theorem.css';

const guide = guidesData.guides.find(v => v.id === "cap-theorem")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type NodeState = 'idle' | 'active' | 'chosen' | 'sacrificed' | 'dimmed';

type Step = {
    text: string;
    nodeStates: Record<string, NodeState>; // C, A, P
    edges?: Record<string, 'highlighted' | 'dim' | 'normal'>;
};

type Scenario = {
    title: string;
    subtitle: string;
    chooses: string[];
    sacrifices: string;
    steps: Step[];
};

const SCENARIOS: Record<string, Scenario> = {
    'cp': {
        title: 'CP: Consistency + Partition Tolerance',
        subtitle: 'Sacrifice Availability for Strong Consistency',
        chooses: ['C', 'P'],
        sacrifices: 'A',
        steps: [
            {
                text: 'A network partition occurs — nodes can\'t communicate',
                nodeStates: { C: 'idle', A: 'idle', P: 'active' },
                edges: { CA: 'dim', CP: 'highlighted', AP: 'dim' }
            },
            {
                text: 'The system detects the partition event',
                nodeStates: { C: 'active', A: 'idle', P: 'active' },
                edges: { CA: 'dim', CP: 'highlighted', AP: 'dim' }
            },
            {
                text: 'System refuses writes to minority partition — ensures all reads return the latest data',
                nodeStates: { C: 'chosen', A: 'dimmed', P: 'chosen' },
                edges: { CA: 'dim', CP: 'highlighted', AP: 'dim' }
            },
            {
                text: 'Some client requests get errors (503) — unavailable until partition heals',
                nodeStates: { C: 'chosen', A: 'sacrificed', P: 'chosen' },
                edges: { CA: 'dim', CP: 'highlighted', AP: 'dim' }
            },
            {
                text: '✓ Strong consistency guaranteed — no stale reads. Cost: downtime during partitions.',
                nodeStates: { C: 'chosen', A: 'sacrificed', P: 'chosen' },
                edges: { CA: 'dim', CP: 'highlighted', AP: 'dim' }
            }
        ]
    },
    'ap': {
        title: 'AP: Availability + Partition Tolerance',
        subtitle: 'Sacrifice Consistency for High Availability',
        chooses: ['A', 'P'],
        sacrifices: 'C',
        steps: [
            {
                text: 'A network partition occurs — nodes can\'t sync data',
                nodeStates: { C: 'idle', A: 'idle', P: 'active' },
                edges: { CA: 'dim', CP: 'dim', AP: 'highlighted' }
            },
            {
                text: 'System continues accepting reads AND writes on both sides',
                nodeStates: { C: 'dimmed', A: 'active', P: 'active' },
                edges: { CA: 'dim', CP: 'dim', AP: 'highlighted' }
            },
            {
                text: 'Both partitions serve potentially different data (divergence)',
                nodeStates: { C: 'sacrificed', A: 'chosen', P: 'chosen' },
                edges: { CA: 'dim', CP: 'dim', AP: 'highlighted' }
            },
            {
                text: 'When partition heals, conflicts must be resolved (e.g., LWW, CRDTs)',
                nodeStates: { C: 'sacrificed', A: 'chosen', P: 'chosen' },
                edges: { CA: 'dim', CP: 'dim', AP: 'highlighted' }
            },
            {
                text: '✓ Zero downtime — always responds. Cost: clients may read stale/conflicting data.',
                nodeStates: { C: 'sacrificed', A: 'chosen', P: 'chosen' },
                edges: { CA: 'dim', CP: 'dim', AP: 'highlighted' }
            }
        ]
    },
    'ca': {
        title: 'CA: Consistency + Availability',
        subtitle: 'Only possible when there are NO partitions',
        chooses: ['C', 'A'],
        sacrifices: 'P',
        steps: [
            {
                text: 'All nodes are on a single network with no partitions',
                nodeStates: { C: 'idle', A: 'idle', P: 'dimmed' },
                edges: { CA: 'highlighted', CP: 'dim', AP: 'dim' }
            },
            {
                text: 'Every write is immediately visible to all readers',
                nodeStates: { C: 'active', A: 'active', P: 'dimmed' },
                edges: { CA: 'highlighted', CP: 'dim', AP: 'dim' }
            },
            {
                text: 'System is always available — every request gets a response',
                nodeStates: { C: 'chosen', A: 'chosen', P: 'dimmed' },
                edges: { CA: 'highlighted', CP: 'dim', AP: 'dim' }
            },
            {
                text: '⚠ If a partition DOES happen, system must shut down or become inconsistent',
                nodeStates: { C: 'chosen', A: 'chosen', P: 'sacrificed' },
                edges: { CA: 'highlighted', CP: 'dim', AP: 'dim' }
            },
            {
                text: '✓ Perfect when on one machine (RDBMS). Impractical for truly distributed systems.',
                nodeStates: { C: 'chosen', A: 'chosen', P: 'sacrificed' },
                edges: { CA: 'highlighted', CP: 'dim', AP: 'dim' }
            }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    'cp': 'CP System',
    'ap': 'AP System',
    'ca': 'CA System'
};

const PILLARS = [
    {
        id: 'consistency',
        letter: 'C',
        title: 'Consistency',
        icon: '🔒',
        colorClass: 'card-cyan',
        description: 'Every read receives the most recent write or an error. All nodes see the same data at the same time — no stale reads.',
        tags: [
            { text: 'Linearizable', highlight: 'hl-cyan' },
            { text: 'Strong', highlight: '' },
            { text: 'ACID', highlight: '' }
        ],
        example: 'Financial transactions, inventory counts, user auth — where stale data causes real harm'
    },
    {
        id: 'availability',
        letter: 'A',
        title: 'Availability',
        icon: '🟢',
        colorClass: 'card-green',
        description: 'Every request receives a non-error response, without guarantee that it contains the most recent write. The system is always operational.',
        tags: [
            { text: 'Always On', highlight: 'hl-green' },
            { text: 'No Downtime', highlight: '' },
            { text: 'Responsive', highlight: '' }
        ],
        example: 'Social media feeds, content delivery, shopping carts — where uptime beats precision'
    },
    {
        id: 'partition-tolerance',
        letter: 'P',
        title: 'Partition Tolerance',
        icon: '🌐',
        colorClass: 'card-orange',
        description: 'The system continues to operate despite arbitrary message loss or failure of part of the system. Network splits don\'t bring it down.',
        tags: [
            { text: 'Network Splits', highlight: 'hl-amber' },
            { text: 'Distributed', highlight: '' },
            { text: 'Fault Tolerant', highlight: '' }
        ],
        example: 'Any multi-node distributed database operating across multiple data centers or cloud regions'
    }
];

const KEY_CONCEPTS = [
    {
        title: 'Network Partitions are Inevitable',
        color: '#ffab00',
        desc: 'In distributed systems, network failures WILL happen. You cannot "choose" to skip partition tolerance — it\'s a reality. The real choice is between C and A during a partition.',
        example: 'Tip: Assume partitions will occur; focus on your C vs A trade-off strategy'
    },
    {
        title: 'Eventual Consistency',
        color: 'var(--cyan)',
        desc: 'AP systems often use eventual consistency: given enough time without new updates, all nodes will converge to the same value. It\'s not "no consistency" — just delayed.',
        example: 'Example: DNS propagation, DynamoDB, Cassandra default mode'
    },
    {
        title: 'PACELC Extension',
        color: 'var(--purple)',
        desc: 'CAP only describes behavior during partitions. PACELC adds: "Else, choose Latency or Consistency." Even without partitions, there\'s a latency-consistency trade-off.',
        example: 'PACELC: if Partition → A or C; Else → Latency or Consistency'
    }
];

const REAL_WORLD_EXAMPLES = [
    { name: 'MongoDB', icon: '🍃', type: 'cp', desc: 'Strongly consistent primary reads. During partition, minority side becomes read-only.' },
    { name: 'HBase', icon: '🏗️', type: 'cp', desc: 'Built on HDFS. Strong consistency via single RegionServer per region. Unavailable during region splits.' },
    { name: 'Redis Cluster', icon: '⚡', type: 'cp', desc: 'Hash-slot based sharding. During partition, minority nodes stop accepting writes.' },
    { name: 'Cassandra', icon: '💎', type: 'ap', desc: 'Tunable consistency. Default: eventual. Always writable, even during partitions.' },
    { name: 'DynamoDB', icon: '🟠', type: 'ap', desc: 'Eventually consistent reads by default. Designed for extreme availability.' },
    { name: 'CouchDB', icon: '🛋️', type: 'ap', desc: 'Multi-master replication. Continues working offline, syncs and resolves conflicts later.' },
    { name: 'PostgreSQL', icon: '🐘', type: 'ca', desc: 'Single-node: perfectly consistent + available. Not partition-tolerant by default.' },
    { name: 'MySQL', icon: '🐬', type: 'ca', desc: 'Traditional single-server RDBMS. Full ACID. Partitions require external tooling.' },
    { name: 'SQLite', icon: '📁', type: 'ca', desc: 'Embedded single-file database. No network = no partition concern. Perfect CA.' },
];

const COMPARISON = [
    { name: 'CP System', consistency: 5, availability: 2, partitionTol: 5, latency: 3, complexity: 4, bestFor: 'Financial systems, inventory, auth' },
    { name: 'AP System', consistency: 2, availability: 5, partitionTol: 5, latency: 5, complexity: 4, bestFor: 'Social feeds, CDN, shopping carts' },
    { name: 'CA System', consistency: 5, availability: 5, partitionTol: 1, latency: 5, complexity: 2, bestFor: 'Single-node RDBMS, embedded DBs' },
];

const MERMAID_CHART = `flowchart TD
    Client([👤 Client Request])
    Client --> Decision{Network Partition?}
    Decision -->|No Partition| CA[✅ Full C + A<br/>RDBMS / Single Node]
    Decision -->|Partition Occurs!| Choice{Choose One}
    Choice -->|Keep Consistency| CP[🔒 CP System<br/>Refuse stale requests]
    Choice -->|Keep Availability| AP[🟢 AP System<br/>Serve possibly stale data]
    CP --> CPResult[❌ Some requests fail<br/>✅ Data always correct]
    AP --> APResult[✅ All requests succeed<br/>⚠️ Data may diverge]
    CA --> CAResult[⚠️ Cannot handle partitions<br/>✅ Best for single-node]

    style Client fill:#1a1f2b,stroke:#ffab00,color:#fff
    style Decision fill:#1a1f2b,stroke:#ffab00,color:#fff
    style Choice fill:#1a1f2b,stroke:#ff6e40,color:#fff
    style CA fill:#1a2e1a,stroke:#3effa3,color:#fff
    style CP fill:#1a2030,stroke:#00e5ff,color:#fff
    style AP fill:#2a1f1a,stroke:#ffab00,color:#fff
    style CPResult fill:#0d1117,stroke:#00e5ff,color:#aaa
    style APResult fill:#0d1117,stroke:#ffab00,color:#aaa
    style CAResult fill:#0d1117,stroke:#3effa3,color:#aaa`;

const RESOURCES = [
    { title: "CAP Theorem — Brewer's Original Paper", type: "web", url: "https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf" },
    { title: "CAP Twelve Years Later — IEEE", type: "web", url: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/" },
    { title: "CAP Theorem Simplified by ByteByteGo", type: "youtube", url: "https://www.youtube.com/watch?v=BHqjEjzAicA" }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function CapTheoremGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activeScenario, setActiveScenario] = useState('cp');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const playScenario = useCallback((scenarioKey: string) => {
        setActiveScenario(scenarioKey);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        let t: NodeJS.Timeout;
        if (isPlaying) {
            const scenario = SCENARIOS[activeScenario];
            if (currentStepIdx < scenario.steps.length - 1) {
                const stepTime = currentStepIdx === -1 ? 1500 : 1800 * animationSpeed;
                t = setTimeout(() => {
                    setCurrentStepIdx(prev => prev + 1);
                }, stepTime);
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearTimeout(t);
    }, [isPlaying, currentStepIdx, activeScenario, animationSpeed]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const handleCardClick = (pillarId: string) => {
        const section = document.getElementById('action-section');
        section?.scrollIntoView({ behavior: 'smooth' });
        // Map pillar to scenario
        const scenarioMap: Record<string, string> = {
            'consistency': 'cp',
            'availability': 'ap',
            'partition-tolerance': 'ca'
        };
        setTimeout(() => playScenario(scenarioMap[pillarId] || 'cp'), 400);
    };

    const scenario = SCENARIOS[activeScenario];
    const currentStep = currentStepIdx >= 0 ? scenario.steps[currentStepIdx] : null;

    return (
        <GuideLayout
            githubPath="src/components/guides/system-design/CapTheoremGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            tags={guide.tags}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ PILLAR GRID ═══════════════ */}
            <h2 className="cap-section-title">The Three Pillars</h2>
            <div className="guide-concept-grid">
                {PILLARS.map((p) => (
                    <div
                        key={p.id}
                        className="guide-concept-card"
                        onClick={() => handleCardClick(p.id)}
                    >
                        <div className="guide-concept-header">
                            <div className="guide-concept-icon">{p.icon}</div>
                            <div className="guide-concept-name">{p.title}</div>
                        </div>
                        <div className="guide-concept-desc">{p.description}</div>
                        <div className="guide-concept-stats">
                            {p.tags.map(tag => (
                                <span key={tag.text} className={`cap-tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                        <div className="cap-card-info-sections">
                            <div className="cap-info-box">
                                <span className="cap-info-label">Use case:</span>
                                <span className="cap-info-value">{p.example}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Decision Flow</h2>
                <p className="viz-section-hint">How the CAP trade-off plays out when a partition occurs</p>
            </div>
            <div className="cap-mermaid-wrap">
                <pre className="mermaid">{MERMAID_CHART}</pre>
            </div>

            {/* ═══════════════ INTERACTIVE TRIANGLE ═══════════════ */}
            <div className="viz-section-header" id="action-section">
                <h2 className="viz-section-title">Interactive CAP Triangle</h2>
                <p className="viz-section-hint">Explore how systems choose between C, A, and P</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="cap-flow-controls" style={{ marginBottom: 0 }}>
                    {Object.keys(SCENARIOS).map(key => (
                        <button
                            key={key}
                            className={`cap-tab-btn ${activeScenario === key ? 'active' : ''}`}
                            onClick={() => playScenario(key)}
                        >
                            {TAB_LABELS[key]}
                        </button>
                    ))}
                </div>
                <div className="viz-playback-controls">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="viz-ctrl-btn"
                        aria-label={isPlaying ? "Pause Animation" : "Play Animation"}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={() => playScenario(activeScenario)}
                        className="viz-ctrl-btn"
                        aria-label="Replay Animation"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="viz-ctrl-btn"
                        aria-label="Settings"
                    >
                        <Settings size={14} />
                    </button>
                </div>
            </div>

            <div className="cap-flow-diagram">
                <div className="cap-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : '#ffab00'
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${scenario.steps.length}`}
                </div>

                <h3 className="cap-flow-title">
                    {scenario.title}
                </h3>

                {/* Triangle visualization */}
                <div className="cap-triangle-container">
                    <TriangleSVG edges={currentStep?.edges} />

                    <CAPNode
                        letter="C"
                        label="Consistency"
                        icon="🔒"
                        position="node-c"
                        state={currentStep?.nodeStates.C || 'idle'}
                    />
                    <CAPNode
                        letter="A"
                        label="Availability"
                        icon="🟢"
                        position="node-a"
                        state={currentStep?.nodeStates.A || 'idle'}
                    />
                    <CAPNode
                        letter="P"
                        label="Partition Tol."
                        icon="🌐"
                        position="node-p"
                        state={currentStep?.nodeStates.P || 'idle'}
                    />
                </div>

                {/* Steps */}
                <div className="cap-flow-steps">
                    {scenario.steps.map((step, i) => (
                        <div key={step.text} className={`cap-step ${currentStepIdx >= i ? 'visible' : ''} ${currentStepIdx === i ? 'current' : ''}`}>
                            <div className="cap-step-num">{i + 1}</div>
                            <div className="cap-step-body">
                                {step.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cap-legend">
                <div className="cap-legend-item">
                    <div className="cap-legend-box leg-chosen"></div> Chosen
                </div>
                <div className="cap-legend-item">
                    <div className="cap-legend-box leg-sacrificed"></div> Sacrificed
                </div>
                <div className="cap-legend-item">
                    <div className="cap-legend-box leg-active"></div> Active
                </div>
            </div>

            {/* ═══════════════ KEY CONCEPTS ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Key Concepts</h2>
                <p className="viz-section-hint">Essential insights for understanding CAP in practice</p>
            </div>
            <div className="cap-concepts-grid">
                {KEY_CONCEPTS.map((c) => (
                    <div key={c.title} className="cap-concept-card" style={{ '--card-color': c.color } as React.CSSProperties}>
                        <div className="cap-concept-title">{c.title}</div>
                        <div className="cap-concept-desc">{c.desc}</div>
                        <div className="cap-concept-example">{c.example}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ REAL-WORLD EXAMPLES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Real-World Examples</h2>
                <p className="viz-section-hint">Popular databases and their CAP classifications</p>
            </div>
            <div className="cap-examples-grid">
                {REAL_WORLD_EXAMPLES.map((ex) => (
                    <div key={ex.name} className="cap-example-card">
                        <div className="cap-example-header">
                            <span className="cap-example-icon">{ex.icon}</span>
                            <span className="cap-example-name">{ex.name}</span>
                            <span className={`cap-example-type ${ex.type}`}>{ex.type.toUpperCase()}</span>
                        </div>
                        <div className="cap-example-desc">{ex.desc}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Trade-off Comparison</h2>
                <p className="viz-section-hint">How each CAP choice affects system properties</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>System</th>
                            <th>Consistency</th>
                            <th>Availability</th>
                            <th>Partition Tol.</th>
                            <th>Latency</th>
                            <th>Complexity</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.consistency} /></td>
                                <td><Rating dots={row.availability} /></td>
                                <td><Rating dots={row.partitionTol} /></td>
                                <td><Rating dots={row.latency} /></td>
                                <td><Rating dots={row.complexity} /></td>
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

function CAPNode({ letter, label, icon, position, state }: Readonly<{
    letter: string;
    label: string;
    icon: string;
    position: string;
    state: NodeState;
}>) {
    return (
        <div className={`cap-tri-node ${position}`}>
            <div className={`cap-tri-box ${state}`}>
                <span className="cap-tri-icon">{icon}</span>
                <span className="cap-tri-abbr">{letter}</span>
            </div>
            <div className="cap-tri-label">{label}</div>
        </div>
    );
}

function TriangleSVG({ edges }: Readonly<{ edges?: Record<string, 'highlighted' | 'dim' | 'normal'> }>) {
    const getEdgeClass = (key: string) => {
        if (!edges) return '';
        return edges[key] || '';
    };

    // Triangle coords: C at top-center, A at bottom-left, P at bottom-right
    // Node size is 90x90, offset to center of node
    return (
        <svg className="cap-triangle-edge" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
        }}>
            {/* C to A */}
            <line x1="50%" y1="55" x2="45" y2="72%" className={getEdgeClass('CA')} />
            {/* C to P */}
            <line x1="50%" y1="55" x2="calc(100% - 45px)" y2="72%" className={getEdgeClass('CP')} />
            {/* A to P */}
            <line x1="45" y1="calc(100% - 60px)" x2="calc(100% - 45px)" y2="calc(100% - 60px)" className={getEdgeClass('AP')} />
        </svg>
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="cap-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`cap-dot ${i <= dots ? 'on' : ''}`} />
            ))}
        </div>
    );
}

function ResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'book': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Database, Share2, Globe, BookOpen, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/database/replication.css';

const guide = guidesData.guides.find(v => v.id === "database-replication")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type DBNode = {
    id: string;
    role: 'leader' | 'follower' | 'peer';
    data: number; // version number
    status: 'healthy' | 'writing' | 'reading' | 'lagging';
};

type Step = {
    text: string;
    activeNodes?: string[]; // IDs to highlight
    packet?: { from: string, to: string, type: 'write' | 'ack' | 'read' };
    stateUpdate?: Record<string, number>; // id -> new data version
};

type Pattern = {
    title: string;
    desc: string;
    nodes: DBNode[];
    steps: Step[];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'async': {
        title: 'Asynchronous Replication',
        desc: 'Leader confirms write immediately, then replicates. Fast but potential data loss.',
        nodes: [
            { id: 'L1', role: 'leader', data: 100, status: 'healthy' },
            { id: 'F1', role: 'follower', data: 100, status: 'healthy' },
            { id: 'F2', role: 'follower', data: 100, status: 'healthy' }
        ],
        steps: [
            { text: 'Client sends write request (v101) to Leader', activeNodes: ['L1'], packet: { from: 'Client', to: 'L1', type: 'write' } },
            { text: 'Leader writes v101 locally', activeNodes: ['L1'], stateUpdate: { L1: 101 } },
            { text: 'Leader acknowledges Client ("Success!")', activeNodes: ['L1'], packet: { from: 'L1', to: 'Client', type: 'ack' } },
            { text: 'Leader sends replication log to Follower 1', activeNodes: ['L1', 'F1'], packet: { from: 'L1', to: 'F1', type: 'write' } },
            { text: 'Leader sends replication log to Follower 2', activeNodes: ['L1', 'F2'], packet: { from: 'L1', to: 'F2', type: 'write' } },
            { text: 'Follower 1 updates to v101', activeNodes: ['F1'], stateUpdate: { F1: 101 } },
            { text: 'Follower 2 updates to v101 (Eventual Consistency)', activeNodes: ['F2'], stateUpdate: { F2: 101 } }
        ]
    },
    'sync': {
        title: 'Synchronous Replication',
        desc: 'Leader waits for ack from followers. Durable but slower latency.',
        nodes: [
            { id: 'L1', role: 'leader', data: 100, status: 'healthy' },
            { id: 'F1', role: 'follower', data: 100, status: 'healthy' },
            { id: 'F2', role: 'follower', data: 100, status: 'healthy' }
        ],
        steps: [
            { text: 'Client sends write request (v101)', activeNodes: ['L1'], packet: { from: 'Client', to: 'L1', type: 'write' } },
            { text: 'Leader writes v101 locally', activeNodes: ['L1'], stateUpdate: { L1: 101 } },
            { text: 'Leader forwards to Follower 1', activeNodes: ['L1', 'F1'], packet: { from: 'L1', to: 'F1', type: 'write' } },
            { text: 'Follower 1 writes v101', activeNodes: ['F1'], stateUpdate: { F1: 101 } },
            { text: 'Follower 1 sends ACK to Leader', activeNodes: ['F1', 'L1'], packet: { from: 'F1', to: 'L1', type: 'ack' } },
            { text: 'Leader finally acknowledges Client', activeNodes: ['L1'], packet: { from: 'L1', to: 'Client', type: 'ack' } },
        ]
    },
    'quorum': {
        title: 'Leaderless (Quorum)',
        desc: 'Write to W nodes, Read from R nodes. W + R > N ensures consistency.',
        nodes: [
            { id: 'N1', role: 'peer', data: 100, status: 'healthy' },
            { id: 'N2', role: 'peer', data: 100, status: 'healthy' },
            { id: 'N3', role: 'peer', data: 100, status: 'healthy' }
        ],
        steps: [
            { text: 'Client sends write (v101) to all nodes', activeNodes: [], packet: { from: 'Client', to: 'All', type: 'write' } },
            { text: 'Node 1 & 2 accept write (v101)', activeNodes: ['N1', 'N2'], stateUpdate: { N1: 101, N2: 101 } },
            { text: 'Node 3 fails or is slow (stays v100)', activeNodes: ['N3'], stateUpdate: { N3: 100 } },
            { text: 'Quorum met (2/3). Client receives ACK.', packet: { from: 'N1', to: 'Client', type: 'ack' } },
            { text: 'Read: Client queries all nodes', packet: { from: 'Client', to: 'All', type: 'read' } },
            { text: 'Client receives v101, v101, v100', activeNodes: ['N1', 'N2', 'N3'] },
            { text: 'Client determines v101 is latest (Read Repair)', activeNodes: [] }
        ]
    }
};

const COMPARISON = [
    { mode: "Single-Leader", active: true, scale: "Read Only", complex: "Low", use: "Web apps, CMS" },
    { mode: "Multi-Leader", active: true, scale: "Read/Write", complex: "High", use: "Global apps, Offline clients" },
    { mode: "Leaderless", active: true, scale: "High Avail.", complex: "Med", use: "Available-first (DynamoDB)" },
];

const RESOURCES = [
    { title: "Designing Data-Intensive Applications (DDIA)", type: "book", url: "https://dataintensive.net/" },
    { title: "PostgreSQL Replication Guide", type: "web", url: "https://www.postgresql.org/docs/current/high-availability.html" },
    { title: "MongoDB Replica Sets", type: "web", url: "https://www.mongodb.com/docs/manual/replication/" },
];

const REPLICATION_STRATEGIES = [
    {
        id: 'async',
        title: 'Asynchronous',
        description: 'Leader acknowledges write immediately. Replicates to followers in background.',
        icon: <Zap size={20} />,
        color: 'var(--orange)',
        colorClass: 'card-orange',
        stats: [
            { text: 'Fast Write', highlight: true },
            { text: 'Lag Possible', highlight: false }
        ]
    },
    {
        id: 'sync',
        title: 'Synchronous',
        description: 'Leader waits for followers to acknowledge write before confirming to client.',
        icon: <ShieldCheck size={20} />,
        color: 'var(--blue)',
        colorClass: 'card-blue',
        stats: [
            { text: 'No Data Loss', highlight: true },
            { text: 'Slower', highlight: false }
        ]
    },
    {
        id: 'quorum',
        title: 'Leaderless',
        description: 'No single leader. Read/write to multiple nodes (Quorum). Handles node failures well.',
        icon: <Share2 size={20} />,
        color: 'var(--purple)',
        colorClass: 'card-purple',
        stats: [
            { text: 'High Avail', highlight: true },
            { text: 'Complex', highlight: false }
        ]
    }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function DatabaseReplicationGuide({
    initialPattern = 'async'
}: {
    initialPattern?: string
}) {
    const guideData = guide!;

    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState(initialPattern);

    // Animation State
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [nodes, setNodes] = useState<DBNode[]>([]);

    const animRef = useRef<NodeJS.Timeout[]>([]);

    const activePattern = FLOW_PATTERNS[activePatternKey];

    // Reset nodes when pattern changes
    useEffect(() => {
        setNodes(structuredClone(FLOW_PATTERNS[activePatternKey].nodes));
    }, [activePatternKey]);

    const scheduleStep = useCallback((step: Step, i: number, stepTime: number) => {
        const t = setTimeout(() => {
            setCurrentStepIdx(i);

            // Update Node State if needed
            if (step.stateUpdate) {
                setNodes(prev => prev.map(n => {
                    if (step.stateUpdate![n.id] !== undefined) {
                        return { ...n, data: step.stateUpdate![n.id], status: 'writing' };
                    }
                    return n;
                }));

                // Clear writing status after a bit
                const tReset = setTimeout(() => {
                    setNodes(prev => prev.map(n => ({ ...n, status: 'healthy' })));
                }, 800 * animationSpeed);
                animRef.current.push(tReset);
            }

        }, i * stepTime);
        animRef.current.push(t);
    }, [animationSpeed]);

    const playPattern = useCallback((patternKey: string) => {
        // Clear existing
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActivePatternKey(patternKey);
        setCurrentStepIdx(-1);

        // Reset nodes
        const startNodes = structuredClone(FLOW_PATTERNS[patternKey].nodes);
        setNodes(startNodes);

        const pattern = FLOW_PATTERNS[patternKey];
        const stepTime = 2000 * animationSpeed;

        pattern.steps.forEach((step, i) => {
            scheduleStep(step, i, stepTime);
        });

    }, [animationSpeed, scheduleStep]);

    useEffect(() => {
        const t = setTimeout(() => playPattern(activePatternKey || 'async'), 500);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playPattern, activePatternKey]);

    const handleReplay = () => {
        setReplayCount(prev => prev + 1);
    };

    return (
        <GuideLayout
            category={guideData.category}
            title={guideData.title}
            description={guideData.description}
            primaryColor={guideData.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guideData.contributors}
        >
            {/* ═══════════════ CARDS GRID ═══════════════ */}
            <h2 className="section-title">Replication Strategies</h2>
            <div className="rep-grid">
                {REPLICATION_STRATEGIES.map((s) => (
                    <div
                        key={s.id}
                        className={`viz-card rep-card ${s.colorClass}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            const section = document.getElementById('action-section');
                            section?.scrollIntoView({ behavior: 'smooth' });
                            playPattern(s.id);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const section = document.getElementById('action-section');
                                section?.scrollIntoView({ behavior: 'smooth' });
                                playPattern(s.id);
                            }
                        }}
                    >
                        <div className="rep-card-header">
                            <div className="rep-card-icon" style={{ color: s.color }}>{s.icon}</div>
                            <div className="rep-card-name">{s.title}</div>
                        </div>
                        <p className="rep-card-desc">{s.description}</p>
                        <div className="rep-card-stats">
                            {s.stats.map(stat => (
                                <span key={stat.text} className={`rep-stat-chip ${stat.highlight ? 'hi' : ''}`}>
                                    {stat.text}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ VISUALIZATION ═══════════════ */}
            <div className="viz-section-header" id="action-section">
                <h2 className="viz-section-title">Replication Flow</h2>
                <p className="viz-section-hint">Visualize how data propagates across nodes</p>
            </div>

            <div className="rep-flow-section">
                <div className="rep-flow-controls">
                    {Object.keys(FLOW_PATTERNS).map(key => (
                        <button
                            key={key}
                            className={`rep-flow-btn ${activePatternKey === key ? 'active' : ''}`}
                            onClick={() => playPattern(key)}
                        >
                            {FLOW_PATTERNS[key].title}
                        </button>
                    ))}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="social-btn"
                        style={{
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer'
                        }}
                    >
                        <Settings size={14} color="var(--text-dim)" />
                    </button>
                </div>

                <div className="rep-flow-diagram">
                    {/* Client */}
                    <div className="rep-client-section">
                        <div className="rep-client-node">👤 Client Application</div>
                        {currentStepIdx >= 0 && activePattern.steps[currentStepIdx].packet?.from === 'Client' && (
                            <div className="rep-pulse-emitter" />
                        )}
                    </div>

                    <div className="rep-arrow-down">⬇</div>

                    {/* Nodes Container */}
                    <div className="rep-server-pool">
                        {nodes.map((node, i) => (
                            <NodeDisplay
                                key={node.id}
                                node={node}
                                isActive={currentStepIdx >= 0 && activePattern.steps[currentStepIdx].activeNodes?.includes(node.id)}
                            />
                        ))}
                    </div>

                    {/* Packet Animation Overlay - simplified conceptual rep */}
                    <PacketOverlay step={currentStepIdx >= 0 ? activePattern.steps[currentStepIdx] : null} />

                    {/* Steps List */}
                    <div className="rep-flow-steps">
                        {activePattern.steps.map((step, i) => (
                            <div key={step.text + i} className={`rep-step ${currentStepIdx === i ? 'active' : ''}`}>
                                <div className="rep-step-num">{i + 1}</div>
                                <div className="rep-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="rep-replay-btn" onClick={() => playPattern(activePatternKey!)}>
                    ↺ Replay Animation
                </button>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Architecture Comparison</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Mode</th>
                            <th>Active Replication</th>
                            <th>Scaling Profile</th>
                            <th>Complexity</th>
                            <th>Best Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.mode}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.mode}</td>
                                <td>{row.active ? "Yes" : "No"}</td>
                                <td>{row.scale}</td>
                                <td>{row.complex}</td>
                                <td style={{ color: 'var(--text-dim)' }}>{row.use}</td>
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
                            <th>Title</th>
                            <th>Type</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCES.map((res) => (
                            <tr key={res.title}>
                                <td style={{ fontWeight: 600 }}>{res.title}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {res.type === 'book' ? <BookOpen size={16} /> : <Globe size={16} />}
                                        <span style={{ textTransform: 'capitalize' }}>{res.type}</span>
                                    </div>
                                </td>
                                <td>
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--blue)' }}>
                                        Open <ExternalLink size={12} style={{ display: 'inline' }} />
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

function NodeDisplay({ node, isActive }: { node: DBNode, isActive: boolean | undefined }) {
    return (
        <div className={`rep-node-wrapper`}>
            <div className={`rep-node ${node.role} ${isActive ? 'write-flash' : ''}`}>
                <div className="rep-node-role">{node.role}</div>
                <Database size={32} color={node.role === 'leader' ? 'var(--orange)' : 'var(--blue)'} />
                <div className="rep-node-name">{node.id}</div>
                <div className={`rep-node-data ${node.status === 'writing' ? 'updated' : ''}`}>
                    v{node.data}
                </div>
            </div>
        </div>
    );
}

function PacketOverlay({ step }: { step: Step | null }) {
    if (!step || !step.packet) return null;

    // This is a simplified visual representation of "something moving"
    // In a full implementation, we would calculate coordinates based on DOM positions
    // For now, we'll use a CSS animation on the container or just rely on the flash effects

    return (
        <div className="rep-packet-overlay" style={{
            position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)',
            pointerEvents: 'none', opacity: 0.8
        }}>
            {/* Visual cue for packet direction is handled by the steps text and highlight for now */}
        </div>
    );
}

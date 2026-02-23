"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Globe, BookOpen, Youtube, ExternalLink } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/database/database-sharding.css';

const guide = guidesData.guides.find(v => v.id === "database-sharding")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type ShardState = 'idle' | 'active' | 'target' | 'overflow' | 'migrating' | 'dimmed';

type Step = {
    text: string;
    shardStates: Record<string, ShardState>;
    clientActive?: boolean;
    routerActive?: boolean;
    highlightKey?: string;
};

type Strategy = {
    title: string;
    subtitle: string;
    steps: Step[];
};

const STRATEGIES: Record<string, Strategy> = {
    range: {
        title: 'Range-Based Sharding',
        subtitle: 'Split data by value ranges (e.g., user IDs 1–1M on Shard A)',
        steps: [
            {
                text: 'Client sends a write for user_id = 750,000',
                shardStates: { A: 'idle', B: 'idle', C: 'idle' },
                clientActive: true,
                routerActive: false
            },
            {
                text: 'Router checks range map: 1–1M → Shard A',
                shardStates: { A: 'active', B: 'dimmed', C: 'dimmed' },
                clientActive: true,
                routerActive: true,
                highlightKey: 'A'
            },
            {
                text: 'Write routed directly to Shard A (O(1) lookup)',
                shardStates: { A: 'target', B: 'dimmed', C: 'dimmed' },
                clientActive: false,
                routerActive: true
            },
            {
                text: '⚠ Hot-spot risk: if most active users are 1–1M, Shard A gets overloaded',
                shardStates: { A: 'overflow', B: 'idle', C: 'idle' },
                clientActive: false,
                routerActive: false
            },
            {
                text: '✓ Great for range scans (e.g., "all orders between Jan–Mar"). Needs reshard plan for skew.',
                shardStates: { A: 'target', B: 'idle', C: 'idle' },
                clientActive: false,
                routerActive: false
            }
        ]
    },
    hash: {
        title: 'Hash-Based Sharding',
        subtitle: 'Apply hash(key) % N to evenly distribute writes across shards',
        steps: [
            {
                text: 'Client writes record with key "order_9821"',
                shardStates: { A: 'idle', B: 'idle', C: 'idle' },
                clientActive: true,
                routerActive: false
            },
            {
                text: 'Router computes: hash("order_9821") % 3 = 1 → Shard B',
                shardStates: { A: 'dimmed', B: 'active', C: 'dimmed' },
                clientActive: true,
                routerActive: true,
                highlightKey: 'B'
            },
            {
                text: 'Write is sent to Shard B — uniform distribution prevents hot-spots',
                shardStates: { A: 'dimmed', B: 'target', C: 'dimmed' },
                clientActive: false,
                routerActive: true
            },
            {
                text: '⚠ Adding a 4th shard changes N → almost all keys must re-map (resharding pain)',
                shardStates: { A: 'migrating', B: 'migrating', C: 'migrating' },
                clientActive: false,
                routerActive: false
            },
            {
                text: '✓ Best for uniform write throughput. Combine with Consistent Hashing to ease resharding.',
                shardStates: { A: 'idle', B: 'target', C: 'idle' },
                clientActive: false,
                routerActive: false
            }
        ]
    },
    directory: {
        title: 'Directory-Based Sharding',
        subtitle: 'A lookup table maps each key (or tenant) to a specific shard',
        steps: [
            {
                text: 'Client request for tenant "acme-corp"',
                shardStates: { A: 'idle', B: 'idle', C: 'idle' },
                clientActive: true,
                routerActive: false
            },
            {
                text: 'Router queries the Shard Directory service',
                shardStates: { A: 'idle', B: 'idle', C: 'idle' },
                clientActive: true,
                routerActive: true
            },
            {
                text: 'Directory returns: "acme-corp" → Shard C',
                shardStates: { A: 'dimmed', B: 'dimmed', C: 'active' },
                clientActive: false,
                routerActive: true,
                highlightKey: 'C'
            },
            {
                text: 'Request routed to Shard C — any shard logic can be applied per tenant',
                shardStates: { A: 'dimmed', B: 'dimmed', C: 'target' },
                clientActive: false,
                routerActive: false
            },
            {
                text: '✓ Maximally flexible — move tenants between shards without changing app code. Directory is a SPOF.',
                shardStates: { A: 'idle', B: 'idle', C: 'target' },
                clientActive: false,
                routerActive: false
            }
        ]
    },
    consistent: {
        title: 'Consistent Hashing',
        subtitle: 'Nodes and keys are placed on a virtual ring — only ~K/N keys move when a shard is added/removed',
        steps: [
            {
                text: 'Shards A, B, C are placed at positions on a hash ring',
                shardStates: { A: 'idle', B: 'idle', C: 'idle' },
                clientActive: false,
                routerActive: false
            },
            {
                text: 'Key "user_42" hashes to position 210° on the ring → nearest shard clockwise is B',
                shardStates: { A: 'dimmed', B: 'active', C: 'dimmed' },
                clientActive: true,
                routerActive: true,
                highlightKey: 'B'
            },
            {
                text: 'Shard B is added or removed — only keys between B\'s predecessor and B must move',
                shardStates: { A: 'idle', B: 'migrating', C: 'idle' },
                clientActive: false,
                routerActive: false
            },
            {
                text: '~K/N keys migrate (1/3 with 3 nodes) — far better than full hash reshard',
                shardStates: { A: 'target', B: 'idle', C: 'idle' },
                clientActive: false,
                routerActive: false
            },
            {
                text: '✓ Used by Cassandra, DynamoDB. Add virtual nodes (vnodes) to improve balance.',
                shardStates: { A: 'target', B: 'idle', C: 'idle' },
                clientActive: false,
                routerActive: false
            }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    range: 'Range',
    hash: 'Hash',
    directory: 'Directory',
    consistent: 'Consistent Hash'
};

const SHARDING_CONCEPTS = [
    {
        id: 'range',
        title: 'Range Sharding',
        icon: '📏',
        colorClass: 'card-cyan',
        color: 'var(--cyan)',
        description: 'Data is split by a contiguous range of key values. Simple to implement and supports efficient range queries.',
        tags: [
            { text: 'Range Queries', highlight: 'hl-cyan' },
            { text: 'Simple Router', highlight: '' },
            { text: 'Hot-spot Risk', highlight: '' }
        ],
        example: 'Use case: time-series data, ordered user IDs, date-partitioned event logs'
    },
    {
        id: 'hash',
        title: 'Hash Sharding',
        icon: '#️⃣',
        colorClass: 'card-purple',
        color: 'var(--purple)',
        description: "hash(key) % N assigns each record to a shard. Guarantees even distribution but makes range queries inefficient.",
        tags: [
            { text: 'Uniform Load', highlight: 'hl-purple' },
            { text: 'O(1) Route', highlight: '' },
            { text: 'Reshard Pain', highlight: '' }
        ],
        example: 'Use case: user profiles, social media posts, key-value stores'
    },
    {
        id: 'directory',
        title: 'Directory Sharding',
        icon: '🗂️',
        colorClass: 'card-orange',
        color: 'var(--orange)',
        description: 'A shard lookup table maps keys or tenants to specific shards. Maximum flexibility — relocate data without hash changes.',
        tags: [
            { text: 'Flexible', highlight: 'hl-amber' },
            { text: 'Multi-Tenant', highlight: '' },
            { text: 'SPOF Risk', highlight: '' }
        ],
        example: 'Use case: SaaS multi-tenancy, compliance isolation, VIP customer data placement'
    },
    {
        id: 'consistent',
        title: 'Consistent Hashing',
        icon: '🔄',
        colorClass: 'card-green',
        color: 'var(--green)',
        description: "Keys and nodes share a virtual ring. Adding/removing a shard only moves ~K/N keys — minimal data migration.",
        tags: [
            { text: 'Elastic Scale', highlight: 'hl-green' },
            { text: 'Hash Ring', highlight: '' },
            { text: 'VNodes', highlight: '' }
        ],
        example: 'Use case: Cassandra, DynamoDB, Redis cluster, CDN edge caches'
    }
];

const KEY_CONCEPTS = [
    {
        title: 'Why Shard at All?',
        color: '#7c4dff',
        desc: "A single DB node has hard limits on storage, connections, and write throughput. Sharding horizontally scales the data tier by splitting the dataset across N independent nodes — each owns a fraction of the keyspace.",
        example: 'Rule of thumb: shard when single-node query latency degrades or storage exceeds 70% capacity'
    },
    {
        title: 'Cross-Shard Queries',
        color: 'var(--cyan)',
        desc: 'Queries that span multiple shards require scatter-gather: fan out to all shards in parallel, then merge. This adds latency and complexity — good schema design minimises cross-shard joins.',
        example: 'Strategy: co-locate related data (user + orders) on the same shard using a tenant/user key'
    },
    {
        title: 'Rebalancing & Hotspots',
        color: 'var(--orange)',
        desc: 'Load skew happens when one shard receives far more traffic than others. Mitigation: consistent hashing with virtual nodes, or pre-splitting with range sharding. Plan for rebalancing from day one.',
        example: 'Hotspot example: viral posts, celebrity users, high-frequency trading keys'
    }
];

const REAL_WORLD_EXAMPLES = [
    { name: 'Cassandra', icon: '💎', strategy: 'consistent', desc: 'Uses consistent hashing with configurable virtual nodes (vnodes) per node. Fully peer-to-peer — no single coordinator.' },
    { name: 'DynamoDB', icon: '🟠', strategy: 'consistent', desc: "AWS's managed NoSQL uses a variant of consistent hashing. Partition key maps to a token range; multiple replicas per token." },
    { name: 'MySQL (Vitess)', icon: '🐬', strategy: 'range', desc: 'Vitess shards MySQL with a keyspace range approach. Used by YouTube and Slack for billions of rows across many shards.' },
    { name: 'MongoDB', icon: '🍃', strategy: 'range/hash', desc: 'Supports both range and hash (hashed index) sharding. A config server stores chunk-to-shard mappings.' },
    { name: 'Redis Cluster', icon: '⚡', strategy: 'hash', desc: 'Divides keyspace into 16,384 hash slots. Each master owns a subset. Gossip protocol tracks slot ownership.' },
    { name: 'Twitter Snowflake', icon: '🐦', strategy: 'directory', desc: 'ID generation service distributes ID blocks to hosts — a form of directory-based pre-allocation sharding.' }
];

const COMPARISON = [
    { strategy: 'Range', hotspot: 2, rangeQuery: 5, reshardEase: 3, complexity: 2, bestFor: 'Time-series, ordered IDs' },
    { strategy: 'Hash', hotspot: 5, rangeQuery: 1, reshardEase: 2, complexity: 2, bestFor: 'Uniform key-value stores' },
    { strategy: 'Directory', hotspot: 4, rangeQuery: 4, reshardEase: 5, complexity: 4, bestFor: 'Multi-tenant SaaS, compliance' },
    { strategy: 'Consistent Hash', hotspot: 5, rangeQuery: 2, reshardEase: 5, complexity: 4, bestFor: 'Distributed caches, NoSQL' }
];

const MERMAID_CHART = `flowchart TD
    Client([👤 Client Request])
    Router{🔀 Shard Router}
    Client --> Router
    Router -->|Range Map| ShardA[(🗄 Shard A\\nID 1–1M)]
    Router -->|Hash Slot 0–5460| ShardB[(🗄 Shard B\\nSlots 0–5460)]
    Router -->|Directory Lookup| ShardC[(🗄 Shard C\\nTenant acme-corp)]
    ShardA --> RA[(🔁 Replica A)]
    ShardB --> RB[(🔁 Replica B)]
    ShardC --> RC[(🔁 Replica C)]

    style Client fill:#1a1f2b,stroke:#7c4dff,color:#fff
    style Router fill:#1a1f2b,stroke:#7c4dff,color:#fff
    style ShardA fill:#12161f,stroke:#00e5ff,color:#fff
    style ShardB fill:#12161f,stroke:#7c4dff,color:#fff
    style ShardC fill:#12161f,stroke:#ff9f1c,color:#fff
    style RA fill:#0d1117,stroke:#00e5ff,color:#aaa
    style RB fill:#0d1117,stroke:#7c4dff,color:#aaa
    style RC fill:#0d1117,stroke:#ff9f1c,color:#aaa`;

const RESOURCES = [
    { title: 'Database Sharding Explained by ByteByteGo', type: 'youtube', url: 'https://www.youtube.com/watch?v=5faMjKuB9bc' },
    { title: 'Database Sharding: A System Design Concept', type: 'web', url: 'https://www.geeksforgeeks.org/system-design/database-sharding-a-system-design-concept/' },
    { title: 'Understanding Database Sharding', type: 'web', url: 'https://www.digitalocean.com/community/tutorials/understanding-database-sharding' },
    { title: 'Cassandra Consistent Hashing Docs', type: 'web', url: 'https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html' }
];

const SHARD_LABELS: Record<string, { label: string; range: string }> = {
    A: { label: 'Shard A', range: 'IDs 1–1M' },
    B: { label: 'Shard B', range: 'IDs 1M–2M' },
    C: { label: 'Shard C', range: 'IDs 2M+' }
};

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function DatabaseShardingGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activeStrategy, setActiveStrategy] = useState<string>('range');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playStrategy = useCallback((key: string) => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActiveStrategy(key);
        setCurrentStepIdx(-1);

        const strategy = STRATEGIES[key];
        const stepTime = 1800 * animationSpeed;

        strategy.steps.forEach((_, i) => {
            const t = setTimeout(() => {
                setCurrentStepIdx(i);
            }, i * stepTime + 300);
            animRef.current.push(t);
        });
    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playStrategy('range'), 1200);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playStrategy]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const handleCardClick = (id: string) => {
        const section = document.getElementById('shard-action-section');
        section?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => playStrategy(id), 400);
    };

    const strategy = STRATEGIES[activeStrategy];
    const currentStep = currentStepIdx >= 0 ? strategy.steps[currentStepIdx] : null;

    return (
        <GuideLayout
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ STRATEGY CARDS ═══════════════ */}
            <h2 className="shard-section-title">Sharding Strategies</h2>
            <div className="shard-grid">
                {SHARDING_CONCEPTS.map((s) => (
                    <div
                        key={s.id}
                        className={`viz-card shard-card ${s.colorClass}`}
                        onClick={() => handleCardClick(s.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCardClick(s.id);
                            }
                        }}
                    >
                        <div className="shard-card-header">
                            <div className="shard-card-icon">{s.icon}</div>
                            <div className="shard-card-title">{s.title}</div>
                        </div>
                        <div className="shard-card-description">{s.description}</div>
                        <div className="shard-card-tags">
                            {s.tags.map(tag => (
                                <span key={tag.text} className={`shard-tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                        <div className="shard-info-box">
                            <span className="shard-info-label">Use case:</span>
                            <span className="shard-info-value">{s.example}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Architecture Overview</h2>
                <p className="viz-section-hint">How a shard router distributes requests across database shards with replicas</p>
            </div>
            <div className="shard-mermaid-wrap">
                <pre className="mermaid">{MERMAID_CHART}</pre>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" id="shard-action-section">
                <h2 className="viz-section-title">Interactive Sharding Flow</h2>
                <p className="viz-section-hint">Step through each strategy to see how a write is routed</p>
            </div>

            {/* Tab controls + settings/replay */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="shard-flow-controls" style={{ marginBottom: 0 }}>
                    {Object.keys(STRATEGIES).map(key => (
                        <button
                            key={key}
                            className={`shard-tab-btn ${activeStrategy === key ? 'active' : ''}`}
                            onClick={() => playStrategy(key)}
                        >
                            {TAB_LABELS[key]}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '1px solid var(--border2)', background: 'var(--surface)',
                        color: 'var(--text-dim)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
                    }}
                    className="social-btn"
                    aria-label="Settings"
                >
                    <Settings size={14} />
                </button>
                <button
                    onClick={() => playStrategy(activeStrategy)}
                    style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '1px solid var(--border2)', background: 'var(--surface)',
                        color: 'var(--text-dim)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
                    }}
                    className="social-btn"
                    aria-label="Replay Animation"
                >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '-2px' }}>↺</span>
                </button>
            </div>

            {/* Flow diagram */}
            <div className="shard-flow-diagram">
                <div className="shard-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : '#7c4dff'
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${strategy.steps.length}`}
                </div>

                <h3 className="shard-flow-title">{strategy.title}</h3>
                <p className="shard-flow-subtitle">{strategy.subtitle}</p>

                {/* Visualization canvas */}
                <div className="shard-canvas">
                    {/* Client */}
                    <div className={`shard-client-node ${currentStep?.clientActive ? 'active' : ''}`}>
                        <span className="shard-node-icon">👤</span>
                        <span className="shard-node-label">Client</span>
                    </div>

                    {/* Arrow down */}
                    <div className="shard-arrow-v">↓</div>

                    {/* Router */}
                    <div className={`shard-router-node ${currentStep?.routerActive ? 'active' : ''}`}>
                        <span className="shard-node-icon">🔀</span>
                        <span className="shard-node-label">Shard Router</span>
                        {currentStep?.routerActive && currentStep.highlightKey && (
                            <span className="shard-router-badge">→ Shard {currentStep.highlightKey}</span>
                        )}
                    </div>

                    {/* Arrow down */}
                    <div className="shard-arrow-v">↓</div>

                    {/* Shard nodes */}
                    <div className="shard-nodes-row">
                        {(['A', 'B', 'C'] as const).map(id => (
                            <ShardNode
                                key={id}
                                shardId={id}
                                state={currentStep?.shardStates[id] || 'idle'}
                                label={SHARD_LABELS[id].label}
                                range={SHARD_LABELS[id].range}
                            />
                        ))}
                    </div>
                </div>

                {/* Steps log */}
                <div className="shard-flow-steps">
                    {strategy.steps.map((step, i) => (
                        <div
                            key={step.text}
                            className={`shard-step ${currentStepIdx >= i ? 'visible' : ''} ${currentStepIdx === i ? 'current' : ''}`}
                        >
                            <div className="shard-step-num">{i + 1}</div>
                            <div className="shard-step-body">{step.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="shard-legend">
                {[
                    { cls: 'leg-target', label: 'Routed Target' },
                    { cls: 'leg-active', label: 'Processing' },
                    { cls: 'leg-overflow', label: 'Overloaded' },
                    { cls: 'leg-migrating', label: 'Migrating' }
                ].map(l => (
                    <div key={l.label} className="shard-legend-item">
                        <div className={`shard-legend-box ${l.cls}`} />
                        {l.label}
                    </div>
                ))}
            </div>

            {/* ═══════════════ KEY CONCEPTS ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Key Concepts</h2>
                <p className="viz-section-hint">Critical insights every engineer should understand about sharding</p>
            </div>
            <div className="shard-concepts-grid">
                {KEY_CONCEPTS.map((c) => (
                    <div key={c.title} className="shard-concept-card" style={{ '--card-color': c.color } as React.CSSProperties}>
                        <div className="shard-concept-title">{c.title}</div>
                        <div className="shard-concept-desc">{c.desc}</div>
                        <div className="shard-concept-example">{c.example}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ REAL-WORLD EXAMPLES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Real-World Examples</h2>
                <p className="viz-section-hint">How popular databases implement sharding</p>
            </div>
            <div className="shard-examples-grid">
                {REAL_WORLD_EXAMPLES.map((ex) => (
                    <div key={ex.name} className="shard-example-card">
                        <div className="shard-example-header">
                            <span className="shard-example-icon">{ex.icon}</span>
                            <span className="shard-example-name">{ex.name}</span>
                            <span className="shard-example-strategy">{ex.strategy}</span>
                        </div>
                        <div className="shard-example-desc">{ex.desc}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Strategy Comparison</h2>
                <p className="viz-section-hint">Trade-offs at a glance across all four sharding strategies</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Strategy</th>
                            <th>Hotspot Resistance</th>
                            <th>Range Query</th>
                            <th>Reshard Ease</th>
                            <th>Complexity</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.strategy}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.strategy}</td>
                                <td><Rating dots={row.hotspot} /></td>
                                <td><Rating dots={row.rangeQuery} /></td>
                                <td><Rating dots={row.reshardEase} /></td>
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
                            <th style={{ width: '45%' }}>Title</th>
                            <th style={{ width: '15%' }}>Type</th>
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
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            color: 'var(--blue)', textDecoration: 'none', fontSize: '0.9rem'
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

function ShardNode({ shardId, state, label, range }: Readonly<{
    shardId: string;
    state: ShardState;
    label: string;
    range: string;
}>) {
    const icons: Record<ShardState, string> = {
        idle: '🗄️',
        active: '⚡',
        target: '✅',
        overflow: '🔥',
        migrating: '🔄',
        dimmed: '🗄️'
    };

    return (
        <div className={`shard-db-node ${state}`}>
            <span className="shard-db-icon">{icons[state]}</span>
            <span className="shard-db-label">{label}</span>
            <span className="shard-db-range">{range}</span>
        </div>
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="shard-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`shard-dot ${i <= dots ? 'on' : ''}`} />
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

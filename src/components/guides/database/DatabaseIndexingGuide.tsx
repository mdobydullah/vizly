"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Globe, BookOpen, Youtube, ExternalLink } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/database/database-indexing.css';

const guide = guidesData.guides.find(v => v.id === "database-indexing")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type NodeState = 'idle' | 'scanning' | 'found' | 'skip' | 'dimmed';

type Step = {
    text: string;
    nodeStates: Record<string, NodeState>;
    rowStates?: Record<number, 'scanning' | 'found' | 'idle'>;
    queryActive?: boolean;
    highlight?: string;
};

type IndexVariant = {
    title: string;
    subtitle: string;
    steps: Step[];
};

const VARIANTS: Record<string, IndexVariant> = {
    btree: {
        title: 'B-Tree Index Lookup',
        subtitle: 'Traverse a balanced tree to reach the leaf — O(log n) reads',
        steps: [
            {
                text: 'Query: SELECT * FROM users WHERE id = 42',
                nodeStates: { root: 'idle', n1: 'idle', n2: 'idle', l1: 'idle', l2: 'idle', l3: 'idle', l4: 'idle' },
                queryActive: true,
            },
            {
                text: 'Start at root node — compare 42 with root key (50). 42 < 50, go left.',
                nodeStates: { root: 'scanning', n1: 'idle', n2: 'dimmed', l1: 'idle', l2: 'idle', l3: 'dimmed', l4: 'dimmed' },
                queryActive: true,
                highlight: 'root',
            },
            {
                text: 'Reach internal node (25). 42 > 25, traverse right child.',
                nodeStates: { root: 'found', n1: 'scanning', n2: 'dimmed', l1: 'dimmed', l2: 'idle', l3: 'dimmed', l4: 'dimmed' },
                queryActive: true,
                highlight: 'n1',
            },
            {
                text: 'Reach leaf node — id = 42 found! Follow row pointer to heap.',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'dimmed', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
                highlight: 'l2',
            },
            {
                text: '✓ Only 3 I/O reads needed — O(log n) regardless of table size. Supports range scans too.',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'dimmed', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
            },
        ],
    },
    hash: {
        title: 'Hash Index Lookup',
        subtitle: 'hash(key) maps directly to a bucket — O(1) exact match',
        steps: [
            {
                text: 'Query: SELECT * FROM sessions WHERE token = "abc123"',
                nodeStates: { root: 'idle', n1: 'idle', n2: 'idle', l1: 'idle', l2: 'idle', l3: 'idle', l4: 'idle' },
                queryActive: true,
            },
            {
                text: 'Apply hash function: hash("abc123") → bucket index 3',
                nodeStates: { root: 'scanning', n1: 'scanning', n2: 'scanning', l1: 'scanning', l2: 'scanning', l3: 'scanning', l4: 'scanning' },
                queryActive: true,
                highlight: 'hash',
            },
            {
                text: 'Jump directly to bucket 3 — no traversal needed.',
                nodeStates: { root: 'dimmed', n1: 'dimmed', n2: 'dimmed', l1: 'dimmed', l2: 'dimmed', l3: 'found', l4: 'dimmed' },
                queryActive: true,
                highlight: 'l3',
            },
            {
                text: 'Exact match found in bucket 3. Fetch row pointer → O(1) lookup.',
                nodeStates: { root: 'dimmed', n1: 'dimmed', n2: 'dimmed', l1: 'dimmed', l2: 'dimmed', l3: 'found', l4: 'dimmed' },
                queryActive: false,
            },
            {
                text: '⚠ Cannot do range queries (WHERE id > 10). Great for exact equality. Used in Redis, PostgreSQL hash indexes.',
                nodeStates: { root: 'skip', n1: 'skip', n2: 'skip', l1: 'skip', l2: 'skip', l3: 'found', l4: 'skip' },
                queryActive: false,
            },
        ],
    },
    composite: {
        title: 'Composite Index Scan',
        subtitle: 'Multi-column index — column order critically matters',
        steps: [
            {
                text: 'Index: CREATE INDEX ON orders(user_id, status, created_at)',
                nodeStates: { root: 'idle', n1: 'idle', n2: 'idle', l1: 'idle', l2: 'idle', l3: 'idle', l4: 'idle' },
                queryActive: true,
            },
            {
                text: 'Query uses leading column (user_id). Index IS used — seek to user_id = 5.',
                nodeStates: { root: 'scanning', n1: 'scanning', n2: 'dimmed', l1: 'found', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: true,
                highlight: 'composite-good',
            },
            {
                text: 'Filter by status within user_id partition. O(log n) → O(k) for matched rows.',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'found', l2: 'skip', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
            },
            {
                text: '⚠ Query skips leading column (only filters by status). Index NOT used — full scan!',
                nodeStates: { root: 'skip', n1: 'skip', n2: 'skip', l1: 'skip', l2: 'skip', l3: 'skip', l4: 'skip' },
                queryActive: false,
                highlight: 'composite-bad',
            },
            {
                text: '✓ Rule: put high-cardinality, equality-filtered columns first. Left-prefix must match query predicates.',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'found', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
            },
        ],
    },
    covering: {
        title: 'Covering Index (Index-Only Scan)',
        subtitle: 'All needed columns live in the index — zero heap access',
        steps: [
            {
                text: 'Query: SELECT email, status FROM users WHERE email = "x@y.com"',
                nodeStates: { root: 'idle', n1: 'idle', n2: 'idle', l1: 'idle', l2: 'idle', l3: 'idle', l4: 'idle' },
                queryActive: true,
                rowStates: { 0: 'idle', 1: 'idle', 2: 'idle' },
            },
            {
                text: 'Index: (email, status) — both queried columns present in index leaf.',
                nodeStates: { root: 'scanning', n1: 'scanning', n2: 'dimmed', l1: 'idle', l2: 'scanning', l3: 'dimmed', l4: 'dimmed' },
                queryActive: true,
                rowStates: { 0: 'idle', 1: 'idle', 2: 'idle' },
            },
            {
                text: 'Leaf node found — contains email AND status. No heap fetch needed!',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'dimmed', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
                rowStates: { 0: 'idle', 1: 'idle', 2: 'idle' },
            },
            {
                text: '✓ Index-only scan: result returned directly from index. Heap rows never touched (shown grayed).',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'dimmed', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
                rowStates: { 0: 'idle', 1: 'idle', 2: 'idle' },
            },
            {
                text: '✓ Can cut I/O by 50-90% on read-heavy workloads. Trade-off: larger index size & slower writes.',
                nodeStates: { root: 'found', n1: 'found', n2: 'dimmed', l1: 'dimmed', l2: 'found', l3: 'dimmed', l4: 'dimmed' },
                queryActive: false,
                rowStates: { 0: 'idle', 1: 'idle', 2: 'idle' },
            },
        ],
    },
};

const TAB_LABELS: Record<string, string> = {
    btree: 'B-Tree',
    hash: 'Hash Index',
    composite: 'Composite',
    covering: 'Covering',
};

const INDEX_CONCEPTS = [
    {
        id: 'btree',
        title: 'B-Tree Index',
        icon: '🌳',
        colorClass: 'card-cyan',
        color: 'var(--cyan)',
        description: 'A self-balancing tree where all leaves are at the same depth. Supports equality, range, ORDER BY, and prefix queries efficiently.',
        tags: [
            { text: 'Range Queries', highlight: 'hl-cyan' },
            { text: 'O(log n)', highlight: '' },
            { text: 'Default Index', highlight: '' },
        ],
        example: 'Default index type in PostgreSQL, MySQL/InnoDB. Ideal for most workloads.',
    },
    {
        id: 'hash',
        title: 'Hash Index',
        icon: '#️⃣',
        colorClass: 'card-purple',
        color: 'var(--purple)',
        description: 'Stores a hash of each indexed value with a pointer to the row. Ultra-fast for exact equality (=), but useless for ranges.',
        tags: [
            { text: 'O(1) Lookup', highlight: 'hl-purple' },
            { text: 'Exact Match', highlight: '' },
            { text: 'No Range Scan', highlight: '' },
        ],
        example: 'Used in Redis, PostgreSQL hash indexes, and memory engine in MySQL.',
    },
    {
        id: 'composite',
        title: 'Composite Index',
        icon: '🔗',
        colorClass: 'card-orange',
        color: 'var(--orange)',
        description: 'An index over multiple columns. The left-prefix rule means the ORDER of columns in the index definition determines which queries benefit.',
        tags: [
            { text: 'Left-Prefix Rule', highlight: 'hl-amber' },
            { text: 'Multi-Column', highlight: '' },
            { text: 'Column Order Matters', highlight: '' },
        ],
        example: 'INDEX(user_id, status) helps queries on user_id or (user_id, status), not status alone.',
    },
    {
        id: 'covering',
        title: 'Covering Index',
        icon: '🛡️',
        colorClass: 'card-green',
        color: 'var(--green)',
        description: 'When all columns in a query (SELECT + WHERE + ORDER BY) exist in the index, the heap is never accessed — an index-only scan.',
        tags: [
            { text: 'Zero Heap I/O', highlight: 'hl-green' },
            { text: 'Index-Only Scan', highlight: '' },
            { text: 'High Read Speed', highlight: '' },
        ],
        example: 'PostgreSQL INCLUDE columns make any index a covering index for specific queries.',
    },
];

const KEY_CONCEPTS = [
    {
        title: 'Why Indexes Speed Up Reads',
        color: 'var(--cyan)',
        desc: 'Without an index, the database must read every row in the table (full table scan) — O(n). An index creates a sorted, navigable auxiliary structure so the DB can jump directly to matching rows — O(log n) for B-Tree.',
        example: 'Rule of thumb: add an index on every column used in WHERE, JOIN ON, or ORDER BY clauses in hot queries.',
    },
    {
        title: 'The Write Penalty',
        color: 'var(--orange)',
        desc: 'Every INSERT, UPDATE, or DELETE must also update all relevant indexes. Too many indexes slow down write throughput and bloat storage. Always profile before adding — unused indexes are pure overhead.',
        example: 'Strategy: use EXPLAIN to verify index usage; drop indexes not appearing in execution plans.',
    },
    {
        title: 'Index Selectivity',
        color: '#7c4dff',
        desc: 'Selectivity = distinct values / total rows. A high-selectivity index (e.g. email) is very effective. A low-selectivity index (e.g. boolean status) is often ignored by the optimizer — a full scan is cheaper.',
        example: 'Rule: index columns with at least 10–20% cardinality ratio for significant speedup.',
    },
];

const REAL_WORLD_EXAMPLES = [
    { name: 'PostgreSQL', icon: '🐘', strategy: 'B-Tree / GiST / BRIN', desc: 'Default B-Tree for most cases. GiST for geospatial & full-text. BRIN for append-only time-series data with minimal overhead.' },
    { name: 'MySQL InnoDB', icon: '🐬', strategy: 'Clustered B-Tree', desc: 'Primary key index IS the table (clustered). Secondary indexes store the PK value as a row pointer — choose PK wisely.' },
    { name: 'MongoDB', icon: '🍃', strategy: 'B-Tree', desc: 'Compound indexes follow the same left-prefix rule. Sparse and partial indexes let you index only a subset of documents.' },
    { name: 'Redis', icon: '⚡', strategy: 'Hash + Skip List', desc: 'Hash table for O(1) key lookups. Sorted Sets use a skip list for range queries by score (similar to B-Tree scan).' },
    { name: 'Elasticsearch', icon: '🔍', strategy: 'Inverted Index', desc: 'An inverted index maps each unique term to the list of documents containing it — the foundation of full-text search.' },
    { name: 'SQLite', icon: '🪶', strategy: 'B-Tree', desc: 'Both tables and indexes are B-Trees. Covering indexes in SQLite dramatically reduce I/O for read-heavy embedded apps.' },
];

const COMPARISON = [
    { type: 'B-Tree', equality: 5, rangeQuery: 5, orderBy: 5, writeOverhead: 3, bestFor: 'General purpose, sorted data' },
    { type: 'Hash', equality: 5, rangeQuery: 1, orderBy: 1, writeOverhead: 2, bestFor: 'Exact equality lookups only' },
    { type: 'Composite', equality: 5, rangeQuery: 4, orderBy: 4, writeOverhead: 4, bestFor: 'Multi-column filter queries' },
    { type: 'Covering', equality: 5, rangeQuery: 5, orderBy: 5, writeOverhead: 5, bestFor: 'Read-heavy, narrow projections' },
    { type: 'Partial', equality: 4, rangeQuery: 3, orderBy: 3, writeOverhead: 1, bestFor: 'Sparse/conditional data subsets' },
];

const MERMAID_CHART = `flowchart TD
    Q(["🔎 SELECT * FROM users WHERE id = 42"])
    Opt{Query Planner}
    Q --> Opt
    Opt -->|Index available| IdxScan["B-Tree Index Scan\nO(log n)"]
    Opt -->|No index| SeqScan["Sequential Table Scan\nO(n)"]
    IdxScan --> Leaf[("Leaf Node\nid=42 -> row ptr")]
    Leaf --> HeapFetch["Heap Fetch\nFetch actual row"]
    SeqScan --> AllRows["Read every row\nuntil match found"]
    HeapFetch --> Result(["✅ Result Returned"])
    AllRows --> Result

    style Q fill:#1a1f2b,stroke:#00e5ff,color:#fff
    style Opt fill:#1a1f2b,stroke:#00e5ff,color:#fff
    style IdxScan fill:#12161f,stroke:#00e5ff,color:#fff
    style SeqScan fill:#12161f,stroke:#ff5252,color:#fff
    style Leaf fill:#12161f,stroke:#3effab,color:#fff
    style HeapFetch fill:#0d1117,stroke:#3effab,color:#aaa
    style AllRows fill:#0d1117,stroke:#ff5252,color:#aaa
    style Result fill:#1a1f2b,stroke:#3effab,color:#fff`;

const RESOURCES = [
    { title: 'Database Indexing for Dumb Developers', type: 'youtube', url: 'https://www.youtube.com/watch?v=lYh6LrSIDvY' },
    { title: 'An in-depth look at Database Indexing', type: 'web', url: 'https://www.freecodecamp.org/news/database-indexing-at-a-glance-bb50809d48bd/' },
    { title: 'Database Indexing Strategies', type: 'web', url: 'https://blog.bytebytego.com/p/database-indexing-strategies' }
];

// B-Tree node config
const BTREE_NODES = [
    { id: 'root', label: 'Root', value: '50', x: 50, y: 10 },
    { id: 'n1', label: 'L1', value: '25', x: 27, y: 38 },
    { id: 'n2', label: 'R1', value: '75', x: 73, y: 38 },
    { id: 'l1', label: 'L2', value: '10', x: 16, y: 70 },
    { id: 'l2', label: 'L3', value: '42 ✓', x: 38, y: 70 },
    { id: 'l3', label: 'R2', value: '62', x: 62, y: 70 },
    { id: 'l4', label: 'R3', value: '88', x: 84, y: 70 },
];

const BTREE_EDGES: [string, string][] = [
    ['root', 'n1'], ['root', 'n2'],
    ['n1', 'l1'], ['n1', 'l2'],
    ['n2', 'l3'], ['n2', 'l4'],
];

// Hash bucket config
const HASH_BUCKETS = [
    { id: 'l1', label: 'Bucket 0', value: 'token_x...' },
    { id: 'l2', label: 'Bucket 1', value: 'session_q...' },
    { id: 'l3', label: 'Bucket 2', value: 'abc123 ✓' },
    { id: 'l4', label: 'Bucket 3', value: 'empty' },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function DatabaseIndexingGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activeVariant, setActiveVariant] = useState<string>('btree');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playVariant = useCallback((key: string) => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActiveVariant(key);
        setCurrentStepIdx(-1);

        const variant = VARIANTS[key];
        const stepTime = 1900 * animationSpeed;

        variant.steps.forEach((_, i) => {
            const t = setTimeout(() => {
                setCurrentStepIdx(i);
            }, i * stepTime + 300);
            animRef.current.push(t);
        });
    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playVariant('btree'), 1200);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playVariant]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const handleCardClick = (id: string) => {
        const section = document.getElementById('idx-action-section');
        section?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => playVariant(id), 400);
    };

    const variant = VARIANTS[activeVariant];
    const currentStep = currentStepIdx >= 0 ? variant.steps[currentStepIdx] : null;

    return (
        <GuideLayout
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ INDEX TYPE CARDS ═══════════════ */}
            <h2 className="idx-section-title">Index Types</h2>
            <div className="idx-grid">
                {INDEX_CONCEPTS.map((c) => (
                    <div
                        key={c.id}
                        className={`viz-card idx-card ${c.colorClass}`}
                        onClick={() => handleCardClick(c.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCardClick(c.id);
                            }
                        }}
                    >
                        <div className="idx-card-header">
                            <div className="idx-card-icon">{c.icon}</div>
                            <div className="idx-card-title">{c.title}</div>
                        </div>
                        <div className="idx-card-description">{c.description}</div>
                        <div className="idx-card-tags">
                            {c.tags.map(tag => (
                                <span key={tag.text} className={`idx-tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                        <div className="idx-info-box">
                            <span className="idx-info-label">Example:</span>
                            <span className="idx-info-value">{c.example}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">How the Query Planner Decides</h2>
                <p className="viz-section-hint">The planner chooses between an index scan and a sequential scan based on statistics</p>
            </div>
            <div className="idx-mermaid-wrap">
                <pre className="mermaid">{MERMAID_CHART}</pre>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" id="idx-action-section">
                <h2 className="viz-section-title">Interactive Index Flow</h2>
                <p className="viz-section-hint">Step through each index type to see how a query is resolved</p>
            </div>

            {/* Tab controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="idx-flow-controls" style={{ marginBottom: 0 }}>
                    {Object.keys(VARIANTS).map(key => (
                        <button
                            key={key}
                            className={`idx-tab-btn ${activeVariant === key ? 'active' : ''}`}
                            onClick={() => playVariant(key)}
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
                        justifyContent: 'center', cursor: 'pointer', transition: 'all .2s',
                    }}
                    className="social-btn"
                    aria-label="Settings"
                >
                    <Settings size={14} />
                </button>
                <button
                    onClick={() => playVariant(activeVariant)}
                    style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '1px solid var(--border2)', background: 'var(--surface)',
                        color: 'var(--text-dim)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', transition: 'all .2s',
                    }}
                    className="social-btn"
                    aria-label="Replay Animation"
                >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '-2px' }}>↺</span>
                </button>
            </div>

            {/* Flow diagram */}
            <div className="idx-flow-diagram">
                <div className="idx-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : 'var(--cyan)',
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${variant.steps.length}`}
                </div>

                <h3 className="idx-flow-title">{variant.title}</h3>
                <p className="idx-flow-subtitle">{variant.subtitle}</p>

                {/* Visualization canvas */}
                <div className="idx-canvas">
                    {activeVariant === 'hash' ? (
                        /* Hash Bucket View */
                        <HashVisual nodeStates={currentStep?.nodeStates ?? {}} />
                    ) : (
                        /* B-Tree View (used for btree, composite, covering) */
                        <BTreeVisual
                            nodeStates={currentStep?.nodeStates ?? {}}
                            queryActive={currentStep?.queryActive ?? false}
                        />
                    )}
                </div>

                {/* Steps log */}
                <div className="idx-flow-steps">
                    {variant.steps.map((step, i) => (
                        <div
                            key={step.text}
                            className={`idx-step ${currentStepIdx >= i ? 'visible' : ''} ${currentStepIdx === i ? 'current' : ''}`}
                        >
                            <div className="idx-step-num">{i + 1}</div>
                            <div className="idx-step-body">{step.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="idx-legend">
                {[
                    { cls: 'leg-found', label: 'Match Found' },
                    { cls: 'leg-scanning', label: 'Scanning' },
                    { cls: 'leg-skip', label: 'Not Used' },
                    { cls: 'leg-dimmed', label: 'Pruned Path' },
                ].map(l => (
                    <div key={l.label} className="idx-legend-item">
                        <div className={`idx-legend-box ${l.cls}`} />
                        {l.label}
                    </div>
                ))}
            </div>

            {/* ═══════════════ KEY CONCEPTS ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Key Concepts</h2>
                <p className="viz-section-hint">What every engineer must understand about database indexes</p>
            </div>
            <div className="idx-concepts-grid">
                {KEY_CONCEPTS.map((c) => (
                    <div key={c.title} className="idx-concept-card" style={{ '--card-color': c.color } as React.CSSProperties}>
                        <div className="idx-concept-title">{c.title}</div>
                        <div className="idx-concept-desc">{c.desc}</div>
                        <div className="idx-concept-example">{c.example}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ REAL-WORLD EXAMPLES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Real-World Implementations</h2>
                <p className="viz-section-hint">How popular databases implement indexing under the hood</p>
            </div>
            <div className="idx-examples-grid">
                {REAL_WORLD_EXAMPLES.map((ex) => (
                    <div key={ex.name} className="idx-example-card">
                        <div className="idx-example-header">
                            <span className="idx-example-icon">{ex.icon}</span>
                            <span className="idx-example-name">{ex.name}</span>
                            <span className="idx-example-strategy">{ex.strategy}</span>
                        </div>
                        <div className="idx-example-desc">{ex.desc}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Index Type Comparison</h2>
                <p className="viz-section-hint">Trade-offs across the most common index types</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Equality</th>
                            <th>Range Query</th>
                            <th>ORDER BY</th>
                            <th>Write Cost</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.type}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.type}</td>
                                <td><Rating dots={row.equality} /></td>
                                <td><Rating dots={row.rangeQuery} /></td>
                                <td><Rating dots={row.orderBy} /></td>
                                <td><Rating dots={row.writeOverhead} invert /></td>
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
                            <th style={{ width: '50%' }}>Title</th>
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
                                            color: 'var(--blue)', textDecoration: 'none', fontSize: '0.9rem',
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

function BTreeVisual({ nodeStates, queryActive }: Readonly<{
    nodeStates: Record<string, NodeState>;
    queryActive: boolean;
}>) {
    return (
        <div className="idx-btree-wrap">
            {queryActive && (
                <div className="idx-query-badge">
                    🔎 Query active
                </div>
            )}
            <svg viewBox="0 0 100 90" className="idx-btree-svg" aria-label="B-Tree index visualization">
                {/* Edges */}
                {BTREE_EDGES.map(([from, to]) => {
                    const f = BTREE_NODES.find(n => n.id === from)!;
                    const t = BTREE_NODES.find(n => n.id === to)!;
                    const fromState = nodeStates[from];
                    const toState = nodeStates[to];
                    const isActive = fromState === 'scanning' || fromState === 'found' || toState === 'scanning' || toState === 'found';
                    return (
                        <line
                            key={`${from}-${to}`}
                            x1={f.x} y1={f.y + 4}
                            x2={t.x} y2={t.y - 4}
                            className={`idx-tree-edge ${isActive ? 'active' : ''}`}
                        />
                    );
                })}
                {/* Nodes */}
                {BTREE_NODES.map(node => {
                    const state = nodeStates[node.id] ?? 'idle';
                    const isLeaf = node.id.startsWith('l');
                    return (
                        <g key={node.id} className={`idx-tree-node-g ${state}`}>
                            <rect
                                x={node.x - 8} y={node.y - 5}
                                width={16} height={10}
                                rx={isLeaf ? 3 : 2}
                                className={`idx-tree-node-rect ${state}`}
                            />
                            <text
                                x={node.x} y={node.y + 1.5}
                                textAnchor="middle"
                                className="idx-tree-node-text"
                            >
                                {node.value}
                            </text>
                        </g>
                    );
                })}
                {/* Leaf level label */}
                <text x={50} y={84} textAnchor="middle" className="idx-tree-level-label">Leaf Nodes</text>
                <text x={50} y={47} textAnchor="middle" className="idx-tree-level-label">Internal</text>
                <text x={50} y={18} textAnchor="middle" className="idx-tree-level-label">Root</text>
            </svg>
        </div>
    );
}

function HashVisual({ nodeStates }: Readonly<{ nodeStates: Record<string, NodeState> }>) {
    return (
        <div className="idx-hash-wrap">
            <div className="idx-hash-fn-badge">hash(key) % N</div>
            <div className="idx-hash-buckets">
                {HASH_BUCKETS.map((b, i) => {
                    const state = nodeStates[b.id] ?? 'idle';
                    return (
                        <div key={b.id} className={`idx-hash-bucket ${state}`}>
                            <span className="idx-bucket-num">{i}</span>
                            <div className="idx-bucket-body">
                                <span className="idx-bucket-label">{b.label}</span>
                                <span className="idx-bucket-value">{b.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Rating({ dots, invert = false }: Readonly<{ dots: number; invert?: boolean }>) {
    return (
        <div className="idx-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div
                    key={i}
                    className={`idx-dot ${i <= dots ? (invert ? 'on-red' : 'on') : ''}`}
                />
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

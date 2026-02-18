"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import visualsData from "@/data/visuals";
import { useSettings } from "@/context/SettingsContext";
import { Settings } from "lucide-react";
import { VisualLayout } from '@/components/layout/VisualLayout';
import '@/styles/visuals/performance/caching-strategies.css';

const visual = visualsData.visuals.find(v => v.id === "caching-strategies")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    text: string;
    nodes: string[];
    arrows: string[];
    hit?: boolean;
    miss?: boolean;
    async?: boolean;
};

type Pattern = {
    title: string;
    steps: Step[];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'cache-aside': {
        title: 'Cache-Aside: Read Flow (Miss → Hit)',
        steps: [
            { text: '1. App checks cache for key "user:123"', nodes: ['app', 'cache'], arrows: ['arrow1'] },
            { text: '2. Cache returns MISS — key not found', nodes: ['cache'], arrows: ['arrow2'], miss: true },
            { text: '3. App queries database for user data', nodes: ['app', 'db'], arrows: ['arrow3'] },
            { text: '4. Database returns user data', nodes: ['db'], arrows: ['arrow4'] },
            { text: '5. App writes data to cache with TTL', nodes: ['app', 'cache'], arrows: ['arrow1'] },
            { text: '6. App returns response to client', nodes: ['app'], arrows: [] },
            { text: '— Next request: Cache HIT (immediate return)', nodes: ['cache'], arrows: [], hit: true }
        ]
    },
    'read-through': {
        title: 'Read-Through: Cache Auto-Loads From DB',
        steps: [
            { text: '1. App requests data from cache', nodes: ['app', 'cache'], arrows: ['arrow1'] },
            { text: '2. Cache detects MISS — auto-triggers DB fetch', nodes: ['cache', 'db'], arrows: ['arrow3'] },
            { text: '3. Database returns data to cache library', nodes: ['db'], arrows: ['arrow4'] },
            { text: '4. Cache stores data and returns to app', nodes: ['cache'], arrows: ['arrow2'] },
            { text: '5. App receives data (transparent DB access)', nodes: ['app'], arrows: [] },
            { text: '— Next request: Cache HIT', nodes: ['cache'], arrows: [], hit: true }
        ]
    },
    'write-through': {
        title: 'Write-Through: Sync Cache + DB Write',
        steps: [
            { text: '1. App sends write request to cache', nodes: ['app', 'cache'], arrows: ['arrow1'] },
            { text: '2. Cache writes data locally', nodes: ['cache'], arrows: [] },
            { text: '3. Cache immediately writes to DB (sync)', nodes: ['cache', 'db'], arrows: ['arrow3'] },
            { text: '4. DB confirms write successful', nodes: ['db'], arrows: ['arrow4'] },
            { text: '5. Cache confirms to app — data consistent', nodes: ['cache'], arrows: ['arrow2'] },
            { text: '✓ Cache & DB are always in sync', nodes: [], arrows: [], hit: true }
        ]
    },
    'write-behind': {
        title: 'Write-Behind: Async Batch Writes',
        steps: [
            { text: '1. App sends write request to cache', nodes: ['app', 'cache'], arrows: ['arrow1'] },
            { text: '2. Cache writes data immediately (in memory)', nodes: ['cache'], arrows: [] },
            { text: '3. Cache returns success to app instantly', nodes: ['cache'], arrows: ['arrow2'] },
            { text: '4. App continues (write is "complete")', nodes: ['app'], arrows: [] },
            { text: '5. Cache queues DB write for later (async)', nodes: ['cache', 'db'], arrows: ['arrow3'], async: true },
            { text: '6. DB write happens in background batch', nodes: ['db'], arrows: [], async: true },
            { text: '⚠️ Data loss risk if cache crashes before flush', nodes: [], arrows: [], miss: true }
        ]
    }
};

const STRATEGIES = [
    {
        id: 'cache-aside',
        title: "Cache-Aside (Lazy Load)",
        icon: "📖",
        colorClass: "card-green",
        description: "Application checks cache first. On miss, fetches from DB, then stores in cache for next time.",
        tags: [
            { text: "Most Common", highlight: "highlight-green" },
            { text: "Read-Heavy", highlight: "" },
            { text: "Stale OK", highlight: "" }
        ],
        useCase: "User profiles, product catalogs, session data",
        latency: "Cache miss = DB latency + cache write"
    },
    {
        id: 'read-through',
        title: "Read-Through",
        icon: "🔄",
        colorClass: "card-cyan",
        description: "Cache library handles loading from DB automatically on miss. App only talks to cache.",
        tags: [
            { text: "Simpler Code", highlight: "" },
            { text: "Auto-populate", highlight: "highlight-cyan" },
            { text: "Read-Heavy", highlight: "" }
        ],
        useCase: "CMS content, configuration data, reference lookups",
        latency: "Cache miss = automatic DB fetch (transparent)"
    },
    {
        id: 'write-through',
        title: "Write-Through",
        icon: "✍️",
        colorClass: "card-yellow",
        description: "Writes go to cache first, then immediately sync to DB. Cache is always consistent with DB.",
        tags: [
            { text: "Strong Consistency", highlight: "highlight-yellow" },
            { text: "Slower Writes", highlight: "" },
            { text: "Read-Heavy", highlight: "" }
        ],
        useCase: "Financial transactions, inventory levels, booking systems",
        latency: "Write = cache write + DB write (sequential)"
    },
    {
        id: 'write-behind',
        title: "Write-Behind (Write-Back)",
        icon: "⚡",
        colorClass: "card-orange",
        description: "Writes go to cache first, then async batch to DB later. Fastest writes, eventual consistency.",
        tags: [
            { text: "Fastest Writes", highlight: "highlight-orange" },
            { text: "Write-Heavy", highlight: "" },
            { text: "Data Risk", highlight: "" }
        ],
        useCase: "Analytics events, logging, leaderboards, activity feeds",
        latency: "Write = cache write only (DB async)"
    }
];

const COMPARISON = [
    { name: "Cache-Aside", read: 4, write: 5, consistency: 3, complexity: 2, risk: "None" },
    { name: "Read-Through", read: 4, write: 5, consistency: 3, complexity: 1, risk: "None" },
    { name: "Write-Through", read: 5, write: 2, consistency: 5, complexity: 3, risk: "None" },
    { name: "Write-Behind", read: 5, write: 5, consistency: 2, complexity: 4, risk: "High" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function CachingStrategiesVisual() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePattern, setActivePattern] = useState('cache-aside');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playPattern = useCallback((patternKey: string) => {
        // Clear previous animations
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActivePattern(patternKey);
        setCurrentStepIdx(-1);

        const pattern = FLOW_PATTERNS[patternKey];
        const stepTime = 1400 * animationSpeed;

        pattern.steps.forEach((_, i) => {
            const t = setTimeout(() => {
                setCurrentStepIdx(i);
            }, i * stepTime);
            animRef.current.push(t);
        });
    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playPattern('cache-aside'), 1500);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    return (
        <VisualLayout
            category={visual.category}
            title={visual.title}
            description={visual.description}
            primaryColor={visual.colorConfig.primary}
            onReplay={handleReplay}
            contributors={visual.contributors}
        >
            {/* ═══════════════ PATTERN GRID ═══════════════ */}
            <h2 className="section-title">The 4 Core Patterns</h2>
            <div className="caching-grid">
                {STRATEGIES.map((s, idx) => (
                    <div
                        key={s.id}
                        className={`cache-card ${s.colorClass}`}
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
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="card-header">
                            <div className="card-icon">{s.icon}</div>
                            <div className="card-title">{s.title}</div>
                        </div>
                        <div className="card-description">{s.description}</div>
                        <div className="card-tags">
                            {s.tags.map(tag => (
                                <span key={tag.text} className={`tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                        <div className="card-info-sections">
                            <div className="info-box"><span className="info-label">Use case:</span><span className="info-value">{s.useCase}</span></div>
                            <div className="info-box"><span className="info-label">Latency:</span><span className="info-value">{s.latency}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" id="action-section">
                <h2 className="viz-section-title">See It In Action</h2>
                <p className="viz-section-hint">Interact with the patterns to see how data flows between components</p>
            </div>

            <div className="viz-flow-controls" style={{ alignItems: 'center' }}>
                {STRATEGIES.map(s => (
                    <button
                        key={s.id}
                        className={`viz-tab-btn ${activePattern === s.id ? 'active' : ''}`}
                        onClick={() => playPattern(s.id)}
                    >
                        {s.title.split(' (')[0]}
                    </button>
                ))}

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
                        transition: 'all .2s',
                        marginLeft: '0.25rem'
                    }}
                    className="social-btn"
                    aria-label="Settings"
                >
                    <Settings size={14} />
                </button>
            </div>

            <div className="viz-flow-diagram">
                <div className="viz-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : 'var(--cyan)'
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${FLOW_PATTERNS[activePattern].steps.length}`}
                </div>

                <h3 className="viz-flow-title">
                    {FLOW_PATTERNS[activePattern].title}
                </h3>

                <div className="viz-nodes">
                    <Node id="app" label="Application" icon="📱" activeIdx={currentStepIdx} pattern={activePattern} />
                    <Node id="cache" label="Redis Cache" icon="⚡" activeIdx={currentStepIdx} pattern={activePattern} />
                    <Node id="db" label="Database" icon="🗄️" activeIdx={currentStepIdx} pattern={activePattern} />

                    <svg className="viz-arrows-svg" viewBox="0 0 800 140" preserveAspectRatio="xMidYMid meet">
                        <Arrow id="arrow1" d="M 180 50 L 320 50" activeIdx={currentStepIdx} pattern={activePattern} /> {/* App -> Cache */}
                        <Arrow id="arrow2" d="M 320 70 L 180 70" activeIdx={currentStepIdx} pattern={activePattern} /> {/* Cache -> App */}
                        <Arrow id="arrow3" d="M 480 50 L 620 50" activeIdx={currentStepIdx} pattern={activePattern} /> {/* Cache -> DB */}
                        <Arrow id="arrow4" d="M 620 70 L 480 70" activeIdx={currentStepIdx} pattern={activePattern} /> {/* DB -> Cache */}

                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                            </marker>
                        </defs>
                    </svg>
                </div>

                <div className="flow-wrap" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {FLOW_PATTERNS[activePattern].steps.map((step, i) => (
                        <div key={step.text} className={`flow-step ${currentStepIdx >= i ? 'visible' : ''}`} style={{ opacity: currentStepIdx === i ? 1 : 0.4 }}>
                            <div className="step-num" style={{ borderColor: currentStepIdx === i ? 'var(--cyan)' : 'var(--border2)', color: currentStepIdx === i ? 'var(--cyan)' : 'var(--text-dim)' }}>{i + 1}</div>
                            <div className="step-body" style={{ background: currentStepIdx === i ? 'rgba(0, 217, 255, 0.05)' : 'var(--dim)' }}>
                                <div className="step-desc" style={{ color: currentStepIdx === i ? 'var(--text-hi)' : 'var(--text-dim)' }}>{step.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="viz-legend">
                <div className="viz-legend-item">
                    <div className="viz-legend-box leg-hit"></div> Cache Hit
                </div>
                <div className="viz-legend-item">
                    <div className="viz-legend-box leg-miss"></div> Cache Miss
                </div>
                <div className="viz-legend-item">
                    <div className="viz-legend-box leg-act"></div> Active Request
                </div>
            </div>

            <button className="viz-replay-btn" onClick={() => playPattern(activePattern)} style={{ margin: '2rem auto 0', display: 'block' }}>
                ↺ Replay Animation
            </button>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Pattern Comparison</h2>
                <p className="viz-section-hint">Choose the right strategy based on your consistency and performance requirements</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Read Perf</th>
                            <th>Write Perf</th>
                            <th>Consistency</th>
                            <th>Complexity</th>
                            <th>Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.read} /></td>
                                <td><Rating dots={row.write} /></td>
                                <td><Rating dots={row.consistency} /></td>
                                <td><Rating dots={row.complexity} /></td>
                                <td style={{ color: row.risk === 'None' ? 'var(--green)' : 'var(--orange)' }}>
                                    {row.risk === 'None' ? '✓ None' : '✗ ' + row.risk}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </VisualLayout>
    );
}

// ════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════

function Node({ id, label, icon, activeIdx, pattern }: Readonly<{ id: string, label: string, icon: string, activeIdx: number, pattern: string }>) {
    const step = activeIdx >= 0 ? FLOW_PATTERNS[pattern].steps[activeIdx] : null;
    const isActive = step?.nodes.includes(id);
    const isHit = step?.hit && id === 'cache';
    const isMiss = step?.miss && id === 'cache';

    let statusClass = '';
    if (isActive) statusClass = 'active';
    if (isHit) statusClass = 'hit';
    if (isMiss) statusClass = 'miss';

    return (
        <div className="viz-node-container">
            <div className={`viz-node-box ${statusClass}`}>
                <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{id.toUpperCase()}</span>
            </div>
            <div className="viz-node-label">{label}</div>
        </div>
    );
}

function Arrow({ id, d, activeIdx, pattern }: Readonly<{ id: string, d: string, activeIdx: number, pattern: string }>) {
    const step = activeIdx >= 0 ? FLOW_PATTERNS[pattern].steps[activeIdx] : null;
    const isActive = step?.arrows.includes(id);
    const isHit = step?.hit;
    const isMiss = step?.miss;

    let statusClass = '';
    if (isActive) statusClass = 'active';
    if (isHit && isActive) statusClass = 'hit';
    if (isMiss && isActive) statusClass = 'miss';

    return (
        <path
            className={`viz-connector ${statusClass}`}
            d={d}
            markerEnd="url(#arrowhead)"
        />
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="viz-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`viz-dot ${i <= dots ? 'on' : ''}`} />
            ))}
        </div>
    );
}

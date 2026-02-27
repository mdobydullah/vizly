"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Shield, Clock, Timer, Layers, BookOpen, Globe, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import { config } from '@/lib/config';
import '@/styles/guides/infrastructure/rate-limiter.css';

const guide = guidesData.guides.find(v => v.id === "rate-limiter")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    text: string;
    bucketLevel?: number;       // 0-100 fill %
    queueLevel?: number;        // 0-100 fill %
    counter?: number;           // window counter value
    windowSlots?: number[];     // bar heights for window viz
    logDots?: ('in' | 'out' | 'new')[];  // sliding log dots
    status?: 'allowed' | 'rejected' | 'idle';
    leaking?: boolean;
};

type Algorithm = {
    title: string;
    desc: string;
    vizType: 'bucket' | 'window' | 'log';
    steps: Step[];
};

const ALGO_PATTERNS: Record<string, Algorithm> = {
    'token-bucket': {
        title: 'Token Bucket',
        desc: 'Tokens are added at a fixed rate. Each request consumes one token. Allows bursts up to bucket capacity.',
        vizType: 'bucket',
        steps: [
            { text: 'Bucket initialised with 5 tokens (capacity = 5)', bucketLevel: 100, status: 'idle' },
            { text: 'Request #1 arrives → consumes 1 token (4 left)', bucketLevel: 80, status: 'allowed' },
            { text: 'Request #2 arrives → consumes 1 token (3 left)', bucketLevel: 60, status: 'allowed' },
            { text: 'Request #3 arrives → consumes 1 token (2 left)', bucketLevel: 40, status: 'allowed' },
            { text: 'Refill: 1 token added at fixed rate (3 tokens)', bucketLevel: 60, status: 'idle' },
            { text: 'Request #4 arrives → consumes 1 token (2 left)', bucketLevel: 40, status: 'allowed' },
            { text: 'Burst: 2 rapid requests → both allowed (0 left)', bucketLevel: 0, status: 'allowed' },
            { text: 'Request #7 arrives → no tokens left → REJECTED', bucketLevel: 0, status: 'rejected' },
            { text: 'Refill: tokens replenish over time (2 tokens)', bucketLevel: 40, status: 'idle' },
        ]
    },
    'leaking-bucket': {
        title: 'Leaking Bucket',
        desc: 'Requests enter a queue (bucket). Processed at a fixed rate. Overflow is rejected. Smooths bursts.',
        vizType: 'bucket',
        steps: [
            { text: 'Queue is empty, leak rate = 1 req/sec', queueLevel: 0, status: 'idle', leaking: false },
            { text: 'Request #1 enters queue', queueLevel: 20, status: 'allowed', leaking: true },
            { text: 'Request #2 enters queue', queueLevel: 40, status: 'allowed', leaking: true },
            { text: 'Request #3 enters queue while #1 leaks out', queueLevel: 40, status: 'allowed', leaking: true },
            { text: 'Burst: 3 more requests flood in', queueLevel: 80, status: 'allowed', leaking: true },
            { text: 'Queue at 90% capacity, still leaking steadily', queueLevel: 90, status: 'allowed', leaking: true },
            { text: 'Queue FULL → new request REJECTED (overflow)', queueLevel: 100, status: 'rejected', leaking: true },
            { text: 'Queue drains as requests are processed', queueLevel: 60, status: 'idle', leaking: true },
        ]
    },
    'fixed-window': {
        title: 'Fixed Window Counter',
        desc: 'Time is divided into fixed windows. A counter tracks requests per window. Resets at window boundary.',
        vizType: 'window',
        steps: [
            { text: 'Window [00:00–00:59] starts, counter = 0, limit = 5', windowSlots: [0, 0], counter: 0, status: 'idle' },
            { text: 'Request #1 → counter = 1', windowSlots: [20, 0], counter: 1, status: 'allowed' },
            { text: 'Request #2, #3 → counter = 3', windowSlots: [60, 0], counter: 3, status: 'allowed' },
            { text: 'Request #4, #5 → counter = 5 (at limit)', windowSlots: [100, 0], counter: 5, status: 'allowed' },
            { text: 'Request #6 → counter > limit → REJECTED', windowSlots: [100, 0], counter: 6, status: 'rejected' },
            { text: 'Window boundary! Counter resets to 0', windowSlots: [100, 0], counter: 0, status: 'idle' },
            { text: 'New window [01:00–01:59], request #1 → counter = 1', windowSlots: [100, 20], counter: 1, status: 'allowed' },
            { text: '⚠️ Edge case: bursts at window boundary can allow 2× limit', windowSlots: [100, 40], counter: 2, status: 'allowed' },
        ]
    },
    'sliding-log': {
        title: 'Sliding Window Log',
        desc: 'Stores exact timestamps of requests. Counts requests within a sliding time window. Memory-intensive but precise.',
        vizType: 'log',
        steps: [
            { text: 'Log is empty, window = 60s, limit = 5', logDots: [], counter: 0, status: 'idle' },
            { text: 'Req at t=10s → log: [10s]', logDots: ['new'], counter: 1, status: 'allowed' },
            { text: 'Req at t=20s → log: [10s, 20s]', logDots: ['in', 'new'], counter: 2, status: 'allowed' },
            { text: 'Req at t=30s, 35s, 40s → log has 5 entries', logDots: ['in', 'in', 'new', 'new', 'new'], counter: 5, status: 'allowed' },
            { text: 'Req at t=50s → 6 in window → REJECTED', logDots: ['in', 'in', 'in', 'in', 'in'], counter: 6, status: 'rejected' },
            { text: 'Time passes… t=10s entry expires (window slides)', logDots: ['out', 'in', 'in', 'in', 'in'], counter: 4, status: 'idle' },
            { text: 'Req at t=75s → 5 in window → allowed', logDots: ['out', 'in', 'in', 'in', 'in', 'new'], counter: 5, status: 'allowed' },
            { text: 'Old entries pruned, window stays precise', logDots: ['out', 'out', 'in', 'in', 'in', 'in'], counter: 4, status: 'idle' },
        ]
    },
    'sliding-counter': {
        title: 'Sliding Window Counter',
        desc: 'Combines fixed window + sliding log. Uses weighted average of current and previous window counts. Low memory, approximate.',
        vizType: 'window',
        steps: [
            { text: 'Previous window had 4 reqs. Current window starts, counter = 0', windowSlots: [80, 0], counter: 0, status: 'idle' },
            { text: 'Request arrives. Current counter = 1', windowSlots: [80, 20], counter: 1, status: 'allowed' },
            { text: 'We are 25% into current window → weight = 75% prev', windowSlots: [80, 20], counter: 1, status: 'idle' },
            { text: 'Weighted count = 4×0.75 + 1 = 4.0 (limit=5)', windowSlots: [80, 20], counter: 4, status: 'allowed' },
            { text: '2 more requests → current = 3', windowSlots: [80, 60], counter: 3, status: 'allowed' },
            { text: 'Now 50% in → weighted = 4×0.5 + 3 = 5.0 (at limit)', windowSlots: [80, 60], counter: 5, status: 'allowed' },
            { text: 'Next request → weighted = 5.5 > 5 → REJECTED', windowSlots: [80, 60], counter: 6, status: 'rejected' },
            { text: 'As window slides, previous weight decreases → more room', windowSlots: [80, 60], counter: 4, status: 'idle' },
        ]
    }
};

const CONCEPTS = [
    {
        id: 'token-bucket',
        title: 'Token Bucket',
        description: 'Tokens refill at a steady rate. Each request needs a token. Allows controlled bursts.',
        icon: <Layers size={20} />,
        color: 'var(--cyan)',
        colorClass: 'card-cyan',
        stats: [{ text: 'Bursty', highlight: true }, { text: 'Low Memory', highlight: false }]
    },
    {
        id: 'leaking-bucket',
        title: 'Leaking Bucket',
        description: 'Requests queue up and are processed at a constant rate. Excess overflow is dropped.',
        icon: <Timer size={20} />,
        color: 'var(--purple)',
        colorClass: 'card-purple',
        stats: [{ text: 'Smooth Output', highlight: true }, { text: 'No Burst', highlight: false }]
    },
    {
        id: 'fixed-window',
        title: 'Fixed Window',
        description: 'Time split into windows with a request counter. Counter resets at each boundary.',
        icon: <Clock size={20} />,
        color: 'var(--orange)',
        colorClass: 'card-orange',
        stats: [{ text: 'Simple', highlight: true }, { text: 'Edge Burst', highlight: false }]
    },
    {
        id: 'sliding-log',
        title: 'Sliding Window',
        description: 'Sliding window log tracks timestamps; counter uses weighted averages for accuracy.',
        icon: <Shield size={20} />,
        color: 'var(--green)',
        colorClass: 'card-green',
        stats: [{ text: 'Precise', highlight: true }, { text: 'More Memory', highlight: false }]
    },
];

const COMPARISON = [
    { algo: 'Token Bucket', throughput: 5, memory: 4, burst: 5, accuracy: 3, use: 'API gateways, CDNs' },
    { algo: 'Leaking Bucket', throughput: 3, memory: 4, burst: 1, accuracy: 4, use: 'Traffic shaping' },
    { algo: 'Fixed Window', throughput: 4, memory: 5, burst: 2, accuracy: 2, use: 'Simple APIs' },
    { algo: 'Sliding Log', throughput: 3, memory: 1, burst: 3, accuracy: 5, use: 'Strict rate limits' },
    { algo: 'Sliding Counter', throughput: 4, memory: 4, burst: 3, accuracy: 4, use: 'Balanced APIs' },
];

const RESOURCES = [
    { title: "System Design Interview (Alex Xu)", type: "book", url: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF" },
    { title: "Rate Limiting – Cloudflare", type: "web", url: "https://www.cloudflare.com/learning/bots/what-is-rate-limiting/" },
    { title: "RFC 6585 – 429 Too Many Requests", type: "web", url: "https://datatracker.ietf.org/doc/html/rfc6585" },
];

const MERMAID_CODE = `flowchart TD
    A["Client Request"] --> B{"Rate Limiter"}
    B -->|"Within Limit"| C["✅ Forward to Server"]
    B -->|"Exceeds Limit"| D["❌ 429 Too Many Requests"]
    C --> E["Server Response"]
    D --> F["Retry After Header"]`;

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function RateLimiterGuide({
    initialAlgo = 'token-bucket'
}: {
    initialAlgo?: string
}) {
    const guideData = guide!;

    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activeAlgoKey, setActiveAlgoKey] = useState(initialAlgo);

    // Animation State
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const activeAlgo = ALGO_PATTERNS[activeAlgoKey];

    const playAlgo = useCallback((algoKey: string) => {
        setActiveAlgoKey(algoKey);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        let t: NodeJS.Timeout;
        if (isPlaying) {
            const algo = ALGO_PATTERNS[activeAlgoKey];
            if (currentStepIdx < algo.steps.length - 1) {
                const stepTime = currentStepIdx === -1 ? 500 : 2000 * animationSpeed;
                t = setTimeout(() => {
                    setCurrentStepIdx(prev => prev + 1);
                }, stepTime);
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearTimeout(t);
    }, [isPlaying, currentStepIdx, activeAlgoKey, animationSpeed]);

    const handleReplay = () => {
        setReplayCount(prev => prev + 1);
    };

    const currentStep = currentStepIdx >= 0 ? activeAlgo.steps[currentStepIdx] : null;

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
            <h2 className="section-title">Rate Limiting Algorithms</h2>
            <div className="rl-grid">
                {CONCEPTS.map((s) => (
                    <div
                        key={s.id}
                        className={`viz-card rl-card ${s.colorClass}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            const section = document.getElementById('rl-action-section');
                            section?.scrollIntoView({ behavior: 'smooth' });
                            playAlgo(s.id);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const section = document.getElementById('rl-action-section');
                                section?.scrollIntoView({ behavior: 'smooth' });
                                playAlgo(s.id);
                            }
                        }}
                    >
                        <div className="rl-card-header">
                            <div className="rl-card-icon" style={{ color: s.color }}>{s.icon}</div>
                            <div className="rl-card-name">{s.title}</div>
                        </div>
                        <p className="rl-card-desc">{s.description}</p>
                        <div className="rl-card-stats">
                            {s.stats.map(stat => (
                                <span key={stat.text} className={`rl-stat-chip ${stat.highlight ? 'hi' : ''}`}>
                                    {stat.text}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ MERMAID ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">How Rate Limiting Works</h2>
                <p className="viz-section-hint">High-level request flow through a rate limiter</p>
            </div>
            <div className="rl-mermaid-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
                <pre className="mermaid">{MERMAID_CODE}</pre>
            </div>

            {/* ═══════════════ VISUALIZATION ═══════════════ */}
            <div className="viz-section-header" id="rl-action-section">
                <h2 className="viz-section-title">Algorithm Visualizer</h2>
                <p className="viz-section-hint">Watch how each algorithm handles incoming requests</p>
            </div>

            <div className="rl-flow-section">
                <div className="rl-flow-controls">
                    {Object.keys(ALGO_PATTERNS).map(key => (
                        <button
                            key={key}
                            className={`rl-flow-btn ${activeAlgoKey === key ? 'active' : ''}`}
                            onClick={() => playAlgo(key)}
                        >
                            {ALGO_PATTERNS[key].title}
                        </button>
                    ))}
                    <div className="viz-playback-controls" style={{ marginLeft: '1rem' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="viz-ctrl-btn"
                            aria-label={isPlaying ? "Pause Animation" : "Play Animation"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={() => playAlgo(activeAlgoKey!)}
                            className="viz-ctrl-btn"
                            aria-label="Replay"
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

                <div className="rl-viz-canvas">
                    <div className="rl-viz-title">{activeAlgo.title}</div>
                    <div className="rl-viz-desc">{activeAlgo.desc}</div>

                    {/* Dynamic Visualization Based on Type */}
                    {activeAlgo.vizType === 'bucket' && (
                        <BucketViz
                            step={currentStep}
                            algoKey={activeAlgoKey}
                        />
                    )}
                    {activeAlgo.vizType === 'window' && (
                        <WindowViz
                            step={currentStep}
                            algoKey={activeAlgoKey}
                        />
                    )}
                    {activeAlgo.vizType === 'log' && (
                        <LogViz step={currentStep} />
                    )}

                    {/* Request Status */}
                    {currentStep && currentStep.status !== 'idle' && (
                        <div className="rl-request-area" style={{ marginTop: '1.5rem' }}>
                            <div className={`rl-request-node ${currentStep.status}`}>
                                <span>📨 Request</span>
                                <span className={`rl-status-badge ${currentStep.status}`}>
                                    {currentStep.status === 'allowed' ? '✓ ALLOWED' : '✗ REJECTED'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Steps List */}
                    <div className="rl-flow-steps">
                        {activeAlgo.steps.map((step, i) => (
                            <div key={step.text + i} className={`rl-step ${currentStepIdx === i ? 'active' : ''}`}>
                                <div className="rl-step-num">{i + 1}</div>
                                <div className="rl-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Algorithm Comparison</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Algorithm</th>
                            <th>Throughput</th>
                            <th>Memory</th>
                            <th>Burst Handling</th>
                            <th>Accuracy</th>
                            <th>Best Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.algo}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.algo}</td>
                                <td><Rating dots={row.throughput} /></td>
                                <td><Rating dots={row.memory} /></td>
                                <td><Rating dots={row.burst} /></td>
                                <td><Rating dots={row.accuracy} /></td>
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
                                    <a href={`${res.url}${res.url.includes('?') ? '&' : '?'}ref=${config.urls.domain}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>
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

function BucketViz({ step, algoKey }: { step: Step | null; algoKey: string }) {
    const isLeaking = algoKey === 'leaking-bucket';
    const fillLevel = isLeaking ? (step?.queueLevel ?? 0) : (step?.bucketLevel ?? 0);

    return (
        <div className="rl-bucket-area">
            <div className="rl-bucket-wrapper">
                <div className="rl-bucket-top-label">
                    {isLeaking ? 'QUEUE' : 'BUCKET'}
                </div>
                <div className="rl-bucket">
                    <div
                        className="rl-bucket-fill"
                        style={{
                            height: `${fillLevel}%`,
                            background: fillLevel >= 100
                                ? 'linear-gradient(to top, var(--pink), rgba(255, 107, 157, .4))'
                                : isLeaking
                                    ? 'linear-gradient(to top, var(--purple), rgba(185, 133, 244, .4))'
                                    : 'linear-gradient(to top, var(--cyan), rgba(29, 233, 182, .4))'
                        }}
                    />
                </div>
                {isLeaking && step?.leaking && (
                    <>
                        <div className="rl-leak-pipe">
                            <div className="rl-leak-drop" />
                        </div>
                        <div className="rl-leak-label">leak rate: 1 req/s</div>
                    </>
                )}
                <div className="rl-bucket-count">{fillLevel}%</div>
                <div className="rl-bucket-label">
                    {isLeaking ? 'Queue Fill' : `${Math.round(fillLevel / 20)} / 5 tokens`}
                </div>
            </div>
        </div>
    );
}

function WindowViz({ step, algoKey }: { step: Step | null; algoKey: string }) {
    const slots = step?.windowSlots ?? [0, 0];
    const counter = step?.counter ?? 0;
    const isSliding = algoKey === 'sliding-counter';

    return (
        <div className="rl-window-area">
            <div className="rl-timeline">
                {slots.map((height, i) => (
                    <div
                        key={i}
                        className={`rl-window-bar ${i === slots.length - 1 ? 'current' : 'prev'} ${height > 100 ? 'overflow' : ''}`}
                        style={{ height: `${Math.max(height, 4)}px` }}
                    >
                        {height > 0 && (
                            <div className="rl-window-bar-label">{height}%</div>
                        )}
                    </div>
                ))}
            </div>
            <div className="rl-window-labels">
                {slots.map((_, i) => (
                    <div key={i} className="rl-window-label">
                        {i === slots.length - 1 ? 'Current' : 'Prev'}
                    </div>
                ))}
            </div>
            <div className="rl-window-info">
                <div className="rl-window-stat">
                    <div className="rl-window-stat-value" style={{
                        color: counter > 5 ? 'var(--pink)' : 'var(--text-hi)'
                    }}>
                        {isSliding ? counter.toFixed(1) : counter}
                    </div>
                    <div className="rl-window-stat-label">
                        {isSliding ? 'Weighted Count' : 'Counter'}
                    </div>
                </div>
                <div className="rl-window-stat">
                    <div className="rl-window-stat-value">5</div>
                    <div className="rl-window-stat-label">Limit</div>
                </div>
            </div>
        </div>
    );
}

function LogViz({ step }: { step: Step | null }) {
    const dots = step?.logDots ?? [];
    const counter = step?.counter ?? 0;

    return (
        <div className="rl-window-area">
            <div className="rl-log-timeline">
                {dots.length === 0 ? (
                    <span style={{ color: 'var(--text-dim)', fontSize: '.72rem', fontFamily: 'var(--font-mono)' }}>
                        [ empty log ]
                    </span>
                ) : (
                    dots.map((dot, i) => (
                        <div
                            key={i}
                            className={`rl-log-dot ${dot === 'in' || dot === 'new' ? 'in-window' : 'out-window'} ${dot === 'new' ? 'new' : ''}`}
                            title={`Entry ${i + 1}: ${dot === 'out' ? 'expired' : 'in window'}`}
                        />
                    ))
                )}
            </div>
            <div className="rl-window-info">
                <div className="rl-window-stat">
                    <div className="rl-window-stat-value" style={{
                        color: counter > 5 ? 'var(--pink)' : 'var(--text-hi)'
                    }}>
                        {counter}
                    </div>
                    <div className="rl-window-stat-label">In Window</div>
                </div>
                <div className="rl-window-stat">
                    <div className="rl-window-stat-value">5</div>
                    <div className="rl-window-stat-label">Limit</div>
                </div>
                <div className="rl-window-stat">
                    <div className="rl-window-stat-value">{dots.length}</div>
                    <div className="rl-window-stat-label">Log Size</div>
                </div>
            </div>
        </div>
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="rl-rating">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`rl-dot ${i <= dots ? 'on' : ''}`} />
            ))}
        </div>
    );
}

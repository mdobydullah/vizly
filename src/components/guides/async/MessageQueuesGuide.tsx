"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/async/message-queues.css';

const guide = guidesData.guides.find(v => v.id === "message-queues")!;

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
    isQueue?: boolean;
    icon?: string;
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'simple': {
        title: 'Simple Queue: Producer → Queue → Consumer',
        nodes: [
            { id: 'producer', label: 'Producer', sublabel: 'API Server', icon: '📤' },
            { id: 'queue', label: 'Queue', sublabel: 'RabbitMQ / SQS', isQueue: true, icon: '📦' },
            { id: 'consumer', label: 'Consumer', sublabel: 'Worker Process', icon: '📥' }
        ],
        steps: [
            { text: '1. Producer publishes message to queue', nodes: ['producer', 'queue'], active: true },
            { text: '2. Message stored in queue (persistent)', nodes: ['queue'], active: true },
            { text: '3. Consumer polls queue for messages', nodes: ['queue', 'consumer'], processing: true },
            { text: '4. Consumer processes message', nodes: ['consumer'], processing: true },
            { text: '5. Consumer sends ACK to queue', nodes: ['consumer', 'queue'], active: true },
            { text: '6. Queue removes message after ACK', nodes: ['queue'], success: true }
        ]
    },
    'pubsub': {
        title: 'Pub/Sub: One Producer → Multiple Subscribers',
        nodes: [
            { id: 'publisher', label: 'Publisher', sublabel: 'Event Source', icon: '📤' },
            { id: 'topic', label: 'Topic', sublabel: 'Kafka / Pub/Sub', isQueue: true, icon: '📡' },
            { id: 'sub1', label: 'Sub A', sublabel: 'Analytics', icon: '📊' },
            { id: 'sub2', label: 'Sub B', sublabel: 'Notifications', icon: '🔔' }
        ],
        steps: [
            { text: '1. Publisher sends event to topic', nodes: ['publisher', 'topic'], active: true },
            { text: '2. Topic replicates event to all subscriptions', nodes: ['topic'], active: true },
            { text: '3. Subscriber A receives and processes event', nodes: ['topic', 'sub1'], processing: true },
            { text: '4. Subscriber B receives same event independently', nodes: ['topic', 'sub2'], processing: true },
            { text: '5. Both subscribers ACK independently', nodes: ['sub1', 'sub2'], success: true },
            { text: '✓ Fan-out pattern: One message → Many consumers', nodes: [], success: true }
        ]
    },
    'dlq': {
        title: 'Dead Letter Queue: Handling Failed Messages',
        nodes: [
            { id: 'producer', label: 'Producer', sublabel: 'API Server', icon: '📤' },
            { id: 'mainq', label: 'Main Queue', sublabel: 'Primary Queue', isQueue: true, icon: '📦' },
            { id: 'consumer', label: 'Consumer', sublabel: 'Worker', icon: '📥' },
            { id: 'dlq', label: 'DLQ', sublabel: 'Dead Letter Queue', isQueue: true, icon: '⚠️' }
        ],
        steps: [
            { text: '1. Producer sends message to main queue', nodes: ['producer', 'mainq'], active: true },
            { text: '2. Consumer receives message and attempts processing', nodes: ['mainq', 'consumer'], processing: true },
            { text: '3. Processing fails — consumer returns error', nodes: ['consumer'], error: true },
            { text: '4. Queue retries message (attempt 2, 3...)', nodes: ['mainq', 'consumer'], processing: true },
            { text: '5. Max retries reached — message moved to DLQ', nodes: ['mainq', 'dlq'], error: true },
            { text: '6. DLQ stores failed messages for investigation', nodes: ['dlq'], error: true },
            { text: '⚠️ Manual intervention or monitoring required', nodes: [], error: true }
        ]
    },
    'fanout': {
        title: 'Fanout Exchange: Broadcast to All Queues',
        nodes: [
            { id: 'producer', label: 'Producer', sublabel: 'Event Source', icon: '📤' },
            { id: 'exchange', label: 'Fanout Exchange', sublabel: 'RabbitMQ Exchange', isQueue: true, icon: '📡' },
            { id: 'q1', label: 'Queue 1', sublabel: 'Logs', isQueue: true, icon: '📝' },
            { id: 'q2', label: 'Queue 2', sublabel: 'Metrics', isQueue: true, icon: '📊' }
        ],
        steps: [
            { text: '1. Producer publishes event to exchange', nodes: ['producer', 'exchange'], active: true },
            { text: '2. Exchange broadcasts to all bound queues', nodes: ['exchange'], active: true },
            { text: '3. Queue 1 receives copy of message', nodes: ['exchange', 'q1'], active: true },
            { text: '4. Queue 2 receives copy of message', nodes: ['exchange', 'q2'], active: true },
            { text: '5. Independent consumers process from each queue', nodes: ['q1', 'q2'], processing: true },
            { text: '✓ All queues get the same message', nodes: [], success: true }
        ]
    }
};

const TAB_LABELS: Record<string, string> = {
    'simple': 'Simple Queue',
    'pubsub': 'Pub/Sub',
    'dlq': 'Dead Letter Queue',
    'fanout': 'Fanout'
};

const QUEUE_SYSTEMS = [
    {
        id: 'kafka',
        title: "Apache Kafka",
        icon: "🌊",
        colorClass: "card-yellow",
        description: "Distributed event streaming platform. Partitioned topics, persistent logs, high throughput for real-time data pipelines.",
        tags: [
            { text: "Event Streaming", highlight: "highlight-yellow" },
            { text: "Persistent", highlight: "" },
            { text: "Partitions", highlight: "" }
        ],
        useCase: "Activity tracking, log aggregation, real-time analytics, event sourcing",
        throughput: "Millions of messages/sec, designed for massive scale"
    },
    {
        id: 'rabbitmq',
        title: "RabbitMQ",
        icon: "🐰",
        colorClass: "card-orange",
        description: "Traditional message broker. Flexible routing via exchanges, supports multiple protocols (AMQP, MQTT), reliable delivery.",
        tags: [
            { text: "Message Broker", highlight: "highlight-orange" },
            { text: "AMQP", highlight: "" },
            { text: "Routing", highlight: "" }
        ],
        useCase: "Task queues, microservices communication, background jobs, RPC",
        throughput: "Thousands to hundreds of thousands msgs/sec"
    },
    {
        id: 'sqs',
        title: "AWS SQS",
        icon: "☁️",
        colorClass: "card-purple",
        description: "Fully managed queue service. Simple API, auto-scaling, no server management. Standard & FIFO queues available.",
        tags: [
            { text: "Managed", highlight: "highlight-purple" },
            { text: "Serverless", highlight: "" },
            { text: "FIFO Option", highlight: "" }
        ],
        useCase: "Decoupling AWS services, buffering requests, asynchronous workflows",
        throughput: "Standard: unlimited, FIFO: 3,000 msgs/sec (batched)"
    },
    {
        id: 'redis',
        title: "Redis Streams",
        icon: "⚡",
        colorClass: "card-cyan",
        description: "Lightweight append-only log in Redis. Consumer groups, persistence, fast in-memory operations with replication.",
        tags: [
            { text: "In-Memory", highlight: "highlight-cyan" },
            { text: "Low Latency", highlight: "" },
            { text: "Streams", highlight: "" }
        ],
        useCase: "Real-time leaderboards, notifications, chat systems, simple event logs",
        throughput: "Hundreds of thousands msgs/sec, sub-millisecond latency"
    }
];

const COMPARISON = [
    { name: "Apache Kafka", throughput: 5, latency: 3, persistence: "✓", ordering: "✓", bestFor: "Event streaming, real-time analytics, log aggregation" },
    { name: "RabbitMQ", throughput: 4, latency: 4, persistence: "✓", ordering: "✓", bestFor: "Task queues, microservices, traditional messaging" },
    { name: "AWS SQS", throughput: 5, latency: 2, persistence: "✓", ordering: "✓", bestFor: "Decoupling AWS services, serverless workflows" },
    { name: "Redis Streams", throughput: 4, latency: 5, persistence: "✓", ordering: "✓", bestFor: "Real-time apps, low latency, simple use cases" },
];

const GUARANTEES = [
    {
        title: "At-Most-Once",
        color: "var(--green)",
        desc: "Messages delivered once or not at all. Fastest but may lose messages. No retry on failure.",
        example: "Use: Metrics, non-critical logs, telemetry where loss is acceptable"
    },
    {
        title: "At-Least-Once",
        color: "var(--yellow)",
        desc: "Messages guaranteed delivery but may duplicate. Retry on failure. Requires idempotent consumers.",
        example: "Use: Order processing, email notifications (with deduplication)"
    },
    {
        title: "Exactly-Once",
        color: "var(--purple)",
        desc: "Each message delivered exactly once. Most expensive, requires distributed transactions or careful design.",
        example: "Use: Financial transactions, payment processing, critical state changes"
    }
];

const RESOURCES = [
    { title: "System Design Primer - Message Queues", type: "youtube", url: "https://www.youtube.com/watch?v=iJLL-KPqBpM" },
    { title: "RabbitMQ Tutorials", type: "web", url: "https://www.rabbitmq.com/tutorials" },
    { title: "Apache Kafka Documentation", type: "web", url: "https://kafka.apache.org/documentation/" },
    { title: "AWS SQS Documentation", type: "web", url: "https://aws.amazon.com/sqs/" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function MessageQueuesGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePattern, setActivePattern] = useState('simple');
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
        const t = setTimeout(() => playPattern('simple'), 1500);
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
        <GuideLayout
            githubPath="src/components/guides/async/MessageQueuesGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ QUEUE SYSTEMS GRID ═══════════════ */}
            <h2 className="section-title">Popular Queue Systems</h2>
            <div className="mq-grid">
                {QUEUE_SYSTEMS.map((s) => (
                    <div
                        key={s.id}
                        className={`viz-card mq-card ${s.colorClass}`}
                    >
                        <div className="mq-card-header">
                            <div className="mq-card-icon">{s.icon}</div>
                            <div className="mq-card-title">{s.title}</div>
                        </div>
                        <div className="mq-card-description">{s.description}</div>
                        <div className="mq-card-tags">
                            {s.tags.map(tag => (
                                <span key={tag.text} className={`mq-tag ${tag.highlight}`}>{tag.text}</span>
                            ))}
                        </div>
                        <div className="mq-card-info-sections">
                            <div className="mq-info-box">
                                <span className="mq-info-label">Use case:</span>
                                <span className="mq-info-value">{s.useCase}</span>
                            </div>
                            <div className="mq-info-box">
                                <span className="mq-info-label">Throughput:</span>
                                <span className="mq-info-value">{s.throughput}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" id="action-section">
                <h2 className="viz-section-title">Message Flow Patterns</h2>
                <p className="viz-section-hint">Explore different messaging patterns with interactive animations</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="mq-flow-controls" style={{ marginBottom: 0 }}>
                    {Object.keys(FLOW_PATTERNS).map(key => (
                        <button
                            key={key}
                            className={`mq-tab-btn ${activePattern === key ? 'active' : ''}`}
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

            <div className="mq-flow-diagram">
                <div className="mq-flow-status" style={{
                    color: currentStepIdx === -1 ? 'var(--text-dim)' : 'var(--yellow)'
                }}>
                    {currentStepIdx === -1 ? 'Waiting...' : `Step ${currentStepIdx + 1} of ${FLOW_PATTERNS[activePattern].steps.length}`}
                </div>

                <h3 className="mq-flow-title">
                    {FLOW_PATTERNS[activePattern].title}
                </h3>

                <div className="mq-nodes">
                    {FLOW_PATTERNS[activePattern].nodes.map((node) => (
                        <MQNode
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
                                borderColor: currentStepIdx === i ? 'var(--yellow)' : 'var(--border2)',
                                color: currentStepIdx === i ? 'var(--yellow)' : 'var(--text-dim)',
                                background: currentStepIdx === i ? 'rgba(255, 209, 102, 0.08)' : 'transparent'
                            }}>{i + 1}</div>
                            <div className="step-body" style={{
                                background: currentStepIdx === i ? 'rgba(255, 209, 102, 0.05)' : 'var(--dim)',
                                borderLeft: currentStepIdx === i ? '2px solid var(--yellow)' : '2px solid transparent'
                            }}>
                                <div className="step-desc" style={{ color: currentStepIdx === i ? 'var(--text-hi)' : 'var(--text-dim)' }}>{step.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mq-legend">
                <div className="mq-legend-item">
                    <div className="mq-legend-box leg-producer"></div> Producer
                </div>
                <div className="mq-legend-item">
                    <div className="mq-legend-box leg-queue"></div> Queue/Topic
                </div>
                <div className="mq-legend-item">
                    <div className="mq-legend-box leg-consumer"></div> Consumer
                </div>
                <div className="mq-legend-item">
                    <div className="mq-legend-box leg-dlq"></div> Dead Letter Queue
                </div>
            </div>



            {/* ═══════════════ DELIVERY GUARANTEES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Delivery Guarantees</h2>
                <p className="viz-section-hint">Understand the trade-offs between reliability and performance</p>
            </div>

            <div className="mq-guarantees-grid">
                {GUARANTEES.map((g) => (
                    <div key={g.title} className="mq-guarantee-card" style={{ '--card-color': g.color } as React.CSSProperties}>
                        <div className="mq-guarantee-title">{g.title}</div>
                        <div className="mq-guarantee-desc">{g.desc}</div>
                        <div className="mq-guarantee-example">{g.example}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">System Comparison</h2>
                <p className="viz-section-hint">Compare popular message queue systems by key metrics</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>System</th>
                            <th>Throughput</th>
                            <th>Latency</th>
                            <th>Persistence</th>
                            <th>Ordering</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.throughput} /></td>
                                <td><Rating dots={row.latency} /></td>
                                <td style={{ color: 'var(--green)' }}>{row.persistence}</td>
                                <td style={{ color: 'var(--green)' }}>{row.ordering}</td>
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

function MQNode({ node, activeIdx, pattern }: Readonly<{ node: NodeDef, activeIdx: number, pattern: string }>) {
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
        <div className="mq-node-container">
            <div className={`mq-node-box ${node.isQueue ? 'queue-box' : ''} ${statusClass}`}>
                <span style={{ fontSize: '1.4rem', marginBottom: '2px' }}>{node.icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{node.id.toUpperCase()}</span>
                {node.isQueue && (
                    <div className="queue-indicator">
                        <div className={`queue-msg ${isActive ? 'active' : ''}`}></div>
                        <div className={`queue-msg ${isActive ? 'active' : ''}`}></div>
                        <div className={`queue-msg ${isActive ? 'active' : ''}`}></div>
                    </div>
                )}
            </div>
            <div className="mq-node-label">{node.sublabel}</div>
        </div>
    );
}

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="mq-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`mq-dot ${i <= dots ? 'on' : ''}`} />
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

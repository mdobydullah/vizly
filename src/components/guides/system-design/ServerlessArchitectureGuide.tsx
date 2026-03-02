"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import mermaid from 'mermaid';
import '@/styles/guides/system-design/serverless-architecture.css';

const guide = guidesData.guides.find(v => v.id === "serverless-architecture")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type NodeState = 'idle' | 'active' | 'processing' | 'success' | 'error';

type SlNode = {
    id: string;
    label: string;
    icon: string;
    state: NodeState;
};

type Step = {
    text: string;
    targets: Array<{ id: string, state: NodeState }>; // Nodes to update
};

type Pattern = {
    title: string;
    algo: string;
    nodes: SlNode[];
    steps: Step[];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'api-request': {
        title: 'Synchronous API Request',
        algo: 'API Gateway → Lambda',
        nodes: [
            { id: 'client', label: 'Client', icon: '📱', state: 'idle' },
            { id: 'apigw', label: 'API Gateway', icon: '🚪', state: 'idle' },
            { id: 'lambda', label: 'Compute (Lambda)', icon: '⚡', state: 'idle' },
            { id: 'db', label: 'NoSQL DB', icon: '💾', state: 'idle' },
        ],
        steps: [
            { text: 'Client makes HTTP request (e.g., GET /users)', targets: [{ id: 'client', state: 'active' }] },
            { text: 'API Gateway receives request & validates identity', targets: [{ id: 'client', state: 'idle' }, { id: 'apigw', state: 'processing' }] },
            { text: 'API Gateway triggers Lambda function synchronously', targets: [{ id: 'apigw', state: 'active' }, { id: 'lambda', state: 'processing' }] },
            { text: 'Lambda executes code, queries NoSQL database', targets: [{ id: 'lambda', state: 'active' }, { id: 'db', state: 'processing' }] },
            { text: 'Database returns data to Lambda', targets: [{ id: 'db', state: 'success' }, { id: 'lambda', state: 'processing' }] },
            { text: 'Lambda function completes, spins down', targets: [{ id: 'lambda', state: 'success' }] },
            { text: 'API Gateway returns 200 OK to Client', targets: [{ id: 'apigw', state: 'success' }, { id: 'client', state: 'success' }] },
        ]
    },
    'event-driven': {
        title: 'Asynchronous Event-Driven',
        algo: 'S3 → EventBus → Workers',
        nodes: [
            { id: 's3', label: 'Storage (S3)', icon: '🪣', state: 'idle' },
            { id: 'eventbus', label: 'Event Bus', icon: '🚦', state: 'idle' },
            { id: 'worker1', label: 'Image Resizer', icon: '🖼️', state: 'idle' },
            { id: 'worker2', label: 'Label Detector', icon: '🏷️', state: 'idle' },
        ],
        steps: [
            { text: 'User uploads an image to S3 bucket', targets: [{ id: 's3', state: 'processing' }] },
            { text: 'S3 automatically emits "ObjectCreated" event', targets: [{ id: 's3', state: 'active' }, { id: 'eventbus', state: 'processing' }] },
            { text: 'Event Bus evaluates rules & fans out internally', targets: [{ id: 's3', state: 'idle' }, { id: 'eventbus', state: 'active' }] },
            { text: 'Triggers Image Resizer & Label Detector independently', targets: [{ id: 'eventbus', state: 'idle' }, { id: 'worker1', state: 'processing' }, { id: 'worker2', state: 'processing' }] },
            { text: 'Both Lambdas process event concurrently', targets: [{ id: 'worker1', state: 'active' }, { id: 'worker2', state: 'active' }] },
            { text: 'Processing complete — fully decoupled', targets: [{ id: 'worker1', state: 'success' }, { id: 'worker2', state: 'success' }] },
        ]
    },
    'step-functions': {
        title: 'Serverless Orchestration',
        algo: 'State Machine Workflow',
        nodes: [
            { id: 'start', label: 'Checkout', icon: '🛒', state: 'idle' },
            { id: 'payment', label: 'Payment', icon: '💳', state: 'idle' },
            { id: 'inventory', label: 'Inventory', icon: '📦', state: 'idle' },
            { id: 'fail', label: 'Rollback', icon: '🔄', state: 'idle' },
        ],
        steps: [
            { text: 'Checkout process starts workflow', targets: [{ id: 'start', state: 'processing' }] },
            { text: 'Step 1: Attempt to process Payment', targets: [{ id: 'start', state: 'success' }, { id: 'payment', state: 'processing' }] },
            { text: 'Payment fails! Card declined.', targets: [{ id: 'payment', state: 'error' }] },
            { text: 'State machine catches Error', targets: [{ id: 'payment', state: 'idle' }, { id: 'fail', state: 'processing' }] },
            { text: 'Executing compensating transaction (Rollback)', targets: [{ id: 'fail', state: 'active' }] },
            { text: 'Workflow gracefully halted', targets: [{ id: 'fail', state: 'success' }] },
        ]
    }
};

const COMPARISON = [
    { name: "Traditional VMs", complexity: 4, cost: "Fixed (Always On)", scaling: "Manual / Slow", bestFor: "Legacy, Predictable Monoliths" },
    { name: "Containers (K8s)", complexity: 5, cost: "High (Base Cluster)", scaling: "Fast (Rules)", bestFor: "Microservices, Multi-cloud" },
    { name: "Serverless (FaaS)", complexity: 2, cost: "Pay-per-execution", scaling: "Instant (Auto)", bestFor: "Spiky traffic, Async processing" },
];

const RESOURCES = [
    { title: "Serverless Architecture (Martin Fowler)", type: "web", url: "https://martinfowler.com/articles/serverless.html" },
    { title: "AWS Serverless Developer Guide", type: "web", url: "https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html" },
    { title: "Serverless Land (Patterns)", type: "web", url: "https://serverlessland.com/" },
    { title: "What is Serverless?", type: "youtube", url: "https://www.youtube.com/watch?v=vxJobGtqKVM" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function ServerlessArchitectureGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('api-request');

    // Animation State
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                darkMode: true,
                background: 'transparent',
                primaryColor: 'transparent',
                primaryTextColor: '#c9d1d9',
                primaryBorderColor: '#30363d',
                lineColor: '#8492a6',
                secondaryColor: '#161b22',
                tertiaryColor: '#0d1117'
            },
            flowchart: { curve: 'basis' }
        });
        mermaid.contentLoaded();
    }, []);

    const playPattern = useCallback((patternKey: string) => {
        setActivePatternKey(patternKey);
        setCurrentStepIdx(-1);
        setIsPlaying(true);

        // Reset node states
        const initialStates: Record<string, NodeState> = {};
        FLOW_PATTERNS[patternKey].nodes.forEach(n => {
            initialStates[n.id] = 'idle';
        });
        setNodeStates(initialStates);
    }, []);

    // Core Animation Loop
    useEffect(() => {
        if (!isPlaying) return;

        const pattern = FLOW_PATTERNS[activePatternKey];
        const stepTime = 1800 * animationSpeed;

        if (currentStepIdx < pattern.steps.length - 1) {
            const nextIdx = currentStepIdx + 1;
            const delay = currentStepIdx === -1 ? 500 : stepTime;

            const t = setTimeout(() => {
                const step = pattern.steps[nextIdx];
                setCurrentStepIdx(nextIdx);
                setNodeStates(prev => {
                    const newStates = { ...prev };
                    step.targets.forEach(target => {
                        newStates[target.id] = target.state;
                    });
                    return newStates;
                });
            }, delay);

            return () => clearTimeout(t);
        } else {
            setIsPlaying(false);
        }
    }, [currentStepIdx, isPlaying, activePatternKey, animationSpeed]);

    useEffect(() => {
        playPattern('api-request');
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const activePattern = FLOW_PATTERNS[activePatternKey];

    const mermaidCode = `
    flowchart TD
        style Client fill:#1a1f2b,stroke:#00e5ff,color:#fff
        style API_Gateway fill:#12161f,stroke:#1de9b6,color:#fff
        style Auth fill:#0d1117,stroke:#ff6b9d,color:#fff
        style Lambda fill:#12161f,stroke:#e040fb,color:#fff
        style DB fill:#1a1f2b,stroke:#ffab00,color:#fff
        style S3 fill:#1a1f2b,stroke:#00b0ff,color:#fff
        style EventBus fill:#12161f,stroke:#69f0ae,color:#fff
        style AsyncWorker fill:#12161f,stroke:#ff9100,color:#fff

        Client(["📱 Client"]) --> API_Gateway(["🚪 API Gateway"])
        API_Gateway -. "Validates Token" .-> Auth(["🔐 Auth (Cognito)"])
        API_Gateway -->|"HTTP Proxy"| Lambda(["⚡ Compute (Lambda)"])
        
        Lambda <-->|"Queries"| DB(["💾 Database (DynamoDB)"])
        
        Client -->|"Direct Upload"| S3(["🪣 Storage (S3)"])
        S3 -->|"S3 Event Trigger"| EventBus(["🚦 Event Bus"])
        EventBus -->|"Async Hook"| AsyncWorker(["🛠️ Async Process (Lambda)"])
        AsyncWorker -. "Write Results" .-> DB
    `;

    return (
        <GuideLayout
            githubPath="src/components/guides/system-design/ServerlessArchitectureGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            tags={guide.tags}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ PATTERN GRID ═══════════════ */}
            <h2 className="section-title">Core Serverless Building Blocks</h2>
            <div className="sl-grid">
                <div className="sl-card" onClick={() => { playPattern('api-request'); document.getElementById('interactive-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <div className="sl-card-header">
                        <div className="sl-card-icon">⚡</div>
                        <div className="sl-card-name">FaaS (Compute)</div>
                    </div>
                    <p className="sl-card-desc">Functions as a Service. Execute code only when triggered by events (HTTP, queues, timers). Scales to zero.</p>
                    <div className="sl-card-stats">
                        <span className="sl-stat-chip hi">Execution</span>
                        <span className="sl-stat-chip">Auto-scaling</span>
                    </div>
                    <div className="sl-use-case"><strong>Use case:</strong> AWS Lambda, Google Cloud Functions</div>
                </div>

                <div className="sl-card" onClick={() => { playPattern('api-request'); document.getElementById('interactive-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <div className="sl-card-header">
                        <div className="sl-card-icon">🚪</div>
                        <div className="sl-card-name">API Gateway</div>
                    </div>
                    <p className="sl-card-desc">The front door. Maps HTTP requests to functions, handles throttling, auth, and payload validation.</p>
                    <div className="sl-card-stats">
                        <span className="sl-stat-chip hi">Routing</span>
                        <span className="sl-stat-chip">Protection</span>
                    </div>
                    <div className="sl-use-case"><strong>Use case:</strong> REST APIs, WebSockets frontend</div>
                </div>

                <div className="sl-card" onClick={() => { playPattern('event-driven'); document.getElementById('interactive-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <div className="sl-card-header">
                        <div className="sl-card-icon">🚦</div>
                        <div className="sl-card-name">Event Connectors</div>
                    </div>
                    <p className="sl-card-desc">Queues, Pub/Sub, and Event Buses that decouple services. Producers emit, consumers react asynchronously.</p>
                    <div className="sl-card-stats">
                        <span className="sl-stat-chip hi">Decoupled</span>
                        <span className="sl-stat-chip">Async</span>
                    </div>
                    <div className="sl-use-case"><strong>Use case:</strong> SQS, SNS, EventBridge, Kafka</div>
                </div>

                <div className="sl-card" onClick={() => { playPattern('step-functions'); document.getElementById('interactive-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <div className="sl-card-header">
                        <div className="sl-card-icon">💾</div>
                        <div className="sl-card-name">Managed Services</div>
                    </div>
                    <p className="sl-card-desc">Fully fledged database, storage, and orchestration services that you don't patch or provision.</p>
                    <div className="sl-card-stats">
                        <span className="sl-stat-chip hi">State</span>
                        <span className="sl-stat-chip">Persistent</span>
                    </div>
                    <div className="sl-use-case"><strong>Use case:</strong> DynamoDB, S3, Step Functions</div>
                </div>
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Architecture Blueprint</h2>
                <p className="viz-section-hint">High-level view of standard serverless architecture.</p>
            </div>
            <div className="sl-mermaid-wrap">
                <pre className="mermaid">
                    {mermaidCode}
                </pre>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div id="interactive-section" className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Execution Lifecycles</h2>
                <p className="viz-section-hint">Visualize event-driven and synchronous invocations step-by-step</p>
            </div>
            <div className="sl-flow-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="sl-flow-controls" style={{ marginBottom: 0 }}>
                        {Object.keys(FLOW_PATTERNS).map((key) => (
                            <button
                                key={key}
                                className={`sl-flow-btn ${activePatternKey === key ? 'active' : ''}`}
                                onClick={() => playPattern(key)}
                            >
                                {FLOW_PATTERNS[key].algo}
                            </button>
                        ))}
                    </div>

                    <div className="viz-playback-controls" style={{ marginLeft: '1rem' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="viz-ctrl-btn"
                            title={isPlaying ? "Pause" : "Play"}
                            aria-label={isPlaying ? "Pause Animation" : "Play Animation"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={() => playPattern(activePatternKey)}
                            className="viz-ctrl-btn"
                            title="Replay"
                            aria-label="Replay Animation"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="viz-ctrl-btn"
                            title="Settings"
                            aria-label="Settings"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>

                <div className="sl-flow-diagram">
                    <h3 className="sl-flow-title">{activePattern.title}</h3>

                    <div className="sl-diagram-content">
                        {activePattern.nodes.map((node, index) => (
                            <React.Fragment key={node.id}>
                                <div className={`sl-node \${nodeStates[node.id] || 'idle'}`}>
                                    <div className="icon">{node.icon}</div>
                                    <div className="label">{node.label}</div>
                                    <div className={`sl-node-label ${nodeStates[node.id] || 'idle'}`}>
                                        {nodeStates[node.id] === 'processing' ? 'Processing...' :
                                            nodeStates[node.id] === 'active' ? 'Invoked' :
                                                nodeStates[node.id] === 'success' ? 'Finished' :
                                                    nodeStates[node.id] === 'error' ? 'Failed' : 'Sleeping'}
                                    </div>
                                </div>

                                {index < activePattern.nodes.length - 1 && (
                                    <div className={`sl-arrow \${nodeStates[node.id] === 'active' || nodeStates[node.id] === 'processing' ? 'active' : ''}`}>
                                        →
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="sl-legend">
                        <div className="sl-legend-item"><div className="sl-legend-box leg-idle"></div> Sleeping</div>
                        <div className="sl-legend-item"><div className="sl-legend-box leg-active"></div> Triggered</div>
                        <div className="sl-legend-item"><div className="sl-legend-box leg-processing"></div> Processing</div>
                        <div className="sl-legend-item"><div className="sl-legend-box leg-success"></div> Success</div>
                        <div className="sl-legend-item"><div className="sl-legend-box leg-error"></div> Error</div>
                    </div>

                    <div className="sl-flow-steps">
                        {activePattern.steps.map((step, i) => (
                            <div key={i} className={`sl-step ${currentStepIdx === i ? 'active' : ''} ${currentStepIdx > i ? 'completed' : ''}`}>
                                <div className="sl-step-num">{i + 1}</div>
                                <div className="sl-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Execution Paradigms Compared</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Environment</th>
                            <th>Setup Complexity</th>
                            <th>Cost Model</th>
                            <th>Scaling Profile</th>
                            <th>Best Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><Rating dots={row.complexity} /></td>
                                <td>{row.cost}</td>
                                <td style={{ color: 'var(--text-hi)' }}>{row.scaling}</td>
                                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{row.bestFor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══════════════ RESOURCES ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 className="viz-section-title">Deep Dives & Resources</h2>
            </div>
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

// ════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════

function Rating({ dots }: { dots: number }) {
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <div
                    key={i}
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: i <= dots ? 'var(--cyan)' : 'var(--border)',
                        boxShadow: i <= dots ? '0 0 4px rgba(29, 233, 182, 0.5)' : 'none'
                    }}
                />
            ))}
        </div>
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

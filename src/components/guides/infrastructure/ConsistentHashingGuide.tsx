"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Video, BookOpen, ExternalLink, Globe } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/consistent-hashing.css';

const guide = guidesData.guides.find(v => v.id === "consistent-hashing")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Node = {
    id: string;
    label: string;
    angle: number; // 0 to 360 degrees
    isVirtual?: boolean;
    isActive?: boolean;
    isRemoved?: boolean;
};

type DataItem = {
    id: string;
    label: string;
    angle: number;
    assignedToNodeId: string;
    isReassigned?: boolean;
};

type Step = {
    text: string;
    nodes: Node[];
    dataItems: DataItem[];
};

type Pattern = {
    title: string;
    description: string;
    steps: Step[];
};

// Math helper to place items on a circle
const getCoordinates = (angleDegrees: number, radius: number) => {
    // 0 degrees is at the top (12 o'clock), moving clockwise
    const angleRadians = (angleDegrees - 90) * (Math.PI / 180);
    return {
        x: radius * Math.cos(angleRadians),
        y: radius * Math.sin(angleRadians)
    };
};

// Calculate which node a data item belongs to (first node clockwise)
const assignDataToNode = (dataAngle: number, nodes: Node[]): string => {
    const activeNodes = nodes.filter(n => !n.isRemoved).sort((a, b) => a.angle - b.angle);
    if (activeNodes.length === 0) return "";

    // Find first node with angle >= dataAngle
    for (const node of activeNodes) {
        if (node.angle >= dataAngle) {
            return node.id;
        }
    }
    // Wrap around to first node
    return activeNodes[0].id;
};

// Standard Initial State
const initialNodes: Node[] = [
    { id: 'n1', label: 'N1', angle: 0 },
    { id: 'n2', label: 'N2', angle: 120 },
    { id: 'n3', label: 'N3', angle: 240 }
];

const initialDataItems: DataItem[] = [
    { id: 'd1', label: 'A', angle: 30, assignedToNodeId: 'n2' },
    { id: 'd2', label: 'B', angle: 90, assignedToNodeId: 'n2' },
    { id: 'd3', label: 'C', angle: 150, assignedToNodeId: 'n3' },
    { id: 'd4', label: 'D', angle: 210, assignedToNodeId: 'n3' },
    { id: 'd5', label: 'E', angle: 270, assignedToNodeId: 'n1' },
    { id: 'd6', label: 'F', angle: 330, assignedToNodeId: 'n1' }
];

// Recompute assignments for standard hashing (modulo based, simulated by total reshuffle)
const simulateStandardHashingChange = (): DataItem[] => {
    // In standard hash(key) % N, adding/removing a server remaps almost everything.
    // We simulate this by scattering the data to random new assigned nodes conceptually,
    // though visually on a ring it's a bit abstract. We'll simply show widespread reassignments.
    return [
        { id: 'd1', label: 'A', angle: 45, assignedToNodeId: 'n1', isReassigned: true },
        { id: 'd2', label: 'B', angle: 105, assignedToNodeId: 'n4', isReassigned: true },
        { id: 'd3', label: 'C', angle: 165, assignedToNodeId: 'n3', isReassigned: true },
        { id: 'd4', label: 'D', angle: 225, assignedToNodeId: 'n2', isReassigned: true },
        { id: 'd5', label: 'E', angle: 285, assignedToNodeId: 'n4', isReassigned: true },
        { id: 'd6', label: 'F', angle: 345, assignedToNodeId: 'n2', isReassigned: true }
    ];
};

const FLOW_PATTERNS: Record<string, Pattern> = {
    'standard': {
        title: 'Standard Hashing',
        description: 'hash(key) % N where N is number of servers.',
        steps: [
            {
                text: 'Initial state: 3 servers (N1, N2, N3). Data is distributed.',
                nodes: initialNodes,
                dataItems: initialDataItems
            },
            {
                text: 'A new server (N4) is added. Modulo changes from % 3 to % 4.',
                nodes: [...initialNodes, { id: 'n4', label: 'N4', angle: 180, isActive: true }],
                dataItems: initialDataItems
            },
            {
                text: 'Almost ALL data keys are rehashed and moved to different servers (Expensive!).',
                nodes: [...initialNodes, { id: 'n4', label: 'N4', angle: 180 }],
                dataItems: simulateStandardHashingChange()
            }
        ]
    },
    'consistent': {
        title: 'Consistent Hashing',
        description: 'Keys and Servers map to a conceptual ring.',
        steps: [
            {
                text: 'Initial state: 3 servers on a hash ring. Data maps to the next server clockwise.',
                nodes: initialNodes,
                dataItems: initialDataItems
            },
            {
                text: 'Server N4 is added at angle 180°. It takes over a segment from N3.',
                nodes: [...initialNodes, { id: 'n4', label: 'N4', angle: 180, isActive: true }],
                dataItems: initialDataItems
            },
            {
                text: 'Only data between N2 (120°) and N4 (180°) is reassigned to N4. The rest stays put!',
                nodes: [...initialNodes, { id: 'n4', label: 'N4', angle: 180 }],
                dataItems: initialDataItems.map(d => ({
                    ...d,
                    assignedToNodeId: assignDataToNode(d.angle, [...initialNodes, { id: 'n4', label: 'N4', angle: 180 }]),
                    isReassigned: d.id === 'd3' // Only C is between 120 and 180
                }))
            },
            {
                text: 'Server N1 crashes! Its data must be redistributed.',
                nodes: [
                    { ...initialNodes[0], isRemoved: true },
                    initialNodes[1],
                    initialNodes[2],
                    { id: 'n4', label: 'N4', angle: 180 }
                ],
                dataItems: initialDataItems.map(d => ({
                    ...d,
                    assignedToNodeId: assignDataToNode(d.angle, [...initialNodes, { id: 'n4', label: 'N4', angle: 180 }]),
                    isReassigned: d.id === 'd3'
                }))
            },
            {
                text: 'Data bound for N1 (E, F) now clockwise flows to N2. Other data is unaffected.',
                nodes: [
                    { ...initialNodes[0], isRemoved: true },
                    { ...initialNodes[1], isActive: true },
                    initialNodes[2],
                    { id: 'n4', label: 'N4', angle: 180 }
                ],
                dataItems: initialDataItems.map(d => {
                    const nodesForAssignment = [
                        initialNodes[1],
                        initialNodes[2],
                        { id: 'n4', label: 'N4', angle: 180 }
                    ];
                    const newAssignment = assignDataToNode(d.angle, nodesForAssignment);
                    return {
                        ...d,
                        assignedToNodeId: newAssignment,
                        isReassigned: d.id === 'd3' || d.id === 'd5' || d.id === 'd6'
                    };
                })
            }
        ]
    },
    'virtual': {
        title: 'Virtual Nodes',
        description: 'Servers get multiple positions on the ring for better balance.',
        steps: [
            {
                text: 'Without virtual nodes, the ring can become unbalanced if nodes clump together.',
                nodes: [
                    { id: 'n1', label: 'N1', angle: 10 },
                    { id: 'n2', label: 'N2', angle: 60 },
                    { id: 'n3', label: 'N3', angle: 80 }
                ],
                // Everything from 80 to 360 to 10 goes to N1 (huge chunk)
                dataItems: []
            },
            {
                text: 'Instead, we assign each physical server multiple "virtual nodes" across the ring.',
                nodes: [
                    { id: 'n1', label: 'N1', angle: 0 },
                    { id: 'n1_v1', label: 'N1', angle: 120, isVirtual: true },
                    { id: 'n1_v2', label: 'N1', angle: 240, isVirtual: true },
                    { id: 'n2', label: 'N2', angle: 60 },
                    { id: 'n2_v1', label: 'N2', angle: 180, isVirtual: true },
                    { id: 'n2_v2', label: 'N2', angle: 300, isVirtual: true }
                ],
                dataItems: []
            },
            {
                text: 'Data distribution becomes uniform. If a node fails, its load spreads evenly to others.',
                nodes: [
                    { id: 'n1', label: 'N1', angle: 0 },
                    { id: 'n1_v1', label: 'N1', angle: 120, isVirtual: true },
                    { id: 'n1_v2', label: 'N1', angle: 240, isVirtual: true },
                    { id: 'n2', label: 'N2', angle: 60 },
                    { id: 'n2_v1', label: 'N2', angle: 180, isVirtual: true },
                    { id: 'n2_v2', label: 'N2', angle: 300, isVirtual: true }
                ],
                dataItems: [
                    { id: 'v_d1', label: 'A', angle: 30, assignedToNodeId: 'n2' },
                    { id: 'v_d2', label: 'B', angle: 90, assignedToNodeId: 'n1_v1' },
                    { id: 'v_d3', label: 'C', angle: 150, assignedToNodeId: 'n2_v1' },
                    { id: 'v_d4', label: 'D', angle: 210, assignedToNodeId: 'n1_v2' },
                    { id: 'v_d5', label: 'E', angle: 270, assignedToNodeId: 'n2_v2' },
                    { id: 'v_d6', label: 'F', angle: 330, assignedToNodeId: 'n1' }
                ]
            }
        ]
    }
};

const COMPARISON = [
    { name: "Standard Hashing", reqChange: "O(N) data moves", uniform: false, complexity: 1, bestFor: "Static fixed pools (rare)" },
    { name: "Consistent Hashing", reqChange: "O(K/N) data moves", uniform: false, complexity: 3, bestFor: "Dynamic scaling, caching" },
    { name: "Consistent + Virtual", reqChange: "O(K/N) data moves", uniform: true, complexity: 4, bestFor: "Cassandra, DynamoDB, Riak" }
];

const RESOURCES = [
    { title: "System Design Primer - Consistent Hashing", type: "youtube", url: "https://www.youtube.com/watch?v=zaRkONvyGr8" },
    { title: "A Guide to Consistent Hashing", type: "web", url: "https://www.toptal.com/big-data/consistent-hashing" },
    { title: "Dynamo: Amazon's Highly Available Key-value Store", type: "web", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" },
    { title: "Grokking System Design Interview", type: "course", url: "https://www.educative.io/courses/grokking-the-system-design-interview" },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function ConsistentHashingGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activePatternKey, setActivePatternKey] = useState('consistent');
    const [currentStepIdx, setCurrentStepIdx] = useState(0);

    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playPattern = useCallback((patternKey: string) => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];

        setActivePatternKey(patternKey);
        setCurrentStepIdx(0);

        const pattern = FLOW_PATTERNS[patternKey];
        const stepTime = 2500 * animationSpeed;

        pattern.steps.forEach((_, i) => {
            if (i === 0) return; // Skip initial step assignment in timeout
            const t = setTimeout(() => {
                setCurrentStepIdx(i);
            }, i * stepTime);
            animRef.current.push(t);
        });

    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playPattern('consistent'), 500);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playPattern]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(prev => prev + 1);
    };

    const activePattern = FLOW_PATTERNS[activePatternKey];
    const currentStep = activePattern.steps[currentStepIdx] || activePattern.steps[0];

    const radius = 140; // Pixels for the ring radius

    return (
        <GuideLayout
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPTS GRID ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="ch-grid">
                <div className="viz-card ch-card card-green">
                    <div className="ch-card-header">
                        <div className="ch-card-icon">📍</div>
                        <div className="ch-card-name">Data Hashing</div>
                    </div>
                    <p className="ch-card-desc">Every piece of data (key) is hashed into an integer (e.g., using SHA-256) and mapped to a point on the conceptual ring.</p>
                </div>

                <div className="viz-card ch-card card-cyan">
                    <div className="ch-card-header">
                        <div className="ch-card-icon">🖥️</div>
                        <div className="ch-card-name">Node Hashing</div>
                    </div>
                    <p className="ch-card-desc">Servers (nodes) are hashed using their IP or ID onto the exact same conceptual ring alongside the data.</p>
                </div>

                <div className="viz-card ch-card card-purple">
                    <div className="ch-card-header">
                        <div className="ch-card-icon">➡️</div>
                        <div className="ch-card-name">Clockwise Routing</div>
                    </div>
                    <p className="ch-card-desc">To find the server for a data key, walk clockwise around the ring from the data's hash value until you hit the first server.</p>
                </div>

                <div className="viz-card ch-card card-orange">
                    <div className="ch-card-header">
                        <div className="ch-card-icon">👻</div>
                        <div className="ch-card-name">Virtual Nodes</div>
                    </div>
                    <p className="ch-card-desc">To prevent uneven load distribution, each physical server is mapped to multiple 'virtual' points on the ring to balance the segments.</p>
                </div>
            </div>

            {/* ═══════════════ MERMAID DIAGRAM ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Conceptual Architecture</h2>
                <p className="viz-section-hint">How finding a node works.</p>
            </div>
            <div className="ch-mermaid-wrap">
                <div className="viz-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <pre className="mermaid" style={{ margin: 0 }}>
                        {`flowchart TD
    Client(["Client API Request"]) --> HashKey["Hash('user_123')"]
    HashKey --> Ring{Hash Ring}
    
    subgraph Hash Ring space
        Ring --> Walk[Walk Clockwise]
        Walk --> NodeMatch[First Node Found]
    end
    
    NodeMatch --> S1[(Server A)]
    NodeMatch -.->|If A fails| S2[(Server B)]
    
    style Client fill:transparent,stroke:#22d3ee,color:#ffffff
    style HashKey fill:#12161f,stroke:#334155,color:#ffffff
    style Ring fill:transparent,stroke:none,color:#c084fc
    style Walk fill:#12161f,stroke:#334155,color:#ffffff
    style NodeMatch fill:transparent,stroke:#4ade80,color:#4ade80
    style S1 fill:transparent,stroke:#334155,color:#ffffff
    style S2 fill:transparent,stroke:#f472b6,color:#94a3b8
`}
                    </pre>
                </div>
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Consistent Hashing in Action</h2>
                <p className="viz-section-hint">Visualize data assignment and node scaling</p>
            </div>

            <div className="ch-flow-section">
                <div className="ch-controls">
                    {Object.keys(FLOW_PATTERNS).map(key => (
                        <button
                            key={key}
                            className={`ch-tab-btn ${activePatternKey === key ? 'active' : ''}`}
                            onClick={() => playPattern(key)}
                        >
                            {FLOW_PATTERNS[key].title}
                        </button>
                    ))}

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border2)',
                            background: 'transparent',
                            color: 'var(--text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginLeft: '0.5rem'
                        }}
                        aria-label="Settings"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={() => playPattern(activePatternKey)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border2)',
                            background: 'transparent',
                            color: 'var(--green)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        aria-label="Replay Sequence"
                    >
                        <span style={{ fontSize: '1.2rem', lineHeight: 1, marginTop: '-2px' }}>↺</span>
                    </button>
                </div>

                <div className="ch-flow-diagram">
                    <div className="ch-ring-container">
                        <div className="ch-ring-center">
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-hi)' }}>Hash Ring</h3>
                            <div>0° - 360°</div>
                        </div>

                        {/* Render Nodes (Servers) */}
                        {currentStep.nodes.map(node => {
                            const coords = getCoordinates(node.angle, radius);
                            return (
                                <div
                                    key={node.id}
                                    className={`ch-node ${node.isVirtual ? 'virtual' : ''} ${node.isActive ? 'active' : ''} ${node.isRemoved ? 'removed' : ''}`}
                                    style={{
                                        left: `calc(50% + ${coords.x}px)`,
                                        top: `calc(50% + ${coords.y}px)`
                                    }}
                                >
                                    {node.isRemoved ? '×' : node.label}
                                </div>
                            );
                        })}

                        {/* Render Data Items */}
                        {currentStep.dataItems.map(data => {
                            // Find corresponding node to show attachment if needed, but visually 
                            // we place data on the ring based on its angle.
                            const coords = getCoordinates(data.angle, radius - 25); // Set slightly inside the ring
                            return (
                                <div
                                    key={data.id}
                                    className={`ch-data ${data.isReassigned ? 'reassigned' : ''}`}
                                    style={{
                                        left: `calc(50% + ${coords.x}px)`,
                                        top: `calc(50% + ${coords.y}px)`
                                    }}
                                    title={`Assigned to ${data.assignedToNodeId}`}
                                >
                                    {data.label}
                                </div>
                            );
                        })}
                    </div>

                    <div className="ch-flow-steps">
                        {activePattern.steps.map((step, i) => (
                            <div key={step.text + i} className={`ch-step ${currentStepIdx === i ? 'active' : ''}`}>
                                <div className="ch-step-num">{i + 1}</div>
                                <div className="ch-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ch-legend">
                    <div className="ch-legend-item">
                        <div className="ch-legend-box leg-node"></div> Physical Node
                    </div>
                    <div className="ch-legend-item">
                        <div className="ch-legend-box leg-virtual"></div> Virtual Node
                    </div>
                    <div className="ch-legend-item">
                        <div className="ch-legend-box leg-data"></div> Data Key
                    </div>
                    <div className="ch-legend-item">
                        <div className="ch-legend-box leg-reassigned"></div> Reassigned Data
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Scaling Implication Comparison</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Algorithm</th>
                            <th>Cost to Add/Remove Node (K = keys, N = nodes)</th>
                            <th>Uniform Load Distribution</th>
                            <th>Complexity</th>
                            <th>Best For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.name}</td>
                                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em', color: row.reqChange.includes('K/N') ? 'var(--green)' : 'var(--pink)' }}>{row.reqChange}</span></td>
                                <td>{row.uniform ? <span className="ch-check">✓ Yes</span> : <span className="ch-cross">✗ No (uneven gaps)</span>}</td>
                                <td><Rating dots={row.complexity} /></td>
                                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{row.bestFor}</td>
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

        </GuideLayout >
    );
}

// ════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: i <= dots ? 'var(--text-hi)' : 'var(--border2)'
                }} />
            ))}
        </div>
    );
}

function ResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <Video size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'course': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

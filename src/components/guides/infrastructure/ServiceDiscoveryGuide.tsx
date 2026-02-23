"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Video, Globe, ExternalLink, Heart, Radio, Search, Database } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/service-discovery.css';

const guide = guidesData.guides.find(v => v.id === "service-discovery")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    id: number;
    text: string;
    activeNodes: string[];
    registryHighlight?: string;
    action?: 'register' | 'heartbeat' | 'lookup' | 'evict';
};

const FLOW_STEPS: Step[] = [
    { id: 0, text: "Service 'Order-v1' starts up on IP 10.0.0.5", activeNodes: ['order-1'] },
    { id: 1, text: "Registration: Order-v1 announces itself to Registry", activeNodes: ['order-1', 'registry'], action: 'register' },
    { id: 2, text: "Heartbeat: Periodic health check sent to Registry", activeNodes: ['order-1', 'registry'], action: 'heartbeat' },
    { id: 3, text: "Client 'API-Gateway' needs to call Order service", activeNodes: ['gateway'] },
    { id: 4, text: "Lookup: Client queries Registry for healthy 'Order' nodes", activeNodes: ['gateway', 'registry'], action: 'lookup' },
    { id: 5, text: "Routing: Registry returns IP 10.0.0.5; Client calls Service", activeNodes: ['gateway', 'order-1'] }
];

const CONCEPTS = [
    {
        title: "Service Registry",
        icon: <Database size={18} />,
        desc: "A database of available service instances, their locations (IP/Port), and health status."
    },
    {
        title: "Registration",
        icon: <Radio size={18} />,
        desc: "The process by which a service instance adds its network location to the registry on startup."
    },
    {
        title: "Heartbeat & Health",
        icon: <Heart size={18} />,
        desc: "Instances periodically send 'I am alive' signals. Registry evicts nodes that fail to heartbeat."
    },
    {
        title: "Service Discovery",
        icon: <Search size={18} />,
        desc: "The mechanism for finding service instances, either via Client-side or Server-side patterns."
    }
];

const DISCOVERY_PATTERNS = [
    {
        title: "Client-Side Discovery",
        pros: ["No single point of failure (in lookup)", "Client has full control over LB"],
        cons: ["Client complexity", "Tight coupling to Registry SDK"],
        example: "Netflix Eureka + Ribbon"
    },
    {
        title: "Server-Side Discovery",
        pros: ["Simple clients", "Language agnostic", "Standardized Load Balancing"],
        cons: ["Another network hop", "LB is a critical bottleneck"],
        example: "Kubernetes (Service/Kube-proxy), AWS ELB"
    }
];

const TOOLS = [
    { name: "Consul", provider: "HashiCorp", keyFeature: "KV Store + Health Checks", consistency: "CP (Raft)" },
    { name: "Eureka", provider: "Netflix", keyFeature: "High Availability", consistency: "AP" },
    { name: "etcd", provider: "CNCF", keyFeature: "Distributed KV (K8s backend)", consistency: "CP" },
    { name: "Zookeeper", provider: "Apache", keyFeature: "Hierarchical Namespace", consistency: "CP" }
];

const RESOURCES = [
    { title: "Service Discovery and Service Registry in Microservices", type: "web", url: "https://www.geeksforgeeks.org/java/service-discovery-and-service-registry-in-microservices/" },
    { title: "Master Service Discovery in Microservices", type: "youtube", url: "https://www.youtube.com/watch?v=ecuEkmFs5Vk" },
    { title: "What is Service Discovery? - A Dev' Story", type: "youtube", url: "https://www.youtube.com/watch?v=v4u7m2Im7ng" }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function ServiceDiscoveryGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playSequence = useCallback(() => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];
        setCurrentStepIdx(-1);

        const stepTime = 2000 * animationSpeed;

        FLOW_STEPS.forEach((_, i) => {
            const t = setTimeout(() => {
                setCurrentStepIdx(i);
            }, i * stepTime);
            animRef.current.push(t);
        });
    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playSequence(), 500);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playSequence]);

    const handleReplay = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setReplayCount(prev => prev + 1);
    };

    const currentStep = currentStepIdx >= 0 ? FLOW_STEPS[currentStepIdx] : null;

    return (
        <GuideLayout
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CORE CONCEPTS ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="sd-grid">
                {CONCEPTS.map((concept) => (
                    <div key={concept.title} className="viz-card sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-icon" style={{ borderColor: guide.colorConfig.primary, color: guide.colorConfig.primary }}>
                                {concept.icon}
                            </div>
                            <div className="sd-card-name">{concept.title}</div>
                        </div>
                        <p className="sd-card-desc">{concept.desc}</p>
                    </div>
                ))}
            </div>

            {/* ═══════════════ INTERACTIVE VISUALIZATION ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Discovery Lifecycle</h2>
                <p className="viz-section-hint">Visualize service registration and lookup flow</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
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
                        onClick={playSequence}
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
            </div>

            <div className="sd-flow-section">
                <div className="sd-viz-container">
                    <div className="sd-discovery-model">

                        {/* Registry */}
                        <div className={`sd-registry-node ${currentStep?.activeNodes.includes('registry') ? 'active' : ''}`}>
                            <div className="sd-registry-title">🏛️ Service Registry</div>
                            <table className="sd-registry-table">
                                <thead>
                                    <tr><th>Service</th><th>Location</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    <tr className={currentStepIdx >= 1 ? 'active' : ''}>
                                        <td>Order-v1</td>
                                        <td>10.0.0.5:80</td>
                                        <td>
                                            {(() => {
                                                if (currentStepIdx >= 2) return 'Healthy';
                                                if (currentStepIdx === 1) return 'Registering';
                                                return '-';
                                            })()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>User-v2</td>
                                        <td>10.0.0.8:80</td>
                                        <td>Healthy</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Nodes Row */}
                        <div className="sd-nodes-row">
                            <div className={`sd-node ${currentStep?.activeNodes.includes('gateway') ? 'active' : ''}`}>
                                <div className="sd-node-title">🌐 API Gateway</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Client App</div>
                                {currentStep?.action === 'lookup' && <div className="sd-lookup-indicator" style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', color: 'var(--purple)', fontSize: '0.7rem' }}>Looking up 'Order'...</div>}
                            </div>

                            <div className={`sd-node ${currentStep?.activeNodes.includes('order-1') ? 'active' : ''}`}>
                                <div className="sd-node-title">🛒 Order Service</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>IP: 10.0.0.5</div>
                                <div className={`sd-node-status`} style={{
                                    background: (() => {
                                        if (currentStepIdx >= 2) return 'var(--green)';
                                        if (currentStepIdx === 1) return 'var(--purple)';
                                        return 'var(--border2)';
                                    })()
                                }} />
                                {currentStep?.action === 'heartbeat' && <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--red)' }}>❤️ Beat</div>}
                            </div>
                        </div>
                    </div>

                    {/* Step Counter */}
                    <div className="sd-flow-steps">
                        {FLOW_STEPS.map((step, i) => (
                            <div key={step.id} className={`sd-step ${currentStepIdx === i ? 'active' : ''}`}>
                                <div className="sd-step-num">{i + 1}</div>
                                <div className="sd-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ PATTERNS COMPARISON ═══════════════ */}
            <h2 className="section-title">Discovery Patterns</h2>
            <div className="sd-grid">
                {DISCOVERY_PATTERNS.map((pattern) => (
                    <div key={pattern.title} className="viz-card sd-card" style={{ borderTop: `4px solid ${pattern.title.includes('Client') ? 'var(--blue)' : 'var(--green)'}` }}>
                        <h3 className="sd-card-name" style={{ marginBottom: '1rem' }}>{pattern.title}</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--green)', marginBottom: '0.4rem' }}>PROS</div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                {pattern.pros.map((p) => <li key={p}>{p}</li>)}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--red)', marginBottom: '0.4rem' }}>CONS</div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                {pattern.cons.map((c) => <li key={c}>{c}</li>)}
                            </ul>
                        </div>

                        <div className="sd-use-case" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.7rem' }}>
                            <strong>Example:</strong> {pattern.example}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════ TOOLS TABLE ═══════════════ */}
            <h2 className="section-title">Popular Tools</h2>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Tool</th>
                            <th>Consistency</th>
                            <th>Key Feature</th>
                            <th>Status Checks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TOOLS.map(tool => (
                            <tr key={tool.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{tool.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{tool.consistency}</td>
                                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{tool.keyFeature}</td>
                                <td><span style={{ color: 'var(--green)', fontSize: '0.75rem' }}>✓ Active</span></td>
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
                                        {res.type === 'youtube' ? <Video size={16} color="#FF4444" /> : <Globe size={16} color="#4A90E2" />}
                                        <span style={{ textTransform: 'capitalize' }}>{res.type}</span>
                                    </div>
                                </td>
                                <td>
                                    <a
                                        href={`${res.url}?ref=vizly.dev`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--blue)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
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

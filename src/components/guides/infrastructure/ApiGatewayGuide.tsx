"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Settings, Youtube, Globe, BookOpen, ExternalLink, ShieldCheck, Zap, Activity, Repeat, Grid, Lock } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/api-gateway.css';

const guide = guidesData.guides.find(v => v.id === "api-gateway")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type Step = {
    id: number;
    text: string;
    activeNode: 'client' | 'gateway' | 'middleware' | 'service' | 'none';
    activeMiddleware?: 'auth' | 'rate-limit' | 'discovery';
    activeServiceIdx?: number;
    status?: 'processing' | 'success' | 'error';
};

const FLOW_STEPS: Step[] = [
    { id: 0, text: "Client initiates request to api.vize.dev/orders", activeNode: 'client' },
    { id: 1, text: "API Gateway receives entry request", activeNode: 'gateway', status: 'processing' },
    { id: 2, text: "Auth Middleware: Verifying JWT/API Key", activeNode: 'middleware', activeMiddleware: 'auth' },
    { id: 3, text: "Rate Limiter: Checking quota (100 req/min)", activeNode: 'middleware', activeMiddleware: 'rate-limit' },
    { id: 4, text: "Service Discovery: Locating 'Order Service'", activeNode: 'middleware', activeMiddleware: 'discovery' },
    { id: 5, text: "Routing: Proxying request to microservice node", activeNode: 'service', activeServiceIdx: 1 },
    { id: 6, text: "Success: Aggregating response back to client", activeNode: 'gateway', status: 'success' }
];

const RESPONSIBILITIES = [
    {
        title: "Authentication & Security",
        icon: <ShieldCheck size={18} />,
        desc: "Centralized identity provider integration (OIDC/SAML), JWT validation, and IP whitelisting."
    },
    {
        title: "Rate Limiting",
        icon: <Zap size={18} />,
        desc: "Protect backends from DDoS and traffic spikes using Token Bucket or Leaking Bucket algorithms."
    },
    {
        title: "Request Transformation",
        icon: <Repeat size={18} />,
        desc: "Modify headers, strip cookies, or convert protocols (e.g., HTTP/Rest to gRPC/Websocket)."
    },
    {
        title: "Load Balancing",
        icon: <Activity size={18} />,
        desc: "Internal traffic distribution across multiple instances of the same microservice."
    },
    {
        title: "Service Aggregation",
        icon: <Grid size={18} />,
        desc: "BFF (Backend for Frontend) pattern: Combine data from multiple services into one response."
    },
    {
        title: "Logging & Observability",
        icon: <Lock size={18} />,
        desc: "Unified logging of all transit traffic, latency monitoring, and distributed tracing IDs."
    }
];

const COMPARISON = [
    { name: "NGINX / OpenResty", tech: "C / Lua", bestFor: "Static performance, basic routing", popularity: 5 },
    { name: "Kong", tech: "Lua / Postgres", bestFor: "Plugin ecosystem, enterprise features", popularity: 5 },
    { name: "AWS API Gateway", tech: "Cloud Native", bestFor: "Serverless (Lambda integration)", popularity: 4 },
    { name: "Apigee", tech: "Java / Google", bestFor: "API Monetization, legacy systems", popularity: 3 },
    { name: "Tyk", tech: "Go", bestFor: "High performance, developers", popularity: 4 },
    { name: "KrakenD", tech: "Go", bestFor: "Stateless, extreme throughput", popularity: 3 }
];

const RESOURCES = [
    { title: "What is API Gateway? by ByteByteGo", type: "youtube", url: "https://www.youtube.com/watch?v=6ULyxuHKxg8" },
    { title: "API Gateway - GeeksforGeeks", type: "web", url: "https://www.geeksforgeeks.org/system-design/what-is-api-gateway-system-design/" },
    { title: "API Gateway - Microservices.io", type: "web", url: "https://microservices.io/patterns/apigateway.html" }
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function ApiGatewayGuide() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playSequence = useCallback(() => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];
        setCurrentStepIdx(-1);

        const stepTime = 1800 * animationSpeed;

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
            githubPath="src/components/guides/infrastructure/ApiGatewayGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CORE CONCEPTS ═══════════════ */}
            <h2 className="section-title">Core Responsibilities</h2>
            <div className="gw-grid">
                {RESPONSIBILITIES.map((resp, i) => (
                    <div key={i} className="viz-card gw-card">
                        <div className="gw-card-header">
                            <div className="gw-card-icon" style={{ borderColor: guide.colorConfig.primary, color: guide.colorConfig.primary }}>
                                {resp.icon}
                            </div>
                            <div className="gw-card-name">{resp.title}</div>
                        </div>
                        <p className="gw-card-desc">{resp.desc}</p>
                    </div>
                ))}
            </div>

            {/* ═══════════════ INTERACTIVE FLOW ═══════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Anatomy of a Request</h2>
                <p className="viz-section-hint">Follow a request as it traverses the gateway layers</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
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
                        onClick={playSequence}
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
            </div>

            <div className="gw-flow-section">
                <div className="gw-flow-diagram">
                    <div className="gw-request-path">

                        {/* Client */}
                        <div className={`gw-node ${currentStep?.activeNode === 'client' ? 'active' : ''}`}>
                            👤 Client App
                        </div>

                        <div className={`gw-connector ${currentStepIdx > 0 ? 'active' : ''}`} />
                        <div className={`gw-arrow ${currentStepIdx > 0 ? 'active' : ''}`}>▼</div>

                        {/* Gateway Core */}
                        <div className={`gw-node ${currentStep?.activeNode === 'gateway' ? (currentStep?.status || 'active') : ''}`}>
                            🚪 API Gateway Entry
                            {currentStep?.status === 'processing' && <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>Ingesting...</div>}
                            {currentStep?.status === 'success' && <div style={{ fontSize: '0.6rem', color: 'var(--green)' }}>Complete ✅</div>}
                        </div>

                        <div className={`gw-connector ${currentStepIdx > 1 ? 'active' : ''}`} />

                        {/* Middleware Stack */}
                        <div className="gw-middleware-stack">
                            <div className={`gw-middleware-node ${currentStep?.activeMiddleware === 'auth' ? 'active' : ''}`}>
                                🔐 Auth & Security
                            </div>
                            <div className={`gw-middleware-node ${currentStep?.activeMiddleware === 'rate-limit' ? 'active' : ''}`}>
                                🚦 Rate Limiting
                            </div>
                            <div className={`gw-middleware-node ${currentStep?.activeMiddleware === 'discovery' ? 'active' : ''}`}>
                                🔍 Service Discovery
                            </div>
                        </div>

                        <div className={`gw-connector ${currentStepIdx > 4 ? 'active' : ''}`} />
                        <div className={`gw-arrow ${currentStepIdx > 4 ? 'active' : ''}`}>▼</div>

                        {/* Services */}
                        <div className="gw-service-pool">
                            <div className={`gw-service-node ${currentStep?.activeServiceIdx === 0 ? 'active' : ''}`}>
                                📦 User Service
                            </div>
                            <div className={`gw-service-node ${currentStep?.activeServiceIdx === 1 ? 'active' : ''}`}>
                                🛒 Order Service
                            </div>
                            <div className={`gw-service-node ${currentStep?.activeServiceIdx === 2 ? 'active' : ''}`}>
                                💳 Payment Service
                            </div>
                        </div>
                    </div>

                    {/* Step Counter */}
                    <div className="gw-flow-steps">
                        {FLOW_STEPS.map((step, i) => (
                            <div key={step.id} className={`gw-step ${currentStepIdx === i ? 'active' : ''}`}>
                                <div className="gw-step-num">{i + 1}</div>
                                <div className="gw-step-text">{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON ═══════════════ */}
            <h2 className="section-title">Popular Gateways</h2>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Gateway</th>
                            <th>Technology</th>
                            <th>Best For</th>
                            <th>Market Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(item => (
                            <tr key={item.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{item.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{item.tech}</td>
                                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{item.bestFor}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[1, 2, 3, 4, 5].map(dot => (
                                            <div key={dot} style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: dot <= item.popularity ? guide.colorConfig.primary : 'var(--border2)'
                                            }} />
                                        ))}
                                    </div>
                                </td>
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
                                        {res.type === 'youtube' ? <Youtube size={16} color="#FF4444" /> : <Globe size={16} color="#4A90E2" />}
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

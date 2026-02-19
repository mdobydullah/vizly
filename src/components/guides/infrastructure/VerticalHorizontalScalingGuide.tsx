"use client";

import React, { useState } from 'react';
import { ArrowUp, Copy, Youtube, Globe, BookOpen, ExternalLink } from 'lucide-react';
import guidesData from "@/data/guides";
import { GuideLayout } from '@/components/layout/GuideLayout';
import { useSettings } from "@/context/SettingsContext";
import '@/styles/guides/infrastructure/vertical-horizontal-scaling.css';

const guide = guidesData.guides.find(v => v.id === "vertical-horizontal-scaling")!;

const RESOURCES = [
    { title: "MongoDB: Horizontal vs Vertical", type: "web", url: "https://www.mongodb.com/resources/basics/horizontal-vs-vertical-scaling" },
    { title: "System Design Primer: Scalability", type: "github", url: "https://github.com/donnemartin/system-design-primer#scalability" },
    { title: "AlgoMaster: Vertical vs Horizontal Scaling", type: "article", url: "https://blog.algomaster.io/p/system-design-vertical-vs-horizontal-scaling" },
];

export function VerticalHorizontalScalingGuide() {
    const { animationSpeed } = useSettings();
    const [mode, setMode] = useState<'vertical' | 'horizontal'>('vertical');
    const [verticalKey, setVerticalKey] = useState(0);
    const [horizontalKey, setHorizontalKey] = useState(0);

    const handleReplay = () => {
        setMode('vertical');
        setVerticalKey(k => k + 1);
        setHorizontalKey(k => k + 1);
    };

    return (
        <GuideLayout
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ════════════ HERO CONCEPTS ════════════ */}
            <h2 className="section-title">Scaling Strategies</h2>
            <div className="scaling-grid">
                <button
                    className={`viz-card scaling-card ${mode === 'vertical' ? 'card-pink' : ''} text-left`}
                    onClick={() => setMode('vertical')}
                    style={{ cursor: 'pointer', borderColor: mode === 'vertical' ? 'var(--pink)' : undefined }}
                >
                    <div className="scaling-card-header">
                        <div className="scaling-card-icon">⬆️</div>
                        <div className="scaling-card-name">Vertical Scaling</div>
                    </div>
                    <p className="scaling-card-desc">"Scaling Up". Increasing the power of a single server (CPU, RAM).</p>
                    <div className="scaling-card-stats">
                        <span className="scaling-stat-chip hi">Easy Start</span>
                        <span className="scaling-stat-chip">Hardware Limit</span>
                    </div>
                </button>

                <button
                    className={`viz-card scaling-card ${mode === 'horizontal' ? 'card-cyan' : ''} text-left`}
                    onClick={() => setMode('horizontal')}
                    style={{ cursor: 'pointer', borderColor: mode === 'horizontal' ? 'var(--cyan)' : undefined }}
                >
                    <div className="scaling-card-header">
                        <div className="scaling-card-icon">↔️</div>
                        <div className="scaling-card-name">Horizontal Scaling</div>
                    </div>
                    <p className="scaling-card-desc">"Scaling Out". Adding more servers to a pool to handle load.</p>
                    <div className="scaling-card-stats">
                        <span className="scaling-stat-chip hi">Unlimited</span>
                        <span className="scaling-stat-chip">Complex</span>
                    </div>
                </button>
            </div>

            {/* ════════════ INTERACTIVE VIZ ════════════ */}
            <div className="viz-section-header">
                <h2 className="viz-section-title">Interactive Visualization</h2>
                <p className="viz-section-hint">Explore how each scaling method works in practice</p>
            </div>

            <div className="scaling-viz-container">
                <div className="scaling-controls">
                    <button
                        className={`scaling-mode-btn ${mode === 'vertical' ? 'active' : ''}`}
                        onClick={() => setMode('vertical')}
                    >
                        <ArrowUp size={16} /> Vertical (Scale Up)
                    </button>
                    <button
                        className={`scaling-mode-btn ${mode === 'horizontal' ? 'active' : ''}`}
                        onClick={() => setMode('horizontal')}
                    >
                        <Copy size={16} /> Horizontal (Scale Out)
                    </button>
                </div>

                <div className="scaling-playground">
                    {mode === 'vertical' ? (
                        <VerticalView key={verticalKey} />
                    ) : (
                        <HorizontalView key={horizontalKey} />
                    )}
                </div>
            </div>

            {/* ════════════ COMPARISON TABLE ════════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Comparison Use-Cases</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Vertical Scaling (Scale Up)</th>
                            <th>Horizontal Scaling (Scale Out)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 600, color: 'var(--text-hi)' }}>Complexity</td>
                            <td><span className="scaling-stat-chip hi">Low</span> - No code changes usually needed.</td>
                            <td><span className="scaling-stat-chip">High</span> - Requires load balancer, stateless app.</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600, color: 'var(--text-hi)' }}>Cost</td>
                            <td>Exponential - Big servers are very expensive.</td>
                            <td>Linear - Add cheap commodity hardware.</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600, color: 'var(--text-hi)' }}>Downtime</td>
                            <td><span className="scaling-cross">Required</span> - Reboot needed to upgrade limits.</td>
                            <td><span className="scaling-check">None</span> - Add servers without stopping.</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600, color: 'var(--text-hi)' }}>Limit</td>
                            <td>Hardware Ceiling (Max RAM/CPU slot).</td>
                            <td>Theoretically Infinite.</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600, color: 'var(--text-hi)' }}>Best For</td>
                            <td>Databases (SQL), Monoliths, MVPs.</td>
                            <td>Web Apps, Microservices, NoSQL.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ════════════ RESOURCES ════════════ */}
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

function VerticalView() {
    const { animationSpeed } = useSettings();
    const [serverSize, setServerSize] = useState<'sm' | 'md' | 'lg'>('sm');
    const [isUpgrading, setIsUpgrading] = useState(false);

    const upgradeServer = () => {
        if (serverSize === 'lg' || isUpgrading) return;
        setIsUpgrading(true);
        setTimeout(() => {
            setServerSize(prev => prev === 'sm' ? 'md' : 'lg');
            setIsUpgrading(false);
        }, 800 * animationSpeed);
    };

    const getLabel = () => {
        switch (serverSize) {
            case 'sm': return 'Standard Instance';
            case 'md': return 'Large Instance';
            case 'lg': return 'X-Large Instance';
        }
    };

    const getCpu = () => {
        switch (serverSize) {
            case 'sm': return '4';
            case 'md': return '16';
            case 'lg': return '64';
        }
    };

    const getRam = () => {
        switch (serverSize) {
            case 'sm': return '8';
            case 'md': return '32';
            case 'lg': return '128';
        }
    };

    const getCost = () => {
        switch (serverSize) {
            case 'sm': return '$40';
            case 'md': return '$160';
            case 'lg': return '$640';
        }
    };

    return (
        <div className="vs-scene">
            <div className={`vs-server-container`}>
                <div className={`vs-server size-${serverSize}`}>
                    <div className="vs-rack-ears"></div>
                    <div className="vs-resources">
                        <div className="vs-res-row">
                            <span>CPU</span>
                            <div className="vs-res-bar-bg">
                                <div className="vs-res-bar-fill"></div>
                            </div>
                        </div>
                        <div className="vs-res-row">
                            <span>RAM</span>
                            <div className="vs-res-bar-bg">
                                <div className="vs-res-bar-fill" style={{ transitionDelay: '0.1s' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="vs-label">
                        {getLabel()}
                    </div>
                </div>
            </div>

            <div className="vs-stats-panel">
                <div className="vs-stat-item">
                    <span className="vs-stat-val">{getCpu()}</span>
                    <span className="vs-stat-label">vCPUs</span>
                </div>
                <div className="vs-stat-item">
                    <span className="vs-stat-val">{getRam()}</span>
                    <span className="vs-stat-label">GB RAM</span>
                </div>
                <div className="vs-stat-item">
                    <span className="vs-stat-val">{getCost()}</span>
                    <span className="vs-stat-label">/mo</span>
                </div>
            </div>

            <button
                className="vs-upgrade-btn"
                onClick={upgradeServer}
                disabled={serverSize === 'lg' || isUpgrading}
            >
                {isUpgrading ? 'Upgrading...' : serverSize === 'lg' ? 'Max Capacity Reached' : 'Upgrade Server'}
            </button>
        </div>
    );
}

function HorizontalView() {
    const [serverCount, setServerCount] = useState(1);

    const addServer = () => {
        if (serverCount >= 6) return;
        setServerCount(prev => prev + 1);
    };

    const removeServer = () => {
        if (serverCount <= 1) return;
        setServerCount(prev => prev - 1);
    };

    return (
        <div className="hs-scene">
            <div className="hs-lb-layer">
                <div className="hs-lb">⚖️</div>
            </div>

            <div className="hs-server-pool">
                {Array.from({ length: serverCount }).map((_, i) => (
                    <div key={`srv-${i}`} className={`hs-server ${i === serverCount - 1 && serverCount > 1 ? 'new' : ''}`}>
                        <div className="hs-server-icon">🖥️</div>
                        <div className="hs-server-id">srv-0{i + 1}</div>
                    </div>
                ))}
            </div>

            <div className="hs-controls">
                <button className="hs-btn remove" onClick={removeServer} disabled={serverCount <= 1}>−</button>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{serverCount} Servers</span>
                <button className="hs-btn add" onClick={addServer} disabled={serverCount >= 6}>+</button>
            </div>
        </div>
    );
}

function ResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'article': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

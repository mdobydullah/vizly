"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Database, User, RotateCcw } from 'lucide-react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/infrastructure/cdn.css';

const guide = guidesData.guides.find(v => v.id === "cdn")!;

// ════════════════════════════════════════
// DATA
// ════════════════════════════════════════

const CONCEPTS = [
    {
        title: "Edge Servers",
        icon: "⚡",
        desc: "Servers strategically placed at the network edge, closer to users than the origin server."
    },
    {
        title: "Origin Server",
        icon: "🏢",
        desc: "The 'Master' server where the original content lives. CDNs pull from here on cache miss."
    },
    {
        title: "PoP (Points of Presence)",
        icon: "📍",
        desc: "Physical locations where CDN servers reside. More PoPs = lower latency globally."
    },
    {
        title: "TTFB Reduction",
        icon: "⏱️",
        desc: "Time To First Byte is drastically reduced because data travels a shorter distance."
    }
];

const COMPARISON = [
    { name: "Latency", cdn: "Low (Served from Edge)", direct: "High (Depends on distance)" },
    { name: "Bandwidth Costs", cdn: "Lower (Offloads origin)", direct: "Higher (Origin handles all)" },
    { name: "Reliability", cdn: "High (Redundant nodes)", direct: "Single point of failure" },
    { name: "Security", cdn: "DDoS Protection included", direct: "Requires separate firewall" },
    { name: "Scalability", cdn: "Instant (Global network)", direct: "Vertical scaling limits" },
];

const FLOW_STEPS = [
    { text: "User requests 'image.png'", target: 'user', action: 'req' },
    { text: "Request routed to nearest Edge Server", target: 'edge', action: 'route' },
    { text: "Edge checks cache...", target: 'edge', action: 'check' },
    { text: "Cache MISS! Requesting from Origin...", target: 'origin', action: 'fetch_origin', isMiss: true },
    { text: "Origin returns data to Edge", target: 'edge', action: 'return_origin', isMiss: true },
    { text: "Edge caches data for next time", target: 'edge', action: 'cache' },
    { text: "Edge serves content to User", target: 'user', action: 'serve' }
];

const FLOW_STEPS_HIT = [
    { text: "User requests 'image.png'", target: 'user', action: 'req' },
    { text: "Request routed to nearest Edge Server", target: 'edge', action: 'route' },
    { text: "Edge checks cache...", target: 'edge', action: 'check' },
    { text: "Cache HIT! Content found.", target: 'edge', action: 'hit' },
    { text: "Edge serves content to User immediately", target: 'user', action: 'serve' }
];

// ════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════

export function CdnGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [isCached, setIsCached] = useState(false);
    const [stepIndex, setStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation Refs
    const timerRef = useRef<NodeJS.Timeout[]>([]);

    const playSimulation = useCallback(() => {
        // Reset
        setIsPlaying(true);
        setStepIndex(-1);
        timerRef.current.forEach(clearTimeout);
        timerRef.current = [];

        const steps = isCached ? FLOW_STEPS_HIT : FLOW_STEPS;
        const stepTime = 1500 * animationSpeed;

        steps.forEach((_, index) => {
            const t = setTimeout(() => {
                setStepIndex(index);
                if (index === steps.length - 1) {
                    setIsPlaying(false);
                    if (!isCached) setIsCached(true); // Cache it for next time
                }
            }, index * stepTime);
            timerRef.current.push(t);
        });
    }, [isCached, animationSpeed]);

    useEffect(() => {
        return () => timerRef.current.forEach(clearTimeout);
    }, []);

    const handleReset = () => {
        timerRef.current.forEach(clearTimeout);
        setIsCached(false);
        setStepIndex(-1);
        setIsPlaying(false);
    };

    const currentSteps = isCached ? FLOW_STEPS_HIT : FLOW_STEPS;
    const currentStep = stepIndex >= 0 ? currentSteps[stepIndex] : null;

    return (
        <GuideLayout
            githubPath="src/components/guides/infrastructure/CdnGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={playSimulation}
            contributors={guide.contributors}
        >
            {/* HERO & CONCEPTS */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="cdn-grid">
                {CONCEPTS.map(c => (
                    <div key={c.title} className="cdn-card">
                        <div className="cdn-card-header">
                            <div className="cdn-card-icon">{c.icon}</div>
                            <div className="cdn-card-title">{c.title}</div>
                        </div>
                        <div className="cdn-card-desc">{c.desc}</div>
                    </div>
                ))}
            </div>

            {/* INTERACTIVE VISUALIZATION */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Simulation: Cache Check</h2>
                <p className="viz-section-hint">See the difference between a Cache Miss vs Cache Hit</p>
            </div>

            <div className="cdn-viz-container">
                <div className="cdn-map-bg"></div>

                <div className="cdn-controls">
                    <button
                        className="cdn-btn primary"
                        onClick={playSimulation}
                        disabled={isPlaying}
                    >
                        {isPlaying ? 'Playing...' : '▶ Play Request'}
                    </button>
                    <button className="cdn-btn" onClick={handleReset}>
                        <RotateCcw size={14} /> Reset / Clear Cache
                    </button>
                    <button
                        className="social-btn"
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
                    >
                        <Settings size={14} />
                    </button>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '200px' }}>

                    {/* NODES */}
                    <div className={`cdn-node node-user ${stepIndex >= 0 ? 'active' : ''}`}>
                        <div className="cdn-node-icon"><User size={24} color="var(--text-hi)" /></div>
                        <div className="cdn-node-label">User</div>
                    </div>

                    <div className={`cdn-node node-edge ${currentStep?.target === 'edge' ? 'active' : ''} ${isCached ? 'has-cache' : 'miss-cache'}`}>
                        <div className="cache-status">{isCached ? 'HIT' : 'MISS'}</div>
                        <div className="cdn-node-icon"><CloneIcon /></div>
                        <div className="cdn-node-label">CDN Edge</div>
                    </div>

                    <div className={`cdn-node node-origin ${currentStep?.target === 'origin' ? 'active' : ''}`}>
                        <div className="cdn-node-icon"><Database size={24} color="var(--purple)" /></div>
                        <div className="cdn-node-label">Origin</div>
                    </div>

                    {/* PATHS */}
                    <div className="cdn-path path-short"></div>
                    <div className="cdn-path path-long"></div>

                    {/* PACKETS */}
                    {/* User -> Edge */}
                    <div
                        className="cdn-packet"
                        style={{
                            left: 'calc(10% + 60px)',
                            opacity: (currentStep?.action === 'req' || currentStep?.action === 'serve') ? 1 : 0,
                            transition: `left ${1.5 * animationSpeed}s ease-in-out`,
                        }}
                    ></div>

                </div>

                <div className="viz-step-display">
                    {stepIndex >= 0 ? (currentSteps[stepIndex]?.text || "Request Complete") : "Ready to start..."}
                </div>
            </div>

            {/* MERMAID ARCHITECTURE */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Architecture Flow</h2>
                <p className="viz-section-hint">How a CDN sits between users and your server</p>
            </div>

            <div className="viz-mermaid-wrap">
                <div className="mermaid">
                    {`sequenceDiagram
    participant User
    participant Edge as CDN Edge
    participant Origin as Origin Server
    
    User->>Edge: Request Content
    alt Cache Miss
        Edge->>Origin: Fetch Content
        Origin-->>Edge: Return Data
        Edge->>Edge: Cache Data
    else Cache Hit
        Edge->>Edge: Retrieve from Cache
    end
    Edge-->>User: Return Content`}
                </div>
            </div>

            {/* COMPARISON TABLE */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">CDN vs Direct Origin</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th style={{ width: '20%' }}>Feature</th>
                            <th style={{ width: '40%', color: 'var(--cyan)' }}>With CDN</th>
                            <th style={{ width: '40%', color: 'var(--text-dim)' }}>Direct Origin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ fontWeight: 600 }}>{row.name}</td>
                                <td style={{ color: 'var(--text-hi)' }}>{row.cdn}</td>
                                <td style={{ color: 'var(--text-dim)' }}>{row.direct}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </GuideLayout>
    );
}

function CloneIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
    )
}

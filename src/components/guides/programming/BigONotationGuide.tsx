"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Globe, BookOpen, ExternalLink, Play, RotateCcw } from 'lucide-react';
import { guidesData } from "@/data/guides";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/programming/big-o-notation.css';

const guide = guidesData.guides.find(v => v.id === "big-onotation")!;

const RESOURCES = [
    { title: "Big O Cheat Sheet", type: "web", url: "https://www.bigocheatsheet.com/" },
    { title: "Introduction to Big O Notation and Time Complexity", type: "youtube", url: "https://www.youtube.com/watch?v=D6xkbGLQesk" },
    { title: "Time and Space Complexity", type: "web", url: "https://www.hackerearth.com/practice/basic-programming/complexity-analysis/time-and-space-complexity/tutorial/" },
];

type AlgorithmMode = 'O(1)' | 'O(n)' | 'O(n^2)';

const INITIAL_ARRAY_O_1 = [42, 17, 8, 99, 23, 11, 5, 88];
const INITIAL_ARRAY_O_N = [12, 34, 56, 78, 90, 23, 45, 99]; // Searching for 99
const INITIAL_ARRAY_O_N2 = [8, 7, 6, 5, 4, 3, 2, 1]; // Worst case for bubble sort

export function BigONotationGuide() {
    const [mode, setMode] = useState<AlgorithmMode>('O(1)');
    const [array, setArray] = useState<number[]>(INITIAL_ARRAY_O_1);

    // Animation state
    const [isPlaying, setIsPlaying] = useState(false);
    const [operations, setOperations] = useState(0);
    const [activeIndices, setActiveIndices] = useState<number[]>([]);
    const [sortedIndices, setSortedIndices] = useState<number[]>([]);

    // Refs for timeout cleanup
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        resetVisualization(mode);
        return () => clearTimeouts();
    }, [mode]);

    const clearTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const resetVisualization = (newMode: AlgorithmMode) => {
        clearTimeouts();
        setIsPlaying(false);
        setOperations(0);
        setActiveIndices([]);
        setSortedIndices([]);

        if (newMode === 'O(1)') setArray([...INITIAL_ARRAY_O_1]);
        else if (newMode === 'O(n)') setArray([...INITIAL_ARRAY_O_N]);
        else if (newMode === 'O(n^2)') setArray([...INITIAL_ARRAY_O_N2]);
    };

    const playVisualization = () => {
        if (isPlaying) return;
        resetVisualization(mode);
        setIsPlaying(true);

        const BASE_SPEED = 400;

        if (mode === 'O(1)') {
            // O(1): Access array[0]
            timeoutsRef.current.push(setTimeout(() => {
                setActiveIndices([0]);
                setOperations(1);
            }, BASE_SPEED));

            timeoutsRef.current.push(setTimeout(() => {
                setIsPlaying(false);
            }, BASE_SPEED * 3));
        }
        else if (mode === 'O(n)') {
            // O(n): Linear search for the last element
            let step = 0;
            const targetIndex = array.length - 1;

            for (let i = 0; i <= targetIndex; i++) {
                timeoutsRef.current.push(setTimeout(() => {
                    setActiveIndices([i]);
                    setOperations(i + 1);
                }, BASE_SPEED * step));
                step++;
            }

            timeoutsRef.current.push(setTimeout(() => {
                setSortedIndices([targetIndex]); // Highlight found element
                setIsPlaying(false);
            }, BASE_SPEED * step));
        }
        else if (mode === 'O(n^2)') {
            // O(n^2): Bubble Sort (worst case)
            let step = 0;
            let currentArray = [...INITIAL_ARRAY_O_N2];
            let n = currentArray.length;
            let ops = 0;

            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    timeoutsRef.current.push(setTimeout(() => {
                        setActiveIndices([j, j + 1]);
                        setOperations(prev => prev + 1);
                    }, BASE_SPEED * step));
                    step++;

                    if (currentArray[j] > currentArray[j + 1]) {
                        // Swap
                        let temp = currentArray[j];
                        currentArray[j] = currentArray[j + 1];
                        currentArray[j + 1] = temp;

                        const stateCopy = [...currentArray];
                        timeoutsRef.current.push(setTimeout(() => {
                            setArray(stateCopy);
                        }, BASE_SPEED * step));
                        // Increase step just a little for swap visual
                        step += 0.5;
                    }
                }

                // Mark the end as sorted
                const sortedIdx = n - i - 1;
                timeoutsRef.current.push(setTimeout(() => {
                    setSortedIndices(prev => [...prev, sortedIdx]);
                }, BASE_SPEED * step));
            }

            // Mark the first element as sorted at the end
            timeoutsRef.current.push(setTimeout(() => {
                setSortedIndices(prev => [...prev, 0]);
                setActiveIndices([]);
                setIsPlaying(false);
            }, BASE_SPEED * step));
        }
    };

    const scrollToInteractive = () => {
        document.getElementById('interactive-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/programming/BigONotationGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPTS ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>

            <div className="viz-card-grid">
                <div className="viz-box viz-reveal card-cyan visible" onClick={scrollToInteractive} style={{ cursor: 'pointer' }}>
                    <span className="viz-label">Time Complexity</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-med)' }}>
                        Measures how the <strong>runtime</strong> of an algorithm increases as the size of the input (n) grows.
                    </p>
                </div>

                <div className="viz-box viz-reveal card-purple visible" onClick={scrollToInteractive} style={{ cursor: 'pointer' }}>
                    <span className="viz-label">Space Complexity</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-med)' }}>
                        Measures how much extra <strong>memory</strong> an algorithm requires as the input size (n) grows.
                    </p>
                </div>

                <div className="viz-box viz-reveal card-pink visible" onClick={scrollToInteractive} style={{ cursor: 'pointer' }}>
                    <span className="viz-label">Big O (Worst-Case)</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-med)' }}>
                        The upper bound of complexity. It answers: <em>"In the worst scenario, how bad can it get?"</em>
                    </p>
                </div>

                <div className="viz-box viz-reveal card-green visible" onClick={scrollToInteractive} style={{ cursor: 'pointer' }}>
                    <span className="viz-label">Big Omega & Theta</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-med)' }}>
                        <strong>Ω (Omega):</strong> Best-case scenario (lower bound).<br />
                        <strong>Θ (Theta):</strong> Exact/average bound.
                    </p>
                </div>
            </div>

            {/* ═══════════════ MERMAID HIERARCHY ═══════════════ */}
            <h2 className="section-title">Complexity Hierarchy</h2>
            <div className="big-o-mermaid-wrap">
                <pre className="mermaid">
                    {`flowchart TD
    %% Define styles
    classDef excellent fill:#0d1117,stroke:#69f0ae,color:#fff,stroke-width:2px;
    classDef good fill:#12161f,stroke:#1de9b6,color:#fff,stroke-width:2px;
    classDef fair fill:#1a1f2b,stroke:#ffab00,color:#fff,stroke-width:2px;
    classDef bad fill:#12161f,stroke:#ff6e40,color:#fff,stroke-width:2px;
    classDef terrible fill:#0d1117,stroke:#ff5252,color:#fff,stroke-width:2px;

    Start(["Input Size (n) Increases"])

    O1["O(1)\nConstant Time"]:::excellent
    OlogN["O(log n)\nLogarithmic Time"]:::good
    ON["O(n)\nLinear Time"]:::fair
    ONlogN["O(n log n)\nLinearithmic"]:::fair
    ON2["O(n²)\nQuadratic Time"]:::bad
    O2N["O(2ⁿ)\nExponential"]:::terrible
    OFact["O(n!)\nFactorial"]:::terrible

    Start -->|"Unchanged"| O1
    Start -->|"Grows slowly"| OlogN
    Start -->|"Grows proportionally"| ON
    ON --> ONlogN
    Start -->|"Grows rapidly"| ON2
    Start -->|"Explodes"| O2N
    O2N --> OFact`}
                </pre>
            </div>

            {/* ═══════════════ INTERACTIVE VISUALIZATION ═══════════════ */}
            <h2 id="interactive-section" className="section-title" style={{ marginTop: '4rem' }}>Interactive Sandbox (Worst Case)</h2>

            <div className="big-o-tabs">
                <button
                    className={`big-o-tab-btn ${mode === 'O(1)' ? 'active' : ''}`}
                    onClick={() => setMode('O(1)')}
                >
                    O(1) Array Access
                </button>
                <button
                    className={`big-o-tab-btn ${mode === 'O(n)' ? 'active' : ''}`}
                    onClick={() => setMode('O(n)')}
                >
                    O(n) Linear Search
                </button>
                <button
                    className={`big-o-tab-btn ${mode === 'O(n^2)' ? 'active' : ''}`}
                    onClick={() => setMode('O(n^2)')}
                >
                    O(n²) Bubble Sort
                </button>
            </div>

            <div className="big-o-viz-area">
                <p className="big-o-desc">
                    {mode === 'O(1)' && "Accessing the first element. Array size doesn't matter, it always takes 1 operation."}
                    {mode === 'O(n)' && "Searching for '99' at the very end. We must check every element one by one."}
                    {mode === 'O(n^2)' && "Sorting a reverse-ordered array. We must compare and swap repeatedly for every element."}
                </p>

                <div className="big-o-array">
                    {array.map((val, idx) => {
                        let classNames = "big-o-cell";
                        if (sortedIndices.includes(idx)) {
                            classNames += " sorted";
                        } else if (activeIndices.includes(idx)) {
                            classNames += (mode === 'O(n^2)') ? " active-pink" : " active-cyan";
                        }

                        return (
                            <div key={idx} className={classNames}>
                                {val}
                            </div>
                        );
                    })}
                </div>

                <div className="big-o-stats">
                    <div className="big-o-stat">
                        <span className="big-o-stat-label">Input Size (n)</span>
                        <span className="big-o-stat-value">{array.length}</span>
                    </div>
                    <div className="big-o-stat">
                        <span className="big-o-stat-label">Operations</span>
                        <span className="big-o-stat-value">{operations}</span>
                    </div>
                </div>

                <div className="big-o-controls">
                    <button
                        className="big-o-control-btn primary"
                        onClick={playVisualization}
                        disabled={isPlaying}
                    >
                        <Play size={18} /> Play Worst Case
                    </button>
                    <button
                        className="big-o-control-btn"
                        onClick={() => resetVisualization(mode)}
                        disabled={isPlaying && operations === 0}
                    >
                        <RotateCcw size={18} /> Reset
                    </button>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '4rem' }}>Common Complexities Summary</h2>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Data Structure / Algorithm</th>
                            <th>Time: Best Case</th>
                            <th>Time: Worst Case</th>
                            <th>Space (Worst Case)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Array Access</td>
                            <td style={{ color: 'var(--green)' }}>O(1)</td>
                            <td style={{ color: 'var(--green)' }}>O(1)</td>
                            <td>O(n)</td>
                        </tr>
                        <tr>
                            <td>Search (Unsorted Array)</td>
                            <td style={{ color: 'var(--green)' }}>O(1)</td>
                            <td style={{ color: 'var(--orange)' }}>O(n)</td>
                            <td>O(1)</td>
                        </tr>
                        <tr>
                            <td>Binary Search (Sorted Array)</td>
                            <td style={{ color: 'var(--green)' }}>O(1)</td>
                            <td style={{ color: 'var(--cyan)' }}>O(log n)</td>
                            <td>O(1)</td>
                        </tr>
                        <tr>
                            <td>Merge Sort</td>
                            <td style={{ color: 'var(--cyan)' }}>O(n log n)</td>
                            <td style={{ color: 'var(--cyan)' }}>O(n log n)</td>
                            <td style={{ color: 'var(--orange)' }}>O(n)</td>
                        </tr>
                        <tr>
                            <td>Bubble Sort</td>
                            <td style={{ color: 'var(--orange)' }}>O(n)</td>
                            <td style={{ color: 'var(--pink)' }}>O(n²)</td>
                            <td style={{ color: 'var(--green)' }}>O(1)</td>
                        </tr>
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

function ResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'course': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Globe, BookOpen, ExternalLink, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { guidesData } from "@/data/guides";
import { GuideLayout } from '@/components/layout/GuideLayout';
import { useSettings } from "@/context/SettingsContext";
import '@/styles/guides/programming/big-o-notation.css';

const guide = guidesData.guides.find(v => v.id === "big-onotation")!;

const RESOURCES = [
    { title: "Big O Cheat Sheet", type: "web", url: "https://www.bigocheatsheet.com/" },
    { title: "Introduction to Big O Notation and Time Complexity", type: "youtube", url: "https://www.youtube.com/watch?v=D6xkbGLQesk" },
    { title: "Time and Space Complexity", type: "web", url: "https://www.hackerearth.com/practice/basic-programming/complexity-analysis/time-and-space-complexity/tutorial/" },
];

type AlgorithmMode = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n^2)' | 'O(2^n)' | 'O(n!)';

const INITIAL_ARRAY_O_1 = [42, 17, 8, 99, 23, 11, 5, 88];
const INITIAL_ARRAY_O_LOG_N = [11, 22, 33, 44, 55, 66, 77, 88]; // Target: 88
const INITIAL_ARRAY_O_N = [12, 34, 56, 78, 90, 23, 45, 99]; // Searching for 99
const INITIAL_ARRAY_O_N_LOG_N = [8, 4, 6, 2, 7, 3, 5, 1]; // Merge sort
const INITIAL_ARRAY_O_N2 = [8, 7, 6, 5, 4, 3, 2, 1]; // Worst case for bubble sort
const INITIAL_ARRAY_O_2N = [1, 2, 3, 4]; // Subsets (2^4 = 16)
const INITIAL_ARRAY_O_N_FACT = [1, 2, 3, 4]; // Permutations (4! = 24)

export function BigONotationGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
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
        else if (newMode === 'O(log n)') setArray([...INITIAL_ARRAY_O_LOG_N]);
        else if (newMode === 'O(n)') setArray([...INITIAL_ARRAY_O_N]);
        else if (newMode === 'O(n log n)') setArray([...INITIAL_ARRAY_O_N_LOG_N]);
        else if (newMode === 'O(n^2)') setArray([...INITIAL_ARRAY_O_N2]);
        else if (newMode === 'O(2^n)') setArray([...INITIAL_ARRAY_O_2N]);
        else if (newMode === 'O(n!)') setArray([...INITIAL_ARRAY_O_N_FACT]);
    };

    const playVisualization = () => {
        if (isPlaying) return;
        resetVisualization(mode);
        setIsPlaying(true);

        const BASE_SPEED = 400 * animationSpeed;

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
        else if (mode === 'O(log n)') {
            let step = 0;
            let left = 0;
            let right = INITIAL_ARRAY_O_LOG_N.length - 1;
            let target = 88;

            const searchStep = (l: number, r: number) => {
                if (l > r) {
                    timeoutsRef.current.push(setTimeout(() => {
                        setIsPlaying(false);
                    }, BASE_SPEED * step));
                    return;
                }

                const mid = Math.floor((l + r) / 2);

                timeoutsRef.current.push(setTimeout(() => {
                    setActiveIndices([mid]);
                    setOperations(prev => prev + 1);
                }, BASE_SPEED * step));
                step += 1.5;

                if (INITIAL_ARRAY_O_LOG_N[mid] === target) {
                    timeoutsRef.current.push(setTimeout(() => {
                        setSortedIndices([mid]);
                        setIsPlaying(false);
                    }, BASE_SPEED * step));
                } else if (INITIAL_ARRAY_O_LOG_N[mid] < target) {
                    searchStep(mid + 1, r);
                } else {
                    searchStep(l, mid - 1);
                }
            };

            searchStep(left, right);
        }
        else if (mode === 'O(n log n)') {
            let step = 0;
            let currentArray = [...INITIAL_ARRAY_O_N_LOG_N];

            // Simplified visual representation of merge sort splitting
            const chunks = [
                [0, 1, 2, 3, 4, 5, 6, 7], // 8
                [0, 1, 2, 3], [4, 5, 6, 7], // 4 4
                [0, 1], [2, 3], [4, 5], [6, 7], // 2 2 2 2
                [0], [1], [2], [3], [4], [5], [6], [7] // 1 1 1 1 1 1 1 1
            ];

            chunks.forEach((chunk) => {
                timeoutsRef.current.push(setTimeout(() => {
                    setActiveIndices(chunk);
                    setOperations(prev => prev + 1);
                }, BASE_SPEED * step));
                step += 0.8;
            });

            // Merging visually (sorting the whole array)
            timeoutsRef.current.push(setTimeout(() => {
                setArray([...INITIAL_ARRAY_O_N_LOG_N].sort((a, b) => a - b));
                setActiveIndices([]);
                setSortedIndices([0, 1, 2, 3, 4, 5, 6, 7]);
            }, BASE_SPEED * step));

            timeoutsRef.current.push(setTimeout(() => {
                setIsPlaying(false);
            }, BASE_SPEED * step + BASE_SPEED));
        }
        else if (mode === 'O(2^n)') {
            // Visualize subset generation (2^4 = 16)
            let step = 0;
            const n = INITIAL_ARRAY_O_2N.length;
            const totalSubsets = Math.pow(2, n);

            for (let i = 0; i < totalSubsets; i++) {
                const subsetIndices: number[] = [];
                for (let j = 0; j < n; j++) {
                    // Check if j-th bit is set
                    if ((i & (1 << j)) !== 0) {
                        subsetIndices.push(j);
                    }
                }

                timeoutsRef.current.push(setTimeout(() => {
                    setActiveIndices(subsetIndices);
                    setOperations(i + 1);
                }, (BASE_SPEED * 0.5) * step));
                step++;
            }

            timeoutsRef.current.push(setTimeout(() => {
                setActiveIndices([]);
                setIsPlaying(false);
            }, (BASE_SPEED * 0.5) * step));
        }
        else if (mode === 'O(n!)') {
            // Visualize permutations visually (4! = 24)
            let step = 0;
            const seq = [0, 1, 2, 3];
            let count = 0;

            // Simple Heap's algorithm for visual generation
            const generate = (k: number, arr: number[]) => {
                if (k === 1) {
                    const currentPerm = [...arr];
                    timeoutsRef.current.push(setTimeout(() => {
                        setActiveIndices(currentPerm); // Highlight all to signify a generated path
                        setOperations(prev => prev + 1);
                    }, (BASE_SPEED * 0.3) * step));
                    step++;
                    count++;
                    return;
                }

                for (let i = 0; i < k; i++) {
                    generate(k - 1, arr);
                    let temp;
                    if (k % 2 === 0) {
                        temp = arr[i];
                        arr[i] = arr[k - 1];
                        arr[k - 1] = temp;
                    } else {
                        temp = arr[0];
                        arr[0] = arr[k - 1];
                        arr[k - 1] = temp;
                    }
                }
            };

            generate(seq.length, [...seq]);

            timeoutsRef.current.push(setTimeout(() => {
                setActiveIndices([]);
                setIsPlaying(false);
            }, (BASE_SPEED * 0.3) * step));
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="viz-flow-controls" style={{ marginBottom: 0 }}>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as AlgorithmMode)}
                        aria-label="Select Time Complexity"
                        style={{
                            background: 'var(--surface)',
                            color: 'var(--text-hi)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            outline: 'none',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                        }}
                        className="hover:border-var-cyan focus:border-var-cyan transition-colors"
                    >
                        <option value="O(1)">O(1) Array Access</option>
                        <option value="O(log n)">O(log n) Binary Search</option>
                        <option value="O(n)">O(n) Linear Search</option>
                        <option value="O(n log n)">O(n log n) Merge Sort</option>
                        <option value="O(n^2)">O(n²) Bubble Sort</option>
                        <option value="O(2^n)">O(2ⁿ) Subsets</option>
                        <option value="O(n!)">O(n!) Permutations</option>
                    </select>
                </div>

                <div className="viz-playback-controls">
                    <button
                        onClick={isPlaying ? () => { clearTimeouts(); setIsPlaying(false); } : playVisualization}
                        className="viz-ctrl-btn"
                        aria-label={isPlaying ? "Pause Animation" : "Play Animation"}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={() => resetVisualization(mode)}
                        className="viz-ctrl-btn"
                        aria-label="Replay Animation"
                        disabled={isPlaying && operations === 0}
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

            <div className="big-o-viz-area">
                <p className="big-o-desc">
                    {mode === 'O(1)' && "Accessing the first element. Array size doesn't matter, it always takes 1 operation."}
                    {mode === 'O(log n)' && "Finding '88' in a sorted array by repeatedly halving the search space."}
                    {mode === 'O(n)' && "Searching for '99' at the very end. We must check every element one by one."}
                    {mode === 'O(n log n)' && "Splitting an array down to single elements, then merging them back in order."}
                    {mode === 'O(n^2)' && "Sorting a reverse-ordered array. We must compare and swap repeatedly for every element."}
                    {mode === 'O(2^n)' && "Generating all possible subsets of an array of 4 elements. Total sets: 2⁴ = 16."}
                    {mode === 'O(n!)' && "Generating every possible ordering (permutations) of 4 elements. Total orders: 4! = 24."}
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

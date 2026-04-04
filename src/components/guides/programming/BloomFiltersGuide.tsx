"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, Globe, ExternalLink, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { guidesData } from '@/data/guides';
import { GuideLayout } from '@/components/layout/GuideLayout';
import { useSettings } from '@/context/SettingsContext';
import '@/styles/guides/programming/bloom-filters.css';

const guide = guidesData.guides.find(v => v.id === 'bloom-filters')!;

// ════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════

const BIT_ARRAY_SIZE = 16;

// Pre-computed hash positions for each element (simulating 3 hash functions)
const HASH_POSITIONS: Record<string, [number, number, number]> = {
    apple:  [2, 7, 11],
    banana: [4, 7, 13],
    cherry: [1, 5, 9],   // not inserted → definitely absent
    grape:  [2, 4, 13],  // not inserted → false positive (all set by apple/banana)
};

// Bits set after inserting apple + banana
const FULL_SET_BITS = [2, 4, 7, 11, 13];

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

type TabKey = 'insert-apple' | 'insert-banana' | 'lookup-apple' | 'lookup-cherry' | 'false-positive';
type ResultKind = 'present' | 'absent' | 'false-positive' | null;

type AnimStep = {
    text: string;
    committedBits: number[];
    activeBits: number[];
    checkingBits: number[];
    missBits: number[];
    activeHashes: number[];   // 0 = h1, 1 = h2, 2 = h3
    result: ResultKind;
};

// ════════════════════════════════════════
// ANIMATION STEPS
// ════════════════════════════════════════

const TABS: Record<TabKey, { label: string; steps: AnimStep[] }> = {
    'insert-apple': {
        label: 'Insert "apple"',
        steps: [
            { text: 'Starting with an empty 16-bit array. All bits are 0.', committedBits: [], activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
            { text: 'h₁("apple") → position 2. Setting bit 2 to 1.', committedBits: [], activeBits: [2], checkingBits: [], missBits: [], activeHashes: [0], result: null },
            { text: 'h₂("apple") → position 7. Setting bit 7 to 1.', committedBits: [2], activeBits: [7], checkingBits: [], missBits: [], activeHashes: [1], result: null },
            { text: 'h₃("apple") → position 11. Setting bit 11 to 1.', committedBits: [2, 7], activeBits: [11], checkingBits: [], missBits: [], activeHashes: [2], result: null },
            { text: '"apple" inserted! Bits 2, 7, 11 are now permanently set to 1.', committedBits: [2, 7, 11], activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
        ],
    },
    'insert-banana': {
        label: 'Insert "banana"',
        steps: [
            { text: 'Filter already contains "apple" (bits 2, 7, 11 are set). Now inserting "banana".', committedBits: [2, 7, 11], activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
            { text: 'h₁("banana") → position 4. Setting bit 4 to 1.', committedBits: [2, 7, 11], activeBits: [4], checkingBits: [], missBits: [], activeHashes: [0], result: null },
            { text: 'h₂("banana") → position 7. Already set by "apple" — bit collisions are fine, no data is lost!', committedBits: [2, 4, 7, 11], activeBits: [7], checkingBits: [], missBits: [], activeHashes: [1], result: null },
            { text: 'h₃("banana") → position 13. Setting bit 13 to 1.', committedBits: [2, 4, 7, 11], activeBits: [13], checkingBits: [], missBits: [], activeHashes: [2], result: null },
            { text: '"banana" inserted! 5 unique bits are now set: [2, 4, 7, 11, 13].', committedBits: [2, 4, 7, 11, 13], activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
        ],
    },
    'lookup-apple': {
        label: 'Lookup "apple"',
        steps: [
            { text: 'Looking up "apple". We hash it with the same 3 functions and check each bit position.', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
            { text: 'h₁("apple") → position 2. Checking bit 2 → it is 1 ✓', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [2], missBits: [], activeHashes: [0], result: null },
            { text: 'h₂("apple") → position 7. Checking bit 7 → it is 1 ✓', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [2, 7], missBits: [], activeHashes: [1], result: null },
            { text: 'h₃("apple") → position 11. Checking bit 11 → it is 1 ✓', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [2, 7, 11], missBits: [], activeHashes: [2], result: null },
            { text: 'All 3 bits are set → "apple" is PROBABLY in the set. (It was — true positive!)', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: 'present' },
        ],
    },
    'lookup-cherry': {
        label: 'Lookup "cherry"',
        steps: [
            { text: 'Looking up "cherry" — it was never inserted. Hashing with 3 functions...', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
            { text: 'h₁("cherry") → position 1. Checking bit 1 → it is 0 ✗', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [1], activeHashes: [0], result: null },
            { text: 'Found a 0! No need to check further — a single zero guarantees absence.', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [1], activeHashes: [], result: null },
            { text: '"cherry" is DEFINITELY NOT in the set. Bloom Filters have zero false negatives!', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: 'absent' },
        ],
    },
    'false-positive': {
        label: 'False Positive',
        steps: [
            { text: 'Looking up "grape" — it was NEVER inserted. Watch what happens...', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: null },
            { text: 'h₁("grape") → position 2. Bit 2 is 1 ✓ — but this was set by "apple", not "grape"!', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [2], missBits: [], activeHashes: [0], result: null },
            { text: 'h₂("grape") → position 4. Bit 4 is 1 ✓ — set by "banana", not "grape"!', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [2, 4], missBits: [], activeHashes: [1], result: null },
            { text: 'h₃("grape") → position 13. Bit 13 is 1 ✓ — also set by "banana"!', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [2, 4, 13], missBits: [], activeHashes: [2], result: null },
            { text: 'All 3 bits are set — filter returns "probably present"… but "grape" was NEVER inserted! ⚠️ FALSE POSITIVE', committedBits: FULL_SET_BITS, activeBits: [], checkingBits: [], missBits: [], activeHashes: [], result: 'false-positive' },
        ],
    },
};

const RESOURCES = [
    { title: 'Bloom Filters by Example', type: 'web', url: 'https://llimllib.github.io/bloomfilter-tutorial/' },
    { title: 'Bloom Filters — Wikipedia', type: 'web', url: 'https://en.wikipedia.org/wiki/Bloom_filter' },
    { title: 'What Are Bloom Filters?', type: 'youtube', url: 'https://www.youtube.com/watch?v=-SuTGoFYjZs' },
    { title: 'Bloom Filters (CMU Database Systems)', type: 'youtube', url: 'https://www.youtube.com/watch?v=V3pzxngeLqw' },
    { title: 'Redis Bloom Filter Module', type: 'web', url: 'https://redis.io/docs/data-types/probabilistic/bloom-filter/' },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function BloomFiltersGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [activeTab, setActiveTab] = useState<TabKey>('insert-apple');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(true);

    const playTab = useCallback((tab: TabKey) => {
        setActiveTab(tab);
        setCurrentStepIdx(-1);
        setIsPlaying(true);
    }, []);

    // Progressive animation loop
    useEffect(() => {
        if (!isPlaying) return;
        const steps = TABS[activeTab].steps;
        const stepTime = 1800 * animationSpeed;

        if (currentStepIdx < steps.length - 1) {
            const delay = currentStepIdx === -1 ? 400 : stepTime;
            const t = setTimeout(() => setCurrentStepIdx(prev => prev + 1), delay);
            return () => clearTimeout(t);
        } else {
            setIsPlaying(false);
        }
    }, [currentStepIdx, isPlaying, activeTab, animationSpeed]);

    const currentStep = currentStepIdx >= 0 ? TABS[activeTab].steps[currentStepIdx] : TABS[activeTab].steps[0];

    const scrollToInteractive = () => {
        document.getElementById('bf-interactive')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Derive display state
    const displayBits = new Set([...currentStep.committedBits, ...currentStep.activeBits]);

    return (
        <GuideLayout
            githubPath="src/components/guides/programming/BloomFiltersGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            tags={guide.tags}
            primaryColor={guide.colorConfig.primary}
            contributors={guide.contributors}
        >
            {/* ═══════════════ CONCEPTS ═══════════════ */}
            <h2 className="section-title">Core Concepts</h2>
            <div className="guide-concept-grid">
                <div className="guide-concept-card" onClick={scrollToInteractive}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🔢</div>
                        <div className="guide-concept-name">Hash Functions</div>
                    </div>
                    <p className="guide-concept-desc">A Bloom Filter uses k independent hash functions. Each function maps any input element to a specific position in the bit array. More hash functions = fewer false positives, but more bits set per insert.</p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">k functions</span>
                        <span className="guide-concept-chip">Deterministic</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Why k &gt; 1?</strong> Multiple positions mean a random match for ALL positions is exponentially unlikely.</div>
                </div>

                <div className="guide-concept-card" onClick={scrollToInteractive}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🗂️</div>
                        <div className="guide-concept-name">Bit Array</div>
                    </div>
                    <p className="guide-concept-desc">The backing data structure is a compact array of m bits, all initialized to 0. Elements are never stored — only their hash positions are recorded. This is what makes Bloom Filters incredibly space-efficient.</p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">O(m) space</span>
                        <span className="guide-concept-chip">No element storage</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Space saving:</strong> A filter for 1 million URLs can fit in ~1.2 MB vs hundreds of MB for a hash set.</div>
                </div>

                <div className="guide-concept-card" onClick={() => { scrollToInteractive(); setTimeout(() => playTab('insert-apple'), 600); }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">➕</div>
                        <div className="guide-concept-name">Insert Operation</div>
                    </div>
                    <p className="guide-concept-desc">To insert an element, run it through all k hash functions. Each function returns an index in the bit array. Set every one of those bits to 1. The element itself is never stored.</p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">O(k) time</span>
                        <span className="guide-concept-chip">Irreversible</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Caveat:</strong> Deletions are not supported. Once a bit is set, you cannot safely unset it without risking false negatives.</div>
                </div>

                <div className="guide-concept-card" onClick={() => { scrollToInteractive(); setTimeout(() => playTab('lookup-apple'), 600); }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🔍</div>
                        <div className="guide-concept-name">Lookup Operation</div>
                    </div>
                    <p className="guide-concept-desc">To query if an element exists, hash it with all k functions and check each resulting bit. If any bit is 0 → definitely absent. If all are 1 → probably present (could be a false positive).</p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">O(k) time</span>
                        <span className="guide-concept-chip">Probabilistic</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Key insight:</strong> The lookup short-circuits on the first zero bit — early exit is guaranteed.</div>
                </div>

                <div className="guide-concept-card" onClick={() => { scrollToInteractive(); setTimeout(() => playTab('false-positive'), 600); }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">⚠️</div>
                        <div className="guide-concept-name">False Positives</div>
                    </div>
                    <p className="guide-concept-desc">A false positive occurs when all k bit positions for a queried element happen to be set by different previously-inserted elements. The filter says "probably present" for something never inserted.</p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Can happen</span>
                        <span className="guide-concept-chip">Rate: (1 - e^(-kn/m))^k</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Tunable:</strong> Increase m (more bits) or adjust k to reduce the false positive rate to an acceptable threshold.</div>
                </div>

                <div className="guide-concept-card" onClick={() => { scrollToInteractive(); setTimeout(() => playTab('lookup-cherry'), 600); }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">✅</div>
                        <div className="guide-concept-name">No False Negatives</div>
                    </div>
                    <p className="guide-concept-desc">A Bloom Filter NEVER produces a false negative. If an element was inserted, its hash positions are permanently set — the lookup will always find all bits set. "Definitely absent" is an ironclad guarantee.</p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Zero false negatives</span>
                        <span className="guide-concept-chip">Guaranteed</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Real-world use:</strong> Google Chrome's Safe Browsing — "this URL is safe" is never wrong.</div>
                </div>
            </div>

            {/* ═══════════════ MERMAID ═══════════════ */}
            <h2 className="section-title">How It Works</h2>
            <div className="bf-mermaid-wrap">
                <pre className="mermaid">
{`flowchart TD
    A(["Element (e.g. 'apple')"])
    H1["h₁(element) → index i₁"]
    H2["h₂(element) → index i₂"]
    H3["h₃(element) → index i₃"]
    BA["Bit Array \\n[0,0,0,...,0]"]
    INSERT["Set bits[i₁], bits[i₂], bits[i₃] = 1"]
    QUERY(["Lookup Query"])
    CHECK["Check bits[i₁] AND bits[i₂] AND bits[i₃]"]
    ALL1{"All bits = 1?"}
    ABSENT["DEFINITELY ABSENT\\n(zero false negatives)"]
    PRESENT["PROBABLY PRESENT\\n(false positive possible)"]

    A --> H1 & H2 & H3
    H1 & H2 & H3 --> BA
    BA --> INSERT

    QUERY --> H1 & H2 & H3
    H1 & H2 & H3 --> CHECK
    CHECK --> ALL1
    ALL1 -->|"No (any bit = 0)"| ABSENT
    ALL1 -->|"Yes"| PRESENT

    style A fill:#12161f,stroke:#c6ff00,color:#fff
    style H1 fill:#1a1f2b,stroke:#c6ff00,color:#c6ff00
    style H2 fill:#1a1f2b,stroke:#00e5ff,color:#00e5ff
    style H3 fill:#1a1f2b,stroke:#e040fb,color:#e040fb
    style BA fill:#0d1117,stroke:#c6ff00,color:#fff
    style INSERT fill:#12161f,stroke:#c6ff00,color:#c6ff00
    style QUERY fill:#12161f,stroke:#ffab00,color:#fff
    style CHECK fill:#1a1f2b,stroke:#ffab00,color:#ffab00
    style ALL1 fill:#0d1117,stroke:#aaa,color:#aaa
    style ABSENT fill:#12161f,stroke:#3effab,color:#3effab
    style PRESENT fill:#12161f,stroke:#c6ff00,color:#c6ff00`}
                </pre>
            </div>

            {/* ═══════════════ INTERACTIVE ═══════════════ */}
            <div className="viz-section-header" style={{ marginTop: '4rem' }}>
                <h2 id="bf-interactive" className="viz-section-title">Interactive Bit Array</h2>
                <p className="viz-section-hint">Step through insert and lookup operations on a 16-bit filter</p>
            </div>

            <div className="bf-flow-section">
                {/* Controls row */}
                <div className="bf-flow-controls-row">
                    <div className="bf-flow-controls">
                        {(Object.keys(TABS) as TabKey[]).map(key => (
                            <button
                                key={key}
                                className={`bf-flow-btn ${activeTab === key ? 'active' : ''}`}
                                onClick={() => playTab(key)}
                            >
                                {TABS[key].label}
                            </button>
                        ))}
                    </div>

                    {/* Playback controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                                background: isPlaying ? 'rgba(198, 255, 0, 0.1)' : 'transparent',
                                color: isPlaying ? '#c6ff00' : 'var(--text-dim)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
                            }}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={() => playTab(activeTab)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                            title="Replay"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <div style={{ width: '1px', height: '14px', background: 'var(--border2)', margin: '0 4px' }} />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                            title="Settings"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>

                {/* Visualization area */}
                <div className="bf-viz-area">
                    {/* Step description */}
                    <div className="bf-step-text">{currentStep.text}</div>

                    {/* Bit array */}
                    <div className="bf-bit-array-wrap">
                        <div className="bf-bit-indices">
                            {Array.from({ length: BIT_ARRAY_SIZE }, (_, i) => (
                                <div key={i} className="bf-bit-index">{i}</div>
                            ))}
                        </div>
                        <div className="bf-bit-row">
                            {Array.from({ length: BIT_ARRAY_SIZE }, (_, i) => {
                                const isSet = displayBits.has(i);
                                const isActive = currentStep.activeBits.includes(i);
                                const isChecking = currentStep.checkingBits.includes(i);
                                const isMiss = currentStep.missBits.includes(i);

                                let cellClass = 'bf-bit-cell';
                                if (isMiss)         cellClass += ' miss';
                                else if (isActive)  cellClass += ' active';
                                else if (isChecking) cellClass += ' checking';
                                else if (isSet)     cellClass += ' set';

                                return (
                                    <div key={i} className={cellClass}>
                                        {isSet || isActive || isMiss ? '1' : '0'}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hash function legend */}
                    <div className="bf-hash-legend">
                        {(['h₁', 'h₂', 'h₃'] as const).map((label, idx) => {
                            const dotClass = ['h1', 'h2', 'h3'][idx];
                            const positions = (() => {
                                const elem = activeTab === 'insert-apple' || activeTab === 'lookup-apple' ? 'apple'
                                    : activeTab === 'insert-banana' ? 'banana'
                                    : activeTab === 'lookup-cherry' ? 'cherry'
                                    : 'grape';
                                return HASH_POSITIONS[elem][idx];
                            })();
                            return (
                                <div key={label} className={`bf-hash-item ${currentStep.activeHashes.includes(idx) ? 'active' : ''}`}>
                                    <div className={`bf-hash-dot ${dotClass}`} />
                                    <span>{label} → pos {positions}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Result badge */}
                    {currentStep.result && (
                        <div className={`bf-result-badge ${currentStep.result}`}>
                            {currentStep.result === 'present' && '✓ Probably Present'}
                            {currentStep.result === 'absent' && '✓ Definitely Absent'}
                            {currentStep.result === 'false-positive' && '⚠️ False Positive'}
                        </div>
                    )}

                    {/* Filter state stats */}
                    <div className="bf-filter-info">
                        <div className="bf-filter-stat">
                            <span className="bf-filter-stat-value">{BIT_ARRAY_SIZE}</span>
                            <span className="bf-filter-stat-label">Bit Array Size (m)</span>
                        </div>
                        <div className="bf-filter-stat">
                            <span className="bf-filter-stat-value">3</span>
                            <span className="bf-filter-stat-label">Hash Functions (k)</span>
                        </div>
                        <div className="bf-filter-stat">
                            <span className="bf-filter-stat-value">{displayBits.size}</span>
                            <span className="bf-filter-stat-label">Bits Set</span>
                        </div>
                        <div className="bf-filter-stat">
                            <span className="bf-filter-stat-value">
                                {displayBits.size > 0
                                    ? `${((1 - Math.pow(1 - displayBits.size / BIT_ARRAY_SIZE, 3)) * 100).toFixed(1)}%`
                                    : '0%'}
                            </span>
                            <span className="bf-filter-stat-label">Est. FP Rate</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '4rem' }}>Bloom Filter vs Alternatives</h2>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Structure</th>
                            <th>Space</th>
                            <th>Lookup</th>
                            <th>False Positives</th>
                            <th>False Negatives</th>
                            <th>Deletions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ color: '#c6ff00', fontWeight: 600 }}>Bloom Filter</td>
                            <td style={{ color: 'var(--green)' }}>O(m) — very small</td>
                            <td style={{ color: 'var(--green)' }}>O(k) constant</td>
                            <td style={{ color: 'var(--orange)' }}>Possible (tunable)</td>
                            <td style={{ color: 'var(--green)' }}>Never</td>
                            <td style={{ color: 'var(--pink)' }}>Not supported</td>
                        </tr>
                        <tr>
                            <td>Hash Set</td>
                            <td style={{ color: 'var(--orange)' }}>O(n) — grows linearly</td>
                            <td style={{ color: 'var(--green)' }}>O(1) average</td>
                            <td style={{ color: 'var(--green)' }}>Never</td>
                            <td style={{ color: 'var(--green)' }}>Never</td>
                            <td style={{ color: 'var(--green)' }}>Supported</td>
                        </tr>
                        <tr>
                            <td>Sorted Array + Binary Search</td>
                            <td style={{ color: 'var(--orange)' }}>O(n)</td>
                            <td style={{ color: 'var(--cyan)' }}>O(log n)</td>
                            <td style={{ color: 'var(--green)' }}>Never</td>
                            <td style={{ color: 'var(--green)' }}>Never</td>
                            <td style={{ color: 'var(--orange)' }}>O(n) cost</td>
                        </tr>
                        <tr>
                            <td>Counting Bloom Filter</td>
                            <td style={{ color: 'var(--cyan)' }}>O(m × c) bits</td>
                            <td style={{ color: 'var(--green)' }}>O(k) constant</td>
                            <td style={{ color: 'var(--orange)' }}>Possible</td>
                            <td style={{ color: 'var(--green)' }}>Never</td>
                            <td style={{ color: 'var(--green)' }}>Supported</td>
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
                            <th style={{ width: '45%' }}>Title</th>
                            <th style={{ width: '15%' }}>Type</th>
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
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            color: 'var(--blue)', textDecoration: 'none', fontSize: '0.9rem'
                                        }}
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
        case 'web':     return <Globe size={18} color="#4A90E2" />;
        default:        return <ExternalLink size={18} />;
    }
}

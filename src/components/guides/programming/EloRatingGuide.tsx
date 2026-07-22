"use client";

import React, { useState, useEffect } from 'react';
import { Youtube, Globe, BookOpen, ExternalLink, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { guidesData } from "@/data/guides";
import { GuideLayout } from '@/components/layout/GuideLayout';
import { useSettings } from "@/context/SettingsContext";
import '@/styles/guides/programming/elo-rating.css';

const guide = guidesData.guides.find(v => v.id === "elo-rating")!;

const RESOURCES = [
    { title: "Elo Rating System (Wikipedia)", type: "web", url: "https://en.wikipedia.org/wiki/Elo_rating_system" },
    { title: "The Elo Rating System for Chess and Beyond", type: "youtube", url: "https://www.youtube.com/watch?v=AsYfbmp0To0" },
    { title: "The Chess Rating System Explained", type: "youtube", url: "https://www.youtube.com/watch?v=jZjCKi5qzUY" },
    { title: "Elo Rating Algorithm — GeeksforGeeks", type: "web", url: "https://www.geeksforgeeks.org/elo-rating-algorithm/" },
];

const expectedScore = (ra: number, rb: number) => 1 / (1 + Math.pow(10, (rb - ra) / 400));

type ScenarioKey = 'even' | 'favorite' | 'upset' | 'draw';

interface Scenario {
    label: string;
    a: { name: string; avatar: string; rating: number };
    b: { name: string; avatar: string; rating: number };
    sA: number; // actual score for player A: 1 win, 0.5 draw, 0 loss
    k: number;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
    even: {
        label: "Even Match",
        a: { name: "Alice", avatar: "🙋‍♀️", rating: 1500 },
        b: { name: "Bob", avatar: "🙎‍♂️", rating: 1500 },
        sA: 1,
        k: 32,
    },
    favorite: {
        label: "Favorite Wins",
        a: { name: "Magnus", avatar: "🧙", rating: 1800 },
        b: { name: "Dev", avatar: "🧑‍💻", rating: 1400 },
        sA: 1,
        k: 32,
    },
    upset: {
        label: "The Upset",
        a: { name: "Dev", avatar: "🧑‍💻", rating: 1400 },
        b: { name: "Magnus", avatar: "🧙", rating: 1800 },
        sA: 1,
        k: 32,
    },
    draw: {
        label: "A Draw",
        a: { name: "Kira", avatar: "👩‍🎓", rating: 1600 },
        b: { name: "Sam", avatar: "🧑‍🎤", rating: 1400 },
        sA: 0.5,
        k: 32,
    },
};

const STEP_COUNT = 5;

function scenarioMath(s: Scenario) {
    const eA = expectedScore(s.a.rating, s.b.rating);
    const eB = 1 - eA;
    const dA = s.k * (s.sA - eA);
    const dB = s.k * ((1 - s.sA) - eB);
    return { eA, eB, dA, dB };
}

function stepText(key: ScenarioKey, stepIdx: number): React.ReactNode {
    const s = SCENARIOS[key];
    const { eA, eB, dA } = scenarioMath(s);
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    const delta = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}`;

    switch (stepIdx) {
        case 0:
            return <>Two players sit down. <strong>{s.a.name} ({s.a.rating})</strong> faces <strong>{s.b.name} ({s.b.rating})</strong>. Their ratings are the only thing Elo needs to predict this game.</>;
        case 1:
            return <>Before a single move, Elo computes the <strong>expected score</strong>. With a rating gap of {Math.abs(s.a.rating - s.b.rating)}, {s.a.name} is expected to score <strong>{eA.toFixed(2)}</strong> ({pct(eA)}) and {s.b.name} <strong>{eB.toFixed(2)}</strong> ({pct(eB)}). These always add up to 1.</>;
        case 2:
            return <>They play. The rating system does not care <em>how</em> the game is won, only the final result: win = 1, draw = 0.5, loss = 0.</>;
        case 3:
            return s.sA === 0.5
                ? <>It ends in a <strong>draw</strong>. Both players score 0.5. But {s.a.name} was <em>expected</em> to score {eA.toFixed(2)}, so a draw is actually below expectation for {s.a.name}.</>
                : <><strong>{s.a.name} wins</strong> and scores 1. Elo expected {s.a.name} to score {eA.toFixed(2)}, so the surprise factor is {`1 − ${eA.toFixed(2)} = ${(1 - eA).toFixed(2)}`}.</>;
        case 4:
            return <>Update time: {`R' = R + K × (S − E)`} with <strong>K = {s.k}</strong>. {s.a.name} moves by {s.k} × ({s.sA} − {eA.toFixed(2)}) = <strong>{delta(dA)}</strong>, and {s.b.name} moves by exactly the opposite. <strong>Zero-sum:</strong> points gained equal points lost.</>;
        default:
            return null;
    }
}

export function EloRatingGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();

    // ─── Animated flow state ───
    const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('even');
    const [stepIdx, setStepIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // ─── Live calculator state ───
    const [calcRa, setCalcRa] = useState(1500);
    const [calcRb, setCalcRb] = useState(1700);
    const [calcK, setCalcK] = useState(32);
    const [calcResult, setCalcResult] = useState(1); // score for A: 1, 0.5, 0

    // Progressive animation loop (Rule 03): advance one step at a time
    useEffect(() => {
        if (!isPlaying) return;
        const t = setTimeout(() => {
            if (stepIdx >= STEP_COUNT - 1) setIsPlaying(false);
            else setStepIdx(i => i + 1);
        }, 1900 * animationSpeed);
        return () => clearTimeout(t);
    }, [isPlaying, stepIdx, animationSpeed]);

    const playPattern = (key: ScenarioKey) => {
        setScenarioKey(key);
        setStepIdx(0);
        setIsPlaying(true);
    };

    const scrollToInteractive = (key?: ScenarioKey) => {
        document.getElementById('elo-interactive')?.scrollIntoView({ behavior: 'smooth' });
        if (key) playPattern(key);
    };

    const scenario = SCENARIOS[scenarioKey];
    const { eA, eB, dA, dB } = scenarioMath(scenario);

    const showExpected = stepIdx >= 1;
    const isFighting = stepIdx === 2;
    const showOutcome = stepIdx >= 3;
    const showUpdate = stepIdx >= 4;

    const outcomeClass = (side: 'a' | 'b') => {
        if (!showOutcome) return '';
        if (scenario.sA === 0.5) return 'drawn';
        const aWon = scenario.sA === 1;
        const won = side === 'a' ? aWon : !aWon;
        return won ? 'winner' : 'loser';
    };

    const deltaClass = (d: number) => {
        if (Math.abs(d) < 0.05) return 'zero';
        return d > 0 ? 'gain' : 'loss';
    };

    const fmtDelta = (d: number) => `${d >= 0 ? '+' : ''}${d.toFixed(1)}`;

    // Calculator derived values
    const calcEa = expectedScore(calcRa, calcRb);
    const calcEb = 1 - calcEa;
    const calcDa = calcK * (calcResult - calcEa);
    const calcDb = calcK * ((1 - calcResult) - calcEb);

    return (
        <GuideLayout
            githubPath="src/components/guides/programming/EloRatingGuide.tsx"
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
                <div className="guide-concept-card" onClick={() => scrollToInteractive('even')} style={{ cursor: 'pointer' }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🎯</div>
                        <div className="guide-concept-name">The Rating Number</div>
                    </div>
                    <p className="guide-concept-desc">
                        A single number that estimates skill. New players start around 1000–1500 and the number moves after every game — up when you win, down when you lose.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Start ≈ 1500</span>
                        <span className="guide-concept-chip">One Number</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Use case:</strong> Chess titles — 2500+ is Grandmaster territory.</div>
                </div>

                <div className="guide-concept-card" onClick={() => scrollToInteractive('favorite')} style={{ cursor: 'pointer' }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">📈</div>
                        <div className="guide-concept-name">Expected Score</div>
                    </div>
                    <p className="guide-concept-desc">
                        Before the game, Elo predicts your result from the rating gap. Equal ratings mean 50/50. A 400-point gap means the stronger player should score about 91%.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">0 to 1</span>
                        <span className="guide-concept-chip">Logistic Curve</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Use case:</strong> Win probability shown before a ranked match.</div>
                </div>

                <div className="guide-concept-card" onClick={() => scrollToInteractive('even')} style={{ cursor: 'pointer' }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">⚖️</div>
                        <div className="guide-concept-name">K-Factor</div>
                    </div>
                    <p className="guide-concept-desc">
                        The volume knob for rating changes. A big K makes ratings jump fast (good for new players). A small K keeps established ratings stable.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">K = 40 New</span>
                        <span className="guide-concept-chip">K = 10 Elite</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Use case:</strong> FIDE uses K = 40 for juniors, K = 10 for 2400+ players.</div>
                </div>

                <div className="guide-concept-card" onClick={() => scrollToInteractive('draw')} style={{ cursor: 'pointer' }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🔄</div>
                        <div className="guide-concept-name">Zero-Sum Updates</div>
                    </div>
                    <p className="guide-concept-desc">
                        Whatever the winner gains, the loser loses. Rating points are never created or destroyed in a game — they just flow between players.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">+N / −N</span>
                        <span className="guide-concept-chip">Conserved</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Use case:</strong> Keeps the rating pool stable across millions of games.</div>
                </div>

                <div className="guide-concept-card" onClick={() => scrollToInteractive('upset')} style={{ cursor: 'pointer' }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">💥</div>
                        <div className="guide-concept-name">The Upset Bonus</div>
                    </div>
                    <p className="guide-concept-desc">
                        Beat someone 400 points above you and you gain a lot. Beat someone 400 points below you and you gain almost nothing. Surprise is what moves ratings.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Big Surprise</span>
                        <span className="guide-concept-chip">Big Reward</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Use case:</strong> Why farming weak opponents barely raises your rank.</div>
                </div>

                <div className="guide-concept-card" onClick={() => scrollToInteractive()} style={{ cursor: 'pointer' }}>
                    <div className="guide-concept-header">
                        <div className="guide-concept-icon">🌍</div>
                        <div className="guide-concept-name">Beyond Chess</div>
                    </div>
                    <p className="guide-concept-desc">
                        Arpad Elo built it for chess, but the same math powers online game matchmaking, football club rankings, and even &ldquo;which photo is better&rdquo; voting systems.
                    </p>
                    <div className="guide-concept-stats">
                        <span className="guide-concept-chip hi">Matchmaking</span>
                        <span className="guide-concept-chip">Rankings</span>
                    </div>
                    <div className="guide-concept-usecase"><strong>Use case:</strong> Pairing you against similar-skill players in ranked queues.</div>
                </div>
            </div>

            {/* ═══════════════ THE MATH ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '4rem' }}>The Math (Only Two Formulas)</h2>

            <div className="elo-math-grid">
                <div className="elo-math-card">
                    <div className="elo-math-title">📈 Step 1 — Expected Score</div>
                    <div className="elo-formula">
                        E<sub>A</sub> = 1 / (1 + 10<sup>(R<sub>B</sub> − R<sub>A</sub>) / 400</sup>)
                    </div>
                    <ul className="elo-legend">
                        <li><strong>E<sub>A</sub></strong> — how many points player A is expected to score (between 0 and 1).</li>
                        <li><strong>R<sub>A</sub>, R<sub>B</sub></strong> — the two players&rsquo; current ratings.</li>
                        <li><strong>400</strong> — the scale constant: a 400-point gap means the stronger player is expected to score about 10 times more.</li>
                        <li>E<sub>A</sub> + E<sub>B</sub> always equals exactly <strong>1</strong>.</li>
                    </ul>
                </div>

                <div className="elo-math-card">
                    <div className="elo-math-title">🔄 Step 2 — Rating Update</div>
                    <div className="elo-formula">
                        R&prime;<sub>A</sub> = R<sub>A</sub> + K × (S<sub>A</sub> − E<sub>A</sub>)
                    </div>
                    <ul className="elo-legend">
                        <li><strong>R&prime;<sub>A</sub></strong> — player A&rsquo;s new rating after the game.</li>
                        <li><strong>S<sub>A</sub></strong> — the actual result: win = 1, draw = 0.5, loss = 0.</li>
                        <li><strong>K</strong> — the K-factor: the maximum points a single game can move a rating.</li>
                        <li><strong>(S − E)</strong> — the surprise. Do exactly as expected and your rating barely moves.</li>
                    </ul>
                </div>

                <div className="elo-math-card">
                    <div className="elo-math-title">📏 What a Rating Gap Means</div>
                    <div className="viz-comparison-table-wrap" style={{ margin: 0 }}>
                        <table className="viz-table">
                            <thead>
                                <tr>
                                    <th>Rating Gap</th>
                                    <th>Stronger Player&rsquo;s Expected Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>0</td><td style={{ color: 'var(--text-hi)' }}>50%</td></tr>
                                <tr><td>100</td><td style={{ color: 'var(--text-hi)' }}>64%</td></tr>
                                <tr><td>200</td><td style={{ color: 'var(--text-hi)' }}>76%</td></tr>
                                <tr><td>400</td><td style={{ color: 'var(--orange)' }}>91%</td></tr>
                                <tr><td>800</td><td style={{ color: 'var(--pink)' }}>99%</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ═══════════════ MERMAID ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '4rem' }}>One Game, Start to Finish</h2>
            <div className="elo-mermaid-wrap">
                <pre className="mermaid">
                    {`flowchart TD
    A["Two players matched\nRatings: R_A and R_B"] --> B["Compute expected scores\nE_A = 1 / (1 + 10^((R_B - R_A)/400))"]
    B --> C{"Play the game"}
    C -->|"A wins\nS_A = 1"| D["Surprise = 1 - E_A"]
    C -->|"Draw\nS_A = 0.5"| E["Surprise = 0.5 - E_A"]
    C -->|"A loses\nS_A = 0"| F["Surprise = 0 - E_A"]
    D --> G["Update both ratings\nR' = R + K × (S - E)"]
    E --> G
    F --> G
    G --> H(["Ratings drift toward\ntrue skill over many games"])

    style A fill:#1a1f2b,stroke:#00e5ff,color:#fff
    style B fill:#12161f,stroke:#ffab00,color:#fff
    style C fill:#1a1f2b,stroke:#b985f4,color:#fff
    style D fill:#0d1117,stroke:#3effa3,color:#fff
    style E fill:#0d1117,stroke:#ffab00,color:#fff
    style F fill:#0d1117,stroke:#ff5252,color:#fff
    style G fill:#12161f,stroke:#ffab00,color:#fff
    style H fill:#0d1117,stroke:#3effa3,color:#aaa`}
                </pre>
            </div>

            {/* ═══════════════ ANIMATED FLOW ═══════════════ */}
            <h2 id="elo-interactive" className="section-title" style={{ marginTop: '4rem' }}>Watch a Rating Update Happen</h2>

            <div className="elo-flow-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {(Object.keys(SCENARIOS) as ScenarioKey[]).map(key => (
                            <button
                                key={key}
                                className={`elo-flow-btn ${scenarioKey === key ? 'active' : ''}`}
                                onClick={() => playPattern(key)}
                            >
                                {SCENARIOS[key].label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                                background: isPlaying ? 'rgba(255, 171, 0, 0.1)' : 'transparent',
                                color: isPlaying ? '#ffab00' : 'var(--text-dim)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
                            }}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={() => playPattern(scenarioKey)}
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

                <div className="elo-step-box">
                    {stepText(scenarioKey, stepIdx)}
                </div>

                <div className="elo-players">
                    <div className={`elo-player ${outcomeClass('a')}`}>
                        <div className="elo-player-avatar">{scenario.a.avatar}</div>
                        <div className="elo-player-name">{scenario.a.name}</div>
                        <div className="elo-player-rating">
                            {showUpdate ? Math.round(scenario.a.rating + dA) : scenario.a.rating}
                        </div>
                        <div className={`elo-player-delta ${deltaClass(dA)} ${showUpdate ? 'show' : ''}`}>
                            {fmtDelta(dA)}
                        </div>
                    </div>

                    <div className={`elo-vs ${isFighting ? 'fighting' : ''}`}>VS</div>

                    <div className={`elo-player ${outcomeClass('b')}`}>
                        <div className="elo-player-avatar">{scenario.b.avatar}</div>
                        <div className="elo-player-name">{scenario.b.name}</div>
                        <div className="elo-player-rating">
                            {showUpdate ? Math.round(scenario.b.rating + dB) : scenario.b.rating}
                        </div>
                        <div className={`elo-player-delta ${deltaClass(dB)} ${showUpdate ? 'show' : ''}`}>
                            {fmtDelta(dB)}
                        </div>
                    </div>
                </div>

                <div className={`elo-expected-wrap ${showExpected ? 'show' : ''}`}>
                    <div className="elo-expected-label">Expected Score</div>
                    <div className="elo-expected-bar">
                        <div className="elo-expected-a" style={{ width: `${Math.max(eA * 100, 12)}%` }}>
                            {scenario.a.name} {(eA * 100).toFixed(0)}%
                        </div>
                        <div className="elo-expected-b" style={{ width: `${Math.max(eB * 100, 12)}%` }}>
                            {scenario.b.name} {(eB * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>

                <div className="elo-flow-stats">
                    <span className="elo-flow-chip">K-Factor <strong>{scenario.k}</strong></span>
                    <span className="elo-flow-chip">E<sub>A</sub> <strong>{eA.toFixed(2)}</strong></span>
                    <span className="elo-flow-chip">E<sub>B</sub> <strong>{eB.toFixed(2)}</strong></span>
                    <span className="elo-flow-chip">Step <strong>{stepIdx + 1} / {STEP_COUNT}</strong></span>
                </div>
            </div>

            {/* ═══════════════ LIVE CALCULATOR ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '4rem' }}>Try It Yourself</h2>

            <div className="elo-flow-section">
                <div className="elo-flow-title">Elo Calculator</div>

                <div className="elo-calc-grid">
                    <div className="elo-calc-field">
                        <label className="elo-calc-label" htmlFor="elo-ra">
                            <span>Player A Rating</span>
                            <strong>{calcRa}</strong>
                        </label>
                        <input
                            id="elo-ra"
                            className="elo-calc-slider"
                            type="range"
                            min={800}
                            max={2400}
                            step={25}
                            value={calcRa}
                            onChange={(e) => setCalcRa(Number(e.target.value))}
                        />
                    </div>

                    <div className="elo-calc-field">
                        <label className="elo-calc-label" htmlFor="elo-rb">
                            <span>Player B Rating</span>
                            <strong>{calcRb}</strong>
                        </label>
                        <input
                            id="elo-rb"
                            className="elo-calc-slider"
                            type="range"
                            min={800}
                            max={2400}
                            step={25}
                            value={calcRb}
                            onChange={(e) => setCalcRb(Number(e.target.value))}
                        />
                    </div>

                    <div className="elo-calc-field">
                        <span className="elo-calc-label">K-Factor</span>
                        <div className="elo-seg-group">
                            {[16, 32, 64].map(k => (
                                <button
                                    key={k}
                                    className={`elo-seg-btn ${calcK === k ? 'active' : ''}`}
                                    onClick={() => setCalcK(k)}
                                >
                                    K = {k}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="elo-calc-field">
                        <span className="elo-calc-label">Result</span>
                        <div className="elo-seg-group">
                            <button className={`elo-seg-btn ${calcResult === 1 ? 'active' : ''}`} onClick={() => setCalcResult(1)}>A Wins</button>
                            <button className={`elo-seg-btn ${calcResult === 0.5 ? 'active' : ''}`} onClick={() => setCalcResult(0.5)}>Draw</button>
                            <button className={`elo-seg-btn ${calcResult === 0 ? 'active' : ''}`} onClick={() => setCalcResult(0)}>B Wins</button>
                        </div>
                    </div>
                </div>

                <div className="elo-calc-result">
                    <div className="elo-calc-stat">
                        <span className="elo-calc-stat-label">Expected A</span>
                        <span className="elo-calc-stat-value amber">{(calcEa * 100).toFixed(1)}%</span>
                    </div>
                    <div className="elo-calc-stat">
                        <span className="elo-calc-stat-label">Expected B</span>
                        <span className="elo-calc-stat-value amber">{(calcEb * 100).toFixed(1)}%</span>
                    </div>
                    <div className="elo-calc-stat">
                        <span className="elo-calc-stat-label">A Change</span>
                        <span className={`elo-calc-stat-value ${calcDa >= 0 ? 'gain' : 'loss'}`}>{fmtDelta(calcDa)}</span>
                    </div>
                    <div className="elo-calc-stat">
                        <span className="elo-calc-stat-label">B Change</span>
                        <span className={`elo-calc-stat-value ${calcDb >= 0 ? 'gain' : 'loss'}`}>{fmtDelta(calcDb)}</span>
                    </div>
                    <div className="elo-calc-stat">
                        <span className="elo-calc-stat-label">A New Rating</span>
                        <span className="elo-calc-stat-value">{Math.round(calcRa + calcDa)}</span>
                    </div>
                    <div className="elo-calc-stat">
                        <span className="elo-calc-stat-label">B New Rating</span>
                        <span className="elo-calc-stat-value">{Math.round(calcRb + calcDb)}</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <h2 className="section-title" style={{ marginTop: '4rem' }}>Elo vs Modern Rating Systems</h2>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>System</th>
                            <th>Simplicity</th>
                            <th>Uncertainty Tracking</th>
                            <th>Team Games</th>
                            <th>Adoption</th>
                            <th>Known For</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>Elo</td>
                            <td><Rating dots={5} /></td>
                            <td><Rating dots={1} /></td>
                            <td><Rating dots={1} /></td>
                            <td><Rating dots={5} /></td>
                            <td>Chess, the original — two formulas, one number</td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>Glicko-2</td>
                            <td><Rating dots={3} /></td>
                            <td><Rating dots={5} /></td>
                            <td><Rating dots={1} /></td>
                            <td><Rating dots={4} /></td>
                            <td>Lichess — adds a &ldquo;how sure are we&rdquo; deviation value</td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>TrueSkill</td>
                            <td><Rating dots={2} /></td>
                            <td><Rating dots={5} /></td>
                            <td><Rating dots={5} /></td>
                            <td><Rating dots={3} /></td>
                            <td>Xbox Live — Bayesian, built for team matchmaking</td>
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

function Rating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="elo-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`elo-dot ${i <= dots ? 'on' : ''}`} />
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

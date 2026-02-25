"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import guidesData from "@/data/guides";
import { useSettings } from "@/context/SettingsContext";
import { Settings, Youtube, Globe, BookOpen, ExternalLink } from "lucide-react";
import { GuideLayout } from '@/components/layout/GuideLayout';
import '@/styles/guides/programming/oop.css';

const guide = guidesData.guides.find(v => v.id === "oop")!;

// ════════════════════════════════════════
// DATA & TYPES
// ════════════════════════════════════════

type PillarId = 'encapsulation' | 'abstraction' | 'inheritance' | 'polymorphism';

interface HighlightState {
    boxes: Record<string, string>;   // boxId → css class name
    connectors: Record<string, string>; // connectorId → css class name
    fieldIds: string[];
    methodIds: string[];
}

const PILLARS = [
    {
        id: 'encapsulation' as PillarId,
        icon: '🔒',
        name: 'Encapsulation',
        tagline: 'Bundle data and behavior inside a class. Expose only what\'s necessary through public methods, hiding internal state.',
        colorClass: 'oop-card-purple',
        tags: [{ text: 'Data Hiding', highlight: true }, { text: 'Access Control', highlight: false }, { text: 'OOP Pillar', highlight: false }],
        whyItMatters: 'Prevents unintended mutation of internal state — like putting your car engine behind a key ignition instead of raw wires.',
    },
    {
        id: 'abstraction' as PillarId,
        icon: '🎭',
        name: 'Abstraction',
        tagline: 'Hide complexity. Show only what\'s relevant. Simplify interfaces so callers don\'t care about the "how".',
        colorClass: 'oop-card-cyan',
        tags: [{ text: 'Simplify APIs', highlight: true }, { text: 'Interface Design', highlight: false }, { text: 'OOP Pillar', highlight: false }],
        whyItMatters: 'You drive a car without knowing combustion mechanics. Abstraction does the same for your code.',
    },
    {
        id: 'inheritance' as PillarId,
        icon: '🧬',
        name: 'Inheritance',
        tagline: 'A child class acquires properties and methods from a parent class. Promotes reuse and establishes an "is-a" relationship.',
        colorClass: 'oop-card-pink',
        tags: [{ text: 'Code Reuse', highlight: true }, { text: 'Is-A Relation', highlight: false }, { text: 'OOP Pillar', highlight: false }],
        whyItMatters: 'Define common behaviour once. Every Animal breathes — only Subclasses add what makes them unique.',
    },
    {
        id: 'polymorphism' as PillarId,
        icon: '🔄',
        name: 'Polymorphism',
        tagline: 'One interface, many implementations. Override parent methods so each subclass behaves differently under the same call.',
        colorClass: 'oop-card-green',
        tags: [{ text: 'Method Overriding', highlight: true }, { text: 'Flexible APIs', highlight: false }, { text: 'OOP Pillar', highlight: false }],
        whyItMatters: 'Call speak() on any Animal. Dog barks, Cat meows — the caller doesn\'t need to know which.',
    },
];

// ── Interactive flow steps per pillar ──
type FlowStep = {
    text: string;
    highlight: HighlightState;
};

const FLOWS: Record<PillarId, { title: string; steps: FlowStep[] }> = {
    encapsulation: {
        title: 'Encapsulation: Private Fields + Public Getters',
        steps: [
            {
                text: '1. BankAccount class declares private fields: balance, owner.',
                highlight: { boxes: { bank: 'highlight' }, connectors: {}, fieldIds: ['ba-balance', 'ba-owner'], methodIds: [] },
            },
            {
                text: '2. Fields are NOT directly accessible — only through controlled methods.',
                highlight: { boxes: { bank: 'highlight', ext: 'highlight-amber' }, connectors: { c1: 'active-purple' }, fieldIds: ['ba-balance', 'ba-owner'], methodIds: [] },
            },
            {
                text: '3. Client calls getBalance() — a clean public getter.',
                highlight: { boxes: { bank: 'highlight', ext: 'highlight-amber' }, connectors: { c1: 'active-purple' }, fieldIds: [], methodIds: ['ba-getBalance'] },
            },
            {
                text: '4. deposit(amount) validates input before mutating state.',
                highlight: { boxes: { bank: 'highlight' }, connectors: {}, fieldIds: [], methodIds: ['ba-deposit'] },
            },
            {
                text: '5. Internal invariants are preserved — balance cannot go negative.',
                highlight: { boxes: { bank: 'highlight' }, connectors: {}, fieldIds: ['ba-balance'], methodIds: ['ba-withdraw'] },
            },
            {
                text: '✅ Data is bundled and protected. No external code can corrupt state.',
                highlight: { boxes: { bank: 'highlight' }, connectors: {}, fieldIds: [], methodIds: [] },
            },
        ],
    },
    abstraction: {
        title: 'Abstraction: Interface Hides Implementation',
        steps: [
            {
                text: '1. Define a Shape abstract class with an abstract area() method.',
                highlight: { boxes: { shape: 'highlight' }, connectors: {}, fieldIds: [], methodIds: ['sh-area'] },
            },
            {
                text: '2. Circle extends Shape — must implement area() concretely.',
                highlight: { boxes: { circle: 'highlight-cyan' }, connectors: { c2: 'active-cyan' }, fieldIds: ['ci-radius'], methodIds: ['ci-area'] },
            },
            {
                text: '3. Rectangle extends Shape — its own area() formula.',
                highlight: { boxes: { rect: 'highlight-pink' }, connectors: { c3: 'active-pink' }, fieldIds: ['re-w', 're-h'], methodIds: ['re-area'] },
            },
            {
                text: '4. Caller holds a Shape reference — calls area() without knowing the type.',
                highlight: { boxes: { shape: 'highlight', circle: 'highlight-cyan', rect: 'highlight-pink' }, connectors: { c2: 'active-cyan', c3: 'active-pink' }, fieldIds: [], methodIds: ['sh-area', 'ci-area', 're-area'] },
            },
            {
                text: '✅ Complexity hidden. New shapes can be added without changing callers.',
                highlight: { boxes: { shape: 'highlight' }, connectors: {}, fieldIds: [], methodIds: ['sh-area'] },
            },
        ],
    },
    inheritance: {
        title: 'Inheritance: Animal → Dog / Cat',
        steps: [
            {
                text: '1. Animal base class defines shared properties: name, age.',
                highlight: { boxes: { animal: 'highlight' }, connectors: {}, fieldIds: ['an-name', 'an-age'], methodIds: [] },
            },
            {
                text: '2. Animal provides a default breathe() method all subclasses inherit.',
                highlight: { boxes: { animal: 'highlight' }, connectors: {}, fieldIds: [], methodIds: ['an-breathe'] },
            },
            {
                text: '3. Dog extends Animal — adds breed field and bark() method.',
                highlight: { boxes: { dog: 'highlight-pink' }, connectors: { c4: 'active-pink' }, fieldIds: ['do-breed'], methodIds: ['do-bark'] },
            },
            {
                text: '4. Cat extends Animal — adds indoor flag and purr() method.',
                highlight: { boxes: { cat: 'highlight-green' }, connectors: { c5: 'active-green' }, fieldIds: ['ca-indoor'], methodIds: ['ca-purr'] },
            },
            {
                text: '5. Both Dog & Cat inherit breathe() — no need to rewrite it.',
                highlight: { boxes: { animal: 'highlight', dog: 'highlight-pink', cat: 'highlight-green' }, connectors: { c4: 'active-pink', c5: 'active-green' }, fieldIds: [], methodIds: ['an-breathe', 'do-bark', 'ca-purr'] },
            },
            {
                text: '✅ DRY principle respected. Common code lives once in the parent.',
                highlight: { boxes: { animal: 'highlight' }, connectors: {}, fieldIds: [], methodIds: [] },
            },
        ],
    },
    polymorphism: {
        title: 'Polymorphism: speak() — One Call, Many Behaviours',
        steps: [
            {
                text: '1. Animal declares a virtual speak() method.',
                highlight: { boxes: { animal: 'highlight' }, connectors: {}, fieldIds: [], methodIds: ['an-speak'] },
            },
            {
                text: '2. Dog overrides speak() → returns "Woof!"',
                highlight: { boxes: { dog: 'highlight-pink' }, connectors: { c4: 'active-pink' }, fieldIds: [], methodIds: ['do-speak'] },
            },
            {
                text: '3. Cat overrides speak() → returns "Meow!"',
                highlight: { boxes: { cat: 'highlight-green' }, connectors: { c5: 'active-green' }, fieldIds: [], methodIds: ['ca-speak'] },
            },
            {
                text: '4. Caller loops over [dog, cat] as Animal[] — calls speak() on each.',
                highlight: { boxes: { animal: 'highlight', dog: 'highlight-pink', cat: 'highlight-green' }, connectors: { c4: 'active-pink', c5: 'active-green' }, fieldIds: [], methodIds: ['an-speak', 'do-speak', 'ca-speak'] },
            },
            {
                text: '5. Runtime dispatches to Dog.speak() or Cat.speak() automatically.',
                highlight: { boxes: { dog: 'highlight-pink', cat: 'highlight-green' }, connectors: { c4: 'active-pink', c5: 'active-green' }, fieldIds: [], methodIds: ['do-speak', 'ca-speak'] },
            },
            {
                text: '✅ Same interface. Different behaviours. No if/else spaghetti needed.',
                highlight: { boxes: { animal: 'highlight', dog: 'highlight-pink', cat: 'highlight-green' }, connectors: {}, fieldIds: [], methodIds: [] },
            },
        ],
    },
};

const COMPARISON = [
    { name: 'Encapsulation', safety: 5, reuse: 3, complexity: 2, flexibility: 3, pillar: '🔒' },
    { name: 'Abstraction', safety: 4, reuse: 4, complexity: 3, flexibility: 5, pillar: '🎭' },
    { name: 'Inheritance', safety: 3, reuse: 5, complexity: 3, flexibility: 3, pillar: '🧬' },
    { name: 'Polymorphism', safety: 4, reuse: 5, complexity: 4, flexibility: 5, pillar: '🔄' },
];

const RESOURCES = [
    { title: 'MDN: Object-Oriented Programming', type: 'web', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_programming' },
    { title: 'OOP Concepts – freeCodeCamp', type: 'youtube', url: 'https://www.youtube.com/watch?v=pTB0EiLXUC8' },
    { title: 'Refactoring Guru – Design Patterns', type: 'web', url: 'https://refactoring.guru/design-patterns' },
    { title: 'Python OOP Tutorial – Corey Schafer', type: 'youtube', url: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM' },
    { title: 'The Pragmatic Programmer (Open Source Alt)', type: 'web', url: 'https://github.com/HugoMatilla/The-Pragmatic-Programmer' },
];

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export function OopGuide() {
    const { animationSpeed, setIsSettingsOpen } = useSettings();
    const [replayCount, setReplayCount] = useState(0);
    const [activePillar, setActivePillar] = useState<PillarId>('encapsulation');
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const animRef = useRef<NodeJS.Timeout[]>([]);

    const playPillar = useCallback((pillarId: PillarId) => {
        animRef.current.forEach(clearTimeout);
        animRef.current = [];
        setActivePillar(pillarId);
        setCurrentStepIdx(-1);

        const flow = FLOWS[pillarId];
        const stepTime = 1500 * animationSpeed;

        flow.steps.forEach((_, i) => {
            const t = setTimeout(() => setCurrentStepIdx(i), i * stepTime);
            animRef.current.push(t);
        });
    }, [animationSpeed]);

    useEffect(() => {
        const t = setTimeout(() => playPillar('encapsulation'), 1200);
        return () => {
            clearTimeout(t);
            animRef.current.forEach(clearTimeout);
        };
    }, [replayCount, playPillar]);

    const handleReplay = () => {
        window.scrollTo({ top: 0 });
        setReplayCount(p => p + 1);
    };

    const currentHighlight = currentStepIdx >= 0
        ? FLOWS[activePillar].steps[currentStepIdx].highlight
        : { boxes: {}, connectors: {}, fieldIds: [], methodIds: [] };

    const boxClass = (id: string) => {
        const cls = currentHighlight.boxes[id];
        if (!cls) return Object.keys(currentHighlight.boxes).length > 0 ? 'faded' : '';
        return cls;
    };

    const connectorClass = (id: string) => currentHighlight.connectors[id] ?? '';

    const fieldLit = (id: string) => currentHighlight.fieldIds.includes(id);
    const methodLit = (id: string) => currentHighlight.methodIds.includes(id);

    const methodClass = (id: string, colorKey?: string): string => {
        if (!methodLit(id)) return '';
        const map: Record<string, string> = {
            cyan: 'lit-cyan',
            pink: 'lit-pink',
            green: 'lit-green',
            amber: 'lit-amber',
        };
        return colorKey ? `lit ${map[colorKey] ?? ''}` : 'lit';
    };

    return (
        <GuideLayout
            githubPath="src/components/guides/programming/OopGuide.tsx"
            category={guide.category}
            title={guide.title}
            description={guide.description}
            primaryColor={guide.colorConfig.primary}
            onReplay={handleReplay}
            contributors={guide.contributors}
        >
            {/* ═══════════ PILLAR GRID ═══════════ */}
            <h2 className="section-title">The 4 Pillars of OOP</h2>
            <div className="oop-pillar-grid">
                {PILLARS.map(p => (
                    <div
                        key={p.id}
                        className={`viz-card oop-pillar-card ${p.colorClass} ${activePillar === p.id ? 'active' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            document.getElementById('oop-action-section')?.scrollIntoView({ behavior: 'smooth' });
                            playPillar(p.id);
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('oop-action-section')?.scrollIntoView({ behavior: 'smooth' });
                                playPillar(p.id);
                            }
                        }}
                    >
                        <div className="oop-pillar-icon">{p.icon}</div>
                        <div className="oop-pillar-name">{p.name}</div>
                        <div className="oop-pillar-tagline">{p.tagline}</div>
                        <div className="oop-pillar-tag-row">
                            {p.tags.map(t => (
                                <span key={t.text} className={`oop-tag ${t.highlight ? '' : 'oop-tag-dim'}`}>{t.text}</span>
                            ))}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.5, marginTop: '0.2rem' }}>
                            <span style={{ color: 'var(--oop-card-accent, #7c4dff)', fontWeight: 700 }}>Why it matters: </span>
                            {p.whyItMatters}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════ ARCHITECTURE DIAGRAM (Mermaid) ═══════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Class Hierarchy Overview</h2>
                <p className="viz-section-hint">How the four pillars shape a typical OOP class structure</p>
            </div>

            <div className="oop-mermaid-wrap viz-card" style={{ padding: '2rem' }}>
                <pre className="mermaid">{`
classDiagram
    class Animal {
        +String name
        +int age
        +breathe() void
        +speak() String
    }
    class Dog {
        +String breed
        +bark() void
        +speak() String
    }
    class Cat {
        +bool isIndoor
        +purr() void
        +speak() String
    }
    class BankAccount {
        -float balance
        -String owner
        +getBalance() float
        +deposit(amount) void
        +withdraw(amount) void
    }
    class Shape {
        <<abstract>>
        +area() float
    }
    class Circle {
        +float radius
        +area() float
    }
    class Rectangle {
        +float width
        +float height
        +area() float
    }

    Animal <|-- Dog : Inheritance
    Animal <|-- Cat : Inheritance
    Shape <|-- Circle : Abstraction
    Shape <|-- Rectangle : Abstraction

    style Animal fill:#1a1f2b,stroke:#7c4dff,color:#fff
    style Dog fill:#12161f,stroke:#ff4081,color:#fff
    style Cat fill:#12161f,stroke:#1de9b6,color:#fff
    style BankAccount fill:#1a1f2b,stroke:#7c4dff,color:#fff
    style Shape fill:#0d1117,stroke:#00e5ff,color:#aaa
    style Circle fill:#12161f,stroke:#00e5ff,color:#fff
    style Rectangle fill:#12161f,stroke:#ff4081,color:#fff
                `.trim()}</pre>
            </div>

            {/* ═══════════ INTERACTIVE CLASS DIAGRAM ═══════════ */}
            <div className="viz-section-header" id="oop-action-section">
                <h2 className="viz-section-title">See It In Action</h2>
                <p className="viz-section-hint">Select a pillar to watch the class diagram animate step-by-step</p>
            </div>

            {/* Tab Controls */}
            <div className="viz-flow-controls" style={{ alignItems: 'center' }}>
                {PILLARS.map(p => (
                    <button
                        key={p.id}
                        id={`oop-tab-${p.id}`}
                        className={`oop-tab-btn ${activePillar === p.id ? 'active' : ''}`}
                        onClick={() => playPillar(p.id)}
                    >
                        {p.icon} {p.name}
                    </button>
                ))}

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                    className="social-btn"
                    aria-label="Settings"
                ><Settings size={14} /></button>

                <button
                    onClick={() => playPillar(activePillar)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                    className="social-btn"
                    aria-label="Replay Animation"
                ><span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '-2px' }}>↺</span></button>
            </div>

            {/* Diagram Panel */}
            <div className="oop-diagram-outer">
                <div className="oop-flow-status-badge" style={{ color: currentStepIdx === -1 ? 'var(--text-dim)' : '#7c4dff' }}>
                    {currentStepIdx === -1 ? 'Waiting…' : `Step ${currentStepIdx + 1} / ${FLOWS[activePillar].steps.length}`}
                </div>

                <h3 className="oop-flow-title">{FLOWS[activePillar].title}</h3>

                {/* ── ENCAPSULATION diagram ── */}
                {activePillar === 'encapsulation' && (
                    <div className="oop-class-scene">
                        <div className="oop-class-row" style={{ justifyContent: 'center', gap: '5rem' }}>
                            {/* BankAccount */}
                            <ClassBox id="bank" label="BankAccount" colorClass={boxClass('bank')}>
                                <div className={`oop-class-field ${fieldLit('ba-balance') ? 'lit' : ''}`} id="ba-balance">— balance: float</div>
                                <div className={`oop-class-field ${fieldLit('ba-owner') ? 'lit' : ''}`} id="ba-owner">— owner: String</div>
                                <div className="oop-class-divider" />
                                <div className={`oop-class-method ${methodClass('ba-getBalance')}`} id="ba-getBalance">+ getBalance(): float</div>
                                <div className={`oop-class-method ${methodClass('ba-deposit')}`} id="ba-deposit">+ deposit(amount)</div>
                                <div className={`oop-class-method ${methodClass('ba-withdraw')}`} id="ba-withdraw">+ withdraw(amount)</div>
                            </ClassBox>

                            {/* External Caller */}
                            <ClassBox id="ext" label="Client" meta="external caller" colorClass={boxClass('ext')}>
                                <div className="oop-class-method">+ main()</div>
                            </ClassBox>
                        </div>

                        <svg className="oop-svg-connectors" viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <marker id="oop-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
                                    <polygon points="0 0, 9 3, 0 6" fill="currentColor" />
                                </marker>
                            </defs>
                            <path id="c1" className={`oop-connector ${connectorClass('c1')}`} d="M 290 40 L 390 40" />
                        </svg>
                    </div>
                )}

                {/* ── ABSTRACTION diagram ── */}
                {activePillar === 'abstraction' && (
                    <div className="oop-class-scene">
                        <div className="oop-class-row" style={{ marginBottom: '0' }}>
                            {/* Shape */}
                            <ClassBox id="shape" label="Shape" meta="«abstract»" colorClass={boxClass('shape')}>
                                <div className={`oop-class-method ${methodClass('sh-area')}`} id="sh-area">+ area(): float</div>
                            </ClassBox>
                        </div>

                        <svg className="oop-svg-connectors" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid meet" style={{ height: '60px' }}>
                            <defs>
                                <marker id="oop-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
                                    <polygon points="0 0, 9 3, 0 6" fill="currentColor" />
                                </marker>
                            </defs>
                            <path id="c2" className={`oop-connector ${connectorClass('c2')}`} d="M 220 10 L 160 50" />
                            <path id="c3" className={`oop-connector ${connectorClass('c3')}`} d="M 380 10 L 440 50" />
                        </svg>

                        <div className="oop-class-row" style={{ gap: '5rem' }}>
                            {/* Circle */}
                            <ClassBox id="circle" label="Circle" colorClass={boxClass('circle')}>
                                <div className={`oop-class-field ${fieldLit('ci-radius') ? 'lit' : ''}`} id="ci-radius">+ radius: float</div>
                                <div className="oop-class-divider" />
                                <div className={`oop-class-method ${methodClass('ci-area', 'cyan')}`} id="ci-area">+ area(): float</div>
                            </ClassBox>

                            {/* Rectangle */}
                            <ClassBox id="rect" label="Rectangle" colorClass={boxClass('rect')}>
                                <div className={`oop-class-field ${fieldLit('re-w') ? 'lit' : ''}`} id="re-w">+ width: float</div>
                                <div className={`oop-class-field ${fieldLit('re-h') ? 'lit' : ''}`} id="re-h">+ height: float</div>
                                <div className="oop-class-divider" />
                                <div className={`oop-class-method ${methodClass('re-area', 'pink')}`} id="re-area">+ area(): float</div>
                            </ClassBox>
                        </div>
                    </div>
                )}

                {/* ── INHERITANCE & POLYMORPHISM diagram ── */}
                {(activePillar === 'inheritance' || activePillar === 'polymorphism') && (
                    <div className="oop-class-scene">
                        <div className="oop-class-row" style={{ marginBottom: '0' }}>
                            {/* Animal */}
                            <ClassBox id="animal" label="Animal" colorClass={boxClass('animal')}>
                                <div className={`oop-class-field ${fieldLit('an-name') ? 'lit' : ''}`} id="an-name">+ name: String</div>
                                <div className={`oop-class-field ${fieldLit('an-age') ? 'lit' : ''}`} id="an-age">+ age: int</div>
                                <div className="oop-class-divider" />
                                <div className={`oop-class-method ${methodClass('an-breathe')}`} id="an-breathe">+ breathe(): void</div>
                                <div className={`oop-class-method ${methodClass('an-speak')}`} id="an-speak">+ speak(): String</div>
                            </ClassBox>
                        </div>

                        <svg className="oop-svg-connectors" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid meet" style={{ height: '60px' }}>
                            <defs>
                                <marker id="oop-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
                                    <polygon points="0 0, 9 3, 0 6" fill="currentColor" />
                                </marker>
                            </defs>
                            <path id="c4" className={`oop-connector ${connectorClass('c4')}`} d="M 220 10 L 140 50" />
                            <path id="c5" className={`oop-connector ${connectorClass('c5')}`} d="M 380 10 L 460 50" />
                        </svg>

                        <div className="oop-class-row" style={{ gap: '5rem' }}>
                            {/* Dog */}
                            <ClassBox id="dog" label="Dog" colorClass={boxClass('dog')}>
                                <div className={`oop-class-field ${fieldLit('do-breed') ? 'lit' : ''}`} id="do-breed">+ breed: String</div>
                                <div className="oop-class-divider" />
                                <div className={`oop-class-method ${methodClass('do-bark', 'pink')}`} id="do-bark">+ bark(): void</div>
                                <div className={`oop-class-method ${methodClass('do-speak', 'pink')}`} id="do-speak">+ speak(): "Woof!"</div>
                            </ClassBox>

                            {/* Cat */}
                            <ClassBox id="cat" label="Cat" colorClass={boxClass('cat')}>
                                <div className={`oop-class-field ${fieldLit('ca-indoor') ? 'lit' : ''}`} id="ca-indoor">+ isIndoor: bool</div>
                                <div className="oop-class-divider" />
                                <div className={`oop-class-method ${methodClass('ca-purr', 'green')}`} id="ca-purr">+ purr(): void</div>
                                <div className={`oop-class-method ${methodClass('ca-speak', 'green')}`} id="ca-speak">+ speak(): "Meow!"</div>
                            </ClassBox>
                        </div>
                    </div>
                )}

                {/* Step List */}
                <div className="oop-step-list">
                    {FLOWS[activePillar].steps.map((step, i) => (
                        <div
                            key={step.text}
                            className={`oop-step-row ${currentStepIdx >= i ? 'active' : 'faded'} ${currentStepIdx === i ? 'active' : ''}`}
                        >
                            <div className="oop-step-num">{i + 1}</div>
                            <div className="oop-step-body">{step.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════ COMPARISON TABLE ═══════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Pillar Comparison</h2>
                <p className="viz-section-hint">Understand the trade-offs and strengths of each OOP principle</p>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th>Pillar</th>
                            <th>Safety</th>
                            <th>Reusability</th>
                            <th>Complexity</th>
                            <th>Flexibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON.map(row => (
                            <tr key={row.name}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{row.pillar} {row.name}</td>
                                <td><OopRating dots={row.safety} /></td>
                                <td><OopRating dots={row.reuse} /></td>
                                <td><OopRating dots={row.complexity} /></td>
                                <td><OopRating dots={row.flexibility} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══════════ RESOURCES ═══════════ */}
            <div className="viz-section-header" style={{ marginTop: '3rem' }}>
                <h2 className="viz-section-title">Resources</h2>
            </div>
            <div className="viz-comparison-table-wrap">
                <table className="viz-table">
                    <thead>
                        <tr>
                            <th style={{ width: '45%' }}>Title</th>
                            <th style={{ width: '20%' }}>Type</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCES.map(res => (
                            <tr key={res.title}>
                                <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{res.title}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <OopResourceIcon type={res.type} />
                                        <span style={{ textTransform: 'capitalize' }}>{res.type}</span>
                                    </div>
                                </td>
                                <td>
                                    <a
                                        href={`${res.url}${res.url.includes('?') ? '&' : '?'}ref=vizly.dev`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--blue)', textDecoration: 'none', fontSize: '0.9rem' }}
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

function ClassBox({
    id,
    label,
    meta,
    colorClass,
    children,
}: Readonly<{ id: string; label: string; meta?: string; colorClass: string; children?: React.ReactNode }>) {
    return (
        <div id={id} className={`oop-class-box ${colorClass}`}>
            <div className="oop-class-header">
                {label}
                {meta && <span className="oop-class-meta">{meta}</span>}
            </div>
            <div className="oop-class-body">{children}</div>
        </div>
    );
}

function OopRating({ dots }: Readonly<{ dots: number }>) {
    return (
        <div className="oop-rating-dots">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`oop-dot ${i <= dots ? 'on' : ''}`} />
            ))}
        </div>
    );
}

function OopResourceIcon({ type }: Readonly<{ type: string }>) {
    switch (type) {
        case 'youtube': return <Youtube size={18} color="#FF4444" />;
        case 'web': return <Globe size={18} color="#4A90E2" />;
        case 'course': return <BookOpen size={18} color="#F5A623" />;
        default: return <ExternalLink size={18} />;
    }
}

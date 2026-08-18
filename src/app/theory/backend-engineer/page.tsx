"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import theoryData from "@/data/theory/backend-engineer.json";
import type { TheoryLevel, TheorySection, TheoryTopic } from "@/types/theory";
import { slugify } from "@/lib/slug";
import "@/styles/theory.css";

const sections = theoryData as TheorySection[];

const LEVELS: { value: TheoryLevel | "all"; label: string }[] = [
    { value: "all", label: "All levels" },
    { value: "junior", label: "Junior" },
    { value: "mid", label: "Mid" },
    { value: "senior", label: "Senior" },
];

interface TopicEntry {
    section: TheorySection;
    topic: TheoryTopic;
    key: string;
}

function topicKey(sectionId: string, q: string) {
    return `${sectionId}::${q}`;
}

function searchText(topic: TheoryTopic) {
    return `${topic.q} ${topic.a.join(" ")} ${topic.example ?? ""}`.toLowerCase();
}

function shuffle<T>(input: T[]): T[] {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Lightweight highlighter: comments, quoted strings, SQL keywords. Input is
// HTML-escaped before any spans are added, so the innerHTML below is safe.
function highlightExample(text: string): string {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escaped
        .split("\n")
        .map(line =>
            line
                .replace(/("[^"\n]*"|'[^' ]{1,40}')/g, '<span class="tok-s">$1</span>')
                .replace(/\b(SELECT|FROM|WHERE|JOIN|ON|CREATE|INDEX|UPDATE|INSERT|DELETE|BEGIN|COMMIT|SET)\b/g, '<span class="tok-k">$1</span>')
                .replace(/(^|\s)((?:#|\/\/)\s.*)$/, (_m, pre: string, com: string) => `${pre}<span class="tok-c">${com}</span>`)
        )
        .join("\n");
}

function ShortEmbed({ videoSrc }: { videoSrc: string }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button type="button" className="theory-video-btn" onClick={() => setOpen(true)}>
                <span className="theory-video-play">▶</span>
                Watch short
            </button>
            {open && createPortal(
                <div
                    className="theory-video-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Video short"
                    onClick={() => setOpen(false)}
                >
                    <div className="theory-video-modal" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="theory-video-close"
                            aria-label="Close video"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                        <div className="theory-video">
                            <video src={videoSrc} controls autoPlay playsInline />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

function TopicBody({ topic }: { topic: TheoryTopic }) {
    return (
        <div className="theory-detail-body">
            {topic.a.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
            {topic.example && (
                <div className="theory-example">
                    <span className="theory-example-label">Example</span>
                    <pre dangerouslySetInnerHTML={{ __html: highlightExample(topic.example) }} />
                </div>
            )}
        </div>
    );
}

function QuizView({ pool }: { pool: TopicEntry[] }) {
    const [queue, setQueue] = useState<TopicEntry[]>(() => shuffle(pool));
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [knownCount, setKnownCount] = useState(0);
    const [missed, setMissed] = useState<TopicEntry[]>([]);

    const current = queue[index];
    const done = index >= queue.length;

    const startRound = useCallback((entries: TopicEntry[]) => {
        setQueue(shuffle(entries));
        setIndex(0);
        setRevealed(false);
        setKnownCount(0);
        setMissed([]);
    }, []);

    const next = useCallback(() => {
        setRevealed(false);
        setIndex(i => i + 1);
    }, []);

    const grade = useCallback(
        (ok: boolean) => {
            if (!current) return;
            if (ok) setKnownCount(n => n + 1);
            else setMissed(m => [...m, current]);
            next();
        },
        [current, next]
    );

    const reveal = useCallback(() => setRevealed(true), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea") return;
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (done) startRound(pool);
                else if (!revealed) reveal();
            } else if (revealed && e.key === "1") grade(true);
            else if (revealed && e.key === "2") grade(false);
            else if (!done && (e.key === "s" || e.key === "S")) next();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [done, revealed, reveal, grade, next, startRound, pool]);

    if (pool.length === 0) {
        return <p className="theory-empty">No topics in this level filter.</p>;
    }

    if (done) {
        const total = knownCount + missed.length;
        return (
            <div className="quiz-done">
                <h2 className="theory-detail-q">Round complete</h2>
                <p>
                    {knownCount}/{total || queue.length} got it
                    {missed.length > 0 ? ` · ${missed.length} to review` : " · clean round"}
                </p>
                <div className="quiz-actions quiz-actions-center">
                    {missed.length > 0 && (
                        <button type="button" className="quiz-btn quiz-btn-reveal" onClick={() => startRound(missed)}>
                            Replay missed ({missed.length})
                        </button>
                    )}
                    <button
                        type="button"
                        className={`quiz-btn${missed.length > 0 ? "" : " quiz-btn-reveal"}`}
                        onClick={() => startRound(pool)}
                    >
                        New round
                    </button>
                </div>
                <p className="quiz-kbd">Progress is per session only, nothing is stored.</p>
            </div>
        );
    }

    return (
        <div className="quiz-card">
            <div className="quiz-top">
                <span>{current.section.title}</span>
                <span className="theory-detail-top-right">
                    {revealed && current.topic.videoSrc && (
                        <ShortEmbed key={current.topic.videoSrc} videoSrc={current.topic.videoSrc} />
                    )}
                    <span>
                        {index + 1} / {queue.length}
                        {" · "}
                        <span className={`quiz-top-level lv-${current.topic.level}`}>{current.topic.level}</span>
                    </span>
                </span>
            </div>
            <h2 className="quiz-q">{current.topic.q}</h2>
            {revealed && <TopicBody topic={current.topic} />}
            <div className="quiz-actions">
                {!revealed ? (
                    <>
                        <button type="button" className="quiz-btn quiz-btn-reveal" onClick={reveal}>
                            Show answer
                        </button>
                        <button type="button" className="quiz-btn quiz-btn-skip" onClick={next}>
                            Skip
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" className="quiz-btn quiz-btn-know" onClick={() => grade(true)}>
                            Got it
                        </button>
                        <button type="button" className="quiz-btn quiz-btn-review" onClick={() => grade(false)}>
                            Missed it
                        </button>
                        <button type="button" className="quiz-btn quiz-btn-skip" onClick={next}>
                            Skip
                        </button>
                    </>
                )}
            </div>
            <p className="quiz-kbd">Space: show answer · 1: got it · 2: missed · S: skip</p>
        </div>
    );
}

export default function BackendTheoryPage() {
    const [mode, setMode] = useState<"study" | "quiz">("study");
    const [query, setQuery] = useState("");
    const [level, setLevel] = useState<TheoryLevel | "all">("all");
    const [paneOpen, setPaneOpen] = useState(false);

    const allTopics = useMemo<TopicEntry[]>(
        () =>
            sections.flatMap(section =>
                section.topics.map(topic => ({ section, topic, key: topicKey(section.id, topic.q) }))
            ),
        []
    );

    const [activeKey, setActiveKey] = useState(allTopics[0]?.key ?? "");

    // Deep link: /theory/backend-engineer#<topic-slug> selects and opens that topic
    useEffect(() => {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (!hash) return;
        const entry = allTopics.find(t => slugify(t.topic.q) === hash);
        if (entry) {
            setActiveKey(entry.key);
            setPaneOpen(true);
        }
    }, [allTopics]);

    const levelCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allTopics.length, junior: 0, mid: 0, senior: 0 };
        allTopics.forEach(({ topic }) => counts[topic.level]++);
        return counts;
    }, [allTopics]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sections
            .map(section => ({
                section,
                topics: section.topics.filter(
                    topic =>
                        (level === "all" || topic.level === level) &&
                        (!q || searchText(topic).includes(q))
                ),
            }))
            .filter(entry => entry.topics.length > 0);
    }, [query, level]);

    const quizPool = useMemo(
        () => allTopics.filter(({ topic }) => level === "all" || topic.level === level),
        [allTopics, level]
    );

    const visibleCount = filtered.reduce((n, entry) => n + entry.topics.length, 0);
    const active = allTopics.find(t => t.key === activeKey) ?? allTopics[0];

    const selectTopic = (key: string, q: string) => {
        setActiveKey(key);
        setPaneOpen(true);
        history.replaceState(null, "", `#${slugify(q)}`);
    };

    return (
        <main className="theory-page">
            <header className="theory-head">
                <p className="theory-eyebrow">Interview theory · backend engineering</p>
                <h1 className="theory-title">Backend Engineer Theory</h1>
                <p className="theory-sub">
                    {allTopics.length} topics · {sections.length} sections · plain explanations with concrete
                    examples, tagged by level
                </p>
            </header>

            <div className="theory-controls">
                <div className="theory-mode-toggle" role="group" aria-label="Mode">
                    <button
                        type="button"
                        className={`theory-mode-btn${mode === "study" ? " is-active" : ""}`}
                        onClick={() => setMode("study")}
                    >
                        Study
                    </button>
                    <button
                        type="button"
                        className={`theory-mode-btn${mode === "quiz" ? " is-active" : ""}`}
                        onClick={() => setMode("quiz")}
                    >
                        Quiz
                    </button>
                </div>
                {mode === "study" && (
                    <input
                        type="text"
                        className="theory-search"
                        placeholder="Search a topic — ACID, Kubernetes, CAP theorem..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoComplete="off"
                    />
                )}
                <div className="theory-levels" role="group" aria-label="Filter by level">
                    {LEVELS.map(entry => (
                        <button
                            key={entry.value}
                            type="button"
                            className={`theory-level-btn${level === entry.value ? " is-active" : ""}${
                                entry.value === "all" ? "" : ` lv-${entry.value}`
                            }`}
                            onClick={() => setLevel(entry.value)}
                        >
                            {entry.label}
                            <span className="theory-level-count">{levelCounts[entry.value]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {mode === "quiz" ? (
                // key remounts the quiz (fresh round) when the level filter changes
                <QuizView key={level} pool={quizPool} />
            ) : (
                <div className="theory-layout">
                    <div className="theory-list">
                        {filtered.map(({ section, topics }) => (
                            <section key={section.id} className="theory-section">
                                <div className="theory-section-head">
                                    <h2 className="theory-section-title">{section.title}</h2>
                                    <span className="theory-track">{section.track}</span>
                                </div>
                                <div className="theory-topics">
                                    {topics.map(topic => {
                                        const key = topicKey(section.id, topic.q);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                className={`theory-row${activeKey === key ? " is-active" : ""}`}
                                                onClick={() => selectTopic(key, topic.q)}
                                            >
                                                <span className={`theory-level-dot lv-${topic.level}`} title={topic.level} />
                                                <span className="theory-row-q">{topic.q}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                        {visibleCount === 0 && <p className="theory-empty">No topics match your search.</p>}
                    </div>

                    <aside className={`theory-detail${paneOpen ? " is-open" : ""}`}>
                        <button
                            type="button"
                            className="theory-detail-close"
                            aria-label="Close"
                            onClick={() => setPaneOpen(false)}
                        >
                            ×
                        </button>
                        {active && (
                            <article>
                                <div className="theory-detail-top">
                                    <span>{active.section.title}</span>
                                    <span className="theory-detail-top-right">
                                        {active.topic.videoSrc && (
                                            <ShortEmbed key={active.topic.videoSrc} videoSrc={active.topic.videoSrc} />
                                        )}
                                        <span className={`theory-level-pill lv-${active.topic.level}`}>
                                            {active.topic.level}
                                        </span>
                                    </span>
                                </div>
                                <h2 className="theory-detail-q">{active.topic.q}</h2>
                                <TopicBody topic={active.topic} />
                            </article>
                        )}
                    </aside>
                </div>
            )}
        </main>
    );
}

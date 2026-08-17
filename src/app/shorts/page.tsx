"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Play, ChevronUp, ChevronDown } from "lucide-react";
import backendTheory from "@/data/theory/backend-engineer.json";
import extraShorts from "@/data/shorts.json";
import type { TheorySection } from "@/types/theory";
import { slugify } from "@/lib/slug";
import "@/styles/shorts.css";

interface ShortEntry {
    videoSrc: string;
    title: string;
    tag: string;
    href?: string;
}

const TRACKS: { id: string; label: string; href: string; sections: TheorySection[] }[] = [
    { id: "backend-engineer", label: "Backend Engineer", href: "/theory/backend-engineer", sections: backendTheory as TheorySection[] },
];

// Feed = theory topics that have a video + standalone entries from shorts.json
const ALL_SHORTS: ShortEntry[] = [
    ...TRACKS.flatMap(track =>
        track.sections.flatMap(section =>
            section.topics
                .filter(topic => topic.videoSrc)
                .map(topic => ({
                    videoSrc: topic.videoSrc as string,
                    title: topic.q,
                    tag: section.title,
                    href: `${track.href}#${slugify(topic.q)}`,
                }))
        )
    ),
    ...(extraShorts as ShortEntry[]),
];

function shuffle<T>(input: T[]): T[] {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function ShortsPage() {
    // null until mounted: feed renders only client-side, already shuffled,
    // so videos mount once in random order (no reorder of live players,
    // no hydration mismatch)
    const [shorts, setShorts] = useState<ShortEntry[] | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [muted, setMuted] = useState(true);
    const [paused, setPaused] = useState(false);
    const feedRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        setShorts(shuffle(ALL_SHORTS));
    }, []);

    // Play the active video, pause the rest
    useEffect(() => {
        videoRefs.current.forEach((video, i) => {
            if (!video) return;
            if (i === activeIndex && !paused) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, [activeIndex, paused, shorts]);

    // Track which item is in view
    useEffect(() => {
        const feed = feedRef.current;
        if (!feed) return;
        const items = Array.from(feed.querySelectorAll(".shorts-item"));
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveIndex(items.indexOf(entry.target));
                        setPaused(false);
                    }
                });
            },
            { root: feed, threshold: 0.6 }
        );
        items.forEach(item => observer.observe(item));
        return () => observer.disconnect();
    }, [shorts]);

    const scrollToIndex = useCallback((index: number) => {
        const feed = feedRef.current;
        if (!feed) return;
        const items = feed.querySelectorAll(".shorts-item");
        items[Math.max(0, Math.min(index, items.length - 1))]?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown" || e.key === "j") {
                e.preventDefault();
                scrollToIndex(activeIndex + 1);
            } else if (e.key === "ArrowUp" || e.key === "k") {
                e.preventDefault();
                scrollToIndex(activeIndex - 1);
            } else if (e.key === " ") {
                e.preventDefault();
                setPaused(p => !p);
            } else if (e.key === "m") {
                setMuted(m => !m);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [activeIndex, scrollToIndex]);

    if (ALL_SHORTS.length === 0) {
        return (
            <main className="shorts-page">
                <p className="shorts-empty">No shorts yet. Videos will show up here as topics get them.</p>
            </main>
        );
    }

    if (!shorts) {
        return <main className="shorts-page" />;
    }

    return (
        <main className="shorts-page">
            <div className="shorts-feed" ref={feedRef}>
                {shorts.map((short, i) => (
                    <section key={short.videoSrc} className="shorts-item">
                        <div className="shorts-player">
                            <video
                                ref={el => { videoRefs.current[i] = el; }}
                                src={short.videoSrc}
                                loop
                                muted={muted}
                                playsInline
                                preload={Math.abs(i - activeIndex) <= 1 ? "auto" : "none"}
                                onClick={() => setPaused(p => !p)}
                            />
                            {paused && i === activeIndex && (
                                <div className="shorts-paused" onClick={() => setPaused(false)}>
                                    <Play size={44} fill="currentColor" />
                                </div>
                            )}
                            <div className="shorts-overlay">
                                <span className="shorts-overlay-track">{short.tag}</span>
                                <h2 className="shorts-overlay-q">{short.title}</h2>
                                {short.href && (
                                    <Link href={short.href} className="shorts-overlay-link">
                                        Read full theory →
                                    </Link>
                                )}
                            </div>
                            <button
                                type="button"
                                className="shorts-mute"
                                aria-label={muted ? "Unmute" : "Mute"}
                                onClick={() => setMuted(m => !m)}
                            >
                                {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                            </button>
                        </div>
                    </section>
                ))}
            </div>

            <div className="shorts-side">
                <span className="shorts-counter">
                    {activeIndex + 1} / {shorts.length}
                </span>
                <button
                    type="button"
                    className="shorts-nav-btn"
                    aria-label="Previous short"
                    disabled={activeIndex === 0}
                    onClick={() => scrollToIndex(activeIndex - 1)}
                >
                    <ChevronUp size={18} />
                </button>
                <button
                    type="button"
                    className="shorts-nav-btn"
                    aria-label="Next short"
                    disabled={activeIndex === shorts.length - 1}
                    onClick={() => scrollToIndex(activeIndex + 1)}
                >
                    <ChevronDown size={18} />
                </button>
            </div>
        </main>
    );
}

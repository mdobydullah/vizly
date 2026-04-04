"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ArticleSeries } from "@/types/articles";

const VISIBLE_COUNT = 3;

interface SeriesNavProps {
    series: ArticleSeries;
    currentSlug: string;
    publishedSlugs: string[];
}

export function SeriesNav({ series, currentSlug, publishedSlugs }: Readonly<SeriesNavProps>) {
    const currentIndex = series.articles.findIndex(a => a.slug === currentSlug);
    const total = series.articles.length;
    const currentOrder = currentIndex >= 0 ? currentIndex + 1 : null;
    const needsCollapse = total > VISIBLE_COUNT;
    const [expanded, setExpanded] = useState(false);

    // Always show: first 3, plus the current article if it's beyond 3
    const visibleArticles = expanded
        ? series.articles
        : series.articles.filter((_, i) => i < VISIBLE_COUNT || i === currentIndex);

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto 2.5rem',
            padding: '1.2rem 1.4rem',
            borderRadius: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    <span style={{ fontSize: '1.1rem' }}>{series.icon}</span>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--text-hi)',
                    }}>
                        {series.title}
                    </span>
                </div>
                {currentOrder && (
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--text-dim)',
                    }}>
                        {currentOrder} of {total}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {visibleArticles.map((entry) => {
                    const isCurrent = entry.slug === currentSlug;
                    const isPublished = publishedSlugs.includes(entry.slug);

                    const content = (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '8px',
                            background: isCurrent ? 'color-mix(in srgb, var(--cyan) 8%, transparent)' : 'transparent',
                            transition: 'background 0.2s',
                        }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: isCurrent ? 'var(--cyan)' : 'var(--text-dim)',
                                minWidth: '1.2rem',
                            }}>
                                {entry.order}
                            </span>
                            <span style={{
                                fontSize: '0.82rem',
                                color: isCurrent ? 'var(--text-hi)' : isPublished ? 'var(--text)' : 'var(--text-dim)',
                                fontWeight: isCurrent ? 600 : 400,
                            }}>
                                {entry.title}
                            </span>
                            {!isPublished && !isCurrent && (
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.55rem',
                                    color: 'var(--text-dim)',
                                    opacity: 0.6,
                                    marginLeft: 'auto',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>
                                    soon
                                </span>
                            )}
                        </div>
                    );

                    if (isPublished && !isCurrent) {
                        return (
                            <Link
                                key={entry.slug}
                                href={`/articles/${entry.slug}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                className="series-nav-link"
                            >
                                {content}
                            </Link>
                        );
                    }

                    return <div key={entry.slug}>{content}</div>;
                })}
            </div>

            {needsCollapse && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        width: '100%',
                        marginTop: '0.5rem',
                        padding: '0.4rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--text-dim)',
                        transition: 'color 0.2s',
                    }}
                    className="series-expand-btn"
                >
                    {expanded ? 'Show less' : `Show all ${total} articles`}
                    <ChevronDown
                        size={14}
                        style={{
                            transition: 'transform 0.2s',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                    />
                </button>
            )}

            <style jsx>{`
                :global(.series-nav-link:hover > div) {
                    background: color-mix(in srgb, var(--cyan) 5%, transparent) !important;
                }
                :global(.series-expand-btn:hover) {
                    color: var(--text-hi) !important;
                }
            `}</style>
        </div>
    );
}

"use client";

import Link from "next/link";
import { ArticlePath, ArticleSeries } from "@/types/articles";

const COLOR_MAP: Record<string, string> = {
    cyan: 'var(--cyan)',
    purple: 'var(--purple)',
    green: 'var(--green)',
    orange: 'var(--orange)',
    pink: 'var(--pink)',
};

function slugToTitle(slug: string): string {
    return slug.replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase());
}

interface PathCardProps {
    path: ArticlePath;
    seriesMap: Record<string, ArticleSeries>;
    publishedSlugs: Set<string>;
    index: number;
}

export function PathCard({ path, seriesMap, publishedSlugs, index }: Readonly<PathCardProps>) {
    const resolvedSeries = path.series.map(slug => seriesMap[slug] ?? null);
    const totalArticles = resolvedSeries.reduce((sum, s) => sum + (s?.articles.length ?? 0), 0);
    const publishedArticles = resolvedSeries.reduce(
        (sum, s) => sum + (s?.articles.filter(a => publishedSlugs.has(a.slug)).length ?? 0),
        0
    );
    const firstPublishedSlug = resolvedSeries
        .find(s => s?.articles.some(a => publishedSlugs.has(a.slug)))
        ?.articles.find(a => publishedSlugs.has(a.slug))?.slug;

    const accentColor = COLOR_MAP[path.color] ?? 'var(--cyan)';

    return (
        <div
            className="path-card"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.75rem',
                animation: `fadeUp .5s ease .${index + 1}s both`,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
                        flexShrink: 0,
                    }}>
                        {path.icon}
                    </div>
                    <div>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: 'var(--text-hi)',
                            marginBottom: '0.2rem',
                        }}>
                            {path.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                color: 'var(--text-dim)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                {path.series.length} series · ~{path.estimatedWeeks} weeks
                            </span>
                        </div>
                    </div>
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                }}>
                    {publishedArticles} / {totalArticles} articles
                </span>
            </div>

            <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-body)',
            }}>
                {path.description}
            </p>

            {/* Series steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {path.series.map((slug, i) => {
                    const s = seriesMap[slug];
                    const isAvailable = !!s;
                    const stepPublished = s?.articles.filter(a => publishedSlugs.has(a.slug)).length ?? 0;
                    const stepTotal = s?.articles.length ?? 0;
                    const stepFirstSlug = s?.articles.find(a => publishedSlugs.has(a.slug))?.slug;
                    const isFirst = i === 0;

                    return (
                        <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Step number + connector */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    background: isAvailable
                                        ? `color-mix(in srgb, ${accentColor} 15%, transparent)`
                                        : 'var(--surface2)',
                                    color: isAvailable ? accentColor : 'var(--text-dim)',
                                    border: `1px solid ${isAvailable
                                        ? `color-mix(in srgb, ${accentColor} 30%, transparent)`
                                        : 'var(--border)'}`,
                                }}>
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                {i < path.series.length - 1 && (
                                    <div style={{
                                        width: '1px',
                                        height: '12px',
                                        background: 'var(--border)',
                                        marginTop: '2px',
                                    }} />
                                )}
                            </div>

                            {/* Series info — clickable if available */}
                            {isAvailable && stepFirstSlug ? (
                                <Link
                                    href={`/articles/${stepFirstSlug}`}
                                    className="path-series-row"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--surface2)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{s.icon}</span>
                                        <span style={{
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '0.8rem',
                                            color: 'var(--text)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {s.title}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                                        {isFirst && (
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.6rem',
                                                color: accentColor,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}>
                                                Start here
                                            </span>
                                        )}
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.6rem',
                                            color: 'var(--text-dim)',
                                            textTransform: 'uppercase',
                                        }}>
                                            {stepPublished}/{stepTotal}
                                        </span>
                                    </div>
                                </Link>
                            ) : (
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0.75rem',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    opacity: 0.45,
                                    gap: '0.5rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>📦</span>
                                        <span style={{
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-dim)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {s?.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.6rem',
                                        color: 'var(--text-dim)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        flexShrink: 0,
                                    }}>
                                        Soon
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div style={{
                height: '3px',
                background: 'var(--border)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '1.25rem',
            }}>
                <div style={{
                    height: '100%',
                    width: totalArticles > 0 ? `${(publishedArticles / totalArticles) * 100}%` : '0%',
                    background: accentColor,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                }} />
            </div>

            {/* CTA */}
            {firstPublishedSlug && (
                <Link
                    href={`/articles/${firstPublishedSlug}`}
                    className="path-card-cta"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem 1.2rem',
                        background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
                        borderRadius: '8px',
                        color: accentColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Start Learning →
                </Link>
            )}

            <style jsx>{`
                :global(.path-card) {
                    transition: all 0.3s ease;
                }
                :global(.path-card:hover) {
                    border-color: var(--border2) !important;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
                }
                :global(.path-series-row:hover) {
                    border-color: var(--border2) !important;
                    background: var(--surface) !important;
                }
                :global(.path-card-cta:hover) {
                    opacity: 0.85;
                    transform: translateX(2px);
                }
                :global([data-theme="light"] .path-card) {
                    background: #fff;
                    border-color: #e0ddd5;
                }
                :global([data-theme="light"] .path-card:hover) {
                    border-color: #c4c1b8 !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </div>
    );
}

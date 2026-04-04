"use client";

import Link from "next/link";
import { ArticleSeries } from "@/types/articles";

interface SeriesCardProps {
    series: ArticleSeries;
    publishedCount: number;
    index: number;
}

export function SeriesCard({ series, publishedCount, index }: Readonly<SeriesCardProps>) {
    const total = series.articles.length;
    // Link to the first article in the series
    const firstSlug = series.articles[0]?.slug;

    return (
        <Link
            href={firstSlug ? `/articles/${firstSlug}` : '/articles'}
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.4rem',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                animation: `fadeUp .5s ease .${index + 1}s both`,
                transition: 'all .3s ease',
            }}
            className="series-card"
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                }}>
                    {series.icon}
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    {publishedCount} / {total} articles
                </span>
            </div>

            <div>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: 'var(--text-hi)',
                    marginBottom: '0.3rem',
                }}>
                    {series.title}
                </h3>
                <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-dim)',
                    lineHeight: 1.5,
                }}>
                    {series.description}
                </p>
            </div>

            {/* Progress bar */}
            <div style={{
                height: '3px',
                background: 'var(--border)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: 'auto',
            }}>
                <div style={{
                    height: '100%',
                    width: `${(publishedCount / total) * 100}%`,
                    background: 'var(--cyan)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                }} />
            </div>

            <style jsx>{`
                :global(.series-card:hover) {
                    transform: translateY(-4px);
                    border-color: var(--border2) !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                :global([data-theme="light"] .series-card) {
                    background: #fff;
                    border-color: #e0ddd5;
                }

                :global([data-theme="light"] .series-card:hover) {
                    border-color: #c4c1b8 !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                }

                :global([data-theme="light"] .series-card) :global(div:first-child > div:first-child) {
                    background: #f0ede5;
                    border-color: #e0ddd5;
                }
            `}</style>
        </Link>
    );
}

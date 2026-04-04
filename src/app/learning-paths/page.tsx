"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useArticles } from "@/lib/useArticles";

const COLOR_MAP: Record<string, string> = {
  cyan: 'var(--cyan)',
  purple: 'var(--purple)',
  green: 'var(--green)',
  orange: 'var(--orange)',
  pink: 'var(--pink)',
};

export default function LearningPathsPage() {
  const { articles, series, paths } = useArticles();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const seriesMap = useMemo(() =>
    Object.fromEntries(series.map(s => [s.slug, s])),
  [series]);

  const publishedSlugs = useMemo(() => new Set(articles.map(a => a.slug)), [articles]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="viz-section-header">
        <h1 style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: 'var(--text-hi)',
          letterSpacing: '-0.02em',
          marginBottom: '0.3rem',
        }}>
          Learning Paths
        </h1>
        <p className="viz-section-hint">
          Curated roadmaps to take you from beginner to job-ready.
        </p>
      </div>

      <div className="viz-grid" style={{ maxWidth: '800px' }}>
        {paths.map((p, i) => {
          const resolved = p.series.map(slug => seriesMap[slug] ?? null);
          const totalArticles = resolved.reduce((sum, s) => sum + (s?.articles.length ?? 0), 0);
          const publishedArticles = resolved.reduce(
            (sum, s) => sum + (s?.articles.filter(a => publishedSlugs.has(a.slug)).length ?? 0),
            0
          );
          const accentColor = COLOR_MAP[p.color] ?? 'var(--cyan)';

          return (
            <Link
              key={p.slug}
              href={`/learning-paths/${p.slug}`}
              className="path-listing-card"
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
                animation: `fadeUp .5s ease .${i + 1}s both`,
                transition: 'all .3s ease',
              }}
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
                  background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
                }}>
                  {p.icon}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {p.series.length} series · ~{p.estimatedWeeks}w
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
                  {p.title}
                </h3>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-dim)',
                  lineHeight: 1.5,
                }}>
                  {p.description}
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
                  width: totalArticles > 0 ? `${(publishedArticles / totalArticles) * 100}%` : '0%',
                  background: accentColor,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </Link>
          );
        })}
        {paths.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '1.1rem' }}>No learning paths yet</p>
          </div>
        )}
      </div>

      <style jsx>{`
        :global(.path-listing-card:hover) {
          transform: translateY(-4px);
          border-color: var(--border2) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        :global([data-theme="light"] .path-listing-card) {
          background: #fff;
          border-color: #e0ddd5;
        }
        :global([data-theme="light"] .path-listing-card:hover) {
          border-color: #c4c1b8 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}

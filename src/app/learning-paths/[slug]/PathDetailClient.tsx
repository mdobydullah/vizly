"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArticlePath, ArticleSeries } from "@/types/articles";

interface Props {
  path: ArticlePath;
  series: ArticleSeries[];
  articleSlugs: string[];
}

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

export default function PathDetailClient({ path, series, articleSlugs }: Readonly<Props>) {
  const seriesMap = useMemo(() =>
    Object.fromEntries(series.map(s => [s.slug, s])),
  [series]);

  const publishedSlugs = useMemo(() => new Set(articleSlugs), [articleSlugs]);

  const resolvedSeries = path.series.map(slug => seriesMap[slug] ?? null);
  const totalArticles = resolvedSeries.reduce((sum, s) => sum + (s?.articles.length ?? 0), 0);
  const publishedArticles = resolvedSeries.reduce(
    (sum, s) => sum + (s?.articles.filter(a => publishedSlugs.has(a.slug)).length ?? 0),
    0
  );
  const accentColor = COLOR_MAP[path.color] ?? 'var(--cyan)';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header — same pattern as series detail */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        padding: '3rem clamp(1rem, 4vw, 2rem) 2rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
          margin: '0 auto 1rem',
        }}>
          {path.icon}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 800,
          fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
          color: 'var(--text-hi)',
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          {path.title}
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-dim)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-body)',
          maxWidth: '500px',
          margin: '0 auto 1rem',
        }}>
          {path.description}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {path.series.length} series · ~{path.estimatedWeeks} weeks
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {publishedArticles} / {totalArticles} articles published
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '3px',
          background: 'var(--border)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '1rem',
          maxWidth: '300px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <div style={{
            height: '100%',
            width: totalArticles > 0 ? `${(publishedArticles / totalArticles) * 100}%` : '0%',
            background: accentColor,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Series steps list */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto 3rem',
        width: '100%',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {path.series.map((slug, i) => {
          const s = seriesMap[slug];
          const isAvailable = !!s && s.articles.length > 0;
          const stepPublished = s?.articles.filter(a => publishedSlugs.has(a.slug)).length ?? 0;
          const stepTotal = s?.articles.length ?? 0;
          const isFirst = i === 0 && isAvailable;

          const rowContent = (
            <>
              {/* Step number */}
              <div style={{
                width: '28px',
                height: '28px',
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
                flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Icon + Title */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{s?.icon ?? '📦'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: isAvailable ? 'var(--text)' : 'var(--text-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {s?.title ?? slugToTitle(slug)}
                  </div>
                  {isAvailable && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      color: 'var(--text-dim)',
                    }}>
                      {stepPublished}/{stepTotal} articles
                    </span>
                  )}
                </div>
              </div>

              {/* Status badges */}
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
                {!isAvailable && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Soon
                  </span>
                )}
              </div>
            </>
          );

          const rowStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: isAvailable ? 'var(--surface)' : 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            opacity: isAvailable ? 1 : 0.5,
            transition: 'all 0.2s ease',
          };

          if (isAvailable) {
            return (
              <Link
                key={slug}
                href={`/series/${slug}`}
                className="path-series-row"
                style={{ ...rowStyle, textDecoration: 'none', color: 'inherit' }}
              >
                {rowContent}
              </Link>
            );
          }

          return (
            <div key={slug} style={rowStyle}>
              {rowContent}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        :global(.path-series-row:hover) {
          border-color: var(--border2) !important;
          background: var(--surface2) !important;
        }
        :global([data-theme="light"] .path-series-row) {
          background: #fff !important;
          border-color: #e0ddd5 !important;
        }
        :global([data-theme="light"] .path-series-row:hover) {
          border-color: #c4c1b8 !important;
          background: #f8f6f1 !important;
        }
      `}</style>
    </div>
  );
}

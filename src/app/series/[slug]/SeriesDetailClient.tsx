"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArticleFrontmatter, ArticleSeries } from "@/types/articles";

interface Props {
  series: ArticleSeries;
  articles: ArticleFrontmatter[];
}

const COLOR_MAP: Record<string, string> = {
  cyan: 'var(--cyan)',
  purple: 'var(--purple)',
  green: 'var(--green)',
  orange: 'var(--orange)',
  pink: 'var(--pink)',
  blue: 'var(--cyan)',
};

export default function SeriesDetailClient({ series, articles }: Readonly<Props>) {
  const publishedSlugs = useMemo(() => new Set(articles.map(a => a.slug)), [articles]);
  const publishedCount = series.articles.filter(a => publishedSlugs.has(a.slug)).length;
  const accentColor = COLOR_MAP[series.color] ?? 'var(--cyan)';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
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
          {series.icon}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 800,
          fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
          color: 'var(--text-hi)',
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          {series.title}
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-dim)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-body)',
          maxWidth: '500px',
          margin: '0 auto 1rem',
        }}>
          {series.description}
        </p>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {publishedCount} / {series.articles.length} articles published
        </span>

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
            width: series.articles.length > 0 ? `${(publishedCount / series.articles.length) * 100}%` : '0%',
            background: accentColor,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Article list */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto 3rem',
        width: '100%',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {series.articles.map((entry, i) => {
          const isPublished = publishedSlugs.has(entry.slug);
          const article = articles.find(a => a.slug === entry.slug);

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
                background: isPublished
                  ? `color-mix(in srgb, ${accentColor} 15%, transparent)`
                  : 'var(--surface2)',
                color: isPublished ? accentColor : 'var(--text-dim)',
                border: `1px solid ${isPublished
                  ? `color-mix(in srgb, ${accentColor} 30%, transparent)`
                  : 'var(--border)'}`,
                flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: isPublished ? 'var(--text)' : 'var(--text-dim)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entry.title}
                </div>
                {isPublished && article && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--text-dim)',
                  }}>
                    {article.readTime} read
                  </span>
                )}
              </div>

              {/* Status */}
              {!isPublished && (
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
              )}
            </>
          );

          const rowStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: isPublished ? 'var(--surface)' : 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            opacity: isPublished ? 1 : 0.5,
            transition: 'all 0.2s ease',
          };

          if (isPublished) {
            return (
              <Link
                key={entry.slug}
                href={`/articles/${entry.slug}`}
                className="series-article-row"
                style={{ ...rowStyle, textDecoration: 'none', color: 'inherit' }}
              >
                {rowContent}
              </Link>
            );
          }

          return (
            <div key={entry.slug} style={rowStyle}>
              {rowContent}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        :global(.series-article-row:hover) {
          border-color: var(--border2) !important;
          background: var(--surface2) !important;
        }
        :global([data-theme="light"] .series-article-row) {
          background: #fff !important;
          border-color: #e0ddd5 !important;
        }
        :global([data-theme="light"] .series-article-row:hover) {
          border-color: #c4c1b8 !important;
          background: #f8f6f1 !important;
        }
      `}</style>
    </div>
  );
}

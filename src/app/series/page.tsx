"use client";

import { useEffect, useMemo } from "react";
import { SeriesCard } from "@/components/articles/SeriesCard";
import { useArticles } from "@/lib/useArticles";

export default function SeriesPage() {
  const { articles, series } = useArticles();

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
          Series
        </h1>
        <p className="viz-section-hint">
          Follow structured learning paths from start to finish.
        </p>
      </div>

      <div className="viz-grid" style={{ maxWidth: '800px' }}>
        {series.map((s, i) => {
          const publishedCount = s.articles.filter(a => publishedSlugs.has(a.slug)).length;
          return <SeriesCard key={s.slug} series={s} publishedCount={publishedCount} index={i} />;
        })}
        {series.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '1.1rem' }}>No series yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

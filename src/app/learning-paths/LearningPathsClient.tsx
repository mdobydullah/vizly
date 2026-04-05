"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ArticleSeries, ArticlePath, ArticleSortOption } from "@/types/articles";
import { getColorConfig } from "@/lib/article-colors";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface Props {
  paths: ArticlePath[];
  series: ArticleSeries[];
  articleSlugs: string[];
}

function LearningPathsContent({ paths, series, articleSlugs }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;

  const selectedTag = searchParams.get("tag") || "all";

  const seriesMap = useMemo(() =>
    Object.fromEntries(series.map(s => [s.slug, s])),
  [series]);

  const publishedSlugs = useMemo(() => new Set(articleSlugs), [articleSlugs]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    paths.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [paths]);

  const handleTagChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("tag");
    } else {
      params.set("tag", val);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setCurrentPage(1);
  };

  const filteredPaths = useMemo(() => {
    let filtered = paths;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter(p =>
        p.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "updated":
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "az":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return sorted;
  }, [paths, searchQuery, selectedTag, sortBy]);

  const totalPages = Math.ceil(filteredPaths.length / perPage);
  const paginatedPaths = filteredPaths.slice((currentPage - 1) * perPage, currentPage * perPage);

  const clearFilters = () => {
    setSearchQuery("");
    handleTagChange("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const hasActiveFilters = searchQuery || selectedTag !== "all" || sortBy !== "newest";

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

      {/* Filters */}
      <div className="listing-filters">
        <div className="listing-filters-row">
          <div className="listing-search-wrap">
            <input
              type="text"
              placeholder="Search learning paths..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="listing-search-input"
            />
            <span className="listing-search-icon">🔍</span>
          </div>

          <SearchableSelect
            options={allTags}
            value={selectedTag}
            onChange={handleTagChange}
            placeholder="All Tags"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ArticleSortOption)}
            className="listing-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="listing-clear-btn">
              Clear ✕
            </button>
          )}
        </div>

        <div className="listing-results-count">
          Showing {paginatedPaths.length} of {filteredPaths.length} learning paths
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedTag !== "all" && ` tagged ${selectedTag}`}
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
        </div>
      </div>

      {/* Grid */}
      <div className="viz-grid">
        {paginatedPaths.map((p, i) => {
          const resolved = p.series.map(slug => seriesMap[slug] ?? null);
          const totalArticles = resolved.reduce((sum, s) => sum + (s?.articles.length ?? 0), 0);
          const publishedArticles = resolved.reduce(
            (sum, s) => sum + (s?.articles.filter(a => publishedSlugs.has(a.slug)).length ?? 0),
            0
          );
          const colorConfig = getColorConfig(p.color);

          return (
            <Link
              key={p.slug}
              href={`/learning-paths/${p.slug}`}
              className={`path-listing-card card-${p.color}`}
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
                <div
                  className="path-card-icon"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    background: colorConfig.background,
                    border: `1px solid ${colorConfig.border}`,
                    transition: 'all .3s ease',
                  }}
                >
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
                  background: colorConfig.primary,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }} />
              </div>

              <style jsx global>{`
                .path-listing-card {
                  transition: all .3s ease;
                }
                .path-listing-card:hover {
                  transform: translateY(-4px);
                }
                .path-listing-card:hover .path-card-icon {
                  transform: scale(1.05);
                }
                [data-theme="light"] .path-listing-card {
                  background: #fff;
                  border-color: #e0ddd5;
                }
                [data-theme="light"] .path-listing-card .path-card-icon {
                  background: #f0ede5;
                  border-color: #e0ddd5;
                }
                [data-theme="light"] .path-listing-card:hover .path-card-icon {
                  background: color-mix(in srgb, ${colorConfig.primary} 12%, #f0ede5) !important;
                  border-color: color-mix(in srgb, ${colorConfig.primary} 25%, #e0ddd5) !important;
                }
              `}</style>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPaths.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No learning paths found</p>
          <p style={{ fontSize: '.85rem' }}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="listing-pagination">
          <button onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="listing-page-btn">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => goToPage(page)} className={`listing-page-btn ${currentPage === page ? 'active' : ''}`}>
              {page}
            </button>
          ))}
          <button onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="listing-page-btn">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function LearningPathsClient({ paths, series, articleSlugs }: Readonly<Props>) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--text-dim)' }}>
        Loading learning paths...
      </div>
    }>
      <LearningPathsContent paths={paths} series={series} articleSlugs={articleSlugs} />
    </Suspense>
  );
}

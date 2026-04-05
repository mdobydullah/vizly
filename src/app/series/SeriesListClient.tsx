"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SeriesCard } from "@/components/articles/SeriesCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ArticleSeries, ArticleSortOption } from "@/types/articles";

interface Props {
  series: ArticleSeries[];
  articleSlugs: string[];
}

function SeriesListContent({ series, articleSlugs }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;

  const selectedTag = searchParams.get("tag") || "all";

  const publishedSlugs = useMemo(() => new Set(articleSlugs), [articleSlugs]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    series.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [series]);

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

  const filteredSeries = useMemo(() => {
    let filtered = series;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter(s =>
        s.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase())
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
  }, [series, searchQuery, selectedTag, sortBy]);

  const totalPages = Math.ceil(filteredSeries.length / perPage);
  const paginatedSeries = filteredSeries.slice((currentPage - 1) * perPage, currentPage * perPage);

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
          Series
        </h1>
        <p className="viz-section-hint">
          Follow structured learning paths from start to finish.
        </p>
      </div>

      {/* Filters */}
      <div className="listing-filters">
        <div className="listing-filters-row">
          <div className="listing-search-wrap">
            <input
              type="text"
              placeholder="Search series..."
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
          Showing {paginatedSeries.length} of {filteredSeries.length} series
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedTag !== "all" && ` tagged ${selectedTag}`}
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
        </div>
      </div>

      {/* Grid */}
      <div className="viz-grid">
        {paginatedSeries.map((s, i) => {
          const publishedCount = s.articles.filter(a => publishedSlugs.has(a.slug)).length;
          return <SeriesCard key={s.slug} series={s} publishedCount={publishedCount} index={i} />;
        })}
      </div>

      {/* Empty State */}
      {filteredSeries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No series found</p>
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

export default function SeriesListClient({ series, articleSlugs }: Readonly<Props>) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--text-dim)' }}>
        Loading series...
      </div>
    }>
      <SeriesListContent series={series} articleSlugs={articleSlugs} />
    </Suspense>
  );
}

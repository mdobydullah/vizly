"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ArticleSortOption } from "@/types/articles";
import categoriesData from "@/data/articles/categories.json";

import { useArticles } from "@/lib/useArticles";

function ArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { articles } = useArticles();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;

  const selectedCategory = searchParams.get("category") || "all";
  const selectedTag = searchParams.get("tag") || "all";

  // Category names from categories.json
  const categoryOptions = categoriesData.map(c => c.name);

  // All unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach(a => a.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const handleCategoryChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("category");
    } else {
      const cat = categoriesData.find(c => c.name === val);
      params.set("category", cat?.slug || val);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setCurrentPage(1);
  };

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

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter(a =>
        a.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase())
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
  }, [articles, searchQuery, selectedCategory, selectedTag, sortBy]);

  const totalPages = Math.ceil(filteredArticles.length / perPage);
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Get display name for selected category
  const selectedCategoryDisplay = selectedCategory !== "all"
    ? categoriesData.find(c => c.slug === selectedCategory)?.name || selectedCategory
    : "all";

  const clearFilters = () => {
    setSearchQuery("");
    handleCategoryChange("all");
    handleTagChange("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

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
          Articles
        </h1>
        <p className="viz-section-hint">
          Learn concepts through visual, in-depth articles.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto 1.5rem',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 280px', minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '.7rem 1rem .7rem 2.5rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '.85rem',
                outline: 'none',
                transition: 'all .2s',
              }}
              className="search-input"
            />
            <span style={{
              position: 'absolute',
              left: '.9rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
              fontSize: '1rem',
            }}>&#128269;</span>
          </div>

          {/* Category */}
          <SearchableSelect
            options={categoryOptions}
            value={selectedCategoryDisplay}
            onChange={handleCategoryChange}
            placeholder="All Categories"
          />

          {/* Tag */}
          <SearchableSelect
            options={allTags}
            value={selectedTag}
            onChange={handleTagChange}
            placeholder="All Tags"
          />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ArticleSortOption)}
            style={{
              padding: '.7rem 1rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '.85rem',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '140px',
              transition: 'all .2s',
            }}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>

          {/* Clear */}
          {(searchQuery || selectedCategory !== "all" || selectedTag !== "all" || sortBy !== "newest") && (
            <button
              onClick={clearFilters}
              style={{
                padding: '.7rem 1rem',
                background: 'transparent',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '.75rem',
                cursor: 'pointer',
                transition: 'all .2s',
                whiteSpace: 'nowrap',
              }}
              className="clear-btn"
            >
              Clear &#10005;
            </button>
          )}
        </div>

        {/* Results count */}
        <div style={{
          fontSize: '.75rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
        }}>
          Showing {paginatedArticles.length} of {filteredArticles.length} articles
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== "all" && ` in ${selectedCategoryDisplay}`}
          {selectedTag !== "all" && ` tagged ${selectedTag}`}
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
        </div>
      </div>

      {/* Grid */}
      <div className="viz-grid">
        {paginatedArticles.map((article, index) => (
          <ArticleCard key={article.slug} article={article} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No articles found</p>
          <p style={{ fontSize: '.85rem' }}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '.5rem',
          margin: '2rem auto 1rem',
          maxWidth: '1100px',
          padding: '0 1rem',
        }}>
          <button onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="pagination-btn">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => goToPage(page)} className={`pagination-btn ${currentPage === page ? 'active' : ''}`}>
              {page}
            </button>
          ))}
          <button onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="pagination-btn">
            Next →
          </button>
        </div>
      )}

      <style jsx>{`
        .search-input:focus {
          border-color: var(--cyan);
          box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.1);
        }
        .filter-select:focus {
          border-color: var(--cyan);
          box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.1);
        }
        .filter-select:hover {
          border-color: var(--border2);
        }
        .clear-btn:hover {
          border-color: var(--cyan);
          color: var(--cyan);
        }
        .pagination-btn {
          padding: .5rem .9rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: .75rem;
          cursor: pointer;
          transition: all .2s;
        }
        .pagination-btn:hover:not(:disabled) {
          border-color: var(--cyan);
          color: var(--cyan);
        }
        .pagination-btn.active {
          background: var(--cyan);
          color: #000;
          border-color: var(--cyan);
          font-weight: 700;
        }
        .pagination-btn:disabled {
          opacity: .3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default function Articles() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--text-dim)' }}>
        Loading articles...
      </div>
    }>
      <ArticlesContent />
    </Suspense>
  );
}

"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ArticleFrontmatter, ArticleSortOption } from "@/types/articles";
import categoriesData from "@/data/articles/categories.json";

interface Props {
  articles: ArticleFrontmatter[];
}

function ArticlesContent({ articles }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
      <div className="listing-filters">
        <div className="listing-filters-row">
          {/* Search */}
          <div className="listing-search-wrap">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="listing-search-input"
            />
            <span className="listing-search-icon">&#128269;</span>
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
            className="listing-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>

          {/* Clear */}
          {(searchQuery || selectedCategory !== "all" || selectedTag !== "all" || sortBy !== "newest") && (
            <button onClick={clearFilters} className="listing-clear-btn">
              Clear &#10005;
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="listing-results-count">
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

export default function ArticlesClient({ articles }: Readonly<Props>) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--text-dim)' }}>
        Loading articles...
      </div>
    }>
      <ArticlesContent articles={articles} />
    </Suspense>
  );
}

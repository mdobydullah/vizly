"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GuideCard } from "@/components/home/GuideCard";
import guidesData from "@/data/guides";
import { SortOption } from "@/types/guides";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const data = guidesData;

// Extract unique categories from guides
const getUniqueCategories = () => {
  const categories = new Set<string>();
  data.guides.forEach(guide => {
    // Split category by "·" and take the first part for broader categories
    const mainCategory = guide.category.split('·')[0].trim();
    categories.add(mainCategory);
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
};

function GuidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;

  // Get category from URL or default to "all"
  const selectedCategory = searchParams.get("category") || "all";

  const categories = getUniqueCategories();

  // Update URL when category changes
  const handleCategoryChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("category");
    } else {
      params.set("category", val);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter and sort guides
  const filteredGuides = useMemo(() => {
    let filtered = data.guides;

    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(guide =>
        guide.title.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(guide =>
        guide.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Sort guides
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => {
          // Sort by link availability first (available before upcoming)
          const aHasLink = a.link !== '#' && a.link !== null;
          const bHasLink = b.link !== '#' && b.link !== null;
          if (aHasLink !== bHasLink) return bHasLink ? 1 : -1;
          // Then by date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
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
  }, [searchQuery, selectedCategory, sortBy]);

  // Reset page when filters change
  const totalPages = Math.ceil(filteredGuides.length / perPage);
  const paginatedGuides = filteredGuides.slice((currentPage - 1) * perPage, currentPage * perPage);

  const clearFilters = () => {
    setSearchQuery("");
    handleCategoryChange("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Section Title */}
      <div className="viz-section-header">
        <h2 className="viz-section-title">All Guides</h2>
        <p className="viz-section-hint">Click any card to explore an interactive guide.</p>
      </div>

      {/* Filters Bar */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto 1.5rem',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Search and Category Row */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{
            flex: '1 1 280px',
            minWidth: '200px',
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                transition: 'all .2s'
              }}
              className="search-input"
            />
            <span style={{
              position: 'absolute',
              left: '.9rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
              fontSize: '1rem'
            }}>🔍</span>
          </div>

          {/* Category Filter */}
          <SearchableSelect
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="All Categories"
          />

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
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
              transition: 'all .2s'
            }}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategory !== "all" || sortBy !== "newest") && (
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
                whiteSpace: 'nowrap'
              }}
              className="clear-btn"
            >
              Clear ✕
            </button>
          )}
        </div>

        {/* Results Count */}
        <div style={{
          fontSize: '.75rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)'
        }}>
          Showing {paginatedGuides.length} of {filteredGuides.length} guides
          {' · '}{data.guides.filter(g => g.link === '#').length} upcoming
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="viz-grid">
        {paginatedGuides.map((guide, index) => (
          <GuideCard key={guide.id} guide={guide} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredGuides.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-dim)'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No guides found</p>
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
          padding: '0 1rem'
        }}>
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
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

export default function Guides() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        color: 'var(--text-dim)'
      }}>
        Loading guides...
      </div>
    }>
      <GuidesContent />
    </Suspense>
  );
}

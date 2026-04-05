"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
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

// Extract unique tags from guides
const getUniqueTags = () => {
  const tags = new Set<string>();
  data.guides.forEach(guide => {
    if (guide.tags) {
      guide.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

const ALL_CATEGORIES = getUniqueCategories();
const ALL_TAGS = getUniqueTags();

function GuidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;

  // Get category/tag from URL or default to "all"
  const selectedCategory = searchParams.get("category") || "all";
  const selectedTag = searchParams.get("tag") || "all";

  const categories = ALL_CATEGORIES;
  const tags = ALL_TAGS;

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

  // Update URL when tag changes
  const handleTagChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("tag");
    } else {
      params.set("tag", val);
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

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter(guide =>
        guide.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
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
  }, [searchQuery, selectedCategory, selectedTag, sortBy]);

  // Reset page when filters change
  const totalPages = Math.ceil(filteredGuides.length / perPage);
  const paginatedGuides = filteredGuides.slice((currentPage - 1) * perPage, currentPage * perPage);

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
      {/* Section Title */}
      <div className="viz-section-header">
        <h2 className="viz-section-title">All Guides</h2>
        <p className="viz-section-hint">Click any card to explore an interactive guide.</p>
      </div>

      {/* Filters Bar */}
      <div className="listing-filters">
        <div className="listing-filters-row">
          {/* Search Input */}
          <div className="listing-search-wrap">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="listing-search-input"
            />
            <span className="listing-search-icon">🔍</span>
          </div>

          {/* Category Filter */}
          <SearchableSelect
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="All Categories"
          />

          {/* Tag Filter */}
          <SearchableSelect
            options={tags}
            value={selectedTag}
            onChange={handleTagChange}
            placeholder="All Tags"
          />

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="listing-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategory !== "all" || selectedTag !== "all" || sortBy !== "newest") && (
            <button onClick={clearFilters} className="listing-clear-btn">
              Clear ✕
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="listing-results-count">
          Showing {paginatedGuides.length} of {filteredGuides.length} guides
          {' · '}{data.guides.filter(g => g.link === '#').length} upcoming
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {selectedTag !== "all" && ` tagged ${selectedTag}`}
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

export default function Guides() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
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

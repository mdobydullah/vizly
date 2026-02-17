"use client";

import { useState, useMemo } from "react";
import { VisualCard } from "@/components/home/VisualCard";
import visualsData from "@/data/visuals";
import { VisualsData, SortOption } from "@/types/visuals";

const data = visualsData as VisualsData;

// Extract unique categories from visuals
const getUniqueCategories = () => {
  const categories = new Set<string>();
  data.visuals.forEach(visual => {
    // Split category by "·" and take the first part for broader categories
    const mainCategory = visual.category.split('·')[0].trim();
    categories.add(mainCategory);
  });
  return Array.from(categories).sort();
};

export default function Visuals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const categories = getUniqueCategories();

  // Filter and sort visuals
  const filteredVisuals = useMemo(() => {
    let filtered = data.visuals;

    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(visual =>
        visual.title.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(visual =>
        visual.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Sort visuals
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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Section Title */}
      <div className="viz-section-header">
        <h2 className="viz-section-title">All Visuals</h2>
        <p className="viz-section-hint">Click any card to explore an animated, in-depth guide.</p>
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
        zIndex: 1
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
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
              minWidth: '160px',
              transition: 'all .2s'
            }}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

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
          Showing {filteredVisuals.length} of {data.visuals.length} visuals
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="viz-grid">
        {filteredVisuals.map((visual, index) => (
          <VisualCard key={visual.id} visual={visual} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredVisuals.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-dim)'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No visuals found</p>
          <p style={{ fontSize: '.85rem' }}>Try adjusting your search or filters</p>
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
      `}</style>
    </div>
  );
}

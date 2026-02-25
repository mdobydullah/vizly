"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { jobsData } from "@/data/jobs";
import { config } from "@/lib/config";
import "@/styles/jobs.css";

const data = jobsData;

const getUniqueCategories = () => {
    const categories = new Set<string>();
    data.jobs.forEach(job => {
        categories.add(job.category);
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
};

function JobsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 18;

    const selectedCategory = searchParams.get("category") || "all";
    const categories = getUniqueCategories();

    const handleCategoryChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") {
            params.delete("category");
        } else {
            params.set("category", val);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const filteredJobs = useMemo(() => {
        let filtered = data.jobs;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query)
            );
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(job =>
                job.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        return filtered;
    }, [searchQuery, selectedCategory]);

    const totalPages = Math.ceil(filteredJobs.length / perPage);
    const paginatedJobs = filteredJobs.slice((currentPage - 1) * perPage, currentPage * perPage);

    const clearFilters = () => {
        setSearchQuery("");
        handleCategoryChange("all");
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div className="viz-section-header">
                <h2 className="viz-section-title">Jobs</h2>
                <p className="viz-section-hint">A curated directory of top job boards, specialized platforms, and company hubs.</p>
            </div>

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
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <div style={{
                        flex: '1 1 280px',
                        minWidth: '200px',
                        position: 'relative'
                    }}>
                        <input
                            type="text"
                            placeholder="Search platform..."
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

                    <SearchableSelect
                        options={categories}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        placeholder="All Categories"
                    />

                    {(searchQuery || selectedCategory !== "all") && (
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
            </div>

            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '0 clamp(1rem, 4vw, 2rem)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '4rem'
            }}>
                {paginatedJobs.map((job) => {
                    const jobUrl = new URL(job.url);
                    jobUrl.searchParams.set('ref', config.urls.domain);

                    return (
                        <a
                            key={job.id}
                            href={jobUrl.toString()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="job-card"
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '.65rem',
                                    letterSpacing: '.1em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--cyan)',
                                    marginBottom: '.5rem'
                                }}>
                                    {job.category}
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    fontSize: '1.2rem',
                                    color: 'var(--text-hi)',
                                    marginBottom: '.5rem',
                                    lineHeight: 1.2
                                }}>
                                    {job.title}
                                </h3>
                                <p style={{
                                    fontSize: '.85rem',
                                    color: 'var(--text-dim)',
                                    lineHeight: 1.5,
                                    margin: 0
                                }}>
                                    {job.description}
                                </p>
                            </div>
                            <div className="job-arrow">
                                ↗
                            </div>
                        </a>
                    )
                })}
            </div>

            {filteredJobs.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-dim)'
                }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No jobs found</p>
                    <p style={{ fontSize: '.85rem' }}>Try adjusting your search or filters</p>
                </div>
            )}

            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '.5rem',
                    margin: '2rem auto 3rem',
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
            {/* Contribute Link */}
            <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                paddingBottom: '2rem'
            }}>
                <a
                    href={`${config.urls.githubRepo}/tree/main/src/data/jobs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: '.85rem',
                        color: 'var(--text-dim)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        transition: 'color .2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                    <span>Add more platforms</span>
                    <span style={{ fontSize: '1rem' }}>↗</span>
                </a>
            </div>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                color: 'var(--text-dim)'
            }}>
                Loading jobs...
            </div>
        }>
            <JobsContent />
        </Suspense>
    );
}

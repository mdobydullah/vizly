"use client";

import { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchableSelect = ({
    options,
    value,
    onChange,
    className
}: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync search state when closing
    useEffect(() => {
        if (!isOpen) setSearch("");
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                minWidth: '180px',
                flex: '1 1 180px',
                maxWidth: '300px'
            }}
            className={className}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                    if (e.key === 'Escape' && isOpen) {
                        setIsOpen(false);
                    }
                }}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                style={{
                    width: '100%',
                    padding: '.7rem 1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '.85rem',
                    transition: 'all .2s',
                    borderColor: isOpen ? 'var(--cyan)' : 'var(--border)',
                    boxShadow: isOpen ? '0 0 0 2px rgba(0, 229, 255, 0.1)' : 'none',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    outline: 'none'
                }}
                className="select-trigger"
            >
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginRight: '.5rem'
                }}>
                    {value === "all" ? "All Categories" : value}
                </span>
                <span style={{
                    fontSize: '.7rem',
                    opacity: 0.7,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .2s'
                }}>▼</span>
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        zIndex: 100,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        maxHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'fadeUp .2s ease-out'
                    }}
                >
                    <div style={{
                        padding: '.6rem',
                        borderBottom: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                }
                            }}
                            placeholder="Search category..."
                            style={{
                                width: '100%',
                                padding: '.5rem .8rem',
                                border: '1px solid var(--border2)',
                                borderRadius: '8px',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                fontSize: '.8rem',
                                outline: 'none',
                                fontFamily: 'var(--font-body)'
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div style={{
                        overflowY: 'auto',
                        padding: '.3rem'
                    }}>
                        <div
                            onClick={() => { onChange("all"); setIsOpen(false); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onChange("all");
                                    setIsOpen(false);
                                }
                            }}
                            tabIndex={0}
                            role="option"
                            aria-selected={value === "all"}
                            style={{
                                padding: '.6rem .8rem',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                fontSize: '.85rem',
                                color: value === "all" ? 'var(--cyan)' : 'var(--text)',
                                background: value === "all" ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
                                transition: 'all .15s'
                            }}
                            className="option-item"
                        >
                            All Categories
                        </div>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            onChange(opt);
                                            setIsOpen(false);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="option"
                                    aria-selected={value === opt}
                                    style={{
                                        padding: '.6rem .8rem',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        fontSize: '.85rem',
                                        color: value === opt ? 'var(--cyan)' : 'var(--text)',
                                        background: value === opt ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
                                        transition: 'all .15s'
                                    }}
                                    className="option-item"
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: '1.5rem 1rem',
                                textAlign: 'center',
                                color: 'var(--text-dim)',
                                fontSize: '.8rem'
                            }}>
                                No categories found
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        .option-item:hover {
          background: var(--surface2) !important;
          color: var(--text-hi) !important;
        }
        
        .select-trigger:focus {
          border-color: var(--cyan);
          box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.1);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

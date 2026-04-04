"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowLeft, ArrowRight, Calendar, Clock, Sun, Moon } from 'lucide-react';
import { ArticleFrontmatter } from '@/types/articles';
import { getColorConfig } from '@/lib/article-colors';

interface ArticleLayoutProps {
  article: ArticleFrontmatter;
  children: React.ReactNode;
  prevArticle?: { slug: string; title: string } | null;
  nextArticle?: { slug: string; title: string } | null;
}

export function ArticleLayout({
  article,
  children,
  prevArticle,
  nextArticle,
}: Readonly<ArticleLayoutProps>) {
  const router = useRouter();
  const colorConfig = getColorConfig(article.color);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('article-theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('article-theme', theme);
  }, [theme]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="article-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
      {/* Header — outside the panel */}
      <div className="article-header">
          {/* Category */}
          <button
            onClick={() => router.push(`/articles?category=${article.category}`)}
            style={{
              fontSize: '.75rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-hero)',
              fontWeight: 800,
              color: colorConfig.primary,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'opacity .2s',
              marginBottom: '.5rem',
            }}
          >
            {article.category}
          </button>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-hero)',
            fontSize: 'clamp(2rem, 6vw, 2.75rem)',
            fontWeight: 900,
            color: 'var(--text-hi)',
            letterSpacing: '-.04em',
            lineHeight: 1.1,
            maxWidth: '800px',
            margin: '0 auto .75rem',
          }}>
            {article.title}
          </h1>

          {/* Meta row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            marginBottom: '.75rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <Calendar size={13} />
              {formattedDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <Clock size={13} />
              {article.readTime}
            </span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '.5rem',
              marginBottom: '.75rem',
            }}>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  onClick={() => router.push(`/articles?tag=${encodeURIComponent(tag)}`)}
                  style={{
                    fontSize: '.6rem',
                    fontFamily: 'var(--font-mono)',
                    color: colorConfig.primary,
                    background: `${colorConfig.primary}15`,
                    padding: '.15rem .5rem',
                    borderRadius: '4px',
                    border: `1px solid ${colorConfig.primary}30`,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p style={{
            fontSize: 'clamp(.9rem, 2vw, 1rem)',
            color: 'var(--text-dim)',
            lineHeight: 1.6,
            fontFamily: 'var(--font-hero)',
            maxWidth: '750px',
            margin: '.5rem auto 0',
          }}>
            {article.description}
          </p>
      </div>

      {/* Reading Panel */}
      <div className={`article-reading-panel article-theme-${theme}`}>
        <article className="article-content">
          {children}
        </article>
      </div>

      {/* Series Navigation */}
      {(prevArticle || nextArticle) && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          margin: '3rem 0 2rem',
          flexWrap: 'wrap',
        }}>
          {prevArticle && (
            <button
              onClick={() => router.push(`/articles/${prevArticle.slug}`)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .2s',
                fontFamily: 'var(--font-body)',
              }}
              className="nav-btn"
            >
              <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '.3rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <ArrowLeft size={12} /> Previous
              </div>
              <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{prevArticle.title}</div>
            </button>
          )}
          {nextArticle && (
            <button
              onClick={() => router.push(`/articles/${nextArticle.slug}`)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'all .2s',
                fontFamily: 'var(--font-body)',
              }}
              className="nav-btn"
            >
              <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '.3rem', display: 'flex', alignItems: 'center', gap: '.3rem', justifyContent: 'flex-end' }}>
                Next <ArrowRight size={12} />
              </div>
              <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{nextArticle.title}</div>
            </button>
          )}
        </div>
      )}

      {/* Floating controls */}
      {mounted && createPortal(
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '.5rem',
          zIndex: 9999,
        }}>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: theme === 'light' ? '#1a1f2b' : '#f8f7f4',
              border: 'none',
              color: theme === 'light' ? '#f8f7f4' : '#1a1f2b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Scroll to top */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: colorConfig.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: showScrollTop ? 1 : 0,
              visibility: showScrollTop ? 'visible' : 'hidden',
              transform: showScrollTop ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <ArrowUp size={18} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

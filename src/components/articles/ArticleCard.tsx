"use client";

import Link from "next/link";
import { ArticleFrontmatter } from "@/types/articles";
import { getColorConfig } from "@/lib/article-colors";

interface ArticleCardProps {
  article: ArticleFrontmatter;
  index: number;
}

export function ArticleCard({ article, index }: Readonly<ArticleCardProps>) {
  const animationDelay = `.${index + 1}s`;
  const colorConfig = getColorConfig(article.color);

  return (
    <Link
      href={`/articles/${article.slug}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.4rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        animation: `fadeUp .5s ease ${animationDelay} both`,
        transition: 'all .3s ease',
      }}
      className={`article-card card-${article.color}`}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        marginBottom: '1rem',
        background: colorConfig.background,
        border: `1px solid ${colorConfig.border}`,
        transition: 'all .3s ease',
      }}
        className="card-icon"
      >
        {article.icon}
      </div>

      <div style={{
        fontSize: '.65rem',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
        color: colorConfig.primary,
        marginBottom: '.5rem',
        opacity: .8,
      }}>
        {article.category}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--text-hi)',
        marginBottom: '.5rem',
        lineHeight: 1.25,
      }}>
        {article.title}
      </div>

      <div style={{
        fontSize: '.78rem',
        color: 'var(--text-dim)',
        lineHeight: 1.6,
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '3.8em',
      }}>
        {article.description}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '.7rem',
        color: 'var(--text-dim)',
      }}>
        <span>{article.readTime}</span>
        <div
          className="card-arrow"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: `1px solid ${colorConfig.primary}`,
            color: colorConfig.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '.7rem',
            transition: 'all .3s ease',
          }}
        >
          ↗
        </div>
      </div>

      <style jsx>{`
        .article-card {
          transition: all .3s ease;
        }
        .article-card:hover {
          transform: translateY(-4px);
          border-color: ${colorConfig.primary} !important;
          box-shadow: ${colorConfig.hoverShadow} !important;
          background: linear-gradient(135deg, ${colorConfig.primary}08 0%, ${colorConfig.primary}03 50%, transparent 100%);
        }
        .article-card:hover .card-arrow {
          background: ${colorConfig.primary};
          color: #000;
          transform: scale(1.1);
        }
        .article-card:hover :global(.card-icon) {
          background: ${colorConfig.primary}20 !important;
          border-color: ${colorConfig.primary}40 !important;
          transform: scale(1.05);
        }
      `}</style>
    </Link>
  );
}

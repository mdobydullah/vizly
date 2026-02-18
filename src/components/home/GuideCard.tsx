"use client";

import Link from "next/link";
import { Guide } from "@/types/guides";

interface GuideCardProps {
  guide: Guide;
  index: number;
}

export function GuideCard({ guide, index }: Readonly<GuideCardProps>) {
  const animationDelay = `.${index + 1}s`;

  const isUpcoming = guide.link === '#' || guide.link === null;

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.4rem',
    cursor: isUpcoming ? 'not-allowed' : 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    animation: `fadeUp .5s ease ${animationDelay} both`,
    opacity: isUpcoming ? 0.6 : 1,
    filter: isUpcoming ? 'grayscale(0.4)' : 'none',
    transition: 'all .3s ease'
  };

  const cardContent = (
    <>
      {isUpcoming && (
        <div style={{
          position: 'absolute' as const,
          top: '12px',
          right: '12px',
          padding: '.25rem .5rem',
          background: 'var(--text-dim)',
          color: 'var(--surface)',
          fontFamily: 'var(--font-mono)',
          fontSize: '.65rem',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '.05em',
          borderRadius: '4px',
          zIndex: 10,
        }}>
          Upcoming
        </div>
      )}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        marginBottom: '1rem',
        background: guide.colorConfig.background,
        border: `1px solid ${guide.colorConfig.border}`,
        transition: 'all .3s ease'
      }}
        className="card-icon"
      >
        {guide.icon}
      </div>

      <div style={{
        fontSize: '.65rem',
        letterSpacing: '.1em',
        textTransform: 'uppercase' as const,
        fontFamily: 'var(--font-mono)',
        color: guide.colorConfig.primary,
        marginBottom: '.5rem',
        opacity: .8
      }}>
        {guide.category}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--text-hi)',
        marginBottom: '.5rem',
        lineHeight: 1.25
      }}>
        {guide.title}
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
        minHeight: '3.8em' // Optional: keep cards consistent if one has less text
      }}>
        {guide.description}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '.7rem',
        color: 'var(--text-dim)'
      }}>
        <span>
          {guide.contributors && guide.contributors.length > 0
            ? `by ${guide.contributors[0].name}`
            : guide.readTime
          }
        </span>
        <div
          className="card-arrow"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: `1px solid ${guide.colorConfig.primary}`,
            color: guide.colorConfig.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '.7rem',
            transition: 'all .3s ease'
          }}
        >
          ↗
        </div>
      </div>

      <style jsx>{`
        .viz-card {
          transition: all .3s ease;
          position: relative;
        }
        
        .viz-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: var(--radius);
          background: ${guide.colorConfig.primary};
          opacity: 0;
          transition: opacity .3s ease;
          pointer-events: none;
          z-index: -1;
        }
        
        .viz-card:hover {
          transform: translateY(-4px);
          border-color: ${guide.colorConfig.primary} !important;
          box-shadow: ${guide.colorConfig.hoverShadow} !important;
          background: linear-gradient(
            135deg,
            ${guide.colorConfig.primary}08 0%,
            ${guide.colorConfig.primary}03 50%,
            transparent 100%
          );
        }
        
        .viz-card:hover::before {
          opacity: 0.03;
        }
        
        .viz-card:hover .card-arrow {
          background: ${guide.colorConfig.primary};
          color: #000;
          transform: scale(1.1);
        }
        
        .viz-card:hover :global(.card-icon) {
          background: ${guide.colorConfig.primary}20 !important;
          border-color: ${guide.colorConfig.primary}40 !important;
          transform: scale(1.05);
        }
      `}</style>
    </>
  );

  if (guide.link.startsWith('#')) {
    return (
      <div style={cardStyle} className={`viz-card card-${guide.color}`}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={guide.link} style={cardStyle} className={`viz-card card-${guide.color}`}>
      {cardContent}
    </Link>
  );
}

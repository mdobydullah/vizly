"use client";

import { Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_CONFIG = {
  info: { icon: Info, cssVar: '--cyan', label: 'Info' },
  warning: { icon: AlertTriangle, cssVar: '--yellow', label: 'Warning' },
  tip: { icon: Lightbulb, cssVar: '--green', label: 'Tip' },
  success: { icon: CheckCircle, cssVar: '--green', label: 'Success' },
};

export function Callout({ type = 'info', title, children }: Readonly<CalloutProps>) {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;
  const color = `var(${config.cssVar})`;

  return (
    <div className="article-callout" style={{
      background: `color-mix(in srgb, ${color} 5%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 'var(--radius)',
      padding: '1rem 1.2rem',
      margin: '1.5rem 0',
      fontSize: '.9rem',
      lineHeight: 1.7,
      color: 'inherit',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
        marginBottom: '.5rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.05em',
        color,
      }}>
        <Icon size={16} />
        {title || config.label}
      </div>
      <div>{children}</div>
    </div>
  );
}

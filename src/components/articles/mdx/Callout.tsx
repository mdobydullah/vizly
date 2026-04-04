"use client";

import { Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_CONFIG = {
  info: { icon: Info, color: 'var(--cyan)', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'var(--yellow)', label: 'Warning' },
  tip: { icon: Lightbulb, color: 'var(--green)', label: 'Tip' },
  success: { icon: CheckCircle, color: 'var(--green)', label: 'Success' },
};

export function Callout({ type = 'info', title, children }: Readonly<CalloutProps>) {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;

  return (
    <div style={{
      background: `${config.color}08`,
      border: `1px solid ${config.color}30`,
      borderLeft: `3px solid ${config.color}`,
      borderRadius: 'var(--radius)',
      padding: '1rem 1.2rem',
      margin: '1.5rem 0',
      fontSize: '.9rem',
      lineHeight: 1.7,
      color: 'var(--text)',
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
        color: config.color,
      }}>
        <Icon size={16} />
        {title || config.label}
      </div>
      <div>{children}</div>
    </div>
  );
}

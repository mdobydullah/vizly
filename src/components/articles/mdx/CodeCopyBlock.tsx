"use client";

import React, { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Drop-in replacement for `pre` in article MDX: wraps the code block and
// adds a copy button in the top-right corner.
export function CodeCopyBlock(props: Readonly<React.HTMLAttributes<HTMLPreElement>>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = preRef.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div style={{ position: 'relative' }}>
      <pre ref={preRef} {...props} />
      <button
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        style={{
          position: 'absolute',
          top: '.6rem',
          right: '.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.35rem',
          padding: '.35rem .6rem',
          borderRadius: '8px',
          border: '1px solid #2d333b',
          background: 'rgba(255, 255, 255, .06)',
          color: copied ? 'var(--green)' : '#9aa7b4',
          fontFamily: 'var(--font-mono)',
          fontSize: '.68rem',
          fontWeight: 700,
          cursor: 'pointer',
          opacity: 0.85,
          transition: 'color .15s, opacity .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

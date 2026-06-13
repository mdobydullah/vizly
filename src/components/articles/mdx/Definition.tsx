"use client";

import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { langLabel, isRtl, LANG_STORAGE_KEY } from './lang';

interface DefinitionProps {
  /** The headword. Auto-bolded wherever it appears in the text. */
  term?: string;
  /** Map of lang code -> definition text. `**x**` renders bold. */
  langs: Record<string, string>;
}

// Render plain text with **bold** spans, and auto-bold the term.
function renderText(text: string, term?: string): React.ReactNode {
  let src = text;
  // Wrap the first occurrence of the term in ** ** if not already marked.
  if (term && !src.includes('**')) {
    const idx = src.toLowerCase().indexOf(term.toLowerCase());
    if (idx !== -1) {
      src = src.slice(0, idx) + '**' + src.slice(idx, idx + term.length) + '**' + src.slice(idx + term.length);
    }
  }
  const parts = src.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export function Definition({ term, langs }: Readonly<DefinitionProps>) {
  const safeLangs = langs ?? {};
  const codes = Object.keys(safeLangs);
  const [activeLang, setActiveLang] = useState<string>(codes[0] ?? 'en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && safeLangs[saved]) setActiveLang(saved);
    } catch {}
  }, [safeLangs]);

  const pickLang = (lang: string) => {
    setActiveLang(lang);
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch {}
  };

  if (codes.length === 0) return null;

  const text = safeLangs[activeLang] ?? safeLangs[codes[0]];
  const rtl = isRtl(activeLang);

  return (
    <div
      className="article-definition"
      style={{
        border: '1px solid color-mix(in srgb, var(--cyan) 25%, transparent)',
        background: 'color-mix(in srgb, var(--cyan) 6%, transparent)',
        borderRadius: '12px',
        margin: '1.5rem 0',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '.9rem 1.1rem 1.1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.55rem',
            marginBottom: '.9rem',
            paddingBottom: '.75rem',
            borderBottom: '1px solid color-mix(in srgb, var(--cyan) 18%, transparent)',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              color: 'var(--cyan)',
            }}
          >
            <Globe size={14} />
            Definition
          </span>

          {codes.length > 1 && (
            <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginLeft: 'auto' }}>
              {codes.map(code => {
                const active = code === activeLang;
                return (
                  <button
                    key={code}
                    role="tab"
                    aria-selected={active}
                    onClick={() => pickLang(code)}
                    style={{
                      padding: '.35rem .75rem',
                      borderRadius: '999px',
                      border: `1px solid ${active ? 'var(--cyan)' : 'var(--border)'}`,
                      background: active ? 'color-mix(in srgb, var(--cyan) 14%, transparent)' : 'transparent',
                      color: active ? 'var(--cyan)' : 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '.72rem',
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {langLabel(code)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            margin: 0,
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--text)',
            textAlign: rtl ? 'right' : 'left',
          }}
        >
          {renderText(text, term)}
        </p>
      </div>
    </div>
  );
}

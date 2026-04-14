"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  bn: 'বাংলা',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  ur: 'اردو',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
};

const RTL_LANGS = new Set(['ar', 'ur', 'fa', 'he']);

interface StorySummaryProps {
  summary: Record<string, string>;
  primaryColor: string;
}

export function StorySummary({ summary, primaryColor }: Readonly<StorySummaryProps>) {
  const langs = Object.keys(summary);
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<string>(langs[0] ?? 'en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vizly-story-lang');
      if (saved && summary[saved]) setActiveLang(saved);
    } catch {}
  }, [summary]);

  const pickLang = (lang: string) => {
    setActiveLang(lang);
    try { localStorage.setItem('vizly-story-lang', lang); } catch {}
  };

  if (langs.length === 0) return null;

  const text = summary[activeLang] ?? summary[langs[0]];
  const isRtl = RTL_LANGS.has(activeLang);

  return (
    <div
      className="story-summary"
      style={{
        border: `1px solid color-mix(in srgb, ${primaryColor} 25%, transparent)`,
        background: `color-mix(in srgb, ${primaryColor} 6%, transparent)`,
        borderRadius: '12px',
        margin: '0 0 2rem',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '.75rem',
          padding: '.9rem 1.1rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-hi)',
          fontFamily: 'var(--font-hero)',
          fontSize: '.9rem',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
          <Globe size={16} style={{ color: primaryColor }} />
          Story summary ({langs.length} {langs.length === 1 ? 'language' : 'languages'})
        </span>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--text-dim)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 1.1rem 1.1rem' }}>
          <div
            role="tablist"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '.4rem',
              marginBottom: '.9rem',
              paddingBottom: '.75rem',
              borderBottom: `1px solid color-mix(in srgb, ${primaryColor} 18%, transparent)`,
            }}
          >
            {langs.map(lang => {
              const active = lang === activeLang;
              return (
                <button
                  key={lang}
                  role="tab"
                  aria-selected={active}
                  onClick={() => pickLang(lang)}
                  style={{
                    padding: '.35rem .75rem',
                    borderRadius: '999px',
                    border: `1px solid ${active ? primaryColor : 'var(--border)'}`,
                    background: active ? `color-mix(in srgb, ${primaryColor} 14%, transparent)` : 'transparent',
                    color: active ? primaryColor : 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.72rem',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {LANG_LABELS[lang] ?? lang.toUpperCase()}
                </button>
              );
            })}
          </div>
          <p
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              margin: 0,
              fontFamily: 'var(--font-hero)',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

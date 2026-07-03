"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Eye, ListChecks } from 'lucide-react';
import { questionsData } from '@/data/questions';
import { PracticeQuestion, QuestionDifficulty } from '@/types/questions';
import { CodeCopyBlock } from './CodeCopyBlock';

interface QuestionListProps {
  /** Question set slug, e.g. "python-fundamentals/python-variables-types". */
  quiz: string;
}

const DIFFICULTY_COLOR: Record<QuestionDifficulty, string> = {
  easy: 'var(--green)',
  medium: 'var(--yellow)',
  hard: 'var(--red)',
};

// Plain text with **bold** spans, paragraphs split on \n\n.
function renderAnswerText(text: string): React.ReactNode {
  return text.split(/\n\n+/).map((para, pi) => (
    <p key={pi} style={{ margin: '0 0 .85rem', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--text)' }}>
      {para.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-hi)' }}>{part.slice(2, -2)}</strong>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </p>
  ));
}

function CodeBlock({ code, label, accent }: Readonly<{ code: string; label: string; accent?: string }>) {
  return (
    <div style={{ margin: '0 0 1rem' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          color: accent ?? 'var(--text-dim)',
          marginBottom: '.35rem',
        }}
      >
        {label}
      </div>
      {/* Code blocks stay dark in both themes, matching .article-content pre */}
      <CodeCopyBlock
        style={{
          margin: 0,
          padding: '.85rem 1rem',
          background: '#1a1f2b',
          border: '1px solid #2d333b',
          borderRadius: '10px',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '.82rem',
          lineHeight: 1.6,
          color: '#e6edf3',
        }}
      >
        <code style={{ color: 'inherit', background: 'transparent', fontFamily: 'inherit' }}>{code}</code>
      </CodeCopyBlock>
    </div>
  );
}

export function QuestionList({ quiz }: Readonly<QuestionListProps>) {
  const set = questionsData[quiz];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const close = useCallback(() => {
    setOpenIndex(null);
    setShowAnswer(false);
  }, []);

  const goTo = useCallback((index: number) => {
    setOpenIndex(index);
    setShowAnswer(false);
  }, []);

  // Escape to close + body scroll lock while the drawer is open.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close]);

  if (!set) {
    return (
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          fontSize: '.85rem',
        }}
      >
        Question set “{quiz}” not found.
      </div>
    );
  }

  const questions = set.questions;
  const current: PracticeQuestion | null = openIndex === null ? null : questions[openIndex];

  return (
    <div className="article-question-list">
      {/* List */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          margin: '1.5rem 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            padding: '.8rem 1rem',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.05em',
            color: 'var(--green)',
          }}
        >
          <ListChecks size={14} />
          {questions.length} drills. Predict first, then open the answer
        </div>

        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => goTo(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.75rem',
              width: '100%',
              padding: '.85rem 1rem',
              background: i % 2 === 1 ? 'color-mix(in srgb, var(--text) 3%, transparent)' : 'transparent',
              border: 'none',
              borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none',
              color: 'var(--text)',
              fontSize: '.95rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--green) 8%, transparent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 1 ? 'color-mix(in srgb, var(--text) 3%, transparent)' : 'transparent'; }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '.85rem', minWidth: '1.6rem' }}>
              {i + 1}.
            </span>
            <span style={{ flex: 1 }}>{q.question}</span>
            {q.difficulty && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.05em',
                  color: DIFFICULTY_COLOR[q.difficulty],
                  border: `1px solid color-mix(in srgb, ${DIFFICULTY_COLOR[q.difficulty]} 40%, transparent)`,
                  background: `color-mix(in srgb, ${DIFFICULTY_COLOR[q.difficulty]} 8%, transparent)`,
                  borderRadius: '999px',
                  padding: '.2rem .6rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {q.difficulty}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Drawer — portaled to <body> so .article-content CSS (e.g. pre !important) can't leak in */}
      {current && createPortal(
        <>
          <div
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
              backdropFilter: 'blur(3px)',
              animation: 'qlFadeIn .18s ease',
            }}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Question ${openIndex! + 1}: ${current.question}`}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              zIndex: 9999,
              height: '100dvh',
              width: 'min(520px, 100vw)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-18px 0 48px rgba(0,0,0,.35)',
              animation: 'qlSlideIn .22s ease',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.6rem',
                padding: '.9rem 1.1rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', color: 'var(--text-dim)' }}>
                {openIndex! + 1} / {questions.length}
              </span>
              {current.difficulty && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    color: DIFFICULTY_COLOR[current.difficulty],
                  }}
                >
                  {current.difficulty}
                </span>
              )}
              <button
                onClick={close}
                aria-label="Close sidebar"
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.4rem',
                  padding: '.45rem .85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border2)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
                Close
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--text-hi)' }}>
                {current.question}
              </h3>

              {current.code && <CodeBlock code={current.code} label="Predict first" />}

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    padding: '.6rem 1.1rem',
                    borderRadius: '10px',
                    border: '1px solid color-mix(in srgb, var(--green) 45%, transparent)',
                    background: 'color-mix(in srgb, var(--green) 10%, transparent)',
                    color: 'var(--green)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Eye size={15} />
                  Show answer
                </button>
              ) : (
                <div
                  style={{
                    border: '1px solid color-mix(in srgb, var(--green) 25%, transparent)',
                    background: 'color-mix(in srgb, var(--green) 5%, transparent)',
                    borderRadius: '12px',
                    padding: '1rem 1.1rem',
                    animation: 'qlFadeIn .18s ease',
                  }}
                >
                  {current.answer.output && (
                    <CodeBlock code={current.answer.output} label="Output" accent="var(--green)" />
                  )}
                  {current.answer.code && (
                    <CodeBlock code={current.answer.code} label="Solution" accent="var(--green)" />
                  )}
                  {renderAnswerText(current.answer.text)}
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div
              style={{
                display: 'flex',
                gap: '.6rem',
                padding: '.9rem 1.1rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => goTo(openIndex! - 1)}
                disabled={openIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.35rem',
                  padding: '.55rem .95rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: openIndex === 0 ? 'var(--text-dim)' : 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.78rem',
                  cursor: openIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: openIndex === 0 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <button
                onClick={() => goTo(openIndex! + 1)}
                disabled={openIndex === questions.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.35rem',
                  marginLeft: 'auto',
                  padding: '.55rem .95rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: openIndex === questions.length - 1 ? 'var(--text-dim)' : 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.78rem',
                  cursor: openIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: openIndex === questions.length - 1 ? 0.5 : 1,
                }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </aside>

          <style jsx global>{`
            @keyframes qlFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes qlSlideIn {
              from { transform: translateX(40px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </>,
        document.body
      )}
    </div>
  );
}

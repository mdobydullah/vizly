"use client";

import { useEffect, useRef, useState, useId, type ReactNode } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

interface MermaidBlockProps {
  chart?: string;
  primaryColor?: string;
  children?: ReactNode;
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

export function MermaidBlock({ chart, primaryColor = '#b985f4', children }: Readonly<MermaidBlockProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const instanceId = useId().replaceAll(':', '-');

  const chartContent = (chart || extractText(children)).replaceAll(String.raw`\n`, '\n');

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Space Mono, monospace',
        themeVariables: {
          primaryColor: primaryColor,
          primaryTextColor: '#fff',
          primaryBorderColor: primaryColor,
          lineColor: '#5a6a7e',
          secondaryColor: '#b985f4',
          tertiaryColor: '#3effa3',
        },
      });
      mermaidInitialized = true;
    }

    if (!chartContent) return;

    const id = `mermaid${instanceId}`;
    mermaid.render(id, chartContent.trim()).then(({ svg }) => {
      setSvg(svg);
    }).catch((err) => {
      console.error('MermaidBlock render error:', err);
    });
  }, [chartContent, primaryColor, instanceId]);

  return (
    <div
      ref={containerRef}
      style={{
        margin: '1.5rem 0',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'auto',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

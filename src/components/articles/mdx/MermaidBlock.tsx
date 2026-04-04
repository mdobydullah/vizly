"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  chart: string;
  primaryColor?: string;
}

export function MermaidBlock({ chart, primaryColor = 'var(--purple)' }: Readonly<MermaidBlockProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'var(--font-mono)',
      themeVariables: {
        primaryColor: primaryColor,
        primaryTextColor: '#fff',
        primaryBorderColor: primaryColor,
        lineColor: '#5a6a7e',
        secondaryColor: '#b985f4',
        tertiaryColor: '#3effa3',
      },
    });

    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, chart).then(({ svg }) => {
      setSvg(svg);
    });
  }, [chart, primaryColor]);

  return (
    <div
      ref={ref}
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

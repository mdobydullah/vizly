# Vizly — Learn Through Visuals

Interactive visual guides and articles about system design, security, AI, and engineering concepts.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript, React 19
- **Styling**: Vanilla CSS with CSS variables (no Tailwind classes in components)
- **Visualization**: D3.js, Mermaid, Markmap
- **Content**: Guides are React components; Articles are MDX files

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── guides/             # Interactive visual guides
│   ├── articles/           # MDX-based blog articles
│   └── api/                # API routes
├── components/
│   ├── guides/             # Guide components (one per topic)
│   ├── articles/           # Article components (layout, card, MDX components)
│   └── layout/             # Header, Footer, GuideLayout
├── content/articles/       # MDX article files organized by category slug
├── data/
│   ├── guides/             # Guide metadata JSON files
│   └── articles/           # categories.json + series/*.json
├── styles/                 # CSS files (global + per-topic + guide-cards.css for shared concept cards)
├── types/                  # TypeScript interfaces
└── lib/                    # Utilities (config, article loading, colors)
```

## Commands
- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npm run lint` — ESLint

## Key Rules (see `.claude/rules/` for details)
1. **Architecture** — Guides: React components + JSON metadata. Articles: MDX + frontmatter.
2. **UI Standards** — Dark/light theme via CSS variables, no Tailwind. Use global utility classes first. Light mode updates only (dark mode is stable).
3. **Guide Spec** — Interactive cards, mermaid diagrams, animated flows, playback controls.
4. **Article Writing** — Human-friendly, NOT AI-sounding, conversational tone, easy examples, visual-first. Update `.docs/articles-ai-learning-plan.md` status after each article.
5. **Theme System** — Global `[data-theme]` attribute on `<html>`. Use CSS variables, never hardcode colors. Light mode: `#f0eee6` bg, white cards, soft shadows. See Rule 02 §1 and Rule 05.

## Content Systems

### Guides (React components)
- Component: `src/components/guides/[category]/[Topic]Guide.tsx`
- Metadata: `src/data/guides/[category]/[category].json`
- Auto-discovered via webpack `require.context`

### Articles (MDX files)
- Content: `src/content/articles/[category-slug]/[order]-[slug].mdx`
- Categories: `src/data/articles/categories.json` (add new topics here, no code changes)
- Series: `src/data/articles/series/[series-slug].json` (defines article order + planned titles)
- Rendered via `next-mdx-remote` with custom components (Callout, MermaidBlock)
- Series nav auto-shows on articles that have `series` in frontmatter, collapsible if >3 articles

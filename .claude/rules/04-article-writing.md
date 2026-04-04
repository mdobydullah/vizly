# Rule 04: Article Writing Standards

## 1. Tone & Style
- **Human-friendly language**: Use very easy words and simple examples. A complete newcomer should understand easily.
- **Must NOT sound AI-written**: Avoid generic patterns like "Let's dive in", "In this article we will explore", "without further ado", overly polished transitions, or bullet-heavy listicles.
- **Conversational**: Write like explaining to a friend. Use "you" and "I". Short sentences. Occasional humor. Vary sentence length.
- **Storytelling over listing**: Prefer narratives and analogies over dry bullet points. Use everyday analogies (training a dog, studying for an exam, sorting laundry).

## 2. Structure
- **Short paragraphs**: 2-4 sentences max. White space is your friend.
- **Punchy standalone sentences**: "But there's a problem." on its own line hits harder than buried in a paragraph.
- **Headers as questions**: "So... what is AI, really?" is better than "Definition of Artificial Intelligence".
- **Progressive complexity**: Start dead simple, build up. Never assume prior knowledge.
- **End with a teaser**: Briefly mention what the next article covers to keep readers hooked.

## 3. Visuals
- **Mermaid diagrams**: For flowcharts, architecture, relationships. Use `<MermaidBlock>` component (see §3b).
- **Callout boxes**: For key takeaways and important notes. Use `<Callout>` component with types: `info`, `tip`, `warning`, `success`.
- **Tables**: For comparisons and structured data. Keep them simple.
- **Code blocks**: Only when showing actual code examples. Use sparingly.

### 3b. MermaidBlock Syntax in MDX — REQUIRED
MDX has strict rules for how components receive props. Follow this exact pattern:
```mdx
<MermaidBlock>
graph TB
    A["Label line 1\nline 2"] --> B["Other node"]
    style A fill:#1a1f2b,stroke:#b985f4,color:#fff
</MermaidBlock>
```
**Rules:**
- Use **plain text children** — NOT `chart={...}` prop, NOT `` {`...`} `` expression wrappers.
- Use `\n` for line breaks in node labels — NOT `<br/>` (MDX parses those as HTML).
- No `&` in labels — use "and" instead (MDX treats `&` as HTML entity start).
- No `$` or commas in numbers — use `285k` not `$285,000`.
- No emojis in node labels (can cause encoding issues in some renderers).
- Use solid dark fills with bright strokes: `fill:#1a1f2b,stroke:#b985f4,color:#fff`.

## 4. Article File Conventions
- **Location**: `src/content/articles/[category-slug]/[order]-[slug].mdx`
- **Frontmatter**: Must include all fields defined in `src/types/articles.ts` (ArticleFrontmatter).
- **Category slugs**: Must match entries in `src/data/articles/categories.json`.
- **Series**: If the article belongs to a series, set `series` and `seriesOrder` in frontmatter. The series must be defined in `src/data/articles/series/[series-slug].json`.
- **After writing**: Update `.docs/plans/articles-ai-learning-plan.md` — change status from `TODO` to `DONE`.

## 4b. Series System
- **Definition**: `src/data/articles/series/[slug].json` — contains title, description, icon, color, and ordered list of articles (including planned/unpublished ones).
- **Adding a new series**: Create a new JSON file in `src/data/articles/series/`. No code changes needed.
- **SeriesNav component**: Auto-renders at the top of articles that have a `series` field. Shows first 3 articles collapsed, expandable to show all. Current article highlighted, unpublished ones marked "soon".
- **Frontmatter link**: The article's `series` field must match the series JSON filename (e.g., `series: ai-fundamentals` matches `ai-fundamentals.json`).

## 5. Common Mistakes to Avoid in Articles

### Frontmatter
- **Dates must be full ISO 8601**: Always use `"2026-04-04T09:00:00Z"`, never bare dates like `"2026-04-04"`. Rule 01 §5 applies to articles too.

### Mermaid Diagrams
- **No hex+alpha fills**: Never use `fill:#b985f420` — the trailing alpha (`20`) is not reliably supported. Use solid dark fills with bright strokes: `fill:#1a1f2b,stroke:#b985f4,color:#fff`.

### Content
- **Avoid time-relative references that age badly**: Don't write "70 years" or "in the last few years." Use "decades" or anchor to a specific date. The article should read correctly a year from now.
- **Keep timelines current**: If including a year-by-year table, include the current year.

## 6. What to Avoid
- Jargon without explanation
- Long unbroken walls of text
- Starting paragraphs with "It is important to note that..."
- Summarizing what you just said ("As we discussed above...")
- Overly formal academic tone
- Filler content that doesn't teach anything new

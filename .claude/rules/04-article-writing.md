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
- **Mermaid diagrams**: For flowcharts, architecture, relationships. Use `<MermaidBlock>` component.
- **Callout boxes**: For key takeaways and important notes. Use `<Callout>` component with types: `info`, `tip`, `warning`, `success`.
- **Tables**: For comparisons and structured data. Keep them simple.
- **Code blocks**: Only when showing actual code examples. Use sparingly.

## 4. Article File Conventions
- **Location**: `src/content/articles/[category-slug]/[order]-[slug].mdx`
- **Frontmatter**: Must include all fields defined in `src/types/articles.ts` (ArticleFrontmatter).
- **Category slugs**: Must match entries in `src/data/articles/categories.json`.
- **Series**: If the article belongs to a series, set `series` and `seriesOrder` in frontmatter. The series must be defined in `src/data/articles/series/[series-slug].json`.
- **After writing**: Update `.docs/articles-ai-learning-plan.md` — change status from `TODO` to `DONE`.

## 4b. Series System
- **Definition**: `src/data/articles/series/[slug].json` — contains title, description, icon, color, and ordered list of articles (including planned/unpublished ones).
- **Adding a new series**: Create a new JSON file in `src/data/articles/series/`. No code changes needed.
- **SeriesNav component**: Auto-renders at the top of articles that have a `series` field. Shows first 3 articles collapsed, expandable to show all. Current article highlighted, unpublished ones marked "soon".
- **Frontmatter link**: The article's `series` field must match the series JSON filename (e.g., `series: ai-fundamentals` matches `ai-fundamentals.json`).

## 5. What to Avoid
- Jargon without explanation
- Long unbroken walls of text
- Starting paragraphs with "It is important to note that..."
- Summarizing what you just said ("As we discussed above...")
- Overly formal academic tone
- Filler content that doesn't teach anything new

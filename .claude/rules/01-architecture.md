---
trigger: always_on
---

# Rule 01: Architecture & Data Flow

## 1. Directory Mapping
All new content must follow this layout:
- **Components**: `src/components/guides/[category]/[Topic]Guide.tsx`
- **Styles**: `src/styles/guides/[category]/[topic].css` (if topic-specific styles are needed).
- **Metadata**: `src/data/guides/[category]/[category].json` (Loaded recursively).

## 2. The Data Connection
The application uses a centralized data system:
- `src/data/guides/index.ts` aggregates all category JSON files.
- Every guide component MUST find its own metadata using its unique ID:
  ```tsx
  import { guidesData } from '@/data/guides';
  const guide = guidesData.guides.find(v => v.id === "unique-id")!;
  ```
- This `guide` object must be passed to the `<GuideLayout>` component for attribution and metadata rendering.

### Link Uniqueness Check — REQUIRED
Before writing any new guide metadata, you MUST verify that the intended `link` slug does not already exist. Do this by running the following shell command against the JSON source files (no server or bundler needed):

```bash
grep -r '"link"' src/data/guides/ --include="*.json"
```

- Scan the output for the planned slug (e.g. `/guides/database-indexing`).
- If it is **not present** → proceed with that slug.
- If it **already exists** → derive a more specific slug that reflects the topic angle (e.g. `/guides/database-index-internals`), and update both the `link` field in the JSON **and** the component filename accordingly (`[TopicRelevant]Guide.tsx`).
- The `id` field, the `link` slug, and the component filename must all stay in sync:
  - `id`: `"database-index-internals"`
  - `link`: `"/guides/database-index-internals"`
  - `file`: `src/components/guides/database/DatabaseIndexInternalsGuide.tsx`

## 3. Reference Architecture
Use these files as the "Gold Standard" for implementation:
- `src/components/guides/system-design/LoadBalancingGuide.tsx` (Complex state & comparisons)
- `src/components/guides/system-design/CachingStrategiesGuide.tsx` (Clean grid implementation)
- `src/components/guides/auth/JwtGuide.tsx` (Simple flow structure)
- `src/components/guides/programming/OopGuide.tsx` (Step-by-step diagram progressions)
- `src/components/guides/programming/BigONotationGuide.tsx` (Interactive sandbox animations)

## 4. Category Definitions (Decide Better Future Categories)
Follow these guidelines when choosing a category:
- **System Design**: For distributed systems, scaling, networking, and high-level architectural patterns (e.g., Load Balancers, CAP Theorem, Microservices, Caching, CDNs).
- **Database**: Strictly for data storage internals, indexing, replication, and sharding.
- **Auth**: For security, authentication, and authorization protocols (e.g., JWT, OAuth).
- **Programming**: For core computer science concepts, algorithms, and syntax-based guides (e.g., Big O, OOP).

## 5. Metadata Best Practices (must do)
- **ID Consistency**: Ensure the `id` used in `find()` matches exactly with the one in metadata JSON.
- **Timestamps**: When creating or updating metadata, ALWAYS set `createdAt` and `updatedAt` to the current UTC time in ISO 8601 format with full hour and minute precision (e.g., `2026-02-19T09:57:32Z`). Never use midnight (`00:00:00Z`) as a placeholder.
- **Icons**: Use descriptive emojis for the `icon` field.

## 6. Article / Series / Path Folder Hierarchy (REQUIRED)

Articles, series, and paths all mirror the same nested layout so it is obvious what belongs to what. **All three loaders are recursive** (see `src/lib/articles.ts` → `walkJsonFiles`, `walkArticleFiles`). You can nest freely without code changes.

### Canonical layout
```
src/data/articles/paths/<path-slug>.json
src/data/articles/series/<path-slug>/<series-slug>.json
src/content/articles/<path-slug>/<series-slug>/<NN>-<article-slug>.mdx
```

- The **path slug** is the top-level folder name under both `series/` and `content/articles/`.
- The **series slug** is the filename under `series/<path-slug>/` AND the subfolder name under `content/articles/<path-slug>/`.
- Article filenames start with `NN-` (e.g. `01-...`, `02-...`) purely for filesystem sort order — the numeric prefix is **ignored** and has no effect on the URL.
- The article URL slug comes from the frontmatter `slug:` field, not from the filename. Keep them aligned for clarity but the frontmatter wins.

### Examples
```
paths/dsa-quest.json
series/dsa-quest/two-pointers.json
content/articles/dsa-quest/two-pointers/01-valid-palindrome-museum-mirror.mdx

paths/ai-engineer.json
series/ai-engineer/ai-fundamentals.json
content/articles/ai-engineer/ai-fundamentals/01-what-is-ai.mdx
```

### Stub series for unbuilt dungeons
When a path lists series that haven't been written yet, create minimal stub JSONs (slug, title, description, icon, color, empty `articles: []`) so the path detail page shows proper titles and "Soon" badges instead of `slugToTitle` fallbacks. The path detail page treats `s.articles.length === 0` as "Soon" automatically.

## 7. Color Consistency Across Path → Series → Articles (REQUIRED)

A learning path is a single visual brand. **Every series and every article under one path must share the same `color` value**. This applies to both data JSONs and article frontmatter.

### Rule
- Pick one color when you create the path (e.g. `ai-engineer` = `cyan`, `dsa-quest` = `orange`).
- All series files under `series/<path-slug>/` must use that color.
- All MDX articles under `content/articles/<path-slug>/` must use that color in frontmatter.
- The article category in `categories.json` should also match.

### Why
- Card accents, tag badges, and header highlights all read from the article's color. Inconsistent colors under one path look broken.
- Users associate one visual identity with one learning journey.

### Current assignments
| Path | Color |
|---|---|
| `ai-engineer` | `cyan` |
| `dsa-quest` | `orange` |

When adding a new path, choose a color that is distinct from the existing ones and fits the tone (warm for adventure/gamified, cool for analytical/technical). Avoid `red` in light mode — it clashes with the cream background.

## 8. Cross-Navigation Chain (Article → Series → Path)

Every piece of content is linked to the next level up automatically. **You do not hand-wire these links.** You just fill in the right fields and the UI resolves the chain.

### The chain
```
article frontmatter:  series: <series-slug>
         ↓ (SeriesNav at top of article, clickable header → /series/<slug>)
series JSON:          slug: <series-slug>
         ↓ (Path badge at top of series page, clickable → /learning-paths/<slug>)
path JSON:            series: [<series-slug>, ...]
```

### What this means for new content
- **New article** → set `series: <series-slug>` in frontmatter. `SeriesNav` renders automatically with a clickable series header. No manual link.
- **New series** → must be referenced in some path JSON's `series: [...]` array. The series detail page then renders a "Path · <Path Title>" badge above the title automatically. No manual link.
- **New path** → referenced series are auto-listed on the path detail page with proper titles and "Soon" badges for empty ones.

### Non-negotiables
- Series slug in article frontmatter must match `slug` field of a series JSON (slug, not filename).
- Path JSON's `series` array must use series slugs, not filenames.
- If a series is not referenced by any path, the "View Path" badge simply doesn't render — no error, but users lose a navigation hop. Prefer every series to belong to a path.

### The two UI affordances (already shipped, do not rebuild)
- `src/components/articles/SeriesNav.tsx` — header title is a `<Link>` to `/series/<slug>` with an animated `ArrowUpRight` icon.
- `src/app/series/[slug]/SeriesDetailClient.tsx` — reads `parentPath` prop from `page.tsx` (computed via `getAllPaths().find(p => p.series.includes(series.slug))`) and renders a pill badge.

## 9. Article `readTime` Is Auto-Calculated
The `readTime` field in article frontmatter is **ignored by the loader**. `src/lib/articles.ts` computes it at read time from word count (`~200 words/min`, minimum 1 min) and overrides whatever is in the frontmatter.

- You may leave the field out entirely when creating a new article.
- If you leave a value in, it will not appear anywhere — the displayed time always reflects the current content.
- Do not waste effort estimating or updating `readTime` manually.

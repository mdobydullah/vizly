# Rule 02: UI & Design Standards

## 1. The "Vizly" Design Language
- **Background**: Deep Dark (`#0a0e14`).
- **Surface**: Card Dark (`#12161f`).
- **Typography**: 
  - `Outfit`: For headings and UI emphasis.
  - `JetBrains Mono`: For data, code, and technical labels.
- **Accents**: Use `--cyan`, `--purple`, `--pink`, `--orange`, and `--green` CSS variables.

## 2. CSS Guidelines (Vanilla Only)
- **No Tailwind/SCSS**: Use native Vanilla CSS with nesting.
- **Variables**: Always use `var(--var-name)`.
- **Global Utilities**:
  - `.viz-card`: Standard themed container.
  - `.viz-tag`: Metadata chips.
  - `.viz-action`: Logic/Process blocks in diagrams.
  - `.viz-comparison-table-wrap`: Container for standard tables.
  - `.viz-code-block` + `.viz-code-label`: Syntax-highlighted code block (see Section 5).

## 3. Animation Guidelines
Animations must feel premium and smooth:
- **Reveal Classes**: `.viz-reveal`, `.viz-fade-up`.
- **Staggering**: Use the `.delay-100` to `.delay-500` classes to sequence element appearances.
- **Interactive States**: Nodes and paths should glow/scale on hover or when active in a flow.
- **Speeds**: Respect the `animationSpeed` multiplier from `SettingsContext`.

## 4. Component Structure
- **Layout**: Always wrap in `<GuideLayout contributors={guide.contributors}>`.
- **Sections**: Structure pages into clear sections: `Hero`, `Concepts (Grid)`, `Visualization (Interactive)`, `Comparison (Table)`, `Resources`.
- **Width Constraints — REQUIRED**:
  - **Never** use `width: 100%` or full-width layouts without a `max-width`. Content that stretches edge-to-edge on large monitors is a design defect.
  - **Top-level section containers** (concept grids, flow sections, mermaid wrappers): `max-width: 1200px; margin: 0 auto`.
  - **Visualization/diagram containers** (ring, canvas, flow diagrams): `max-width: 900px; margin: 0 auto`.
  - **Mermaid diagram wrappers**: `max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; align-items: center`. The `.mermaid` pre inside must also use `display: flex; justify-content: center`.
  - Always use a **dedicated CSS class** (e.g. `.[topic]-mermaid-wrap`) for Mermaid diagram wrappers — never rely on a bare `viz-card` div alone.

## 5. Code Block Component — REQUIRED for Any Code Examples
Whenever a guide includes a code snippet, always use the **global** `.viz-code-block` utility defined in `src/styles/guides.css`. **Do NOT redeclare these styles** in topic-specific CSS files.

### Preferred: `<CodeBlock>` Server Component (Shiki)
Always use this for real code examples — runs server-side, zero client JS, instant full syntax highlighting via the custom Vizly theme.

```tsx
// Imported and called from page.tsx, result passed as a prop (see Integration Pattern below)
import { CodeBlock } from '@/components/ui/CodeBlock';
```

### Legacy: Manual Spans (discouraged)
Only acceptable for tiny 1–3 line inline phrases. Do NOT use for full code examples.

```tsx
<div className="viz-code-block">
  <span className="viz-code-label">TypeScript</span>
  <div><span className="kw">const</span> <span className="nm">x</span> = <span className="nm">1</span>;</div>
</div>
```

### Token Classes (manual spans only)
| Class | Color     | Purpose                                             |
|-------|-----------|-----------------------------------------------------|
| `.kw` | `#7c4dff` | Keywords & modifiers (`class`, `return`, `private`) |
| `.cl` | `#00e5ff` | Class / type names                                  |
| `.fn` | `#1de9b6` | Function & method names                             |
| `.st` | `#ff9f43` | String literals                                     |
| `.cm` | `#4d5a6e` | Comments (italic)                                   |
| `.nm` | `#ff4081` | Numbers, constants, variables                       |

### Rules
- **Always use `<CodeBlock>` (Shiki)** — never redeclare token colors or code-block styles in topic CSS.
- The container already has `max-width: 900px; max-height: 500px; overflow-y: auto` — do not override in topic CSS.
- All Shiki token colours live in `src/lib/shiki-theme.ts` — never hardcode hex token colours elsewhere.

### Integration Pattern (Shiki with Client Guide Components)
Because guide components are `"use client"`, Shiki runs at the **server page level** and the result is passed as a `ReactNode` prop. Code strings must **always be co-located** with the guide component — never inlined in `page.tsx`.

#### File Layout — REQUIRED
```
src/components/guides/[category]/
├── MyTopicGuide.tsx       ← "use client" interactive component
└── my-topic.code.ts       ← exports raw code strings  ← one file per guide
```

#### Step 1 — Create `[topic].code.ts` next to the guide component
```ts
// src/components/guides/programming/my-topic.code.ts
export const MY_TOPIC_CODE = `\
class Foo {
  bar() { return 42; }
}
`;
```

#### Step 2 — Import and pre-render in `src/app/guides/[id]/page.tsx`
```tsx
import { MY_TOPIC_CODE } from '@/components/guides/programming/my-topic.code';

// inside GuidePage():
const codeBlock = id === 'my-topic'
    ? await CodeBlock({ code: MY_TOPIC_CODE, lang: 'typescript', label: 'TypeScript' })
    : undefined;

return <GuideComponent codeBlock={codeBlock} />;
```

#### Step 3 — Accept and render the slot in the guide component
```tsx
export function MyTopicGuide({ codeBlock }: Readonly<{ codeBlock?: React.ReactNode }>) {
    return (
        <GuideLayout ...>
            {/* ...other sections... */}
            {codeBlock ?? null}
        </GuideLayout>
    );
}
```

> **Why this pattern?** `page.tsx` stays lean (≤55 lines) regardless of how many guides exist.
> Each guide owns its code strings — easier to find, edit, and review in one place.

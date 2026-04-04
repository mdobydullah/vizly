# Rule 02: UI & Design Standards

## 1. The "Vizly" Design Language
- **Dark mode** (default): Background `#0a0e14`, Surface `#12161f`, neon accents.
- **Light mode**: Background `#f0eee6` (Anthropic-inspired cream), Surface `#fff` for cards, muted accents.
- **Typography**: 
  - `Outfit` (`--font-display`): For visual accents and some UI emphasis.
  - `Inter` (`--font-hero`): The primary heading font for readability and impact.
  - `DM Mono` (`--font-body`): For descriptive body text.
  - `Space Mono` (`--font-mono`): For data, logic flows, and technical labels.
- **Accents**: Use `--cyan`, `--purple`, `--pink`, `--orange`, and `--green` CSS variables. These automatically adjust between themes.
- **Theme switching**: Global toggle in header via `useSettings().toggleTheme`. Theme stored in `localStorage('theme')` and applied as `data-theme` attribute on `<html>`. Default theme configurable via `NEXT_PUBLIC_DEFAULT_THEME` env var.

## 2. CSS Guidelines (Vanilla Only)
- **No Tailwind/SCSS**: Use native Vanilla CSS with nesting.
- **Variables**: Always use `var(--var-name)`.
- **Global Utilities — PRIORITIZE THESE**:
  - `.section-title`: Global heading style for page sections.
  - `.viz-heading`: Utility class for standard Inter-based headings.
  - `.viz-card`: Standard themed container.
  - `.viz-tag`: Metadata chips.
  - `.viz-action`: Logic/Process blocks in diagrams.
  - `.viz-comparison-table-wrap`: Container for standard tables.

## 3. Styling Strategy: Global First
- **Check Globals**: Before writing new CSS in a guide-specific file, check `src/app/globals.css` and `src/styles/guides.css` for existing variables and utility classes.
- **Reuse Before Creating**: Use global variables (`--font-hero`, `--cyan`, etc.) for consistency. 
- **Topic-Specific Only**: Only create a local `[topic].css` file for styles that are truly unique to that guide (e.g., custom diagram layouts, unique animation keyframes, or specific node shapes).
- **Avoid Hardcoding**: Never use hardcoded hex codes or font-family strings in local CSS if a variable exists.


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

## 5. Shared Concept Card System

### REQUIRED: Use `guide-concept-*` classes for all guide concept cards
All guide "Core Concepts" sections use a **single shared CSS file**: `src/styles/guide-cards.css`. Do NOT create per-guide card classes.

**Available classes:**
- `.guide-concept-grid` — Card grid container
- `.guide-concept-card` — Card wrapper
- `.guide-concept-header` — Header row (icon + name)
- `.guide-concept-icon` — Emoji icon container
- `.guide-concept-name` — Card title
- `.guide-concept-desc` — Card description
- `.guide-concept-stats` — Stat chips container
- `.guide-concept-chip` — Stat chip (add `.hi` for highlight)
- `.guide-concept-usecase` — Use case footer

**Example usage:**
```tsx
<div className="guide-concept-grid">
    <div className="guide-concept-card" onClick={handleClick}>
        <div className="guide-concept-header">
            <div className="guide-concept-icon">🔜</div>
            <div className="guide-concept-name">Forward Proxy</div>
        </div>
        <p className="guide-concept-desc">Description text here.</p>
        <div className="guide-concept-stats">
            <span className="guide-concept-chip hi">Client-Side</span>
            <span className="guide-concept-chip">Anonymity</span>
        </div>
        <div className="guide-concept-usecase"><strong>Use case:</strong> VPNs.</div>
    </div>
</div>
```

Light and dark mode styling is built into `guide-cards.css` — no per-guide overrides needed.

### Flow Section Styling Rules
Interactive flow sections should follow this premium pattern:

**Flow Section Container**:
```css
.guide-flow-section {
    max-width: 900px;
    margin: 0 auto 3rem;
    background: var(--surface);      /* Not surface2 */
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* Subtle shadow */
}
```

**Flow Control Buttons**:
```css
.guide-flow-btn {
    padding: 8px 16px;
    border-radius: 20px;              /* Rounded pill shape */
    font-family: var(--font-mono);
    font-size: 0.85rem;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.2s ease;
}

.guide-flow-btn:hover {
    color: var(--text-hi);
    border-color: var(--border2);
}

.guide-flow-btn.active {
    background: rgba([guide-color-rgb], 0.1);   /* 10% opacity background */
    color: [guide-primary-color];
    border-color: [guide-primary-color];
    box-shadow: 0 0 12px rgba([guide-color-rgb], 0.2);
}
```

**Flow Title**:
```css
.guide-flow-title {
    font-family: var(--font-outfit);
    font-size: 1.3rem;
    color: var(--text-hi);
    margin-bottom: 2rem;
    text-align: center;
}
```

### Grid Layout
```css
.guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto 2rem;
}
```

### Key Design Principles
1. **Use `var(--font-outfit)` for all major headings** (card names, flow titles) — more premium than `var(--font-hero)`
2. **Font weights**: Card titles 600 (not 700), maintains elegance
3. **Spacing**: Consistent 1.5rem margins on card descriptions and use-case sections
4. **Stat chips**: Always include `text-transform: uppercase` for emphasis
5. **Hover effects**: Subtle shadow + slight border color change (no aggressive transforms)
6. **Flow buttons**: Pill-shaped (border-radius: 20px) with muted active states
7. **Shadows**: Use `0 4px 6px rgba(0, 0, 0, 0.1)` for containers, `0 0 12px rgba([color], 0.2)` for active states
8. **Color theming**: Background should be 10% opacity (`rgba(x, x, x, 0.1)`), chip background 5% opacity (`rgba(x, x, x, 0.05)`)

### Important: No Per-Guide Card Classes
- **Do NOT create per-guide card classes** (e.g., `.bf-card`, `.proxy-card`, `.csa-card`)
- **Always use** the shared `guide-concept-*` classes from `src/styles/guide-cards.css`
- Per-guide CSS files should only contain flow section, mermaid, node, and animation styles


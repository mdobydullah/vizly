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

## 5. Premium Card & Flow Styling (Standard Pattern)

### Card Styling Rules
All guide concept cards should follow this premium pattern:

**Card Container** (e.g., `.csa-card`):
```css
.guide-card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    cursor: pointer;
}

.guide-card:hover {
    border-color: [guide-primary-color];
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba([guide-color-rgb], 0.1);
}
```

**Card Typography**:
```css
.guide-card-name {
    font-family: var(--font-outfit);    /* Premium heading font */
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-hi);
}

.guide-card-desc {
    font-size: 0.95rem;
    color: var(--text-dim);
    line-height: 1.5;
    margin-bottom: 1.5rem;
    flex-grow: 1;
}
```

**Stat Chips**:
```css
.guide-stat-chip {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text-dim);
    text-transform: uppercase;    /* Key: uppercase for emphasis */
}

.guide-stat-chip.hi {
    color: [guide-primary-color];
    border-color: rgba([guide-color-rgb], 0.3);
    background: rgba([guide-color-rgb], 0.05);
}
```

**Use Case Section**:
```css
.guide-use-case {
    font-size: 0.85rem;
    color: var(--text-dim);
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.guide-use-case strong {
    color: var(--text-hi);
}
```

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

### Important: Avoid Mixing Card Class Systems
- **Do NOT combine multiple card class systems** in a single component (e.g., don't use `.viz-card` + `.proxy-card` + color theme classes simultaneously)
- **Choose ONE card system per guide**:
  - For new guides: Use guide-specific card classes (e.g., `.guide-card`, `.proxy-card`, `.csa-card`)
  - Ensure the chosen card class includes ALL necessary styling: border, background, padding, transitions
  - Apply color theming via inline hover handler or CSS classes, NOT by stacking multiple base classes
- **Card container MUST define**:
  - `display: flex; flex-direction: column` for layout
  - `border: 1px solid var(--border)` for visibility
  - `padding: 1.5rem` for consistent spacing
  - `background: var(--surface)` for proper contrast
  - `transition: all 0.3s ease` for smooth interactions
  - Hover state with border color, transform, and shadow


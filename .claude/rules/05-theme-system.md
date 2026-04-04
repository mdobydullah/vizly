# Rule 05: Theme System (Light/Dark Mode)

## 1. Current Status
- **Dark mode is stable** — do not modify dark mode styles unless explicitly asked.
- **Light mode is actively being refined** — all new UI work should consider light mode appearance.

## 2. How It Works
- Theme is set via `data-theme="dark"|"light"` attribute on `<html>`.
- CSS variables in `:root` define dark mode defaults. `[data-theme="light"]` block in `globals.css` overrides them.
- An inline `<script>` in `layout.tsx` reads `localStorage('theme')` before React hydrates to prevent flash-of-wrong-theme (FOWT).
- React state in `SettingsContext` (`useSettings().theme`, `.toggleTheme()`) stays in sync.
- Default theme is configurable via `NEXT_PUBLIC_DEFAULT_THEME` env var (defaults to `dark`).

## 3. Rules for New Components

### Never hardcode colors
- **Wrong**: `background: rgba(0, 229, 255, .08)` — breaks in light mode.
- **Right**: `background: color-mix(in srgb, var(--cyan) 8%, transparent)` — adapts to both themes.
- For inline styles that need theme-aware alpha blending, always use `color-mix(in srgb, var(--css-var) N%, transparent)`.

### Use CSS variables for everything
All colors, backgrounds, borders, and shadows must come from CSS variables defined in `globals.css`:
- `--bg`, `--surface`, `--surface2` — background layers
- `--border`, `--border2` — borders
- `--text`, `--text-dim`, `--text-hi` — text colors
- `--cyan`, `--purple`, `--green`, etc. — accent colors (automatically adjusted per theme)
- `--header-bg`, `--footer-bg`, `--overlay-bg` — layout backgrounds
- `--dim` — muted/secondary backgrounds

### Adding light mode overrides
When a component looks wrong in light mode, add overrides using `[data-theme="light"]` selector in the relevant CSS file — do NOT create separate light-mode CSS files. Pattern:
```css
/* In the same CSS file as the dark mode styles */
[data-theme="light"] .my-component {
    background: #fff;
    border-color: #e0ddd5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
```

### Cards in light mode
Homepage and guide cards follow these light mode principles (defined in `cards.css`):
- **Default state**: White background (`#fff`), subtle border (`#e0ddd5`), soft shadow.
- **No neon borders**: Card color borders are removed; only `var(--border)` equivalent.
- **Hover**: Slightly stronger shadow (`rgba(0,0,0,0.08)`), subtle color-tinted border via `color-mix()`. No neon glow.
- **Icons**: Stronger tinted background (`12%` opacity vs `8%` in dark) for visibility on cream bg.
- **Arrows**: Stay outlined on hover (no solid color fill like dark mode).

### Inline style jsx theme overrides
For components using Next.js `<style jsx>`, use `:global([data-theme="light"])` prefix:
```jsx
<style jsx>{`
  .my-element { color: #fff; }
  :global([data-theme="light"]) .my-element { color: #1c1917; }
`}</style>
```

## 4. Light Mode Color Palette Reference
| Token | Dark | Light |
|-------|------|-------|
| `--bg` | `#080b10` | `#f0eee6` |
| `--surface` | `#0e1219` | `#e8e5dc` |
| `--surface2` | `#151c27` | `#dfdcd3` |
| `--border` | `#1e2a3a` | `#d0cdc4` |
| `--text` | `#c9d3e0` | `#44403c` |
| `--text-hi` | `#eef2f8` | `#1c1917` |
| `--text-dim` | `#5a6a7e` | `#78716c` |
| Cards bg | `var(--surface)` | `#fff` |
| Card border | `var(--border)` | `#e0ddd5` |

## 5. Guide Visualization Sections Stay Dark
Flow sections and mermaid diagrams **always stay dark** in light mode — they are designed for dark backgrounds and switching them looks wrong. The technique: scope dark-mode CSS variable values onto the container so all child `var()` references resolve to dark values.

### Standard pattern (add to each guide's CSS file):
```css
[data-theme="light"] .PREFIX-flow-section {
    --bg: #080b10;
    --surface: #0e1219;
    --surface2: #151c27;
    --border: #1e2a3a;
    --border2: #253040;
    --text: #c9d3e0;
    --text-dim: #5a6a7e;
    --text-hi: #eef2f8;
    --cyan: #00e5ff;
    --purple: #b985f4;
    --green: #3effa3;
    --dim: #1e1e2e;
    background: #12161f;
    border-color: #1e2a3a;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

[data-theme="light"] .PREFIX-mermaid-wrap {
    /* Same variable block as above, plus: */
    background: #12161f;
    border: 1px solid #1e2a3a;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}
```

### Guide cards get white backgrounds:
```css
[data-theme="light"] .PREFIX-card {
    background: #fff;
    border-color: #e0ddd5;
}

[data-theme="light"] .PREFIX-card:hover {
    border-color: #c4c1b8;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

All existing guides already have these overrides. New guides must include them.

## 6. Testing
When making UI changes, always verify appearance in **both** themes. Switch using the Sun/Moon toggle in the header.

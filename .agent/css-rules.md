# Guide Framework Guidelines

This document defines the rules for using and extending the "Vizly Mini-Framework" for technical guides. AI agents should follow these patterns to maintain consistency across all guides.

## 1. Preferred Technology: Vanilla CSS
We explicitly use **Vanilla CSS (.css)** instead of SCSS/SASS.
- **Native Nesting**: Use native CSS nesting for hierarchy (supported by Tailwind 4 and modern browsers).
- **CSS Variables**: Use `--variable` syntax for all theme tokens (referencing `:root` in `globals.css`).
- **No SCSS**: Do not install or use `.scss` files to keep build overhead low.

## 2. CSS Organization
All shared styles must be modularized in `src/styles/`:
- `guides.css`: Core animations (`@keyframes`), reveal utilities (`.viz-reveal`), and staggered delays (`.delay-X00`).
- `cards.css`: Theming for informational boxes and floating labels (`.card-color`).
- `actions.css`: Styling for process/processor boxes (`.viz-action`).
- `mermaid.css`: Container styling for diagrams (`.viz-mermaid-wrap`).
- `layout.css`: Standardized structural layouts and grids (`.viz-grid`, `.viz-section-header`).

**New component types should get their own CSS file in `src/styles/` and be imported in `globals.css`.**

## 2. Animation Patterns
Always use the standardized animation classes instead of ad-hoc styles:
- **Reveal**: Use `.viz-reveal` with `.visible` for entry.
- **Fade Up**: Use `.viz-fade-up` for larger sections.
- **Staggering**: Use `.delay-100` through `.delay-500` to create a natural flow.
- **Logic**: Control visibility via state-driven class toggles (e.g., `${isVisible ? 'visible' : ''}`).

## 3. Theming & Colors
Use the CSS variables defined in `:root` (e.g., `var(--cyan)`, `var(--purple)`).
- Avoid hardcoded hex codes for primary accents.
- When creating a new color theme, add it to all relevant files (`cards.css`, `actions.css`) to maintain the "variant" pattern.

## 4. Component Implementation
When building new guides:
1. **No Inline Styles**: Avoid `<style jsx>` or `style={{...}}` for framework-level guides. Use the framework classes.
2. **Semantic Classes**: Use the `.viz-*` prefix for new framework utilities to avoid collisions with global app styles.
3. **Consistency**: Ensure process steps use `.viz-action` and data structures use `.viz-box`.

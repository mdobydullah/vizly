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

## 3. Animation Guidelines
Animations must feel premium and smooth:
- **Reveal Classes**: `.viz-reveal`, `.viz-fade-up`.
- **Staggering**: Use the `.delay-100` to `.delay-500` classes to sequence element appearances.
- **Interactive States**: Nodes and paths should glow/scale on hover or when active in a flow.
- **Speeds**: Respect the `animationSpeed` multiplier from `SettingsContext`.

## 4. Component Structure
- **Layout**: Always wrap in `<GuideLayout contributors={guide.contributors}>`.
- **Sections**: Structure pages into clear sections: `Hero`, `Concepts (Grid)`, `Visualization (Interactive)`, `Comparison (Table)`, `Resources`.

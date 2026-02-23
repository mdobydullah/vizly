# Rule 03: Visualization Guide Specification

This rule defines the functional requirements for a "Vizly Guide".

## 1. Visual Requirements
- **Hero Section**: Title + Subtitle with gradient text.
- **Pattern Grid**: 4-6 interactive cards explaining sub-concepts.
- **Mermaid Diagram**: Static "Architecture-as-Code" diagram before the interactive section.
- **Animated Flow**: The centerpiece. Must have:
  - 3-5 switchable tabs (Algorithm variants). For the tab controls, always use a flex wrap layout with rounded, bordered buttons that have hover/active states with themed glowing box-shadows (e.g. `.eda-tab-btn` styles). Do not use an inline pill background for the container.
  - Visual nodes with state (Idle, Processing, Success, Error).
  - Step-by-step logic explanation text.
  - Replay/Flow control functionality.
- **Beginner-Friendly Coverage**: Don't miss any important points needed to understand the topic. Think from a beginner's perspective — cover foundational concepts, explain "why" not just "how", and ensure no critical subtopic is skipped.

## 2. Mermaid Standard
- Render the Mermaid diagram only. Do NOT include a collapsible `details` block with the raw Mermaid source code.
- Use `sequenceDiagram` for communication flows.
- Use `flowchart TD` for structural/logic flows.
- **Centering — REQUIRED**: Always wrap the Mermaid `<pre className="mermaid">` in a **dedicated topic-scoped CSS class** (e.g. `.[topic]-mermaid-wrap`). Never place it bare inside a generic `viz-card` alone.
- **The wrapper class must define**:
  ```css
  .[topic]-mermaid-wrap {
      max-width: 900px;
      margin: 0 auto 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
  }
  .[topic]-mermaid-wrap .mermaid {
      width: 100%;
      display: flex;
      justify-content: center;
  }
  .[topic]-mermaid-wrap .mermaid svg {
      max-width: 100%;
      height: auto;
  }
  ```
- **Colored Nodes — REQUIRED**: Every Mermaid diagram MUST apply per-node `style` directives. Never leave nodes with the default gray/white Mermaid theme. Use the guide's accent colors (matching `colorConfig.primary` and the Vizly palette — `--cyan`, `--purple`, `--orange`, `--green`, etc.) for `fill`, `stroke`, and `color`. Example pattern:
  ```
  style NodeA fill:#1a1f2b,stroke:#00e5ff,color:#fff
  style NodeB fill:#12161f,stroke:#7c4dff,color:#fff
  style NodeC fill:#0d1117,stroke:#3effab,color:#aaa
  ```
  Use darker fills (`#0d1117`, `#12161f`, `#1a1f2b`) for the dark background, and bright accent strokes to make nodes pop. Distinguish different node roles by using different stroke colors.
- **Syntax Safety — REQUIRED**: When node labels contain parentheses, arrows (`→`), or other special characters, always use the **quoted label form** (`["..."]` or `(["..."])`) instead of bare brackets. Inside quoted labels, use `\n` for line breaks and literal `()` — no backslash-escaping. Example:
  ```
  NodeA["B-Tree Index Scan\nO(log n)"]
  NodeB(["✅ Result Returned"])
  ```

## 3. Interactivity Requirements
- **Card-to-Flow**: Clicking a card in the top grid MUST scroll the user to the interactive section and set the active pattern to that card's topic.
- **Settings**: Include a settings button (⚙️) to open the `SettingsModal` via `setIsSettingsOpen(true)`.
- **Playback**: Implement a `playPattern` function that uses `setTimeout` and cleanup logic in a `useRef`.

## 4. Content Checklist
- [ ] Unique ID registered in `src/data/guides/[category]/`.
- [ ] Proper attribution (contributors array).
- [ ] Comparison table with dot ratings (`<Rating dots={n} />`).
- [ ] Responsive design (Grid stacks on mobile).

## 5. Color System
- **Random Selection**: When creating a new guide, you MUST select a random color configuration from `src/data/guides/guide-colors.json`.
- **No Manual Hex**: Do NOT generate random hex codes manually. Use the exact `primary`, `background`, `border`, and `hoverShadow` values from the selected object in the array.

## 6. Resources
- **Open Source First**: Always prioritize open source content (documentation, tutorials, videos) when adding resource links. Avoid paywalled or proprietary-only sources.

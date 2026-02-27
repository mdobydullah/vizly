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
- **Playback Controls — REQUIRED**: ALL new guides with animated flows MUST include a unified playback control group. Place this group next to the flow tabs. It must be a flex container with:
  - **Play/Pause Button**: Toggles an `isPlaying` state (use `Play` and `Pause` icons from `lucide-react`).
  - **Replay Button**: Uses the `RotateCcw` icon to restart the current animation pattern.
  - **Settings Button**: Opens the speed control modal via `setIsSettingsOpen(true)` using the `Settings` icon.
  - Implement the exact structure below:
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
    <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
            width: '28px', height: '28px', borderRadius: '6px', border: 'none',
            background: isPlaying ? 'rgba(29, 233, 182, 0.1)' : 'transparent',
            color: isPlaying ? 'var(--cyan)' : 'var(--text-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
        }}
        title={isPlaying ? "Pause" : "Play"}
    >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
    </button>
    <button
        onClick={() => playPattern(activePatternKey)}
        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
        title="Replay"
    >
        <RotateCcw size={14} />
    </button>
    <div style={{ width: '1px', height: '14px', background: 'var(--border2)', margin: '0 4px' }} />
    <button
        onClick={() => setIsSettingsOpen(true)}
        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
        title="Settings"
    >
        <Settings size={14} />
    </button>
</div>
```
- **Animation Loop**: When supporting pause/play, implement the animation using a progressive `useEffect` loop that depends on `currentStepIdx` and `isPlaying`, rather than pushing all future steps into a static `useRef` array of timeouts.

## 4. Content Checklist
- [ ] Unique ID registered in `src/data/guides/[category]/`.
- [ ] Proper attribution (contributors array).
- [ ] Comparison table with dot ratings (`<Rating dots={n} />`).
- [ ] Responsive design (Grid stacks on mobile).

## 5. Color System
- **Random Selection**: When creating a new guide, you MUST select a random color configuration from `src/data/guides/guide-colors.json`. Ensure that the `color` property value is a kebab-case version of the color's name (e.g. `Teal` -> `teal`, `Deep Orange` -> `deep-orange`).
- **Card Styling Integration — REQUIRED**: The `color` string you set in the metadata JSON (e.g. `"teal"`) is used dynamically by the homepage `GuideCard` component to assign the class `.card-teal`. You MUST verify that this class definition actually exists in `src/styles/cards.css`. If it does not exist, you must append the CSS for `.card-[color]` (including `.card-[color]:hover` overrides) to `src/styles/cards.css` to ensure the home screen tile receives its correct border and hover glowing effects.
- **No Manual Hex**: Do NOT generate random hex codes manually. Use the exact `primary`, `background`, `border`, and `hoverShadow` values from the selected object in the array.

## 6. Resources
- **Open Source First**: Always prioritize open source content (documentation, tutorials, videos) when adding resource links. Avoid paywalled or proprietary-only sources.

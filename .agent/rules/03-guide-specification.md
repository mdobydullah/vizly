# Rule 03: Visualization Guide Specification

This rule defines the functional requirements for a "Vizly Guide".

## 1. Visual Requirements
- **Hero Section**: Title + Subtitle with gradient text.
- **Pattern Grid**: 4-6 interactive cards explaining sub-concepts.
- **Mermaid Diagram**: Static "Architecture-as-Code" diagram before the interactive section.
- **Animated Flow**: The centerpiece. Must have:
  - 3-5 switchable tabs (Algorithm variants).
  - Visual nodes with state (Idle, Processing, Success, Error).
  - Step-by-step logic explanation text.
  - Replay/Flow control functionality.

## 2. Mermaid Standard
- Must include both the rendered diagram AND the raw Mermaid code in a collapsible `details` block.
- Use `sequenceDiagram` for communication flows.
- Use `flowchart TD` for structural/logic flows.

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

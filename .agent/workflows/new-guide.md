---
description: Create a new animated guide component for a technical topic
---

1. **Information Gathering**:
   - Ask the user which technical topic to visualize (e.g., Database Indexing, Service Discovery, GRPC).
   - Read `src/data/guides/index.ts` to see existing metadata and ensure the new guide has a unique ID and proper data entry.
   - Use `src/components/guides/infrastructure/LoadBalancingVisual.tsx` or `src/components/guides/async/MessageQueuesVisual.tsx` as reference architecture.

2. **Component Creation Strategy**:
   - **Guide Layout**: Always wrap the component in `<GuideLayout>` from `@/components/layout/GuideLayout`.
   - **Animation System**: 
     - Use `useSettings` from `@/context/SettingsContext` to access `animationSpeed` (multiplier for delays) and `setIsSettingsOpen`.
     - Implement a pattern playback function (e.g., `playPattern`) with `setTimeout` chains managed in a `useRef` array (to allow cleanup).
     - Provide a settings toggle button (⚙️) next to flow controls that calls `setIsSettingsOpen(true)`.
   - **Concept Section**: 
     - Create a grid of cards using the centralized `.viz-card` system from `src/styles/cards.css`.
     - Apply theme classes (e.g., `card-cyan`, `card-purple`, `card-orange`) to automatically get premium hover effects, glows, and theme colors.
     - Use `.viz-tag` and `.viz-tag.hi` for metadata chips within cards.
   - **Interactive Flow Section**: 
     - Create a diagram area (`viz-flow-diagram` or category-specific equivalent).
     - Provide algorithm/pattern tabs in a centered flex container with the settings button aligned to the right.
     - Use state variables (e.g., `currentStepIdx`, `activePattern`) to trigger CSS transitions on nodes and arrows.
   - **Structure Section**: If applicable, use `flow-wrap` and `flow-step` for vertical step-by-step logic explanations.
   - **Comparison Tables**: 
     - Use `.viz-comparison-table-wrap` for the container.
     - Apply `.viz-table` to the `<table>` element.
     - These tables are responsive by default (horizontal scroll) and include standard dark-mode styling.
     - For metric ratings, use a consistent dot system (e.g., `<Rating dots={n} />`) using `.viz-rating-dots` and `.viz-dot.on`.

3. **Implementation Steps**:
   - Create the new component in a categorized subdirectory: `src/components/guides/[category]/[Topic]Visual.tsx`.
   - Create a corresponding CSS file in `src/styles/guides/[category]/[topic].css` if custom diagram styles are needed.
   - Add the guide metadata to `src/data/guides/[category].json`.
   - Ensure the guide is correctly exported and mapped in the main routing logic in `src/components/guides/index.tsx`.

4. **Style & Brand Guidelines**:
   - **Don't Duplicate CSS**: Never repeat card theme variables, hover effects, or table base styles. Rely on global classes in `cards.css` and `tables.css`.
   - **Design Tokens**: Use standard variables like `var(--cyan)`, `var(--purple)`, `var(--pink)`, etc., for consistency.
   - **Premium Feel**: Use the specialized orange variant (`var(--orange)`) for high-contrast "scalable/consistent" topics.
   - **Consistency**: Keep icon sizes (28x28 for small, 42x42 for large) and border radii (14px-16px) in sync with the design system.
   - **Table Accuracy**: Ensure "Risk" or logical flags in tables use `var(--green)` for success and `var(--pink)` for warnings/risks.

5. **Final Review**:
   - Verify that the "Settings" button correctly opens the global modal.
   - Ensure "Replay" functionality (in `GuideLayout`) of patterns works by resetting all animation state.
   - Check mobile layout grid responsiveness.

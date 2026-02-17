---
description: Create a new animated visual component for a technical topic
---

1. **Information Gathering**:
   - Ask the user which technical topic to visualize (e.g., Load Balancing, Docker, OAuth2).
   - Read `src/data/visuals.ts` to see existing metadata and ensure the new visual has a unique ID and proper data entry.
   - Use `auth/jwtVisual.tsx` as the reference architecture for the component.

2. **Component Creation Strategy**:
   - **Visual Layout**: Always wrap the component in `<VisualLayout>` from `@/components/layout/VisualLayout`.
   - **Animation System**: 
     - Use `useSettings` to respect `animationsEnabled` and `animationSpeed`.
     - Implement a `runAnimation` function with `setTimeout` chains.
     - Use state variables (e.g., `stepVisibleCount`, `isAnimatePulse`) to trigger CSS transitions.
   - **Structure Section**: Create a grid of cards (`viz-card-grid`) explaining the components of the topic.
   - **Flow Section**: Create a vertical step-by-step list (`flow-wrap`) using `flow-step` classes.
   - **Visual Feedback**: Use `scrollIntoView` to guide the user's focus as new content appears.
   - **Mermaid Support**: Include a `sequenceDiagram` or `graph` in a `viz-mermaid-wrap` for a high-level overview.

3. **Implementation Steps**:
   - Create the new component in a categorized subdirectory: `src/components/visuals/[category]/[Topic]Visual.tsx` (e.g., `auth/OAuth2Visual.tsx`).
   - Add the visual metadata to `src/data/visuals.ts`.
   - Update `src/components/visuals/index.tsx` to export and map the new component.
   - Verify that the visual appears correctly on the `/visuals` page.

4. **Style Guidelines**:
   - Use CSS variables like `var(--cyan)`, `var(--purple)`, `var(--yellow)` for brand consistency.
   - Ensure "Glassmorphism" effect using `viz-box` and `viz-reveal`.
   - Add subtle micro-animations (pulsing, fading up).

5. **Final Review**:
   - Check mobile responsiveness.
   - Verify "Replay" functionality works by resetting all animation states and counts.

Create a new high-quality animated visual guide.

1. **Information Gathering**:
   - Ask the user which technical topic to visualize.
   - Read `.claude/rules/` for design, architecture, and specification requirements.

2. **Data & Metadata Setup**:
   - Assign a unique ID. Verify the link slug doesn't already exist: `grep -r '"link"' src/data/guides/ --include="*.json"`
   - Add metadata to `src/data/guides/[category]/[category].json`.

3. **Core Development**:
   - **Component**: `src/components/guides/[category]/[Topic]Guide.tsx`
     - Follow Rule 01 (architecture), Rule 02 (UI), Rule 03 (visualization).
   - **Styling**: `src/styles/guides/[category]/[topic].css` (only if topic-specific styles needed).

4. **Integration**:
   - Export the component. The webpack `require.context` in `src/components/guides/index.tsx` auto-discovers it.
   - Verify URL slug matches guide ID.
   - Run `npm run build` to confirm no errors.

---
description: Process for creating a new high-utility animated guide
---

1. **Information Gathering**:
   - Ask the user which technical topic to visualize (e.g., Database Indexing, Service Discovery, GRPC).
   - Read `.agent/README.md` for project context.
   - Read all files in `.agent/rules/` for design, architecture, and specification requirements.

2. **Data & Metadata Setup**:
   - Assign a unique ID to the new guide.
   - Add the guide metadata (title, description, contributors, category) to the appropriate file in `src/data/guides/[category].json`.
   - Ensure the new data is reflected in the main `guidesData` export.

3. **Core Development**:
   - **Component**: Create the guide component at `src/components/guides/[category]/[Topic]Guide.tsx`.
     - *Follow Rule 01 for architecture.*
     - *Follow Rule 02 for UI and component structure.*
     - *Follow Rule 03 for specific visualization requirements (Mermaid, Charts, etc.).*
   - **Styling**: Create topic-specific styles (if needed) at `src/styles/guides/[category]/[topic].css`.
     - *Adhere to Vanilla CSS and design tokens specified in Rule 02.*

4. **Integration & Routing**:
   - Export the new guide component.
   - Register the guide in the main routing/mapping logic in `src/components/guides/index.tsx`.
   - Verify that the URL slug matches the guide ID.
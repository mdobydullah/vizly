---
description: Generate a technical design overview in Excalidraw for a specific topic or guide
---

When the user provides a topic or guide name (e.g., "Consistent Hashing"), follow these steps to generate a professional Excalidraw design:

1. **Check Prerequisites**:
   - Ensure the Excalidraw Canvas server is running. If not sure, or if tool calls fail, refer to the setup instructions in [.docs/excalidraw.md](.docs/excalidraw.md).

2. **Understand the Topic**:
   - If the topic refers to an existing guide in `src/components/guides/`, read the file to understand the key visual elements (e.g., nodes, rings, flows, types of diagrams used).
   - If it's a new topic, research or propose a standard visual representation (e.g., Venn diagram for CAP, Ring for Consistent Hashing, Layers for OSI).

3. **Design the Layout**:
   - Use the `excalidraw` MCP tools to create a professional diagram.
   - **Mandatory Elements**:
     - **Title**: A large, clear title at the top center.
     - **Border**: A subtle dashed or dotted rectangular border framing the entire design (with some padding).
     - **Watermark**: A "Vizly.dev" text watermark in the bottom-right corner with low opacity.
   - **Aesthetics**:
     - Colors: Use Vizly colors: Blue (`#2980b9`), Green (`#27ae60`), Orange (`#f39c12`), Purple (`#8e44ad`).
     - Styles: Use semi-transparent backgrounds for shapes (`rgba(..., 0.1)`) and appropriate stroke styles.

4. **Verify and Share**:
   - Group related elements using `mcp_excalidraw_group_elements`.
   - **Local Verification**: Direct the user to their local Excalidraw canvas at [http://localhost:3100](http://localhost:3100) for real-time verification and manual tweaks.
   - **Export & Share**: Export the diagram to a shareable `excalidraw.com` URL using `mcp_excalidraw_export_to_excalidraw_url`.
   - Provide the URL and local link to the user with a brief explanation of the design choices.
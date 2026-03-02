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
   - Use `mcp_excalidraw_batch_create_elements` to create all elements at once.
   - **Mandatory Elements**:
     - **Title**: A standalone `text` element at the top center. Use `fontFamily: 1` (Virgil/handwritten), `fontSize: 32`, dark `strokeColor` like `#0f172a`.
     - **Border**: A `rectangle` with `backgroundColor: "transparent"`, `strokeStyle: "dotted"`, light `strokeColor` like `#cbd5e1`, that wraps all content with ~20px padding.
     - **Watermark**: A standalone `text` element with `text: "Vizly.dev"`, `fontFamily: 1`, `fontSize: 16`, `strokeColor: "#334155"`, `opacity: 90`. **Position it in the bottom-right corner, well inside the border bounds (not at the edge)**. This ensures it appears both locally and in the shareable excalidraw.com link.
   - **Text Inside Shapes**: ALWAYS embed text into shapes using the shape's own `text` property (e.g., `{ type: "rectangle", text: "Root: 50", ... }`). Do NOT create separate floating text elements overlaying shapes — they will disappear in the shareable URL export.
   - **Aesthetics**:
     - Colors: Blue (`#2980b9`), Green (`#27ae60`), Orange (`#f39c12`), Purple (`#8e44ad`).
     - Shape backgrounds: Use solid light tints like `#dbeafe` (blue), `#dcfce7` (green), `#fef9c3` (yellow), `#ede9fe` (purple).
     - Set `fontFamily: 1` on all shapes and text for the handwritten Excalidraw style.

4. **Verify and Share**:
   - **Local Verification**: Direct the user to [http://localhost:3100](http://localhost:3100) to preview in real-time.
   - **Export & Share**: Call `mcp_excalidraw_export_to_excalidraw_url` to get the shareable link.
   - Confirm with the user that both the text labels AND the "Vizly.dev" watermark are visible in the shareable URL.
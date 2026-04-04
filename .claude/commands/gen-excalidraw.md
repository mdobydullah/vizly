Generate a technical design overview in Excalidraw for a specific topic or guide.

1. **Check Prerequisites**: Ensure the Excalidraw Canvas server is running. Refer to `.docs/excalidraw.md` for setup.

2. **Understand the Topic**:
   - If the topic refers to an existing guide in `src/components/guides/`, read the file to understand key visual elements.
   - If it's a new topic, propose a standard visual representation.

3. **Design the Layout** using `mcp_excalidraw_batch_create_elements`:
   - **Title**: Standalone `text` at top center. `fontFamily: 1` (Virgil), `fontSize: 32`, `strokeColor: #0f172a`.
   - **Border**: `rectangle` with `backgroundColor: "transparent"`, `strokeStyle: "dotted"`, `strokeColor: #cbd5e1`, wrapping all content with ~20px padding.
   - **Watermark**: `text` with `"Vizly.dev"`, `fontFamily: 1`, `fontSize: 16`, `strokeColor: #334155`, `opacity: 90`. Position bottom-right inside border.
   - **Text Inside Shapes**: ALWAYS use the shape's own `text` property. Do NOT create separate floating text elements.
   - **Colors**: Blue `#2980b9`, Green `#27ae60`, Orange `#f39c12`, Purple `#8e44ad`. Shape backgrounds: `#dbeafe`, `#dcfce7`, `#fef9c3`, `#ede9fe`. Set `fontFamily: 1` on all elements.

4. **Verify and Share**:
   - Preview at http://localhost:3100
   - Export via `mcp_excalidraw_export_to_excalidraw_url`
   - Confirm labels and watermark are visible in the shareable URL.

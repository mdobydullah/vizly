# Using Excalidraw for Vizly Designs

This document explains how to use the Excalidraw MCP to generate and manage technical diagrams for the Vizly project.

## 🚀 Getting Started

To use Excalidraw programmatically with your AI agent, ensure the Excalidraw Canvas server is running.

### 1. Check if the server is running
The AI agent uses the Excalidraw MCP which communicates with a canvas server. You can check if the docker container is running:

```bash
docker ps | grep mcp-excalidraw-canvas-antigravity
```

### 2. Run the Canvas Server
If the server is not running, start it using the following command:

```bash
docker run -d -p 3100:3000 --name mcp-excalidraw-canvas-antigravity ghcr.io/yctimlin/mcp_excalidraw-canvas:latest
```

## 🎨 Workflow

1.  **Generate Designs**: Ask the AI to create a design using the `excalidraw` MCP tools.
2.  **View & Edit**: The AI will provide a shareable `excalidraw.com` URL where you can view and manually tweak the design.
3.  **Export**: Export your final design as a **3x PNG** from the Excalidraw interface for high-quality social media posts.

## 🛠️ MCP Configuration

The project uses the following MCP configuration (located in `~/.gemini/antigravity/mcp_config.json`):

```json
"excalidraw": {
    "command": "docker",
    "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "EXPRESS_SERVER_URL=http://host.docker.internal:3100",
        "-e",
        "ENABLE_CANVAS_SYNC=true",
        "ghcr.io/yctimlin/mcp_excalidraw:latest"
    ]
}
```

For more details on the Docker setup, see the [Quick Start Docker Guide](https://github.com/yctimlin/mcp_excalidraw?tab=readme-ov-file#quick-start-docker).

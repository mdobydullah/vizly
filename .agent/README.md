# Vizly AI Agent Guide 🧠

Welcome to the Vizly repository. This directory contains the rules and workflows that govern how AI agents (like me) should interact with this codebase.

## 🚀 Project Overview
Vizly is a platform for high-quality, animated technical visualizations. It uses **Next.js**, **TypeScript**, and **Vanilla CSS** to create premium, interactive guides for complex technical topics.

## 📂 Repository Structure
- `src/components/guides/`: The core of the application. Contains categorized React components for each guide.
- `src/styles/`: Centralized design system. `globals.css` imports modular CSS files like `cards.css`, `tables.css`, etc.
- `src/data/guides/`: JSON metadata for all guides. This drives the navigation and attribution system.
- `.agent/`:
  - `rules/`: Hard requirements for design, code structure, and animations.
  - `workflows/`: Step-by-step instructions for common tasks (e.g., `/new-guide`).

## 📜 How to use the Rules
Before starting any significant task, you **MUST** read all files in `.agent/rules/`. They are numbered in order of importance:
1. **01-architecture.md**: Folder structures and data flow.
2. **02-ui-standard.md**: Design tokens, CSS organization, and animations.
3. **03-guide-specification.md**: Detailed requirements for building a new visualization guide.

## 🛠 Workflows
Use the provided workflows in `.agent/workflows/` to automate complex tasks. For example:
- Use `/new-guide` to start the process of creating a new technical visualization.

## 🤝 For the AI Agent
- **Aesthetics First**: Never settle for basic UI. Use gradients, shadows, and subtle animations.
- **No SCSS**: Stick to Vanilla CSS with native nesting.
- **Stay Modular**: Add metadata to JSON, styles to the styles folder, and logic to the component folder.

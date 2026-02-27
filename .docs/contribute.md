# Contributing to Vizly

Thank you for your interest in contributing to Vizly! This project is a collective effort to make complex engineering concepts intuitive. Follow these steps to get started.

## Git Workflow

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally: `git clone https://github.com/your-username/vizly.git`.
3.  **Sync** with the main repo: `git remote add upstream https://github.com/mdobydullah/vizly.git`.
4.  **Create a branch** for your work: `git checkout -b feat/my-new-guide`.
5.  **Make your changes** (see sections below).
6.  **Push** to your fork: `git push origin feat/my-new-guide`.
7.  **Open a Pull Request** to the `main` branch.

---

## 1. Create Your Contributor Profile

Every visual guide is linked to one or more contributors. To keep things organized, we use a geographic folder structure: `src/data/contributors/country-name/hometown.json`. Please use **full country names** in kebab-case (e.g., `united-states` instead of `usa`).

**Examples:**
- `src/data/contributors/bangladesh/tangail.json`
- `src/data/contributors/united-states/san-francisco.json`

```json
{
    "username": "obydul",
    "name": "Obydul",
    "bio": "Software Engineer",
    "handles": [
        { "url": "https://github.com/your-username" },
        { "url": "https://linkedin.com/in/your-profile" }
    ]
}
```

> **Note:** A maximum of **5 handles** will be displayed. The system automatically detects icons for GitHub, Twitter/X, and LinkedIn.

---

## 2. Add Guide using AI (Recommended)

Vizly is designed to be **AI-Ready**. If you are using an AI agent (like Claude, ChatGPT, Gemini, or OpenCode) to help you build a visualization, follow these steps for the best results:

### Point to the Agent Environment
Direct the AI to the `.agent/` directory immediately. You can say:
> "Please read `.agent/README.md` and follow all files in `.agent/rules/` before starting."

### Use Specialized Workflows
We have pre-defined workflows to maintain consistency. You can trigger them by name:
- **`/new-guide`**: Starts the step-by-step process for a new visualization.
- **`/commit`**: Generates a standardized commit message for your changes.

### Examples

**For any IDE / model:**
> Please read `.agent/README.md` and follow all files in `.agent/rules/` before starting.
>
> Topic: Event-Driven Architecture
>
> *(Then any extra optional instructions)*

**For Antigravity:**
> /new-guide
>
> Topic: Event-Driven Architecture
>
> *(Then any extra optional instructions)*

---

## 3. Manual Guide Implementation

If you prefer building manually, follow this professional workflow:

### A. Add Guide Metadata
Add an entry to a category file (e.g., `src/data/guides/performance.json`).

```json
[
    {
        "id": "your-guide-slug",
        "title": "Topic Name",
        "category": "Architecture",
        "tags": ["Distributed Systems"],
        "description": "Short explanation of the visualization.",
        "icon": "🚀",
        "link": "/guides/your-guide-slug",
        "color": "cyan",
        "colorConfig": {
            "primary": "#00e5ff",
            "background": "rgba(0, 229, 255, .08)",
            "border": "rgba(0, 229, 255, .15)",
            "hoverShadow": "0 0 32px rgba(0, 229, 255, .4)"
        },
        "createdAt": "2024-03-20T10:00:00Z",
        "updatedAt": "2024-03-20T10:00:00Z",
        "contributors": "your-username"
    }
]
```

### B. Develop the Component
Create your React component in `src/components/guides/[category]/[TopicName]Guide.tsx`.
- Use the `GuideLayout` for a consistent experience.
- Maintain the project's design system tokens (colors, fonts).

### C. Naming & Registration
The system **automatically discovers** your guide if you follow these naming rules:
1. **Filename**: Must end with `Guide.tsx` (e.g., `CdnGuide.tsx`).
2. **Export**: Use a named export matching the filename (`export function CdnGuide()`).
3. **ID Match**: Your metadata `id` MUST match the kebab-case version of the filename (e.g., `cdn`).

---

## Summary Checklist
- [ ] Added profile to `src/data/contributors/`
- [ ] Added metadata to `src/data/guides/`
- [ ] Created guide component in `src/components/guides/`

If you have any questions, feel free to reach out to [@obydul](https://www.linkedin.com/in/obydul)!

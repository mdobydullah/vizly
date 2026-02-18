# Contributing to Vizly

Thank you for your interest in contributing to Vizly! This guide will help you set up your contributor profile and add new visual guides to the platform.

## 1. Create Your Contributor Profile

Every visual guide is linked to one or more contributors. To keep things organized, we use a geographic folder structure: `src/data/contributors/country-name/hometown.json`. Please use **full country names** in kebab-case (e.g., `united-states` instead of `usa`).

**Examples:**
- `src/data/contributors/bangladesh/tangail.json`
- `src/data/contributors/united-states/san-francisco.json`
- `src/data/contributors/united-kingdom/london.json`

```json
{
    "username": "obydul",
    "name": "Obydul",
    "bio": "Software Engineer",
    "handles": [
        { "url": "https://github.com/your-username" },
        { "url": "https://linkedin.com/in/your-profile" }
    ] // Max 5 handles will be displayed
}
```

> **Note:** A maximum of **5 handles** will be displayed on your profile. The system automatically detects the icon based on the domain (e.g., GitHub, Twitter/X, LinkedIn).

## 2. Add Guide Metadata

Guides are categorized and displayed on the home page based on metadata files in `src/data/guides/`.

**File Path Example:** `src/data/guides/performance.json` (or create a new category file)

```json
[
    {
        "id": "your-guide-id",
        "title": "A Great Technical Topic",
        "category": "Architecture",
        "tags": ["Distributed Systems", "Scaling"],
        "description": "A deep dive into how X works with interactive animations.",
        "icon": "🚀",
        "link": "/guides/your-guide-id",
        "color": "cyan",
        "colorConfig": {
            "primary": "#00e5ff",
            "background": "rgba(0, 229, 255, .08)",
            "border": "rgba(0, 229, 255, .15)",
            "hoverShadow": "0 0 32px rgba(0, 229, 255, .4)"
        },
        "createdAt": "2024-03-20T10:00:00Z",
        "updatedAt": "2024-03-20T10:00:00Z",
        "contributors": "your-username, collaborator-username"
    }
]
```

> **Tip:** You can list multiple contributors by using a comma-separated string of usernames.

## 3. Develop the Guide Component

Guides are built using React and modern CSS. Create your component in a relevant subdirectory under `src/components/guides/`.

**File Path Example:** `src/components/guides/architecture/YourGuide.tsx`

> **Note:** Use the `GuideLoader` component for loading states and try to maintain the project's design system tokens (colors, fonts).

## 4. Register Your Guide

Finally, you need to tell the application about your new component so it can be rendered at `/guides/your-guide-id`.

Open `src/components/guides/index.tsx` and add your component to the `guideComponents` mapping:

```tsx
export const guideComponents: Record<string, any> = {
    // ... existing guides
    'your-guide-id': dynamic(() => import('./architecture/YourGuide').then(mod => mod.YourGuide), {
        loading: () => <GuideLoader />
    }),
};
```
## 5. How to use AI Models

Vizly is designed to be **AI-Ready**. If you are using an AI agent (like Claude, ChatGPT, Gemini, or OpenCode) to help you build a guide, follow these steps to ensure the best results:

### Point to the Agent Environment
Direct the AI to the `.agent/` directory immediately. You can say:
> "Please read `.agent/README.md` and follow all files in `.agent/rules/` before starting."

### Use Specialized Workflows
We have pre-defined workflows to maintain consistency. You can trigger them by name:
- **`/new-guide`**: Starts the step-by-step process for a new visualization.
- **`/commit`**: Generates a standardized commit message for your changes.

### Follow the Rules
Each numbered rule in `.agent/rules/` ensures the AI stays within project boundaries:
1. **01-architecture.md**: Folder structure and data flow.
2. **02-ui-standard.md**: Design language (Vanilla CSS, native nesting, design tokens).
3. **03-guide-specification.md**: Mandatory sections (Mermaid, Animated Flow, Legend) for every guide.

### Reference "Golden Samples"
If the AI is struggling with the UI, point it to a high-quality existing guide:
> "Look at `src/components/guides/infrastructure/LoadBalancingGuide.tsx` as a golden reference for this layout."


## Summary Checklist
- [ ] Added profile to `src/data/contributors/`
- [ ] Added metadata to `src/data/guides/`
- [ ] Created guide component in `src/components/guides/`
- [ ] Registered component in `src/components/guides/index.tsx`

If you have any questions, feel free to reach out to @obydul!

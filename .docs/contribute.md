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
    "role": "Software Engineer",
    "handles": [
        { "url": "https://github.com/your-username" },
        { "url": "https://linkedin.com/in/your-profile" }
    ] // Max 5 handles will be displayed
}
```

> **Note:** A maximum of **5 handles** will be displayed on your profile. The system automatically detects the icon based on the domain (e.g., GitHub, Twitter/X, LinkedIn).

## 2. Add Visual Metadata

Visuals are categorized and displayed on the home page based on metadata files in `src/data/visuals/`.

**File Path Example:** `src/data/visuals/performance.json` (or create a new category file)

```json
[
    {
        "id": "your-visual-id",
        "title": "A Great Technical Topic",
        "category": "Architecture",
        "tags": ["Distributed Systems", "Scaling"],
        "description": "A deep dive into how X works with interactive animations.",
        "icon": "🚀",
        "link": "/visuals/your-visual-id",
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

## 3. Develop the Visual Component

Visuals are built using React and modern CSS. Create your component in a relevant subdirectory under `src/components/visuals/`.

**File Path Example:** `src/components/visuals/architecture/YourVisual.tsx`

> **Note:** Use the `VisualLoader` component for loading states and try to maintain the project's design system tokens (colors, fonts).

## 4. Register Your Visual

Finally, you need to tell the application about your new component so it can be rendered at `/visuals/your-visual-id`.

Open `src/components/visuals/index.tsx` and add your component to the `visualComponents` mapping:

```tsx
export const visualComponents: Record<string, any> = {
    // ... existing visuals
    'your-visual-id': dynamic(() => import('./architecture/YourVisual').then(mod => mod.YourVisual), {
        loading: () => <VisualLoader />
    }),
};
```

## Summary Checklist
- [ ] Added profile to `src/data/contributors/`
- [ ] Added metadata to `src/data/visuals/`
- [ ] Created visual component in `src/components/visuals/`
- [ ] Registered component in `src/components/visuals/index.tsx`

If you have any questions, feel free to reach out to @obydul!

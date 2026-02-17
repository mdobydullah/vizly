# Add Contributors

Vizly makes it easy to add and manage contributors. Contributor data is centralized, allowing you to reuse the same profile across multiple visuals.

## 1. Create a Contributor Profile

Create a new JSON file in `src/data/contributors/`. You can organize these files into subdirectories if needed (e.g., by team or location).

**Example:** `src/data/contributors/jdoe.json`

```json
{
    "username": "jdoe",
    "name": "Jane Doe",
    "role": "Software Engineer",
    "handles": [
        {
            "url": "https://github.com/janedoe"
        },
        {
            "url": "https://linkedin.com/in/janedoe"
        },
        {
            "url": "https://janedoe.com"
        }
    ]
}
```

### Profile Fields:
- `username` (Required): A unique ID used to reference the contributor.
- `name` (Required): The display name appearing on the site.
- `role` (Required): The contributor's title or contribution (e.g., "Designer", "Writer").
- `handles` (Array): A list of social or personal links.
    - `url`: The full link. Vizly automatically detects the icon based on the domain (GitHub, Twitter/X, LinkedIn, etc.).

---

## 2. Link Contributor to a Visual

Find the visual's data file in `src/data/visuals/` (e.g., `auth.json`). Add the contributor's `username` to the `contributors` field as a comma-separated string.

**Example:** `src/data/visuals/auth.json`

```json
{
    "id": "jwt",
    "title": "JSON Web Token",
    "contributors": "obydul, jdoe",
    ...
}
```

---

## 3. How it Works
- **Dynamic Loading**: Any `.json` file added to `src/data/contributors/` (including subfolders) is automatically indexed by the system.
- **Auto-Resolution**: The visual data loader converts the `username` strings into full contributor objects before passing them to the UI.
- **Smart UI**: The `VisualLayout` component displays a summary button in the header and detailed profiles at the bottom. Clicking the summary smoothly scrolls the user to the contributors section.

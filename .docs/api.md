# Visuals API Documentation

This document describes the API endpoint available for retrieving visual data dynamically from the project.

## Endpoint

**`GET /api/visuals`**

Returns a merged list of all visual guides defined in the `src/data/visuals/` directory.

---

## Authentication

The API is protected. All requests must include the `x-api-key` header.

| Header | Description |
| :--- | :--- |
| `x-api-key` | Your secret API key (stored in `.env.local` as `NEXT_PUBLIC_API_KEY`) |

---

## Technical Details

### Automatic Merging
The endpoint dynamically scans the `src/data/visuals/` directory and merges all `.json` files (e.g., `auth.json`, `performance.json`, `api.json`). This ensures that adding a new category file automatically updates the API response.

---

## Usage Examples

### cURL
```bash
curl -H "x-api-key: YOUR_SECRET_KEY" https://your-domain.com/api/visuals
```

### JavaScript (fetch)
```javascript
const response = await fetch('/api/visuals', {
  headers: {
    'x-api-key': 'YOUR_SECRET_KEY'
  }
});
const data = await response.json();
console.log(data.visuals);
```

---

## Example Response

```json
{
  "visuals": [
    {
      "id": "jwt",
      "title": "JSON Web Token",
      "category": "Auth · Security",
      "tags": ["Auth", "Security", "Token"],
      "description": "How JWTs are structured, encoded, and verified...",
      "readTime": "8 min read",
      "icon": "🔐",
      "link": "/visuals/jwt",
      "color": "cyan",
      "colorConfig": {
        "primary": "#00e5ff",
        "background": "rgba(0, 229, 255, .08)",
        "border": "rgba(0, 229, 255, .15)",
        "hoverShadow": "0 0 32px rgba(0, 229, 255, .4), 0 0 16px rgba(0, 229, 255, .2)"
      },
      "createdAt": "2025-02-10T10:00:00Z",
      "updatedAt": "2025-02-17T08:30:00Z"
    }
  ]
}
```

---

## Error Codes

| Status | Description |
| :--- | :--- |
| `200 OK` | Success. Returns the merged list of visuals. |
| `401 Unauthorized` | Invalid or missing `x-api-key` header. |
| `500 Internal Server Error` | Something went wrong on the server while reading the data. |

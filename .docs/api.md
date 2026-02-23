# Guides API Documentation

This document describes the API endpoint available for retrieving guide data from the project.

## Endpoint

**`GET /api/guides`**

Recursively scans `src/data/guides/` and returns a merged, sorted list of all guides. Active guides (newest first) always appear before upcoming guides (`link: "#"`).

---

## Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `status` | `active` \| `upcoming` \| `all` | `all` | Filter by guide status. `active` = published guides; `upcoming` = placeholder guides (`link: "#"`); `all` = both, with upcoming always at the end. |
| `take` | `number` | `20` | Number of guides to return (minimum: 1). |
| `skip` | `number` | `0` | Number of guides to skip for pagination (minimum: 0). |

---

## Technical Details

### Automatic Merging
The endpoint recursively scans `src/data/guides/` and merges all `.json` files across category subdirectories (e.g., `database/database.json`, `auth/auth.json`). `guide-colors.json` is always excluded. Adding a new category file automatically reflects in the response.

### Ordering
1. Active guides sorted by `createdAt` **descending** (newest first).
2. Upcoming guides (`link: "#"`) always appended at the end.
3. Pagination (`skip` / `take`) is applied after ordering.

---

## Usage Examples

### cURL
```bash
# All guides (first 20)
curl https://your-domain.com/api/guides

# Active guides only, page 2
curl "https://your-domain.com/api/guides?status=active&skip=20&take=20"

# Upcoming guides only
curl "https://your-domain.com/api/guides?status=upcoming"
```

### JavaScript (fetch)
```javascript
const res  = await fetch('/api/guides?status=active&take=10');
const data = await res.json();

console.log(data.total);   // total matching guides
console.log(data.guides);  // current page
```

---

## Example Response

```json
{
  "total": 7,
  "skip": 0,
  "take": 20,
  "guides": [
    {
      "id": "database-indexing",
      "title": "Database Indexing",
      "category": "Database",
      "tags": ["Database", "Performance", "Query"],
      "description": "B-Trees, hash indexes, and composite indexes...",
      "icon": "�",
      "link": "/guides/database-indexing",
      "color": "cyan",
      "colorConfig": {
        "primary": "#00e5ff",
        "background": "rgba(0, 229, 255, .08)",
        "border": "rgba(0, 229, 255, .15)",
        "hoverShadow": "0 0 32px rgba(0, 229, 255, .4), 0 0 16px rgba(0, 229, 255, .2)"
      },
      "createdAt": "2026-02-23T05:21:00Z",
      "updatedAt": "2026-02-23T05:21:00Z",
      "contributors": "obydul"
    }
  ]
}
```

---

## Error Codes

| Status | Description |
| :--- | :--- |
| `200 OK` | Success. Returns the paginated list of guides. |
| `500 Internal Server Error` | Something went wrong on the server while reading the data. |

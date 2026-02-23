---
trigger: always_on
---

# Rule 01: Architecture & Data Flow

## 1. Directory Mapping
All new content must follow this layout:
- **Components**: `src/components/guides/[category]/[Topic]Guide.tsx`
- **Styles**: `src/styles/guides/[category]/[topic].css` (if topic-specific styles are needed).
- **Metadata**: `src/data/guides/[category]/[category].json` (Loaded recursively).

## 2. The Data Connection
The application uses a centralized data system:
- `src/data/guides/index.ts` aggregates all category JSON files.
- Every guide component MUST find its own metadata using its unique ID:
  ```tsx
  import { guidesData } from '@/data/guides';
  const guide = guidesData.guides.find(v => v.id === "unique-id")!;
  ```
- This `guide` object must be passed to the `<GuideLayout>` component for attribution and metadata rendering.

## 3. Reference Architecture
Use these files as the "Gold Standard" for implementation:
- `src/components/guides/infrastructure/LoadBalancingGuide.tsx` (Complex state & comparisons)
- `src/components/guides/performance/CachingStrategiesGuide.tsx` (Clean grid implementation)
- `src/components/guides/auth/JwtGuide.tsx` (Simple flow structure)

## 4. Metadata Best Practices (musr do)
- **ID Consistency**: Ensure the `id` used in `find()` matches exactly with the one in metadata JSON.
- **Timestamps**: When creating or updating metadata, ALWAYS set `createdAt` and `updatedAt` to the current UTC time in ISO 8601 format with full hour and minute precision (e.g., `2026-02-19T09:57:32Z`). Never use midnight (`00:00:00Z`) as a placeholder.
- **Icons**: Use descriptive emojis for the `icon` field.

# Essence of Linear Algebra — Series Plan

## Goal
Geometric, intuition-first linear algebra for interview prep and easy understanding. Modeled after 3Blue1Brown's "Essence of Linear Algebra". Light story + visual explainer style (not heavy DSA-dungeon framing). Every article links the original YouTube video.

## Placement
- **Category**: new `math` category (`src/data/articles/categories.json`), color `blue`, icon `sigma`.
- **Series**: standalone (no learning path) at `src/data/articles/series/essence-of-linear-algebra.json`.
- **Articles**: `src/content/articles/essence-of-linear-algebra/<NN>-<slug>.mdx`, all `category: math`, `color: blue`.
- **Fundamentals**: chapters 1–3 carry `fundamental: true` in the series JSON, which renders a "★ Fundamental" badge on the series detail page (added optional `fundamental` to `SeriesArticleEntry` type + `SeriesDetailClient`).

## Style (Rule 04)
Conversational, human, not AI-sounding. One everyday hook per chapter. Geometric intuition first, then the math, then a worked example, gotchas, takeaways, next-chapter teaser. Matrices shown in code fences (no KaTeX in the project). Mermaid for flow/geometry. YouTube link in an `info` Callout at the top.

## Chapters + video IDs (3b1b playlist PLeIm2H-ScmLUcd64p-Q1S-cyLo1EFrEka)
1. Vectors, What Even Are They? — fNk_zzaMoSs — **fundamental** — DONE
2. Linear Combinations, Span, and Basis Vectors — k7RM-ot2NWY — **fundamental** — DONE
3. Linear Transformations and Matrices — kYB8IZa5AuE — **fundamental** — DONE
4. Matrix Multiplication as Composition — XkY2DOUCWMU — stub
5. Three-Dimensional Linear Transformations — rHLEWRxRGiM — stub
6. The Determinant — Ip3X9LOh2dk — stub
7. Inverse Matrices, Column Space, and Null Space — uQhTuRlWMxw — stub
8. Nonsquare Matrices as Transformations Between Dimensions — v8VSDg_WQlA — stub
9. Dot Products and Duality — LyGKycYT2v0 — stub
10. Cross Products — eu6i7WJeinw — stub
11. Cross Products in the Light of Linear Transformations — BaM7OCEm3G0 — stub
12. Cramer's Rule, Explained Geometrically — jBsC34PxzoM — stub
13. Change of Basis — P2LTAUO1TdA — stub
14. Eigenvectors and Eigenvalues — PFDu9oVAE-g — stub
15. A Quick Trick for Computing Eigenvalues — e50Bj7jn9IQ — stub
16. Abstract Vector Spaces — TgKwz5Ikpc8 — stub

## Status
- [x] `math` category added
- [x] `fundamental` field on `SeriesArticleEntry` + badge in `SeriesDetailClient`
- [x] Series JSON with all 16 chapters (1–3 marked fundamental)
- [x] Chapters 1 to 16 — all full articles written (no stubs remaining)
- [x] Prose style: easy/junior-friendly, zero em dashes (per user request)

## Next
Series complete. Optional follow-ups: animated guides per concept, or extend the `math` category with calculus/stats series and wrap into a learning path.

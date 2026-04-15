# DSA Quest — Fun NeetCode Alternative

## Problem
NeetCode 150 popular but dry. Watch video → grind LeetCode UI → repeat. No story, no dopamine, no visual intuition. Devs bounce from boredom, not difficulty.

## Vision
Vizly-native DSA learning track. Story-framed problems + animated pattern guides + gamified progress. Fun enough that learners finish what they start.

## Strategy: Lean Series MVP First
Ship story + animated guide series. Skip interactive sandbox until appetite proven. Measure → decide.

Why lean first:
- Reuses existing Vizly muscle (guides + articles + series)
- Days not weeks
- Most learners quit NeetCode from boredom, not missing sandbox
- Sandbox is risk: per-problem step-debugger = big eng lift, unvalidated

## Roadmap — Follow NeetCode DAG
Dependencies are real (Sliding Window needs Two Pointers, Trees need recursion, DP needs trees/graphs). We follow NeetCode's 18-pattern order as the dungeon map, reinvent the *experience*, not the order.

Full dungeon list (ship in order):
1. **Arrays & Hashing** — Dungeon 1 (next to build)
2. **Two Pointers** — Dungeon 2 (in progress — Boss 1 shipped)
3. Stack
4. Binary Search
5. Sliding Window
6. Linked List
7. Trees
8. Tries
9. Backtracking
10. Heap / Priority Queue
11. Graphs
12. 1-D DP
13. Intervals
14. Greedy
15. Advanced Graphs
16. 2-D DP
17. Bit Manipulation
18. Math & Geometry

Note: Two Pointers was built out of order as MVP validation. That's fine — it's self-contained. Going forward, build remaining dungeons in strict NeetCode order starting from Arrays & Hashing.

## File Structure
Canonical nested layout (see Rule 01 §6):
- **Learning Path**: `src/data/articles/paths/dsa-quest.json` — lists all 18 series slugs
- **Series JSONs**: `src/data/articles/series/dsa-quest/<dungeon-slug>.json` — slug = plain pattern name (`two-pointers`, not `dsa-quest-two-pointers`). Stubs created for all 18 dungeons so path page renders "Soon" badges.
- **Articles**: `src/content/articles/dsa-quest/<dungeon-slug>/<NN>-<story-slug>.mdx` — dungeon subfolder mirrors series layout. `NN-` is for filesystem sort order only.
- **Color**: Entire path is `orange` (Rule 01 §7). All series JSONs and all article frontmatter under dsa-quest must use `orange`.
- **Category**: Articles use `category: dsa` in frontmatter (folder path is separate from category slug).
- **Animated guide** (optional, phase 2): `/guides/programming/<pattern>` — shows pattern movement live

### Problem list (Two Pointers)
1. Valid Palindrome → "Museum mirror check"
2. Two Sum II (sorted) → "Heist loot split"
3. 3Sum → "Party table seating"
4. Container With Most Water → "Rain barrel builder"
5. Trapping Rain Water → "Rooftop puddle map"
6. Remove Duplicates → "Concert guest list cleanup"

### Article format (per problem)
1. **Story hook** — 2-3 sentences, narrative setup
2. **Real problem** — show LeetCode-style statement
3. **Naive attempt** — what beginner tries, why slow
4. **Pattern reveal** — two pointers visualized (mermaid or animated)
5. **Walk-through** — step-by-step with diagrams
6. **Code** — clean solution
7. **Gotchas** — edge cases
8. **Next boss** — teaser for next article

### Tone (Rule 04)
Conversational, human-friendly, not AI-sounding. Analogies from daily life. Short paragraphs.

## Phase 2 (if MVP validates)
- Animated interactive guide for pattern (sandbox-lite: replay pointer movement on example array)
- Boss-fight UI: gate next article on completion checkbox
- Collectible pattern cards (visual cheatsheet deck)
- Spaced repetition: resurface past problems

## Phase 3 (if still growing)
- Full interactive sandbox per problem (drag array, step through)
- More patterns: Sliding Window, BFS, DFS, Backtracking, DP, Heap, Union-Find
- XP + streaks + dungeon map UI

## Success Metrics (MVP)
- Time-on-page per article
- Series completion rate (article 1 → article N)
- Social shares / referrals
- Qualitative: do people ask for next pattern?

## Status

### Infrastructure
- [x] Learning path `dsa-quest.json` created
- [x] Series loader recursive (supports `series/dsa-quest/*.json`)
- [x] Story summary component multi-lang (en/bn/hi/ar) shipped
- [x] Rule 07 — story summary tone standards
- [x] Stubs for all 18 dungeons so path page renders full roadmap

### Dungeon 1 — Arrays & Hashing (COMPLETE)
- [x] Series JSON with real article list
- [x] Boss 1: Contains Duplicate — Coat Check (hash set)
- [x] Boss 2: Valid Anagram — Scrabble Swap (hash map counter)
- [x] Boss 3: Two Sum — Lunch Bill Split (complement lookup)
- [x] Boss 4: Group Anagrams — Sock Drawer (canonical key)
- [x] Boss 5: Top K Frequent — Jukebox Charts (bucket sort)
- [x] Boss 6: Product Except Self — Factory Line (prefix/suffix)
- [x] Boss 7: Longest Consecutive — Yearbook Chain (hash set streak walking)

### Dungeon 2 — Two Pointers (COMPLETE)
- [x] Series JSON created
- [x] Boss 1: Valid Palindrome (Museum Mirror)
- [x] Boss 2: Two Sum II (Heist Loot Split)
- [x] Boss 3: 3Sum (Party Table Seating)
- [x] Boss 4: Container With Most Water (Rain Barrel)
- [x] Boss 5: Trapping Rain Water (Rooftop Puddles)
- [x] Boss 6: Remove Duplicates (Guest List Cleanup)

### Dungeons 3-18
- [ ] Stack, Binary Search, Sliding Window, Linked List, Trees, Tries, Backtracking, Heap/PQ, Graphs, 1-D DP, Intervals, Greedy, Advanced Graphs, 2-D DP, Bit Manipulation, Math & Geometry

### Phase gates
- [ ] Phase 2 decision after Dungeon 1+2 ship and metrics reviewed

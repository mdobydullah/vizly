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
1. **Arrays & Hashing** — Dungeon 1 (COMPLETE)
2. **Two Pointers** — Dungeon 2 (COMPLETE)
3. **Stack** — Dungeon 3 (COMPLETE)
4. **Binary Search** — Dungeon 4 (COMPLETE)
5. **Sliding Window** — Dungeon 5 (next to build)
6. **Linked List** — Dungeon 6
7. **Trees** — Dungeon 7
8. **Tries** — Dungeon 8
9. **Backtracking** — Dungeon 9
10. **Heap / Priority Queue** — Dungeon 10
11. **Graphs** — Dungeon 11
12. **1-D DP** — Dungeon 12
13. **Intervals** — Dungeon 13
14. **Greedy** — Dungeon 14
15. **Advanced Graphs** — Dungeon 15
16. **2-D DP** — Dungeon 16
17. **Bit Manipulation** — Dungeon 17
18. **Math & Geometry** — Dungeon 18

Note: Two Pointers was built out of order as MVP validation. That's fine — it's self-contained. Going forward, build remaining dungeons in strict NeetCode order starting from Sliding Window.

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

### Dungeon 3 — Stack (COMPLETE)
- [x] Series JSON with real article list
- [x] Boss 1: Valid Parentheses (Locksmith's Keys)
- [x] Boss 2: Min Stack (Warehouse Foreman)
- [x] Boss 3: Evaluate Reverse Polish Notation (Calculator Factory)
- [x] Boss 4: Generate Parentheses (Architect's Blueprints)
- [x] Boss 5: Daily Temperatures (Weather Station)
- [x] Boss 6: Car Fleet (Highway Convoy)
- [x] Boss 7: Largest Rectangle in Histogram (Billboard Builder)

### Dungeon 4 — Binary Search (COMPLETE)
- [x] Series JSON with real article list
- [x] Boss 1: Binary Search (Librarian's Ledger)
- [x] Boss 2: Search a 2D Matrix (Archive Grid)
- [x] Boss 3: Koko Eating Bananas (Warehouse Deadline)
- [x] Boss 4: Find Minimum in Rotated Sorted Array (Night Shift Logbook)
- [x] Boss 5: Search in Rotated Sorted Array (Shifted Vault Codes)
- [x] Boss 6: Time Based Key-Value Store (Ticker Tape)
- [x] Boss 7: Median of Two Sorted Arrays (Twin Libraries)

### Dungeons 5-18
- [ ] Sliding Window, Linked List, Trees, Tries, Backtracking, Heap/PQ, Graphs, 1-D DP, Intervals, Greedy, Advanced Graphs, 2-D DP, Bit Manipulation, Math & Geometry

### Phase gates
- [ ] Phase 2 decision after Dungeon 1+2 ship and metrics reviewed

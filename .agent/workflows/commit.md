---
description: generate a one-line git commit message for the current changes
---

1. **Check Status**:
   Run `git status` to see which files were modified.

2. **Summarize Changes**:
   Analyze the recent edits made in the conversation, focusing on:
   - Component refactors
   - New features (settings, context, etc.)
   - Bug fixes or logic cleanups

3. **Format Message**:
   Write a single-line commit message in the format `prefix: descriptive message`.
   Examples:
   - `feat: add global animation settings and footer controls`
   - `refactor: move visual styles to globals.css and clean up animation logic`
   - `fix: correct visibility issues in guided flows`

4. **Present to User**:
   Share the one-line commit message with the user.

5. **Final Action**:
   Ask the user if they would like you to execute the `git add .`, commit, and push the changes.

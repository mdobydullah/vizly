Generate a one-line git commit message for the current changes.

1. Run `git diff --staged` and `git status` to see what's changed.
2. Analyze the changes — component refactors, new features, bug fixes, etc.
3. Write a single-line commit message in the format `prefix: descriptive message`.
   Examples:
   - `feat: add global animation settings and footer controls`
   - `refactor: move guide styles to guides.css and clean up animation logic`
   - `fix: correct visibility issues in guided flows`
4. Present the message to the user.
5. Ask if they want to commit.

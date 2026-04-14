# Rule 07: Story Summary (Multi-Language)

Some articles (especially story-framed ones like the DSA Quest series) include a `storySummary` field in frontmatter. It renders at the top of the article as a collapsible, multi-language card. This rule covers when to write one and how it must sound.

## 1. When to include a story summary
- **Required** for DSA Quest articles and any other story-framed series where a narrative hook matters.
- **Optional** for standard explainer articles. If the article has no story, skip it.
- Absence of the field simply hides the component. No code change needed.

## 2. Frontmatter shape
```yaml
storySummary:
  en: |
    English summary here.
  bn: |
    Bangla summary here.
  hi: |
    Hindi summary here.
  ar: |
    Arabic summary here.
```
- Key is a lowercase ISO-639-1 code (`en`, `bn`, `hi`, `ar`, `es`, `fr`, ...).
- Value is plain text (YAML block scalar `|` for multi-line). No markdown, no HTML, no MDX components.
- Keep each summary to **3–5 short sentences**. This is a hook, not a TL;DR of the whole article.
- `en` and `bn` are the default baseline. Contributors may add any language.
- RTL languages (`ar`, `ur`, `fa`, `he`) auto-flip direction in the component. Just write them naturally.

## 3. Tone — must sound human, not AI
This is the #1 thing that matters. A story summary should read like someone casually telling a friend about the problem, not a textbook abstract.

### Do
- **Short, simple sentences.** Break long ideas into two sentences instead of one.
- **Everyday words.** "You just got hired at a museum" beats "You've recently been appointed as curator".
- **Natural spoken rhythm.** Read it out loud. If it sounds stiff, rewrite it.
- **Direct address.** Use "you" — you're telling the reader a story about themselves.
- **Light quoting.** Quoting a character ("the boss says 'sort these'") adds life.

### Don't
- **No em dashes (—).** Humans rarely use them in casual writing. Use a comma, period, or "and" instead. One em dash in a whole summary is already too many.
- **No semicolons.** Same reason.
- **No parenthetical asides** stacked back-to-back. One is fine; three in a row reads like a textbook.
- **No "Let's", "In this article", "We'll explore", "dive in", "unlock", "journey".** Classic AI-speak. Cut on sight.
- **No overly-balanced parallel structure.** "Fast to read, easy to learn, fun to practice" sounds AI. Humans are messier.
- **No over-hyphenation.** "state-of-the-art" and "easy-to-follow" stack into walls.
- **Don't restate the full article.** A summary tells the reader *what the story is*, not *what they'll learn step by step*.

### The em dash rule, specifically
Em dashes (—) are the single biggest tell that something was AI-generated. Never use one in a story summary. If you reach for one, rewrite the sentence with a period, comma, or "and" instead.

**Bad (AI-flavored):**
> You just got hired at the museum — your first task is to sort 10,000 mirrors into real artifacts and fakes. The rule is simple — real ones are symmetric, fakes aren't.

**Good (human):**
> You just got hired at a museum. On day one, your boss points at a room full of 10,000 old mirrors and says "sort these. The real ones are symmetric, the fakes aren't."

## 4. Translation guidance (for contributors)
- **Don't translate literally.** Translate the *feel*. A Bangla summary should sound like a Bangla speaker telling the story, not like a machine-translated English sentence.
- **Keep technical terms in English where natural.** "Two Pointers" stays "Two Pointers" in Bangla/Hindi/Arabic — native speakers of all these languages already use English technical terms.
- **Match the English tone and length.** If the EN version is 3 sentences, keep the translation to roughly 3 sentences.
- **Use colloquial phrasing.** "ভাবুন, আপনি..." (Imagine, you...) or "मान लीजिए..." feels natural. Stiff formal register does not.
- **Script and punctuation follow the target language conventions.** Bangla uses `।` for full stops only when it feels natural; modern casual writing often just uses `.`.

## 5. Examples

### Good English
> You just got hired at a museum. On day one, your boss points at a room full of 10,000 old mirrors and says "sort these. The real ones are symmetric, the fakes aren't."
>
> So you read each engraving forward, then backward. If they match, it's real. If they don't, it's a fake.
>
> That's the whole idea behind the Two Pointers pattern. Instead of copying the string and reversing it, you just put one finger at the start and one at the end, then walk them toward the middle.

### Bad English (AI-sounding, em dashes, filler)
> In this article we will explore the Two Pointers pattern — a fundamental technique in algorithmic problem solving. You'll learn how to identify palindromes efficiently, without unnecessary memory overhead. Let's dive in and unlock this powerful pattern together.

## 6. Review checklist
Before committing a story summary, check:

- [ ] **Zero em dashes (—).** Non-negotiable.
- [ ] Reads naturally when spoken aloud.
- [ ] 3–5 sentences per language.
- [ ] No AI filler phrases ("let's dive in", "in this article", "unlock", "journey", "explore").
- [ ] Each language sounds native, not translated.
- [ ] Technical terms (Two Pointers, O(n), etc.) stay in English across all languages.
- [ ] Plain text only. No `**bold**`, no links, no components.
- [ ] Tells the *story*, not the full lesson plan.

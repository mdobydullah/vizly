Review an article MDX file against the Vizly writing standards (Rule 04).

**Input**: Article file path (e.g., `src/content/articles/ai-fundamentals/01-what-is-ai.mdx`). If no path given, ask for one.

## Review Process

1. Read the article file completely.
2. Read `.claude/rules/04-article-writing.md` for the writing standards.
3. Score the article on each dimension below (1-5 scale).
4. List specific issues with line references.
5. Suggest concrete fixes.

## Review Dimensions

### 1. Tone (does it sound human?)
- Flag any AI-sounding phrases: "Let's dive in", "In this article we will explore", "It is important to note", "without further ado"
- Check for conversational "you" and "I" usage
- Look for varied sentence lengths (not all medium-length)
- Check for storytelling/analogies vs dry listing

### 2. Structure
- Paragraphs should be 2-4 sentences max
- Check for punchy standalone sentences
- Headers should be questions or conversational (not academic)
- Progressive complexity (simple → complex)
- Ends with a teaser for the next article?

### 3. Readability
- Jargon must be explained on first use
- No walls of text
- White space usage
- Sentence clarity (could a beginner follow?)

### 4. Visuals
- Are Mermaid diagrams used where they'd help?
- Are Callout boxes used for key takeaways?
- Tables for comparisons?
- Are visuals placed at the right spots (not all bunched together)?

### 5. Technical Accuracy
- Are the concepts explained correctly?
- Any oversimplifications that are misleading?
- Examples that don't quite work?

### 6. Frontmatter
- All required fields present?
- Category matches categories.json?
- Series and seriesOrder set correctly?
- Tags relevant and consistent?

## Output Format

```
## Article Review: [title]

### Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Tone      | X/5   | ...   |
| Structure | X/5   | ...   |
| Readability | X/5 | ...   |
| Visuals   | X/5   | ...   |
| Accuracy  | X/5   | ...   |
| Frontmatter | X/5 | ...  |

### Issues Found
1. [Line X] — issue description → suggested fix
2. ...

### What Works Well
- ...

### Suggested Improvements
- ...
```

After the review, ask if the user wants you to apply the fixes.

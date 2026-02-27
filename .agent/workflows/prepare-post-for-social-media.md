---
description: Prepare social media posts (Facebook & LinkedIn) for a visual guide
---

When the user triggers this workflow to create a social media post about a visual guide, follow these steps:

1. **Verify Inputs**:
   - Check if the user specified the visual guide they want to write a post for (e.g., `src/components/guides/programming/BigONotationGuide.tsx`). If not, politely ask them to provide the path or name of the guide.
   - Check if the user specified any target languages. If not, the default is English. If they want multiple languages, they should list them.

2. **Analyze the Guide Content**:
   - Use the `view_file` tool to read the specified visual guide component.
   - Extract the core concepts, main takeaways, and understand the visual/animated elements being presented in the guide.
   - Determine the URL for the guide (e.g., `https://[domain]/guides/...`).

3. **Draft the Social Media Posts**:
   - **Tone and Style**: Posts should feel natural, conversational, and informal, like sharing a personal experience, thought process, or a story about solving a problem. Avoid overly promotional or generic marketing language.
   - **Use Humble Language**: Because the guide might contain errors, avoid absolute claims. Use softer, humbler words like "might help", "could be useful", or "I think this clarifies" instead of "this will help" or "this is the best way".
   - **Structure**: 
     - Start with a hook: a relatable problem, a question, or a thought process.
     - Build context: Explain why this is important or share the "behind the scenes" motivation.
     - Introduce the solution: Present the guide as a practical, hands-on attempt to solve the problem discussed.
     - Call to action: A low-pressure invitation to try it out, experiment, or see it in action.
   - **LinkedIn Post**: While maintaining the story-telling tone, keep it slightly more professional but still engaging and insightful. Include 3-5 relevant professional hashtags, always including `#Vizly`.
   - **Facebook Post**: Make it highly conversational and relatable. Use related emojis naturally and include 3-5 relevant hashtags, always including `#Vizly`.

4. **Multi-Language Generation**:
   - Present the drafted LinkedIn and Facebook posts in English (or the default requested language).
   - If the user requested Bangla (or other languages), ensure the translation captures the informal, natural "story-telling" essence. It should read like a genuine post from a developer sharing their work with the community, not a direct robotic translation. Ensure the tone and call-to-action remain culturally appropriate and natural in those languages.

5. **Present to User**:
   - Output the drafted posts clearly using Markdown headings so the user can easily copy and paste them to their social channels.

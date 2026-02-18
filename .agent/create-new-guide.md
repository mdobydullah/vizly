Create an animated visual diagram for [TOPIC] using this exact design system:

DESIGN REQUIREMENTS:
- Dark theme: #0a0e14 background, #12161f surface cards
- Font: JetBrains Mono (code/labels) + Outfit (headings)
- Grid background with subtle accent color lines
- Gradient heading with accent colors

STRUCTURE (copy this exactly):
1. Hero section: Title + subtitle

2. Pattern/System Cards Grid (4-6 cards)
   - Each card: icon, name, description, stat chips, use cases
   - Color-coded by type with hover effects
   - Cards MUST be interactive: onClick should scroll to the flow visualization and start that specific pattern
   - Use `role="button"` and `tabIndex={0}` for accessibility

3. Mermaid Diagram Section (if needed)
   - Static diagram-as-code using Mermaid.js
   - Show architecture/flow/sequence diagram
   - Style with dark theme colors
   - Include the raw Mermaid code in a collapsible code block

4. Animated Flow Section (if needed)
   - 4 interactive patterns (switchable tabs)
   - Node-based diagram with state animations
   - Step-by-step text below showing current action
   - Request/data flow with colored states
   - Live traffic simulation

5. Comparison Table (dot ratings, ✓/✗ indicators) (if needed)

6. Additional concept section (like Layer 4 vs 7, Delivery Guarantees, etc.) (if needed)

7. Legend with color meanings

8. Replay button (if needed)

9. Copy exact "Resources" section from this file: src/components/guides/auth/JwtGuide.tsx (line: 196 to 241)

10. If there is any Comparison section in the topic, copy that from this file: 
src/components/guides/infrastructure/LoadBalancingGuide.tsx (starts from line: 490)
src/components/guides/performance/CachingStrategiesGuide.tsx (starts from line: 344)


ANIMATION STYLE:
- Nodes pulse/glow when active
- State colors: accent=active, cyan=processing, green=success, red=error
- Staggered step reveals (1.5-1.8s per step)
- Auto-play on load

MERMAID REQUIREMENTS:
- Include both rendered diagram AND copyable code
- Use sequenceDiagram or flowchart depending on content
- Match dark theme colors
- Place BEFORE the animated section

PREVIOUS EXAMPLES I LIKED:
- JWT (src/components/guides/auth/JwtGuide.tsx)
- Caching Strategies (src/components/guides/performance/CachingStrategiesGuide.tsx)
- Message Queues (src/components/guides/async/MessageQueuesGuide.tsx)
- Load Balancing (src/components/guides/infrastructure/LoadBalancingGuide.tsx)

TOPIC: [TAKE FROM CHAT]

Include BOTH:
1. Static Mermaid diagram (diagram-as-code) - for easy embedding
2. Animated interactive flow - for deep understanding

Make it comprehensive - don't miss any important concepts for [TOPIC]. You can introduce new diagram, style or section if needed.
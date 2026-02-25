/**
 * CodeBlock — Server Component
 *
 * Uses Shiki to syntax-highlight code at server/build time.
 * Zero client JavaScript. Drop-in replacement for manual .viz-code-block spans.
 *
 * Usage:
 *   import { CodeBlock } from '@/components/ui/CodeBlock';
 *
 *   <CodeBlock code={`const x = 1;`} lang="typescript" label="TypeScript" />
 *
 * Supported langs: any Shiki bundled language (typescript, javascript,
 *   python, java, go, rust, sql, bash, json, yaml, …)
 */

import { codeToHtml } from 'shiki';
import { vizlyTheme } from '@/lib/shiki-theme';

interface CodeBlockProps {
    code: string;
    lang?: string;
    label?: string;
    /** Extra inline styles on the outer wrapper */
    style?: React.CSSProperties;
}

export async function CodeBlock({
    code,
    lang = 'typescript',
    label,
    style,
}: Readonly<CodeBlockProps>) {
    const html = await codeToHtml(code.trim(), {
        lang,
        theme: vizlyTheme,
    });

    return (
        <div className="viz-code-block" style={style}>
            {label && <span className="viz-code-label">{label}</span>}
            {/* shiki wraps output in <pre><code> — we override its inline bg via CSS */}
            <div
                className="viz-shiki-inner"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}

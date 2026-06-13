import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import type { MDXComponents } from 'mdx/types';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

interface MdxRendererProps {
  source: string;
  components?: MDXComponents;
}

// Renders MDX from a string source.
//
// We compile with @mdx-js/mdx directly instead of next-mdx-remote: v6.0.0 of
// next-mdx-remote silently drops JSX expression-container attributes
// (e.g. langs={{ ... }}), passing only plain string attributes through to
// components. Compiling here preserves all attributes.
export async function MdxRenderer({ source, components }: MdxRendererProps) {
  const code = String(
    await compile(source, {
      outputFormat: 'function-body',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }]],
    })
  );

  const { default: MDXContent } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return <MDXContent components={components} />;
}

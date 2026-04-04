import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import { ArticlePageClient } from './ArticlePageClient';
import '@/styles/articles/articles.css';

// MDX components available in articles
import { Callout, MermaidBlock } from '@/components/articles/mdx';

const mdxComponents = {
  Callout,
  MermaidBlock,
};

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} — Vizly`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  // Find prev/next in same series
  let prevArticle = null;
  let nextArticle = null;

  if (article.series && article.seriesOrder !== undefined) {
    const allArticles = getAllArticles();
    const seriesArticles = allArticles
      .filter(a => a.series === article.series)
      .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));

    const currentIndex = seriesArticles.findIndex(a => a.slug === slug);
    if (currentIndex > 0) {
      prevArticle = { slug: seriesArticles[currentIndex - 1].slug, title: seriesArticles[currentIndex - 1].title };
    }
    if (currentIndex < seriesArticles.length - 1) {
      nextArticle = { slug: seriesArticles[currentIndex + 1].slug, title: seriesArticles[currentIndex + 1].title };
    }
  }

  const { content, ...frontmatter } = article;

  return (
    <ArticlePageClient
      article={frontmatter}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
    >
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }],
            ],
          },
        }}
      />
    </ArticlePageClient>
  );
}

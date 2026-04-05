"use client";

import { ArticleLayout } from '@/components/articles/ArticleLayout';
import { SeriesNav } from '@/components/articles/SeriesNav';
import { ArticleFrontmatter, ArticleSeries } from '@/types/articles';

interface ArticlePageClientProps {
  article: ArticleFrontmatter;
  prevArticle?: { slug: string; title: string } | null;
  nextArticle?: { slug: string; title: string } | null;
  series?: ArticleSeries | null;
  publishedSlugs?: string[];
  githubPath?: string;
  children: React.ReactNode;
}

export function ArticlePageClient({ article, prevArticle, nextArticle, series, publishedSlugs = [], githubPath, children }: Readonly<ArticlePageClientProps>) {
  return (
    <ArticleLayout
      article={article}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
      githubPath={githubPath}
    >
      {series && (
        <SeriesNav
          series={series}
          currentSlug={article.slug}
          publishedSlugs={publishedSlugs}
        />
      )}
      {children}
    </ArticleLayout>
  );
}

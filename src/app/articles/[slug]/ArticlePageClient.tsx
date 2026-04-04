"use client";

import { ArticleLayout } from '@/components/articles/ArticleLayout';
import { ArticleFrontmatter } from '@/types/articles';

interface ArticlePageClientProps {
  article: ArticleFrontmatter;
  prevArticle?: { slug: string; title: string } | null;
  nextArticle?: { slug: string; title: string } | null;
  children: React.ReactNode;
}

export function ArticlePageClient({ article, prevArticle, nextArticle, children }: Readonly<ArticlePageClientProps>) {
  return (
    <ArticleLayout
      article={article}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
    >
      {children}
    </ArticleLayout>
  );
}

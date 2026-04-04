import { NextResponse } from 'next/server';
import { getAllArticles, getAllSeries } from '@/lib/articles';

export async function GET() {
  const articles = getAllArticles();
  const series = getAllSeries();

  // Return frontmatter only (no content) for the listing
  const articlesWithoutContent = articles.map(({ content, ...rest }) => rest);

  return NextResponse.json({
    total: articlesWithoutContent.length,
    articles: articlesWithoutContent,
    series,
  });
}

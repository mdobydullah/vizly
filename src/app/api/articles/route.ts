import { NextResponse } from 'next/server';
import { getAllArticles, getAllSeries, getAllPaths } from '@/lib/articles';

export async function GET() {
  const articles = getAllArticles();
  const series = getAllSeries();
  const paths = getAllPaths();

  // Return frontmatter only (no content) for the listing
  const articlesWithoutContent = articles.map(({ content, ...rest }) => rest);

  return NextResponse.json({
    total: articlesWithoutContent.length,
    articles: articlesWithoutContent,
    series,
    paths,
  });
}

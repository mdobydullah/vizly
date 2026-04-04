import { getAllArticles, getAllSeries } from '@/lib/articles';
import SeriesListClient from './SeriesListClient';

export default function SeriesPage() {
  const series = getAllSeries();
  const articleSlugs = getAllArticles().map(a => a.slug);

  return <SeriesListClient series={series} articleSlugs={articleSlugs} />;
}

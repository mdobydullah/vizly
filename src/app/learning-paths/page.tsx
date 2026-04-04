import { getAllArticles, getAllSeries, getAllPaths } from '@/lib/articles';
import LearningPathsClient from './LearningPathsClient';

export default function LearningPathsPage() {
  const articleSlugs = getAllArticles().map(a => a.slug);
  const series = getAllSeries();
  const paths = getAllPaths();

  return <LearningPathsClient paths={paths} series={series} articleSlugs={articleSlugs} />;
}

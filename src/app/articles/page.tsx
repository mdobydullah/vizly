import { getAllArticles } from '@/lib/articles';
import ArticlesClient from './ArticlesClient';

export default function Articles() {
  const articles = getAllArticles().map(({ content, ...rest }) => rest);

  return <ArticlesClient articles={articles} />;
}

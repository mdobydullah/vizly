import { getAllArticles } from '@/lib/articles';
import HomeClient from './HomeClient';

export default function Home() {
  const articles = getAllArticles().map(({ content, ...rest }) => rest);

  return <HomeClient articles={articles} />;
}

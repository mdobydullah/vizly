import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ArticleFrontmatter, Article, ArticleCategory } from '@/types/articles';

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles');
const CATEGORIES_PATH = path.join(process.cwd(), 'src/data/articles/categories.json');

export function getCategories(): ArticleCategory[] {
  const raw = fs.readFileSync(CATEGORIES_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function getAllArticles(): Article[] {
  const articles: Article[] = [];

  if (!fs.existsSync(ARTICLES_DIR)) return articles;

  const categoryDirs = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of categoryDirs) {
    const dirPath = path.join(ARTICLES_DIR, dir.name);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);

      articles.push({
        ...(data as ArticleFrontmatter),
        content,
      });
    }
  }

  // Sort by newest first
  articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  const articles = getAllArticles();
  return articles.find(a => a.slug === slug) || null;
}

export function getArticleSlugs(): string[] {
  return getAllArticles().map(a => a.slug);
}

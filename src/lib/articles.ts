import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ArticleFrontmatter, Article, ArticleCategory, ArticleSeries } from '@/types/articles';

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles');
const CATEGORIES_PATH = path.join(process.cwd(), 'src/data/articles/categories.json');
const SERIES_DIR = path.join(process.cwd(), 'src/data/articles/series');

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

      // Auto-calculate read time (~200 words per minute)
      const wordCount = content.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(wordCount / 200));

      articles.push({
        ...(data as ArticleFrontmatter),
        readTime: `${minutes} min`,
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

export function getAllSeries(): ArticleSeries[] {
  if (!fs.existsSync(SERIES_DIR)) return [];

  return fs.readdirSync(SERIES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const raw = fs.readFileSync(path.join(SERIES_DIR, f), 'utf-8');
      return JSON.parse(raw) as ArticleSeries;
    });
}

export function getSeriesBySlug(slug: string): ArticleSeries | null {
  const filePath = path.join(SERIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as ArticleSeries;
}

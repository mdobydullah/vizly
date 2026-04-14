import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ArticleFrontmatter, Article, ArticleCategory, ArticleSeries, ArticlePath } from '@/types/articles';

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles');
const CATEGORIES_PATH = path.join(process.cwd(), 'src/data/articles/categories.json');
const SERIES_DIR = path.join(process.cwd(), 'src/data/articles/series');
const PATHS_DIR = path.join(process.cwd(), 'src/data/articles/paths');

export function getCategories(): ArticleCategory[] {
  const raw = fs.readFileSync(CATEGORIES_PATH, 'utf-8');
  return JSON.parse(raw);
}

function walkArticleFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkArticleFiles(full));
    } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
      out.push(full);
    }
  }
  return out;
}

export function getAllArticles(): Article[] {
  const articles: Article[] = [];

  for (const filePath of walkArticleFiles(ARTICLES_DIR)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));

    const relFromArticles = path.relative(ARTICLES_DIR, filePath);

    articles.push({
      ...(data as ArticleFrontmatter),
      readTime: `${minutes} min`,
      content,
      githubPath: `src/content/articles/${relFromArticles.split(path.sep).join('/')}`,
    });
  }

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

function walkJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

export function getAllSeries(): ArticleSeries[] {
  return walkJsonFiles(SERIES_DIR).map(f => {
    const raw = fs.readFileSync(f, 'utf-8');
    return JSON.parse(raw) as ArticleSeries;
  });
}

export function getSeriesBySlug(slug: string): ArticleSeries | null {
  return getAllSeries().find(s => s.slug === slug) ?? null;
}

export function getAllPaths(): ArticlePath[] {
  if (!fs.existsSync(PATHS_DIR)) return [];

  return fs.readdirSync(PATHS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const raw = fs.readFileSync(path.join(PATHS_DIR, f), 'utf-8');
      return JSON.parse(raw) as ArticlePath;
    });
}

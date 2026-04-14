export interface ArticleFrontmatter {
  title: string;
  slug: string;
  category: string;
  series?: string;
  seriesOrder?: number;
  description: string;
  tags: string[];
  readTime: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  excalidraw?: boolean;
  mermaid?: boolean;
  storySummary?: Record<string, string>;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  githubPath?: string;
}

export interface ArticleCategory {
  slug: string;
  name: string;
  color: string;
  icon: string;
}

export type ArticleSortOption = 'newest' | 'oldest' | 'updated' | 'az' | 'za';

export interface SeriesArticleEntry {
  order: number;
  slug: string;
  title: string;
}

export interface ArticleSeries {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  articles: SeriesArticleEntry[];
}

export interface ArticlePath {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  estimatedWeeks: number;
  series: string[]; // ordered slugs referencing series/*.json
}

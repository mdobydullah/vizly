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

/** A small status pill shown next to an article in a series list. Reusable across any series. */
export interface ArticleBadge {
  label: string;
  /** Color name from the series COLOR_MAP (e.g. "purple", "green"). Defaults to the series accent color. */
  color?: string;
  /** Optional leading icon or emoji (e.g. "★", "🤖"). */
  icon?: string;
}

export interface SeriesArticleEntry {
  order: number;
  slug: string;
  title: string;
  badges?: ArticleBadge[];
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

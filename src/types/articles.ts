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
}

export interface Article extends ArticleFrontmatter {
  content: string;
}

export interface ArticleCategory {
  slug: string;
  name: string;
  color: string;
  icon: string;
}

export type ArticleSortOption = 'newest' | 'oldest' | 'updated' | 'az' | 'za';

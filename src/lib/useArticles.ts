"use client";

import { useState, useEffect } from 'react';
import { ArticleFrontmatter } from '@/types/articles';

export function useArticles(): ArticleFrontmatter[] {
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data.articles))
      .catch(() => setArticles([]));
  }, []);

  return articles;
}

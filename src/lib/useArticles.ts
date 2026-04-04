"use client";

import { useState, useEffect } from 'react';
import { ArticleFrontmatter, ArticleSeries } from '@/types/articles';

interface UseArticlesResult {
  articles: ArticleFrontmatter[];
  series: ArticleSeries[];
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);
  const [series, setSeries] = useState<ArticleSeries[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setSeries(data.series || []);
      })
      .catch(() => {
        setArticles([]);
        setSeries([]);
      });
  }, []);

  return { articles, series };
}

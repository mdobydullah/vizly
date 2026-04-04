"use client";

import { useState, useEffect } from 'react';
import { ArticleFrontmatter, ArticleSeries, ArticlePath } from '@/types/articles';

interface UseArticlesResult {
  articles: ArticleFrontmatter[];
  series: ArticleSeries[];
  paths: ArticlePath[];
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);
  const [series, setSeries] = useState<ArticleSeries[]>([]);
  const [paths, setPaths] = useState<ArticlePath[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setSeries(data.series || []);
        setPaths(data.paths || []);
      })
      .catch(() => {
        setArticles([]);
        setSeries([]);
        setPaths([]);
      });
  }, []);

  return { articles, series, paths };
}

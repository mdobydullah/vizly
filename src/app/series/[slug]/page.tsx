import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from "@/lib/config";
import { getAllArticles, getAllSeries } from '@/lib/articles';
import SeriesDetailClient from './SeriesDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const series = getAllSeries();
  return series.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getAllSeries().find(s => s.slug === slug);

  if (!series) {
    return { title: `Series Not Found — ${config.app.name}` };
  }

  return {
    title: `${series.title} — ${config.app.name}`,
    description: series.description,
  };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const allSeries = getAllSeries();
  const series = allSeries.find(s => s.slug === slug);

  if (!series) notFound();

  const articles = getAllArticles().map(({ content, ...rest }) => rest);

  return <SeriesDetailClient series={series} articles={articles} />;
}

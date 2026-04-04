import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from "@/lib/config";
import { getAllPaths } from '@/lib/articles';
import PathDetailClient from './PathDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const paths = getAllPaths();
  return paths.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = getAllPaths().find(p => p.slug === slug);

  if (!path) {
    return { title: `Path Not Found — ${config.app.name}` };
  }

  return {
    title: `${path.title} — ${config.app.name}`,
    description: path.description,
  };
}

export default async function LearningPathPage({ params }: Props) {
  const { slug } = await params;
  const path = getAllPaths().find(p => p.slug === slug);

  if (!path) notFound();

  return <PathDetailClient path={path} />;
}

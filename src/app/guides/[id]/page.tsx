import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from "@/lib/config";
import guidesData from "@/data/guides";
import { guideComponents } from '@/components/guides';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return guidesData.guides.map((guide) => ({
        id: guide.id,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const guide = guidesData.guides.find((g) => g.id === id);

    if (!guide) {
        return {
            title: `Guide Not Found - ${config.app.name}`,
        };
    }

    return {
        title: `${guide.title} Visual Guide - ${config.app.name}`,
        description: guide.description,
    };
}

export default async function GuidePage({ params }: Props) {
    const { id } = await params;

    const guide = guidesData.guides.find((g) => g.id === id);
    const GuideComponent = guideComponents[id];

    if (!guide || !GuideComponent) {
        notFound();
    }

    return <GuideComponent />;
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from "@/lib/config";
import guidesData from "@/data/guides";
import { guideComponents } from '@/components/guides';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { OOP_CODE } from '@/components/guides/programming/oop.code';

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

    // Direct find in the guides data
    const guide = guidesData.guides.find((g) => g.id === id);

    // Look up the component in the registry
    const GuideComponent = guideComponents[id];

    if (!guide || !GuideComponent) {
        notFound();
    }

    // Pre-render Shiki code blocks for guides that need them
    const codeBlock = id === 'oop'
        ? await CodeBlock({ code: OOP_CODE, lang: 'typescript', label: 'TypeScript' })
        : undefined;

    return <GuideComponent codeBlock={codeBlock} />;
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from "@/lib/config";
import visualsData from "@/data/visuals";
import { visualComponents } from '@/components/visuals';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return visualsData.visuals.map((visual) => ({
        id: visual.id,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const visual = visualsData.visuals.find((v) => v.id === id);

    if (!visual) {
        return {
            title: `Visual Not Found - ${config.app.name}`,
        };
    }

    return {
        title: `${visual.title} Visual Guide - ${config.app.name}`,
        description: visual.description,
    };
}

export default async function VisualPage({ params }: Props) {
    const { id } = await params;

    // Direct find in the visuals data
    const visual = visualsData.visuals.find((v) => v.id === id);

    // Look up the component in the registry
    const VisualComponent = visualComponents[id];

    if (!visual || !VisualComponent) {
        notFound();
    }

    return <VisualComponent />;
}



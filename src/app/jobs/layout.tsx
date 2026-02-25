import { Metadata } from 'next';
import { config } from "@/lib/config";

export const metadata: Metadata = {
    title: `Jobs Directory - ${config.app.name}`,
    description: "A curated directory of top job boards, specialized platforms, and company hubs for tech professionals.",
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
    return children;
}

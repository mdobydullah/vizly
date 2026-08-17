import { Metadata } from 'next';
import { config } from "@/lib/config";

export const metadata: Metadata = {
    title: `Shorts — ${config.app.name}`,
    description: "Swipe through bite-size engineering theory videos. Interview concepts in 30 seconds, shuffled every visit.",
};

export default function ShortsLayout({ children }: { children: React.ReactNode }) {
    return children;
}

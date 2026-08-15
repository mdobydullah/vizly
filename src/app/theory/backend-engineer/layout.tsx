import { Metadata } from 'next';
import { config } from "@/lib/config";

export const metadata: Metadata = {
    title: `Backend Engineer Theory — ${config.app.name}`,
    description: "101 backend engineering interview topics across 16 sections, tagged junior, mid and senior. Databases, distributed systems, system design, DevOps, security and more, each with a plain explanation and a concrete example.",
};

export default function TheoryLayout({ children }: { children: React.ReactNode }) {
    return children;
}

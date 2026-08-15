import { Metadata } from 'next';
import { config } from "@/lib/config";

export const metadata: Metadata = {
    title: `Backend Engineer Theory — ${config.app.name}`,
    description: "114 backend engineering interview topics across 18 sections, tagged junior, mid and senior. OOP, databases, distributed systems, system design, DevOps, security, troubleshooting and more, each with a plain explanation and a concrete example, plus a quiz mode to test yourself.",
};

export default function TheoryLayout({ children }: { children: React.ReactNode }) {
    return children;
}

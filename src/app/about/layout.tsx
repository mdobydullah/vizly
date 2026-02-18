import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
    title: `About — ${config.app.name}`,
    description: "Learn about the mission behind Vizly — a visual notebook created by Obydul to help engineers master abstract technical concepts through interactive animations.",
    openGraph: {
        title: `About — ${config.app.name}`,
        description: "Learn about the mission behind Vizly — a visual notebook created by Obydul to help engineers master abstract technical concepts through interactive animations.",
        type: "website",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

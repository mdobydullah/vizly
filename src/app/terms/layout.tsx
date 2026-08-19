import type { Metadata } from "next";
import { config } from "@/lib/config";

const description = "The terms for using Vizly, a free collection of animated guides to software engineering concepts, covering content use, accuracy and liability.";

export const metadata: Metadata = {
    title: `Terms of Use — ${config.app.name}`,
    description,
    openGraph: {
        title: `Terms of Use — ${config.app.name}`,
        description,
        type: "website",
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

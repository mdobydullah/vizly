import type { Metadata } from "next";
import { config } from "@/lib/config";

const description = "How Vizly handles data. No accounts, no sign up and no personal information collected, with a plain explanation of analytics, browser storage and server logs.";

export const metadata: Metadata = {
    title: `Privacy Policy — ${config.app.name}`,
    description,
    openGraph: {
        title: `Privacy Policy — ${config.app.name}`,
        description,
        type: "website",
    },
};

export default function PrivacyPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

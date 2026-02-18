import { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `Visuals - ${config.app.name}`,
  description: "Browse all interactive technical guides on system design, security, and complex engineering topics with animated explanations.",
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

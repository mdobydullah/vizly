import { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `Learning Paths — ${config.app.name}`,
  description: "Curated roadmaps to take you from beginner to job-ready. Follow a structured path through multiple series.",
};

export default function LearningPathsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

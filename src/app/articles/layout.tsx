import { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `Articles — ${config.app.name}`,
  description: "Learn concepts through visual, in-depth articles on AI, system design, and engineering.",
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

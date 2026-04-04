import { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `Series — ${config.app.name}`,
  description: "Follow structured learning series from start to finish. Each series takes you through a topic step by step.",
};

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

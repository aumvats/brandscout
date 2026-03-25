import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results",
  description:
    "View news articles and AI sentiment analysis for any brand or company.",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

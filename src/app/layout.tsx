import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "BrandScout — News Mention Intelligence",
    template: "%s | BrandScout",
  },
  description:
    "Track your brand and competitors across global news sources. AI sentiment scoring, trend charts, and competitive press intelligence — for a fraction of what enterprise tools charge.",
  keywords: [
    "brand monitoring",
    "news mentions",
    "sentiment analysis",
    "press intelligence",
    "competitor tracking",
    "media monitoring",
    "press score",
  ],
  openGraph: {
    title: "BrandScout",
    description:
      "Know the moment your brand hits the press. Track mentions, score sentiment, compare competitors.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandScout",
    description:
      "Know the moment your brand hits the press. Track mentions, score sentiment, compare competitors.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-bg text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}

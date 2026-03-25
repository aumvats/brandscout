"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchBar } from "@/components/ui/SearchBar";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSearch(query: string) {
    setLoading(true);
    router.push(`/results?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <header>
        <nav className="flex items-center justify-between px-6 h-16 max-w-6xl mx-auto animate-fade-in" aria-label="Main navigation">
          <span className="text-xl font-bold text-text-primary tracking-tight">
            BrandScout
          </span>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-fast"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="text-sm font-medium text-white bg-primary hover:bg-primary-hover active:scale-[0.98] px-4 py-2 rounded-md transition-all duration-fast"
            >
              Sign up free
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-24 pb-20 px-6 text-center bg-surface">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-text-primary mb-3 max-w-2xl mx-auto animate-fade-in-up">
            Know the moment your brand hits the press
          </h1>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-8 max-w-lg mx-auto animate-fade-in-up stagger-1">
          Track news mentions, score sentiment, compare competitors. Free to
          start.
        </p>
        <div className="flex justify-center animate-fade-in-up stagger-2">
          <SearchBar
            placeholder="Enter a brand or company name..."
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </section>

        {/* Features */}
        <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in-up stagger-3">
          <FeatureColumn
            icon={
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                />
              </svg>
            }
            title="Real-Time News Feed"
            description="Articles from hundreds of global sources, updated every 8 hours."
          />
          <FeatureColumn
            icon={
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            }
            title="AI Sentiment Scoring"
            description="Every article scored as positive, neutral, or negative with confidence levels."
          />
          <FeatureColumn
            icon={
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            }
            title="Competitor Comparison"
            description="Side-by-side press intelligence for your brand and up to 2 competitors."
          />
        </div>
      </section>

        {/* Social Proof */}
        <section className="pb-16 px-6 text-center">
          <p className="text-[12px] font-medium text-text-secondary uppercase tracking-[0.02em]">
            Trusted by 200+ indie founders and marketing teams
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-text-secondary">
          <span>BrandScout</span>
          <div className="flex gap-6">
            <a href="/login" className="hover:text-text-primary transition-colors duration-fast">
              Log in
            </a>
            <a href="/signup" className="hover:text-text-primary transition-colors duration-fast">
              Sign up
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureColumn({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary mb-1.5">
        {title}
      </h3>
      <p className="text-[15px] text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandFromSearch = searchParams.get("brand");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create user record
    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        plan: "scout",
      });

      // If they came from a search, auto-add the brand
      if (brandFromSearch) {
        try {
          await fetch("/api/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: brandFromSearch }),
          });
        } catch {
          // Non-critical — they can add it manually
        }
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <a
          href="/"
          className="block text-center text-xl font-bold text-text-primary tracking-tight mb-8 hover:opacity-80 transition-opacity duration-fast"
        >
          BrandScout
        </a>

        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-text-primary mb-1">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Free to start. Track your first brand in seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 border border-border rounded-md text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all duration-fast"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 border border-border rounded-md text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all duration-fast"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up free"}
            </Button>
          </form>

          <p className="text-sm text-text-secondary mt-4 text-center">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:text-primary-hover font-medium"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="animate-pulse text-text-secondary">Loading...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

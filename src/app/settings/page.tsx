"use client";

import { useEffect, useState, useCallback } from "react";
import { BrandWithData } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Toast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [brands, setBrands] = useState<BrandWithData[]>([]);
  const [plan, setPlan] = useState<"scout" | "intel">("scout");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("plan")
          .eq("id", user.id)
          .single();
        if (userData?.plan) setPlan(userData.plan as "scout" | "intel");
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRemoveBrand(brandId: string) {
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove brand");
      }
      setBrands((prev) => prev.filter((b) => b.id !== brandId));
      setToast({ message: "Brand removed", type: "success" });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to remove brand",
        type: "error",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        {/* Mobile skeleton header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="h-5 bg-border rounded w-28 animate-pulse" />
          <div className="h-4 bg-border rounded w-20 animate-pulse" />
        </div>
        <div className="flex">
          <div className="hidden md:block w-60 border-r border-border p-6 min-h-screen">
            <div className="h-6 bg-border rounded w-32 mb-8 animate-pulse" />
          </div>
          <div className="flex-1 p-6 md:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-border rounded w-32" />
              <div className="h-20 bg-surface border border-border rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <a
          href="/dashboard"
          className="text-lg font-bold text-text-primary tracking-tight"
        >
          BrandScout
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-fast"
          >
            Dashboard
          </a>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:block w-60 border-r border-border min-h-screen p-6">
          <a
            href="/dashboard"
            className="block text-xl font-bold text-text-primary tracking-tight mb-8 hover:opacity-80 transition-opacity duration-fast"
          >
            BrandScout
          </a>
          <nav className="space-y-1">
            <a
              href="/dashboard"
              className="block px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg rounded-md transition-colors duration-fast"
            >
              Dashboard
            </a>
            <a
              href="/settings"
              className="block px-3 py-2 text-sm font-medium text-primary bg-primary/5 rounded-md"
            >
              Settings
            </a>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 max-w-2xl">
          <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-text-primary mb-8">
            Settings
          </h1>

          {/* Plan */}
          <section className="mb-8 animate-fade-in-up">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary mb-3">
              Plan
            </h2>
            <div className="bg-surface border border-border rounded-md p-4 flex items-center justify-between gap-4">
              <div>
                <span
                  className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                    plan === "intel"
                      ? "bg-primary/10 text-primary"
                      : "bg-bg text-text-secondary"
                  }`}
                >
                  {plan === "intel" ? "Intel \u2014 $14/mo" : "Scout \u2014 Free"}
                </span>
                <p className="text-sm text-text-secondary mt-1">
                  {plan === "intel"
                    ? "3 brands, 3x/day checks, competitor comparison, CSV export"
                    : "1 brand, 2x/day checks"}
                </p>
              </div>
              {plan === "scout" && (
                <Button variant="primary" size="sm">
                  Upgrade
                </Button>
              )}
            </div>
          </section>

          {/* Tracked Brands */}
          <section className="mb-8 animate-fade-in-up stagger-1">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary mb-3">
              Tracked Brands
            </h2>
            {brands.length === 0 ? (
              <p className="text-[15px] text-text-secondary">
                No brands tracked yet.
              </p>
            ) : (
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="bg-surface border border-border rounded-md p-4 flex items-center justify-between gap-4 hover:border-primary/20 transition-all duration-fast"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {brand.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Press Score: {brand.pressScore} &middot;{" "}
                        {brand.articles.length} articles
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {plan === "intel" && (
                        <a
                          href={`/api/export?brandId=${brand.id}`}
                          className="text-xs text-primary hover:text-primary-hover font-medium transition-colors duration-fast"
                        >
                          Export CSV
                        </a>
                      )}
                      <button
                        onClick={() => handleRemoveBrand(brand.id)}
                        className="text-xs text-error hover:text-error/80 font-medium transition-colors duration-fast"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

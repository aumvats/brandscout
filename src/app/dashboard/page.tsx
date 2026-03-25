"use client";

import { useEffect, useState, useCallback } from "react";
import { BrandWithData, Alert } from "@/lib/types";
import { BrandCard } from "@/components/features/BrandCard";
import { ComparisonView } from "@/components/features/ComparisonView";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { AddBrandModal } from "@/components/features/AddBrandModal";
import { UsageMeter } from "@/components/features/UsageMeter";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [brands, setBrands] = useState<BrandWithData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [plan, setPlan] = useState<"scout" | "intel">("scout");

  const fetchData = useCallback(async () => {
    try {
      const [brandsRes, alertsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/alerts"),
      ]);

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.brands || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }

      // Get plan
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

        // Update last visited
        await supabase
          .from("users")
          .update({ last_visited_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDismissAlert(alertId: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
    } catch (err) {
      console.error("Dismiss alert error:", err);
    }
  }

  async function handleAddBrand(name: string) {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to add brand");
    }

    setShowAddModal(false);
    await fetchData();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const planLimit = plan === "intel" ? 3 : 1;

  // Loading skeleton
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
            <div className="space-y-3">
              <div className="h-4 bg-border rounded w-24 animate-pulse" />
              <div className="h-4 bg-border rounded w-20 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-6 md:p-8">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border rounded-md p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-border" />
                    <div className="h-5 bg-border rounded w-32" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-border rounded w-3/4" />
                    <div className="h-3 bg-border rounded w-1/2" />
                  </div>
                </div>
              ))}
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
        <span className="text-lg font-bold text-text-primary tracking-tight">
          BrandScout
        </span>
        <div className="flex items-center gap-4">
          <a
            href="/settings"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-fast"
          >
            Settings
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-fast"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex w-60 border-r border-border min-h-screen p-6 flex-col">
          <span className="text-xl font-bold text-text-primary tracking-tight mb-8">
            BrandScout
          </span>

          <nav className="space-y-1 mb-8">
            <a
              href="/dashboard"
              className="block px-3 py-2 text-sm font-medium text-primary bg-primary/5 rounded-md"
            >
              Dashboard
            </a>
            <a
              href="/settings"
              className="block px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg rounded-md transition-colors duration-fast"
            >
              Settings
            </a>
          </nav>

          <Button
            variant="primary"
            className="w-full mb-6"
            onClick={() => setShowAddModal(true)}
          >
            + Add Brand
          </Button>

          <UsageMeter used={brands.length} limit={planLimit} />

          <div className="mt-auto pt-6">
            <button
              onClick={handleLogout}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-fast"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-text-primary">
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                className="md:hidden"
                onClick={() => setShowAddModal(true)}
              >
                + Add
              </Button>
              {brands.length >= 2 && (
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-fast active:scale-[0.98] ${
                    compareMode
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary border border-border hover:bg-bg hover:border-primary/20"
                  }`}
                >
                  {compareMode ? "Grid View" : "Compare"}
                </button>
              )}
            </div>
          </div>

          {/* Mobile usage meter */}
          <div className="md:hidden mb-6">
            <UsageMeter used={brands.length} limit={planLimit} />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 animate-fade-in-up">
              <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-12">
              <p className="text-error font-medium mb-2">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchData();
                }}
                className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-fast"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!error && brands.length === 0 && (
            <div className="text-center py-16 animate-fade-in-up">
              <svg
                className="mx-auto mb-4 w-16 h-16 text-border"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary mb-2">
                No brands tracked yet
              </h2>
              <p className="text-[15px] text-text-secondary mb-4">
                Add your first brand to start monitoring press coverage.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                + Add your first brand
              </Button>
            </div>
          )}

          {/* Brand cards or comparison */}
          {!error && brands.length > 0 && (
            <div className="animate-fade-in-up">
              {compareMode && brands.length >= 2 ? (
                <ComparisonView brands={brands} />
              ) : (
                <div className="space-y-4">
                  {brands.map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <AddBrandModal
          onAdd={handleAddBrand}
          onClose={() => setShowAddModal(false)}
          planLimit={planLimit}
          currentCount={brands.length}
        />
      )}
    </div>
  );
}

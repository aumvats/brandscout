import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your tracked brands, plan, and account settings.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

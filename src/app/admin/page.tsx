import type { Metadata } from "next";
import { Administration } from "@/components/admin/Admin";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default function PageAdmin() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-cyan">Méridien</p>
      <h1 className="mb-6 mt-1 text-3xl font-semibold text-ink">Administration</h1>
      <Administration />
    </div>
  );
}

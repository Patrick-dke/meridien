import type { Metadata } from "next";
import Link from "next/link";
import { BadgeFiabilite } from "@/components/ui/BadgeFiabilite";
import { academies, estPublie } from "@/content";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Apprendre",
  description: "Le catalogue des académies Méridien : fondamentaux, price action, SMC, liquidité et ICT, modèles et méthode.",
};

export default function PageAcademies() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Apprendre</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {typographie(
          "Cinq académies, des fondamentaux aux modèles avancés. Commence par le parcours « Premiers pas » : les académies suivantes s'appuient sur lui.",
        )}
      </p>

      <Link
        href="/parcours/premiers-pas/"
        className="mt-6 flex flex-col gap-1 rounded-2xl border border-brand/50 bg-brand-soft p-5 transition-colors hover:border-brand sm:flex-row sm:items-center sm:justify-between"
      >
        <span>
          <span className="block text-sm font-medium text-brand">Parcours recommandé</span>
          <span className="block text-lg font-semibold text-ink">Premiers pas : 14 chapitres pour partir de zéro</span>
        </span>
        <span className="text-sm font-medium text-ink">Ouvrir le parcours →</span>
      </Link>

      <ul className="mt-8 space-y-4">
        {academies.map((a) => {
          const chapitres = a.modules.flatMap((m) => m.chapitres);
          const publies = chapitres.filter((c) => estPublie(c.slug)).length;
          return (
            <li key={a.slug}>
              <Link href={`/academies/${a.slug}/`} className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-ink-3">{a.code}</span>
                  <span className="text-xs text-ink-3">· {a.niveau}</span>
                  {a.ecole ? <BadgeFiabilite fiabilite="ecole" /> : null}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-ink">{typographie(a.titre)}</h2>
                <p className="mt-1 text-[0.95rem] text-ink-2">{typographie(a.description)}</p>
                <p className={`mt-3 text-sm ${publies ? "text-ok" : "text-ink-3"}`}>
                  {a.modules.length} module{a.modules.length > 1 ? "s" : ""} · {chapitres.length} chapitres ·{" "}
                  {publies ? `${publies} disponibles` : "en préparation"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

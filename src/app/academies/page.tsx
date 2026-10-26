import type { Metadata } from "next";
import { CarteEnsemble } from "@/components/catalogue/CarteEnsemble";
import { Explorateur } from "@/components/catalogue/Explorateur";
import { CarteParcours } from "@/components/catalogue/Parcours";
import { MonterAuBesoin } from "@/components/ui/MonterAuBesoin";
import { academies, etapesParChapitre, fiche, fiches, parcours } from "@/content";
import { motifsAcademies, teintesAcademies } from "@/content/identite";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Apprendre",
  description: "Le catalogue des académies Méridien : fondamentaux, price action, SMC, liquidité et ICT, modèles et méthode.",
};

export default function PageAcademies() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-cyan">Apprendre</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
          Cinq académies, <span className="accent">un seul fil</span>
        </h1>
        <p className="mt-3 text-ink-2">
          {typographie(
            "Des fondamentaux aux modèles avancés. Commence par le parcours « Premiers pas » : les académies suivantes s'appuient sur lui.",
          )}
        </p>
      </header>

      <div className="mt-8">
        <CarteParcours
          fiches={parcours.map((s) => fiche(s)!)}
          titre="Premiers pas"
          description={`${parcours.length} chapitres pour partir de zéro : marchés, graphiques, ordres, coûts, levier et risque.`}
        />
      </div>

      <section aria-labelledby="titre-academies" className="hors-ecran mt-14">
        <h2 id="titre-academies" className="text-2xl font-semibold text-ink">
          Les académies
        </h2>
        <ul className="rangee -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {academies.map((a, i) => {
            const chapitres = a.modules.flatMap((m) => m.chapitres.map((c) => c.slug));
            const publies = chapitres.filter((s) => fiche(s)?.publie);
            return (
              <li key={a.slug} className="revele w-[82%] shrink-0 sm:w-auto" style={{ ["--i" as string]: i }}>
                <CarteEnsemble
                  href={`/academies/${a.slug}/`}
                  surtitre={`${a.code} · ${a.niveau}`}
                  titre={a.titre}
                  description={a.description}
                  motif={motifsAcademies[a.slug]}
                  teinte={teintesAcademies[a.slug]}
                  publies={publies}
                  total={chapitres.length}
                  details={[`${a.modules.length} module${a.modules.length > 1 ? "s" : ""}`, `${chapitres.length} chapitres`]}
                  ecole={a.ecole}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-14">
        <MonterAuBesoin hauteur={1400} libelle="Chargement de l'explorateur des chapitres…">
          <Explorateur fiches={fiches} etapes={etapesParChapitre} />
        </MonterAuBesoin>
      </div>
    </div>
  );
}

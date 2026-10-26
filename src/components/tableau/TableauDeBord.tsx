"use client";

import Link from "next/link";
import { useState } from "react";
import type { FicheChapitre } from "@/content";
import type { Concept } from "@/content/schema";
import { etatConcept, maitrise, recommander, type EtatConcept } from "@/lib/apprentissage/maitrise";
import { jourLocal } from "@/lib/progression/etat";
import { useProgression } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import { CarteParcours } from "../catalogue/Parcours";
import { libellesEtat } from "../chapitre/Validation";
import { Carte } from "../ui/Carte";
import { IconeBoussole, IconeCoche, IconeEtoile, IconeHorloge, IconeNote, IconeSuivant } from "../ui/Icones";
import { Anneau, Jauge } from "../ui/Progression";

const libelleRegle: Record<string, string> = {
  R1: "À revoir",
  R2: "Base à consolider",
  R5: "Quiz difficile",
  R6: "Reprise",
  suite: "Suite du parcours",
};

const couleurEtat: Record<EtatConcept, string> = { acquis: "var(--ok)", "en-cours": "var(--info)", fragile: "var(--warn)", "non-vu": "var(--line-strong)" };
const minutesParJour: Record<string, number> = { "10": 10, "20": 20, "45": 45 };

function duree(secondes: number) {
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

function ilYa(iso: string) {
  const jours = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return jours <= 0 ? "aujourd'hui" : jours === 1 ? "hier" : `il y a ${jours} jours`;
}

/** Les sept derniers jours, du plus ancien à aujourd'hui. */
function semaine() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { jour: jourLocal(d), court: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""), long: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) };
  });
}

/** Minutes par jour sur sept jours, une seule série en barres, l'objectif quotidien en ligne. */
function GraphiqueSemaine({ journal, objectif }: { journal: Record<string, number>; objectif: number | null }) {
  const jours = semaine().map((j) => ({ ...j, minutes: Math.round((journal[j.jour] ?? 0) / 60) }));
  const max = Math.max(objectif ?? 0, ...jours.map((j) => j.minutes), 10);
  const [survol, setSurvol] = useState<number | null>(null);
  const H = 120;
  return (
    <div>
      <div className="relative" style={{ height: H + 24 }} onPointerLeave={() => setSurvol(null)}>
        {objectif ? (
          <div className="absolute inset-x-0 border-t border-dashed border-gold/70" style={{ bottom: 24 + (objectif / max) * H }} aria-hidden="true">
            <span className="absolute -top-5 right-0 text-[0.7rem] text-ink-3">objectif {objectif} min</span>
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-6 border-t border-line" aria-hidden="true" />
        <ol className="absolute inset-0 flex items-end gap-2" aria-hidden="true">
          {jours.map((j, i) => (
            <li
              key={j.jour}
              className="relative flex h-full flex-1 flex-col justify-end"
              onPointerEnter={() => setSurvol(i)}
              onPointerDown={() => setSurvol(i)}
            >
              {survol === i ? (
                <span className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line-strong bg-overlay px-2 py-1 text-xs text-ink shadow-lg" style={{ bottom: 30 + (j.minutes / max) * H }}>
                  {j.long} : {j.minutes} min
                </span>
              ) : null}
              <span
                className="mx-auto w-full max-w-9 rounded-t-[4px] transition-[height] duration-700 ease-[var(--ease-out-soft)]"
                style={{ height: Math.max(2, (j.minutes / max) * H), background: j.minutes ? "var(--brand)" : "var(--line-strong)", opacity: survol === null || survol === i ? 1 : 0.55 }}
              />
              <span className={`mt-1.5 h-[18px] text-center text-[0.7rem] ${i === 6 ? "font-semibold text-ink" : "text-ink-3"}`}>{j.court}</span>
            </li>
          ))}
        </ol>
      </div>
      {/* Un tableau ignore la largeur de 1 px de sr-only : c'est son conteneur qui est masqué. */}
      <div className="sr-only">
        <table>
          <caption>Minutes d&apos;apprentissage par jour, sur les sept derniers jours</caption>
          <tbody>
            {jours.map((j) => (
              <tr key={j.jour}>
                <th scope="row">{j.long}</th>
                <td>{j.minutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Tableau de bord : tout est calculé à partir de la progression enregistrée dans ce navigateur. */
export function TableauDeBord({
  parcours,
  titres,
  concepts,
  fiches,
}: {
  parcours: string[];
  titres: Record<string, string>;
  concepts: Concept[];
  fiches: FicheChapitre[];
}) {
  const p = useProgression();
  const debut = Object.keys(p.chapitres).length === 0;
  const titresMap = new Map(Object.entries(titres));
  const recos = recommander(p, concepts, parcours, titresMap);
  const chapitres = Object.entries(p.chapitres);
  const termines = chapitres.filter(([, c]) => c.statut === "termine").length;
  const tentatives = chapitres.reduce((a, [, c]) => a + c.tentatives, 0);
  const temps = chapitres.reduce((a, [, c]) => a + c.tempsS, 0);
  const scores = chapitres.map(([, c]) => c.meilleurScore).filter((s): s is number => s !== undefined);
  const moyenne = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const fichesParSlug = new Map(fiches.map((f) => [f.slug, f]));
  const fichesParcours = parcours.map((s) => fichesParSlug.get(s)!);
  const journal = p.journal ?? {};
  const objectif = p.profil ? minutesParJour[p.profil.temps] : null;
  const semaineMin = Math.round(semaine().reduce((a, j) => a + (journal[j.jour] ?? 0), 0) / 60);

  if (debut) {
    return (
      <div className="carte relative overflow-hidden p-6 sm:p-8">
        <div className="grille-ciel pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative max-w-xl">
          <p className="text-xl font-semibold text-ink">Ton tableau de bord se remplira au fil de tes chapitres.</p>
          <p className="mt-2 text-ink-2">Progression, résultats aux quiz, concepts acquis ou à revoir, recommandations : tout reste dans ce navigateur.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/commencer/" className="btn btn-primaire">
              Commencer
            </Link>
            <Link href="/parametres/#donnees" className="btn btn-secondaire">
              Importer une progression
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Concepts des chapitres publiés, regroupés par module ; état et maîtrise calculés comme au chapitre.
  const groupes = new Map<string, { concept: Concept; etat: EtatConcept; valeur: number }[]>();
  for (const c of concepts) {
    const f = fichesParSlug.get(c.chapitre);
    if (!f?.publie) continue;
    const s = p.concepts[c.id]?.scores ?? [];
    groupes.set(f.moduleTitre, [...(groupes.get(f.moduleTitre) ?? []), { concept: c, etat: etatConcept(s), valeur: maitrise(s).valeur }]);
  }
  const fragiles = [...groupes.values()].flat().filter((x) => x.etat === "fragile");
  const acquis = [...groupes.values()].flat().filter((x) => x.etat === "acquis").length;
  const totalConcepts = [...groupes.values()].flat().length;

  const activites = chapitres
    .flatMap(([slug, c]) => [
      { date: c.debut, texte: "Chapitre commencé", slug },
      ...(c.fin ? [{ date: c.fin, texte: "Chapitre validé", slug }] : []),
    ])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <CarteParcours fiches={fichesParcours} titre="Premiers pas" description="Où tu en es dans le parcours, et le prochain chapitre à ouvrir." />

      <section aria-labelledby="titre-chiffres" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <h2 id="titre-chiffres" className="sr-only">
          Tes chiffres
        </h2>
        {[
          { cle: "Chapitres terminés", valeur: `${termines}`, Icone: IconeCoche },
          { cle: "Quiz tentés", valeur: `${tentatives}`, Icone: IconeBoussole },
          { cle: "Meilleurs scores, en moyenne", valeur: moyenne === null ? "—" : `${Math.round(moyenne * 100)} %`, Icone: IconeEtoile },
          { cle: "Temps d'apprentissage", valeur: duree(temps), Icone: IconeHorloge },
        ].map(({ cle, valeur, Icone }, i) => (
          <div key={cle} className="revele carte p-4" style={{ ["--i" as string]: i }}>
            <Icone className="size-5 text-cyan" />
            <p className="mt-3 font-mono text-2xl font-semibold text-ink tabular">{valeur}</p>
            <p className="mt-0.5 text-sm text-ink-3">{cle}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="titre-recos">
        <h2 id="titre-recos" className="mb-1 text-xl font-semibold text-ink">
          Recommandé pour toi
        </h2>
        <p className="mb-4 text-sm text-ink-3">Chaque suggestion dit pourquoi elle t&apos;est faite.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {recos.map((r, i) => (
            <li key={`${r.regle}-${r.chapitre}`} className="revele" style={{ ["--i" as string]: i }}>
              <Carte href={`/chapitre/${r.chapitre}/`} className="group h-full p-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${r.regle === "suite" ? "text-cyan" : "text-warn"}`}>{libelleRegle[r.regle]}</span>
                <span className="mt-1.5 block font-semibold text-ink">{titres[r.chapitre] ?? r.chapitre}</span>
                <span className="mt-1 block text-sm text-ink-2">{r.raison}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Ouvrir <IconeSuivant className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Carte>
            </li>
          ))}
          {recos.length === 0 ? <li className="text-sm text-ink-2">Parcours terminé, aucun concept à revoir. Bravo !</li> : null}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="titre-semaine" className="carte p-5">
          <h2 id="titre-semaine" className="text-lg font-semibold text-ink">
            Ta semaine
          </h2>
          <p className="mb-5 mt-1 text-sm text-ink-2">
            {semaineMin} min d&apos;apprentissage sur sept jours
            {objectif ? ` · objectif choisi : ${objectif} min par jour` : ""}.{" "}
            {!objectif ? (
              <Link href="/commencer/" className="text-brand underline underline-offset-4">
                Choisir un rythme
              </Link>
            ) : null}
          </p>
          <GraphiqueSemaine journal={journal} objectif={objectif} />
          <p className="mt-3 text-xs text-ink-3">Le temps est compté quand une page de chapitre est ouverte et visible. Aucun rappel, aucune série à entretenir.</p>
        </section>

        <section aria-labelledby="titre-scores" className="carte p-5">
          <h2 id="titre-scores" className="text-lg font-semibold text-ink">
            Tes résultats aux quiz
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-2">Meilleur score par chapitre ; il faut 80 % pour valider.</p>
          {chapitres.some(([, c]) => c.meilleurScore !== undefined) ? (
            <ul className="space-y-3">
              {chapitres
                .filter(([, c]) => c.meilleurScore !== undefined)
                .map(([slug, c]) => (
                  <li key={slug}>
                    <Link href={`/chapitre/${slug}/#etape-quiz`} className="group block">
                      <span className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-ink-2 group-hover:text-ink">{titres[slug] ?? slug}</span>
                        <span className="font-mono text-ink tabular">{Math.round((c.meilleurScore ?? 0) * 100)} %</span>
                      </span>
                      <span className="relative block">
                        <Jauge valeur={c.meilleurScore ?? 0} libelle={`Meilleur score de ${titres[slug] ?? slug}`} className="!h-2" />
                        <span className="absolute inset-y-[-3px] left-[80%] w-px bg-gold" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-3">Aucun quiz encore. Le premier se trouve à la fin de chaque chapitre.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="titre-concepts">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="titre-concepts" className="text-xl font-semibold text-ink">
              Carte des compétences
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Acquis : au moins 80 % sur deux questions ou plus, les plus récentes comptant davantage. À revoir : sous 60 %.
            </p>
          </div>
          <Anneau valeur={totalConcepts ? acquis / totalConcepts : 0} taille={64} libelle="Concepts acquis" teinte="var(--ok)">
            <span className="font-mono text-xs text-ink">
              {acquis}/{totalConcepts}
            </span>
          </Anneau>
        </div>
        <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-label="Légende">
          {(["acquis", "en-cours", "fragile", "non-vu"] as EtatConcept[]).map((e) => (
            <li key={e} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: couleurEtat[e] }} aria-hidden="true" />
              {libellesEtat[e].libelle}
            </li>
          ))}
        </ul>
        <div className="grid gap-4 md:grid-cols-2">
          {[...groupes.entries()].map(([module, liste], i) => (
            <div key={module} className="revele carte p-4" style={{ ["--i" as string]: i }}>
              <p className="mb-3 text-sm font-semibold text-ink">{typographie(module)}</p>
              <ul className="space-y-2.5">
                {liste.map(({ concept, etat, valeur }) => (
                  <li key={concept.id}>
                    <Link href={`/chapitre/${concept.chapitre}/`} className="group block">
                      <span className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink-2 group-hover:text-ink">{concept.nom}</span>
                        <span className="shrink-0 text-xs text-ink-3">{libellesEtat[etat].libelle}</span>
                      </span>
                      <span className="block h-1.5 overflow-hidden rounded-full bg-line" role="img" aria-label={`${concept.nom} : ${libellesEtat[etat].libelle}, maîtrise ${Math.round(valeur * 100)} %`}>
                        <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${etat === "non-vu" ? 0 : Math.max(4, valeur * 100)}%`, background: couleurEtat[etat] }} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {fragiles.length ? (
          <p className="mt-4 text-sm text-ink-2">
            À revoir en priorité :{" "}
            {fragiles.map((f, i) => (
              <span key={f.concept.id}>
                {i ? ", " : ""}
                <Link href={`/chapitre/${f.concept.chapitre}/`} className="text-brand underline underline-offset-4">
                  {f.concept.nom}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="titre-activite" className="carte p-5">
          <h2 id="titre-activite" className="mb-4 text-lg font-semibold text-ink">
            Activité récente
          </h2>
          <ol className="relative space-y-4 border-l border-line pl-5">
            {activites.map((a) => (
              <li key={`${a.slug}-${a.texte}`} className="relative">
                <span className={`absolute -left-[1.6rem] top-1 size-3 rounded-full border-2 border-bg ${a.texte === "Chapitre validé" ? "bg-ok" : "bg-cyan"}`} aria-hidden="true" />
                <p className="text-sm text-ink">
                  {a.texte} :{" "}
                  <Link href={`/chapitre/${a.slug}/`} className="font-medium underline-offset-4 hover:underline">
                    {titres[a.slug] ?? a.slug}
                  </Link>
                </p>
                <p className="text-xs text-ink-3">{ilYa(a.date)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titre-favoris" className="carte p-5">
          <h2 id="titre-favoris" className="mb-4 text-lg font-semibold text-ink">
            Favoris et notes
          </h2>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <IconeEtoile className="size-4 text-gold" /> Favoris
          </p>
          <ul className="mb-4 space-y-1 text-sm">
            {p.favoris.map((s) => (
              <li key={s}>
                <Link href={`/chapitre/${s}/`} className="text-ink-2 hover:text-ink">
                  {titres[s] ?? s}
                </Link>
              </li>
            ))}
            {p.favoris.length === 0 ? <li className="text-ink-3">Aucun favori : l&apos;étoile en haut de chaque chapitre l&apos;y ajoute.</li> : null}
          </ul>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <IconeNote className="size-4 text-brand" /> Notes
          </p>
          <ul className="space-y-2 text-sm">
            {Object.entries(p.notes).map(([s, n]) => (
              <li key={s}>
                <Link href={`/chapitre/${s}/`} className="font-medium text-ink-2 hover:text-ink">
                  {titres[s] ?? s}
                </Link>
                <p className="line-clamp-2 text-ink-3">{n}</p>
              </li>
            ))}
            {Object.keys(p.notes).length === 0 ? <li className="text-ink-3">Aucune note.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

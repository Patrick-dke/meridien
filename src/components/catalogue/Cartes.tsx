"use client";

import type { FicheChapitre } from "@/content";
import type { Motif } from "@/content/identite";
import { useProgression } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import { Carte } from "../ui/Carte";
import { IconeCadenas, IconeCoche, IconeHorloge, IconeSuivant } from "../ui/Icones";
import { Anneau, Jauge, Niveau } from "../ui/Progression";
import { Puce } from "../ui/Puce";
import { Vignette } from "../ui/Vignette";

type EtatCarte = "bientot" | "nouveau" | "en-cours" | "termine";

function useEtatChapitre(slug: string, publie: boolean, etapes: number) {
  const c = useProgression().chapitres[slug];
  const etat: EtatCarte = !publie ? "bientot" : !c ? "nouveau" : c.statut === "termine" ? "termine" : "en-cours";
  const avance = !c ? 0 : c.statut === "termine" ? 1 : Math.min(0.95, (c.etape + 1) / etapes);
  return { etat, avance, score: c?.meilleurScore };
}

const actions: Record<EtatCarte, string> = { bientot: "Bientôt", nouveau: "Commencer", "en-cours": "Reprendre", termine: "Revoir" };

function PuceEtat({ etat }: { etat: EtatCarte }) {
  if (etat === "termine")
    return (
      <Puce ton="ok">
        <IconeCoche className="size-3.5" /> Terminé
      </Puce>
    );
  if (etat === "en-cours") return <Puce ton="cyan">En cours</Puce>;
  if (etat === "bientot")
    return (
      <Puce>
        <IconeCadenas className="size-3" /> Bientôt
      </Puce>
    );
  return <Puce ton="brand">Disponible</Puce>;
}

/** Carte d'un chapitre : vignette, titre, description, niveau, durée, statut, avancement et action. */
export function CarteChapitre({ f, etapes = 9, rang }: { f: FicheChapitre; etapes?: number; rang?: number }) {
  const { etat, avance, score } = useEtatChapitre(f.slug, f.publie, etapes);
  const contenu = (
    <>
      <div className="relative overflow-hidden rounded-t-[inherit] border-b border-line">
        <Vignette motif={f.motif} teinte={f.teinte} graine={f.slug} className="aspect-[16/8] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <PuceEtat etat={etat} />
        </div>
        {rang !== undefined ? (
          <span className="absolute right-3 top-3 rounded-lg bg-bg/70 px-2 py-0.5 font-mono text-xs text-ink-2 backdrop-blur">{String(rang).padStart(2, "0")}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: f.teinte }}>
          {f.moduleTitre}
        </p>
        <h3 className="mt-1 text-[1.02rem] font-semibold leading-snug text-ink">{typographie(f.titre)}</h3>
        {f.description ? <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">{typographie(f.description)}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Niveau niveau={f.niveau} />
          {f.dureeMin ? (
            <span className="inline-flex items-center gap-1 text-xs text-ink-3">
              <IconeHorloge className="size-3.5" /> {f.dureeMin} min
            </span>
          ) : null}
          {f.ecole ? <span className="text-xs text-warn">Interprétation d&apos;école</span> : null}
        </div>
        <div className="mt-auto pt-4">
          {etat === "en-cours" ? <Jauge valeur={avance} libelle={`Avancement de ${f.titre}`} className="mb-3 !h-1.5" /> : null}
          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${etat === "bientot" ? "text-ink-3" : "text-brand"}`}>
            {actions[etat]}
            {etat !== "bientot" ? <IconeSuivant className="size-4 transition-transform group-hover:translate-x-0.5" /> : null}
            {score !== undefined && etat === "termine" ? <span className="ml-2 font-mono text-xs font-normal text-ink-3">meilleur score {Math.round(score * 100)} %</span> : null}
          </span>
        </div>
      </div>
    </>
  );
  if (!f.publie) {
    return <div className="carte flex h-full flex-col opacity-70">{contenu}</div>;
  }
  return (
    <Carte href={`/chapitre/${f.slug}/`} className="group flex h-full flex-col">
      {contenu}
    </Carte>
  );
}

/** Avancement d'une liste de chapitres : terminés sur publiés. */
function useAvancement(slugs: string[]) {
  const p = useProgression();
  const termines = slugs.filter((s) => p.chapitres[s]?.statut === "termine").length;
  const commences = slugs.filter((s) => p.chapitres[s]).length;
  return { termines, commences };
}

/** Carte d'académie ou de module : vignette, chiffres clés, anneau d'avancement. */
export function CarteEnsemble({
  href,
  surtitre,
  titre,
  description,
  motif,
  teinte,
  publies,
  total,
  details,
  ecole,
}: {
  href: string;
  surtitre: string;
  titre: string;
  description: string;
  motif: Motif;
  teinte: string;
  publies: string[];
  total: number;
  details: string[];
  ecole?: boolean;
}) {
  const { termines, commences } = useAvancement(publies);
  const avance = publies.length ? termines / publies.length : 0;
  return (
    <Carte href={href} className="group flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-line">
        <Vignette motif={motif} teinte={teinte} graine={href} className="aspect-[16/7] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-lg bg-bg/70 px-2 py-0.5 font-mono text-xs backdrop-blur" style={{ color: teinte }}>
          {surtitre}
        </span>
      </div>
      <div className="flex flex-1 gap-4 p-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug text-ink">{typographie(titre)}</h3>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-2">{typographie(description)}</p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-3">
            {details.map((d) => (
              <span key={d}>{d}</span>
            ))}
            {ecole ? <span className="text-warn">Interprétation d&apos;école</span> : null}
          </p>
          <p className={`mt-3 text-sm font-semibold ${publies.length ? "text-brand" : "text-ink-3"}`}>
            {publies.length === 0
              ? `${total} chapitres en préparation`
              : commences
                ? `Continuer · ${termines}/${publies.length} terminés`
                : `Explorer · ${publies.length} disponible${publies.length > 1 ? "s" : ""} sur ${total}`}
          </p>
        </div>
        {publies.length ? (
          <Anneau valeur={avance} taille={52} libelle={`Avancement de ${titre}`}>
            <span className="font-mono text-[0.7rem] text-ink-2">{Math.round(avance * 100)}%</span>
          </Anneau>
        ) : null}
      </div>
    </Carte>
  );
}

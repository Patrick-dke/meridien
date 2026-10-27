"use client";

import Link from "next/link";
import { useSession } from "@/lib/compte/session";
import { formaterPrix, useDroits, useModulesEnVente } from "@/lib/offre/commercial";
import { useProgression } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import type { Motif } from "@/content/identite";
import { Carte } from "../ui/Carte";
import { IconeCadenas, IconeCoche, IconeSuivant } from "../ui/Icones";
import { Jauge } from "../ui/Progression";
import { Puce } from "../ui/Puce";
import { Vignette } from "../ui/Vignette";

/** Ce que le serveur de pages transmet d'un module : sa structure, jamais son prix. */
export type ModulePresente = {
  id: string;
  titre: string;
  accroche: string;
  rang: number;
  gratuit: boolean;
  chapitres: string[];
  motif: Motif;
  teinte: string;
};

export type EtatModule = "gratuit" | "verrouille" | "achete" | "en-cours" | "termine" | "indisponible";

/** État d'un module pour l'apprenant : accès (base de données) et avancement (progression). */
export function useEtatModule(m: Pick<ModulePresente, "id" | "gratuit" | "chapitres">) {
  const progression = useProgression();
  const droits = useDroits();
  const vente = useModulesEnVente();
  const info = vente.donnees.get(m.id);
  const acces = m.gratuit || droits.modules.has(m.id);
  const termines = m.chapitres.filter((s) => progression.chapitres[s]?.statut === "termine").length;
  const commences = m.chapitres.filter((s) => progression.chapitres[s]).length;
  let etat: EtatModule;
  if (acces && termines === m.chapitres.length && m.chapitres.length > 0) etat = "termine";
  else if (acces && commences > 0) etat = "en-cours";
  else if (m.gratuit) etat = "gratuit";
  else if (acces) etat = "achete";
  else if (vente.statut === "pret" && info && !info.publie) etat = "indisponible";
  else etat = "verrouille";
  return { etat, acces, termines, commences, prix: info?.prix ?? null, chargementPrix: vente.statut === "chargement", droitsPrets: droits.pret };
}

export function PuceEtatModule({ etat }: { etat: EtatModule }) {
  switch (etat) {
    case "gratuit":
      return <Puce ton="ok">Gratuit</Puce>;
    case "verrouille":
      return (
        <Puce>
          <IconeCadenas className="size-3" /> Verrouillé
        </Puce>
      );
    case "achete":
      return <Puce ton="brand">Acheté</Puce>;
    case "en-cours":
      return <Puce ton="cyan">En cours</Puce>;
    case "termine":
      return (
        <Puce ton="ok">
          <IconeCoche className="size-3.5" /> Terminé
        </Puce>
      );
    case "indisponible":
      return <Puce ton="warn">Bientôt</Puce>;
  }
}

export function Prix({ prix, chargement, gratuit, className = "" }: { prix: number | null; chargement: boolean; gratuit: boolean; className?: string }) {
  if (gratuit) return <span className={className}>Gratuit</span>;
  if (chargement) return <span className={`inline-block h-[1em] w-24 animate-pulse rounded bg-surface-2 align-middle ${className}`} aria-label="Prix en cours de chargement" />;
  if (prix === null) return <span className={`${className} text-ink-3`}>Prix bientôt annoncé</span>;
  return <span className={className}>{formaterPrix(prix)}</span>;
}

const actions: Record<EtatModule, string> = {
  gratuit: "Commencer",
  verrouille: "Découvrir",
  achete: "Commencer",
  "en-cours": "Reprendre",
  termine: "Revoir",
  indisponible: "Découvrir",
};

export function CarteModule({ m }: { m: ModulePresente }) {
  const e = useEtatModule(m);
  return (
    <Carte href={`/formations/${m.id}/`} className="flex h-full flex-col">
      <div className="relative overflow-hidden rounded-t-[inherit] border-b border-line">
        <Vignette motif={m.motif} teinte={m.teinte} graine={m.id} className="aspect-[16/7] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3">
          <PuceEtatModule etat={e.etat} />
        </div>
        <span className="absolute right-3 top-3 rounded-lg bg-bg/70 px-2 py-0.5 font-mono text-xs text-ink-2 backdrop-blur">Niveau {m.rang}</span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-lg font-semibold leading-snug text-ink">{typographie(m.titre)}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-2">{typographie(m.accroche)}</p>
        <p className="mt-3 text-sm text-ink-3">{m.chapitres.length} chapitres</p>
        {e.acces && e.commences > 0 ? (
          <Jauge className="mt-3" valeur={e.termines / m.chapitres.length} libelle={`${e.termines} chapitre${e.termines > 1 ? "s" : ""} terminé${e.termines > 1 ? "s" : ""} sur ${m.chapitres.length}`} />
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {e.acces ? <span className="text-sm text-ink-2">{m.gratuit ? "Accès libre" : "Accès débloqué"}</span> : <Prix prix={e.prix} chargement={e.chargementPrix} gratuit={m.gratuit} className="text-lg font-semibold text-ink" />}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            {actions[e.etat]} <IconeSuivant className="size-4" />
          </span>
        </div>
      </div>
    </Carte>
  );
}

/** Bloc d'achat de la page de présentation : prix venu de la base, état d'accès, appel à l'action. */
export function BlocAchat({ m, premierChapitre }: { m: ModulePresente; premierChapitre: string }) {
  const e = useEtatModule(m);
  const s = useSession();
  const urlPaiement = `/paiement/?module=${m.id}`;
  return (
    <div className="carte p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <PuceEtatModule etat={e.etat} />
        <span className="text-sm text-ink-3">{m.chapitres.length} chapitres</span>
      </div>
      <p className="mt-4 text-sm text-ink-3">{e.acces ? "Ton accès" : "Prix du module"}</p>
      <p className="text-3xl font-semibold text-ink">
        {e.acces ? (m.gratuit ? "Gratuit" : "Débloqué") : <Prix prix={e.prix} chargement={e.chargementPrix} gratuit={m.gratuit} />}
      </p>
      {!m.gratuit && !e.acces ? <p className="mt-1 text-sm text-ink-2">Paiement unique, accès sans limite de durée. Orange Money ou MTN MoMo.</p> : null}
      <div className="mt-5 space-y-2.5">
        {e.acces ? (
          <Link href={`/chapitre/${premierChapitre}/`} className="btn btn-primaire btn-grand w-full">
            {e.etat === "en-cours" ? "Reprendre le module" : e.etat === "termine" ? "Revoir le module" : "Commencer le module"}
          </Link>
        ) : e.etat === "indisponible" ? (
          <p className="rounded-xl border border-line px-4 py-3 text-sm text-ink-2">Ce module n&apos;est pas encore en vente.</p>
        ) : s.etat === "connecte" ? (
          <Link href={urlPaiement} className="btn btn-primaire btn-grand w-full" aria-disabled={e.prix === null}>
            Débloquer ce module
          </Link>
        ) : (
          <>
            <Link href={`/inscription/?suite=${encodeURIComponent(urlPaiement)}`} className="btn btn-primaire btn-grand w-full">
              Créer un compte pour l&apos;acheter
            </Link>
            <Link href={`/connexion/?suite=${encodeURIComponent(urlPaiement)}`} className="btn btn-secondaire w-full">
              J&apos;ai déjà un compte
            </Link>
          </>
        )}
      </div>
      <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-ink-2">
        {["Capsules vidéo narrées de 90 s au plus", "Cours détaillé, exemples et figures interactives", "Exercices corrigés et quiz notés", "Certificat interne à la fin du module"].map((t) => (
          <li key={t} className="flex gap-2">
            <IconeCoche className="mt-0.5 size-4 shrink-0 text-ok" /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ligne du programme : lien direct si le chapitre est accessible, cadenas sinon. */
export function LigneProgramme({ m, slug, titre, numero }: { m: ModulePresente; slug: string; titre: string; numero: number }) {
  const e = useEtatModule(m);
  const progression = useProgression();
  const c = progression.chapitres[slug];
  const contenu = (
    <>
      <span className="w-7 shrink-0 font-mono text-sm text-ink-3">{String(numero).padStart(2, "0")}</span>
      <span className="min-w-0 flex-1 text-ink">{typographie(titre)}</span>
      {e.acces && c?.statut === "termine" ? (
        <IconeCoche className="size-4 shrink-0 text-ok" aria-label="Terminé" />
      ) : e.acces ? (
        <IconeSuivant className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
      ) : (
        <IconeCadenas className="size-4 shrink-0 text-ink-3" aria-label="Verrouillé" />
      )}
    </>
  );
  return (
    <li>
      {e.acces ? (
        <Link href={`/chapitre/${slug}/`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2">
          {contenu}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5">{contenu}</div>
      )}
    </li>
  );
}

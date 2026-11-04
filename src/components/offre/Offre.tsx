"use client";

import Link from "next/link";
import { useSession } from "@/lib/compte/session";
import { fonctionsDisponibles } from "@/lib/firebase/client";
import { formaterPrix, useDroits, useModulesEnVente } from "@/lib/offre/commercial";
import { useProgression } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import type { Motif } from "@/content/identite";
import { Carte } from "../ui/Carte";
import { IconeCadenas, IconeCoche, IconeSuivant } from "../ui/Icones";
import { Jauge } from "../ui/Progression";
import { Puce } from "../ui/Puce";

/** Ce que le serveur de pages transmet d'un module : sa structure, jamais son prix. */
export type ModulePresente = {
  id: string;
  titre: string;
  accroche: string;
  rang: number;
  niveau: string;
  gratuit: boolean;
  chapitres: string[];
  competences: string[];
  /** Totaux du module (durée, capsules, questions), calculés par npm run contenus:resume. */
  resume: { chapitres: number; dureeMin: number; capsules: number; questions: number; exercices: number } | null;
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
          <IconeCadenas className="size-3" /> À débloquer
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
  if (chargement) return <span className={`squelette inline-block h-[1em] w-24 align-middle ${className}`} aria-label="Tarif en cours de chargement" />;
  if (prix === null) return <span className={`${className} !font-sans !text-base !font-normal !text-ink-3`}>Tarif à venir</span>;
  return <span className={className}>{formaterPrix(prix)}</span>;
}

const actions: Record<EtatModule, string> = {
  gratuit: "Commencer",
  verrouille: "Voir le programme",
  achete: "Commencer",
  "en-cours": "Reprendre le cours",
  termine: "Revoir",
  indisponible: "Voir le programme",
};

/** Carte d'un module (espace personnel) : niveau, titre, avancement, tarif ou accès. */
export function CarteModule({ m }: { m: ModulePresente }) {
  const e = useEtatModule(m);
  return (
    <Carte href={`/formations/${m.id}/`} className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="surtitre">
          Module {m.rang} · {m.niveau}
        </p>
        <PuceEtatModule etat={e.etat} />
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">{typographie(m.titre)}</h3>
      <p className="mb-4 mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">{typographie(m.accroche)}</p>
      {e.acces && e.commences > 0 ? (
        <Jauge
          className="mt-4"
          valeur={e.termines / m.chapitres.length}
          libelle={`${e.termines} chapitre${e.termines > 1 ? "s" : ""} terminé${e.termines > 1 ? "s" : ""} sur ${m.chapitres.length}`}
        />
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
        {e.acces ? (
          <span className="text-sm text-ink-3">
            {e.termines}/{m.chapitres.length} chapitres
          </span>
        ) : (
          <Prix prix={e.prix} chargement={e.chargementPrix} gratuit={m.gratuit} className="font-mono font-medium text-ink" />
        )}
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
          {actions[e.etat]} <IconeSuivant className="size-4" />
        </span>
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
    <div className="carte eleve p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="surtitre">{e.acces ? "Ton accès" : m.gratuit ? "Introduction" : "Tarif"}</p>
        <PuceEtatModule etat={e.etat} />
      </div>
      <p className="mt-2 font-mono text-3xl font-medium text-ink tabular">
        {e.acces && !m.gratuit ? "Débloqué" : <Prix prix={e.prix} chargement={e.chargementPrix} gratuit={m.gratuit} />}
      </p>
      <p className="mt-1 text-sm text-ink-2">
        {m.gratuit
          ? "Gratuit, en entier. Un compte gratuit enregistre ta progression et ouvre les quiz."
          : e.acces
            ? "Accès sans limite de durée."
            : "Paiement unique, accès sans limite de durée. Orange Money ou MTN MoMo."}
      </p>
      <div className="mt-5 space-y-2.5">
        {e.acces ? (
          <Link href={`/chapitre/${premierChapitre}/`} className="btn btn-primaire btn-grand w-full">
            {e.etat === "en-cours"
              ? "Reprendre le cours"
              : e.etat === "termine"
                ? "Revoir le module"
                : m.gratuit
                  ? "Commencer mon parcours"
                  : "Commencer le module"}
          </Link>
        ) : !fonctionsDisponibles ? (
          <>
            <p className="border-l-2 border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">
              Le paiement en ligne ouvre bientôt. En attendant, commence gratuitement avec Premiers pas : ta progression sera conservée.
            </p>
            <Link href="/parcours/premiers-pas/" className="btn btn-primaire w-full">
              Commencer gratuitement
            </Link>
            {s.etat !== "connecte" ? (
              <Link href="/inscription/" className="btn btn-secondaire w-full">
                Créer mon compte
              </Link>
            ) : null}
          </>
        ) : e.etat === "indisponible" ? (
          <p className="border-l-2 border-line-strong px-3 py-2.5 text-sm text-ink-2">Ce module n&apos;est pas encore en vente.</p>
        ) : s.etat === "connecte" ? (
          <Link href={urlPaiement} className="btn btn-primaire btn-grand w-full" aria-disabled={e.prix === null}>
            Débloquer ce module
          </Link>
        ) : (
          <>
            <Link href={`/inscription/?suite=${encodeURIComponent(urlPaiement)}`} className="btn btn-primaire btn-grand w-full">
              Créer mon compte et débloquer
            </Link>
            <Link href={`/connexion/?suite=${encodeURIComponent(urlPaiement)}`} className="btn btn-secondaire w-full">
              Se connecter
            </Link>
          </>
        )}
      </div>
      <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-ink-2">
        {["Capsules vidéo narrées", "Cours illustré et graphiques annotés", "Exercices et quiz corrigés", "Examen de fin de module et certificat"].map((t) => (
          <li key={t} className="flex gap-2">
            <IconeCoche className="mt-0.5 size-4 shrink-0 text-jauge" /> {t}
          </li>
        ))}
      </ul>
      {!e.acces && !m.gratuit && fonctionsDisponibles ? (
        <p className="mt-4 border-t border-line pt-4 text-sm text-ink-2">
          Envie de voir la méthode avant ?{" "}
          <Link href="/parcours/premiers-pas/" className="lien">
            Le premier module est gratuit
          </Link>
          .
        </p>
      ) : null}
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
      <span className="min-w-0 flex-1 text-ink" style={{ viewTransitionName: `chapitre-${slug}` }}>
        {typographie(titre)}
      </span>
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
        <Link href={`/chapitre/${slug}/`} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-2">
          {contenu}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-3 py-3">{contenu}</div>
      )}
    </li>
  );
}

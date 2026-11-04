"use client";

import Link from "next/link";
import { duree } from "@/lib/duree";
import { formaterPrix, useModulesEnVente } from "@/lib/offre/commercial";
import { typographie } from "@/lib/typographie";
import { IconeCoche } from "../ui/Icones";
import { Jauge } from "../ui/Progression";
import { Prix, useEtatModule, type ModulePresente } from "./Offre";


function Ligne({ m, ouvert }: { m: ModulePresente; ouvert?: boolean }) {
  const e = useEtatModule(m);
  const r = m.resume;
  return (
    <li className="revele">
      <details className="depliant group" open={ouvert}>
        <summary className="grid cursor-pointer list-none grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 py-4 marker:hidden sm:grid-cols-[3rem_1fr_8.5rem_9.5rem_1.25rem] sm:gap-x-5 [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-sm text-ink-3 tabular">{String(m.rang).padStart(2, "0")}</span>
          <span className="min-w-0">
            <span className="block font-semibold leading-snug text-ink">{typographie(m.titre)}</span>
            <span className="mt-0.5 block text-sm text-ink-3 sm:hidden">
              {m.niveau} · {m.chapitres.length} chapitres{r ? ` · ${duree(r.dureeMin)}` : ""}
            </span>
            <span className="mt-0.5 hidden truncate text-sm text-ink-2 sm:block">{typographie(m.accroche)}</span>
          </span>
          <span className="hidden text-sm text-ink-2 sm:block">
            {m.niveau}
            <span className="block text-ink-3">
              {m.chapitres.length} ch.{r ? ` · ${duree(r.dureeMin)}` : ""}
            </span>
          </span>
          <span className="text-right font-mono text-sm font-medium text-ink tabular sm:text-base">
            {m.gratuit ? <span className="font-sans font-semibold">Gratuit</span> : <Prix prix={e.prix} chargement={e.chargementPrix} gratuit={false} className="max-sm:!text-sm" />}
          </span>
          <svg viewBox="0 0 20 20" className="hidden size-4 text-ink-3 transition-transform duration-300 group-open:rotate-180 sm:block" aria-hidden="true">
            <path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </summary>
        <div className="grid gap-6 pb-6 pl-[2.25rem] sm:grid-cols-[1fr_15rem] sm:pl-[4.25rem]">
          <div>
            <p className="text-[0.95rem] text-ink-2 sm:hidden">{typographie(m.accroche)}</p>
            <p className="surtitre mt-4 sm:mt-0">Ce que tu sauras faire</p>
            <ul className="mt-2 space-y-1.5 text-[0.95rem] text-ink">
              {m.competences.map((c) => (
                <li key={c} className="flex gap-2">
                  <IconeCoche className="mt-1 size-4 shrink-0 text-jauge" /> {typographie(c)}
                </li>
              ))}
            </ul>
            {e.acces && e.commences > 0 ? (
              <Jauge className="mt-4 max-w-xs" valeur={e.termines / m.chapitres.length} libelle={`${e.termines} chapitres terminés sur ${m.chapitres.length}`} />
            ) : null}
          </div>
          <div className="space-y-3">
            {r ? (
              <dl className="grid grid-cols-3 gap-2 border-y border-line py-2 text-center font-mono text-xs text-ink-3 tabular">
                <div>
                  <dd className="text-base text-ink">{r.capsules}</dd>
                  <dt>capsules</dt>
                </div>
                <div>
                  <dd className="text-base text-ink">{r.exercices}</dd>
                  <dt>exercices</dt>
                </div>
                <div>
                  <dd className="text-base text-ink">{r.questions}</dd>
                  <dt>questions</dt>
                </div>
              </dl>
            ) : null}
            {m.gratuit ? (
              <Link href="/parcours/premiers-pas/" className="btn btn-primaire w-full">
                {e.commences > 0 ? "Reprendre le cours" : "Commencer"}
              </Link>
            ) : (
              <Link href={`/formations/${m.id}/`} className="btn btn-primaire w-full">
                {e.acces ? (e.commences > 0 ? "Reprendre le cours" : "Commencer") : "Voir le programme"}
              </Link>
            )}
            <p className="text-xs leading-relaxed text-ink-3">
              {m.gratuit ? "Ouvert à tous, sans paiement." : e.acces ? "Accès débloqué sur ton compte." : "Paiement unique, accès sans limite de durée."}
            </p>
          </div>
        </div>
      </details>
    </li>
  );
}

/** Le programme complet, module par module, avec les tarifs lus en base. */
export function ProgrammeTarifs({ modules, ouvrirPremier = false }: { modules: ModulePresente[]; ouvrirPremier?: boolean }) {
  return (
    <ol className="divide-y divide-line border-y border-line-strong">
      {modules.map((m, i) => (
        <Ligne key={m.id} m={m} ouvert={ouvrirPremier && i === 0} />
      ))}
    </ol>
  );
}

/** « à partir de 10 000 FCFA », d'après les prix en base ; rien tant qu'ils ne sont pas connus. */
export function PrixDepart({ prefixe = "à partir de " }: { prefixe?: string }) {
  const vente = useModulesEnVente();
  const prix = [...vente.donnees.values()].filter((m) => !m.gratuit && m.publie && m.prix > 0).map((m) => m.prix);
  if (!prix.length) return null;
  return (
    <span>
      {prefixe}
      {formaterPrix(Math.min(...prix))}
    </span>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { offre } from "@/content/offre";
import { fonctionsDisponibles } from "@/lib/firebase/client";
import { useCatalogueOutils } from "@/lib/outils/catalogue";
import { libellesStatutDemande, lireMesLicences, useDemandesOutils, type Licence } from "@/lib/outils/demandes";
import { IconeCoche } from "../ui/Icones";

const titreModule = (id: string) => offre.find((m) => m.id === id)?.titre ?? id;
const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const STATUTS_LICENCE: Record<Licence["statut"], { texte: string; classe: string }> = {
  active: { texte: "Active", classe: "text-ok" },
  suspendue: { texte: "Suspendue", classe: "text-warn" },
  revoquee: { texte: "Révoquée", classe: "text-bad" },
};

function CarteLicence({ l, nom }: { l: Licence; nom: string }) {
  const [visible, setVisible] = useState(false);
  const [copie, setCopie] = useState(false);
  const expiree = l.expireLe !== null && new Date(l.expireLe) <= new Date();
  const statut = expiree && l.statut === "active" ? { texte: "Expirée", classe: "text-bad" } : STATUTS_LICENCE[l.statut];
  return (
    <li className="carte p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-ink">{nom}</p>
        <p className={`text-sm font-medium ${statut.classe}`}>{statut.texte}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-sm border border-line bg-surface-2 px-2 py-1 font-mono text-sm text-ink">{visible ? l.cle : `${l.cle.slice(0, 8)}-••••-••••-••••`}</code>
        <button type="button" className="btn btn-discret !min-h-9 text-sm" onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
          {visible ? "Masquer" : "Afficher"}
        </button>
        <button
          type="button"
          className="btn btn-discret !min-h-9 text-sm"
          onClick={() =>
            navigator.clipboard?.writeText(l.cle).then(
              () => {
                setCopie(true);
                setTimeout(() => setCopie(false), 1800);
              },
              () => setVisible(true),
            )
          }
        >
          {copie ? "Copiée" : "Copier la clé"}
        </button>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink-3">Comptes autorisés</dt>
          <dd className="mt-0.5 text-ink">
            {l.comptes.length ? (
              <ul>
                {l.comptes.map((c) => (
                  <li key={`${c.numero}-${c.serveur}`} className="font-mono">
                    {c.numero} <span className="text-ink-3">· {c.serveur}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-ink-2">Aucun pour l&apos;instant</span>
            )}
            <span className="mt-0.5 block text-xs text-ink-3">
              {l.comptes.length} sur {l.maxComptes}
              {l.activationAuto && l.comptes.length < l.maxComptes ? " · ajout au premier lancement du robot" : ""}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">Fin de licence</dt>
          <dd className="mt-0.5 text-ink">{l.expireLe ? date(l.expireLe) : "Sans date de fin"}</dd>
        </div>
        <div>
          <dt className="text-ink-3">Dernière vérification</dt>
          <dd className="mt-0.5 text-ink">
            {l.derniereVerification ? (
              <>
                {date(l.derniereVerification.le)}
                <span className="block text-xs text-ink-3">
                  compte {l.derniereVerification.compte} · {l.derniereVerification.raison === "ok" ? "autorisé" : "refusé"}
                </span>
              </>
            ) : (
              "Pas encore"
            )}
          </dd>
        </div>
      </dl>
      {l.telechargement ? (
        <a href={l.telechargement} className="btn btn-primaire mt-4" rel="noopener">
          Télécharger le robot (.ex5)
        </a>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Saisis cette clé dans les paramètres du robot. Elle est personnelle : ne la partage pas. Aucun mot de passe de trading n&apos;est jamais demandé.
      </p>
    </li>
  );
}

/** Espace « Mes outils » du compte : avancement vers l'offre de fin de formation, demandes, licences. */
export function MesOutils({ uid }: { uid: string }) {
  const { outils } = useCatalogueOutils();
  const d = useDemandesOutils();
  const [licences, setLicences] = useState<Licence[] | null>(null);
  useEffect(() => {
    lireMesLicences(uid).then(setLicences, () => setLicences([]));
  }, [uid]);
  const nom = (id: string) => outils.find((o) => o.id === id)?.nom ?? id;
  const acces = d.donnees?.demandes.filter((x) => x.statut === "accordee" && outils.find((o) => o.id === x.outil)?.categorie === "indicateur") ?? [];

  return (
    <div className="space-y-6">
      {licences && licences.length ? (
        <ul className="space-y-3">
          {licences.map((l) => (
            <CarteLicence key={l.id} l={l} nom={nom(l.outil)} />
          ))}
        </ul>
      ) : null}

      {acces.map((a) => (
        <div key={a.id} className="carte p-4 sm:p-5">
          <p className="font-semibold text-ink">{nom(a.outil)}</p>
          <p className="mt-1 text-sm text-ink-2">
            Accès ouvert sur TradingView : dans un graphique, ouvre Indicateurs, onglet « Scripts sur invitation ».{a.note ? ` ${a.note}` : ""}
          </p>
        </div>
      ))}

      {d.donnees ? (
        <div className="carte p-4 sm:p-5">
          <p className="font-semibold text-ink">Offerts en fin de formation</p>
          <p className="mt-1 text-sm text-ink-2">
            {d.donnees.eligible
              ? "Tu remplis les conditions : demande l'accès depuis la page des outils."
              : `Chaque module acheté, avec tous ses quiz réussis à ${Math.round(d.donnees.scoreMin * 100)} % au moins.`}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {d.donnees.modules.map((m) => {
              const fait = m.achete && m.chapitres > 0 && m.valides === m.chapitres;
              return (
                <li key={m.module} className="flex items-center gap-3">
                  <span className={`grid size-5 place-items-center rounded-sm border ${fait ? "border-ok text-ok" : "border-line-strong"}`}>
                    {fait ? <IconeCoche className="size-3.5" /> : null}
                  </span>
                  <span className="flex-1 text-ink">{titreModule(m.module)}</span>
                  <span className="font-mono text-xs text-ink-3 tabular">{m.achete ? `${m.valides}/${m.chapitres} quiz` : "à débloquer"}</span>
                </li>
              );
            })}
          </ul>
          {d.donnees.demandes.length ? (
            <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
              {d.donnees.demandes.map((x) => (
                <li key={x.id} className="text-ink-2">
                  <span className="text-ink">{nom(x.outil)}</span> : {libellesStatutDemande[x.statut].toLowerCase()}
                  {x.note ? ` (${x.note})` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : d.erreur ? (
        <p className="text-sm text-warn">{d.erreur}</p>
      ) : d.chargement ? (
        <div className="squelette h-24 rounded-lg" />
      ) : !fonctionsDisponibles ? (
        <p className="text-sm text-ink-2">Le suivi de ton éligibilité et les demandes d&apos;accès ouvrent très bientôt.</p>
      ) : null}

      <p className="text-sm">
        <Link href="/outils/" className="lien">
          Indicateurs et robots : fiches, conditions et demandes
        </Link>
      </p>
    </div>
  );
}

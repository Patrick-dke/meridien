"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { offre } from "@/content/offre";
import { comptesDisponibles, fonctionsDisponibles } from "@/lib/firebase/client";
import { formaterPrix } from "@/lib/offre/commercial";
import { libellesAcces, libellesStatut, useCatalogueOutils, type ModeAcces, type OutilCatalogue } from "@/lib/outils/catalogue";
import { libellesStatutDemande, useDemandesOutils, type CompteMT5, type Demande, type Eligibilite } from "@/lib/outils/demandes";
import { IconeCoche } from "../ui/Icones";
import { IllustrationOutil } from "./IllustrationOutil";

const titreModule = (id: string) => offre.find((m) => m.id === id)?.titre ?? id;
// Anciennes adresses des calculateurs (/outils/#position…) : ils vivent désormais dans la pratique.
const ANCIENNES_ANCRES = new Set(["position", "rendement-risque", "pips", "esperance"]);

function ConditionsAcces({ o }: { o: OutilCatalogue }) {
  return (
    <ul className="space-y-2 text-[0.95rem]">
      {o.modesAcces.map((m) => (
        <li key={m} className="flex gap-2.5">
          <span className="mt-2 size-1.5 shrink-0 bg-jauge" aria-hidden="true" />
          <span className="text-ink">
            {libellesAcces[m]}
            {m === "achat" ? <span className="text-ink-2"> · {o.prix === null ? "tarif à venir" : formaterPrix(o.prix)}</span> : null}
            {m === "parcours" && o.modulesInclus.length ? <span className="text-ink-2"> : {o.modulesInclus.map(titreModule).join(", ")}</span> : null}
            {m === "etudiants" ? <span className="text-ink-2"> : tous les modules achetés et leurs quiz réussis</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Formulaire({ o, eligibilite, demander, fermer }: { o: OutilCatalogue; eligibilite: Eligibilite | null; demander: ReturnType<typeof useDemandesOutils>["demander"]; fermer: () => void }) {
  const modes = o.modesAcces;
  const [mode, setMode] = useState<ModeAcces>(modes.includes("etudiants") && eligibilite?.eligible ? "etudiants" : modes[0]);
  const [identifiant, setIdentifiant] = useState("");
  const [comptes, setComptes] = useState<CompteMT5[]>([{ numero: "", serveur: "" }]);
  const [installation, setInstallation] = useState<"autonome" | "assistee">("autonome");
  const [consentement, setConsentement] = useState(false);
  const [message, setMessage] = useState("");
  const [etat, setEtat] = useState<{ envoi: boolean; erreur: string | null; ok: boolean }>({ envoi: false, erreur: null, ok: false });
  const mt5 = o.plateforme === "MetaTrader 5";

  if (etat.ok)
    return (
      <div role="status" className="border-l-2 border-ok pl-4">
        <p className="font-semibold text-ink">Demande enregistrée.</p>
        <p className="mt-1 text-sm text-ink-2">
          {mt5
            ? "À l'acceptation, ta clé de licence apparaîtra dans ton compte, avec le fichier et la marche à suivre."
            : "À l'acceptation, le script apparaîtra dans TradingView, dans Indicateurs, onglet « Scripts sur invitation »."}{" "}
          Tu suis l&apos;état de la demande dans <Link href="/compte/#outils" className="lien">ton compte</Link>.
        </p>
      </div>
    );

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setEtat({ envoi: true, erreur: null, ok: false });
        try {
          await demander({
            outil: o.id,
            mode,
            ...(mt5
              ? { comptes: comptes.filter((c) => c.numero.trim() || c.serveur.trim()), installation, consentementAssistance: installation === "assistee" ? consentement : false }
              : { identifiantTradingView: identifiant.trim() }),
            message: message.trim() || undefined,
          });
          setEtat({ envoi: false, erreur: null, ok: true });
        } catch (err) {
          setEtat({ envoi: false, erreur: (err as Error).message, ok: false });
        }
      }}
    >
      {modes.length > 1 ? (
        <fieldset>
          <legend className="text-sm font-medium text-ink-2">Mode d&apos;accès</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {modes.map((m) => {
              const indisponible = m === "etudiants" && eligibilite !== null && !eligibilite.eligible;
              return (
                <label key={m} className={`flex cursor-pointer gap-2.5 rounded-md border p-3 text-sm ${mode === m ? "border-ink bg-surface" : "border-line-strong"} ${indisponible ? "opacity-60" : ""}`}>
                  <input type="radio" name={`mode-${o.id}`} value={m} checked={mode === m} onChange={() => setMode(m)} disabled={indisponible} className="mt-0.5 accent-[var(--ink)]" />
                  <span>
                    <span className="block font-medium text-ink">{libellesAcces[m]}</span>
                    {m === "achat" ? <span className="text-ink-3">{o.prix === null ? "Tarif à venir" : formaterPrix(o.prix)}</span> : null}
                    {indisponible ? <span className="text-ink-3">Termine d&apos;abord la formation</span> : null}
                  </span>
                </label>
              );
            })}
          </div>
          {mode === "achat" ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              Le paiement en ligne des outils n&apos;est pas encore ouvert : ta demande est enregistrée sans paiement, et l&apos;accès ne s&apos;ouvre qu&apos;après un paiement confirmé.
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {mt5 ? (
        <>
          <fieldset>
            <legend className="text-sm font-medium text-ink-2">Comptes MetaTrader 5 à autoriser</legend>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">
              Le numéro de compte (login) et le serveur figurent dans MetaTrader 5, menu Fichier, « Se connecter à un compte de trading », ou dans l&apos;e-mail d&apos;ouverture de ton
              courtier. <strong className="font-semibold text-ink">Ne saisis jamais ton mot de passe</strong> : Méridien n&apos;en a besoin à aucun moment.
            </p>
            <div className="mt-3 space-y-2">
              {comptes.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input
                    aria-label={`Numéro du compte ${i + 1}`}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Numéro (login)"
                    value={c.numero}
                    onChange={(e) => setComptes(comptes.map((x, j) => (j === i ? { ...x, numero: e.target.value.replace(/\D/g, "") } : x)))}
                    className="champ !min-h-11 font-mono"
                  />
                  <input
                    aria-label={`Serveur du compte ${i + 1}`}
                    autoComplete="off"
                    placeholder="Serveur, ex. MetaQuotes-Demo"
                    value={c.serveur}
                    onChange={(e) => setComptes(comptes.map((x, j) => (j === i ? { ...x, serveur: e.target.value } : x)))}
                    className="champ !min-h-11"
                  />
                  <button
                    type="button"
                    className="btn btn-discret !min-h-11 !px-3"
                    aria-label={`Retirer le compte ${i + 1}`}
                    disabled={comptes.length === 1}
                    onClick={() => setComptes(comptes.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {comptes.length < 3 ? (
              <button type="button" className="mt-2 text-sm lien" onClick={() => setComptes([...comptes, { numero: "", serveur: "" }])}>
                Ajouter un compte
              </button>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-ink-2">Installation</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["autonome", "Autonome", "Fichier compilé et clé de licence ; tu suis le guide pas à pas."],
                  ["assistee", "Accompagnée", "Une session ponctuelle sur rendez-vous, que tu ouvres et fermes toi-même."],
                ] as const
              ).map(([v, titre, texte]) => (
                <label key={v} className={`flex cursor-pointer gap-2.5 rounded-md border p-3 text-sm ${installation === v ? "border-ink bg-surface" : "border-line-strong"}`}>
                  <input type="radio" name={`installation-${o.id}`} value={v} checked={installation === v} onChange={() => setInstallation(v)} className="mt-0.5 accent-[var(--ink)]" />
                  <span>
                    <span className="block font-medium text-ink">{titre}</span>
                    <span className="text-ink-3">{texte}</span>
                  </span>
                </label>
              ))}
            </div>
            {installation === "assistee" ? (
              <label className="mt-3 flex gap-2.5 text-sm text-ink-2">
                <input type="checkbox" checked={consentement} onChange={(e) => setConsentement(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--ink)]" />
                <span>
                  J&apos;accepte une session d&apos;assistance ponctuelle, limitée à l&apos;installation, que je lance et arrête moi-même. Je tape moi-même tout identifiant demandé par
                  MetaTrader ; je ne communique aucun mot de passe.
                </span>
              </label>
            ) : null}
          </fieldset>
        </>
      ) : (
        <div>
          <label htmlFor={`tv-${o.id}`} className="block text-sm font-medium text-ink-2">
            Identifiant TradingView
          </label>
          <input id={`tv-${o.id}`} autoComplete="off" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} placeholder="ton_identifiant" className="champ mt-1 !min-h-11 font-mono" />
          <p className="mt-1 text-xs text-ink-3">Il apparaît dans l&apos;adresse de ton profil : tradingview.com/u/ton_identifiant. Aucun mot de passe n&apos;est demandé.</p>
        </div>
      )}

      <div>
        <label htmlFor={`message-${o.id}`} className="block text-sm font-medium text-ink-2">
          Message <span className="font-normal text-ink-3">(facultatif)</span>
        </label>
        <textarea id={`message-${o.id}`} rows={2} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} className="champ mt-1" />
      </div>

      {etat.erreur ? (
        <p role="alert" className="text-sm text-bad">
          {etat.erreur}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primaire" disabled={etat.envoi || (mt5 && installation === "assistee" && !consentement)}>
          {etat.envoi ? "Envoi…" : "Envoyer la demande"}
        </button>
        <button type="button" className="btn btn-discret" onClick={fermer}>
          Annuler
        </button>
      </div>
    </form>
  );
}

function Action({ o, demande, d }: { o: OutilCatalogue; demande: Demande | undefined; d: ReturnType<typeof useDemandesOutils> }) {
  const [ouvert, setOuvert] = useState(false);
  if (o.statut === "en-preparation")
    return <p className="text-sm text-ink-2">En préparation : les demandes s&apos;ouvriront ici dès que l&apos;outil sera prêt à être distribué.</p>;
  if (o.statut === "suspendu") return <p className="text-sm text-ink-2">Distribution suspendue pour le moment.</p>;
  if (demande && demande.statut !== "refusee")
    return (
      <p className="text-sm">
        <span className="font-semibold text-ink">{libellesStatutDemande[demande.statut]}</span>
        {demande.note ? <span className="text-ink-2"> : {demande.note}</span> : null}{" "}
        <Link href="/compte/#outils" className="lien">
          Voir dans mon compte
        </Link>
      </p>
    );
  if (!fonctionsDisponibles || !comptesDisponibles) return <p className="text-sm text-ink-2">Les demandes en ligne ouvrent très bientôt.</p>;
  if (d.session.etat !== "connecte")
    return (
      <Link href={`/connexion/?suite=${encodeURIComponent(`/outils/#${o.id}`)}`} className="btn btn-primaire">
        Se connecter pour demander l&apos;accès
      </Link>
    );
  if (!ouvert)
    return (
      <button type="button" className="btn btn-primaire" onClick={() => setOuvert(true)} disabled={d.chargement}>
        {o.modesAcces.includes("achat") && !o.modesAcces.includes("etudiants") ? "Acquérir l'outil" : "Demander l'accès"}
      </button>
    );
  return (
    <div className="carte apparition p-4 sm:p-5">
      <Formulaire o={o} eligibilite={d.donnees} demander={d.demander} fermer={() => setOuvert(false)} />
    </div>
  );
}

function Fiche({ o, d, inverse }: { o: OutilCatalogue; d: ReturnType<typeof useDemandesOutils>; inverse: boolean }) {
  const demande = d.donnees?.demandes.find((x) => x.outil === o.id);
  return (
    <article id={o.id} aria-labelledby={`titre-${o.id}`} className="grid scroll-mt-24 gap-8 py-12 lg:grid-cols-2 lg:gap-14">
      <div className={`revele lg:sticky lg:top-24 lg:self-start ${inverse ? "lg:order-2" : ""}`}>
        <div className="eleve overflow-hidden rounded-xl border border-line">
          <IllustrationOutil categorie={o.categorie} />
        </div>
        <dl className="mt-4 grid grid-cols-3 border-y border-line text-sm">
          {(
            [
              ["Catégorie", o.categorie === "indicateur" ? "Indicateur" : "Robot (Expert Advisor)"],
              ["Plateforme", o.plateforme],
              ["Statut", libellesStatut[o.statut]],
            ] as const
          ).map(([k, v], i) => (
            <div key={k} className={`py-3 ${i ? "border-l border-line pl-3" : ""}`}>
              <dt className="text-xs text-ink-3">{k}</dt>
              <dd className="mt-0.5 font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <p className="surtitre">
          {o.categorie === "indicateur" ? "Indicateur" : "Robot"} · {o.plateforme}
        </p>
        <h2 id={`titre-${o.id}`} className="mt-2 text-3xl text-ink sm:text-4xl">
          {o.nom}
        </h2>
        <p className="mt-3 text-lg text-ink-2">{o.resume}</p>

        <h3 className="surtitre mt-8">Fonctionnalités</h3>
        <ul className="mt-3 space-y-2">
          {o.fonctionnalites.map((f) => (
            <li key={f} className="flex gap-2.5 text-ink">
              <IconeCoche className="mt-1 size-4 shrink-0 text-jauge" />
              {f}
            </li>
          ))}
        </ul>

        <h3 className="surtitre mt-8">Conditions d&apos;utilisation</h3>
        <ul className="mt-3 space-y-1.5 text-[0.95rem] text-ink-2">
          {o.conditionsUtilisation.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <h3 className="surtitre mt-8">Conditions d&apos;accès</h3>
        <div className="mt-3">
          <ConditionsAcces o={o} />
        </div>

        <div className="mt-8">
          <Action o={o} demande={demande} d={d} />
        </div>
      </div>
    </article>
  );
}

/** Les fiches des outils, lues en base (ou fiches de départ), avec la demande d'accès de l'apprenant connecté. */
export function Vitrine() {
  const { outils } = useCatalogueOutils();
  const d = useDemandesOutils();
  const router = useRouter();
  useEffect(() => {
    const ancre = window.location.hash.slice(1);
    if (ANCIENNES_ANCRES.has(ancre)) router.replace(`/pratique/#${ancre}`);
  }, [router]);
  return (
    <div className="divide-y divide-line border-y border-line">
      {outils.map((o, i) => (
        <Fiche key={o.id} o={o} d={d} inverse={i % 2 === 1} />
      ))}
    </div>
  );
}

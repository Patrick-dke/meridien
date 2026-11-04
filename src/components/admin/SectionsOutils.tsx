"use client";

import { useState } from "react";
import { offre } from "@/content/offre";
import { libellesAcces, libellesStatut, OUTILS_DE_DEPART, type ModeAcces, type OutilCatalogue, type StatutOutil } from "@/lib/outils/catalogue";
import { Alerte } from "../compte/Formulaire";
import { action, cellule, dateHeure, demanderMotif, Etat, fcfa, Tableau, useAction } from "./outils";

/* ---------------- Catalogue ---------------- */

const lignes = (t: string) =>
  t
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

function FicheEditable({ o, enregistrer }: { o: OutilCatalogue; enregistrer: (o: OutilCatalogue) => Promise<void> }) {
  const [f, setF] = useState({ ...o, prixTexte: o.prix === null ? "" : String(o.prix), fonctionsTexte: o.fonctionnalites.join("\n"), conditionsTexte: o.conditionsUtilisation.join("\n") });
  const maj = (champs: Partial<typeof f>) => setF({ ...f, ...champs });
  const basculer = <T,>(liste: T[], v: T) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v]);
  return (
    <form
      className="carte space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const { prixTexte, fonctionsTexte, conditionsTexte, ...reste } = f;
        await enregistrer({ ...reste, prix: prixTexte === "" ? null : Number(prixTexte), fonctionnalites: lignes(fonctionsTexte), conditionsUtilisation: lignes(conditionsTexte) });
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-semibold text-ink">{o.nom}</p>
        <p className="font-mono text-xs text-ink-3">
          {o.id} · {o.plateforme}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-ink-2">
          Nom
          <input className="champ mt-1" value={f.nom} onChange={(e) => maj({ nom: e.target.value })} />
        </label>
        <label className="text-sm text-ink-2">
          Statut
          <select className="champ mt-1" value={f.statut} onChange={(e) => maj({ statut: e.target.value as StatutOutil })}>
            {(Object.keys(libellesStatut) as StatutOutil[]).map((s) => (
              <option key={s} value={s}>
                {libellesStatut[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink-2 sm:col-span-2">
          Résumé
          <input className="champ mt-1" value={f.resume} onChange={(e) => maj({ resume: e.target.value })} />
        </label>
        <label className="text-sm text-ink-2">
          Fonctionnalités (une par ligne)
          <textarea className="champ mt-1" rows={5} value={f.fonctionsTexte} onChange={(e) => maj({ fonctionsTexte: e.target.value })} />
        </label>
        <label className="text-sm text-ink-2">
          Conditions d&apos;utilisation (une par ligne)
          <textarea className="champ mt-1" rows={5} value={f.conditionsTexte} onChange={(e) => maj({ conditionsTexte: e.target.value })} />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm text-ink-2">Modes d&apos;accès</legend>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {(Object.keys(libellesAcces) as ModeAcces[]).map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={f.modesAcces.includes(m)} onChange={() => maj({ modesAcces: basculer(f.modesAcces, m) })} />
              {libellesAcces[m]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-ink-2">
          Prix de vente séparée (FCFA)
          <input className="champ mt-1" inputMode="numeric" placeholder="vide : pas de prix" value={f.prixTexte} onChange={(e) => maj({ prixTexte: e.target.value.replace(/\D/g, "") })} />
        </label>
        <label className="text-sm text-ink-2">
          Ordre d&apos;affichage
          <input className="champ mt-1" inputMode="numeric" value={String(f.ordre)} onChange={(e) => maj({ ordre: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        </label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-ink">
          <input type="checkbox" checked={f.publie} onChange={(e) => maj({ publie: e.target.checked })} />
          Publié sur le site
        </label>
      </div>
      {f.modesAcces.includes("parcours") ? (
        <fieldset>
          <legend className="text-sm text-ink-2">Inclus avec l&apos;achat de</legend>
          <div className="mt-1 grid gap-1 sm:grid-cols-2">
            {offre
              .filter((m) => !m.gratuit)
              .map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={f.modulesInclus.includes(m.id)} onChange={() => maj({ modulesInclus: basculer(f.modulesInclus, m.id) })} />
                  {m.titre}
                </label>
              ))}
          </div>
        </fieldset>
      ) : null}
      <button type="submit" className="btn btn-primaire">
        Enregistrer la fiche
      </button>
    </form>
  );
}

export function CatalogueOutils() {
  const l = useAction<OutilCatalogue[]>("catalogue.lister");
  const [retour, setRetour] = useState<string | null>(null);
  const enregistrer = async (o: OutilCatalogue, motif?: string) => {
    const m = motif ?? demanderMotif(`Enregistrer la fiche « ${o.nom} » (statut : ${libellesStatut[o.statut]}, prix : ${o.prix === null ? "aucun" : fcfa(o.prix)}) ?`);
    if (!m) return;
    try {
      await action("catalogue.enregistrer", { outil: o, motif: m });
      setRetour(`Fiche « ${o.nom} » enregistrée et journalisée.`);
      l.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Les fiches s&apos;affichent sur la page Outils. Les demandes ne s&apos;ouvrent qu&apos;aux outils publiés au statut « Disponible » ou « Sur demande ». Le prix ne sert qu&apos;au mode « En vente
        séparément ».
      </p>
      {l.donnees && l.donnees.length === 0 ? (
        <button
          type="button"
          className="btn btn-secondaire"
          onClick={async () => {
            const motif = demanderMotif("Créer les fiches de départ (statut « En préparation », sans prix) ?");
            if (motif) for (const o of OUTILS_DE_DEPART) await enregistrer(o, motif);
          }}
        >
          Créer les fiches de départ
        </button>
      ) : null}
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      <Etat {...l} />
      {l.donnees?.map((o) => (
        <FicheEditable key={`${o.id}-${JSON.stringify(o).length}`} o={o} enregistrer={(x) => enregistrer(x)} />
      ))}
    </div>
  );
}

/* ---------------- Demandes d'accès ---------------- */

type DemandeAdmin = {
  id: string;
  uid: string;
  email?: string | null;
  outil: string;
  nomOutil?: string;
  plateforme?: string;
  mode?: ModeAcces;
  statut: string;
  creeLe: string;
  message?: string | null;
  noteAdmin?: string | null;
  licence?: string;
  details?: { identifiantTradingView?: string; comptes?: { numero: string; serveur: string }[]; installation?: string; consentementAssistance?: boolean };
};

export function DemandesOutils() {
  const l = useAction<DemandeAdmin[]>("demandes.lister");
  const [retour, setRetour] = useState<string | null>(null);
  const traiter = async (d: DemandeAdmin, decision: "accordee" | "refusee") => {
    const tv = d.plateforme === "TradingView";
    if (decision === "accordee" && tv && !window.confirm(`As-tu ajouté « ${d.details?.identifiantTradingView} » à la liste d'accès du script sur TradingView (Manage access) ?`)) return;
    const note = window.prompt(decision === "accordee" ? "Note pour l'apprenant (facultative) :" : "Motif du refus, visible par l'apprenant :");
    if (note === null) return;
    let expireLe: string | null = null;
    let maxComptes: number | undefined;
    if (decision === "accordee") {
      const fin = window.prompt("Date de fin d'accès (AAAA-MM-JJ), vide pour aucune :", "");
      if (fin === null) return;
      expireLe = fin.trim() ? `${fin.trim()}T23:59:59.000Z` : null;
      if (!tv) {
        const n = window.prompt("Nombre de comptes autorisés :", String(Math.max(1, d.details?.comptes?.length ?? 1)));
        if (n === null) return;
        maxComptes = Number(n) || 1;
      }
    }
    try {
      const r = await action<{ licence: string | null }>("demandes.traiter", { id: d.id, decision, note, expireLe, maxComptes });
      setRetour(r.licence ? `Licence créée (${r.licence}) : la clé apparaît dans le compte de l'apprenant.` : decision === "accordee" ? "Accès accordé." : "Demande refusée.");
      l.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Robot : accorder crée la licence avec les comptes demandés (installation autonome : ajout possible au premier lancement, dans la limite fixée). Indicateur : ajoute d&apos;abord
        l&apos;identifiant sur TradingView, puis accorde ici. Aucun mot de passe n&apos;est jamais collecté.
      </p>
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      <Etat {...l} />
      {l.donnees ? (
        <Tableau entetes={["Date", "Outil · mode", "Apprenant", "Détails", "Statut", ""]}>
          {l.donnees.map((d) => (
            <tr key={d.id}>
              <td className={cellule}>{dateHeure(d.creeLe)}</td>
              <td className={cellule}>
                <span className="text-ink">{d.nomOutil ?? d.outil}</span>
                <span className="block text-xs text-ink-3">{d.mode ? libellesAcces[d.mode] : "—"}</span>
              </td>
              <td className={cellule}>
                <span className="text-ink">{d.email ?? "—"}</span>
                <span className="block font-mono text-xs text-ink-3">{d.uid}</span>
              </td>
              <td className={`${cellule} text-xs`}>
                {d.details?.identifiantTradingView ? <span className="font-mono">TradingView : {d.details.identifiantTradingView}</span> : null}
                {d.details?.comptes?.map((c) => (
                  <span key={c.numero} className="block font-mono">
                    {c.numero} · {c.serveur}
                  </span>
                ))}
                {d.details?.installation ? (
                  <span className="block text-ink-3">
                    Installation {d.details.installation === "assistee" ? "accompagnée (accord donné)" : "autonome"}
                  </span>
                ) : null}
                {d.message ? <span className="mt-1 block text-ink-2">« {d.message} »</span> : null}
              </td>
              <td className={cellule}>
                {d.statut}
                {d.licence ? <span className="block font-mono text-xs text-ink-3">{d.licence}</span> : null}
              </td>
              <td className={cellule}>
                {d.statut === "en_attente" ? (
                  <div className="flex gap-2">
                    <button type="button" className="text-xs text-ok underline" onClick={() => traiter(d, "accordee")}>
                      Accorder
                    </button>
                    <button type="button" className="text-xs text-bad underline" onClick={() => traiter(d, "refusee")}>
                      Refuser
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </Tableau>
      ) : null}
    </div>
  );
}

/* ---------------- Licences ---------------- */

type LicenceAdmin = {
  id: string;
  uid: string;
  email?: string | null;
  outil: string;
  cle: string;
  statut: "active" | "suspendue" | "revoquee";
  comptes: { numero: string; serveur: string }[];
  maxComptes: number;
  activationAuto: boolean;
  activations: number;
  expireLe: string | null;
  creeLe: string;
  telechargement?: string | null;
  derniereVerification: { le: string; compte: string; serveur: string; raison: string } | null;
};

/** « 51234567 MetaQuotes-Demo » par ligne → comptes. */
const lireComptes = (t: string) =>
  lignes(t).map((x) => {
    const [numero, ...serveur] = x.split(/\s+/);
    return { numero, serveur: serveur.join(" ") };
  });

function NouvelleLicence({ creee }: { creee: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [comptes, setComptes] = useState("");
  const [max, setMax] = useState("1");
  const [auto, setAuto] = useState(false);
  const [fin, setFin] = useState("");
  const [note, setNote] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  return (
    <form
      className="carte grid gap-3 p-5 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const r = await action<{ id: string }>("licences.creer", {
            email,
            outil: "ea",
            comptes: lireComptes(comptes),
            maxComptes: Number(max) || 1,
            activationAuto: auto,
            expireLe: fin ? `${fin}T23:59:59.000Z` : null,
            note,
          });
          creee(`Licence ${r.id} créée.`);
          setEmail("");
          setComptes("");
          setErreur(null);
        } catch (err) {
          setErreur((err as Error).message);
        }
      }}
    >
      <p className="font-semibold text-ink sm:col-span-2">Créer une licence</p>
      <label className="text-sm text-ink-2">
        Adresse du titulaire
        <input className="champ mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="text-sm text-ink-2">
        Date de fin (facultative)
        <input className="champ mt-1" type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
      </label>
      <label className="text-sm text-ink-2">
        Comptes autorisés (« numéro serveur » par ligne)
        <textarea className="champ mt-1 font-mono" rows={3} placeholder="51234567 MetaQuotes-Demo" value={comptes} onChange={(e) => setComptes(e.target.value)} />
      </label>
      <div className="space-y-3">
        <label className="block text-sm text-ink-2">
          Nombre de comptes maximal
          <input className="champ mt-1" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          Ajout automatique au premier lancement (installation autonome)
        </label>
      </div>
      <label className="text-sm text-ink-2 sm:col-span-2">
        Note interne
        <input className="champ mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {erreur ? <p className="text-sm text-bad sm:col-span-2">{erreur}</p> : null}
      <button type="submit" className="btn btn-primaire sm:col-span-2 sm:justify-self-start">
        Créer la licence
      </button>
    </form>
  );
}

export function Licences() {
  const l = useAction<LicenceAdmin[]>("licences.lister");
  const [retour, setRetour] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);
  const modifier = async (x: LicenceAdmin, champs: Record<string, unknown>, question: string) => {
    const motif = demanderMotif(question);
    if (!motif) return;
    try {
      await action("licences.modifier", { id: x.id, ...champs, motif });
      setRetour("Licence modifiée et journalisée.");
      l.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Une licence autorise le robot sur des comptes précis (numéro et serveur, jamais de mot de passe). Suspendre ou révoquer arrête le robot à sa prochaine vérification ; cela ne touche
        jamais aux positions ni au compte du client.
      </p>
      <button type="button" className="btn btn-secondaire" onClick={() => setCreation((c) => !c)}>
        {creation ? "Fermer" : "Créer une licence à la main"}
      </button>
      {creation ? (
        <NouvelleLicence
          creee={(m) => {
            setRetour(m);
            l.recharger();
          }}
        />
      ) : null}
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      <Etat {...l} />
      {l.donnees ? (
        <Tableau entetes={["Titulaire", "Clé", "Comptes", "Fin", "Dernière vérification", "Statut", ""]}>
          {l.donnees.map((x) => (
            <tr key={x.id}>
              <td className={cellule}>
                <span className="text-ink">{x.email ?? "—"}</span>
                <span className="block text-xs text-ink-3">
                  {x.outil} · créée {dateHeure(x.creeLe)}
                </span>
              </td>
              <td className={`${cellule} font-mono text-xs`}>{x.cle}</td>
              <td className={`${cellule} text-xs`}>
                {x.comptes.map((c) => (
                  <span key={`${c.numero}-${c.serveur}`} className="block font-mono">
                    {c.numero} · {c.serveur}
                  </span>
                ))}
                <span className="block text-ink-3">
                  {x.comptes.length}/{x.maxComptes} · {x.activations} activation{x.activations > 1 ? "s" : ""}
                  {x.activationAuto ? " · ajout auto" : ""}
                </span>
              </td>
              <td className={cellule}>{x.expireLe ? new Date(x.expireLe).toLocaleDateString("fr-FR") : "—"}</td>
              <td className={`${cellule} text-xs`}>
                {x.derniereVerification ? (
                  <>
                    {dateHeure(x.derniereVerification.le)}
                    <span className="block text-ink-3">
                      {x.derniereVerification.compte} · {x.derniereVerification.raison}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className={cellule}>{x.statut}</td>
              <td className={`${cellule} text-xs`}>
                {x.statut !== "revoquee" ? (
                  <div className="flex flex-col items-start gap-1">
                    <button type="button" className="underline" onClick={() => modifier(x, { statut: x.statut === "active" ? "suspendue" : "active" }, x.statut === "active" ? "Suspendre cette licence ?" : "Réactiver cette licence ?")}>
                      {x.statut === "active" ? "Suspendre" : "Réactiver"}
                    </button>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => {
                        const n = window.prompt("Nombre de comptes maximal :", String(x.maxComptes));
                        if (n !== null) void modifier(x, { maxComptes: Number(n) || 1 }, `Passer à ${Number(n) || 1} compte(s) ?`);
                      }}
                    >
                      Comptes max.
                    </button>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => {
                        const f = window.prompt("Date de fin (AAAA-MM-JJ), vide pour aucune :", x.expireLe?.slice(0, 10) ?? "");
                        if (f !== null) void modifier(x, { expireLe: f.trim() ? `${f.trim()}T23:59:59.000Z` : null }, "Changer la date de fin ?");
                      }}
                    >
                      Date de fin
                    </button>
                    {x.comptes.length ? (
                      <button
                        type="button"
                        className="underline"
                        onClick={() => {
                          const num = window.prompt(`Numéro du compte à retirer (${x.comptes.map((c) => c.numero).join(", ")}) :`);
                          if (num) void modifier(x, { comptes: x.comptes.filter((c) => c.numero !== num.trim()) }, `Retirer le compte ${num} ?`);
                        }}
                      >
                        Retirer un compte
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => {
                        const lien = window.prompt("Lien de téléchargement du fichier .ex5 (https://…), vide pour retirer :", x.telechargement ?? "");
                        if (lien !== null) void modifier(x, { telechargement: lien.trim() }, "Changer le lien de téléchargement ?");
                      }}
                    >
                      Lien du fichier
                    </button>
                    <button type="button" className="underline" onClick={() => modifier(x, { regenerer: true }, "Générer une nouvelle clé ? L'ancienne cessera de fonctionner.")}>
                      Nouvelle clé
                    </button>
                    <button type="button" className="text-bad underline" onClick={() => modifier(x, { statut: "revoquee" }, "Révoquer définitivement cette licence ?")}>
                      Révoquer
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </Tableau>
      ) : null}
    </div>
  );
}

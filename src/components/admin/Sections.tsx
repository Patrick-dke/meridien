"use client";

import { useState } from "react";
import { offre } from "@/content/offre";
import { obtenirDb } from "@/lib/firebase/client";
import { Alerte, Champ } from "../compte/Formulaire";
import { action, cellule, dateHeure, demanderMotif, Etat, fcfa, Tableau, useAction } from "./outils";

const titreModule = (id: string) => offre.find((m) => m.id === id)?.titre ?? id;
type Ligne = Record<string, unknown> & { id: string };

function Carte({ titre, valeur, detail }: { titre: string; valeur: React.ReactNode; detail?: string }) {
  return (
    <div className="carte p-4">
      <p className="text-xs uppercase tracking-wider text-ink-3">{titre}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{valeur}</p>
      {detail ? <p className="mt-0.5 text-xs text-ink-3">{detail}</p> : null}
    </div>
  );
}

export function VueEnsemble() {
  const s = useAction<{
    utilisateurs: number;
    droitsActifs: number;
    parModule: Record<string, number>;
    transactions: Record<string, number>;
    aVerifier: number;
    encaisseProduction: number;
    encaisseTest: number;
    demandesEnAttente: number;
    messagesNouveaux: number;
    fournisseur: string;
    environnement: string | null;
  }>("statistiques");
  if (!s.donnees) return <Etat {...s} />;
  const d = s.donnees;
  return (
    <div className="space-y-5">
      <Alerte ton={d.environnement === "production" ? "ok" : "info"}>
        Encaissement : <strong>{d.fournisseur === "aucun" ? "non configuré (paiements fermés)" : d.fournisseur}</strong>
        {d.environnement ? ` · environnement ${d.environnement === "test" ? "de TEST (aucun argent réel)" : "de production"}` : ""}.
      </Alerte>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Carte titre="Comptes" valeur={d.utilisateurs} />
        <Carte titre="Accès actifs" valeur={d.droitsActifs} />
        <Carte titre="Encaissé (production)" valeur={fcfa(d.encaisseProduction)} detail="Paiements confirmés par le prestataire, sur les 500 dernières transactions" />
        <Carte titre="Paiements de test" valeur={fcfa(d.encaisseTest)} detail="Simulation ou bac à sable : pas d'argent réel" />
        <Carte titre="À vérifier" valeur={d.aVerifier} detail="Anomalies ou attentes de plus de 48 h" />
        <Carte titre="Paiements en attente" valeur={(d.transactions.en_attente ?? 0) + (d.transactions.initialisation ?? 0)} />
        <Carte titre="Demandes d'outils" valeur={d.demandesEnAttente} />
        <Carte titre="Messages non lus" valeur={d.messagesNouveaux} />
      </div>
      <div className="carte p-4">
        <p className="mb-2 font-semibold text-ink">Accès par module</p>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {offre
            .filter((m) => !m.gratuit)
            .map((m) => (
              <li key={m.id} className="flex justify-between gap-3">
                <span className="text-ink-2">{m.titre}</span>
                <span className="font-mono text-ink">{d.parModule[m.id] ?? 0}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export function Utilisateurs() {
  const [q, setQ] = useState("");
  const [recherche, setRecherche] = useState("");
  const [choisi, setChoisi] = useState<string | null>(null);
  const liste = useAction<Ligne[]>("utilisateurs.rechercher", { q: recherche });
  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setRecherche(q);
        }}
      >
        <input className="champ" placeholder="E-mail, nom ou téléphone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un utilisateur" />
        <button className="btn btn-primaire">Rechercher</button>
      </form>
      <Etat {...liste} />
      {liste.donnees ? (
        <Tableau entetes={["Nom", "E-mail", "Téléphone", "Statut", "Inscrit le"]}>
          {liste.donnees.map((u) => (
            <tr key={u.id} className="cursor-pointer hover:bg-surface-2/50" onClick={() => setChoisi(u.id)}>
              <td className={cellule}>
                <button type="button" className="text-left font-semibold text-brand underline-offset-2 hover:underline">
                  {String(u.nom ?? "—")}
                </button>
              </td>
              <td className={cellule}>{String(u.email ?? "")}</td>
              <td className={cellule}>{String(u.telephone ?? "—")}</td>
              <td className={cellule}>{u.statut === "suspendu" ? <span className="text-bad">Suspendu</span> : "Actif"}</td>
              <td className={cellule}>{dateHeure(u.creeLe as string)}</td>
            </tr>
          ))}
        </Tableau>
      ) : null}
      {choisi ? <FicheUtilisateur uid={choisi} fermer={() => setChoisi(null)} /> : null}
    </div>
  );
}

type Fiche = {
  compte: { uid: string; email: string; emailVerifie: boolean; fournisseurs: string[]; desactive: boolean; creeLe: string; derniereConnexion: string };
  admin: boolean;
  profil: Record<string, unknown> | null;
  droits: Ligne[];
  transactions: Ligne[];
  evaluations: Record<string, unknown>[];
  progression: { commences: number; termines: number; majLe: string | null };
  demandes: Ligne[];
};

function FicheUtilisateur({ uid, fermer }: { uid: string; fermer: () => void }) {
  const f = useAction<Fiche>("utilisateurs.fiche", { uid });
  const [retour, setRetour] = useState<string | null>(null);
  const [module, setModule] = useState(offre.find((m) => !m.gratuit)!.id);
  const executer = async (nom: string, donnees: Record<string, unknown>, question: string) => {
    const motif = demanderMotif(question);
    if (!motif) return;
    try {
      await action(nom, { ...donnees, motif });
      setRetour("Fait. L'action est inscrite au journal d'audit.");
      f.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  return (
    <div className="carte space-y-4 p-5" role="region" aria-label="Fiche utilisateur">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">Fiche utilisateur</h3>
        <button type="button" className="btn btn-discret" onClick={fermer}>
          Fermer
        </button>
      </div>
      <Etat {...f} />
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      {f.donnees ? (
        <>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-3">E-mail</dt>
              <dd className="text-ink">
                {f.donnees.compte.email} {f.donnees.compte.emailVerifie ? "(vérifiée)" : "(non vérifiée)"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-3">Connexion</dt>
              <dd className="text-ink">{f.donnees.compte.fournisseurs.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Créé / dernière connexion</dt>
              <dd className="text-ink">
                {f.donnees.compte.creeLe} / {f.donnees.compte.derniereConnexion}
              </dd>
            </div>
            <div>
              <dt className="text-ink-3">Progression</dt>
              <dd className="text-ink">
                {f.donnees.progression.termines} chapitres terminés sur {f.donnees.progression.commences} commencés
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondaire"
              onClick={() => executer("utilisateurs.suspendre", { uid, suspendu: !f.donnees!.compte.desactive }, f.donnees!.compte.desactive ? "Réactiver ce compte ?" : "Suspendre ce compte (connexion bloquée, sessions fermées) ?")}
            >
              {f.donnees.compte.desactive ? "Réactiver le compte" : "Suspendre le compte"}
            </button>
            <button type="button" className="btn btn-secondaire" onClick={() => executer("utilisateurs.role", { uid, admin: !f.donnees!.admin }, f.donnees!.admin ? "Retirer le rôle d'administrateur ?" : "Nommer cet utilisateur administrateur ?")}>
              {f.donnees.admin ? "Retirer le rôle admin" : "Nommer administrateur"}
            </button>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">Accès aux modules</p>
            <ul className="mb-3 space-y-1 text-sm">
              {f.donnees.droits.length === 0 ? <li className="text-ink-3">Aucun module payant débloqué.</li> : null}
              {f.donnees.droits.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-2">
                  <span className={d.actif ? "text-ink" : "text-ink-3 line-through"}>{titreModule(String(d.module))}</span>
                  <span className="text-xs text-ink-3">
                    {String(d.source)} · {dateHeure(d.accordeLe as string)}
                    {d.test ? " · test" : ""}
                  </span>
                  {d.actif ? (
                    <button type="button" className="text-xs text-bad underline" onClick={() => executer("droits.revoquer", { uid, module: d.module }, `Révoquer l'accès à « ${titreModule(String(d.module))} » ?`)}>
                      Révoquer
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <select className="champ max-w-xs" value={module} onChange={(e) => setModule(e.target.value)} aria-label="Module à accorder">
                {offre
                  .filter((m) => !m.gratuit)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titre}
                    </option>
                  ))}
              </select>
              <button type="button" className="btn btn-secondaire" onClick={() => executer("droits.accorder", { uid, module }, `Accorder l'accès à « ${titreModule(module)} » sans paiement (geste commercial, partenaire…) ?`)}>
                Accorder l&apos;accès
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">Paiements</p>
            <ul className="space-y-1 text-sm">
              {f.donnees.transactions.length === 0 ? <li className="text-ink-3">Aucun.</li> : null}
              {f.donnees.transactions.map((t) => (
                <li key={t.id}>
                  {dateHeure(t.creeLe as string)} · {titreModule(String(t.module))} · {fcfa(Number(t.montant))} · <strong>{String(t.statut)}</strong> · {String(t.environnement)} · réf. {t.id.slice(0, 8).toUpperCase()}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">Évaluations officielles</p>
            <p className="text-sm text-ink-2">
              {f.donnees.evaluations.length} quiz passés, {f.donnees.evaluations.filter((e) => e.reussi).length} réussis.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function Modules() {
  const l = useAction<(Ligne & { titre: string; prix: number; publie: boolean; gratuit: boolean; ordre: number; acheteurs: number })[]>("modules.lister");
  const [retour, setRetour] = useState<string | null>(null);
  const [prix, setPrix] = useState<Record<string, string>>({});
  const initialiser = async () => {
    try {
      const r = await action<{ crees: string[] }>("modules.initialiser", { modules: offre.map((m) => ({ id: m.id, titre: m.titre, rang: m.rang, gratuit: m.gratuit })) });
      setRetour(r.crees.length ? `Modules créés avec la grille initiale : ${r.crees.join(", ")}.` : "Tous les modules existent déjà ; rien n'a été modifié.");
      l.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  const modifier = async (id: string, champs: Record<string, unknown>, question?: string) => {
    const motif = question ? demanderMotif(question) : "";
    if (question && !motif) return;
    try {
      await action("modules.modifier", { id, champs, motif });
      setRetour("Modifié et journalisé.");
      l.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Les prix vivent ici, en base de données : le site les lit au moment de l&apos;affichage, et le serveur les relit au moment du paiement. La grille initiale (niveau 2 = 10 000 FCFA, puis +10 000 FCFA par niveau) ne s&apos;applique qu&apos;aux modules absents.
      </p>
      <button type="button" className="btn btn-secondaire" onClick={initialiser}>
        Créer les modules manquants
      </button>
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      <Etat {...l} />
      {l.donnees ? (
        <Tableau entetes={["Ordre", "Module", "Prix (FCFA)", "Publié", "Acheteurs", ""]}>
          {l.donnees.map((m) => (
            <tr key={m.id}>
              <td className={cellule}>{m.ordre}</td>
              <td className={cellule}>
                <span className="font-semibold text-ink">{m.titre}</span>
                <span className="block text-xs text-ink-3">{m.id}</span>
              </td>
              <td className={cellule}>
                {m.gratuit ? (
                  "Gratuit"
                ) : (
                  <input
                    className="champ !min-h-9 max-w-[8rem] !py-1"
                    inputMode="numeric"
                    value={prix[m.id] ?? String(m.prix)}
                    onChange={(e) => setPrix({ ...prix, [m.id]: e.target.value.replace(/\D/g, "") })}
                    aria-label={`Prix de ${m.titre}`}
                  />
                )}
              </td>
              <td className={cellule}>
                <button type="button" className={`text-sm font-semibold underline ${m.publie ? "text-ok" : "text-ink-3"}`} onClick={() => modifier(m.id, { publie: !m.publie }, m.publie ? "Retirer ce module de la vente ?" : "Publier ce module ?")}>
                  {m.publie ? "Oui" : "Non"}
                </button>
              </td>
              <td className={cellule}>{m.acheteurs}</td>
              <td className={cellule}>
                {!m.gratuit && prix[m.id] !== undefined && Number(prix[m.id]) !== m.prix ? (
                  <button type="button" className="btn btn-primaire !min-h-9" onClick={() => modifier(m.id, { prix: Number(prix[m.id]) }, `Passer « ${m.titre} » de ${fcfa(m.prix)} à ${fcfa(Number(prix[m.id]))} ? Les paiements déjà lancés gardent leur montant.`)}>
                    Enregistrer
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </Tableau>
      ) : null}
    </div>
  );
}

export function Paiements() {
  const [statut, setStatut] = useState("");
  const l = useAction<Ligne[]>("transactions.lister", { statut });
  const [retour, setRetour] = useState<string | null>(null);
  const executer = async (f: () => Promise<unknown>, message: string) => {
    try {
      await f();
      setRetour(message);
      l.recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  const resoudre = (t: Ligne) => {
    const decision = window.confirm(
      "Résolution contrôlée.\n\nOK : ACCORDER L'ACCÈS (tu as vu la preuve du paiement chez le prestataire ou l'opérateur).\nAnnuler : CLASSER sans accorder d'accès.\n\nL'historique du paiement n'est jamais modifié : ta décision s'y ajoute.",
    )
      ? "accorder_acces"
      : "classer";
    const preuve = decision === "accorder_acces" ? window.prompt("Référence de l'opération chez le prestataire ou l'opérateur (obligatoire) :") : "";
    if (decision === "accorder_acces" && !preuve) return;
    const motif = demanderMotif(decision === "accorder_acces" ? "Pourquoi accorder l'accès malgré l'absence de confirmation automatique ?" : "Pourquoi classer ce paiement ?");
    if (!motif) return;
    void executer(() => action("transactions.resoudre", { id: t.id, decision, motif, preuve }), "Résolution enregistrée au journal.");
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select className="champ max-w-xs" value={statut} onChange={(e) => setStatut(e.target.value)} aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="reussi">Réussis</option>
          <option value="echoue">Échoués</option>
          <option value="expire">Expirés</option>
          <option value="initialisation">Interrompus à l&apos;initialisation</option>
        </select>
        <button type="button" className="btn btn-secondaire" onClick={() => executer(() => action("transactions.reconcilier"), "Rapprochement terminé.")}>
          Rapprocher maintenant
        </button>
      </div>
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      <Etat {...l} />
      {l.donnees ? (
        <Tableau entetes={["Date", "Module", "Montant", "Opérateur", "Statut", "Env.", "Actions"]}>
          {l.donnees.map((t) => (
            <tr key={t.id} className={t.anomalie || t.aVerifier ? "bg-warn/5" : ""}>
              <td className={cellule}>
                {dateHeure(t.creeLe as string)}
                <span className="block font-mono text-xs text-ink-3">{t.id.slice(0, 8).toUpperCase()}</span>
              </td>
              <td className={cellule}>{titreModule(String(t.module))}</td>
              <td className={cellule}>{fcfa(Number(t.montant))}</td>
              <td className={cellule}>
                {t.operateur === "mtn" ? "MTN" : "Orange"} {String(t.telephoneMasque ?? "")}
              </td>
              <td className={cellule}>
                <strong>{String(t.statut)}</strong>
                {t.anomalie ? <span className="block text-xs text-warn">Anomalie : {String((t.anomalie as { detail?: string }).detail ?? "")}</span> : null}
                {Array.isArray(t.resolutions) && t.resolutions.length ? <span className="block text-xs text-ink-3">{t.resolutions.length} résolution(s)</span> : null}
              </td>
              <td className={cellule}>{String(t.environnement)}</td>
              <td className={cellule}>
                <div className="flex flex-col items-start gap-1">
                  <button type="button" className="text-xs text-brand underline" onClick={() => executer(() => action("transactions.verifier", { id: t.id }), "Statut relu auprès du prestataire.")}>
                    Revérifier
                  </button>
                  {t.statut !== "reussi" || t.anomalie ? (
                    <button type="button" className="text-xs text-warn underline" onClick={() => resoudre(t)}>
                      Résoudre…
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </Tableau>
      ) : null}
    </div>
  );
}

export function Demandes() {
  const l = useAction<Ligne[]>("demandes.lister");
  const traiter = async (id: string, decision: "accordee" | "refusee") => {
    const note = window.prompt(decision === "accordee" ? "Note pour l'apprenant (lien de téléchargement, instructions d'installation…) :" : "Motif du refus, visible par l'apprenant :");
    if (note === null) return;
    await action("demandes.traiter", { id, decision, note }).catch((e) => window.alert((e as Error).message));
    l.recharger();
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        L&apos;éligibilité est calculée par le serveur (modules requis achetés, quiz réussis). Après accord, remets l&apos;outil à l&apos;apprenant par un canal sûr : la note s&apos;affiche dans son espace.
      </p>
      <Etat {...l} />
      {l.donnees ? (
        <Tableau entetes={["Date", "Outil", "Apprenant", "Statut", ""]}>
          {l.donnees.map((d) => (
            <tr key={d.id}>
              <td className={cellule}>{dateHeure(d.creeLe as string)}</td>
              <td className={cellule}>{String(d.outil)}</td>
              <td className={cellule}>
                <span className="font-mono text-xs">{String(d.uid)}</span>
              </td>
              <td className={cellule}>{String(d.statut)}</td>
              <td className={cellule}>
                {d.statut === "en_attente" ? (
                  <div className="flex gap-2">
                    <button type="button" className="text-xs text-ok underline" onClick={() => traiter(d.id, "accordee")}>
                      Accorder
                    </button>
                    <button type="button" className="text-xs text-bad underline" onClick={() => traiter(d.id, "refusee")}>
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

export function Messages() {
  const l = useAction<Ligne[]>("messages.lister");
  return (
    <div className="space-y-3">
      <Etat {...l} />
      {l.donnees?.length === 0 ? <p className="text-ink-2">Aucun message.</p> : null}
      {l.donnees?.map((m) => (
        <article key={m.id} className={`carte p-4 ${m.statut === "nouveau" ? "!border-brand/50" : ""}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-ink">
              {String(m.nom)} · <span className="font-normal text-ink-2">{String(m.sujet)}</span>
            </p>
            <p className="text-xs text-ink-3">{dateHeure(m.creeLe as string)}</p>
          </div>
          <p className="mt-1 text-sm text-ink-2">
            <a href={`mailto:${String(m.email)}`} className="text-brand underline">
              {String(m.email)}
            </a>
            {m.telephone ? ` · ${String(m.telephone)}` : ""}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-ink">{String(m.texte)}</p>
          <div className="mt-3 flex gap-3 text-xs">
            {["lu", "traite"].map((s) => (
              <button
                key={s}
                type="button"
                className="text-brand underline disabled:text-ink-3 disabled:no-underline"
                disabled={m.statut === s}
                onClick={() => action("messages.traiter", { id: m.id, statut: s }).then(l.recharger)}
              >
                Marquer {s === "lu" ? "lu" : "traité"}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function Journal() {
  const [cible, setCible] = useState("");
  const [filtre, setFiltre] = useState("");
  const l = useAction<Ligne[]>("journal.lister", { cible: filtre });
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">Journal en ajout seul : aucune entrée ne peut être modifiée ni effacée, ni ici ni depuis la base.</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFiltre(cible);
        }}
      >
        <input className="champ" placeholder="Filtrer par cible (identifiant de transaction, d'utilisateur…)" value={cible} onChange={(e) => setCible(e.target.value)} aria-label="Cible" />
        <button className="btn btn-secondaire">Filtrer</button>
      </form>
      <Etat {...l} />
      {l.donnees ? (
        <Tableau entetes={["Date", "Acteur", "Action", "Cible", "Motif / détails"]}>
          {l.donnees.map((a) => (
            <tr key={a.id}>
              <td className={cellule}>{dateHeure(a.date as string)}</td>
              <td className={`${cellule} font-mono text-xs`}>{String(a.acteur).slice(0, 12)}</td>
              <td className={cellule}>{String(a.action)}</td>
              <td className={`${cellule} font-mono text-xs`}>{String(a.cible).slice(0, 24)}</td>
              <td className={`${cellule} text-xs text-ink-2`}>
                {a.motif ? <span className="block text-ink">{String(a.motif)}</span> : null}
                {a.details ? JSON.stringify(a.details).slice(0, 160) : null}
              </td>
            </tr>
          ))}
        </Tableau>
      ) : null}
    </div>
  );
}

type Params = {
  public: { paiementOuvert?: boolean };
  paiement: { beneficiaire?: Record<string, string | null> };
  outils: { modulesRequis?: string[]; scoreMin?: number };
  contact: { email?: string | null; whatsapp?: { actif?: boolean; numero?: string | null } };
  serveur: { fournisseur: string; environnement: string | null };
};

export function Parametres() {
  const p = useAction<Params>("parametres.lire");
  if (!p.donnees) return <Etat {...p} />;
  return <FormulairesParametres p={p.donnees} recharger={p.recharger} />;
}

function FormulairesParametres({ p, recharger }: { p: Params; recharger: () => void }) {
  const [b, setB] = useState({ prestataire: "Fapshi", operateur: "les-deux", nom: "", compteMarchand: "", numero: "", statut: "a_configurer", ...(p.paiement.beneficiaire ?? {}) } as Record<string, string>);
  const [requis, setRequis] = useState<string[]>(p.outils.modulesRequis ?? []);
  const [scoreMin, setScoreMin] = useState(String(p.outils.scoreMin ?? 0.8));
  const [contact, setContact] = useState({ email: p.contact.email ?? "", whatsappActif: p.contact.whatsapp?.actif ?? false, whatsappNumero: p.contact.whatsapp?.numero ?? "", whatsappPublic: false });
  const [retour, setRetour] = useState<string | null>(null);
  const enregistrer = async (section: string, valeurs: Record<string, unknown>, question?: string) => {
    const motif = question ? demanderMotif(question) : "";
    if (question && !motif) return;
    try {
      await action("parametres.modifier", { section, valeurs, motif });
      setRetour("Paramètres enregistrés et journalisés.");
      recharger();
    } catch (e) {
      setRetour((e as Error).message);
    }
  };
  return (
    <div className="space-y-6">
      {retour ? <Alerte ton="info">{retour}</Alerte> : null}
      <section className="carte space-y-4 p-5">
        <h3 className="text-lg font-semibold text-ink">Paiements</h3>
        <p className="text-sm text-ink-2">
          Prestataire actif côté serveur : <strong>{p.serveur.fournisseur}</strong>
          {p.serveur.environnement ? ` (${p.serveur.environnement})` : ""}. Il se change dans la configuration des fonctions, pas ici ; les clés d&apos;API restent dans le coffre de secrets du serveur.
        </p>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={p.public.paiementOuvert === true} onChange={(e) => enregistrer("paiement", { paiementOuvert: e.target.checked }, e.target.checked ? "Ouvrir les paiements au public ?" : "Fermer les paiements ?")} />
          Paiements ouverts au public
        </label>
      </section>
      <section className="carte space-y-4 p-5">
        <h3 className="text-lg font-semibold text-ink">Paiements → Compte bénéficiaire</h3>
        <p className="text-sm text-ink-2">Compte qui reçoit les fonds chez le prestataire. Ces informations restent sur le serveur : elles ne sont jamais envoyées aux visiteurs.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ libelle="Prestataire" value={b.prestataire} onChange={(e) => setB({ ...b, prestataire: e.target.value })} />
          <div>
            <label className="etiquette" htmlFor="operateur-benef">
              Opérateur
            </label>
            <select id="operateur-benef" className="champ" value={b.operateur} onChange={(e) => setB({ ...b, operateur: e.target.value })}>
              <option value="les-deux">MTN et Orange</option>
              <option value="mtn">MTN Mobile Money</option>
              <option value="orange">Orange Money</option>
            </select>
          </div>
          <Champ libelle="Nom du titulaire" value={b.nom ?? ""} onChange={(e) => setB({ ...b, nom: e.target.value })} />
          <Champ libelle="Identifiant du compte marchand" value={b.compteMarchand ?? ""} onChange={(e) => setB({ ...b, compteMarchand: e.target.value })} />
          <Champ libelle="Numéro de retrait (Cameroun)" type="tel" value={b.numero ?? ""} onChange={(e) => setB({ ...b, numero: e.target.value })} />
          <div>
            <label className="etiquette" htmlFor="statut-benef">
              Statut
            </label>
            <select id="statut-benef" className="champ" value={b.statut} onChange={(e) => setB({ ...b, statut: e.target.value })}>
              <option value="a_configurer">À configurer</option>
              <option value="en_verification">Vérification (KYC) en cours</option>
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>
        <button type="button" className="btn btn-primaire" onClick={() => enregistrer("beneficiaire", b, "Modifier le compte bénéficiaire des paiements ?")}>
          Enregistrer le compte bénéficiaire
        </button>
      </section>
      <section className="carte space-y-4 p-5">
        <h3 className="text-lg font-semibold text-ink">Outils MT5 : conditions d&apos;accès</h3>
        <fieldset>
          <legend className="etiquette">Modules exigés (aucun coché : tous les modules payants publiés)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {offre
              .filter((m) => !m.gratuit)
              .map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={requis.includes(m.id)} onChange={(e) => setRequis(e.target.checked ? [...requis, m.id] : requis.filter((x) => x !== m.id))} />
                  {m.titre}
                </label>
              ))}
          </div>
        </fieldset>
        <Champ libelle="Score minimal à chaque quiz (0,5 à 1)" inputMode="decimal" value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} />
        <button type="button" className="btn btn-primaire" onClick={() => enregistrer("outils", { modulesRequis: requis, scoreMin: Number(scoreMin.replace(",", ".")) }, "Modifier les conditions d'accès aux outils ?")}>
          Enregistrer les conditions
        </button>
      </section>
      <section className="carte space-y-4 p-5">
        <h3 className="text-lg font-semibold text-ink">Contact</h3>
        <p className="text-sm text-ink-2">Aucune coordonnée n&apos;est publiée tant qu&apos;elle n&apos;est pas saisie ici. Le canal WhatsApp Business se branche ensuite côté serveur (numéro professionnel validé par Meta).</p>
        <Champ libelle="E-mail de contact public" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
        <Champ libelle="Numéro WhatsApp Business" type="tel" value={contact.whatsappNumero} onChange={(e) => setContact({ ...contact, whatsappNumero: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={contact.whatsappActif} onChange={(e) => setContact({ ...contact, whatsappActif: e.target.checked })} />
          Notifier l&apos;équipe sur WhatsApp à chaque message (quand le canal est connecté)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={contact.whatsappPublic} onChange={(e) => setContact({ ...contact, whatsappPublic: e.target.checked })} />
          Afficher ce numéro WhatsApp sur le site
        </label>
        <button type="button" className="btn btn-primaire" onClick={() => enregistrer("contact", contact, "Modifier les coordonnées de contact ?")}>
          Enregistrer le contact
        </button>
      </section>
    </div>
  );
}

type Publication = {
  version: string;
  contenus: { slug: string; module: string; titre: string; chapitre: unknown; scenes: Record<string, unknown> }[];
  corriges: { slug: string; module: string; quiz: unknown[] }[];
  narrations: ({ slug: string; module: string; audio?: string; morceaux?: string[] } & Record<string, unknown>)[];
};

/** Publication des contenus payants : fichier préparé hors du dépôt public (npm run contenus:preparer), envoyé ici. */
export function Contenus() {
  const l = useAction<{ slug: string; module: string; version: string; publieLe: string }[]>("contenus.etat");
  const [avancement, setAvancement] = useState<string | null>(null);
  const publier = async (fichier: File) => {
    try {
      const p = JSON.parse(await fichier.text()) as Publication;
      const [db, m] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
      const date = new Date().toISOString();
      let n = 0;
      const total = p.contenus.length + p.corriges.length + p.narrations.length;
      // Texte JSON : Firestore refuse les tableaux imbriqués (même format que scripts/contenus/publication.ts).
      for (const c of p.contenus) {
        await m.setDoc(m.doc(db, "contenus", c.slug), { module: c.module, titre: c.titre, chapitreJson: JSON.stringify(c.chapitre), scenesJson: JSON.stringify(c.scenes), version: p.version, publieLe: date });
        setAvancement(`${++n}/${total}`);
      }
      for (const c of p.corriges) {
        await m.setDoc(m.doc(db, "corriges", c.slug), { module: c.module, quizJson: JSON.stringify(c.quiz), version: p.version });
        setAvancement(`${++n}/${total}`);
      }
      for (const nar of p.narrations) {
        const { morceaux, ...reste } = nar;
        if (morceaux) for (const [i, donnees] of morceaux.entries()) await m.setDoc(m.doc(db, "narrations", nar.slug, "morceaux", String(i)), { module: nar.module, donnees });
        await m.setDoc(m.doc(db, "narrations", nar.slug), { ...reste, ...(morceaux ? { morceaux: morceaux.length } : {}), version: p.version });
        setAvancement(`${++n}/${total}`);
      }
      await action("contenus.journaliser", { version: p.version, contenus: p.contenus.length, narrations: p.narrations.length });
      setAvancement(`Publication ${p.version} terminée : ${p.contenus.length} chapitres, ${p.narrations.length} narrations.`);
      l.recharger();
    } catch (e) {
      setAvancement(`Échec : ${(e as Error).message}`);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Les chapitres payants ne sont jamais dans le site publié. Prépare le fichier de publication sur l&apos;ordinateur qui détient les sources privées, puis envoie-le ici : il est écrit dans la base, lisible seulement par les acheteurs.
      </p>
      <label className="btn btn-primaire w-fit cursor-pointer">
        Publier un fichier de contenus…
        <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && void publier(e.target.files[0])} />
      </label>
      {avancement ? <Alerte ton="info">{avancement}</Alerte> : null}
      <Etat {...l} />
      {l.donnees ? (
        <p className="text-sm text-ink-2">
          {l.donnees.length} chapitres payants publiés
          {l.donnees.length ? `, version ${l.donnees[0].version}` : ""}.
        </p>
      ) : null}
    </div>
  );
}

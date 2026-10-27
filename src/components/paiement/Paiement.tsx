"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { offre, type ModuleOffre } from "@/content/offre";
import { useParametreAdresse } from "@/lib/adresse";
import { renvoyerVerification } from "@/lib/compte/actions";
import { rafraichirProfil, useSession } from "@/lib/compte/session";
import { formaterTelephone, normaliserTelephone, operateurProbable, type Operateur } from "@/lib/compte/telephone";
import { appeler } from "@/lib/firebase/client";
import { formaterPrix, useDroits, useModulesEnVente } from "@/lib/offre/commercial";
import { Alerte, Champ } from "../compte/Formulaire";
import { IconeCadenas, IconeCoche, IconeCroix } from "../ui/Icones";

type EtatServeur = { ouvert: boolean; environnement: "test" | "production" | null; simulation: boolean };
type Reponse = { transaction: string; statut: string; lien: string | null; environnement: string; dejaEnCours?: boolean };
type Phase = "operateur" | "numero" | "attente" | "reussi" | "echoue" | "expire" | "suspens";

const OPERATEURS: Record<Operateur, { nom: string; couleur: string; texte: string; ussd: string }> = {
  mtn: { nom: "MTN Mobile Money", couleur: "#ffcb05", texte: "#1a1a1a", ussd: "*126#" },
  orange: { nom: "Orange Money", couleur: "#ff7900", texte: "#ffffff", ussd: "#150*50#" },
};

const ETAPES = ["Opérateur", "Numéro", "Validation", "Confirmation"];
const memoire = (module: string) => `meridien:paiement:${module}`;
const DUREE_ATTENTE_MS = 4 * 60_000;

/** Paiement en cours mémorisé dans l'onglet (rechargement de la page, retour depuis la page du prestataire). */
function reprise(idModule: string): { tx: Reponse; operateur: Operateur } | null {
  try {
    return JSON.parse(window.sessionStorage.getItem(memoire(idModule)) ?? "null");
  } catch {
    return null;
  }
}

function Etapes({ actuelle }: { actuelle: number }) {
  return (
    <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Étapes du paiement">
      {ETAPES.map((e, i) => (
        <li key={e} aria-current={i === actuelle ? "step" : undefined} className="min-w-0">
          <span className={`block h-1.5 rounded-full ${i < actuelle ? "bg-ok" : i === actuelle ? "bg-brand" : "bg-surface-2"}`} />
          <span className={`mt-1.5 block truncate text-xs ${i === actuelle ? "font-semibold text-ink" : "text-ink-3"}`}>{e}</span>
        </li>
      ))}
    </ol>
  );
}

function BadgeOperateur({ op, taille = "md" }: { op: Operateur; taille?: "md" | "sm" }) {
  const o = OPERATEURS[op];
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-lg font-bold ${taille === "sm" ? "size-8 text-[0.65rem]" : "size-12 text-xs"}`}
      style={{ background: o.couleur, color: o.texte }}
      aria-hidden="true"
    >
      {op === "mtn" ? "MTN" : "OM"}
    </span>
  );
}

/** Contrôles avant paiement : session, adresse vérifiée, accès déjà acquis, encaissement ouvert côté serveur. */
export function PagePaiement() {
  const router = useRouter();
  const s = useSession(true);
  const droits = useDroits();
  const idModule = useParametreAdresse("module");
  const [serveur, setServeur] = useState<EtatServeur | null>(null);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  useEffect(() => {
    if (s.etat === "deconnecte") router.replace(`/connexion/?suite=${encodeURIComponent(`/paiement/${window.location.search}`)}`);
  }, [s.etat, router]);
  useEffect(() => {
    if (s.etat !== "connecte") return;
    appeler<EtatServeur>("etatPaiement").then(setServeur, (e) => setErreurServeur((e as Error).message));
  }, [s.etat]);

  const m = offre.find((x) => x.id === idModule);
  if (s.etat !== "connecte" || idModule === undefined) return <Chargement />;
  if (!m || m.gratuit) return <Alerte>Module inconnu. Choisis une formation depuis la page Formations.</Alerte>;
  if (!s.utilisateur?.emailVerifie) return <VerifierEmail />;
  if (erreurServeur) return <Alerte>Le paiement est momentanément indisponible : {erreurServeur}</Alerte>;
  if (!serveur || !droits.pret) return <Chargement />;
  if (!serveur.ouvert)
    return (
      <Alerte ton="info">
        Le paiement en ligne ouvre très bientôt. Pour être prévenu ou acheter dès maintenant, écris-nous depuis le{" "}
        <Link href="/#contact" className="font-semibold underline">
          formulaire de contact
        </Link>
        .
      </Alerte>
    );
  return <Paiement key={m.id} m={m} serveur={serveur} dejaAcquis={droits.modules.has(m.id)} telephoneProfil={s.profil?.telephone ?? null} />;
}

function Paiement({ m, serveur, dejaAcquis, telephoneProfil }: { m: ModuleOffre; serveur: EtatServeur; dejaAcquis: boolean; telephoneProfil: string | null }) {
  const vente = useModulesEnVente();
  const [enCours] = useState(() => reprise(m.id));
  const [phase, setPhase] = useState<Phase>(enCours ? "attente" : "operateur");
  const [operateur, setOperateur] = useState<Operateur | null>(enCours?.operateur ?? null);
  // Numéro du profil proposé par défaut (il peut arriver après l'affichage), tant que l'apprenant n'a rien saisi.
  const [saisi, setTelephone] = useState<string | null>(null);
  const telephone = saisi ?? (telephoneProfil ? formaterTelephone(telephoneProfil) : "");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [tx, setTx] = useState<Reponse | null>(enCours?.tx ?? null);
  const [motif, setMotif] = useState<string | null>(null);
  const prix = vente.donnees.get(m.id)?.prix ?? null;

  /**
   * Suivi de la transaction en cours : le serveur interroge le prestataire, et seule sa réponse fait passer à
   * « payé ». Une réponse qui arrive après un changement de transaction (nouvel essai) est ignorée.
   */
  useEffect(() => {
    if (phase !== "attente" || !tx) return;
    let actif = true;
    let enVol = false;
    const debut = Date.now();
    const tour = async () => {
      if (enVol) return;
      enVol = true;
      try {
        const r = await appeler<{ statut: string; motif: string | null }>("verifierPaiement", { transaction: tx.transaction });
        if (actif && (r.statut === "reussi" || r.statut === "echoue" || r.statut === "expire")) {
          window.sessionStorage.removeItem(memoire(m.id));
          setMotif(r.motif);
          setPhase(r.statut as Phase);
          return;
        }
      } catch {
        // Réseau instable : on réessaie au tour suivant, la confirmation viendra du serveur.
      } finally {
        enVol = false;
      }
      if (actif && Date.now() - debut > DUREE_ATTENTE_MS) setPhase("suspens");
    };
    const t = setInterval(() => void tour(), 4000);
    return () => {
      actif = false;
      clearInterval(t);
    };
  }, [phase, tx, m.id]);

  if (dejaAcquis && phase !== "reussi")
    return (
      <Alerte ton="ok">
        Tu as déjà accès à « {m.titre} ».{" "}
        <Link href={`/chapitre/${m.chapitres[0]}/`} className="font-semibold underline">
          Commencer le module
        </Link>
      </Alerte>
    );

  const payer = async () => {
    if (!operateur) return;
    const numero = normaliserTelephone(telephone);
    if (!numero) return setErreur("Numéro camerounais attendu : 9 chiffres commençant par 6.");
    const probable = operateurProbable(numero);
    if (probable && probable !== operateur) return setErreur(`Ce numéro semble être un numéro ${probable === "mtn" ? "MTN" : "Orange"}. Change d'opérateur ou de numéro.`);
    setErreur(null);
    setEnvoi(true);
    try {
      const r = await appeler<Reponse>("initierPaiement", { module: m.id, operateur, telephone: numero, cle: crypto.randomUUID() });
      setTx(r);
      window.sessionStorage.setItem(memoire(m.id), JSON.stringify({ tx: r, operateur }));
      setPhase("attente");
      if (r.lien) window.location.assign(r.lien);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  };

  const recommencer = () => {
    setTx(null);
    setMotif(null);
    setPhase("operateur");
  };

  const etape = { operateur: 0, numero: 1, attente: 2, suspens: 2, reussi: 3, echoue: 3, expire: 3 }[phase];

  return (
    <div className="carte p-5 sm:p-7">
      {serveur.environnement === "test" ? (
        <div className="mb-5 rounded-xl border border-warn/60 bg-warn/10 px-4 py-3 text-sm text-ink">
          <p className="font-semibold text-warn">Environnement de test : aucun argent réel ne circule.</p>
          <p className="mt-1 text-ink-2">Numéros de test : se terminant par 0 ou 2, le paiement réussit ; par 1 ou 3, il échoue ; 6xxxxxx09 expire. Exemple : 670 00 00 00.</p>
        </div>
      ) : null}
      <Etapes actuelle={etape} />

      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-3">Module</p>
          <p className="truncate font-semibold text-ink">{m.titre}</p>
        </div>
        <p className="shrink-0 text-lg font-semibold text-ink">{prix !== null ? formaterPrix(prix) : "…"}</p>
      </div>

      {phase === "operateur" ? (
        <fieldset>
          <legend className="mb-3 font-semibold text-ink">Avec quel service veux-tu payer ?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(OPERATEURS) as Operateur[]).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => {
                  setOperateur(op);
                  setPhase("numero");
                }}
                aria-pressed={operateur === op}
                className={`flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${operateur === op ? "border-brand bg-brand-soft" : "border-line-strong hover:border-brand/60"}`}
              >
                <BadgeOperateur op={op} />
                <span className="font-semibold text-ink">{OPERATEURS[op].nom}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {phase === "numero" && operateur ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void payer();
          }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <BadgeOperateur op={operateur} taille="sm" />
            <p className="flex-1 font-semibold text-ink">{OPERATEURS[operateur].nom}</p>
            <button type="button" className="text-sm text-brand underline" onClick={() => setPhase("operateur")}>
              Changer
            </button>
          </div>
          <Champ
            libelle={`Numéro ${operateur === "mtn" ? "MTN" : "Orange"} qui paie`}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="6 70 00 00 00"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            aide="9 chiffres, sans l'indicatif +237."
          />
          <p className="flex gap-2 rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-ink-2">
            <IconeCadenas className="mt-0.5 size-4 shrink-0 text-ok" />
            <span>
              Tu valideras le paiement <strong className="text-ink">sur ton téléphone</strong>, avec ton code secret, dans la fenêtre {operateur === "mtn" ? "de MTN" : "d'Orange"}. Méridien ne te demandera jamais ton
              code secret.
            </span>
          </p>
          {erreur ? <Alerte>{erreur}</Alerte> : null}
          <button type="submit" disabled={envoi || prix === null} aria-busy={envoi} className="btn btn-primaire btn-grand w-full">
            {envoi ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> : null}
            Payer {prix !== null ? formaterPrix(prix) : ""}
          </button>
        </form>
      ) : null}

      {phase === "attente" && operateur ? (
        <div className="text-center" aria-live="polite">
          <div className="mx-auto grid size-20 place-items-center rounded-full border-4 border-brand/30 border-t-brand motion-safe:animate-spin" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-semibold text-ink">Valide le paiement sur ton téléphone</h2>
          {tx?.lien ? (
            <p className="mt-2 text-ink-2">
              Termine le paiement sur la page sécurisée du prestataire.{" "}
              <a href={tx.lien} className="font-semibold text-brand underline">
                Ouvrir la page de paiement
              </a>
            </p>
          ) : (
            <ol className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm text-ink-2">
              <li>1. Une demande de paiement arrive sur ton téléphone dans quelques secondes.</li>
              <li>2. Vérifie le montant, puis saisis ton code secret dans la fenêtre de l&apos;opérateur.</li>
              <li>
                3. Rien ne s&apos;affiche ? Compose <strong className="font-mono text-ink">{OPERATEURS[operateur].ussd}</strong> pour retrouver l&apos;opération en attente.
              </li>
            </ol>
          )}
          <p className="mt-5 text-xs text-ink-3">Cette page se met à jour toute seule dès que l&apos;opérateur confirme.</p>
        </div>
      ) : null}

      {phase === "suspens" ? (
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold text-ink">Confirmation toujours en attente</h2>
          <p className="text-ink-2">
            L&apos;opérateur n&apos;a pas encore répondu. Si tu as validé, ton accès s&apos;ouvrira automatiquement dès la confirmation : tu peux fermer cette page. Suis l&apos;état dans Mon compte → Paiements.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" className="btn btn-secondaire" onClick={() => setPhase("attente")}>
              Continuer d&apos;attendre
            </button>
            <Link href="/compte/#paiements" className="btn btn-discret">
              Mes paiements
            </Link>
          </div>
        </div>
      ) : null}

      {phase === "reussi" ? (
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-ok/15 text-ok">
            <IconeCoche className="size-8" />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Paiement confirmé</h2>
          <p className="mt-2 text-ink-2">« {m.titre} » est débloqué. Le reçu est dans Mon compte → Paiements.</p>
          <Link href={`/chapitre/${m.chapitres[0]}/`} className="btn btn-primaire btn-grand mt-6 w-full sm:w-auto">
            Commencer le module
          </Link>
        </div>
      ) : null}

      {phase === "echoue" || phase === "expire" ? (
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-bad/15 text-bad">
            <IconeCroix className="size-8" />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{phase === "expire" ? "Demande expirée" : "Paiement non abouti"}</h2>
          <p className="mt-2 text-ink-2">
            {phase === "expire" ? "La demande n'a pas été validée à temps." : (motif ?? "L'opérateur a refusé ou annulé l'opération (solde insuffisant, code incorrect ou demande rejetée).")} Aucun accès n&apos;a été accordé
            et, si rien n&apos;a été validé, rien n&apos;a été prélevé.
          </p>
          <button type="button" onClick={recommencer} className="btn btn-primaire btn-grand mt-6 w-full sm:w-auto">
            Réessayer
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Chargement() {
  return (
    <div className="carte grid min-h-48 place-items-center p-6" role="status">
      <span className="size-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" aria-hidden="true" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

function VerifierEmail() {
  const [etat, setEtat] = useState<string | null>(null);
  return (
    <div className="carte space-y-4 p-5 sm:p-7">
      <h2 className="text-xl font-semibold text-ink">Vérifie d&apos;abord ton adresse e-mail</h2>
      <p className="text-ink-2">Pour protéger ton achat, le paiement s&apos;ouvre une fois ton adresse confirmée. Clique sur le lien reçu à l&apos;inscription, puis reviens ici.</p>
      {etat ? <Alerte ton="info">{etat}</Alerte> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn btn-primaire" onClick={() => void rafraichirProfil()}>
          J&apos;ai confirmé mon adresse
        </button>
        <button
          type="button"
          className="btn btn-secondaire"
          onClick={() =>
            renvoyerVerification()
              .then(() => setEtat("Nouveau lien envoyé. Regarde aussi dans les courriers indésirables."))
              .catch((e) => setEtat((e as Error).message))
          }
        >
          Renvoyer le lien
        </button>
      </div>
    </div>
  );
}

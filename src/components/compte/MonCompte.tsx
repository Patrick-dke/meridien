"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fiche } from "@/content";
import { offre } from "@/content/offre";
import { deconnecter, renvoyerVerification } from "@/lib/compte/actions";
import { rafraichirProfil, useSession } from "@/lib/compte/session";
import { appeler, obtenirDb } from "@/lib/firebase/client";
import { formaterPrix } from "@/lib/offre/commercial";
import { jourLocal } from "@/lib/progression/etat";
import { useProgression } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import { CarteModule, type ModulePresente } from "../offre/Offre";
import { IconeCoche, IconeEtoile } from "../ui/Icones";
import { Alerte } from "./Formulaire";
import { BandeauTest } from "./Connexion";

type Transaction = { id: string; module: string; montant: number; statut: string; operateur: string; telephoneMasque: string; creeLe: string; environnement: string; confirmeLe?: string };
type Evaluation = { slug: string; module: string; meilleurScore: number; reussi: boolean; tentatives: number; date: string };
type Certificat = { numero: string; titreModule: string; date: string; scoreMoyen: number };
type Eligibilite = {
  eligible: boolean;
  scoreMin: number;
  modules: { module: string; achete: boolean; chapitres: number; valides: number }[];
  outils: Record<string, { actif: boolean; nom: string }>;
  demandes: { id: string; outil: string; statut: string; creeLe: string; note: string | null }[];
};

const STATUTS: Record<string, { texte: string; classe: string }> = {
  reussi: { texte: "Payé", classe: "text-ok" },
  en_attente: { texte: "En attente", classe: "text-warn" },
  initialisation: { texte: "En attente", classe: "text-warn" },
  echoue: { texte: "Échoué", classe: "text-bad" },
  expire: { texte: "Expiré", classe: "text-ink-3" },
};
const titreModule = (id: string) => offre.find((m) => m.id === id)?.titre ?? id;
const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

async function lireListe<T>(collection: string, uid: string): Promise<T[]> {
  const [db, m] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
  const r = await m.getDocs(m.query(m.collection(db, collection), m.where("uid", "==", uid)));
  return r.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

function Section({ id, titre, children, action }: { id: string; titre: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`titre-${id}`} className="scroll-mt-20">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 id={`titre-${id}`} className="text-xl font-semibold text-ink">
          {titre}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Récompenses internes, calculées depuis la progression : symboliques, sans valeur monétaire. */
function useRecompenses(certificats: number) {
  const p = useProgression();
  const termines = Object.values(p.chapitres).filter((c) => c.statut === "termine").length;
  const parfaits = Object.values(p.chapitres).filter((c) => (c.meilleurScore ?? 0) >= 0.999).length;
  let serie = 0;
  for (let i = 0; i < 60; i++) {
    const j = new Date();
    j.setDate(j.getDate() - i);
    if ((p.journal?.[jourLocal(j)] ?? 0) > 0) serie++;
    else if (i > 0) break;
  }
  return [
    { id: "premier", nom: "Premier chapitre", detail: "Valider un chapitre", obtenu: termines >= 1 },
    { id: "cinq", nom: "Cinq chapitres", detail: "Valider cinq chapitres", obtenu: termines >= 5 },
    { id: "parfait", nom: "Sans faute", detail: "100 % à un quiz", obtenu: parfaits >= 1 },
    { id: "serie", nom: "Trois jours de suite", detail: "Apprendre trois jours d'affilée", obtenu: serie >= 3 },
    { id: "module", nom: "Module terminé", detail: "Obtenir un certificat", obtenu: certificats >= 1 },
  ];
}

export function MonCompte({ modules }: { modules: ModulePresente[] }) {
  const s = useSession(true);
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [certificats, setCertificats] = useState<Certificat[]>([]);
  const [outils, setOutils] = useState<Eligibilite | null>(null);
  const [erreurOutils, setErreurOutils] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const uid = s.utilisateur?.uid;
  const recompenses = useRecompenses(certificats.length);

  useEffect(() => {
    if (s.etat === "deconnecte") router.replace("/connexion/?suite=/compte/");
  }, [s.etat, router]);

  useEffect(() => {
    if (!uid) return;
    lireListe<Transaction>("transactions", uid)
      .then((t) => setTransactions(t.sort((a, b) => b.creeLe.localeCompare(a.creeLe))))
      .catch(() => setTransactions([]));
    lireListe<Evaluation>("evaluations", uid)
      .then(setEvaluations)
      .catch(() => setEvaluations([]));
    lireListe<Certificat>("certificats", uid)
      .then(setCertificats)
      .catch(() => setCertificats([]));
    appeler<Eligibilite>("outils", { action: "eligibilite" })
      .then(setOutils)
      .catch((e) => setErreurOutils((e as Error).message));
  }, [uid]);

  if (s.etat !== "connecte" || !s.utilisateur) return <div className="carte h-64 animate-pulse" aria-busy="true" />;
  const u = s.utilisateur;
  const nom = s.profil?.nom ?? u.nom ?? u.email ?? "";

  const demander = async (outil: string) => {
    try {
      setOutils(await appeler<Eligibilite>("outils", { action: "demander", outil }));
    } catch (e) {
      setErreurOutils((e as Error).message);
    }
  };

  return (
    <div className="space-y-10">
      <BandeauTest />
      <div className="carte flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {s.profil?.photo ? (
          // Photo réduite à 256 px dans le navigateur, stockée avec le profil.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.profil.photo} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-2xl font-semibold text-brand" aria-hidden="true">
            {nom.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-ink">{nom}</p>
          <p className="truncate text-sm text-ink-2">{u.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/compte/profil/" className="btn btn-secondaire">
            Paramètres du profil
          </Link>
          {s.admin ? (
            <Link href="/admin/" className="btn btn-secondaire">
              Administration
            </Link>
          ) : null}
          <button type="button" className="btn btn-discret" onClick={() => void deconnecter()}>
            Se déconnecter
          </button>
        </div>
      </div>

      {!u.emailVerifie ? (
        <Alerte ton="info">
          Confirme ton adresse e-mail grâce au lien reçu : c&apos;est nécessaire pour acheter un module.{" "}
          <button
            type="button"
            className="font-semibold text-brand underline"
            onClick={() =>
              renvoyerVerification()
                .then(() => setMessage("Lien renvoyé."))
                .catch((e) => setMessage((e as Error).message))
            }
          >
            Renvoyer le lien
          </button>{" "}
          ·{" "}
          <button type="button" className="font-semibold text-brand underline" onClick={() => void rafraichirProfil()}>
            C&apos;est fait
          </button>
          {message ? <span className="block pt-1">{message}</span> : null}
        </Alerte>
      ) : null}

      <Section id="formations" titre="Mes formations" action={<Link href="/formations/" className="text-sm text-brand underline">Toutes les formations</Link>}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <li key={m.id}>
              <CarteModule m={m} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="paiements" titre="Mes paiements">
        {transactions === null ? (
          <div className="carte h-24 animate-pulse" />
        ) : transactions.length === 0 ? (
          <p className="carte p-5 text-ink-2">Aucun paiement pour l&apos;instant.</p>
        ) : (
          <ul className="carte divide-y divide-line">
            {transactions.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{titreModule(t.module)}</p>
                  <p className="text-sm text-ink-3">
                    {date(t.creeLe)} · {t.operateur === "mtn" ? "MTN MoMo" : "Orange Money"} {t.telephoneMasque} · réf. {t.id.slice(0, 8).toUpperCase()}
                    {t.environnement === "test" ? " · test" : ""}
                  </p>
                </div>
                <p className="font-mono text-ink tabular">{formaterPrix(t.montant)}</p>
                <p className={`w-24 text-right text-sm font-semibold ${STATUTS[t.statut]?.classe ?? "text-ink-2"}`}>{STATUTS[t.statut]?.texte ?? t.statut}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="resultats" titre="Mes résultats">
        {evaluations.length === 0 ? (
          <p className="carte p-5 text-ink-2">Tes résultats officiels aux quiz apparaîtront ici.</p>
        ) : (
          <ul className="carte divide-y divide-line">
            {evaluations
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => (
                <li key={e.slug} className="flex items-center gap-3 p-4">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${e.reussi ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn"}`}>{e.reussi ? <IconeCoche className="size-4" /> : "…"}</span>
                  <Link href={`/chapitre/${e.slug}/`} className="min-w-0 flex-1 truncate text-ink hover:underline">
                    {typographie(fiche(e.slug)?.titre ?? e.slug)}
                  </Link>
                  <span className="font-mono text-sm text-ink-2 tabular">{Math.round(e.meilleurScore * 100)} %</span>
                  <span className="hidden text-xs text-ink-3 sm:inline">
                    {e.tentatives} essai{e.tentatives > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Section>

      <Section id="certificats" titre="Certificats et récompenses">
        {certificats.length ? (
          <ul className="mb-4 grid gap-3 sm:grid-cols-2">
            {certificats.map((c) => (
              <li key={c.numero} className="carte p-4">
                <p className="font-semibold text-ink">{c.titreModule}</p>
                <p className="text-sm text-ink-3">
                  Délivré le {date(c.date)} · moyenne {Math.round(c.scoreMoyen * 100)} %
                </p>
                <Link href={`/certificat/?n=${c.numero}`} className="mt-2 inline-block text-sm font-semibold text-brand underline">
                  Voir et imprimer ({c.numero})
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-ink-2">Termine tous les quiz d&apos;un module pour obtenir son certificat interne Méridien.</p>
        )}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {recompenses.map((r) => (
            <li key={r.id} className={`carte p-3 text-center ${r.obtenu ? "" : "opacity-50"}`}>
              <IconeEtoile className={`mx-auto size-6 ${r.obtenu ? "text-gold" : "text-ink-3"}`} />
              <p className="mt-1.5 text-sm font-semibold text-ink">{r.nom}</p>
              <p className="text-xs text-ink-3">{r.obtenu ? "Obtenue" : r.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="outils" titre="Outils de trading inclus">
        <div className="carte p-5">
          <p className="text-ink-2">
            Un indicateur et un Expert Advisor pour MetaTrader 5 sont remis aux apprenants qui ont terminé le parcours requis et réussi ses évaluations. Ce sont des outils d&apos;aide à
            l&apos;analyse : ils ne garantissent aucun résultat et s&apos;utilisent d&apos;abord sur un compte de démonstration.
          </p>
          {erreurOutils ? <p className="mt-3 text-sm text-warn">{erreurOutils}</p> : null}
          {outils ? (
            <>
              <ul className="mt-4 space-y-2">
                {outils.modules.map((m) => (
                  <li key={m.module} className="flex items-center gap-3 text-sm">
                    <span className={`grid size-6 place-items-center rounded-full ${m.achete && m.chapitres > 0 && m.valides === m.chapitres ? "bg-ok/15 text-ok" : "bg-surface-2 text-ink-3"}`}>
                      {m.achete && m.chapitres > 0 && m.valides === m.chapitres ? <IconeCoche className="size-3.5" /> : null}
                    </span>
                    <span className="flex-1 text-ink">{titreModule(m.module)}</span>
                    <span className="text-ink-3">{m.achete ? `${m.valides}/${m.chapitres} quiz réussis` : "non débloqué"}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(outils.outils)
                  .filter(([, o]) => o.actif)
                  .map(([id, o]) => {
                    const demande = outils.demandes.find((d) => d.outil === id);
                    return (
                      <div key={id} className="rounded-xl border border-line p-4">
                        <p className="font-semibold text-ink">{o.nom}</p>
                        {demande ? (
                          <p className="mt-1 text-sm text-ink-2">
                            Demande {demande.statut === "en_attente" ? "en cours d'examen" : demande.statut === "accordee" ? "acceptée" : "refusée"}
                            {demande.note ? ` : ${demande.note}` : "."}
                          </p>
                        ) : (
                          <button type="button" className="btn btn-primaire mt-3 w-full" disabled={!outils.eligible} onClick={() => void demander(id)}>
                            {outils.eligible ? "Demander l'accès" : "Parcours à terminer"}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          ) : !erreurOutils ? (
            <div className="mt-4 h-16 animate-pulse rounded-xl bg-surface-2" />
          ) : null}
        </div>
      </Section>
    </div>
  );
}

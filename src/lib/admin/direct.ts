import type { Firestore, WriteBatch } from "firebase/firestore/lite";
import { offre } from "@/content/offre";
import { obtenirAuth, obtenirDb } from "@/lib/firebase/client";

/**
 * Administration sans fonctions serveur (offre gratuite de Firebase) : les actions qui ne demandent ni le SDK
 * Admin ni un secret s'exécutent ici, directement dans la base. Les règles Firestore vérifient le rôle et
 * n'acceptent chaque écriture qu'accompagnée, dans le même lot, de son entrée au journal d'audit.
 * Suspendre un compte, nommer un administrateur, les paiements, les outils et les examens restent au serveur.
 */
type Donnees = Record<string, unknown>;
type Contexte = { db: Firestore; m: typeof import("firebase/firestore/lite"); acteur: string; d: Donnees };

/** Grille initiale, la même que celle du serveur : appliquée aux seuls modules absents, le prix vit ensuite en base. */
const PALIER_FCFA = 10_000;
const prixInitial = (rang: number) => Math.max(0, rang - 1) * PALIER_FCFA;

const texte = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function motifObligatoire(v: unknown) {
  const m = texte(v, 500);
  if (m.length < 5) throw new Error("Indique un motif (5 caractères au moins) : il est inscrit au journal.");
  return m;
}
const maintenant = () => new Date().toISOString();

/** Ajoute au lot l'entrée de journal qui accompagne une écriture ; renvoie son identifiant. */
function tracer(c: Contexte, lot: WriteBatch, entree: { action: string; cible: string; motif?: string; details?: Donnees }) {
  const ref = c.m.doc(c.m.collection(c.db, "journalAudit"));
  const donnees = Object.fromEntries(Object.entries(entree).filter(([, v]) => v !== undefined && v !== ""));
  lot.set(ref, { ...donnees, acteur: c.acteur, date: maintenant(), horodatage: c.m.serverTimestamp() });
  return ref.id;
}

const lignes = (s: { docs: { id: string; data: () => Donnees }[] }) => s.docs.map((x) => ({ id: x.id, ...x.data() }));

const actions: Record<string, (c: Contexte) => Promise<unknown>> = {
  async statistiques({ db, m }) {
    const [utilisateurs, droits] = await Promise.all([
      m.getCount(m.collection(db, "utilisateurs")),
      m.getDocs(m.query(m.collection(db, "droits"), m.where("actif", "==", true))),
    ]);
    const parModule: Record<string, number> = {};
    for (const d of droits.docs) parModule[d.get("module")] = (parModule[d.get("module")] ?? 0) + 1;
    // Sans fonctions, aucun paiement, message ni demande d'outil ne peut exister : zéro est la valeur exacte.
    return {
      utilisateurs: utilisateurs.data().count,
      droitsActifs: droits.size,
      parModule,
      transactions: {},
      aVerifier: 0,
      encaisseProduction: 0,
      encaisseTest: 0,
      demandesEnAttente: 0,
      messagesNouveaux: 0,
      fournisseur: "aucun",
      environnement: null,
    };
  },

  /* ---------------- Utilisateurs ---------------- */
  async "utilisateurs.rechercher"({ db, m, d }) {
    const q = texte(d.q, 120).toLowerCase();
    const col = m.collection(db, "utilisateurs");
    if (!q) return lignes(await m.getDocs(m.query(col, m.orderBy("creeLe", "desc"), m.limit(50))));
    const resultats = new Map<string, Donnees & { id: string }>();
    // Recherche par préfixe : de q à q suivi du dernier caractère Unicode usuel.
    const requetes = ["emailMinuscule", "nomMinuscule"].map((champ) => m.query(col, m.where(champ, ">=", q), m.where(champ, "<=", `${q}`), m.limit(25)));
    const tel = q.replace(/\D/g, "").replace(/^237/, "");
    if (/^6\d{8}$/.test(tel)) requetes.push(m.query(col, m.where("telephone", "==", tel), m.limit(10)));
    for (const s of await Promise.all(requetes.map((r) => m.getDocs(r)))) for (const x of lignes(s)) resultats.set(x.id, x);
    return [...resultats.values()];
  },

  async "utilisateurs.fiche"({ db, m, d }) {
    const uid = texte(d.uid, 128);
    const [profil, droits, progression, admin] = await Promise.all([
      m.getDoc(m.doc(db, "utilisateurs", uid)),
      m.getDocs(m.query(m.collection(db, "droits"), m.where("uid", "==", uid))),
      m.getDoc(m.doc(db, "progressions", uid)),
      m.getDoc(m.doc(db, "admins", uid)),
    ]);
    if (!profil.exists()) throw new Error("Utilisateur introuvable.");
    const chapitres = (progression.get("etat.chapitres") ?? {}) as Record<string, { statut: string }>;
    return {
      // Les données du compte d'authentification (vérification de l'adresse, fournisseurs) ne se lisent qu'avec le SDK Admin.
      compte: {
        uid,
        email: profil.get("email"),
        emailVerifie: null,
        fournisseurs: [],
        desactive: profil.get("statut") === "suspendu",
        creeLe: profil.get("creeLe") ?? null,
        derniereConnexion: null,
      },
      admin: admin.exists(),
      profil: profil.data(),
      droits: lignes(droits),
      transactions: [],
      evaluations: [],
      progression: {
        commences: Object.keys(chapitres).length,
        termines: Object.values(chapitres).filter((c) => c.statut === "termine").length,
        majLe: progression.get("majLe") ?? null,
      },
      demandes: [],
    };
  },

  /* ---------------- Droits d'accès ---------------- */
  async "droits.accorder"(c) {
    const uid = texte(c.d.uid, 128);
    const idModule = texte(c.d.module, 60);
    const motif = motifObligatoire(c.d.motif);
    if (!offre.some((x) => x.id === idModule && !x.gratuit)) throw new Error("Module inconnu.");
    const id = `${uid}_${idModule}`;
    const lot = c.m.writeBatch(c.db);
    const journal = tracer(c, lot, { action: "droit.accorde", cible: id, motif });
    lot.set(c.m.doc(c.db, "droits", id), {
      uid,
      module: idModule,
      actif: true,
      source: "administration",
      accordePar: c.acteur,
      accordeLe: maintenant(),
      motif,
      journal,
    });
    await lot.commit();
    return { ok: true };
  },

  async "droits.revoquer"(c) {
    const id = `${texte(c.d.uid, 128)}_${texte(c.d.module, 60)}`;
    const motif = motifObligatoire(c.d.motif);
    const lot = c.m.writeBatch(c.db);
    const journal = tracer(c, lot, { action: "droit.revoque", cible: id, motif });
    lot.update(c.m.doc(c.db, "droits", id), {
      actif: false,
      revoqueLe: maintenant(),
      revoquePar: c.acteur,
      motifRevocation: motif,
      journalRevocation: journal,
    });
    await lot.commit();
    return { ok: true };
  },

  /* ---------------- Modules et prix ---------------- */
  async "modules.lister"({ db, m }) {
    const [modules, droits] = await Promise.all([
      m.getDocs(m.query(m.collection(db, "modules"), m.orderBy("ordre"))),
      m.getDocs(m.query(m.collection(db, "droits"), m.where("actif", "==", true))),
    ]);
    const acheteurs: Record<string, number> = {};
    for (const x of droits.docs) acheteurs[x.get("module")] = (acheteurs[x.get("module")] ?? 0) + 1;
    return lignes(modules).map((x) => ({ ...x, acheteurs: acheteurs[x.id] ?? 0 }));
  },

  async "modules.initialiser"(c) {
    const liste = Array.isArray(c.d.modules) ? (c.d.modules as Donnees[]).slice(0, 30) : [];
    const crees: string[] = [];
    // Un lot par module : chaque création porte sa propre trace (les règles limitent les lectures par lot).
    for (const x of liste) {
      const id = texte(x.id, 60);
      const rang = Number(x.rang);
      if (!/^[a-z0-9-]+$/.test(id) || !Number.isInteger(rang) || rang < 1) continue;
      const ref = c.m.doc(c.db, "modules", id);
      if ((await c.m.getDoc(ref)).exists()) continue;
      const gratuit = x.gratuit === true;
      const prix = gratuit ? 0 : prixInitial(rang);
      const lot = c.m.writeBatch(c.db);
      const journal = tracer(c, lot, { action: "module.cree", cible: id, details: { prix } });
      lot.set(ref, {
        titre: texte(x.titre, 120),
        rang,
        ordre: rang,
        gratuit,
        prix,
        devise: "XAF",
        publie: true,
        modifieLe: maintenant(),
        modifiePar: c.acteur,
        journal,
      });
      await lot.commit();
      crees.push(id);
    }
    return { crees };
  },

  async "modules.modifier"(c) {
    const id = texte(c.d.id, 60);
    const ref = c.m.doc(c.db, "modules", id);
    const avant = await c.m.getDoc(ref);
    if (!avant.exists()) throw new Error("Module inconnu.");
    const champs = (c.d.champs ?? {}) as Donnees;
    const maj: Donnees = {};
    if ("prix" in champs) {
      const prix = Number(champs.prix);
      if (!Number.isInteger(prix) || prix < 0 || prix > 5_000_000) throw new Error("Prix en FCFA entier, entre 0 et 5 000 000.");
      if (!avant.get("gratuit") && prix > 0 && prix < 100) throw new Error("Le Mobile Money exige au moins 100 FCFA.");
      maj.prix = prix;
    }
    if ("publie" in champs) maj.publie = champs.publie === true;
    if ("ordre" in champs && Number.isInteger(champs.ordre)) maj.ordre = champs.ordre;
    if ("titre" in champs && texte(champs.titre, 120)) maj.titre = texte(champs.titre, 120);
    if ("accroche" in champs) maj.accroche = texte(champs.accroche, 300);
    if (!Object.keys(maj).length) return { ok: true };
    const motif = "prix" in maj ? motifObligatoire(c.d.motif) : texte(c.d.motif);
    const precedent = Object.fromEntries(Object.keys(maj).map((k) => [k, avant.get(k) ?? null]));
    const lot = c.m.writeBatch(c.db);
    const journal = tracer(c, lot, { action: "module.modifie", cible: id, details: { avant: precedent, apres: maj }, motif: motif || undefined });
    lot.update(ref, { ...maj, modifieLe: maintenant(), modifiePar: c.acteur, journal });
    await lot.commit();
    return { ok: true };
  },

  /* ---------------- Journal et contenus ---------------- */
  async "journal.lister"({ db, m, d }) {
    const col = m.collection(db, "journalAudit");
    const q =
      typeof d.cible === "string" && d.cible
        ? m.query(col, m.where("cible", "==", d.cible), m.orderBy("date", "desc"), m.limit(100))
        : m.query(col, m.orderBy("date", "desc"), m.limit(100));
    return lignes(await m.getDocs(q));
  },

  async "contenus.journaliser"(c) {
    const lot = c.m.writeBatch(c.db);
    tracer(c, lot, {
      action: "contenus.publies",
      cible: "contenus",
      details: { version: texte(c.d.version, 40), contenus: Number(c.d.contenus) || 0, narrations: Number(c.d.narrations) || 0 },
    });
    await lot.commit();
    return { ok: true };
  },

  async "contenus.etat"({ db, m }) {
    // Sans le SDK Admin, pas de lecture partielle : on compte les chapitres et on lit la version au journal.
    const [n, derniere] = await Promise.all([
      m.getCount(m.collection(db, "contenus")),
      m.getDocs(m.query(m.collection(db, "journalAudit"), m.where("cible", "==", "contenus"), m.orderBy("date", "desc"), m.limit(1))),
    ]);
    const version = String(derniere.docs[0]?.get("details.version") ?? "");
    return Array.from({ length: n.data().count }, () => ({ slug: "", module: "", version, publieLe: String(derniere.docs[0]?.get("date") ?? "") }));
  },
};

/** Actions disponibles sans fonctions serveur : les onglets de l'administration se limitent à celles-ci. */
export const actionsDirectes = new Set(Object.keys(actions));

const REFUS = "Action refusée par la base : ce compte n'a pas le rôle d'administrateur, ou l'écriture ne respecte pas les règles.";

export async function actionDirecte<R>(nom: string, d: Donnees = {}): Promise<R> {
  const action = actions[nom];
  if (!action) throw new Error("Cette action demande les fonctions serveur (offre Blaze de Firebase).");
  const [db, m, auth] = await Promise.all([obtenirDb(), import("firebase/firestore/lite"), obtenirAuth()]);
  const acteur = auth.currentUser?.uid;
  if (!acteur) throw new Error("Connecte-toi pour continuer.");
  try {
    return (await action({ db, m, acteur, d })) as R;
  } catch (e) {
    throw (e as { code?: string }).code === "permission-denied" ? new Error(REFUS) : e;
  }
}

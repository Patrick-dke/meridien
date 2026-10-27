// Amorce l'environnement de TEST (émulateurs Firebase, projet fictif « demo-meridien ») : comptes de test,
// modules et prix de la grille initiale, paiements ouverts en simulation, contenus payants et corrigés.
// Usage (émulateurs lancés) : npx tsx scripts/emulateurs/amorcer.ts
// Refuse de s'exécuter hors émulateurs : il ne peut pas toucher la production.
import { createRequire } from "node:module";
import { join } from "node:path";
import { offre } from "../../src/content/offre";
import { preparerPublication, versDocuments } from "../contenus/publication";
import { COMPTES_TEST } from "./comptes";

const PROJET = "demo-meridien";
process.env.GCLOUD_PROJECT = PROJET;
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

// Le SDK Admin et la grille tarifaire viennent du dossier des fonctions : une seule source pour les prix initiaux.
const exiger = createRequire(join(process.cwd(), "functions", "package.json"));
const { initializeApp } = exiger("firebase-admin/app") as typeof import("../../functions/node_modules/firebase-admin/lib/app/index");
const { getFirestore } = exiger("firebase-admin/firestore") as typeof import("../../functions/node_modules/firebase-admin/lib/firestore/index");
const { getAuth } = exiger("firebase-admin/auth") as typeof import("../../functions/node_modules/firebase-admin/lib/auth/index");

function prixInitial(rang: number) {
  // Même règle que functions/src/admin.ts (PALIER_FCFA) ; vérifiée par le test d'intégration.
  return Math.max(0, rang - 1) * 10_000;
}

async function main() {
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error("Émulateurs requis.");
  const app = initializeApp({ projectId: PROJET });
  const db = getFirestore(app);
  const auth = getAuth(app);

  for (const c of Object.values(COMPTES_TEST)) {
    const existant = await auth.getUserByEmail(c.email).catch(() => null);
    const u = existant ?? (await auth.createUser({ email: c.email, password: c.motDePasse, displayName: c.nom, emailVerified: c.verifie }));
    const date = new Date().toISOString();
    await db.doc(`utilisateurs/${u.uid}`).set({ nom: c.nom, nomMinuscule: c.nom.toLowerCase(), email: c.email, emailMinuscule: c.email, telephone: c.telephone, photo: null, creeLe: date, majLe: date });
    if (c.admin) {
      await db.doc(`admins/${u.uid}`).set({ email: c.email, depuis: date, nommePar: "amorcage-test" });
      await auth.setCustomUserClaims(u.uid, { admin: true });
    }
  }

  for (const m of offre) {
    await db.doc(`modules/${m.id}`).set({ titre: m.titre, rang: m.rang, ordre: m.rang, gratuit: m.gratuit, prix: m.gratuit ? 0 : prixInitial(m.rang), devise: "XAF", publie: true, modifieLe: new Date().toISOString(), modifiePar: "amorcage-test" });
  }
  await db.doc("parametres/public").set({ paiementOuvert: true, contact: { email: null, whatsapp: null } });

  const p = await preparerPublication();
  const date = new Date().toISOString();
  const docs = versDocuments(p);
  for (const c of docs.contenus) await db.doc(`contenus/${c.id}`).set({ ...c.donnees, publieLe: date });
  for (const c of docs.corriges) await db.doc(`corriges/${c.id}`).set(c.donnees);
  for (const n of p.narrations) {
    const { morceaux, ...reste } = n;
    if (morceaux) for (const [i, donnees] of morceaux.entries()) await db.doc(`narrations/${n.slug}/morceaux/${i}`).set({ module: n.module, donnees });
    await db.doc(`narrations/${n.slug}`).set({ ...reste, ...(morceaux ? { morceaux: morceaux.length } : {}), version: p.version });
  }
  console.log(`Environnement de test prêt : ${Object.keys(COMPTES_TEST).length} comptes, ${offre.length} modules, ${p.contenus.length} chapitres payants, ${p.narrations.length} narrations.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

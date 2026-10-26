import type { Concept } from "@/content/schema";
import type { Etat } from "../progression/etat";

export type EtatConcept = "non-vu" | "en-cours" | "fragile" | "acquis";

/** Moyenne pondérée des scores : le plus récent compte le plus (poids divisé par 0,6 à chaque cran). */
export function maitrise(scores: number[]) {
  if (scores.length === 0) return { valeur: 0, preuves: 0 };
  let somme = 0;
  let poids = 0;
  scores.forEach((s, i) => {
    const w = 0.6 ** (scores.length - 1 - i);
    somme += s * w;
    poids += w;
  });
  return { valeur: somme / poids, preuves: scores.length };
}

/**
 * Seuils (dossier de cadrage, section 6) : fragile sous 0,6 ; acquis à 0,8 avec au moins
 * deux preuves (les quiz du parcours testent chaque concept une à trois fois).
 */
export function etatConcept(scores: number[]): EtatConcept {
  const { valeur, preuves } = maitrise(scores);
  if (preuves === 0) return "non-vu";
  if (valeur < 0.6) return "fragile";
  if (valeur >= 0.8 && preuves >= 2) return "acquis";
  return "en-cours";
}

export type Recommandation = { regle: "R1" | "R2" | "R5" | "R6" | "suite"; chapitre: string; raison: string };

/**
 * Recommandations par règles explicites, chacune avec sa raison affichée :
 * R2 (prérequis fragile) passe avant R1 (concept fragile) ; R5 revoit un quiz très faible ;
 * R6 relance après sept jours d'absence ; sinon, la suite du parcours.
 */
export function recommander(
  etat: Etat,
  concepts: Concept[],
  parcours: string[],
  titres: Map<string, string>,
  aujourdhui = new Date(),
): Recommandation[] {
  const recos: Recommandation[] = [];
  const ajouter = (r: Recommandation) => {
    if (!recos.some((x) => x.chapitre === r.chapitre)) recos.push(r);
  };
  const parId = new Map(concepts.map((c) => [c.id, c]));
  const scores = (id: string) => etat.concepts[id]?.scores ?? [];

  const fragiles = concepts.filter((c) => etatConcept(scores(c.id)) === "fragile");

  // R2 d'abord, pour toutes les bases fragiles : sa raison explique mieux l'erreur que R1.
  for (const c of fragiles) {
    const prerequisFragile = c.prerequis
      .map((p) => parId.get(p))
      .find((p) => p && etatConcept(scores(p.id)) === "fragile");
    if (prerequisFragile && prerequisFragile.chapitre !== c.chapitre) {
      ajouter({
        regle: "R2",
        chapitre: prerequisFragile.chapitre,
        raison: `Tes erreurs sur « ${c.nom} » viennent peut-être d'une base fragile : « ${prerequisFragile.nom} ».`,
      });
    }
  }

  for (const c of fragiles) {
    const manquees = scores(c.id).filter((s) => s < 0.5).length;
    ajouter({
      regle: "R1",
      chapitre: c.chapitre,
      raison: `${manquees > 1 ? `${manquees} réponses manquées` : "Une réponse manquée"} sur « ${c.nom} » : un retour sur ce chapitre devrait aider.`,
    });
  }

  for (const [slug, c] of Object.entries(etat.chapitres)) {
    if (c.dernierScore !== undefined && c.dernierScore < 0.5) {
      ajouter({ regle: "R5", chapitre: slug, raison: `Dernier quiz sous 50 % : reprends la capsule et l'exemple de « ${titres.get(slug) ?? slug} ».` });
    }
  }

  if (etat.derniereVisite && etat.dernierChapitre) {
    const jours = (aujourdhui.getTime() - new Date(etat.derniereVisite).getTime()) / 86400000;
    if (jours > 7) {
      ajouter({ regle: "R6", chapitre: etat.dernierChapitre, raison: `Ta dernière visite remonte à ${Math.floor(jours)} jours : reprends là où tu t'étais arrêté·e.` });
    }
  }

  const suivant = parcours.find((s) => etat.chapitres[s]?.statut !== "termine");
  if (suivant) {
    ajouter({
      regle: "suite",
      chapitre: suivant,
      raison: etat.chapitres[suivant] ? "Chapitre commencé : reprends à l'étape où tu étais." : "Prochaine étape du parcours « Premiers pas ».",
    });
  }
  return recos.slice(0, 4);
}

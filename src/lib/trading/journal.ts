import type { Devise } from "./devises";

/** Une ligne du journal de trading (saisie à la main ou venue du compte d'entraînement). */
export type EntreeJournal = {
  id: string;
  date: string;
  symbole: string;
  sens: "achat" | "vente";
  entree: number;
  sortie: number;
  stop?: number;
  /** Résultat dans la devise indiquée (frais compris si l'apprenant les a déduits). */
  resultat: number;
  devise: Devise;
  /** Résultat en multiples du risque initial, si un stop était prévu. */
  r: number | null;
  plan?: string;
  emotion?: "calme" | "hesitant" | "impatient" | "frustre" | "euphorique";
  respectPlan?: boolean;
  notes?: string;
  source: "simulateur" | "manuel";
};

export function rEntree(e: Pick<EntreeJournal, "sens" | "entree" | "sortie" | "stop">) {
  if (e.stop === undefined || e.stop === e.entree) return null;
  return ((e.sortie - e.entree) * (e.sens === "achat" ? 1 : -1)) / Math.abs(e.entree - e.stop);
}

export type Statistiques = {
  nombre: number;
  gagnants: number;
  tauxReussite: number;
  gainMoyen: number;
  perteMoyenne: number;
  esperance: number;
  facteurProfit: number | null;
  drawdownMax: number;
  pireSerie: number;
  totalR: number | null;
  esperanceR: number | null;
  courbe: number[];
};

/**
 * Statistiques d'un ensemble de trades d'une même devise, dans l'ordre chronologique :
 * espérance, facteur de profit, baisse maximale depuis un sommet, plus longue série de pertes.
 */
export function statistiques(trades: EntreeJournal[], capitalDepart = 0): Statistiques | null {
  if (!trades.length) return null;
  const ordonnes = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  const gains = ordonnes.filter((t) => t.resultat > 0).map((t) => t.resultat);
  const pertes = ordonnes.filter((t) => t.resultat < 0).map((t) => -t.resultat);
  const somme = (x: number[]) => x.reduce((a, b) => a + b, 0);
  let cumul = capitalDepart;
  let sommet = capitalDepart;
  let drawdownMax = 0;
  let serie = 0;
  let pireSerie = 0;
  const courbe = [capitalDepart];
  for (const t of ordonnes) {
    cumul += t.resultat;
    courbe.push(cumul);
    sommet = Math.max(sommet, cumul);
    drawdownMax = Math.max(drawdownMax, sommet - cumul);
    serie = t.resultat < 0 ? serie + 1 : 0;
    pireSerie = Math.max(pireSerie, serie);
  }
  const avecR = ordonnes.filter((t) => t.r !== null).map((t) => t.r!);
  return {
    nombre: ordonnes.length,
    gagnants: gains.length,
    tauxReussite: gains.length / ordonnes.length,
    gainMoyen: gains.length ? somme(gains) / gains.length : 0,
    perteMoyenne: pertes.length ? somme(pertes) / pertes.length : 0,
    esperance: somme(ordonnes.map((t) => t.resultat)) / ordonnes.length,
    facteurProfit: pertes.length ? somme(gains) / somme(pertes) : null,
    drawdownMax,
    pireSerie,
    totalR: avecR.length ? somme(avecR) : null,
    esperanceR: avecR.length ? somme(avecR) / avecR.length : null,
    courbe,
  };
}

/** Export CSV (séparateur point-virgule, lisible par un tableur réglé en français). */
export function versCsv(trades: EntreeJournal[]) {
  const entetes = ["date", "instrument", "sens", "entree", "stop", "sortie", "resultat", "devise", "r", "plan", "emotion", "plan_respecte", "notes", "source"];
  const champ = (v: unknown) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lignes = trades.map((t) =>
    [t.date, t.symbole, t.sens, t.entree, t.stop, t.sortie, t.resultat.toFixed(2), t.devise, t.r === null ? "" : t.r.toFixed(2), t.plan, t.emotion, t.respectPlan === undefined ? "" : t.respectPlan ? "oui" : "non", t.notes, t.source]
      .map(champ)
      .join(";"),
  );
  return [entetes.join(";"), ...lignes].join("\n");
}

/**
 * Devises des comptes d'entraînement et conversion entre elles.
 *
 * Trois notions à ne pas confondre :
 * - la devise du COMPTE (celle du solde et des résultats) ;
 * - la devise de COTATION d'un instrument (USD pour EUR/USD, JPY pour USD/JPY) : un gain se calcule d'abord dans elle ;
 * - la CONVERSION de l'une vers l'autre, à un taux daté et sourcé.
 *
 * Taux : FCFA (XAF et XOF) à parité fixe avec l'euro (1 € = 655,957 FCFA, fixée par les accords monétaires de la
 * zone franc) ; les autres devises aux taux de référence quotidiens de la Banque centrale européenne (BCE), lus
 * via l'API publique Frankfurter (api.frankfurter.dev). Sans réseau, l'apprenant peut saisir lui-même un taux : il est alors marqué « manuel ».
 */
export const DEVISES = {
  EUR: { nom: "Euro", decimales: 2 },
  USD: { nom: "Dollar américain", decimales: 2 },
  GBP: { nom: "Livre sterling", decimales: 2 },
  XAF: { nom: "Franc CFA (CEMAC)", decimales: 0 },
  XOF: { nom: "Franc CFA (UEMOA)", decimales: 0 },
  CAD: { nom: "Dollar canadien", decimales: 2 },
  CHF: { nom: "Franc suisse", decimales: 2 },
  JPY: { nom: "Yen", decimales: 0 },
} as const;
export type Devise = keyof typeof DEVISES;
export const CODES_DEVISES = Object.keys(DEVISES) as Devise[];

export const PARITE_FCFA = 655.957;

/** Valeur d'un euro dans chaque devise, avec la date et la source des taux. */
export type TableTaux = { parEuro: Record<Devise, number>; date: string; source: "BCE" | "manuel" | "parité fixe" };

/** Table minimale, toujours exacte : euro et FCFA seulement (parités fixes). */
export const TAUX_FIXES: Partial<Record<Devise, number>> = { EUR: 1, XAF: PARITE_FCFA, XOF: PARITE_FCFA };

/** Montant formaté dans sa devise, à la française (« 1 250,50 $ US », « 125 000 FCFA »). */
export function formaterMontant(montant: number, devise: Devise, options: { signe?: boolean } = {}) {
  const d = DEVISES[devise].decimales;
  const texte = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devise,
    minimumFractionDigits: d,
    maximumFractionDigits: d,
    signDisplay: options.signe ? "exceptZero" : "auto",
  }).format(montant);
  return texte.replace(/ /g, " ");
}

/**
 * Convertit un montant d'une devise à une autre en passant par l'euro (taux croisé). Renvoie null si un taux manque :
 * on n'invente jamais une conversion.
 */
export function convertir(montant: number, de: Devise, vers: Devise, taux: Partial<Record<Devise, number>>): number | null {
  if (de === vers) return montant;
  const tDe = taux[de];
  const tVers = taux[vers];
  if (!tDe || !tVers) return null;
  return (montant / tDe) * tVers;
}

const CLE_CACHE = "meridien:taux-bce";

/** Taux de référence BCE du jour (mis en cache 12 h sur l'appareil), complétés des parités fixes du FCFA. */
export async function chargerTauxBCE(): Promise<TableTaux> {
  try {
    const cache = JSON.parse(window.localStorage.getItem(CLE_CACHE) ?? "null") as (TableTaux & { lu: number }) | null;
    if (cache && Date.now() - cache.lu < 12 * 3600_000) return cache;
  } catch {
    // Cache illisible : on relit les taux.
  }
  const rep = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CAD,CHF,JPY", { signal: AbortSignal.timeout(8000) });
  if (!rep.ok) throw new Error(`Taux indisponibles (${rep.status})`);
  const j = (await rep.json()) as { date: string; rates: Record<string, number> };
  const table: TableTaux = {
    parEuro: { EUR: 1, XAF: PARITE_FCFA, XOF: PARITE_FCFA, USD: j.rates.USD, GBP: j.rates.GBP, CAD: j.rates.CAD, CHF: j.rates.CHF, JPY: j.rates.JPY },
    date: j.date,
    source: "BCE",
  };
  try {
    window.localStorage.setItem(CLE_CACHE, JSON.stringify({ ...table, lu: Date.now() }));
  } catch {
    // Stockage indisponible : les taux seront relus à la prochaine visite.
  }
  return table;
}

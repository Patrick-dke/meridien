/**
 * Numéros mobiles camerounais : 9 chiffres commençant par 6, avec ou sans l'indicatif +237.
 * Préfixes usuels (plan de numérotation, à confirmer auprès des opérateurs s'ils évoluent) :
 * MTN 67x, 650 à 654, 680 à 689 ; Orange 69x, 655 à 659, 640 à 649.
 */
export type Operateur = "mtn" | "orange";

export function normaliserTelephone(brut: string): string | null {
  const chiffres = brut.replace(/[\s.\-()]/g, "").replace(/^(\+|00)?237/, "");
  return /^6\d{8}$/.test(chiffres) ? chiffres : null;
}

export function operateurProbable(numero: string): Operateur | null {
  if (/^6(7\d|5[0-4]|8\d)/.test(numero)) return "mtn";
  if (/^6(9\d|5[5-9]|4\d)/.test(numero)) return "orange";
  return null;
}

/** Numéro masqué pour l'affichage et les historiques : seuls les deux derniers chiffres restent. */
export const masquer = (numero: string) => `${numero.slice(0, 1)}•• •• •• ${numero.slice(-2)}`;

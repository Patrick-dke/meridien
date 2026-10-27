/**
 * Numéros mobiles camerounais (mêmes règles que le serveur, functions/src/telephone.ts) :
 * 9 chiffres commençant par 6, avec ou sans +237.
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

/** « 670000000 » → « 6 70 00 00 00 ». */
export const formaterTelephone = (n: string) => n.replace(/^(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");

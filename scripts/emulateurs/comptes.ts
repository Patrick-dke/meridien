// Comptes FICTIFS de l'environnement de test (émulateurs locaux, projet « demo-meridien »).
// Ils n'existent nulle part ailleurs ; ces mots de passe ne protègent rien de réel.
export const COMPTES_TEST = {
  admin: { email: "admin@meridien.test", motDePasse: "Emulateur-admin-2026", nom: "Admin Test", telephone: "690000000", verifie: true, admin: true },
  apprenant: { email: "apprenant@meridien.test", motDePasse: "Emulateur-apprenant-2026", nom: "Awa Test", telephone: "670000000", verifie: true, admin: false },
} as const;

/** Compte créé à la main pendant les essais d'inscription dans le navigateur (non amorcé). */
export const COMPTE_ESSAI_INSCRIPTION = { email: "essai-navigateur@meridien.test", motDePasse: "Essai-navigateur-2026", nom: "Ésaïe Mbarga", telephone: "6 90 00 00 00" } as const;

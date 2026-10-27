import { defineSecret, defineString } from "firebase-functions/params";

/**
 * Configuration serveur, jamais livrée au navigateur.
 * - Valeurs simples : fichiers `functions/.env.<projet>` (voir `.env.exemple`).
 * - Secrets : Secret Manager (`firebase functions:secrets:set NOM`) ; dans les émulateurs, `functions/.secret.local`.
 */
export const PAIEMENT_FOURNISSEUR = defineString("PAIEMENT_FOURNISSEUR", {
  default: "aucun",
  description: "aucun | simulation (émulateurs uniquement) | fapshi",
});
export const FAPSHI_ENV = defineString("FAPSHI_ENV", { default: "sandbox", description: "sandbox | live" });
export const FAPSHI_MODE = defineString("FAPSHI_MODE", { default: "direct", description: "direct (demande sur le téléphone) | lien (page Fapshi)" });
export const SITE_URL = defineString("SITE_URL", { default: "https://meridien-academie.web.app" });
/** Adresses autorisées à devenir administrateur (séparées par des virgules), une fois leur adresse vérifiée. */
export const ADMIN_EMAILS = defineString("ADMIN_EMAILS", { default: "" });

export const FAPSHI_API_USER = defineSecret("FAPSHI_API_USER");
export const FAPSHI_API_KEY = defineSecret("FAPSHI_API_KEY");
export const FAPSHI_WEBHOOK_SECRET = defineSecret("FAPSHI_WEBHOOK_SECRET");
export const secretsPaiement = [FAPSHI_API_USER, FAPSHI_API_KEY, FAPSHI_WEBHOOK_SECRET];

export const enEmulation = () => process.env.FUNCTIONS_EMULATOR === "true";

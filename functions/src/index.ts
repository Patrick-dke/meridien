/**
 * Fonctions serveur de Méridien. Elles exigent l'offre Blaze de Firebase (paiement à l'usage, avec un quota
 * gratuit mensuel) ; voir docs/commercial.md pour les coûts et la mise en service.
 */
export { etatPaiement, initierPaiement, reconcilier, verifierPaiement, webhookPaiement } from "./paiement";
export { noterQuiz } from "./quiz";
export { examen } from "./examens";
export { outils } from "./outils";
export { verifierLicence } from "./licences";
export { envoyerMessage } from "./contact";
export { deconnecterPartout, revendiquerAdmin } from "./comptes";
export { admin } from "./admin";

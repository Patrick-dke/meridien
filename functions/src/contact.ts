import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { z } from "zod";
import { db, hacher, limiter, maintenant, REGION } from "./commun";

const Message = z.object({
  nom: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  telephone: z.string().trim().max(20).optional(),
  sujet: z.enum(["formation", "paiement", "compte", "outils", "partenariat", "autre"]),
  texte: z.string().trim().min(10).max(3000),
});

/**
 * Canaux de notification de l'équipe. « aucun » par défaut : les messages restent dans l'administration.
 * Le canal WhatsApp Business (API Cloud de Meta) se branche ici une fois le numéro professionnel validé,
 * avec un jeton dans Secret Manager ; aucun numéro n'est écrit dans le code.
 */
export type Canal = { nom: string; envoyer(resume: string): Promise<void> };
export async function canauxActifs(): Promise<Canal[]> {
  const cfg = (await db.doc("parametres/contact").get()).data() ?? {};
  const canaux: Canal[] = [];
  if (cfg.whatsapp?.actif === true) {
    canaux.push({
      nom: "whatsapp",
      async envoyer() {
        logger.info("Canal WhatsApp prêt mais non connecté : jeton et numéro professionnel à configurer.");
      },
    });
  }
  return canaux;
}

export const envoyerMessage = onCall({ region: REGION }, async (req) => {
  // Champ invisible du formulaire : seul un robot le remplit. On répond comme si tout allait bien.
  if (typeof req.data?.site === "string" && req.data.site) return { ok: true };
  const p = Message.safeParse(req.data);
  if (!p.success) throw new HttpsError("invalid-argument", "Vérifie les champs du formulaire.");
  const cle = req.auth?.uid ?? hacher(req.rawRequest.ip ?? "inconnu");
  await limiter(`contact:${cle}`, 3, 3600, "Tu as déjà envoyé plusieurs messages. Nous te répondrons rapidement.");
  const ref = await db.collection("messages").add({
    nom: p.data.nom,
    email: p.data.email.toLowerCase(),
    telephone: p.data.telephone || null,
    sujet: p.data.sujet,
    texte: p.data.texte,
    uid: req.auth?.uid ?? null,
    statut: "nouveau",
    creeLe: maintenant(),
  });
  for (const c of await canauxActifs()) await c.envoyer(`Nouveau message (${p.data.sujet}) de ${p.data.nom}`).catch((e) => logger.warn(`Canal ${c.nom}`, String(e)));
  return { ok: true, reference: ref.id.slice(0, 8).toUpperCase() };
});

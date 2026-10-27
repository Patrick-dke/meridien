"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Retour de la page du prestataire : on reprend le suivi du paiement en cours, mémorisé dans l'onglet. */
export function ReprendrePaiement() {
  const router = useRouter();
  useEffect(() => {
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const cle = window.sessionStorage.key(i) ?? "";
        if (cle.startsWith("meridien:paiement:")) {
          router.replace(`/paiement/?module=${encodeURIComponent(cle.slice("meridien:paiement:".length))}`);
          return;
        }
      }
    } catch {
      // Onglet différent ou stockage bloqué : le lien vers Mon compte reste disponible.
    }
  }, [router]);
  return null;
}

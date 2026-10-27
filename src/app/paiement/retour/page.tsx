import type { Metadata } from "next";
import Link from "next/link";
import { CadreCompte } from "@/components/compte/Formulaire";
import { ReprendrePaiement } from "@/components/paiement/Retour";

export const metadata: Metadata = { title: "Retour de paiement", robots: { index: false } };

/** Page de retour du prestataire : le statut n'y est jamais lu dans l'adresse, seulement auprès du serveur. */
export default function RetourPaiement() {
  return (
    <CadreCompte surtitre="Paiement" titre="Vérification en cours">
      <ReprendrePaiement />
      <p className="text-ink-2">
        Merci. La confirmation vient directement de l&apos;opérateur : ton accès s&apos;ouvre dès qu&apos;il l&apos;a validée. Tu peux suivre l&apos;état dans{" "}
        <Link href="/compte/#paiements" className="text-brand underline">
          Mon compte → Paiements
        </Link>
        .
      </p>
    </CadreCompte>
  );
}

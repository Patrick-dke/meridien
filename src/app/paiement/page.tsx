import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { PagePaiement } from "@/components/paiement/Paiement";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

export default function Paiement() {
  return (
    <CadreCompte surtitre="Paiement sécurisé" titre="Débloquer un module">
      <PagePaiement />
    </CadreCompte>
  );
}

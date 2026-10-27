import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { FormulaireInscription } from "@/components/compte/Connexion";

export const metadata: Metadata = { title: "Créer un compte", description: "Crée ton compte Méridien gratuitement : quiz, progression sauvegardée, certificats." };

export default function PageInscription() {
  return (
    <CadreCompte surtitre="Gratuit, sans engagement" titre="Créer un compte">
      <FormulaireInscription />
    </CadreCompte>
  );
}

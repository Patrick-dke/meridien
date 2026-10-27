import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { FormulaireConnexion } from "@/components/compte/Connexion";

export const metadata: Metadata = { title: "Connexion", description: "Connecte-toi à ton compte Méridien : quiz, progression sauvegardée et formations achetées." };

export default function PageConnexion() {
  return (
    <CadreCompte surtitre="Mon compte" titre="Connexion">
      <FormulaireConnexion />
    </CadreCompte>
  );
}

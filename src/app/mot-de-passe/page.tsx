import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { FormulaireMotDePasse } from "@/components/compte/Connexion";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function PageMotDePasse() {
  return (
    <CadreCompte surtitre="Mon compte" titre="Mot de passe oublié">
      <p className="mb-5 text-ink-2">Indique l&apos;adresse de ton compte : tu recevras un lien pour choisir un nouveau mot de passe.</p>
      <FormulaireMotDePasse />
    </CadreCompte>
  );
}

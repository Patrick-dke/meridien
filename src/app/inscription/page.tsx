import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { FormulaireInscription } from "@/components/compte/Connexion";
import { IconeCoche } from "@/components/ui/Icones";

const avantages = [
  "Le premier module en entier, avec ses quiz corrigés",
  "Ta progression sauvegardée sur tous tes appareils",
  "Un certificat interne pour chaque module réussi",
];

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Crée ton compte Méridien : introduction gratuite, progression sauvegardée sur tous tes appareils, quiz et certificats.",
};

export default function PageInscription() {
  return (
    <CadreCompte surtitre="Compte gratuit" titre="Commence ton parcours">
      <ul className="-mt-2 mb-6 space-y-1.5 text-sm text-ink-2">
        {avantages.map((a) => (
          <li key={a} className="flex gap-2">
            <IconeCoche className="mt-0.5 size-4 shrink-0 text-jauge" /> {a}
          </li>
        ))}
      </ul>
      <FormulaireInscription />
    </CadreCompte>
  );
}

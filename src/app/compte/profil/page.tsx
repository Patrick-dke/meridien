import type { Metadata } from "next";
import Link from "next/link";
import { CadreCompte } from "@/components/compte/Formulaire";
import { ParametresProfil } from "@/components/compte/Profil";

export const metadata: Metadata = { title: "Paramètres du profil", robots: { index: false } };

export default function PageProfil() {
  return (
    <CadreCompte surtitre="Mon compte" titre="Paramètres du profil" large>
      <p className="-mt-3 mb-6 text-sm">
        <Link href="/compte/" className="text-brand underline">
          ← Retour à mon espace
        </Link>
      </p>
      <ParametresProfil />
    </CadreCompte>
  );
}

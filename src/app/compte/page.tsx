import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { MonCompte } from "@/components/compte/MonCompte";
import { modulesPresentes } from "@/content/presentation";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

export default function PageCompte() {
  return (
    <CadreCompte surtitre="Mon compte" titre="Mon espace" large>
      <MonCompte modules={modulesPresentes} />
    </CadreCompte>
  );
}

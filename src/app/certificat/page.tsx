import type { Metadata } from "next";
import { CadreCompte } from "@/components/compte/Formulaire";
import { VoirCertificat } from "@/components/compte/Certificat";

export const metadata: Metadata = { title: "Certificat", description: "Vérifier un certificat interne Méridien par son numéro.", robots: { index: false } };

export default function PageCertificat() {
  return (
    <CadreCompte surtitre="Vérification" titre="Certificat Méridien" large>
      <VoirCertificat />
    </CadreCompte>
  );
}

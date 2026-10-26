import type { Metadata } from "next";
import { PageTexte } from "@/components/contenu/PageTexte";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PageConfidentialite() {
  return (
    <PageTexte
      titre="Confidentialité"
      maj="26 octobre 2026"
      sections={[
        {
          titre: "Ce que Méridien collecte : rien",
          paragraphes: [
            "Méridien ne demande ni compte, ni adresse e-mail, ni nom. Le site n'utilise aucun cookie, aucun outil de mesure d'audience et aucun traceur publicitaire. Les polices de caractères sont servies par le site lui-même : aucune requête n'est envoyée à un service tiers pendant ta visite.",
          ],
        },
        {
          titre: "Ce qui reste dans ton navigateur",
          paragraphes: [
            "Ta progression (chapitres ouverts et terminés, étape atteinte, résultats aux quiz, temps passé), tes favoris, tes notes et tes réglages sont enregistrés dans le stockage local de ton navigateur (localStorage). Ces informations ne quittent pas ton appareil et ne sont jamais envoyées à un serveur.",
            "Pour consulter les pages hors ligne, le site enregistre aussi une copie des pages visitées dans le cache de ton navigateur.",
          ],
        },
        {
          titre: "Tes droits",
          paragraphes: [
            "Depuis la page « Réglages et données », tu peux à tout moment exporter tes données dans un fichier, les importer sur un autre appareil ou les effacer définitivement. Vider les données du site dans ton navigateur produit le même effet.",
          ],
        },
        {
          titre: "Les hébergeurs",
          paragraphes: [
            "Selon l'adresse que tu utilises, le site est servi par GitHub Pages (GitHub, Inc.) ou par Firebase Hosting (Google LLC). Comme tout hébergeur, ils peuvent enregistrer des données techniques de connexion, comme l'adresse IP, pour la sécurité et le bon fonctionnement du service, selon leur propre politique de confidentialité. Méridien n'a pas accès à ces journaux.",
          ],
        },
      ]}
    />
  );
}

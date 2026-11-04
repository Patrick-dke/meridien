import type { Metadata } from "next";
import { PageTexte } from "@/components/contenu/PageTexte";

export const metadata: Metadata = { title: "Mentions légales" };

export default function PageMentions() {
  return (
    <PageTexte
      titre="Mentions légales"
      maj="2 novembre 2026"
      sections={[
        {
          titre: "Éditeur",
          paragraphes: [
            "Méridien est publié par le titulaire du compte GitHub « Patrick-dke », responsable de la publication. Les informations légales complètes de l'éditeur (identité, adresse, immatriculation) seront publiées ici avant l'ouverture du paiement en ligne.",
            "Pour toute question, utilise le formulaire de contact. Pour signaler une erreur dans un cours, tu peux aussi ouvrir un ticket sur le dépôt du projet (github.com/Patrick-dke/meridien).",
          ],
        },
        {
          titre: "Hébergement",
          paragraphes: [
            "Le site est publié à deux adresses au contenu identique, pour rester accessible si un fournisseur d'accès bloque l'une d'elles.",
            "patrick-dke.github.io/meridien : GitHub Pages, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.",
            "meridien-academie.web.app : Firebase Hosting, service de Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis.",
          ],
        },
        {
          titre: "Contenus",
          paragraphes: [
            "Les textes, figures et capsules de Méridien sont des créations originales, rédigées avec l'aide d'une intelligence artificielle puis vérifiées. Ils ne reprennent pas de contenus de formations tierces. Les noms de plateformes ou de produits cités (TradingView, MetaTrader…) appartiennent à leurs propriétaires respectifs.",
            "Méridien est un service de formation : il ne constitue ni un conseil en investissement, ni une offre de services financiers. Voir l'avertissement sur les risques et les conditions de vente.",
            "Narration des capsules : voix de synthèse produite localement avec Kokoro-82M (hexgrad, licence Apache 2.0), voix « ff_siwis » entraînée sur le corpus SIWIS French Speech Synthesis Database (Université d'Édimbourg, licence CC BY 4.0). Aucune voix réelle n'est imitée.",
          ],
        },
      ]}
    />
  );
}

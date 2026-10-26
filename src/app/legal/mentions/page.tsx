import type { Metadata } from "next";
import { PageTexte } from "@/components/contenu/PageTexte";

export const metadata: Metadata = { title: "Mentions légales" };

export default function PageMentions() {
  return (
    <PageTexte
      titre="Mentions légales"
      maj="26 octobre 2026"
      sections={[
        {
          titre: "Éditeur",
          paragraphes: [
            "Méridien est un projet personnel, gratuit et non commercial, publié par le titulaire du compte GitHub « Patrick-dke ». Pour toute question ou pour signaler une erreur, ouvre un ticket sur le dépôt GitHub du projet (github.com/Patrick-dke/meridien).",
          ],
        },
        {
          titre: "Hébergement",
          paragraphes: ["GitHub Pages, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis."],
        },
        {
          titre: "Contenus",
          paragraphes: [
            "Les textes, figures et capsules de Méridien sont des créations originales, rédigées avec l'aide d'une intelligence artificielle puis vérifiées. Ils ne reprennent pas de contenus de formations tierces. Les noms de plateformes ou de produits cités (TradingView, MetaTrader…) appartiennent à leurs propriétaires respectifs.",
            "Méridien est un outil pédagogique : il ne constitue ni un conseil en investissement, ni une offre de services financiers. Voir l'avertissement sur les risques.",
          ],
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { PageTexte } from "@/components/contenu/PageTexte";

export const metadata: Metadata = { title: "Avertissement sur les risques" };

export default function PageRisques() {
  return (
    <PageTexte
      titre="Avertissement sur les risques"
      maj="26 octobre 2026"
      sections={[
        {
          titre: "Un site d'apprentissage, pas un conseil",
          paragraphes: [
            "Méridien est une plateforme pédagogique gratuite. Elle ne fournit aucun conseil en investissement personnalisé, aucune recommandation d'achat ou de vente, aucun signal de trading et aucune gestion de compte.",
            "Les calculateurs effectuent des calculs exacts à partir des hypothèses que tu saisis ; ils ne prédisent rien sur l'évolution des marchés.",
          ],
        },
        {
          titre: "Le risque de perte",
          paragraphes: [
            "Le trading comporte un risque élevé de perte en capital. Tu peux perdre tout l'argent engagé. N'utilise que de l'argent dont la perte ne mettrait pas en difficulté ta vie quotidienne, tes proches ou tes projets.",
            "L'effet de levier amplifie les pertes autant que les gains : une faible variation de prix peut effacer une grande partie de ton capital. Dans l'Union européenne, les courtiers proposant des CFD doivent publier la proportion de leurs clients particuliers qui perdent de l'argent : c'est la majorité d'entre eux.",
            "Les ordres stop ne garantissent pas leur prix d'exécution : en cas de mouvement brutal ou d'écart de cotation (gap), la perte réelle peut dépasser la perte prévue.",
          ],
        },
        {
          titre: "Exemples et performances",
          paragraphes: [
            "Les graphiques et exemples des cours utilisent des données synthétiques, construites pour illustrer un mécanisme. Ils ne décrivent pas un marché réel et ne constituent pas des exemples de résultats.",
            "Les performances passées, réelles ou simulées, ne présagent pas des performances futures. Aucune stratégie présentée sur ce site n'est validée statistiquement.",
          ],
        },
        {
          titre: "Te protéger",
          paragraphes: [
            "Avant d'ouvrir un compte, vérifie que le courtier est agréé par une autorité financière reconnue. Méfie-toi des promesses de gains, des signaux payants, des propositions de gestion de compte et des « robots » présentés comme infaillibles : ce sont des signes d'alerte fréquents d'arnaque.",
            "En cas de doute sur ta situation personnelle, adresse-toi à un professionnel agréé.",
          ],
        },
      ]}
    />
  );
}

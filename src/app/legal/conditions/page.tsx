import type { Metadata } from "next";
import { PageTexte } from "@/components/contenu/PageTexte";

export const metadata: Metadata = {
  title: "Conditions de vente et d'utilisation",
  description: "Conditions d'accès aux formations et aux outils Méridien : achat par module, paiement Mobile Money, licences, responsabilités.",
};

export default function PageConditions() {
  return (
    <PageTexte
      titre="Conditions de vente et d'utilisation"
      maj="2 novembre 2026"
      intro="Ces conditions s'appliqueront à l'ouverture du paiement en ligne. D'ici là, seule l'introduction est accessible, sans paiement."
      sections={[
        {
          titre: "Ce que propose Méridien",
          paragraphes: [
            "Méridien propose une formation au trading en ligne, organisée en huit modules : capsules vidéo narrées, cours illustrés, exercices, quiz et examens. Le premier module, « Premiers pas », est une introduction gratuite. Les modules suivants s'achètent un par un.",
            "Méridien propose aussi des outils (indicateur pour TradingView, robot pour MetaTrader 5), distribués sous licence selon les conditions affichées sur leur fiche.",
            "Méridien est un service de formation. Il ne fournit ni conseil en investissement, ni signal de trading, ni gestion de compte, et ne promet aucun gain.",
          ],
        },
        {
          titre: "Tarifs et paiement",
          paragraphes: [
            "Les tarifs sont affichés en francs CFA (FCFA) sur la page de chaque module avant tout achat. Le tarif appliqué est celui affiché au moment où le paiement est lancé.",
            "Le paiement se fait par Orange Money ou MTN MoMo, par l'intermédiaire d'un prestataire de paiement. Tu valides le paiement sur ton téléphone ; Méridien ne te demande jamais ton code secret.",
            "Le paiement est unique pour chaque module : rien n'est prélevé ensuite, rien ne se renouvelle.",
          ],
        },
        {
          titre: "Accès aux modules",
          paragraphes: [
            "L'accès à un module s'ouvre sur ton compte dès que le prestataire confirme le paiement. Une simple page de confirmation dans le navigateur ne suffit pas : c'est la confirmation du prestataire qui fait foi.",
            "L'accès est personnel, rattaché à ton compte, sans limite de durée pendant toute l'exploitation du service, depuis tout appareil.",
            "Si ton paiement est confirmé sans que l'accès s'ouvre, ou si tu as payé deux fois le même module, Méridien vérifie auprès du prestataire puis ouvre l'accès ou rembourse le paiement en double. Les autres demandes sont examinées au cas par cas.",
          ],
        },
        {
          titre: "Évaluations et certificats",
          paragraphes: [
            "Les quiz et examens sont notés par le serveur de Méridien. Un examen réussi donne un certificat interne à Méridien : il atteste du parcours suivi sur la plateforme, ce n'est ni un diplôme ni une certification professionnelle.",
          ],
        },
        {
          titre: "Outils et licences",
          paragraphes: [
            "Une licence d'outil est personnelle et non cessible. Elle autorise le logiciel à fonctionner pour son titulaire : sur son identifiant TradingView, ou sur les comptes MetaTrader 5 autorisés. Elle peut avoir une date de fin, indiquée lors de l'accord.",
            "La licence ne donne à Méridien aucun accès à ton compte de trading. Aucun mot de passe de trading n'est demandé. L'installation accompagnée, si tu la choisis, se limite à une session ponctuelle que tu ouvres et fermes toi-même.",
            "Les outils appliquent des règles ; ils ne garantissent aucun résultat. Tu restes seul responsable de leurs réglages, de leur usage et du risque pris. Teste-les d'abord sur un compte de démonstration.",
            "Une licence peut être suspendue en cas de partage ou d'usage contraire à ces conditions.",
          ],
        },
        {
          titre: "Ton compte",
          paragraphes: [
            "Un compte correspond à une personne. Les contenus payants ne se partagent pas : la revente, la diffusion ou le partage d'accès peuvent entraîner la suspension du compte.",
            "Les textes, figures, capsules et outils de Méridien sont protégés : tu peux les utiliser pour ton apprentissage personnel, pas les reproduire ni les diffuser.",
          ],
        },
        {
          titre: "Risques",
          paragraphes: [
            "Le trading comporte un risque élevé de perte en capital. Les exemples des cours utilisent des données construites pour illustrer un mécanisme et ne décrivent pas des résultats réels. Voir l'avertissement sur les risques.",
          ],
        },
        {
          titre: "Données personnelles",
          paragraphes: ["Les données collectées et leur usage sont décrits sur la page Confidentialité."],
        },
      ]}
    />
  );
}

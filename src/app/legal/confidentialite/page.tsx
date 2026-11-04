import type { Metadata } from "next";
import { PageTexte } from "@/components/contenu/PageTexte";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PageConfidentialite() {
  return (
    <PageTexte
      titre="Confidentialité"
      maj="2 novembre 2026"
      sections={[
        {
          titre: "Sans compte",
          paragraphes: [
            "Tu peux lire l'introduction, utiliser la pratique et les calculateurs sans compte. Méridien n'utilise aucun outil de mesure d'audience, aucun traceur publicitaire et aucun cookie publicitaire. Les polices de caractères sont servies par le site lui-même.",
            "Ta progression, tes réglages, ton compte d'entraînement et ton journal de trading sont enregistrés dans le stockage local de ton navigateur. Sans compte, ils ne quittent pas ton appareil.",
          ],
        },
        {
          titre: "Avec un compte",
          paragraphes: [
            "Pour créer un compte, Méridien enregistre ton nom, ton adresse e-mail et, si tu les donnes, ton numéro de téléphone et une photo de profil. Ta progression est alors recopiée sur ton compte pour la retrouver sur un autre appareil.",
            "Sont aussi enregistrés : tes résultats officiels aux quiz et examens, tes certificats, tes achats (module, montant, opérateur, statut) et tes droits d'accès.",
            "Les comptes et ces données sont gérés avec Firebase (Google LLC) : authentification et base de données.",
          ],
        },
        {
          titre: "Paiements",
          paragraphes: [
            "Les paiements Orange Money et MTN MoMo passent par un prestataire de paiement. Méridien ne te demande jamais ton code secret Mobile Money : tu le saisis uniquement sur ton téléphone, à la demande de ton opérateur. Le numéro utilisé est conservé avec la transaction pour pouvoir la vérifier auprès du prestataire ; il n'apparaît que masqué dans ton historique.",
          ],
        },
        {
          titre: "Indicateurs et robots",
          paragraphes: [
            "Pour une demande d'accès à un outil, Méridien enregistre ton identifiant TradingView, ou les numéros de tes comptes MetaTrader 5 et le nom de leur serveur, ainsi que ton choix d'installation. Aucun mot de passe de trading n'est jamais demandé ni conservé.",
            "Quand le robot vérifie sa licence, Méridien enregistre la date, le numéro de compte, le serveur, la version du robot et le résultat. Ces informations servent seulement à faire respecter la licence.",
          ],
        },
        {
          titre: "Formulaire de contact",
          paragraphes: [
            "Un message envoyé depuis le formulaire de contact est conservé avec ton nom, ton adresse e-mail, ton téléphone si tu le donnes, et ton compte si tu es connecté, pour y répondre. Pour limiter les envois abusifs, l'adresse IP d'un visiteur sans compte sert, sous une forme brouillée, à compter les envois de l'heure.",
          ],
        },
        {
          titre: "Services tiers",
          paragraphes: [
            "Le compte d'entraînement lit les taux de change de référence de la Banque centrale européenne auprès du service public Frankfurter (api.frankfurter.dev) : ton navigateur s'y connecte directement, sans envoyer d'information personnelle.",
            "Selon l'adresse utilisée, le site est servi par GitHub Pages (GitHub, Inc.) ou Firebase Hosting (Google LLC). Comme tout hébergeur, ils peuvent enregistrer des données techniques de connexion, comme l'adresse IP, selon leur propre politique de confidentialité.",
          ],
        },
        {
          titre: "Tes droits",
          paragraphes: [
            "Depuis « Réglages et données », tu exportes, importes ou effaces à tout moment les données de ton navigateur. Depuis ton compte, tu modifies ton nom, ton téléphone et ta photo.",
            "Pour obtenir une copie des données de ton compte ou demander sa suppression, écris à Méridien depuis le formulaire de contact. Les données liées aux paiements peuvent être conservées le temps exigé par les obligations comptables.",
          ],
        },
      ]}
    />
  );
}

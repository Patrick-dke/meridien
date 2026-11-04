# Indicateurs, robots et licences

Ce document décrit comment Méridien distribue ses outils : l'indicateur pour TradingView et l'Expert Advisor (robot) pour MetaTrader 5. Il couvre les données, le point d'accès de vérification, l'administration, les deux modes d'installation et les limites connues.

## Principes

- **Aucun mot de passe de trading**, jamais : ni mot de passe principal, ni mot de passe investisseur. Les formulaires n'en ont pas le champ, et le serveur rejette toute demande qui contient un champ de ce type.
- **La licence contrôle le logiciel, pas le compte.** Elle dit au robot s'il peut fonctionner sur un compte donné. Elle ne permet ni de lire le compte, ni de passer des ordres, ni de toucher aux fonds.
- **Aucun accès distant permanent.** L'installation accompagnée est une session ponctuelle que l'apprenant lance et ferme lui-même, avec son accord écrit (case cochée, enregistrée dans la demande).
- **Aucun prix dans le code.** Statut, modes d'accès et prix vivent dans la collection `catalogueOutils`, modifiés depuis l'administration (onglet Outils), chaque modification journalisée.
- **Pas de promesse d'automatisation impossible.** TradingView n'offre pas d'interface officielle pour ouvrir l'accès à un script privé : cet accès s'ouvre à la main.

## Données (Firestore)

| Collection | Contenu | Lecture | Écriture |
|---|---|---|---|
| `catalogueOutils/{id}` | Fiche publique : nom, catégorie, plateforme, résumé, fonctionnalités, conditions, statut, modes d'accès, prix (FCFA ou null), modules inclus, ordre, publié | tout le monde | fonction `admin` (`catalogue.enregistrer`, validé par zod) |
| `demandesOutils/{uid}_{outil}` | Demande : mode, identifiant TradingView **ou** comptes MT5 (numéro + serveur), mode d'installation, accord pour l'assistance, message, statut, note, licence créée | l'auteur, l'administration | fonctions `outils` et `admin` |
| `licences/{id}` | `uid`, `email`, `outil`, `cle`, `statut` (active, suspendue, revoquee), `comptes[]` (numero, serveur, ajouteLe), `maxComptes`, `activationAuto`, `activations`, `expireLe`, `telechargement`, `derniereVerification`, `creeLe`, `creePar`, `note` | le titulaire, l'administration | fonctions seulement |

Règles éprouvées par `npm run test:regles` (bloc « outils et licences »).

## Parcours

1. **Fiche.** L'administration crée ou modifie la fiche (onglet Outils). Une fiche « En préparation » ou « Suspendu » est visible mais fermée aux demandes ; « Disponible » ou « Sur demande » l'ouvre.
2. **Demande** (page `/outils/`, connecté). Modes possibles selon la fiche :
   - `etudiants` : éligibilité calculée par le serveur (tous les modules payants achetés, chaque quiz réussi au seuil fixé dans Paramètres, 80 % par défaut). C'est l'offre de fin de formation : indicateur et robot offerts.
   - `parcours` : outil inclus avec l'achat de certains modules (au moins un droit actif parmi `modulesInclus`).
   - `achat` : vente séparée. Tant que le paiement en ligne des outils n'est pas ouvert, la demande est enregistrée sans paiement, et l'administration n'accorde l'accès qu'après un paiement confirmé par une source fiable.
3. **Décision** (onglet Demandes d'accès).
   - Robot : « Accorder » crée la licence avec les comptes de la demande, la date de fin choisie et le nombre de comptes maximal. La clé apparaît dans le compte de l'apprenant (`/compte/#outils`).
   - Indicateur : l'administrateur ajoute d'abord l'identifiant dans TradingView (voir plus bas), puis accorde ; la date de fin est notée dans la demande.
4. **Gestion** (onglet Licences) : création à la main, suspension, réactivation, révocation définitive, nombre de comptes, date de fin, retrait d'un compte, nouvelle clé, lien de téléchargement du fichier `.ex5`. Chaque action exige un motif, inscrit au journal d'audit.

## Point d'accès de vérification

`POST https://europe-west1-meridien-academie.cloudfunctions.net/verifierLicence` (après déploiement des fonctions).

Entrée (JSON) :

```json
{ "cle": "MER-7KQ2-…", "compte": "51234567", "serveur": "MetaQuotes-Demo", "version": "1.0", "nonce": "aléa de 8 à 64 caractères" }
```

Réponse (toujours 200, sauf 405 hors POST et 429 au-delà de 60 vérifications par heure et par clé) :

```json
{ "valide": true, "raison": "ok", "cle": "…", "compte": "51234567", "nonce": "…", "horodatage": "2026-11-02T10:00:00.000Z", "expireLe": null, "message": "…", "signature": "hex" }
```

Raisons : `ok`, `inconnue`, `suspendue`, `revoquee`, `expiree`, `compte-non-autorise`, `requete-invalide`.

Signature : HMAC-SHA256, avec le secret `LICENCE_SIGNATURE`, de la chaîne
`valide(1|0) | raison | cle | compte | nonce | horodatage | expireLe (vide si null)`.

Le robot vérifie la signature, que le nonce est le sien, que le compte est le sien et que l'horodatage date de moins de 24 h. Sans réponse du serveur, il continue 72 h après la dernière vérification réussie (période de grâce), puis s'arrête.

**Activation automatique.** Pour une installation autonome, la licence porte `activationAuto: true` : au premier lancement sur un compte inconnu, le compte est ajouté s'il reste une place (`comptes.length < maxComptes`), et le compteur `activations` augmente. Au-delà, réponse `compte-non-autorise`.

## Les deux installations

| | Option B : autonome | Option A : accompagnée |
|---|---|---|
| Qui installe | L'apprenant, avec le guide | L'apprenant, guidé en direct |
| Reçu | Fichier `.ex5` + clé | Idem, plus un rendez-vous |
| Accès à l'ordinateur | Aucun | Session ponctuelle, lancée et fermée par l'apprenant, avec accord écrit |
| Mot de passe de trading | Jamais demandé | Jamais demandé ; l'apprenant le tape lui-même si MetaTrader le réclame |
| Comptes | Ajoutés au premier lancement, dans la limite | Ceux de la demande |
| Avantages | Rapide, aucune intervention, passe à l'échelle | Rassurant pour un débutant, moins d'erreurs de configuration |
| Limites | Demande d'autoriser l'URL dans MetaTrader (WebRequest) | Demande un créneau ; à limiter strictement à l'installation |

Les deux coexistent : le choix se fait dans la demande.

Guide d'installation autonome (à joindre au fichier) :

1. MetaTrader 5, Fichier, Ouvrir le dossier des données, puis `MQL5/Experts` : y copier le fichier `.ex5`.
2. Outils, Options, Expert Advisors : cocher « Autoriser le trading algorithmique » et « Autoriser WebRequest pour les URL listées », ajouter l'adresse de vérification.
3. Faire glisser le robot sur un graphique d'un compte **de démonstration**, coller la clé dans ses paramètres.
4. L'onglet Experts affiche le résultat de la vérification.

## TradingView : distribution sur invitation

- Publier l'indicateur en script **sur invitation** (« invite-only ») exige un abonnement TradingView payant (Premium au moment de la rédaction) et le respect des règles de publication de TradingView (description, pas de promesse de résultats). Cette dépense n'est pas engagée : décision à prendre par le responsable de Méridien.
- L'accès se gère à la main : page du script, « Manage access », ajout de l'identifiant, date de fin facultative. TradingView ne fournit pas d'API officielle pour automatiser cette étape ; les solutions non officielles demandent de désactiver la double authentification du compte, ce que Méridien s'interdit.
- Sources : billet TradingView sur l'expiration des accès aux scripts sur invitation (tradingview.com/blog/en/expiration-to-user-access-for-invite-only-scripts-18594) ; discussion des vendeurs sur l'absence d'API de gestion des accès (tradingview.com/chart/BTCUSDT/2Kfqz7TE-Revisiting-Automatic-Access-Management-API-for-Vendors).

## Côté MetaTrader 5

`outils/mt5/MeridienLicence.mqh` : vérification (WebRequest), HMAC-SHA256 recalculé (CryptEncode), contrôle du nonce et de l'heure, période de grâce. Usage dans le robot :

```mql5
#include "MeridienSecret.mqh"   // non versionné : #define MERIDIEN_SECRET "…même valeur que LICENCE_SIGNATURE…"
#include "MeridienLicence.mqh"
input string CleLicence = "";
bool autorise = false;

int OnInit()
  {
   string message;
   autorise = MeridienLicenceAutorisee(CleLicence, "1.0", message);
   Print("Licence Méridien : ", message);
   EventSetTimer(6 * 3600);   // nouvelle vérification toutes les 6 heures
   return INIT_SUCCEEDED;
  }
void OnTimer() { string m; autorise = MeridienLicenceAutorisee(CleLicence, "1.0", m); if(!autorise) Print(m); }
void OnTick()  { if(!autorise) return; /* … logique du robot … */ }
```

**État : non compilé ni testé** (MetaTrader 5 n'est pas disponible dans l'environnement de développement). Le serveur, lui, est testé : `npm run test:fonctions` (fichier `tests/fonctions/outils.test.ts`) vérifie la signature exactement comme le robot doit la recalculer.

## Limites, à dire franchement

- Le secret de signature est compilé dans le robot. Un fichier `.ex5` se décompile difficilement, mais une personne déterminée peut l'extraire ou modifier le robot pour sauter la vérification. La licence décourage le partage ordinaire ; elle ne rend pas le logiciel incassable.
- La période de grâce s'appuie sur une variable globale du terminal, modifiable par l'utilisateur.
- Un changement de secret impose de recompiler et redistribuer le robot.

## Mise en service (étapes du responsable)

Rien de ceci n'est fait : chaque étape demande son accord.

1. Offre Blaze de Firebase et déploiement des fonctions (déjà requis pour les paiements).
2. Secret : `firebase functions:secrets:set LICENCE_SIGNATURE` (valeur longue et aléatoire), puis la même valeur dans `MeridienSecret.mqh`, hors du dépôt.
3. Compiler le robot avec `MeridienLicence.mqh`, l'éprouver sur un compte de démonstration (clé valide, compte refusé, licence suspendue, réseau coupé).
4. Héberger le fichier `.ex5` (lien privé), le renseigner dans la licence (« Lien du fichier »).
5. Pour l'indicateur : abonnement TradingView permettant la publication sur invitation, publication du script.
6. Passer les fiches au statut « Disponible » ou « Sur demande » dans l'administration.

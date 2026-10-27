# Méridien, académie commerciale : architecture, environnements, mise en service

Ce document décrit ce qui a été construit pour vendre les formations, ce qui est **vérifié en simulation**, et ce qui **reste à faire en production** (étapes qui demandent ton intervention).

## 1. Ce qui est vérifié, et où

| Élément | Environnement de test (émulateurs, paiements simulés) | Production |
| --- | --- | --- |
| Comptes e-mail + mot de passe, vérification de l'adresse, mot de passe oublié | Vérifié (navigateur + tests automatiques) | Non activé : application web Firebase à enregistrer, fournisseurs d'authentification à activer |
| « Continuer avec Google » | Code prêt ; non testable dans l'émulateur sans fenêtre Google | Non activé (domaines autorisés à déclarer) |
| Prix en base, grille 10 000 FCFA par niveau | Vérifié | Base Firestore à créer |
| Contenus payants protégés côté serveur | Vérifié : règles Firestore (14 tests) + parcours complet ; contrôle de fuite du site publié : aucune | Base, règles et publication des contenus à faire |
| Paiement Mobile Money (Orange Money, MTN MoMo) | **Simulation uniquement** : réussite, échec, expiration, idempotence, anti-doublon, webhook authentifié, relecture du statut auprès du prestataire | **Aucun paiement réel n'a été effectué.** Adaptateur Fapshi écrit d'après sa documentation, jamais appelé (pas de compte ni de clés) |
| Quiz notés par le serveur, certificats | Vérifié | Fonctions à déployer (offre Blaze) |
| Administration, journal d'audit | Vérifié | Fonctions à déployer, premier administrateur à désigner |
| Outils MT5 : éligibilité et demandes | Vérifié (calcul d'éligibilité, demande, traitement) | Fichiers des outils à remettre par l'équipe après accord |
| Narration des 106 capsules payantes | Produite (Piper, voix locale) ; vérification Whisper : voir `.outils/voix/verification-prives.log` | Publiée avec les contenus |

**Ne présente pas la simulation comme une intégration financière opérationnelle** : tant que l'étape 5 de la section 6 n'est pas faite et vérifiée par un vrai paiement de faible montant, l'encaissement Mobile Money n'existe pas en production. Le site l'affiche : « Le paiement en ligne ouvre très bientôt ».

## 2. Architecture

- **Site** : Next.js exporté en statique (GitHub Pages et Firebase Hosting). Il ne contient **aucun** contenu payant ni aucun prix. Le SDK Firebase n'est chargé que sur les pages qui en ont besoin (compte, quiz, paiement, chapitre payant) ; les prix sont lus par l'API REST de Firestore.
- **Firebase Authentication** : e-mail + mot de passe (sans SMS) et Google. Un compte par adresse ; aucune fusion automatique : si l'adresse existe déjà avec un mot de passe, l'utilisateur se connecte d'abord, puis associe Google depuis « Mon compte → Paramètres du profil ».
- **Firestore** (règles : `firestore.rules`) :

| Collection | Contenu | Lecture | Écriture |
| --- | --- | --- | --- |
| `modules` | titre, rang, prix (FCFA), publié | publique | serveur (administration) |
| `parametres/public` | paiements ouverts, contact publié | publique | serveur |
| `parametres/paiement`, `outils`, `contact` | compte bénéficiaire, conditions MT5, canaux | personne (serveur seul) | serveur |
| `utilisateurs/{uid}` | nom, e-mail, téléphone, photo, statut | propriétaire | propriétaire (coordonnées seulement) |
| `progressions/{uid}` | progression d'apprentissage | propriétaire | propriétaire |
| `commandes`, `transactions` | Utilisateur → Commande → Transaction | propriétaire | serveur |
| `droits/{uid}_{module}` | droit d'accès (module acheté) | propriétaire | serveur |
| `contenus`, `narrations` | chapitres payants, audio | titulaire d'un droit actif | administration |
| `corriges` | réponses des quiz | administration | administration |
| `evaluations`, `certificats` | résultats officiels | propriétaire (certificat : par numéro) | serveur |
| `journalAudit` | qui a fait quoi, quand, pourquoi | administration | serveur, **ajout seul** |

- **Fonctions serveur** (`functions/`, région europe-west1) : `etatPaiement`, `initierPaiement`, `verifierPaiement`, `webhookPaiement`, `reconcilier` (toutes les 10 min), `noterQuiz`, `outils`, `envoyerMessage`, `revendiquerAdmin`, `deconnecterPartout`, `admin` (point d'entrée unique de l'administration, rôle vérifié à chaque appel).

### Garanties de paiement

1. Le navigateur n'annonce jamais un paiement réussi : il demande au serveur, qui interroge le prestataire.
2. Le webhook est authentifié (secret partagé, comparaison en temps constant), puis le statut est **relu** auprès du prestataire : le contenu du message ne suffit jamais.
3. Idempotence : une clé par essai ; un double clic ou une reconnexion renvoie la même transaction. Anti-doublon : un paiement en attente pour le même module bloque une nouvelle demande pendant 10 minutes.
4. Le montant confirmé doit être exactement celui de la commande, sinon rien n'est débloqué et une anomalie est signalée.
5. Aucun statut final n'est écrasé ; une contradiction devient une anomalie à traiter dans l'administration.
6. Résolution contrôlée : un administrateur peut accorder l'accès pour un paiement litigieux, avec un motif et la référence de l'opération ; la décision s'ajoute à l'historique, qui n'est jamais réécrit.
7. Le code secret Mobile Money n'est jamais demandé : il se saisit dans la fenêtre de l'opérateur.
8. Un bac à sable branché sur le site réel ne sert qu'aux administrateurs, et les droits qu'il crée sont marqués « test ».

### Limites connues (assumées)

- Un acheteur reçoit le chapitre complet, quiz compris, pour la correction immédiate : il pourrait lire les réponses dans le trafic réseau. Le résultat **officiel** (certificat, outils MT5) est recalculé par le serveur avec le corrigé qu'il détient, avec au plus 8 essais par heure et par chapitre. Les outils MT5 restent soumis à l'accord d'un administrateur.
- Le prestataire choisi (Fapshi) n'offre ni idempotence ni signature cryptographique des webhooks : d'où la relecture systématique du statut et le rapprochement périodique.

## 3. Environnements

| | Test | Production |
| --- | --- | --- |
| Projet Firebase | `demo-meridien` (fictif, émulateurs locaux) | `meridien-academie` |
| Site | `NEXT_PUBLIC_EMULATEURS=1 npm run build` | `npm run build` avec `NEXT_PUBLIC_FIREBASE_*` |
| Paiement | `PAIEMENT_FOURNISSEUR=simulation` (refusé hors émulateurs) | `fapshi` (sandbox puis live) |
| Bandeau | « Environnement de test : aucun argent réel » | aucun |

Numéros de test (simulation et bac à sable Fapshi) : se terminant par 0 ou 2 → réussi ; par 1 ou 3 → échoué ; 6xxxxxx09 → expiré (simulation seulement).

### Commandes

```bash
npm run test:regles        # règles Firestore (émulateur)
npm run test:fonctions     # parcours complet côté serveur (émulateurs)
npm run e2e:emulateurs     # parcours commercial dans le navigateur (site construit dans out-test/)
npm run contenus:preparer  # fichier de publication des contenus payants (dossier prive/ requis)
npm run verifier:fuites    # aucun contenu payant dans le site exporté
npm run voix -- prives     # narration des capsules payantes (audio dans prive/, jamais dans public/)
```

Java 21 (Temurin) est nécessaire pour l'émulateur Firestore. Sur cette machine : `C:\Program Files\Eclipse Adoptium\jre-21.0.12.101-hotspot\bin`. Les comptes fictifs de test sont dans `scripts/emulateurs/comptes.ts`.

### Contenus payants

Les sources sont dans `prive/` (106 chapitres, 7 modules), **ignoré par git** : elles ne sont ni dans le dépôt public ni dans le site. À conserver dans un dépôt **privé** ou une sauvegarde (voir étape 8). Publication : `npm run contenus:preparer`, puis **Administration → Contenus → Publier un fichier**.

## 4. Coûts et limites des offres gratuites

Ordres de grandeur relevés au moment de la conception (à revérifier sur les pages de tarifs avant la mise en service).

| Service | Gratuit | Au-delà / remarque |
| --- | --- | --- |
| Firebase Hosting | 10 Go stockés, 360 Mo/jour transférés | Le site actuel tient largement |
| Authentication (e-mail, Google) | inclus | Pas de SMS (payant) : aucun SMS n'est utilisé |
| Firestore | 1 Gio stocké ; 50 000 lectures, 20 000 écritures, 20 000 suppressions par jour ; 10 Gio/mois de sortie | Une capsule audio fait ≈ 300 à 450 Ko : ≈ 20 000 écoutes/mois dans la sortie gratuite |
| Cloud Functions (offre Blaze obligatoire) | 2 millions d'appels/mois, 400 000 Go-s, 200 000 s de processeur | Carte bancaire exigée ; à cette échelle, le coût attendu est nul ou de quelques centimes |
| Cloud Scheduler (rapprochement) | 3 tâches par compte de facturation | 1 tâche utilisée |
| Secret Manager | 6 versions de secrets actives, 10 000 accès/mois | 3 secrets |
| Artifact Registry (images des fonctions) | 0,5 Go | Activer la politique de nettoyage proposée au déploiement |
| Fapshi | pas d'abonnement ni de frais d'ouverture | ≈ 3 % par encaissement, retraits vers Mobile Money sans frais (à confirmer dans ton contrat) |

**Recommandation** : en passant à Blaze, crée une **alerte de budget** (par exemple 5 €/mois) dans la console Google Cloud.

Alternatives étudiées : CamPay (≈ 2 % à l'encaissement, 1 % au retrait), Notch Pay, CinetPay (≈ 2 % MTN, 2,2 % Orange). L'adaptateur de prestataire est isolé (`functions/src/paiement/fournisseurs.ts`) : en ajouter un ne touche ni au site ni aux règles.

## 5. Administration

- **Premier administrateur** : renseigner `ADMIN_EMAILS` (configuration serveur), se connecter avec cette adresse vérifiée, ouvrir `/admin/` et cliquer « Activer mon accès administrateur » (refusé pour toute adresse non listée). Les suivants se nomment depuis Administration → Utilisateurs.
- **Modules et prix** : Administration → Modules et prix. « Créer les modules manquants » applique la grille initiale (niveau 2 = 10 000 FCFA, puis +10 000 par niveau) aux seuls modules absents. Chaque changement de prix exige un motif et s'inscrit au journal.
- **Paiements → Compte bénéficiaire** : prestataire, opérateur, nom du titulaire, compte marchand, numéro de retrait, statut. Ces données restent côté serveur. Les clés d'API, elles, sont dans Secret Manager, jamais en base ni dans le site.
- **Contact** : aucune coordonnée n'est affichée tant qu'elle n'est pas saisie. Le canal WhatsApp Business est prévu dans `functions/src/contact.ts` (non connecté : il faut un numéro professionnel validé par Meta et un jeton d'API).

## 6. Mise en service : étapes qui demandent ton intervention

Chaque étape est réversible sauf mention contraire. Je ne les ai pas faites : elles touchent ton compte, ta sécurité, ton argent ou la publication commerciale.

1. **Publier la version commerciale du site** (GitHub Pages et Firebase Hosting). Sans les étapes suivantes, elle montre les modules verrouillés, « prix bientôt annoncé » et « comptes bientôt disponibles » ; « Premiers pas » reste entièrement libre.
2. **Enregistrer l'application web Firebase** (`firebase apps:create WEB "Meridien Web"`), puis renseigner `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` et `NEXT_PUBLIC_FIREBASE_APP_ID` (configuration publique par nature) pour le build et la CI.
3. **Activer l'authentification** : console Firebase → Authentication → fournisseurs **E-mail/Mot de passe** et **Google**. Ajouter `patrick-dke.github.io` aux domaines autorisés. Choisir l'adresse d'assistance de l'écran de consentement Google.
4. **Créer la base Firestore** (emplacement définitif : `eur3` ou `europe-west1`, **irréversible**), puis `firebase deploy --only firestore` (règles et index).
5. **Passer à l'offre Blaze** (carte bancaire, alerte de budget), puis :
   ```bash
   firebase functions:secrets:set FAPSHI_API_USER
   firebase functions:secrets:set FAPSHI_API_KEY
   firebase functions:secrets:set FAPSHI_WEBHOOK_SECRET
   firebase deploy --only functions
   ```
   Dans `functions/.env.meridien-academie` : `ADMIN_EMAILS=<ton adresse>`, puis `PAIEMENT_FOURNISSEUR=fapshi` avec `FAPSHI_ENV=sandbox` pour les essais.
6. **Ouvrir un compte marchand Fapshi** (vérification d'identité avec une pièce camerounaise, ≈ 48 h) ; récupérer les identifiants d'API du bac à sable, déclarer l'URL du webhook (`https://europe-west1-meridien-academie.cloudfunctions.net/webhookPaiement`) et son secret. Faire des essais avec les numéros de test, en administrateur.
7. **Passer en production** : demander à Fapshi l'activation du paiement direct (sinon `FAPSHI_MODE=lien`), passer `FAPSHI_ENV=live`, redéployer, faire **un vrai paiement de faible montant** depuis ton propre téléphone, vérifier le reçu, l'accès et le journal. Seulement ensuite : Administration → Paramètres → « Paiements ouverts au public ».
8. **Sauvegarder `prive/`** dans un dépôt GitHub **privé** (ou une sauvegarde chiffrée), puis publier les contenus depuis l'administration.

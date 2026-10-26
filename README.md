# Méridien — Académie de trading

Plateforme d'apprentissage du trading, gratuite et sans compte : apprendre à lire les marchés avec méthode, sans argent réel et sans promesse de gains.

## Ce que contient le site

- **Parcours « Premiers pas »** : 14 chapitres complets (marchés, formation des prix, chandeliers, unités de temps, ordres, stop loss, coûts, pips et lots, levier, taille de position, espérance). Chaque chapitre est une suite de leçons : introduction, capsule narrée de 90 secondes au plus, cours dévoilé notion par notion, illustrations explorables, exemple, erreurs fréquentes, résumé en cartes, quiz corrigé, validation.
- **Capsules narrées** : voix de synthèse produite localement (Piper), animations et sous-titres synchronisés sur la voix à la phrase près, transcription cliquable, vitesse, son, plein écran.
- **Catalogue en cartes** filtrable par niveau, marché, stratégie, durée et avancement ; les chapitres fondamentaux valent pour tous les marchés.
- **5 académies** (120 chapitres prévus) ; seuls les chapitres publiés s'ouvrent.
- **Badges de fiabilité** sur chaque bloc : fait établi, calcul, convention, interprétation d'école, hypothèse, résultat mesuré.
- **Quiz** à 5 types de questions, notés par concept ; **maîtrise** par concept et **recommandations** par règles explicites.
- **Glossaire** de 55 termes, cliquables dans les cours ; **recherche** globale (Ctrl+K).
- **Calculateurs** : taille de position, rendement/risque avec frais, pips, espérance et probabilité de séries de pertes.
- **Tableau de bord** : parcours, semaine d'apprentissage, résultats aux quiz, carte des compétences, activité récente, favoris et notes ; export et import de la progression.
- **Identité « Observatoire »** : accueil en 3D (three.js, chargé à la demande), cartes interactives, transitions de page et d'étape, tout respectant « réduire les animations » et le mode léger.
- **Accessibilité** (WCAG 2.2 AA vérifiée par axe), palette daltonien, mode léger, **application installable** et lecture hors ligne.

La progression est enregistrée dans le navigateur (localStorage) : aucun compte, aucun cookie, aucun traceur.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000
```

## Vérifier

```bash
npm run check        # types, lint, tests unitaires et de contenu (Vitest)
npm run build        # export statique dans out/
npm run e2e          # parcours, outils et accessibilité (Playwright), sur ordinateur et mobile
```

Les tests de contenu valident chaque chapitre (schéma, termes du glossaire, concepts, scènes, corrigés, rythme des capsules) et recalculent les chiffres cités dans les cours.

## Narration des capsules

La voix est produite sur la machine, sans service en ligne, avec [Piper](https://pypi.org/project/piper-tts/) et la voix `fr_FR-siwis-medium` (corpus SIWIS, CC BY 4.0). Chaque phrase est synthétisée à part : son minutage est exact, et les animations comme les sous-titres se calent dessus.

Mise en place, une fois :

```bash
python -m venv .outils/voix-env
.outils/voix-env/Scripts/python -m pip install piper-tts
cd .outils/voix && ../voix-env/Scripts/python -m piper.download_voices fr_FR-siwis-medium
```

Après toute modification du texte d'une capsule (les tests le signalent : « narration périmée ») :

```bash
npm run voix        # ffmpeg doit être dans le PATH, ou indiqué par la variable FFMPEG
```

Le script écrit `public/audio/capsules/<slug>.mp3` (MP3 mono 48 kbit/s, volume normalisé) et `src/content/narration/<slug>.json` (minutage). `scripts/voix/verifier.py` contrôle chaque piste : flux, durée, volume, et retranscription Whisper comparée au texte.

## Mesurer les performances

```bash
npm run build
LIGHTHOUSE_DIR=<dossier où lighthouse est installé> npm run mesurer -- <libellé>
```

Lighthouse sur cinq pages (mobile et ordinateur), puis images par seconde et délais d'interaction sur un processeur ralenti 4×. Résultats dans `docs/mesures/`.

## Structure

```text
src/app/                 pages (export statique)
src/content/             catalogue, chapitres, concepts, glossaire, scènes de figures, schéma zod
src/components/          interface : lecteur de chapitre, capsule, quiz, figures (ChartKit), outils
src/lib/                 calculs de trading, notation, maîtrise, progression, recherche, narration
src/content/narration/   minutage des capsules narrées (généré)
public/audio/capsules/   narrations (générées)
scripts/voix/            production et vérification de la narration
scripts/mesurer.mjs      mesures de performances
e2e/                     tests de bout en bout
public/sw.js             service worker (hors ligne)
```

## Ajouter un chapitre

1. Créer `src/content/chapitres/NN-slug.ts` en suivant le schéma `Chapitre` (`src/content/schema.ts`), avec `statut: "brouillon"`.
2. L'ajouter à `tousLesChapitres` dans `src/content/index.ts` ; le slug doit exister dans `src/content/catalogue.ts`.
3. `npm test` signale toute incohérence. Passer le statut à `"publie"` après relecture.

## Publication

Première mise en ligne, après avoir créé un dépôt GitHub vide nommé `meridien` :

```bash
powershell -ExecutionPolicy Bypass -File scripts/publier-github.ps1
```

Le script envoie `main`, construit le site sous le sous-chemin `/meridien` et l'envoie sur la branche `gh-pages`. Dans Settings → Pages, la source doit être « Deploy from a branch », branche `gh-pages`, dossier racine. Le site est alors servi sur https://patrick-dke.github.io/meridien/.

Une copie identique est servie à la racine de https://meridien-academie.web.app (Firebase Hosting, projet `meridien-academie`), pour les visiteurs dont le fournisseur d'accès bloque `github.io`. Elle se met à jour à la main, après chaque envoi sur `main` :

```bash
powershell -ExecutionPolicy Bypass -File scripts/publier-firebase.ps1
```

Ensuite, chaque envoi sur `main` passe par le workflow `.github/workflows/verifier-et-publier.yml`, qui vérifie tout (types, lint, tests unitaires, construction, tests de bout en bout et d'accessibilité) puis republie `gh-pages`. Le site étant statique, il se déploie aussi tel quel sur Netlify, Vercel, Cloudflare Pages ou Firebase Hosting.

## Avertissement

Méridien est un outil pédagogique. Il ne fournit ni conseil en investissement, ni signal. Le trading comporte un risque élevé de perte en capital.

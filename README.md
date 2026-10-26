# Méridien — Académie de trading

Plateforme d'apprentissage du trading, gratuite et sans compte : apprendre à lire les marchés avec méthode, sans argent réel et sans promesse de gains.

## Ce que contient la version 1

- **Parcours « Premiers pas »** : 14 chapitres complets (marchés, formation des prix, chandeliers, unités de temps, ordres, stop loss, coûts, pips et lots, levier, taille de position, espérance). Chaque chapitre suit 10 étapes : introduction, capsule animée sous-titrée, cours, illustrations, exemple, erreurs fréquentes, résumé, quiz corrigé, validation.
- **Catalogue complet** des 5 académies (120 chapitres prévus) ; seuls les chapitres publiés s'ouvrent.
- **Badges de fiabilité** sur chaque bloc : fait établi, calcul, convention, interprétation d'école, hypothèse, résultat mesuré.
- **Quiz** à 5 types de questions, notés par concept ; **maîtrise** par concept et **recommandations** par règles explicites.
- **Glossaire** de 55 termes, cliquables dans les cours ; **recherche** globale (Ctrl+K).
- **Calculateurs** : taille de position, rendement/risque avec frais, pips, espérance et probabilité de séries de pertes.
- **Tableau de bord**, favoris, notes, export et import de la progression.
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

## Structure

```text
src/app/                 pages (export statique)
src/content/             catalogue, chapitres, concepts, glossaire, scènes de figures, schéma zod
src/components/          interface : lecteur de chapitre, capsule, quiz, figures (ChartKit), outils
src/lib/                 calculs de trading, notation, maîtrise, progression, recherche
e2e/                     tests de bout en bout
public/sw.js             service worker (hors ligne)
```

## Ajouter un chapitre

1. Créer `src/content/chapitres/NN-slug.ts` en suivant le schéma `Chapitre` (`src/content/schema.ts`), avec `statut: "brouillon"`.
2. L'ajouter à `tousLesChapitres` dans `src/content/index.ts` ; le slug doit exister dans `src/content/catalogue.ts`.
3. `npm test` signale toute incohérence. Passer le statut à `"publie"` après relecture.

## Publication

Le workflow `.github/workflows/verifier-et-publier.yml` vérifie tout puis publie `out/` sur la branche `gh-pages` (GitHub Pages, sous-chemin `/meridien`). Le site étant statique, il se déploie aussi tel quel sur Netlify, Vercel ou Cloudflare Pages.

## Avertissement

Méridien est un outil pédagogique. Il ne fournit ni conseil en investissement, ni signal. Le trading comporte un risque élevé de perte en capital.

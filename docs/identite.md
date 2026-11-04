# Identité « Papier et encre » et discours

Référence pour toute nouvelle page : apparence, mouvement et ton des textes. Les valeurs vivent dans `src/app/globals.css` ; ce document dit comment s'en servir.

## Principes

- Une page de livre ou de journal financier, pas un tableau de bord : du papier, de l'encre, des filets fins.
- La couleur sert à signifier (état, accent, graphique), jamais à décorer.
- Pas de pastilles arrondies ni de badges colorés. Un état s'écrit en petites capitales (`.surtitre`) ou avec la `Puce`, une étiquette à angles de 3 px.
- Chaque illustration explique quelque chose. Une image décorative n'a pas sa place.

## Couleurs (jetons)

| Jeton                               | Clair                           | Sombre                          | Usage                                         |
| ----------------------------------- | ------------------------------- | ------------------------------- | --------------------------------------------- |
| `--bg`, `--bg-2`                    | `#f4f2ed`, `#ebe8e1`            | `#0f0f0d`, `#141412`            | Fond de page, bandes                          |
| `--surface`, `--surface-2`          | `#fbfaf7`, `#efece5`            | `#181815`, `#201f1c`            | Cartes, survols                               |
| `--ink`, `--ink-2`, `--ink-3`       | `#17160f`, `#47433a`, `#686356` | `#edebe4`, `#b6b2a6`, `#8f8b7f` | Texte : principal, courant, secondaire        |
| `--line`, `--line-strong`           | `#dcd7cc`, `#bfb8a8`            | `#2c2b26`, `#44423a`            | Filets                                        |
| `--brand`                           | `#24467d`                       | `#9fbbea`                       | Liens, focus, informations                    |
| `--brand-solid`                     | `#17160f`                       | `#edebe4`                       | Bouton principal, bande sombre                |
| `--accent`                          | `#e9a320`                       | `#f0b232`                       | Repère safran : un seul par écran             |
| `--jauge`                           | `#c98710`                       | `#f0b232`                       | Coches, progression                           |
| `--cyan`                            | `#1b6874`                       | `#63c4cf`                       | Surtitres de compte, « en cours »             |
| `--ok`, `--warn`, `--bad`, `--info` |                                 |                                 | États : réussi, attention, échec, information |

Le mode sombre est défini deux fois : sous `prefers-color-scheme: dark` et sous `:root[data-theme="dark"]`. Tout nouveau jeton doit avoir ses deux valeurs.

## Typographie

- **Titres :** Newsreader (`--font-display`). Le mot mis en valeur passe en italique avec `.accent`, sans autre couleur.
- **Texte :** IBM Plex Sans.
- **Chiffres, surtitres, code :** IBM Plex Mono, avec `tabular-nums` pour les colonnes de chiffres.
- **Typographie française :** toujours via `typographie()`. Elle pose les espaces insécables avant `: ; ? !` et dans les guillemets.

## Composants de base

| Classe                                                                    | Rôle                                                            |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `.surtitre`                                                               | Petites capitales au-dessus d'un titre, pour situer une section |
| `.btn` + `.btn-primaire`, `.btn-secondaire`, `.btn-discret`, `.btn-grand` | Boutons ; un seul bouton principal par bloc                     |
| `.lien`                                                                   | Lien souligné dans le texte                                     |
| `.carte` (+ `.eleve`)                                                     | Bloc encadré : achat, formulaire                                |
| `.champ`                                                                  | Champ de formulaire                                             |
| `.filet`                                                                  | Filet de section avec le repère safran                          |
| `.depliant`                                                               | `<details>` animé (programme des formations)                    |
| `.squelette`                                                              | Emplacement en cours de chargement                              |

## Mouvement

- `.revele` et `.revele-gauche` font apparaître les blocs au défilement, avec les animations liées au défilement.
- `TransitionsVue` lie les titres entre pages par `viewTransitionName`, par exemple `module-<id>` ou `chapitre-<slug>`.
- Tout mouvement s'arrête sous `prefers-reduced-motion`.
- Les appareils modestes gardent une page complète et lisible sans animation.

## Discours

Le ton est positif et motivant : on parle de curiosité, de progression, de compétences et d'autonomie. Il n'est jamais alarmiste et jamais mensonger. Le site tutoie.

**Ce que dit un texte commercial :**

- ce que l'apprenant saura faire, et où il l'apprend, avec un lien vers la page réelle ;
- comment essayer avant de payer : Premiers pas est gratuit en entier, le compte d'entraînement utilise un solde fictif ;
- des tarifs et des conditions clairs : paiement unique, accès sans limite de durée.

**Ce qu'il ne dit jamais :**

- une promesse de gain, de rendement ou de taux de réussite ;
- un revenu « facile », « automatique » ou « garanti » ;
- un témoignage, un avis, un chiffre d'utilisateurs ou un compteur inventés ;
- une fonction qui n'existe pas, ou une simulation présentée comme réelle ;
- « abonnement » ou « souscription ». Les mots du site sont : formation, module, parcours, accès, débloquer, acheter, tarif.

**Appels à l'action :** des verbes courts et concrets, par exemple :

- « Commencer mon parcours » ;
- « Découvrir le programme » ;
- « Débloquer ce module » ;
- « Essayer le compte d'entraînement » ;
- « Explorer les outils ».

**Où vivent les avertissements.** Ils ne remplissent pas les premières sections d'une page commerciale, mais ils restent faciles à trouver :

| Où                                                                          | Forme                                                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Pied de page, sur toutes les pages                                          | Paragraphe « Risques » complet                                                                     |
| Barre latérale                                                              | Lien « Avertissement sur les risques »                                                             |
| `/legal/risques/`, `/legal/conditions/`                                     | Texte intégral                                                                                     |
| Accueil, section « Ce qui guide Méridien »                                  | « Le risque, appris en premier », avec lien                                                        |
| Catalogue, conditions d'accès ; bloc d'achat d'un module ; page de paiement | Liens vers les conditions de vente et les risques                                                  |
| Page Outils et fiches des outils                                            | Conditions d'utilisation et avertissement complet (démonstration d'abord, aucun rendement garanti) |
| Chapitres sur le risque, le compte démo et le passage au réel               | Dans le cours lui-même                                                                             |

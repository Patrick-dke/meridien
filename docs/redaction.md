# Cahier de rédaction des chapitres

Ce cahier s'applique à tout nouveau chapitre de Méridien. Il complète le schéma `src/content/schema.ts` (type `Chapitre`) et les chapitres existants de `src/content/chapitres/` (le modèle : `09-stop-loss-take-profit.ts`).

## Public, ton, langue

- Apprenants francophones, débutants à intermédiaires, souvent au Cameroun, sur téléphone. Tutoiement, phrases courtes, un exemple concret par idée.
- Typographie française : guillemets « », apostrophes droites acceptées, nombres avec virgule décimale (« 1,5 % »), espace avant « : ; ? ! » (l'affichage la gère).
- Montants d'exemple en euros, dollars ou FCFA, toujours sur des **données synthétiques** ou des cas d'école. Jamais de performance réelle inventée, jamais de « taux de réussite » chiffré sans source, jamais de promesse de gain.

## Honnêteté : badges de fiabilité

Chaque bloc de cours (`p`, `liste`, `encadre`, `formule`, `tableau`, `figure`) peut porter `fiabilite` :

| Valeur | Quand l'utiliser |
| --- | --- |
| `fait` | Définition ou mécanisme vérifiable (fonctionnement d'un ordre, d'un marché) |
| `calcul` | Résultat mathématique exact (vérifie chaque chiffre) |
| `convention` | Usage répandu d'analyse, pas une loi du marché |
| `ecole` | Lecture propre à une école (SMC, ICT, certaines figures chartistes) |
| `hypothese` | Règle de stratégie à tester avant d'y croire |
| `mesure` | Résultat mesuré avec source traçable — **à ne pas utiliser** sans rapport de mesure |

Les notions SMC et ICT sont des **interprétations d'école** : formulations au conditionnel, présentation de ce qui est observable sur un graphique, critiques et contre-exemples, et ce qu'il faudrait mesurer pour les valider.

## Structure obligatoire d'un chapitre

| # | Partie | Champ du schéma | Exigence |
| --- | --- | --- | --- |
| 1 | Introduction | `intro` | 2 à 4 phrases : pourquoi ce chapitre compte |
| 2 | Objectifs | `objectifs` | 2 à 5 objectifs observables (« Identifier… », « Calculer… ») |
| 3 | Cours détaillé | `cours` | 3 à 5 sections, 2 à 5 blocs chacune ; définitions à la première occurrence, avec `[[slug-du-terme|texte]]` |
| 4 | Vidéo (capsule narrée) | `capsule` | 5 à 8 scènes, **45 à 85 s au total**, au plus 3 mots par seconde de scène |
| 5 | Exemples pratiques | `exemple` | Un cas complet, chiffré ou commenté pas à pas (jamais `null` pour un nouveau chapitre) |
| 6 | Illustrations | `illustrations` | 1 à 3 figures (`type: "figure"`) avec légende précise |
| 7 | Erreurs fréquentes | `erreurs` | 2 à 4 erreurs, chacune expliquée |
| 8 | Résumé | `resume` | 3 à 6 points à retenir |
| 9 | Exercices | `exercices` | **2 exercices** : de préférence un `graphique` ou un `calcul`, plus un autre |
| 10 | Quiz | `quiz` | 5 ou 6 questions, au moins 3 types différents |

Autres champs : `statut: "publie"`, `misAJour: "2026-10-27"`, `niveau` (1 à 5, selon la difficulté), `dureeMin` (8 à 20), `academie` et `module` = ceux du catalogue (`src/content/catalogue.ts`), `concepts` (1 à 3 identifiants), `prerequis` (identifiants de concepts).

### Exemple de plan : « Le MSS » (Smart Money Concepts)

Définition ; contexte (où il apparaît dans une structure) ; identification sur graphique ; différences avec BOS et CHoCH (tableau) ; confirmations proposées par l'école ; exemples et contre-exemple ; erreurs fréquentes ; capsule de 90 s au plus ; quiz ; exercice graphique (« touche la bougie qui confirme le MSS »).

## Capsule narrée

La capsule est lue par une voix de synthèse, puis animée en suivant la voix.

- Une seule notion. Structure conseillée : question d'accroche, explication, exemple, piège, phrase-bilan.
- Procédés : « question, pause, révélation » (une question en fin de scène, la réponse à la scène suivante) ; carte de règle en deux lignes au plus ; contraste répété (« le corps, pas la mèche »).
- `duree` de chaque scène entre 4 et 16 s, au moins 1 s par tranche de 3 mots du `texte`.
- Écrire pour l'oreille : pas d'abréviations obscures, pas de symboles isolés (« → », « ≈ ») ; les nombres s'écrivent normalement (« 1,5 % », « 2,20 euros ») : ils sont convertis pour la voix.
- Visuels : `titre` (titre + sous-titre), `points` (items courts), `formule`, `figure` (une scène de graphique et son `etape`). Une figure qui revient avec une `etape` plus grande fait apparaître de nouvelles bougies et annotations : c'est ainsi que l'on montre un mouvement qui se forme.

## Scènes de graphiques

Dans `prive/<module>/scenes.ts`, objet `scenes` : identifiant → scène. Préfixe obligatoire par module pour éviter les collisions (`mp-`, `rd-`, `at-`, `pa-`, `smc-`, `ict-`, `mm-`).

Une scène de chandeliers (`kind: "bougies"`, voir `src/lib/chartkit/types.ts` et les exemples de `src/content/scenes.ts`) :

- `bougies` : 12 à 40 bougies `{ o, h, l, c }` cohérentes (`h ≥ max(o, c)`, `l ≤ min(o, c)`). Utilise `depuisClotures` ou `marcheAleatoire` de `src/lib/chartkit/outils.ts` si utile, ou écris les valeurs.
- `decimales`, `description` (phrase lue par les lecteurs d'écran), `annotations` (`niveau`, `zone`, `fleche`, `repere`) avec `etape` pour une apparition progressive, et `revele` (bougies visibles à chaque étape).
- Les autres types (`anatomie`, `carnet`, `unites-de-temps`, `levier`, `seuil-rentabilite`, `series`) existent ; ne crée pas de nouveau type.
- Les données sont synthétiques : la figure le dit déjà à l'apprenant.

## Exercices

- `calcul` : `reponse` numérique, `tolerance` (au plus 5 % de la réponse), `unite`, `aide` facultative, `corrige` détaillé.
- `graphique` : `scene` de chandeliers, `etape` facultative, `bonnes` = indices (à partir de 0) des bougies à toucher, parmi celles affichées. La consigne dit exactement quoi chercher.
- `reflexion` : question ouverte ; le `corrige` donne la réponse attendue et les critères.
- Chaque exercice a `id` unique dans le module (`<préfixe>-<nn>-e<k>`) et `concepts`.

## Quiz

Types : `unique`, `multiple` (au moins une mauvaise réponse), `vraifaux`, `association` (3 à 5 paires), `ordre` (3 à 6 étapes, données dans le bon ordre). Identifiants `<préfixe>-<nn>-q<k>`. Chaque question a une `explication` qui apprend quelque chose, et des `concepts`.

## Concepts et glossaire (publics)

- `src/content/lots/<module>/concepts.ts` : 1 à 3 concepts par chapitre, `{ id, nom, chapitre, prerequis }`. Les `prerequis` ne citent que des concepts de « Premiers pas » (`src/content/concepts.ts`) ou de ton propre module.
- `src/content/lots/<module>/glossaire.ts` : un terme pour chaque `[[slug]]` cité qui n'existe pas déjà dans `src/content/glossaire.ts` ni dans un autre lot. Schéma `Terme` ; `voirAussi` ne cite que des slugs existants.

## Fichiers

- Un fichier par chapitre : `prive/<module>/chapitres/NN-slug.ts` exportant `export const chapitre: Chapitre = { … }` (import du type depuis `../../../src/content/schema`).
- `prive/<module>/index.ts` : importe chaque chapitre et les place dans `chapitres`, dans l'ordre du catalogue.
- Ne modifie aucun autre fichier.

## Vérification

```bash
LOT=<module> npx vitest run src/content/prive.test.ts
```

Le test doit passer : schéma, slugs du catalogue, concepts, termes, scènes, quiz, exercices, durée et débit des capsules.

## À ne jamais faire

- Recopier un cours, une vidéo, un livre ou un site : tout est rédigé avec tes propres mots et tes propres exemples.
- Inventer une statistique de marché, un taux de réussite ou un résultat de backtest.
- Présenter un concept d'école comme un fait, ou un modèle comme rentable.

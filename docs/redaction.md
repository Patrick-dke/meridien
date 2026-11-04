# Cahier de rédaction des chapitres

Ce cahier s'applique à tout nouveau chapitre de Méridien. Il complète le schéma `src/content/schema.ts` (type `Chapitre`) et les chapitres existants de `src/content/chapitres/` (le modèle : `09-stop-loss-take-profit.ts`).

## Public, ton, langue

- Apprenants francophones, débutants à intermédiaires, souvent au Cameroun, sur téléphone. Tutoiement, phrases courtes, un exemple concret par idée.
- Typographie française : guillemets « », apostrophes droites acceptées, nombres avec virgule décimale (« 1,5 % »), espace avant « : ; ? ! » (l'affichage la gère).
- Montants d'exemple en euros, dollars ou FCFA, toujours sur des **données synthétiques** ou des cas d'école. Jamais de performance réelle inventée, jamais de « taux de réussite » chiffré sans source, jamais de promesse de gain.

## Honnêteté : badges de fiabilité

Chaque bloc de cours (`p`, `liste`, `encadre`, `formule`, `tableau`, `figure`) peut porter `fiabilite` :

| Valeur       | Quand l'utiliser                                                                    |
| ------------ | ----------------------------------------------------------------------------------- |
| `fait`       | Définition ou mécanisme vérifiable (fonctionnement d'un ordre, d'un marché)         |
| `calcul`     | Résultat mathématique exact (vérifie chaque chiffre)                                |
| `convention` | Usage répandu d'analyse, pas une loi du marché                                      |
| `ecole`      | Lecture propre à une école (SMC, ICT, certaines figures chartistes)                 |
| `hypothese`  | Règle de stratégie à tester avant d'y croire                                        |
| `mesure`     | Résultat mesuré avec source traçable — **à ne pas utiliser** sans rapport de mesure |

Les notions SMC et ICT sont des **interprétations d'école** : formulations au conditionnel, présentation de ce qui est observable sur un graphique, critiques et contre-exemples, et ce qu'il faudrait mesurer pour les valider.

## Structure obligatoire d'un chapitre

| #   | Partie                 | Champ du schéma | Exigence                                                                                                 |
| --- | ---------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Introduction           | `intro`         | 2 à 4 phrases : pourquoi ce chapitre compte                                                              |
| 2   | Objectifs              | `objectifs`     | 2 à 5 objectifs observables (« Identifier… », « Calculer… »)                                             |
| 3   | Cours détaillé         | `cours`         | 3 à 5 sections, 2 à 5 blocs chacune ; définitions à la première occurrence, avec `[[slug-du-terme        | texte]]` |
| 4   | Vidéo (capsule narrée) | `capsule`       | 5 à 12 scènes, **60 à 120 s au total** (moins pour un point simple), au plus 3 mots par seconde de scène |
| 5   | Exemples pratiques     | `exemple`       | Un cas complet, chiffré ou commenté pas à pas (jamais `null` pour un nouveau chapitre)                   |
| 6   | Illustrations          | `illustrations` | 1 à 3 figures (`type: "figure"`) avec légende précise                                                    |
| 7   | Erreurs fréquentes     | `erreurs`       | 2 à 4 erreurs, chacune expliquée                                                                         |
| 8   | Résumé                 | `resume`        | 3 à 6 points à retenir                                                                                   |
| 9   | Exercices              | `exercices`     | **2 exercices** : de préférence un `graphique` ou un `calcul`, plus un autre                             |
| 10  | Quiz                   | `quiz`          | 5 ou 6 questions, au moins 3 types différents                                                            |

Autres champs : `statut: "publie"`, `misAJour: "2026-10-27"`, `niveau` (1 à 5, selon la difficulté), `dureeMin` (8 à 20), `academie` et `module` = ceux du catalogue (`src/content/catalogue.ts`), `concepts` (1 à 3 identifiants), `prerequis` (identifiants de concepts).

### Exemple de plan : « Le MSS » (Smart Money Concepts)

Définition ; contexte (où il apparaît dans une structure) ; identification sur graphique ; différences avec BOS et CHoCH (tableau) ; confirmations proposées par l'école ; exemples et contre-exemple ; erreurs fréquentes ; une à quatre capsules d'une à deux minutes (définition, identification, confirmations, exemple) ; quiz ; exercice graphique (« touche la bougie qui confirme le MSS »).

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

---

# Version 2 : enrichissement (cours plus visuels, quiz variés, narration naturelle)

Cette version s'applique à **tous** les chapitres existants. On enrichit, on ne réécrit pas ce qui est juste : garde les textes, calculs et scènes valides, et ajoute ce qui manque.

## Cibles par chapitre (contrôlées par `CIBLE=1`)

| Élément             | Cible                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Figures             | **au moins 4**, dont **au moins 2 dans le cours ou l'exemple**, placées juste après le paragraphe qu'elles illustrent              |
| Banque de quiz      | **10 à 12 questions** (les anciennes restent), dont **au moins 4 visuelles**                                                       |
| Questions visuelles | au moins **1 `graphique`** (toucher les bougies), et si le sujet s'y prête **1 `comparaison`** (A ou B) ; les autres avec `figure` |
| Étude de cas        | au moins **1 question avec `contexte`** (situation de marché chiffrée ou décrite)                                                  |
| Difficulté          | des questions de niveau **1, 2 et 3** (`difficulte`)                                                                               |
| Exercices           | 2 à 4, dont un `graphique` ou un `calcul` dans les modules techniques                                                              |
| Tirage              | ne mets pas `tirage` : 6 questions par tentative par défaut                                                                        |

Une figure doit **expliquer** : chaque annotation porte un nom (HH, BOS, stop, objectif, FVG…), la légende dit précisément quoi regarder. Pas d'image décorative.

## Nouveaux formats de questions

Tous les types gardent `id`, `enonce`, `explication` (qui apprend quelque chose), `concepts`, et acceptent `difficulte: 1 | 2 | 3`, `contexte` (étude de cas) et `figure: { scene, etape?, legende? }` (graphique à lire avant de répondre).

```ts
// Identification : toucher la ou les bougies (indices à partir de 0, parmi celles affichées à `etape`).
{ id: "smc-04-q7", type: "graphique", difficulte: 2, enonce: "Touche la bougie qui confirme le MSS (clôture sous le creux protégé).",
  scene: "smc-q-mss-a", bonnes: [14], explication: "…", concepts: ["smc-mss"] }

// Comparaison : deux graphiques, lequel répond à l'énoncé ?
{ id: "smc-06-q8", type: "comparaison", difficulte: 3, enonce: "Lequel montre une FVG haussière valide ?",
  graphiques: [{ scene: "smc-q-fvg-a" }, { scene: "smc-q-fvg-b" }], bonne: 1, explication: "…", concepts: ["smc-fvg"] }

// Question illustrée et étude de cas.
{ id: "rd-03-q9", type: "unique", difficulte: 2, contexte: "Compte de 300 000 FCFA, risque de 1 %, achat à 1 250, stop à 1 225.",
  figure: { scene: "rd-q-position", legende: "Entrée, stop et objectif prévus." },
  enonce: "Combien d'actions au maximum ?", choix: ["80", "120", "240", "12"], bonne: 1, explication: "…", concepts: ["rd-taille-position"] }
```

Règles :

- Une scène de question **ne montre jamais la réponse** : scène dédiée sans l'annotation révélatrice, ou `etape` antérieure à son apparition.
- Sa **description ne la dit pas non plus**. La description s'affiche en infobulle (`<title>`) et sert de texte aux lecteurs d'écran. Elle décrit ce qu'on voit, sans le calcul ni la conclusion demandés. Si la scène vient du cours, crée une copie à description neutre (`{ ...scenes["x"], description: "…" }`, en fin de `scenes.ts`) et fais pointer la question dessus. Contrôle : `npm run verifier:indices`, une heuristique qui signale les candidats à relire.
- `graphique` : la consigne dit exactement quoi toucher ; vérifie par script que la bonne bougie est **la seule** qui remplit la consigne (pas de deuxième candidat ambigu).
- `comparaison` : les deux graphiques sont plausibles ; la différence tient au critère enseigné, pas à un détail graphique.
- `multiple` : garde au moins une mauvaise réponse ; `unique` : 3 ou 4 choix de même longueur, sans « toutes les réponses ».
- Identifiants : `<préfixe>-<nn>-q<k>`, uniques dans le module (continue la numérotation existante).

## Nouvelles annotations de graphiques

En plus de `niveau`, `zone`, `fleche`, `repere` :

```ts
{ type: "ligne", de: { index: 3, prix: 101.2 }, a: { index: 18, prix: 104.8 }, label: "Tendance", couleur: "brand", style: "pointille" }
{ type: "courbe", points: [null, null, 100.4, 100.6 /* … une valeur par bougie */], label: "MM 3", couleur: "gold" }
{ type: "etiquette", index: 7, prix: 103.1, texte: "HH", position: "haut", couleur: "bull" }
```

Calcule les points des courbes (moyennes mobiles, ATR…) par script à partir des bougies, jamais à la main.

## Capsules : écrire pour l'oreille

La narration est produite par une voix de synthèse neuronale : elle ne sonne naturelle que si le texte est **écrit pour être dit**.

- Phrases courtes à moyennes, longueurs variées ; une idée par phrase.
- Tournures orales : « Regarde… », « Tu vois ce qui se passe ? », « Autrement dit… », « Et c'est là que… ». Pas de listes lues à la suite, pas de parenthèses, pas d'abréviations (« par exemple », pas « ex. »).
- Les nombres comme on les dit : « un virgule cinq pour cent », ou laisse « 1,5 % » (converti automatiquement).
- Une capsule principale par chapitre, d'une à deux minutes (60 à 120 s ; moins pour un point simple). Pour un sujet complexe, ajoute jusqu'à **trois** capsules dans `capsulesSupplementaires` (même format), chacune centrée sur un temps précis : définition, identification sur graphique, confirmations, exemple pratique. Pas de capsule supplémentaire sans nécessité pédagogique.
- Pas d'avatar ni de personnage : l'image montre des graphiques, des zones, des annotations. Chaque phrase de la voix doit correspondre à ce que montre la scène au même moment (la cassure quand on parle de cassure, la zone quand on parle de la zone).
- Questions de niveau 3 (« transfert ») : un graphique ou une situation jamais vus dans le cours, résolubles avec les principes enseignés. Pas de phrase reprise du cours.
- Si tu modifies le texte d'une capsule, sa narration sera régénérée : c'est attendu.

## Vérification

```bash
LOT=<module> CIBLE=1 npx vitest run src/content/prive.test.ts   # modules payants
CIBLE=1 npx vitest run src/content/contenu.test.ts              # Premiers pas
```

# Examens de fin de module

Page : `/examen/<module>/`, liée depuis le programme de chaque module. Fonction serveur : `examen` (`functions/src/examens/`).

## Principe

- **Banque** : les quiz de tous les chapitres du module, lus dans la collection serveur `corriges` (jamais dans le navigateur).
- **Trois niveaux**, donnés par la difficulté des questions :
  - connaissance (difficulté 1) : définir, reconnaître, rappeler une règle ;
  - application (2) : appliquer une méthode à un cas donné ;
  - transfert (3) : raisonner sur une situation nouvelle.
- **Tirage** : pour chaque niveau, des questions réparties sur le plus de chapitres possible.
  - Les questions de la tentative précédente passent après les autres : chaque reprise est une nouvelle variante.
  - Un niveau trop pauvre est complété par les autres.
- **Copie sans corrigé** : le navigateur reçoit les questions avec des valeurs neutres à la place des bonnes réponses, sans explication.
  - Les paires (associations) et les étapes (ordres) sont permutées par le serveur, qui garde la permutation.
  - Les réponses sont ramenées aux index d'origine avant la notation habituelle.
- **Notation serveur** : score global, score par niveau et par compétence, chapitres à revoir (score inférieur à 75 % sur leurs questions), correction détaillée (réponse attendue et explication).
- **Validation** : un examen validé le reste ; un échec ultérieur ne retire rien. Le certificat de module reste délivré à la réussite de tous les quiz de chapitre.

## Données

| Collection | Contenu | Accès client |
|---|---|---|
| `examensEnCours/{uid}_{module}` | Tirage de la tentative (questions, permutations), expiration à 3 h | aucun |
| `examens/{uid}_{module}` | Meilleur et dernier score, validé, tentatives, scores par niveau et par compétence, chapitres à revoir, questions de la dernière tentative | lecture par le titulaire et l'administration |
| `parametres/examens` | Seuil, nombre de questions par niveau, attente après un échec | fonction `admin` seulement |

## Réglages (administration, onglet Paramètres)

| Réglage | Par défaut | Bornes |
|---|---|---|
| Seuil de réussite | 70 % | 50 à 100 % |
| Questions de connaissance, d'application, de transfert | 6, 6, 4 | 0 à 20 chacun, au moins 5 au total |
| Attente après un échec | 0 minute | 0 à 7 jours |

Autres garde-fous : 6 examens commencés par jour, par module et par apprenant ; une tentative expire après 3 heures ; une copie rendue après une mise à jour du module est refusée (nouvelle variante).

## Tests

- `functions/src/examens/regles.test.ts` (dans `functions/`, `npx vitest run`) :
  - tirage par niveau et répartition entre chapitres ;
  - variante à la reprise et niveau complété ;
  - copie sans corrigé ;
  - notation à travers les permutations ;
  - chapitres à revoir.
- `tests/fonctions/examens.test.ts` (`npm run test:fonctions`) :
  - accès réservé au module débloqué ;
  - tirage invisible au navigateur ;
  - copie juste à 100 % ;
  - variante et échec sans perte de validation ;
  - réglages de l'administration.
- `e2e/emulateurs/commercial.spec.ts` (`npm run e2e:emulateurs`) : examen du module gratuit dans le navigateur, de la copie à la correction détaillée.

# Mesures « avant » (2026-10-26)

Lighthouse 12, médiane de 3 exécutions par page. Mobile : réseau et processeur limités (profil par défaut). Ordinateur : profil desktop.

| Profil | Page | Perf. | Access. | LCP (ms) | TBT (ms) | CLS | Poids (Ko) | JS (Ko) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | / | 73 | 100 | 2909 | 841 | 0 | 462 | 180 |
| mobile | /academies/ | 76 | 100 | 3036 | 742 | 0 | 532 | 180 |
| mobile | /parcours/premiers-pas/ | 79 | 100 | 2930 | 674 | 0 | 610 | 180 |
| mobile | /chapitre/quest-ce-que-le-trading/ | 72 | 100 | 3305 | 829 | 0 | 491 | 200 |
| mobile | /tableau-de-bord/ | 73 | 100 | 3081 | 836 | 0 | 271 | 183 |
| ordinateur | / | 96 | 96 | 676 | 25 | 0.121 | 514 | 180 |
| ordinateur | /academies/ | 100 | 100 | 632 | 40 | 0 | 584 | 180 |
| ordinateur | /parcours/premiers-pas/ | 100 | 100 | 645 | 43 | 0.009 | 273 | 180 |
| ordinateur | /chapitre/quest-ce-que-le-trading/ | 100 | 100 | 683 | 25 | 0.016 | 310 | 198 |
| ordinateur | /tableau-de-bord/ | 95 | 100 | 657 | 65 | 0.122 | 274 | 183 |

Fluidité, processeur ralenti 4× (Pixel 7 émulé) :

| Mesure | Images/s | p95 entre images (ms) | Images > 50 ms | Tâches longues |
| --- | --- | --- | --- | --- |
| accueil | 59.8 | 16.8 | 0 | 0 |
| capsule | 60 | 16.8 | 0 | 0 |

Changement de page (accueil → outils) : 210 ms. Changement d'étape dans un chapitre : 81 ms (du clic à l'image affichée).

Blocage réel du fil principal (tâches longues, 5 s après le chargement, processeur ralenti 4×) :

| Page | Blocage (ms) |
| --- | --- |
| / | 61 |
| /academies/ | 101 |
| /parcours/premiers-pas/ | 54 |
| /chapitre/quest-ce-que-le-trading/ | 141 |
| /tableau-de-bord/ | 130 |

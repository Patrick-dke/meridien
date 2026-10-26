# Mesures « apres » (2026-10-26)

Lighthouse 12, médiane de 3 exécutions par page. Mobile : réseau et processeur limités (profil par défaut). Ordinateur : profil desktop.

| Profil | Page | Perf. | Access. | LCP (ms) | TBT (ms) | CLS | Poids (Ko) | JS (Ko) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | / | 80 | 100 | 3351 | 482 | 0 | 383 | 199 |
| mobile | /academies/ | 75 | 100 | 3365 | 707 | 0 | 315 | 169 |
| mobile | /parcours/premiers-pas/ | 75 | 98 | 3320 | 690 | 0 | 444 | 229 |
| mobile | /chapitre/quest-ce-que-le-trading/ | 80 | 100 | 3313 | 460 | 0 | 410 | 229 |
| mobile | /tableau-de-bord/ | 78 | 100 | 3002 | 646 | 0 | 305 | 170 |
| ordinateur | / | 94 | 100 | 735 | 119 | 0.101 | 323 | 170 |
| ordinateur | /academies/ | 100 | 100 | 732 | 36 | 0.008 | 315 | 169 |
| ordinateur | /parcours/premiers-pas/ | 99 | 98 | 689 | 30 | 0.012 | 466 | 229 |
| ordinateur | /chapitre/quest-ce-que-le-trading/ | 99 | 100 | 795 | 83 | 0.006 | 324 | 186 |
| ordinateur | /tableau-de-bord/ | 91 | 100 | 723 | 92 | 0.183 | 306 | 170 |

Fluidité, processeur ralenti 4× (Pixel 7 émulé) :

| Mesure | Images/s | p95 entre images (ms) | Images > 50 ms | Tâches longues |
| --- | --- | --- | --- | --- |
| accueil | 57.5 | 16.8 | 1 | 1 |
| capsule | 59.8 | 16.8 | 0 | 0 |

Changement de page (accueil → outils) : 163 ms. Changement d'étape dans un chapitre : 64 ms (du clic à l'image affichée).

Blocage réel du fil principal (tâches longues, 5 s après le chargement, processeur ralenti 4×) :

| Page | Blocage (ms) |
| --- | --- |
| / | 62 |
| /academies/ | 271 |
| /parcours/premiers-pas/ | 124 |
| /chapitre/quest-ce-que-le-trading/ | 120 |
| /tableau-de-bord/ | 124 |

import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "chandeliers-japonais",
  titre: "Lire un graphique : les chandeliers japonais",
  sousTitre: "Une bougie, quatre prix, et ce qu'elle ne dit pas",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 1,
  dureeMin: 10,
  statut: "publie",
  misAJour: "2026-10-27",
  objectifs: [
    "Lire une bougie : ouverture, plus haut, plus bas, clôture",
    "Distinguer corps et mèches, bougie haussière et bougie baissière",
    "Décrire ce qu'une bougie montre, sans lui faire dire plus",
  ],
  concepts: ["chandelier", "ohlc"],
  prerequis: [],
  intro:
    "Le graphique en chandeliers est le plus utilisé par les traders. Chaque bougie résume ce qui s'est passé pendant une période : où le prix a commencé, jusqu'où il est allé, et où il a fini.",
  capsule: {
    titre: "Une bougie, quatre prix",
    scenes: [
      {
        duree: 9,
        texte:
          "Sur un graphique en chandeliers, chaque bougie résume une période. Une minute, une heure, ou un jour. Et elle porte quatre prix.",
        visuel: {
          type: "titre",
          titre: "Une bougie, quatre prix",
          sousTitre: "Ouverture, plus haut, plus bas, clôture",
        },
      },
      {
        duree: 6,
        texte:
          "Voici une bougie haussière. Le prix a fini plus haut qu'il n'a commencé.",
        visuel: { type: "figure", scene: "anatomie", etape: 0 },
      },
      {
        duree: 9,
        texte:
          "Regarde le corps. Son bas marque l'ouverture, son haut la clôture. Les mèches montrent le plus haut et le plus bas atteints.",
        visuel: { type: "figure", scene: "anatomie", etape: 1 },
      },
      {
        duree: 9,
        texte:
          "Autrement dit, le corps, c'est le chemin entre l'ouverture et la clôture. Les mèches, ce sont les excursions du prix, avant son retour.",
        visuel: { type: "figure", scene: "anatomie", etape: 2 },
      },
      {
        duree: 7,
        texte:
          "Une bougie baissière, c'est l'inverse. L'ouverture est en haut du corps, la clôture en bas.",
        visuel: { type: "figure", scene: "anatomie", etape: 3 },
      },
      {
        duree: 8,
        texte:
          "Sur un vrai graphique, tu repères des mèches longues, des corps minuscules, et des bougies de très grande amplitude.",
        visuel: { type: "figure", scene: "lecture-serie", etape: 3 },
      },
      {
        duree: 9,
        texte:
          "Mais attention : une bougie seule ne prédit rien. Elle décrit ce qui s'est passé. Le contexte et les bougies suivantes comptent davantage.",
        visuel: { type: "titre", titre: "Décrire, pas prédire" },
      },
    ],
  },
  cours: [
    {
      titre: "Les quatre prix d'une bougie",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un [[chandelier|chandelier japonais]], ou bougie, résume les échanges d'une période donnée, appelée [[unite-de-temps|unité de temps]]. Il porte quatre prix, souvent notés [[ohlc|OHLC]] :",
        },
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "**Ouverture** (open) : le premier prix échangé de la période.",
            "**Plus haut** (high) : le prix le plus élevé atteint.",
            "**Plus bas** (low) : le prix le plus bas atteint.",
            "**Clôture** (close) : le dernier prix échangé de la période.",
          ],
        },
      ],
    },
    {
      titre: "Corps, mèches et couleur",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Le **corps** relie l'ouverture et la clôture. Les [[meche|mèches]], ou ombres, partent du corps et vont jusqu'au plus haut et au plus bas.",
        },
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "Si la clôture est au-dessus de l'ouverture, la bougie est [[haussier|haussière]] ; en dessous, elle est [[baissier|baissière]]. Ici, les bougies haussières sont vertes et les baissières rouges ; une palette bleu et orange, plus lisible en cas de daltonisme, se choisit dans les réglages. Les couleurs varient d'une plateforme à l'autre : vérifie toujours la convention utilisée.",
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "Ouverture en bas du corps pour une bougie haussière, en haut pour une bougie baissière. Les mèches ne disent pas où le prix a commencé ni fini, seulement jusqu'où il est allé.",
        },
      ],
    },
    {
      titre: "Ce qu'une bougie montre",
      blocs: [
        {
          type: "p",
          texte: "Une bougie décrit l'issue des échanges sur une période :",
        },
        {
          type: "liste",
          fiabilite: "convention",
          items: [
            "Un **grand corps** : le prix a beaucoup progressé dans un sens entre l'ouverture et la clôture.",
            "Une **longue mèche** : le prix est allé loin dans un sens, puis il est revenu. On parle souvent de « rejet ».",
            "Un **corps minuscule** (doji) : ouverture et clôture presque au même prix ; aucun camp n'a pris le dessus sur la période.",
          ],
        },
        {
          type: "encadre",
          variante: "attention",
          fiabilite: "hypothese",
          texte:
            "Une bougie isolée ne prédit pas la suite. Les noms de configurations (marteau, doji, engulfing…) décrivent une forme ; leur valeur prédictive dépend du contexte et doit être mesurée, pas supposée. L'académie Price Action y revient en détail.",
        },
      ],
    },
    {
      titre: "Du graphique en ligne au chandelier",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un graphique en ligne relie seulement les clôtures successives : il est simple, mais il cache les extrêmes. Le chandelier montre en plus l'ouverture, le plus haut et le plus bas. C'est pourquoi il est le plus utilisé pour analyser un prix en détail.",
        },
        {
          type: "figure",
          scene: "pp-ligne-vs-bougies",
          legende:
            "Quatorze séances : la ligne relie seulement les clôtures. Elle ne montre ni le plus haut de 52,20 € atteint pendant la septième séance, ni le plus bas de 49,90 € de la onzième ; les bougies, si.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "anatomie",
      legende:
        "À gauche une bougie haussière, à droite une bougie baissière : l'ouverture et la clôture changent de place selon le sens.",
    },
    {
      type: "figure",
      scene: "lecture-serie",
      legende:
        "Trois bougies repérées : une longue mèche basse, un corps minuscule et une forte bougie baissière.",
    },
  ],
  exemple: {
    titre: "Lire une bougie en chiffres",
    blocs: [
      {
        type: "p",
        texte:
          "Sur une unité de temps d'une heure, une action affiche : ouverture 100,20 €, plus haut 100,50 €, plus bas 99,20 €, clôture 100,30 €.",
      },
      {
        type: "figure",
        scene: "pp-bougie-chiffres",
        fiabilite: "calcul",
        legende:
          "La bougie repérée, parmi douze bougies d'une heure : ouverture 100,20 €, clôture 100,30 €, plus haut 100,50 €, plus bas 99,20 €. Petit corps de 0,10 €, mèche haute de 0,20 €, longue mèche basse de 1,00 €.",
      },
      {
        type: "liste",
        fiabilite: "calcul",
        items: [
          "Clôture (100,30) au-dessus de l'ouverture (100,20) : bougie **haussière**, au petit corps de 0,10 €.",
          "Mèche basse : de 100,20 jusqu'à 99,20, soit 1,00 € : le prix est nettement descendu avant de remonter.",
          "Mèche haute : de 100,30 jusqu'à 100,50, soit 0,20 €.",
        ],
      },
      {
        type: "p",
        texte:
          "Description correcte : « pendant cette heure, le prix est descendu d'un euro sous son ouverture, puis il est remonté pour finir légèrement au-dessus ». Ce n'est pas un signal d'achat : c'est un fait sur l'heure écoulée.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Inverser ouverture et clôture sur une bougie baissière",
      texte:
        "Pour une bougie baissière, l'ouverture est en haut du corps et la clôture en bas.",
    },
    {
      titre: "Prendre une forme de bougie pour un signal",
      texte:
        "Une forme de bougie décrit le passé. Sans contexte ni mesure, elle ne dit pas ce que fera le prix.",
    },
    {
      titre: "Oublier l'unité de temps",
      texte:
        "Une grande bougie en 1 minute peut être invisible sur un graphique journalier. Vérifie toujours l'unité de temps affichée.",
    },
  ],
  resume: [
    "Une bougie porte quatre prix : ouverture, plus haut, plus bas, clôture.",
    "Le corps relie l'ouverture et la clôture ; les mèches montrent les extrêmes atteints.",
    "Haussière : clôture au-dessus de l'ouverture ; baissière : en dessous.",
    "Une bougie décrit le passé ; sa valeur prédictive dépend du contexte et se mesure.",
  ],
  exercices: [
    {
      id: "pp-06-e1",
      type: "graphique",
      consigne:
        "Touche la bougie dont la mèche basse est la plus longue : le prix est descendu loin pendant la période, puis il est remonté avant la clôture.",
      scene: "lecture-serie",
      etape: 0,
      bonnes: [2],
      corrige:
        "C'est la troisième bougie : son corps est minuscule (100,20 → 100,30) mais son plus bas descend à 99,20, soit une mèche basse d'un point entier. Les vendeurs ont poussé, les acheteurs ont ramené le prix.",
      concepts: ["chandelier"],
    },
    {
      id: "pp-06-e2",
      type: "calcul",
      consigne:
        "Une bougie a pour ouverture 101,60, plus haut 101,70, plus bas 100,60 et clôture 100,70. Quelle est la taille de son corps ?",
      reponse: 0.9,
      tolerance: 0.01,
      aide: "Le corps va de l'ouverture à la clôture ; les mèches, jusqu'au plus haut et au plus bas.",
      corrige:
        "Corps = |clôture − ouverture| = |100,70 − 101,60| = 0,90. La clôture est sous l'ouverture : c'est une bougie baissière, au corps large et aux mèches courtes (0,10 de chaque côté).",
      concepts: ["ohlc"],
    },
  ],
  quiz: [
    {
      id: "c06-q1",
      difficulte: 1,
      type: "unique",
      enonce:
        "Une bougie a une ouverture à 50 €, un plus haut à 53 €, un plus bas à 49 € et une clôture à 52 €. Elle est :",
      choix: [
        "baissière",
        "haussière",
        "neutre",
        "impossible à dire sans la bougie suivante",
      ],
      bonne: 1,
      explication:
        "La clôture (52 €) est au-dessus de l'ouverture (50 €) : la bougie est haussière.",
      concepts: ["chandelier", "ohlc"],
    },
    {
      id: "c06-q2",
      difficulte: 2,
      type: "unique",
      enonce:
        "Pour cette même bougie, quelle est la longueur de la mèche haute ?",
      choix: ["1 €", "2 €", "3 €", "4 €"],
      bonne: 0,
      explication:
        "La mèche haute va du haut du corps (la clôture, 52 €) au plus haut (53 €) : 1 €.",
      concepts: ["chandelier"],
    },
    {
      id: "c06-q3",
      difficulte: 1,
      type: "vraifaux",
      enonce:
        "Pour une bougie baissière, l'ouverture se situe en haut du corps.",
      reponse: true,
      explication:
        "Le prix a commencé plus haut qu'il n'a fini : l'ouverture est en haut du corps, la clôture en bas.",
      concepts: ["chandelier", "ohlc"],
    },
    {
      id: "c06-q4",
      difficulte: 2,
      type: "association",
      enonce: "Associe chaque élément à sa signification.",
      paires: [
        ["Corps", "L'écart entre l'ouverture et la clôture"],
        ["Mèche haute", "Les prix atteints au-dessus du corps"],
        ["Clôture", "Le dernier prix échangé de la période"],
        ["Ouverture", "Le premier prix échangé de la période"],
      ],
      explication: "Corps et mèches se lisent à partir des quatre prix OHLC.",
      concepts: ["ohlc", "chandelier"],
    },
    {
      id: "c06-q5",
      difficulte: 2,
      type: "vraifaux",
      enonce: "Une longue mèche basse annonce à coup sûr une hausse.",
      reponse: false,
      explication:
        "Elle montre que le prix est descendu puis revenu. Ce que cela vaut pour la suite dépend du contexte et doit être mesuré.",
      concepts: ["chandelier"],
    },
    {
      id: "c06-q6",
      type: "graphique",
      difficulte: 1,
      enonce: "Touche la seule bougie baissière de ce graphique.",
      scene: "pp-q-baissiere",
      bonnes: [5],
      explication:
        "Sa clôture, 20,60 €, est sous son ouverture, 21,00 € : le prix a fini plus bas qu'il n'a commencé. Toutes les autres bougies clôturent au-dessus de leur ouverture.",
      concepts: ["chandelier"],
    },
    {
      id: "c06-q7",
      type: "graphique",
      difficulte: 2,
      enonce: "Touche la bougie dont la mèche haute est la plus longue.",
      scene: "pp-q-meche-haute",
      bonnes: [7],
      explication:
        "Cette bougie ouvre à 30,50 €, clôture à 30,90 € et monte jusqu'à 31,60 € : 0,70 € de mèche haute. Le prix est allé haut pendant la période, puis il est redescendu avant la clôture. La bougie à longue mèche basse ne répond pas à la consigne.",
      concepts: ["chandelier", "ohlc"],
    },
    {
      id: "c06-q8",
      type: "association",
      difficulte: 2,
      figure: { scene: "pp-q-quatre-prix", legende: "Une bougie haussière repérée par quatre lettres." },
      enonce: "Associe chaque lettre au prix qu'elle marque sur la bougie repérée.",
      paires: [
        ["A", "Plus haut"],
        ["B", "Clôture"],
        ["C", "Ouverture"],
        ["D", "Plus bas"],
      ],
      explication:
        "La bougie est haussière : sa clôture, 41,00, est au-dessus de son ouverture, 40,00. Le haut du corps est donc la clôture (B) et le bas l'ouverture (C). Les extrémités des mèches donnent le plus haut (A) et le plus bas (D).",
      concepts: ["ohlc", "chandelier"],
    },
    {
      id: "c06-q9",
      type: "comparaison",
      difficulte: 2,
      enonce:
        "Dans les deux graphiques, la dernière bougie descend loin sous son ouverture. Laquelle montre un rejet de la baisse, le prix étant revenu avant la clôture ?",
      graphiques: [{ scene: "pp-q-rejet-a" }, { scene: "pp-q-rejet-b" }],
      bonne: 1,
      explication:
        "En B, le prix descend jusqu'à 44,75 € puis remonte clôturer à 45,70 €, près de son ouverture : longue mèche basse et petit corps, c'est un rejet. En A, la bougie clôture à 44,80 €, presque à son plus bas : la baisse a tenu jusqu'au bout. Un rejet décrit le passé ; il ne garantit pas la suite.",
      concepts: ["chandelier"],
    },
    {
      id: "c06-q10",
      type: "unique",
      difficulte: 3,
      contexte:
        "Sur une unité de temps d'une heure, une action cotée en FCFA affiche : ouverture 2 500, plus haut 2 560, plus bas 2 480, clôture 2 490.",
      enonce: "Quelle description est juste ?",
      choix: [
        "Baissière, corps de 10, mèche haute de 60, mèche basse de 10",
        "Haussière, corps de 10, mèche haute de 60, mèche basse de 10",
        "Baissière, corps de 80, mèche haute de 60, mèche basse de 20",
        "Baissière, corps de 10, mèche haute de 70, mèche basse de 20",
      ],
      bonne: 0,
      explication:
        "Clôture (2 490) sous l'ouverture (2 500) : baissière, corps de 10. La mèche haute part du haut du corps, ici l'ouverture : 2 560 − 2 500 = 60. La mèche basse part de la clôture : 2 490 − 2 480 = 10. Le prix est monté loin pendant l'heure, puis il est redescendu sous son ouverture.",
      concepts: ["ohlc", "chandelier"],
    },
    {
      id: "c06-q11",
      type: "vraifaux",
      difficulte: 1,
      enonce: "Un graphique en ligne, qui relie les clôtures, peut cacher le plus haut atteint pendant une séance.",
      reponse: true,
      explication:
        "La ligne ne passe que par les clôtures. Une séance qui monte très haut puis redescend paraît calme sur la ligne ; la bougie, elle, montre sa mèche.",
      concepts: ["chandelier"],
    },
  ],
};

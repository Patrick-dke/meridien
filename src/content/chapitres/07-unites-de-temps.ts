import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "unites-de-temps",
  titre: "Les unités de temps",
  sousTitre: "Le même marché, vu de près ou de loin",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 1,
  dureeMin: 9,
  statut: "publie",
  misAJour: "2026-10-27",
  objectifs: [
    "Comprendre ce que représente une unité de temps",
    "Savoir comment des bougies courtes se regroupent en bougies longues",
    "Choisir et combiner les unités de temps selon son horizon",
  ],
  concepts: ["unite-de-temps"],
  prerequis: ["chandelier"],
  intro:
    "Le même marché peut sembler monter, baisser ou stagner selon l'unité de temps choisie. Comprendre comment les bougies se regroupent évite bien des contresens.",
  capsule: {
    titre: "Quinze minutes ou une heure ?",
    scenes: [
      {
        duree: 8,
        texte:
          "Chaque bougie représente une durée. C'est ce qu'on appelle l'unité de temps. Elle va d'une minute à un mois, ou plus.",
        visuel: {
          type: "titre",
          titre: "L'unité de temps",
          sousTitre: "M1, M15, H1, H4, D1…",
        },
      },
      {
        duree: 5,
        texte: "Voici huit bougies de quinze minutes. Deux heures d'échanges.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 0 },
      },
      {
        duree: 5,
        texte: "Regroupons-les par quatre. Chaque groupe couvre une heure.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "La bougie d'une heure prend l'ouverture de la première, le plus haut et le plus bas du groupe, et la clôture de la dernière.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 2 },
      },
      {
        duree: 7,
        texte:
          "Tu vois ? Les détails disparaissent, la direction apparaît. La première heure monte, la seconde baisse.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 2 },
      },
      {
        duree: 8,
        texte:
          "Choisis ton unité selon ton horizon. Plus elle est courte, plus le bruit et les frais pèsent lourd.",
        visuel: {
          type: "points",
          titre: "Choisir",
          items: [
            "Scalping : 1 à 5 minutes",
            "Day trading : 5 minutes à 1 heure",
            "Swing : 4 heures à 1 jour",
          ],
        },
      },
      {
        duree: 10,
        texte:
          "Beaucoup de traders lisent le contexte sur une unité longue, puis cherchent leur entrée sur une unité plus courte. On y reviendra en analyse technique.",
        visuel: {
          type: "points",
          items: ["Contexte : unité longue", "Entrée : unité courte"],
        },
      },
    ],
  },
  cours: [
    {
      titre: "Ce qu'est une unité de temps",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "L'[[unite-de-temps|unité de temps]] (timeframe en anglais) est la durée résumée par chaque bougie. Sur un graphique en 1 heure, chaque bougie couvre une heure d'échanges ; en journalier, une journée entière.",
        },
        {
          type: "tableau",
          fiabilite: "calcul",
          entetes: [
            "Notation courante",
            "Durée d'une bougie",
            "Bougies dans 24 heures",
          ],
          lignes: [
            ["M1", "1 minute", "1 440"],
            ["M5", "5 minutes", "288"],
            ["M15", "15 minutes", "96"],
            ["H1", "1 heure", "24"],
            ["H4", "4 heures", "6"],
            ["D1", "1 jour", "1"],
          ],
        },
        {
          type: "p",
          texte:
            "Ces notations sont celles de la plupart des plateformes (MetaTrader, TradingView). Pour un marché qui ne cote pas 24 heures sur 24, comme une bourse d'actions, une journée compte moins de bougies.",
        },
      ],
    },
    {
      titre: "Comment les bougies se regroupent",
      blocs: [
        {
          type: "p",
          texte:
            "Une bougie longue n'est rien d'autre que la synthèse des bougies plus courtes qu'elle contient :",
        },
        {
          type: "liste",
          ordonnee: true,
          fiabilite: "calcul",
          items: [
            "son **ouverture** est l'ouverture de la première bougie courte ;",
            "son **plus haut** est le plus haut de toutes les bougies courtes ;",
            "son **plus bas** est le plus bas de toutes les bougies courtes ;",
            "sa **clôture** est la clôture de la dernière bougie courte.",
          ],
        },
        {
          type: "figure",
          scene: "pp-h1-vers-h4",
          fiabilite: "calcul",
          legende:
            "Vingt-quatre bougies d'une heure regroupées par quatre : six bougies de quatre heures. Chacune prend l'ouverture de sa première heure, le plus haut et le plus bas du groupe, et la clôture de sa quatrième heure.",
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "Regrouper ne crée aucune information : cela en retire. On perd le chemin suivi par le prix à l'intérieur de la période, mais on gagne en lisibilité.",
        },
      ],
    },
    {
      titre: "Une tendance dépend de l'échelle",
      blocs: [
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "Un marché peut monter sur plusieurs semaines tout en baissant sur la journée. Ce n'est pas une contradiction : ce sont deux échelles différentes. Dire « le marché est haussier » n'a de sens qu'en précisant l'unité de temps.",
        },
        {
          type: "figure",
          scene: "pp-echelles-tendance",
          legende:
            "Trente séances d'une action fictive : le prix passe d'environ 40 € à plus de 47 €, puis recule vers 45 € sur les sept dernières. Haussier à l'échelle du mois, baissier à l'échelle de la semaine : les deux lectures sont justes, chacune à son échelle.",
        },
        {
          type: "encadre",
          variante: "attention",
          fiabilite: "fait",
          texte:
            "Plus l'unité de temps est courte, plus les mouvements sont petits par rapport aux frais (spread, commission) et plus le « bruit » domine : des variations sans direction claire. Les unités très courtes sont donc les plus exigeantes pour un débutant.",
        },
      ],
    },
    {
      titre: "Choisir ses unités de temps",
      blocs: [
        {
          type: "tableau",
          fiabilite: "convention",
          entetes: [
            "Style",
            "Durée d'une position",
            "Unités souvent utilisées",
          ],
          lignes: [
            ["Scalping", "Quelques secondes à quelques minutes", "M1, M5"],
            [
              "Day trading",
              "Quelques minutes à quelques heures, fermée le jour même",
              "M5, M15, H1",
            ],
            ["Swing trading", "Quelques jours à quelques semaines", "H4, D1"],
            [
              "Investissement",
              "Des mois ou des années",
              "D1, hebdomadaire, mensuel",
            ],
          ],
        },
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "Une méthode courante consiste à lire le contexte sur une unité longue (par exemple H4) et à chercher le moment d'entrer sur une unité plus courte (par exemple M15). C'est l'analyse sur plusieurs unités de temps, étudiée dans le module d'analyse technique.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "m15-vers-h1",
      legende:
        "Les mêmes deux heures en bougies de 15 minutes, puis en bougies d'une heure.",
    },
  ],
  exemple: {
    titre: "Construire une bougie d'une heure",
    blocs: [
      { type: "p", texte: "Voici quatre bougies de 15 minutes sur EUR/USD :" },
      {
        type: "tableau",
        entetes: ["Bougie", "Ouverture", "Plus haut", "Plus bas", "Clôture"],
        lignes: [
          ["10 h 00", "1,0850", "1,0858", "1,0846", "1,0856"],
          ["10 h 15", "1,0856", "1,0861", "1,0851", "1,0853"],
          ["10 h 30", "1,0853", "1,0866", "1,0852", "1,0864"],
          ["10 h 45", "1,0864", "1,0868", "1,0859", "1,0861"],
        ],
      },
      {
        type: "figure",
        scene: "pp-exemple-h1",
        fiabilite: "calcul",
        legende:
          "Les quatre bougies du tableau, puis la bougie d'une heure qui les résume : ouverture 1,0850, plus haut 1,0868, plus bas 1,0846, clôture 1,0861.",
      },
      {
        type: "p",
        fiabilite: "calcul",
        texte:
          "La bougie de 10 h à 11 h a pour ouverture 1,0850 (première bougie), pour plus haut 1,0868 (le plus élevé des quatre), pour plus bas 1,0846 (le plus bas des quatre) et pour clôture 1,0861 (dernière bougie). Elle est haussière.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Comparer des bougies d'unités différentes",
      texte:
        "Une « grande bougie » en M5 est minuscule en D1. Vérifie toujours l'unité affichée avant de comparer.",
    },
    {
      titre: "Changer d'unité de temps pour justifier un trade",
      texte:
        "Passer d'une unité à l'autre jusqu'à trouver celle qui confirme son idée est un biais de confirmation. Choisis tes unités avant d'analyser.",
    },
    {
      titre: "Commencer par les unités les plus courtes",
      texte:
        "Le M1 semble offrir plus d'occasions, mais les frais et le bruit y pèsent le plus. Les unités plus longues sont plus lisibles pour apprendre.",
    },
  ],
  resume: [
    "L'unité de temps est la durée résumée par chaque bougie.",
    "Une bougie longue reprend l'ouverture de la première bougie courte, les extrêmes du groupe et la clôture de la dernière.",
    "Une tendance n'a de sens qu'avec son unité de temps.",
    "Plus l'unité est courte, plus le bruit et les frais pèsent.",
  ],
  exercices: [
    {
      id: "pp-07-e1",
      type: "calcul",
      consigne:
        "Combien de bougies de 15 minutes faut-il pour former une bougie de 4 heures ?",
      reponse: 16,
      tolerance: 0,
      unite: "bougies",
      corrige: "4 heures = 240 minutes ; 240 ÷ 15 = 16 bougies de 15 minutes.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "pp-07-e2",
      type: "calcul",
      consigne:
        "Quatre bougies de 15 minutes se suivent : (O 100,0 ; H 101,0 ; B 99,5 ; C 100,8), (O 100,8 ; H 102,0 ; B 100,5 ; C 101,6), (O 101,6 ; H 101,9 ; B 100,9 ; C 101,0), (O 101,0 ; H 101,4 ; B 100,2 ; C 100,6). Quel est le plus bas de la bougie d'une heure qui les regroupe ?",
      reponse: 99.5,
      tolerance: 0.01,
      aide: "La bougie d'une heure prend l'ouverture de la première, la clôture de la dernière, le plus haut et le plus bas de toutes.",
      corrige:
        "Le plus bas de l'heure est le plus bas des quatre : min(99,5 ; 100,5 ; 100,9 ; 100,2) = 99,5. Pour mémoire, cette bougie d'une heure vaut O 100,0 ; H 102,0 ; B 99,5 ; C 100,6.",
      concepts: ["unite-de-temps", "ohlc"],
    },
    {
      id: "pp-07-e3",
      type: "graphique",
      consigne:
        "Ces douze bougies de 15 minutes couvrent trois heures, séparées par des pointillés. Touche la bougie qui donne son plus bas à la bougie de la deuxième heure.",
      scene: "pp-q-m15-heures",
      bonnes: [7],
      corrige:
        "La deuxième heure regroupe les bougies 5 à 8. Leurs plus bas : 1,0915 ; 1,0909 ; 1,0910 ; 1,0905. Le plus bas de l'heure est 1,0905, atteint par la dernière bougie du groupe. La bougie suivante descend encore, à 1,0903, mais elle appartient à la troisième heure.",
      concepts: ["unite-de-temps", "ohlc"],
    },
  ],
  quiz: [
    {
      id: "c07-q1",
      difficulte: 1,
      type: "unique",
      enonce: "Combien de bougies M15 contient une bougie H1 ?",
      choix: ["2", "4", "15", "60"],
      bonne: 1,
      explication: "Une heure contient quatre quarts d'heure.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q2",
      difficulte: 2,
      type: "unique",
      enonce:
        "Quatre bougies M15 ont pour plus hauts 1,0858 ; 1,0861 ; 1,0866 et 1,0868. Quel est le plus haut de la bougie H1 correspondante ?",
      choix: ["1,0858", "1,0863", "1,0866", "1,0868"],
      bonne: 3,
      explication:
        "Le plus haut de la bougie H1 est le plus élevé des quatre plus hauts : 1,0868.",
      concepts: ["unite-de-temps", "ohlc"],
    },
    {
      id: "c07-q3",
      difficulte: 1,
      type: "ordre",
      enonce: "Classe ces unités de temps de la plus courte à la plus longue.",
      etapes: ["M1", "M15", "H1", "H4", "D1"],
      explication:
        "M = minutes, H = heures, D = jour : 1 minute, 15 minutes, 1 heure, 4 heures, 1 jour.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q4",
      difficulte: 2,
      type: "vraifaux",
      enonce:
        "Un marché peut être haussier en journalier et baissier en M15 au même moment.",
      reponse: true,
      explication:
        "Ce sont deux échelles différentes : un repli de quelques heures peut s'inscrire dans une hausse de plusieurs semaines.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q5",
      difficulte: 2,
      type: "unique",
      enonce:
        "Pourquoi les unités de temps très courtes sont-elles exigeantes pour un débutant ?",
      choix: [
        "Elles sont interdites aux particuliers",
        "Les mouvements y sont petits par rapport aux frais, et le bruit domine",
        "Les bougies n'y ont pas de mèches",
        "Le spread y est nul",
      ],
      bonne: 1,
      explication:
        "Sur des mouvements de quelques pips, le spread et les commissions représentent une grande part du gain possible.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q6",
      type: "graphique",
      difficulte: 2,
      enonce:
        "Ces douze bougies de 15 minutes couvrent trois heures, séparées par des pointillés. Touche la bougie qui donne son plus haut à la bougie de la première heure.",
      scene: "pp-q-m15-heures",
      bonnes: [1],
      explication:
        "Le plus haut de la bougie d'une heure est le plus élevé des quatre plus hauts du groupe : 1,0938, atteint par la deuxième bougie de 15 minutes. Peu importe qu'elle ne soit ni la première ni la dernière du groupe.",
      concepts: ["unite-de-temps", "ohlc"],
    },
    {
      id: "c07-q7",
      type: "unique",
      difficulte: 1,
      figure: { scene: "pp-q-echelles", legende: "Trente séances d'une action fictive, en bougies journalières." },
      enonce: "Comment décrire ce graphique ?",
      choix: [
        "Haussier sur le mois, en repli sur les derniers jours",
        "Baissier, puisque les dernières séances baissent",
        "Haussier, et toujours en hausse ces derniers jours",
        "Sans tendance, puisqu'il monte puis qu'il baisse",
      ],
      bonne: 0,
      explication:
        "Sur trente séances, le prix passe d'environ 40 € à plus de 47 €, puis recule vers 45 € sur les sept dernières. Les deux mouvements coexistent : une tendance se décrit toujours avec son échelle.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q8",
      type: "unique",
      difficulte: 2,
      figure: { scene: "pp-q-m15-heures", legende: "Douze bougies de 15 minutes, soit trois heures." },
      enonce: "Si l'on regroupe les quatre bougies de la deuxième heure en une bougie d'une heure, comment est-elle ?",
      choix: [
        "Baissière, avec une clôture proche de son plus bas",
        "Haussière, avec une clôture proche de son plus haut",
        "Baissière, avec une clôture proche de son plus haut",
        "Haussière, avec une clôture proche de son plus bas",
      ],
      bonne: 0,
      explication:
        "Ouverture de la première bougie, 1,0927 ; clôture de la dernière, 1,0908 : la bougie d'une heure est baissière. Son plus bas, 1,0905, n'est que 3 pips sous la clôture, pour 25 pips d'amplitude : la clôture est proche du plus bas.",
      concepts: ["unite-de-temps", "ohlc"],
    },
    {
      id: "c07-q9",
      type: "comparaison",
      difficulte: 3,
      enonce: "Chaque cas montre quatre bougies de 15 minutes. Lequel donne une bougie d'une heure haussière ?",
      graphiques: [
        { scene: "pp-q-regroupe-a", etape: 0 },
        { scene: "pp-q-regroupe-b", etape: 0 },
      ],
      bonne: 0,
      explication:
        "Seules comptent l'ouverture de la première bougie et la clôture de la dernière. En A, 1,0850 puis 1,0856 : haussière, même si trois bougies sur quatre baissent. En B, 1,0850 puis 1,0845 : baissière, malgré trois bougies haussières.",
      concepts: ["unite-de-temps", "ohlc"],
    },
    {
      id: "c07-q10",
      type: "unique",
      difficulte: 2,
      contexte:
        "Mariam travaille en journée et peut regarder les marchés trente minutes chaque soir. Elle veut garder ses positions plusieurs jours.",
      enonce: "Quelles unités de temps lui conviennent le mieux ?",
      choix: ["H4 et D1", "M1 et M5", "M5 et M15", "M15 et H1"],
      bonne: 0,
      explication:
        "Des positions de plusieurs jours, suivies une fois par soir : c'est du swing trading, qui se lit en H4 et D1. En M1 ou M5, il faudrait surveiller l'écran en permanence, et les frais pèseraient bien plus.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q11",
      type: "unique",
      difficulte: 3,
      enonce: "Une bourse d'actions cote de 9 h 30 à 16 h. Combien de bougies M15 compte une séance complète ?",
      choix: ["24", "26", "96", "390"],
      bonne: 1,
      explication:
        "De 9 h 30 à 16 h, il y a 6 h 30, soit 390 minutes ; 390 ÷ 15 = 26 bougies. 96 vaut pour un marché ouvert 24 heures sur 24, et 390 est le nombre de bougies M1 de la séance.",
      concepts: ["unite-de-temps"],
    },
  ],
};

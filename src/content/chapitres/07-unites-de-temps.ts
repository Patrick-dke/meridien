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
  misAJour: "2026-10-26",
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
        texte: "Chaque bougie représente une durée : c'est l'unité de temps. Une minute, quinze minutes, une heure, un jour, une semaine…",
        visuel: { type: "titre", titre: "L'unité de temps", sousTitre: "M1, M15, H1, H4, D1…" },
      },
      {
        duree: 5,
        texte: "Voici huit bougies de quinze minutes : deux heures d'échanges.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 0 },
      },
      {
        duree: 5,
        texte: "Regroupons-les par quatre : chaque groupe couvre une heure.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 1 },
      },
      {
        duree: 10,
        texte: "La bougie d'une heure prend l'ouverture de la première, le plus haut et le plus bas du groupe, et la clôture de la dernière.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 2 },
      },
      {
        duree: 7,
        texte: "Résultat : les détails disparaissent, la direction générale apparaît. La première heure monte, la seconde baisse.",
        visuel: { type: "figure", scene: "m15-vers-h1", etape: 2 },
      },
      {
        duree: 8,
        texte: "L'unité de temps dépend de ton horizon. Plus elle est courte, plus le bruit et les frais pèsent.",
        visuel: {
          type: "points",
          titre: "Choisir",
          items: ["Scalping : 1 à 5 minutes", "Day trading : 5 minutes à 1 heure", "Swing : 4 heures à 1 jour"],
        },
      },
      {
        duree: 10,
        texte: "Beaucoup de traders lisent le contexte sur une unité longue et cherchent leur entrée sur une plus courte. On y reviendra dans l'analyse technique.",
        visuel: { type: "points", items: ["Contexte : unité longue", "Entrée : unité courte"] },
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
          entetes: ["Notation courante", "Durée d'une bougie", "Bougies dans 24 heures"],
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
          texte: "Une bougie longue n'est rien d'autre que la synthèse des bougies plus courtes qu'elle contient :",
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
          entetes: ["Style", "Durée d'une position", "Unités souvent utilisées"],
          lignes: [
            ["Scalping", "Quelques secondes à quelques minutes", "M1, M5"],
            ["Day trading", "Quelques minutes à quelques heures, fermée le jour même", "M5, M15, H1"],
            ["Swing trading", "Quelques jours à quelques semaines", "H4, D1"],
            ["Investissement", "Des mois ou des années", "D1, hebdomadaire, mensuel"],
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
      legende: "Les mêmes deux heures en bougies de 15 minutes, puis en bougies d'une heure.",
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
      texte: "Une « grande bougie » en M5 est minuscule en D1. Vérifie toujours l'unité affichée avant de comparer.",
    },
    {
      titre: "Changer d'unité de temps pour justifier un trade",
      texte:
        "Passer d'une unité à l'autre jusqu'à trouver celle qui confirme son idée est un biais de confirmation. Choisis tes unités avant d'analyser.",
    },
    {
      titre: "Commencer par les unités les plus courtes",
      texte: "Le M1 semble offrir plus d'occasions, mais les frais et le bruit y pèsent le plus. Les unités plus longues sont plus lisibles pour apprendre.",
    },
  ],
  resume: [
    "L'unité de temps est la durée résumée par chaque bougie.",
    "Une bougie longue reprend l'ouverture de la première bougie courte, les extrêmes du groupe et la clôture de la dernière.",
    "Une tendance n'a de sens qu'avec son unité de temps.",
    "Plus l'unité est courte, plus le bruit et les frais pèsent.",
  ],
  quiz: [
    {
      id: "c07-q1",
      type: "unique",
      enonce: "Combien de bougies M15 contient une bougie H1 ?",
      choix: ["2", "4", "15", "60"],
      bonne: 1,
      explication: "Une heure contient quatre quarts d'heure.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q2",
      type: "unique",
      enonce: "Quatre bougies M15 ont pour plus hauts 1,0858 ; 1,0861 ; 1,0866 et 1,0868. Quel est le plus haut de la bougie H1 correspondante ?",
      choix: ["1,0858", "1,0863", "1,0866", "1,0868"],
      bonne: 3,
      explication: "Le plus haut de la bougie H1 est le plus élevé des quatre plus hauts : 1,0868.",
      concepts: ["unite-de-temps", "ohlc"],
    },
    {
      id: "c07-q3",
      type: "ordre",
      enonce: "Classe ces unités de temps de la plus courte à la plus longue.",
      etapes: ["M1", "M15", "H1", "H4", "D1"],
      explication: "M = minutes, H = heures, D = jour : 1 minute, 15 minutes, 1 heure, 4 heures, 1 jour.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q4",
      type: "vraifaux",
      enonce: "Un marché peut être haussier en journalier et baissier en M15 au même moment.",
      reponse: true,
      explication: "Ce sont deux échelles différentes : un repli de quelques heures peut s'inscrire dans une hausse de plusieurs semaines.",
      concepts: ["unite-de-temps"],
    },
    {
      id: "c07-q5",
      type: "unique",
      enonce: "Pourquoi les unités de temps très courtes sont-elles exigeantes pour un débutant ?",
      choix: [
        "Elles sont interdites aux particuliers",
        "Les mouvements y sont petits par rapport aux frais, et le bruit domine",
        "Les bougies n'y ont pas de mèches",
        "Le spread y est nul",
      ],
      bonne: 1,
      explication: "Sur des mouvements de quelques pips, le spread et les commissions représentent une grande part du gain possible.",
      concepts: ["unite-de-temps"],
    },
  ],
};

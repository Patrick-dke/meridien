import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "risque-et-taille-de-position",
  titre: "Le risque par opération et la taille de position",
  sousTitre: "D'abord le risque, ensuite le stop, enfin la taille",
  academie: "fondamentaux",
  module: "gestion-du-risque",
  niveau: 2,
  dureeMin: 14,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Fixer un risque par opération en pourcentage du capital",
    "Calculer une taille de position à partir du stop",
    "Comprendre pourquoi un petit risque protège des séries de pertes",
  ],
  concepts: ["risque-par-trade", "taille-position"],
  prerequis: ["stop-loss", "valeur-pip"],
  intro:
    "La plupart des comptes ne disparaissent pas à cause d'une mauvaise analyse, mais d'une mauvaise taille de position. Ce chapitre donne la méthode la plus importante de toute l'académie : décider combien on risque, puis en déduire combien on achète.",
  capsule: {
    titre: "Combien acheter ?",
    scenes: [
      {
        duree: 9,
        texte:
          "Combien acheter ? La bonne question n'est pas « combien je veux gagner », mais « combien j'accepte de perdre si j'ai tort ».",
        visuel: {
          type: "titre",
          titre: "Combien acheter ?",
          sousTitre: "Commence par ce que tu acceptes de perdre",
        },
      },
      {
        duree: 9,
        texte:
          "D'abord, fixe ton risque par opération : un petit pourcentage de ton capital. Avec 2 000 euros et 1 %, c'est 20 euros.",
        visuel: {
          type: "points",
          titre: "Étape 1 : le risque",
          items: ["Un pourcentage fixe du capital", "Souvent 0,5 à 2 %"],
        },
      },
      {
        duree: 9,
        texte:
          "Ensuite, place ton stop là où ton idée devient fausse. Ici, entrée à 50 euros, stop à 48 : 2 euros de risque par action.",
        visuel: { type: "figure", scene: "position-stop-distance", etape: 1 },
      },
      {
        duree: 7,
        texte:
          "Enfin, divise : 20 euros de risque, 2 euros par action. Tu achètes 10 actions, pas une de plus.",
        visuel: {
          type: "formule",
          texte: "20 € ÷ 2 € = 10 actions",
          legende: "Étape 3 : la taille",
        },
      },
      {
        duree: 9,
        texte:
          "Si le stop est touché, tu perds 20 euros, comme prévu. Le stop a fixé la distance ; ta règle a fixé la taille.",
        visuel: {
          type: "points",
          items: [
            "Le stop fixe la distance",
            "La règle de risque fixe la taille",
          ],
        },
      },
      {
        duree: 9,
        texte:
          "Pourquoi si peu ? Parce que même une méthode gagnante enchaîne les pertes. Ici, six d'affilée, avec une méthode pourtant légèrement gagnante.",
        visuel: { type: "figure", scene: "series-resultats", etape: 2 },
      },
      {
        duree: 8,
        texte:
          "Six pertes à 1 % coûtent environ 6 % du capital. À 10 % par trade, près de la moitié.",
        visuel: {
          type: "points",
          titre: "Six pertes d'affilée",
          items: [
            "À 1 % par trade : environ −6 %",
            "À 10 % par trade : environ −47 %",
          ],
        },
      },
      {
        duree: 6,
        texte:
          "Retiens : d'abord le risque, ensuite le stop, enfin la taille. Dans cet ordre, toujours.",
        visuel: { type: "titre", titre: "Risque → stop → taille" },
      },
    ],
  },
  cours: [
    {
      titre: "Le risque par opération",
      blocs: [
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "Le [[risque-par-operation|risque par opération]] est la somme que tu acceptes de perdre si ton stop loss est touché. On le fixe en pourcentage du capital, souvent entre 0,5 % et 2 %. Avec 2 000 € de capital et un risque de 1 %, tu acceptes de perdre 20 € sur ce trade.",
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "Le pourcentage s'applique au capital du moment : après des pertes, le montant risqué diminue de lui-même ; après des gains, il augmente. C'est une protection automatique.",
        },
      ],
    },
    {
      titre: "Calculer la taille de position",
      blocs: [
        {
          type: "formule",
          fiabilite: "calcul",
          texte:
            "Taille = montant risqué ÷ (distance du stop × valeur d'un point par unité)",
          legende:
            "Pour une action, un point vaut 1 € par action : taille = montant risqué ÷ distance du stop.",
        },
        {
          type: "liste",
          ordonnee: true,
          fiabilite: "calcul",
          items: [
            "Fixe le montant risqué : capital × pourcentage de risque.",
            "Place ton stop au niveau où ton scénario devient faux, et mesure la distance entre l'entrée et le stop.",
            "Divise le montant risqué par la perte par unité si le stop est touché.",
            "Arrondis **vers le bas**, pour ne jamais dépasser le risque prévu.",
          ],
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Sur le Forex, le principe est le même avec des pips : taille en lots = montant risqué ÷ (stop en pips × valeur d'un pip pour un lot). Avec 2 000 $, 1 % de risque (20 $), un stop de 25 pips et 10 $ par pip et par lot : 20 ÷ (25 × 10) = 0,08 lot.",
        },
        { type: "outil", outil: "position" },
      ],
    },
    {
      titre: "Pourquoi un risque si petit ?",
      blocs: [
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Parce que les séries de pertes sont normales, même avec une méthode gagnante. Avec 40 % de trades gagnants, la probabilité de connaître au moins une série de 6 pertes d'affilée sur 100 trades est d'environ 87 %, et celle d'une série de 8 pertes, d'environ 49 %. Plusieurs pertes consécutives doivent donc rester supportables.",
        },
        {
          type: "tableau",
          fiabilite: "calcul",
          entetes: [
            "Pertes d'affilée",
            "Capital restant à 1 % par trade",
            "à 5 % par trade",
            "à 10 % par trade",
          ],
          lignes: [
            ["3", "97,0 %", "85,7 %", "72,9 %"],
            ["6", "94,1 %", "73,5 %", "53,1 %"],
            ["10", "90,4 %", "59,9 %", "34,9 %"],
          ],
          legende: "Chaque perte retire un pourcentage du capital restant.",
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Et remonter coûte plus cher que descendre : après une baisse de 47 %, il faut gagner près de 90 % pour revenir au point de départ.",
        },
      ],
    },
    {
      titre: "Ce que le calcul ne couvre pas",
      blocs: [
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "Les **frais** et le **slippage** s'ajoutent à la perte prévue : garde une marge.",
            "Un **gap** peut faire exécuter le stop bien plus loin.",
            "Plusieurs positions **corrélées** (qui bougent ensemble) additionnent leurs risques : deux trades à 1 % sur des paires très liées font presque un trade à 2 %.",
          ],
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "position-stop-distance",
      legende:
        "Entrée prévue à 50,00 €, stop à 48,00 € : 2,00 € de risque par action.",
    },
    {
      type: "figure",
      scene: "series-resultats",
      legende:
        "Vingt trades d'une méthode qui gagne 2R ou perd 1R avec 35 % de réussite : +1R au total, mais six pertes d'affilée en chemin.",
    },
  ],
  exemple: {
    titre: "Le calcul pas à pas",
    blocs: [
      {
        type: "tableau",
        fiabilite: "calcul",
        entetes: ["Étape", "Calcul", "Résultat"],
        lignes: [
          ["Capital", "", "2 000 €"],
          ["Risque par opération", "1 % × 2 000 €", "20 €"],
          ["Distance du stop", "50,00 − 48,00", "2,00 € par action"],
          ["Quantité", "20 € ÷ 2,00 €", "**10 actions**"],
          ["Valeur de la position", "10 × 50,00 €", "500 €"],
          ["Perte si le stop est touché", "10 × 2,00 €", "20 €"],
        ],
      },
      {
        type: "p",
        texte:
          "Si le stop avait été à 49,00 €, la distance aurait été de 1,00 € et la quantité de 20 actions ; à 45,00 €, de 5,00 € et 4 actions. La perte possible reste de 20 € dans tous les cas : c'est la quantité qui s'adapte au stop, jamais l'inverse.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Choisir la quantité avant le stop",
      texte:
        "Acheter « 100 actions » puis placer le stop là où la perte paraît supportable inverse la logique : le stop n'a alors plus rien à voir avec l'analyse.",
    },
    {
      titre: "Augmenter le risque après une perte pour se refaire",
      texte:
        "C'est la façon la plus rapide de transformer une série de pertes normale en perte grave.",
    },
    {
      titre: "Arrondir vers le haut",
      texte:
        "Arrondir la quantité vers le haut dépasse le risque prévu. On arrondit toujours vers le bas.",
    },
  ],
  resume: [
    "Le risque par opération est la perte acceptée si le stop est touché, souvent 0,5 à 2 % du capital.",
    "Taille = montant risqué ÷ perte par unité si le stop est touché, arrondie vers le bas.",
    "C'est la quantité qui s'adapte au stop, jamais l'inverse.",
    "Un petit risque rend supportables les séries de pertes, qui sont normales.",
    "Frais, slippage, gaps et positions corrélées peuvent faire dépasser le risque prévu.",
  ],
  exercices: [
    {
      id: "pp-13-e1",
      type: "calcul",
      consigne:
        "Ton capital est de 500 000 FCFA et tu risques 1 % par trade. Tu veux acheter une action à 2 500 FCFA avec un stop à 2 400 FCFA. Combien d'actions au maximum ?",
      reponse: 50,
      tolerance: 0,
      unite: "actions",
      aide: "Taille = montant risqué ÷ distance du stop par action.",
      corrige:
        "Montant risqué : 1 % × 500 000 = 5 000 FCFA. Distance du stop : 2 500 − 2 400 = 100 FCFA par action. Taille : 5 000 ÷ 100 = 50 actions. Si le stop est touché, la perte est de 5 000 FCFA, comme prévu.",
      concepts: ["taille-position", "risque-par-trade"],
    },
    {
      id: "pp-13-e2",
      type: "reflexion",
      consigne:
        "Après trois pertes de suite, tu as envie de doubler la taille du prochain trade « pour te refaire ». Que dit la règle du risque fixe par trade, et pourquoi ?",
      corrige:
        "Le risque reste le même pourcentage du capital à chaque trade, quel que soit le résultat précédent : les trades sont indépendants et une série de pertes peut continuer. Doubler la taille après des pertes accélère la ruine. Réponse attendue : garder 1 % (ou sa règle), éventuellement le réduire, faire une pause et revoir son journal.",
      concepts: ["risque-par-trade"],
    },
  ],
  quiz: [
    {
      id: "c13-q1",
      type: "unique",
      enonce:
        "Capital de 5 000 €, risque de 1 %. Quel montant acceptes-tu de perdre sur ce trade ?",
      choix: ["5 €", "50 €", "500 €", "1 000 €"],
      bonne: 1,
      explication: "1 % de 5 000 € = 50 €.",
      concepts: ["risque-par-trade"],
    },
    {
      id: "c13-q2",
      type: "unique",
      enonce:
        "Risque accepté de 50 €, entrée à 80 €, stop à 75 €. Combien d'actions acheter ?",
      choix: ["5", "10", "50", "62"],
      bonne: 1,
      explication:
        "La perte par action si le stop est touché est de 5 € : 50 ÷ 5 = 10 actions.",
      concepts: ["taille-position"],
    },
    {
      id: "c13-q3",
      type: "unique",
      enonce:
        "Compte de 3 000 $, risque de 1 %, stop de 30 pips, 10 $ par pip pour 1 lot. Quelle taille en lots ?",
      choix: ["0,01 lot", "0,1 lot", "1 lot", "3 lots"],
      bonne: 1,
      explication: "30 $ ÷ (30 pips × 10 $) = 0,1 lot.",
      concepts: ["taille-position"],
    },
    {
      id: "c13-q4",
      type: "vraifaux",
      enonce:
        "Si le stop est plus éloigné, il faut réduire la quantité pour garder le même risque.",
      reponse: true,
      explication:
        "La perte par unité augmente avec la distance du stop : la quantité doit baisser d'autant.",
      concepts: ["taille-position", "risque-par-trade"],
    },
    {
      id: "c13-q5",
      type: "ordre",
      enonce: "Remets dans l'ordre la méthode de calcul.",
      etapes: [
        "Fixer le montant risqué (capital × pourcentage)",
        "Placer le stop au niveau d'invalidation",
        "Mesurer la perte par unité si le stop est touché",
        "Diviser le montant risqué par cette perte et arrondir vers le bas",
      ],
      explication: "D'abord le risque, ensuite le stop, enfin la taille.",
      concepts: ["taille-position"],
    },
    {
      id: "c13-q6",
      type: "unique",
      enonce:
        "Après six pertes d'affilée à 10 % du capital chacune, il reste environ :",
      choix: ["40 %", "53 %", "60 %", "94 %"],
      bonne: 1,
      explication:
        "0,9 multiplié six fois par lui-même ≈ 0,531 : il reste environ 53 % du capital.",
      concepts: ["risque-par-trade"],
    },
  ],
};

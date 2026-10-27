import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "trading-et-investissement",
  titre: "Trading et investissement",
  sousTitre: "Deux façons d'acheter, deux métiers différents",
  academie: "fondamentaux",
  module: "introduction",
  niveau: 1,
  dureeMin: 9,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Distinguer trading et investissement par l'horizon, la source du gain et le risque",
    "Comprendre pourquoi les frais et la fréquence pèsent plus sur le trading",
    "Savoir, pour chaque opération, quelle démarche on applique",
  ],
  concepts: ["investissement", "horizon"],
  prerequis: ["trading"],
  intro:
    "Trader et investir consistent tous deux à acheter des actifs. Pourtant, ce sont deux métiers différents : horizon, source du gain, coûts et risques n'ont presque rien en commun.",
  capsule: {
    titre: "Trader ou investir ?",
    scenes: [
      {
        duree: 8,
        texte:
          "Trader et investir, c'est acheter des actifs dans les deux cas. Mais ce ne sont pas du tout les mêmes métiers.",
        visuel: { type: "titre", titre: "Trader ou investir ?" },
      },
      {
        duree: 9,
        texte:
          "L'investisseur achète pour des années : il compte sur la croissance d'une entreprise ou de l'économie, et accepte de traverser des baisses.",
        visuel: { type: "figure", scene: "horizons" },
      },
      {
        duree: 10,
        texte:
          "Le trader travaille sur quelques minutes, quelques heures ou quelques jours : il cherche à profiter des variations de prix, dans un sens ou dans l'autre.",
        visuel: { type: "figure", scene: "horizons" },
      },
      {
        duree: 9,
        texte:
          "Conséquence : l'investisseur paie peu de frais, le trader en paie à chaque opération. Et plus on opère souvent, plus ils pèsent.",
        visuel: {
          type: "points",
          titre: "Ce qui change",
          items: [
            "Horizon : des années ou des jours",
            "Gain : création de valeur ou variation de prix",
            "Frais : rares ou à chaque opération",
          ],
        },
      },
      {
        duree: 11,
        texte:
          "Aucun n'est meilleur par nature. L'erreur, c'est de mélanger les deux : garder « pour le long terme » un trade perdant qu'on n'avait jamais prévu de garder.",
        visuel: {
          type: "titre",
          titre: "Le piège",
          sousTitre: "Transformer un trade perdant en « investissement »",
        },
      },
      {
        duree: 7,
        texte:
          "Avant de choisir, demande-toi : sur quel horizon, avec quel argent, et combien de temps à y consacrer ?",
        visuel: {
          type: "points",
          items: ["Quel horizon ?", "Quel argent ?", "Quel temps ?"],
        },
      },
    ],
  },
  cours: [
    {
      titre: "Deux façons d'acheter",
      blocs: [
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "L'[[investissement|investissement]] consiste à acheter un actif pour sa valeur à long terme : les bénéfices futurs d'une entreprise, ses dividendes, la croissance de l'économie. L'investisseur garde souvent ses positions des années et accepte de traverser des baisses temporaires.",
        },
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "Le [[trading|trading]] cherche à profiter des variations de prix sur un horizon plus court : de quelques secondes (scalping) à la journée (day trading) ou à quelques semaines (swing trading). Le trader peut gagner à la hausse comme à la baisse, et sort de sa position dès que son scénario est atteint ou invalidé.",
        },
      ],
    },
    {
      titre: "Ce qui les distingue",
      blocs: [
        {
          type: "tableau",
          fiabilite: "convention",
          entetes: ["", "Investissement", "Trading"],
          lignes: [
            [
              "Horizon",
              "Des mois, souvent des années",
              "De quelques secondes à quelques semaines",
            ],
            [
              "Source du gain espéré",
              "Création de valeur : bénéfices, dividendes, croissance",
              "Variation du prix entre l'entrée et la sortie",
            ],
            ["Fréquence des opérations", "Faible", "Élevée"],
            ["Poids des frais", "Faible, car rares", "Important, car répétés"],
            ["Sens", "Surtout à l'achat", "À l'achat comme à la vente"],
            ["Effet de levier", "Rare", "Fréquent (CFD, Forex)"],
            [
              "Temps à y consacrer",
              "Quelques heures par mois",
              "Souvent plusieurs heures par semaine",
            ],
          ],
        },
        {
          type: "p",
          texte:
            "Ces différences ont une conséquence directe : le trading demande de battre ses propres coûts à chaque opération. Une petite erreur répétée cent fois pèse beaucoup plus qu'une petite erreur commise une fois par an.",
        },
      ],
    },
    {
      titre: "Le piège du mélange des genres",
      blocs: [
        {
          type: "encadre",
          variante: "attention",
          texte:
            "Un trade perdant qu'on décide soudain de garder « pour le long terme » n'est pas devenu un investissement : c'est une perte qu'on refuse de prendre. Chaque démarche a ses règles de sortie, décidées à l'avance.",
        },
        {
          type: "p",
          texte:
            "L'inverse existe aussi : un investisseur qui consulte son portefeuille toutes les heures finit souvent par vendre au pire moment, sous le coup de l'émotion.",
        },
      ],
    },
    {
      titre: "Choisir en connaissance de cause",
      blocs: [
        {
          type: "liste",
          items: [
            "**Quel horizon ?** Des années ou des jours.",
            "**Quel argent ?** Seulement de l'argent dont tu n'as pas besoin ; pour le trading, de l'argent que tu acceptes de perdre en totalité.",
            "**Quel temps ?** Le trading demande un long apprentissage et un suivi régulier.",
          ],
        },
        {
          type: "p",
          texte:
            "Rien n'oblige à choisir l'un ou l'autre. Mais il faut savoir, pour chaque opération, laquelle des deux démarches on applique.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "horizons",
      legende:
        "Le même graphique, deux lectures : l'investisseur raisonne sur toute la période, le trader sur les dernières bougies.",
    },
  ],
  exemple: {
    titre: "Une même action, deux démarches",
    blocs: [
      {
        type: "p",
        texte:
          "Une action vaut 40 €. Une investisseuse l'achète parce qu'elle juge l'entreprise solide et compte la garder dix ans ; elle accepte de la voir tomber à 30 € entre-temps. Un trader l'achète parce qu'il attend un rebond de quelques jours ; il a prévu de sortir à 38 € si le rebond n'a pas lieu, et à 44 € s'il a lieu.",
      },
      {
        type: "p",
        texte:
          "Si l'action tombe à 35 €, l'investisseuse ne fait rien : son scénario ne dépend pas de ce mouvement. Le trader, lui, est sorti à 38 € avec une perte prévue et limitée. Les deux comportements sont cohérents avec leur démarche.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Transformer un trade perdant en « investissement »",
      texte:
        "C'est la façon la plus courante de laisser une petite perte devenir grande. Si la sortie était prévue, on l'exécute.",
    },
    {
      titre: "Sous-estimer les frais quand on opère souvent",
      texte:
        "Un coût de 0,1 % par opération semble négligeable. Répété 300 fois dans l'année, il représente 30 % du montant engagé.",
    },
    {
      titre: "Croire que l'une des deux démarches est sans risque",
      texte:
        "Investir sur le long terme comporte aussi des risques : une entreprise peut faire faillite, un marché peut baisser pendant des années.",
    },
  ],
  resume: [
    "L'investisseur vise la création de valeur sur des années ; le trader, les variations de prix à court terme.",
    "Le trading multiplie les opérations, donc les frais : il faut battre ses coûts à chaque fois.",
    "Chaque démarche a ses propres règles de sortie, décidées à l'avance.",
    "Garder un trade perdant « pour le long terme » est une perte refusée, pas un investissement.",
  ],
  exercices: [
    {
      id: "pp-02-e1",
      type: "calcul",
      consigne:
        "Un investisseur achète une action à 40,00 € et la revend soixante séances plus tard à 53,72 €. Quelle est sa performance, en pourcentage du prix d'achat ?",
      reponse: 34.3,
      tolerance: 0.2,
      unite: "%",
      aide: "Performance = (prix de vente − prix d'achat) ÷ prix d'achat × 100.",
      corrige:
        "(53,72 − 40,00) ÷ 40,00 = 13,72 ÷ 40 = 0,343, soit 34,3 %. C'est le résultat sur toute la période, sans compter les éventuels dividendes ni les frais.",
      concepts: ["investissement"],
    },
    {
      id: "pp-02-e2",
      type: "reflexion",
      consigne:
        "Awa place 20 000 FCFA chaque mois pour financer ses études dans dix ans. Paul veut profiter des annonces économiques de la semaine. Qui fait du trading, qui investit ? Pour chacun, indique l'horizon et la fréquence de suivi adaptés.",
      corrige:
        "Awa investit : horizon de plusieurs années, suivi espacé (mensuel ou trimestriel), elle accepte les variations de court terme. Paul fait du trading : horizon de quelques heures à quelques jours, suivi rapproché, chaque position a un stop et un objectif. Critères attendus : horizon, fréquence de suivi, rapport aux variations de court terme.",
      concepts: ["horizon", "investissement"],
    },
  ],
  quiz: [
    {
      id: "c02-q1",
      type: "association",
      enonce: "Associe chaque situation à la démarche qui lui correspond.",
      paires: [
        ["Garder une action dix ans pour ses dividendes", "Investissement"],
        ["Ouvrir et fermer une position dans la journée", "Day trading"],
        [
          "Tenir une position quelques jours pour un mouvement attendu",
          "Swing trading",
        ],
      ],
      explication:
        "L'horizon de détention distingue ces démarches : des années, la journée, quelques jours.",
      concepts: ["horizon", "investissement"],
    },
    {
      id: "c02-q2",
      type: "unique",
      enonce:
        "Quelle est la principale source de gain espérée par un investisseur ?",
      choix: [
        "Les variations de prix de quelques minutes",
        "La création de valeur : bénéfices, dividendes, croissance",
        "Le spread payé par les autres participants",
        "L'effet de levier",
      ],
      bonne: 1,
      explication:
        "L'investisseur compte sur la valeur créée dans la durée, pas sur les mouvements de court terme.",
      concepts: ["investissement"],
    },
    {
      id: "c02-q3",
      type: "vraifaux",
      enonce:
        "Un trade perdant que l'on décide de garder « pour le long terme » devient un investissement.",
      reponse: false,
      explication:
        "C'est une perte refusée : le scénario de départ était un trade, avec sa propre sortie prévue.",
      concepts: ["investissement", "horizon"],
    },
    {
      id: "c02-q4",
      type: "unique",
      enonce:
        "Un coût de 0,1 % par opération, répété sur 300 opérations dans l'année, représente environ :",
      choix: ["0,1 % du montant engagé", "3 %", "30 %", "300 %"],
      bonne: 2,
      explication:
        "0,1 % × 300 = 30 % : les frais pèsent d'autant plus qu'on opère souvent.",
      concepts: ["horizon"],
    },
    {
      id: "c02-q5",
      type: "multiple",
      enonce:
        "Quelles questions faut-il se poser avant de choisir sa démarche ?",
      choix: [
        "Sur quel horizon je compte garder mes positions",
        "Si l'argent engagé peut être perdu sans me mettre en difficulté",
        "Combien de temps je peux y consacrer",
        "Quel influenceur suivre pour copier ses positions",
      ],
      bonnes: [0, 1, 2],
      explication:
        "Horizon, argent et temps disponible définissent la démarche. Copier les positions d'un tiers n'en est pas une.",
      concepts: ["horizon", "investissement"],
    },
  ],
};

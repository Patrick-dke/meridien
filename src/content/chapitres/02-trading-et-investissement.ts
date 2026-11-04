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
  misAJour: "2026-10-27",
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
          "Trader et investir, dans les deux cas, c'est acheter des actifs. Pourtant, ce sont deux métiers très différents.",
        visuel: { type: "titre", titre: "Trader ou investir ?" },
      },
      {
        duree: 9,
        texte:
          "Regarde l'investisseur. Il achète pour des années. Il compte sur la croissance de l'entreprise, et il accepte de traverser des baisses.",
        visuel: { type: "figure", scene: "pp-horizon-long", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "Le trader, lui, travaille sur quelques minutes, quelques heures ou quelques jours. Il cherche à profiter des variations de prix, à la hausse comme à la baisse.",
        visuel: { type: "figure", scene: "horizons" },
      },
      {
        duree: 9,
        texte:
          "Conséquence : l'investisseur paie peu de frais. Le trader en paie à chaque opération. Et plus il opère souvent, plus ils pèsent lourd.",
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
          "Aucun n'est meilleur par nature. Le piège, c'est de mélanger les deux. Tu vois ce trade ? Le stop est ignoré, et la petite perte devient grande.",
        visuel: { type: "figure", scene: "pp-piege-long-terme", etape: 2 },
      },
      {
        duree: 7,
        texte:
          "Alors, avant de choisir, pose-toi trois questions. Quel horizon ? Quel argent ? Et combien de temps ?",
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
          type: "figure",
          scene: "pp-horizon-long",
          fiabilite: "calcul",
          legende:
            "Une action achetée 40,00 € tombe jusqu'à 30,00 €, soit 25 % de baisse, avant de remonter au-dessus de 50,00 €. L'investisseur a traversé la baisse sans vendre. Rien ne garantissait cette remontée : c'est le risque qu'il accepte.",
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
          type: "figure",
          scene: "pp-piege-long-terme",
          fiabilite: "calcul",
          legende:
            "Achat à 40,00 €, stop prévu à 38,00 € : la perte prévue est de 2,00 € par action. Le stop est ignoré « pour le long terme » et le prix glisse jusqu'à 32,00 € : 6,00 € de perte en plus, 8,00 € au total.",
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
        type: "figure",
        scene: "pp-deux-demarches",
        legende:
          "Même action, même prix d'achat. Le trader avait fixé son stop à 38,00 € et son objectif à 44,00 € : le stop est touché, il sort avec 2,00 € de perte par action. L'investisseuse garde son action pendant la baisse vers 35,00 €, comme elle l'avait prévu.",
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
      difficulte: 1,
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
      difficulte: 1,
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
      difficulte: 2,
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
      difficulte: 2,
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
      difficulte: 1,
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
    {
      id: "c02-q6",
      type: "graphique",
      difficulte: 2,
      enonce: "Un trader achète à 40,00 € avec un stop à 38,00 €. Touche la bougie qui déclenche ce stop.",
      scene: "pp-q-stop-trader",
      bonnes: [10],
      explication:
        "C'est la seule bougie qui descend sous 38,00 €, jusqu'à 37,80 € : le stop est exécuté et le trader sort avec la perte prévue, environ 2,00 € par action. Le prix remonte ensuite au-dessus de 40,00 €. C'est frustrant, mais la règle a fait son travail : limiter la perte au moment où le scénario était invalidé.",
      concepts: ["horizon"],
    },
    {
      id: "c02-q7",
      type: "comparaison",
      difficulte: 2,
      enonce:
        "Deux traders ont acheté à 40,00 € avec un stop prévu à 38,00 €. Lequel applique sa démarche jusqu'au bout ?",
      graphiques: [{ scene: "pp-q-respect-a" }, { scene: "pp-q-respect-b" }],
      bonne: 0,
      explication:
        "En A, la vente à 38,00 € limite la perte à 2,00 € par action, comme prévu. En B, la position reste ouverte sous le stop : à la dernière bougie, vers 32,00 €, la perte atteint 8,00 € par action et n'a plus de limite. Garder un trade perdant n'en fait pas un investissement.",
      concepts: ["horizon", "investissement"],
    },
    {
      id: "c02-q8",
      type: "unique",
      difficulte: 2,
      figure: { scene: "pp-horizon-long", etape: 1, legende: "Action achetée 40,00 €, détenue pendant toute la période." },
      enonce: "Au pire moment, de combien l'action a-t-elle baissé par rapport au prix d'achat ?",
      choix: ["10 %", "25 %", "30 %", "40 %"],
      bonne: 1,
      explication:
        "(40,00 − 30,00) ÷ 40,00 = 0,25, soit 25 %. Pour revenir ensuite de 30,00 à 40,00 €, il faut une hausse de 33 %. Traverser une telle baisse demande un horizon long et de l'argent dont on n'a pas besoin entre-temps.",
      concepts: ["investissement", "horizon"],
    },
    {
      id: "c02-q9",
      type: "unique",
      difficulte: 1,
      figure: {
        scene: "pp-deux-demarches",
        etape: 0,
        legende: "Achat à 40,00 €. Le trader a placé son stop à 38,00 € et son objectif à 44,00 €.",
      },
      enonce: "S'il a tort, combien le trader accepte-t-il de perdre par action ?",
      choix: ["0,50 €", "2,00 €", "4,00 €", "10,00 €"],
      bonne: 1,
      explication:
        "40,00 − 38,00 = 2,00 € par action : c'est la perte prévue si le stop est touché. Le trader la connaît avant d'entrer. 4,00 € est ce qu'il vise si l'objectif à 44,00 € est atteint.",
      concepts: ["horizon"],
    },
    {
      id: "c02-q10",
      type: "unique",
      difficulte: 2,
      contexte:
        "Paul fait 4 allers-retours par semaine, 50 semaines par an. Chaque aller-retour lui coûte 0,1 % du montant engagé.",
      enonce: "Sur l'année, que représentent ces frais, en pourcentage du montant engagé ?",
      choix: ["0,4 %", "2 %", "20 %", "200 %"],
      bonne: 2,
      explication:
        "4 × 50 = 200 allers-retours ; 200 × 0,1 % = 20 %. Paul doit gagner 20 % dans l'année rien que pour payer ses frais. Un investisseur qui achète une fois et garde des années paie ce coût une seule fois.",
      concepts: ["horizon"],
    },
    {
      id: "c02-q11",
      type: "unique",
      difficulte: 3,
      contexte:
        "Awa et Paul achètent la même action à 40,00 €. Awa compte la garder dix ans. Paul attend un rebond de quelques jours, avec un stop à 38,00 € et un objectif à 44,00 €. Trois semaines plus tard, l'action cote 36,00 €.",
      enonce: "Si chacun a appliqué sa démarche, où en sont-ils ?",
      choix: [
        "Paul est sorti à 38,00 € ; Awa garde son action",
        "Les deux ont vendu leur action à 38,00 €",
        "Paul garde son action ; Awa a tout vendu",
        "Aucun des deux n'a encore rien fait",
      ],
      bonne: 0,
      explication:
        "Pour aller à 36,00 €, le prix est passé par 38,00 € : le stop de Paul a été exécuté, avec la perte prévue de 2,00 € par action. Awa raisonne sur dix ans : une baisse à 36,00 € fait partie de ce qu'elle a accepté, tant que ses raisons d'acheter restent valables.",
      concepts: ["investissement", "horizon"],
    },
  ],
};

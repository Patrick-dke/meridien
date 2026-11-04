import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "formation-des-prix",
  titre: "Comment se forment les prix : offre, demande, carnet d'ordres",
  sousTitre: "Un prix n'est fixé par personne : il naît d'une rencontre",
  academie: "fondamentaux",
  module: "introduction",
  niveau: 1,
  dureeMin: 12,
  statut: "publie",
  misAJour: "2026-10-27",
  objectifs: [
    "Expliquer comment un prix se forme par la rencontre d'acheteurs et de vendeurs",
    "Lire un carnet d'ordres : bid, ask, quantités et spread",
    "Comprendre pourquoi un gros ordre fait bouger le prix",
  ],
  concepts: ["offre-demande", "carnet-ordres", "bid-ask"],
  prerequis: ["trading"],
  intro:
    "Un prix n'est pas fixé par une autorité : il naît à chaque instant de la rencontre entre ceux qui veulent acheter et ceux qui veulent vendre. Le carnet d'ordres rend cette rencontre visible.",
  capsule: {
    titre: "D'où vient un prix ?",
    scenes: [
      {
        duree: 8,
        texte:
          "Qui décide du prix d'une action ? Personne en particulier. Le prix naît de la rencontre entre acheteurs et vendeurs.",
        visuel: { type: "titre", titre: "D'où vient un prix ?" },
      },
      {
        duree: 11,
        texte:
          "Regarde ce carnet d'ordres. À droite, les vendeurs, avec le prix auquel ils acceptent de vendre. À gauche, les acheteurs, avec le prix qu'ils proposent.",
        visuel: { type: "figure", scene: "carnet-simple" },
      },
      {
        duree: 11,
        texte:
          "Le meilleur vendeur demande 50 euros et 2 centimes. C'est l'ask. Le meilleur acheteur propose 50 euros. C'est le bid. L'écart de deux centimes, c'est le spread.",
        visuel: { type: "figure", scene: "carnet-simple" },
      },
      {
        duree: 8,
        texte:
          "Tant que personne ne cède, rien ne s'échange. Un échange a lieu quand quelqu'un accepte le prix d'en face.",
        visuel: { type: "figure", scene: "carnet-mince", etape: 0 },
      },
      {
        duree: 9,
        texte:
          "Imagine maintenant un achat immédiat de 1 000 actions. Il prend d'abord les 300 actions du meilleur vendeur. Puis il monte, niveau après niveau.",
        visuel: { type: "figure", scene: "carnet-mince", etape: 1 },
      },
      {
        duree: 11,
        texte:
          "Au final, le prix moyen est de 50 euros et 3 centimes. Et le dernier échange s'est fait plus haut encore. Tu vois ? La demande a fait monter le prix.",
        visuel: {
          type: "formule",
          texte: "50 030 € ÷ 1 000 actions = 50,03 €",
          legende: "Prix moyen de l'achat",
        },
      },
      {
        duree: 9,
        texte:
          "Retiens bien ceci. Quand les acheteurs sont plus pressés que les vendeurs, le prix monte. Dans le cas inverse, il baisse.",
        visuel: {
          type: "points",
          items: [
            "Acheteurs pressés : le prix monte",
            "Vendeurs pressés : le prix baisse",
          ],
        },
      },
    ],
  },
  cours: [
    {
      titre: "Un prix, c'est une rencontre",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Sur un marché, chacun peut proposer d'acheter ou de vendre une quantité à un prix donné. Tant qu'acheteurs et vendeurs ne sont pas d'accord, rien ne s'échange. Dès qu'un acheteur accepte le prix d'un vendeur, ou l'inverse, une transaction a lieu : son prix devient le dernier prix affiché.",
        },
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Quand les acheteurs pressés sont plus nombreux que les vendeurs pressés, ils acceptent des prix de plus en plus élevés : le prix monte. Dans le cas inverse, il baisse. C'est le mécanisme de l'**offre et de la demande**.",
        },
      ],
    },
    {
      titre: "Le carnet d'ordres",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Les ordres en attente sont rangés dans un [[carnet-ordres|carnet d'ordres]]. Côté vendeurs, les prix demandés sont classés du moins cher au plus cher ; côté acheteurs, les prix proposés sont classés du plus élevé au plus bas. Chaque ligne indique une quantité disponible à ce prix.",
        },
        {
          type: "figure",
          scene: "pp-carnet-fcfa",
          legende:
            "Le carnet d'une action cotée en FCFA. Côté vendeurs, le moins cher demande 2 505 FCFA pour 120 actions : c'est l'ask. Côté acheteurs, le plus offrant propose 2 500 FCFA pour 150 actions : c'est le bid. Spread : 5 FCFA.",
        },
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "Le [[ask|prix vendeur (ask)]] est le prix le plus bas auquel quelqu'un accepte de vendre : c'est le prix auquel tu peux acheter immédiatement.",
            "Le [[bid|prix acheteur (bid)]] est le prix le plus élevé que quelqu'un propose : c'est le prix auquel tu peux vendre immédiatement.",
            "Le [[spread|spread]] est l'écart entre les deux. Il est toujours positif ou nul.",
          ],
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "Tu achètes à l'ask et tu vends au bid. Acheter puis revendre immédiatement coûte donc le spread.",
        },
      ],
    },
    {
      titre: "Quand un gros ordre arrive",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un ordre au marché prend la quantité disponible au meilleur prix, puis, s'il en faut davantage, aux prix suivants. Un gros achat « consomme » ainsi plusieurs niveaux du carnet : le prix moyen obtenu est moins bon que le prix affiché, et le dernier prix échangé a monté.",
        },
        {
          type: "figure",
          scene: "pp-carnet-vente-marche",
          fiabilite: "calcul",
          legende:
            "Le même mécanisme dans l'autre sens : une vente au marché de 900 actions prend 250 actions à 50,00 €, 500 à 49,99 € et 150 à 49,98 €. Prix moyen d'environ 49,99 € ; le dernier échange se fait à 49,98 €, le prix affiché baisse.",
        },
        {
          type: "p",
          texte:
            "C'est pourquoi la profondeur du carnet compte : un carnet bien fourni absorbe un gros ordre sans bouger, un carnet mince le laisse déplacer le prix. Cette capacité d'absorption s'appelle la [[liquidite|liquidité]], sujet du chapitre « Liquidité et volatilité ».",
        },
      ],
    },
    {
      titre: "Marchés centralisés et décentralisés",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Sur une bourse d'actions, il existe un carnet central visible par tous les intermédiaires. Sur le [[forex|Forex]], il n'y a pas de bourse unique : chaque banque ou courtier affiche ses propres prix, et ton courtier te montre son bid et son ask. Le principe de l'offre et de la demande reste le même, mais tu ne vois qu'une partie du marché.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "carnet-simple",
      legende:
        "Un carnet d'ordres : 300 actions proposées à 50,02 €, 250 actions demandées à 50,00 €. Le spread est de 0,02 €.",
    },
    {
      type: "figure",
      scene: "carnet-mince",
      legende:
        "Un achat au marché de 1 000 actions consomme quatre niveaux de prix : prix moyen 50,03 € au lieu des 50,02 € affichés.",
    },
  ],
  exemple: {
    titre: "Calculer le prix moyen d'un ordre",
    blocs: [
      {
        type: "p",
        texte:
          "Reprenons le carnet de la figure. Tu veux acheter 1 000 actions immédiatement. Voici ce que l'ordre prend à chaque niveau :",
      },
      {
        type: "tableau",
        fiabilite: "calcul",
        entetes: ["Prix", "Quantité prise", "Montant"],
        lignes: [
          ["50,02 €", "300", "15 006,00 €"],
          ["50,03 €", "450", "22 513,50 €"],
          ["50,04 €", "200", "10 008,00 €"],
          ["50,05 €", "50", "2 502,50 €"],
          ["**Total**", "**1 000**", "**50 030,00 €**"],
        ],
      },
      {
        type: "formule",
        fiabilite: "calcul",
        texte: "Prix moyen = 50 030,00 € ÷ 1 000 = 50,03 €",
        legende:
          "Un centime de plus par action que le meilleur prix affiché, soit 10 € sur l'ensemble de l'ordre.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Croire que le prix affiché est celui qu'on obtiendra",
      texte:
        "Le prix affiché est celui du dernier échange. Tu achètes à l'ask, tu vends au bid, et un ordre important peut être exécuté sur plusieurs niveaux.",
    },
    {
      titre:
        "Penser que le prix monte parce qu'il y a plus d'acheteurs que de vendeurs",
      texte:
        "Chaque transaction a exactement un acheteur et un vendeur. Le prix monte quand les acheteurs sont plus pressés, c'est-à-dire prêts à accepter le prix des vendeurs.",
    },
    {
      titre: "Oublier qu'on ne voit qu'une partie du marché",
      texte:
        "Sur le Forex et les CFD, tu vois les prix de ton courtier, pas l'ensemble des ordres du marché.",
    },
  ],
  resume: [
    "Un prix naît d'une transaction entre un acheteur et un vendeur qui acceptent le même prix.",
    "Le carnet d'ordres liste les ordres en attente : vendeurs (ask) d'un côté, acheteurs (bid) de l'autre.",
    "On achète à l'ask, on vend au bid ; l'écart est le spread.",
    "Un gros ordre au marché consomme plusieurs niveaux : le prix moyen est moins bon que le prix affiché.",
  ],
  exercices: [
    {
      id: "pp-03-e1",
      type: "calcul",
      consigne:
        "Dans le carnet d'une action, la meilleure offre d'achat (bid) est à 49,95 € et la meilleure offre de vente (ask) à 50,05 €. Si tu achètes au marché puis revends aussitôt au marché, combien perds-tu par action, sans autres frais ?",
      reponse: 0.1,
      tolerance: 0.005,
      unite: "€",
      corrige:
        "Tu achètes à l'ask (50,05 €) et revends au bid (49,95 €) : tu perds l'écart, soit 0,10 € par action. C'est le spread, un coût payé à chaque aller-retour.",
      concepts: ["bid-ask"],
    },
    {
      id: "pp-03-e2",
      type: "calcul",
      consigne:
        "Côté vente, le carnet affiche 200 actions à 50,05 € puis 300 actions à 50,10 €. Tu passes un ordre d'achat au marché de 300 actions. Quel prix moyen paies-tu par action (arrondi au centime) ?",
      reponse: 50.07,
      tolerance: 0.01,
      unite: "€",
      aide: "Ton ordre consomme d'abord le meilleur prix, puis le niveau suivant.",
      corrige:
        "200 actions à 50,05 € = 10 010 €, puis les 100 restantes à 50,10 € = 5 010 €. Total 15 020 € pour 300 actions, soit 50,07 € en moyenne. Un gros ordre au marché « remonte » le carnet.",
      concepts: ["carnet-ordres", "offre-demande"],
    },
  ],
  quiz: [
    {
      id: "c03-q1",
      difficulte: 1,
      type: "unique",
      enonce:
        "Le meilleur vendeur demande 50,02 € et le meilleur acheteur propose 50,00 €. À quel prix peux-tu acheter immédiatement ?",
      choix: ["50,00 €", "50,01 €", "50,02 €", "Au prix que tu choisis"],
      bonne: 2,
      explication:
        "On achète immédiatement au meilleur prix vendeur, l'ask : 50,02 €.",
      concepts: ["bid-ask", "carnet-ordres"],
    },
    {
      id: "c03-q2",
      difficulte: 1,
      type: "unique",
      enonce: "Quel est le spread dans ce carnet ?",
      choix: [
        "0,01 €",
        "0,02 €",
        "50,01 €",
        "Il n'y a pas de spread sur les actions",
      ],
      bonne: 1,
      explication: "Spread = ask − bid = 50,02 − 50,00 = 0,02 €.",
      concepts: ["bid-ask"],
    },
    {
      id: "c03-q3",
      difficulte: 2,
      type: "vraifaux",
      enonce:
        "Si le prix monte, c'est qu'il y a eu plus d'acheteurs que de vendeurs.",
      reponse: false,
      explication:
        "Chaque échange a un acheteur et un vendeur. Le prix monte quand les acheteurs sont plus pressés : ils acceptent des prix de vente de plus en plus élevés.",
      concepts: ["offre-demande"],
    },
    {
      id: "c03-q4",
      difficulte: 3,
      type: "unique",
      enonce:
        "Un achat au marché de 500 actions arrive : il y a 300 actions à 50,02 € puis 450 à 50,03 €. Quel est le prix moyen obtenu ?",
      choix: ["50,02 €", "50,024 €", "50,025 €", "50,03 €"],
      bonne: 1,
      explication:
        "300 × 50,02 + 200 × 50,03 = 25 012 € ; divisé par 500 actions, cela fait 50,024 €.",
      concepts: ["carnet-ordres"],
    },
    {
      id: "c03-q5",
      difficulte: 2,
      type: "ordre",
      enonce:
        "Remets dans l'ordre ce qui se passe quand un gros achat au marché arrive.",
      etapes: [
        "L'ordre prend toute la quantité disponible au meilleur prix vendeur",
        "Il passe au niveau de prix suivant, plus cher",
        "Il continue jusqu'à obtenir toute la quantité demandée",
        "Le dernier prix échangé, donc le prix affiché, a monté",
      ],
      explication:
        "L'ordre remonte le carnet niveau par niveau : c'est ainsi qu'un achat important fait monter le prix.",
      concepts: ["carnet-ordres", "offre-demande"],
    },
    {
      id: "c03-q6",
      difficulte: 2,
      type: "vraifaux",
      enonce:
        "Sur le Forex, ton courtier te montre l'ensemble des ordres de tous les participants du marché.",
      reponse: false,
      explication:
        "Le Forex est décentralisé : tu vois les prix de ton courtier, pas un carnet central unique.",
      concepts: ["carnet-ordres"],
    },
    {
      id: "c03-q7",
      type: "graphique",
      difficulte: 1,
      enonce:
        "Chaque bougie résume une séance : son corps va du prix d'ouverture au prix de clôture. Touche la séance où le prix a le plus baissé entre l'ouverture et la clôture.",
      scene: "pp-q-pression",
      bonnes: [6],
      explication:
        "Cette séance ouvre à 50,50 € et clôture à 49,60 € : 0,90 € de baisse, la plus forte de la période. Les vendeurs pressés ont accepté des prix de plus en plus bas. Attention au piège : la séance qui descend le plus bas en cours de route, jusqu'à 49,30 €, finit presque là où elle avait commencé.",
      concepts: ["offre-demande"],
    },
    {
      id: "c03-q8",
      type: "unique",
      difficulte: 1,
      figure: { scene: "pp-q-carnet-lecture", legende: "Cinq niveaux de vendeurs, cinq niveaux d'acheteurs." },
      enonce: "Tu veux vendre immédiatement 100 actions. À quel prix sont-elles vendues ?",
      choix: ["25,05 €", "25,08 €", "25,04 €", "25,11 €"],
      bonne: 0,
      explication:
        "On vend au bid, le meilleur prix proposé par un acheteur : 25,05 €, où 300 actions sont demandées, assez pour tes 100. 25,08 € est l'ask, le prix auquel tu pourrais acheter.",
      concepts: ["bid-ask", "carnet-ordres"],
    },
    {
      id: "c03-q9",
      type: "unique",
      difficulte: 3,
      contexte: "Tu passes un ordre d'achat au marché de 600 actions sur ce carnet.",
      figure: { scene: "pp-q-carnet-lecture", legende: "Cinq niveaux de vendeurs, cinq niveaux d'acheteurs." },
      enonce: "Quel prix moyen paies-tu par action ?",
      choix: ["25,08 €", "25,09 €", "25,11 €", "25,095 €"],
      bonne: 1,
      explication:
        "L'ordre prend les 400 actions à 25,08 €, puis 200 à 25,11 € : 10 032 + 5 022 = 15 054 € ; 15 054 ÷ 600 = 25,09 €. La moyenne simple des deux prix, 25,095 €, est fausse : les quantités ne sont pas égales. Le dernier échange se fait à 25,11 € : ton achat a fait monter le prix affiché.",
      concepts: ["carnet-ordres", "offre-demande"],
    },
    {
      id: "c03-q10",
      type: "comparaison",
      difficulte: 2,
      enonce:
        "Tu veux acheter 400 actions au marché. Dans quel carnet sont-elles toutes servies au meilleur prix affiché, 50,02 € ?",
      graphiques: [{ scene: "pp-q-carnet-a" }, { scene: "pp-q-carnet-b" }],
      bonne: 1,
      explication:
        "En B, 500 actions sont proposées à 50,02 € : tes 400 actions sont toutes servies à ce prix. En A, il n'y en a que 300 ; les 100 suivantes coûtent 50,03 €, soit un prix moyen de 50,0225 €. Plus le carnet est fourni au meilleur prix, moins un ordre déplace le prix.",
      concepts: ["carnet-ordres"],
    },
    {
      id: "c03-q11",
      type: "association",
      difficulte: 1,
      enonce: "Associe chaque terme à sa définition.",
      paires: [
        ["Bid", "Meilleur prix proposé par un acheteur"],
        ["Ask", "Meilleur prix demandé par un vendeur"],
        ["Spread", "Écart entre l'ask et le bid"],
        ["Profondeur", "Quantités disponibles à chaque prix"],
      ],
      explication:
        "Tu achètes à l'ask et tu vends au bid ; le spread est le coût d'un aller-retour immédiat. La profondeur dit combien d'actions un ordre peut prendre avant de déplacer le prix.",
      concepts: ["bid-ask", "carnet-ordres"],
    },
  ],
};

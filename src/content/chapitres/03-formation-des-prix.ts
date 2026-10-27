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
  misAJour: "2026-10-26",
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
          "Voici un carnet d'ordres. À droite, les vendeurs et le prix auquel ils acceptent de vendre. À gauche, les acheteurs et le prix qu'ils proposent.",
        visuel: { type: "figure", scene: "carnet-simple" },
      },
      {
        duree: 11,
        texte:
          "Le meilleur vendeur demande 50,02 euros : c'est l'ask. Le meilleur acheteur propose 50,00 euros : c'est le bid. L'écart de deux centimes, c'est le spread.",
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
          "Imaginons un achat immédiat de 1 000 actions. Il prend les 300 actions à 50,02, puis monte aux niveaux suivants, jusqu'à 50,05.",
        visuel: { type: "figure", scene: "carnet-mince", etape: 1 },
      },
      {
        duree: 11,
        texte:
          "Prix moyen obtenu : 50,03. Et le dernier échange s'est fait à 50,05 : le prix affiché a monté. C'est ainsi que la demande fait monter un prix.",
        visuel: {
          type: "formule",
          texte: "50 030 € ÷ 1 000 actions = 50,03 €",
          legende: "Prix moyen de l'achat",
        },
      },
      {
        duree: 9,
        texte:
          "Retiens : quand les acheteurs sont plus pressés que les vendeurs, le prix monte ; dans le cas inverse, il baisse.",
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
      type: "vraifaux",
      enonce:
        "Sur le Forex, ton courtier te montre l'ensemble des ordres de tous les participants du marché.",
      reponse: false,
      explication:
        "Le Forex est décentralisé : tu vois les prix de ton courtier, pas un carnet central unique.",
      concepts: ["carnet-ordres"],
    },
  ],
};

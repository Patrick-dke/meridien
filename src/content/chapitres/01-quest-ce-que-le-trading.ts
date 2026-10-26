import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "quest-ce-que-le-trading",
  titre: "Qu'est-ce que le trading, et ce qu'il n'est pas",
  sousTitre: "Acheter, vendre, et pourquoi la plupart des débutants perdent de l'argent",
  academie: "fondamentaux",
  module: "introduction",
  niveau: 1,
  dureeMin: 10,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Expliquer ce qu'est le trading et comment une opération gagne ou perd de l'argent",
    "Distinguer une position acheteuse d'une position vendeuse",
    "Comprendre pourquoi le risque de perte est au cœur de l'activité",
  ],
  concepts: ["trading", "position-longue-courte", "risque-de-perte"],
  prerequis: [],
  intro:
    "Avant de parler de graphiques ou de stratégies, il faut savoir ce que l'on fait vraiment quand on « trade » : acheter, vendre, et accepter un risque. Ce chapitre pose ces bases, sans promesse.",
  capsule: {
    titre: "Le trading en une minute",
    scenes: [
      {
        duree: 9,
        texte: "Le trading, c'est acheter et vendre des actifs financiers pour profiter de leurs variations de prix. Rien de plus, rien de moins.",
        visuel: { type: "titre", titre: "Qu'est-ce que le trading ?", sousTitre: "Acheter, vendre, et accepter un risque" },
      },
      {
        duree: 5,
        texte: "Exemple : tu achètes une action à 50 euros.",
        visuel: { type: "figure", scene: "trading-aller-retour", etape: 1 },
      },
      {
        duree: 5,
        texte: "Quelques jours plus tard, elle vaut 53,30 euros. Tu la revends.",
        visuel: { type: "figure", scene: "trading-aller-retour", etape: 2 },
      },
      {
        duree: 6,
        texte: "Ton gain, c'est l'écart entre les deux prix : 3,30 euros par action, avant les frais.",
        visuel: { type: "figure", scene: "trading-aller-retour", etape: 3 },
      },
      {
        duree: 9,
        texte: "On peut aussi gagner quand le prix baisse : on vend d'abord, on rachète ensuite, moins cher. C'est une position vendeuse.",
        visuel: { type: "figure", scene: "trading-vente-decouvert", etape: 3 },
      },
      {
        duree: 10,
        texte: "Mais chaque trade peut aussi perdre. Le prix peut aller dans le mauvais sens, et les frais s'ajoutent à chaque opération.",
        visuel: {
          type: "points",
          titre: "Ce que le trading n'est pas",
          items: ["Un revenu garanti", "Un jeu sans risque", "Une prédiction de l'avenir"],
        },
      },
      {
        duree: 9,
        texte: "La plupart des débutants perdent de l'argent. Ici, tu apprendras d'abord à mesurer et à limiter ce risque, en argent fictif.",
        visuel: { type: "titre", titre: "D'abord le risque", sousTitre: "Ensuite, éventuellement, le gain" },
      },
    ],
  },
  cours: [
    {
      titre: "Acheter bas, vendre haut… ou l'inverse",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Le **trading** consiste à acheter et vendre des actifs financiers — [[action|actions]], devises, [[indice-boursier|indices]], [[matieres-premieres|matières premières]], cryptomonnaies — pour profiter de leurs variations de prix. Le résultat d'une opération est simple : l'écart entre le prix d'entrée et le prix de sortie, multiplié par la quantité, moins les frais.",
        },
        {
          type: "formule",
          fiabilite: "calcul",
          texte: "Résultat = (prix de sortie − prix d'entrée) × quantité − frais",
          legende: "Pour une position acheteuse. Pour une position vendeuse, on inverse : (prix d'entrée − prix de sortie).",
        },
        {
          type: "p",
          texte:
            "Exemple : tu achètes 10 actions à 50,00 € et tu les revends à 53,30 €. Le résultat brut est de (53,30 − 50,00) × 10 = 33 €. Si le prix était tombé à 47,00 €, la perte aurait été de 30 €.",
        },
      ],
    },
    {
      titre: "Positions acheteuses et vendeuses",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Une [[position-acheteuse|position acheteuse]] (ou « longue ») gagne quand le prix monte. Une [[position-vendeuse|position vendeuse]] (ou « courte ») gagne quand il baisse : on vend d'abord, on rachète ensuite.",
        },
        {
          type: "p",
          texte:
            "Vendre ce que l'on ne possède pas peut surprendre. Sur le [[forex|Forex]] ou avec des [[cfd|CFD]], c'est pourtant aussi simple qu'acheter : le [[courtier|courtier]] gère l'opération. En contrepartie, la perte d'une position vendeuse n'a pas de plafond théorique, puisque le prix peut monter sans limite.",
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "Le sens de la position compte moins que la qualité de la décision et la taille du risque pris. On peut perdre dans les deux sens.",
        },
      ],
    },
    {
      titre: "Ce que le trading n'est pas",
      blocs: [
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "**Un revenu garanti** : aucune méthode ne gagne à chaque fois, et les meilleures connaissent de longues séries de pertes.",
            "**Un jeu sans risque** : on peut perdre tout le capital engagé, et l'[[effet-de-levier|effet de levier]] permet de perdre plus vite qu'on ne l'imagine.",
            "**Une prédiction de l'avenir** : personne ne sait ce que fera le prix. On raisonne en probabilités et on prépare sa sortie avant d'entrer.",
          ],
        },
        {
          type: "encadre",
          variante: "risque",
          fiabilite: "fait",
          texte:
            "Dans l'Union européenne, les courtiers qui proposent des CFD doivent afficher la proportion de leurs clients particuliers qui perdent de l'argent sur ces produits. Ces chiffres montrent que c'est la majorité d'entre eux. C'est le point de départ honnête de toute formation.",
        },
      ],
    },
    {
      titre: "Pourquoi apprendre quand même ?",
      blocs: [
        {
          type: "p",
          texte:
            "Comprendre les marchés reste utile : pour investir sur le long terme, pour lire l'actualité économique, ou pour décider en connaissance de cause de ne pas trader. Cette académie ne promet aucun gain. Elle t'apprend à analyser avec méthode, à mesurer un risque et à tester une idée avant d'y croire, en argent fictif.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "trading-aller-retour",
      legende: "Achat à 50,00 €, revente à 53,30 € : 3,30 € de gain par action, avant frais.",
    },
    {
      type: "figure",
      scene: "trading-vente-decouvert",
      legende: "Position vendeuse : vente à 60,50 €, rachat à 57,50 €. Le prix a baissé de 3,00 €, c'est le gain par unité.",
    },
  ],
  exemple: {
    titre: "Quatre opérations, quatre résultats",
    blocs: [
      {
        type: "tableau",
        fiabilite: "calcul",
        entetes: ["Opération", "Entrée", "Sortie", "Quantité", "Résultat brut"],
        lignes: [
          ["Achat", "50,00 €", "53,30 €", "10", "+33,00 €"],
          ["Achat", "50,00 €", "47,00 €", "10", "−30,00 €"],
          ["Vente", "60,50 €", "57,50 €", "10", "+30,00 €"],
          ["Vente", "60,50 €", "62,00 €", "10", "−15,00 €"],
        ],
        legende: "Résultats avant frais. Pour une vente, l'entrée est le prix de vente et la sortie le prix de rachat.",
      },
      {
        type: "p",
        texte:
          "Dans les quatre cas, le calcul est le même : l'écart entre les deux prix, dans le bon sens, multiplié par la quantité. Les frais, étudiés plus loin, réduisent chacun de ces résultats.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Croire qu'on peut gagner à tous les coups",
      texte:
        "Même une méthode rentable perd souvent. Chercher celle qui ne perd jamais pousse à changer de stratégie à chaque perte, ou à suivre des vendeurs de promesses.",
    },
    {
      titre: "Oublier qu'une position vendeuse peut perdre sans plafond",
      texte:
        "À l'achat, le prix ne peut pas descendre sous zéro. À la vente, il peut monter très haut. D'où l'importance du stop loss, étudié plus loin.",
    },
    {
      titre: "Ignorer les frais",
      texte:
        "Spread, commissions et slippage se paient à chaque opération. Sur de petits mouvements, ils peuvent absorber tout le gain.",
    },
  ],
  resume: [
    "Le trading consiste à acheter et vendre des actifs pour profiter de leurs variations de prix.",
    "Résultat = écart entre prix d'entrée et de sortie × quantité − frais.",
    "Une position acheteuse gagne à la hausse, une position vendeuse gagne à la baisse.",
    "Aucune méthode ne gagne à chaque fois ; la majorité des particuliers perdent de l'argent sur les CFD.",
    "Avant tout gain, on apprend à mesurer et à limiter le risque.",
  ],
  quiz: [
    {
      id: "c01-q1",
      type: "unique",
      enonce: "Tu achètes 20 actions à 40 € et tu les revends à 43 €. Quel est le résultat brut ?",
      choix: ["+3 €", "+60 €", "+43 €", "+86 €"],
      bonne: 1,
      explication: "(43 − 40) × 20 = 60 €, avant frais.",
      concepts: ["trading"],
    },
    {
      id: "c01-q2",
      type: "vraifaux",
      enonce: "Une position vendeuse gagne de l'argent quand le prix baisse.",
      reponse: true,
      explication: "On vend d'abord, on rachète ensuite moins cher : l'écart est le gain.",
      concepts: ["position-longue-courte"],
    },
    {
      id: "c01-q3",
      type: "unique",
      enonce: "Tu vends 10 unités à 60,50 €, puis tu les rachètes à 62,00 €. Quel est le résultat brut ?",
      choix: ["+15 €", "−15 €", "+1,50 €", "−150 €"],
      bonne: 1,
      explication: "Pour une vente : (60,50 − 62,00) × 10 = −15 €. Le prix a monté, la position vendeuse perd.",
      concepts: ["position-longue-courte", "trading"],
    },
    {
      id: "c01-q4",
      type: "multiple",
      enonce: "Parmi ces affirmations, lesquelles sont vraies ?",
      choix: [
        "Une méthode rentable peut connaître de longues séries de pertes.",
        "Un bon trader ne perd jamais plus de deux trades d'affilée.",
        "Les frais réduisent le résultat de chaque opération.",
        "Avec un effet de levier, on peut perdre plus que la somme mise en garantie pour un trade.",
      ],
      bonnes: [0, 2, 3],
      explication:
        "Une méthode rentable perd souvent, parfois plusieurs fois d'affilée. Les frais s'appliquent à chaque opération, et le levier amplifie les pertes au-delà de la garantie déposée.",
      concepts: ["risque-de-perte"],
    },
    {
      id: "c01-q5",
      type: "vraifaux",
      enonce: "La perte maximale d'une position vendeuse est limitée au prix de vente.",
      reponse: false,
      explication:
        "Le prix peut monter sans limite théorique : la perte d'une position vendeuse n'a pas de plafond, d'où l'importance du stop loss.",
      concepts: ["position-longue-courte", "risque-de-perte"],
    },
    {
      id: "c01-q6",
      type: "unique",
      enonce: "Quel est l'objectif principal de cette académie ?",
      choix: [
        "Fournir des signaux d'achat et de vente",
        "Garantir un revenu complémentaire",
        "Apprendre à analyser avec méthode et à maîtriser le risque, en argent fictif",
        "Repérer les actions qui vont monter",
      ],
      bonne: 2,
      explication: "La plateforme est un environnement d'apprentissage, ni un service de signaux ni une promesse de gains.",
      concepts: ["trading"],
    },
  ],
};

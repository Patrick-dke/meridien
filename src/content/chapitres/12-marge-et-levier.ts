import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "marge-et-levier",
  titre: "Marge et effet de levier",
  sousTitre:
    "L'outil qui rend le trading accessible, et celui qui fait perdre le plus vite",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 2,
  dureeMin: 12,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Expliquer la marge et la calculer",
    "Comprendre ce que l'effet de levier amplifie réellement",
    "Savoir ce qu'est un appel de marge et comment l'éviter",
  ],
  concepts: ["marge", "levier"],
  prerequis: ["lot"],
  intro:
    "L'effet de levier permet d'ouvrir une position bien plus grande que son capital. C'est l'outil qui rend le trading de CFD et de Forex accessible avec peu d'argent, et celui qui fait perdre le plus vite.",
  capsule: {
    titre: "Le levier, en vrai",
    scenes: [
      {
        duree: 10,
        texte:
          "Avec 1 000 euros, tu peux ouvrir une position de 30 000 euros. Comment ? Grâce à l'effet de levier. Et c'est là que le danger commence.",
        visuel: {
          type: "titre",
          titre: "1 000 € → 30 000 €",
          sousTitre: "L'effet de levier",
        },
      },
      {
        duree: 11,
        texte:
          "Le courtier ne te donne pas cet argent : il bloque une garantie, la marge. Avec un levier de 1 pour 30, elle vaut un trentième de la position.",
        visuel: {
          type: "formule",
          texte: "Marge = taille de la position ÷ levier",
          legende: "30 000 € ÷ 30 = 1 000 €",
        },
      },
      {
        duree: 6,
        texte:
          "Sans levier, une position de 1 000 euros : une baisse de 1 % te coûte 10 euros.",
        visuel: { type: "figure", scene: "levier-comparaison", etape: 0 },
      },
      {
        duree: 10,
        texte:
          "Avec un levier de 1 pour 10, et toute la position permise : 10 000 euros. La même baisse coûte 100 euros, 10 % du capital.",
        visuel: { type: "figure", scene: "levier-comparaison", etape: 1 },
      },
      {
        duree: 8,
        texte:
          "Avec 1 pour 30 : 30 000 euros de position. 300 euros perdus, soit 30 % du capital pour un mouvement de 1 %.",
        visuel: { type: "figure", scene: "levier-comparaison", etape: 2 },
      },
      {
        duree: 9,
        texte:
          "Si tes pertes réduisent trop ton capital, le courtier ferme tes positions : c'est l'appel de marge, souvent au pire moment.",
        visuel: {
          type: "points",
          titre: "L'appel de marge",
          items: [
            "Les pertes réduisent ton capital",
            "Sous un seuil, le courtier ferme tes positions",
          ],
        },
      },
      {
        duree: 10,
        texte:
          "Retiens : le levier ne change pas le marché, il change la taille de ta position. Le risque se maîtrise par la taille, pas par le levier disponible.",
        visuel: {
          type: "titre",
          titre: "Le risque, c'est la taille",
          sousTitre: "Pas le levier disponible",
        },
      },
    ],
  },
  cours: [
    {
      titre: "La marge",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Pour ouvrir une position à effet de levier, tu ne paies pas sa valeur totale : le courtier bloque une partie de ton capital en garantie, la [[marge|marge]].",
        },
        {
          type: "formule",
          fiabilite: "calcul",
          texte: "Marge requise = taille de la position ÷ levier",
          legende:
            "Position de 30 000 € avec un levier de 1:30 : 30 000 ÷ 30 = 1 000 € de marge.",
        },
        {
          type: "p",
          texte:
            "La marge n'est pas un coût : elle est libérée à la fermeture de la position. Mais elle est immobilisée et, surtout, tes pertes ne se limitent pas à elle : elles se calculent sur la position entière.",
        },
      ],
    },
    {
      titre: "Ce que le levier amplifie",
      blocs: [
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "L'[[effet-de-levier|effet de levier]] ne rend pas le marché plus volatil. Il permet d'ouvrir une position plus grande que ton capital, et c'est la taille de la position qui détermine le gain ou la perte. Une variation de 1 % sur une position de 30 000 € représente 300 €, que tu aies déposé 1 000 € de marge ou 30 000 €.",
        },
        {
          type: "formule",
          fiabilite: "calcul",
          texte:
            "Perte en % du capital = levier utilisé × variation du prix en %",
          legende:
            "Avec une position de 30 fois le capital, une baisse de 1 % coûte 30 % du capital ; une baisse d'environ 3,3 % l'efface entièrement.",
        },
        {
          type: "encadre",
          variante: "risque",
          fiabilite: "fait",
          texte:
            "Dans l'Union européenne, le levier proposé aux particuliers sur les CFD est plafonné : 1:30 sur les grandes paires de devises, 1:2 sur les cryptomonnaies par exemple. Des courtiers installés ailleurs proposent 1:500 ou plus : c'est un argument commercial, pas un avantage.",
        },
      ],
    },
    {
      titre: "L'appel de marge",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Tant qu'une position est ouverte, le courtier compare ton capital, pertes et gains latents compris, à la marge requise. Si ce capital passe sous un seuil, il te demande de déposer des fonds ou réduit tes positions : c'est l'[[appel-de-marge|appel de marge]]. Au-delà d'un second seuil, souvent appelé stop out, il ferme lui-même tes positions.",
        },
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Dans l'Union européenne, les particuliers bénéficient d'une protection contre le solde négatif sur les CFD : ils ne peuvent pas perdre plus que le capital du compte. Ce n'est pas le cas partout.",
        },
      ],
    },
    {
      titre: "Utiliser le levier sans se brûler",
      blocs: [
        {
          type: "liste",
          fiabilite: "convention",
          items: [
            "Raisonner en **risque par opération** (la perte si le stop est touché), jamais en levier disponible.",
            "Calculer la taille de position à partir du stop, puis vérifier que la marge requise reste une petite partie du capital.",
            "Ne pas ouvrir plusieurs positions qui perdraient ensemble (même devise, même indice) en croyant diversifier.",
          ],
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "levier-comparaison",
      legende:
        "Même capital de 1 000 €, même baisse de 1 % : la perte dépend de la taille de position que le levier a permise.",
    },
  ],
  exemple: {
    titre: "Même levier, risques sans commune mesure",
    blocs: [
      {
        type: "p",
        texte:
          "Deux comptes de 2 000 € avec un levier maximal de 1:30. Le compte A ouvre une position de 60 000 €, toute la marge disponible ; le compte B, une position de 5 000 €, calculée à partir de son stop. Le prix baisse de 2 %.",
      },
      {
        type: "tableau",
        fiabilite: "calcul",
        entetes: ["", "Compte A", "Compte B"],
        lignes: [
          ["Position", "60 000 €", "5 000 €"],
          ["Marge immobilisée", "2 000 €", "≈ 167 €"],
          ["Perte pour une baisse de 2 %", "1 200 €", "100 €"],
          ["Part du capital perdue", "60 %", "5 %"],
        ],
      },
      {
        type: "p",
        texte:
          "Même levier disponible, résultats sans commune mesure : c'est la taille de position qui fait le risque. En pratique, le compte A aurait sans doute subi un appel de marge avant même d'atteindre −2 %.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Confondre levier disponible et levier utilisé",
      texte:
        "Un levier de 1:30 est un plafond. Ce qui compte, c'est la taille de position réellement ouverte par rapport au capital.",
    },
    {
      titre: "Croire que la marge est la perte maximale",
      texte:
        "Les pertes se calculent sur la position entière ; elles peuvent consommer tout le capital du compte.",
    },
    {
      titre: "Choisir un courtier pour son levier élevé",
      texte:
        "Un levier de 1:500 n'améliore aucune méthode : il permet seulement de perdre plus vite.",
    },
  ],
  resume: [
    "La marge est une garantie : taille de la position ÷ levier.",
    "Le levier permet d'ouvrir une position plus grande ; gains et pertes se calculent sur la position entière.",
    "Perte en % du capital = levier utilisé × variation du prix.",
    "L'appel de marge puis le stop out ferment les positions quand le capital ne couvre plus la marge.",
    "Le risque se maîtrise par la taille de position, pas par le levier disponible.",
  ],
  exercices: [
    {
      id: "pp-12-e1",
      type: "calcul",
      consigne:
        "Tu ouvres une position de 20 000 $ avec un levier de 1:50. Quelle marge ton courtier immobilise-t-il ?",
      reponse: 400,
      tolerance: 1,
      unite: "$",
      aide: "Marge requise = taille de la position ÷ levier.",
      corrige:
        "20 000 ÷ 50 = 400 $. La marge n'est pas un coût : c'est un dépôt bloqué tant que la position est ouverte. Le risque, lui, porte sur les 20 000 $.",
      concepts: ["marge"],
    },
    {
      id: "pp-12-e2",
      type: "calcul",
      consigne:
        "Ta position vaut 10 fois ton capital (levier utilisé de 10). Le prix baisse de 3 %. Combien perds-tu, en pourcentage de ton capital ?",
      reponse: 30,
      tolerance: 0.5,
      unite: "%",
      aide: "Perte en % du capital = levier utilisé × variation du prix en %.",
      corrige:
        "10 × 3 % = 30 % du capital. Une petite variation de prix devient une grosse perte : c'est pourquoi le levier se règle d'après le risque, jamais d'après le gain espéré.",
      concepts: ["levier"],
    },
  ],
  quiz: [
    {
      id: "c12-q1",
      type: "unique",
      enonce:
        "Position de 20 000 € avec un levier de 1:20. Quelle est la marge requise ?",
      choix: ["20 €", "200 €", "1 000 €", "20 000 €"],
      bonne: 2,
      explication: "20 000 ÷ 20 = 1 000 €.",
      concepts: ["marge"],
    },
    {
      id: "c12-q2",
      type: "unique",
      enonce:
        "Capital de 1 000 €, position de 10 000 €. Le prix baisse de 2 %. Quelle est la perte ?",
      choix: ["2 €", "20 €", "200 €", "2 000 €"],
      bonne: 2,
      explication:
        "La perte se calcule sur la position : 2 % de 10 000 € = 200 €, soit 20 % du capital.",
      concepts: ["levier"],
    },
    {
      id: "c12-q3",
      type: "vraifaux",
      enonce:
        "Ta perte maximale sur une position est égale à la marge bloquée.",
      reponse: false,
      explication:
        "La perte dépend de la taille de la position et du mouvement du prix ; elle peut dépasser largement la marge.",
      concepts: ["marge", "levier"],
    },
    {
      id: "c12-q4",
      type: "unique",
      enonce:
        "Avec une position de 30 fois ton capital, quelle baisse de prix efface environ tout le capital ?",
      choix: ["0,3 %", "3,3 %", "30 %", "100 %"],
      bonne: 1,
      explication: "30 × 3,33 % ≈ 100 % : une baisse d'environ 3,3 % suffit.",
      concepts: ["levier"],
    },
    {
      id: "c12-q5",
      type: "multiple",
      enonce: "Quelles pratiques réduisent le risque lié au levier ?",
      choix: [
        "Calculer la taille de position à partir du stop et du risque accepté",
        "Utiliser toujours le levier maximal disponible",
        "Garder la marge requise faible par rapport au capital",
        "Choisir le courtier qui propose le levier le plus élevé",
      ],
      bonnes: [0, 2],
      explication:
        "Le risque se maîtrise par la taille de position ; le levier maximal n'est qu'un plafond à ne pas viser.",
      concepts: ["levier", "marge"],
    },
  ],
};

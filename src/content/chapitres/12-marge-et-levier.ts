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
  misAJour: "2026-10-27",
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
          "Le courtier ne te donne pas cet argent. Il bloque une garantie : la marge. Avec un levier de un pour trente, elle vaut un trentième de la position.",
        visuel: {
          type: "formule",
          texte: "Marge = taille de la position ÷ levier",
          legende: "30 000 € ÷ 30 = 1 000 €",
        },
      },
      {
        duree: 6,
        texte:
          "Sans levier, sur une position de 1 000 euros, une baisse de 1 % te coûte 10 euros.",
        visuel: { type: "figure", scene: "levier-comparaison", etape: 0 },
      },
      {
        duree: 10,
        texte:
          "Avec un levier de un pour dix, et toute la position permise, tu tiens 10 000 euros. La même baisse coûte 100 euros : 10 % de ton capital.",
        visuel: { type: "figure", scene: "levier-comparaison", etape: 1 },
      },
      {
        duree: 8,
        texte:
          "Avec un pour trente : 30 000 euros de position. Tu perds 300 euros, soit 30 % du capital, pour un mouvement de 1 %.",
        visuel: { type: "figure", scene: "levier-comparaison", etape: 2 },
      },
      {
        duree: 9,
        texte:
          "Si tes pertes réduisent trop ton capital, le courtier ferme ta position. Souvent au pire moment : ici, le prix remonte juste après.",
        visuel: { type: "figure", scene: "pp-stop-out", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "Retiens bien : le levier ne change pas le marché, il change la taille de ta position. Le risque se règle par la taille, pas par le levier disponible.",
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
          type: "figure",
          scene: "pp-levier-3pct",
          fiabilite: "calcul",
          legende:
            "Capital de 1 000 €, baisse du prix de 3 % : 30 € de perte pour une position de 1 000 €, 150 € pour 5 000 €, 300 € pour 10 000 €. En part du capital : 3 %, 15 % et 30 %, soit le levier utilisé multiplié par 3 %.",
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
          type: "figure",
          scene: "pp-stop-out",
          fiabilite: "fait",
          legende:
            "Capital de 1 000 €, position de 20 000 € sur un indice à 1 € par point, achetée à 20 000, avec 1 000 € de marge. Quand les pertes ramènent le capital à 500 €, la moitié de la marge, le courtier ferme la position à 19 500 : c'est le seuil imposé aux CFD des particuliers dans l'Union européenne. Le prix remonte ensuite, sans toi.",
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
        type: "figure",
        scene: "pp-levier-2pct",
        fiabilite: "calcul",
        legende:
          "Capital de 2 000 €, baisse de 2 % : 40 € de perte sans levier, 400 € avec une position de 10 fois le capital, 1 200 € avec 30 fois, soit 60 % du capital.",
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
      difficulte: 1,
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
      difficulte: 2,
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
      difficulte: 1,
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
      difficulte: 2,
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
      difficulte: 2,
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
    {
      id: "c12-q6",
      type: "graphique",
      difficulte: 3,
      enonce:
        "Capital de 1 000 €, position de 20 000 € à 1 € par point, achetée à 20 000. Le courtier ferme la position dès que le capital restant tombe à 500 €. Touche la bougie où la position est fermée.",
      scene: "pp-q-stop-out",
      bonnes: [10],
      explication:
        "Le capital tombe à 500 € après 500 € de perte, soit 500 points à 1 € : le seuil est à 19 500. Seule cette bougie descend jusque-là, avec un plus bas à 19 470. La position est fermée, même si le prix remonte ensuite.",
      concepts: ["marge", "levier"],
    },
    {
      id: "c12-q7",
      type: "unique",
      difficulte: 2,
      figure: { scene: "levier-comparaison", legende: "Capital de 1 000 €, baisse de 1 % : la perte selon la taille de position." },
      enonce: "Ta position vaut 10 fois ton capital. Quelle baisse du prix efface tout ton capital ?",
      choix: ["10 %", "1 %", "3,3 %", "30 %"],
      bonne: 0,
      explication:
        "Perte en % du capital = levier utilisé × variation du prix : 10 × 10 % = 100 %. Sur la figure, 1 % de baisse coûte déjà 10 % du capital avec 1:10. Avec une position de 30 fois le capital, 3,3 % suffiraient.",
      concepts: ["levier"],
    },
    {
      id: "c12-q8",
      type: "unique",
      difficulte: 2,
      contexte:
        "Ton capital est de 2 000 €. Tu as acheté cet indice à 20 000 points, avec une position à 2 € par point.",
      figure: { scene: "pp-q-levier-baisse", legende: "L'indice depuis ton achat." },
      enonce: "Le prix cote maintenant 19 600. Quelle part de ton capital as-tu perdue ?",
      choix: ["40 %", "2 %", "20 %", "4 %"],
      bonne: 0,
      explication:
        "Baisse : 20 000 − 19 600 = 400 points, soit 400 × 2 € = 800 €. 800 ÷ 2 000 = 40 % du capital, pour un prix qui n'a baissé que de 2 % : ta position vaut 40 000 €, 20 fois ton capital.",
      concepts: ["levier"],
    },
    {
      id: "c12-q9",
      type: "unique",
      difficulte: 2,
      figure: { scene: "pp-levier-3pct", legende: "Capital de 1 000 €, baisse de 3 % : la perte selon la taille de position." },
      enonce:
        "Même capital de 1 000 €, même baisse de 3 %, mais cette fois une position de 20 000 €. Quelle part du capital perds-tu ?",
      choix: ["60 %", "3 %", "30 %", "6 %"],
      bonne: 0,
      explication:
        "La position vaut 20 fois le capital : 20 × 3 % = 60 %. En euros : 3 % de 20 000 € = 600 €, sur 1 000 € de capital.",
      concepts: ["levier"],
    },
    {
      id: "c12-q10",
      type: "unique",
      difficulte: 2,
      contexte:
        "Ton compte contient 500 000 FCFA. Ton courtier t'autorise un levier de 1:30 et tu ouvres la plus grosse position possible.",
      enonce: "Le prix baisse de 1 %. Combien perds-tu ?",
      choix: ["150 000 FCFA", "5 000 FCFA", "15 000 FCFA", "50 000 FCFA"],
      bonne: 0,
      explication:
        "Position maximale : 500 000 × 30 = 15 000 000 FCFA. 1 % de 15 000 000 = 150 000 FCFA, soit 30 % de ton capital. 5 000 FCFA serait la perte sans levier.",
      concepts: ["levier", "marge"],
    },
    {
      id: "c12-q11",
      type: "vraifaux",
      difficulte: 1,
      enonce: "La marge est un coût que le courtier prélève définitivement à l'ouverture de la position.",
      reponse: false,
      explication:
        "La marge est une garantie bloquée, libérée à la fermeture. Les coûts, eux, sont le spread, les commissions et les frais de financement.",
      concepts: ["marge"],
    },
  ],
};

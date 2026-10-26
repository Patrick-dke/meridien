import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "pips-points-lots",
  titre: "Pips, points et lots",
  sousTitre: "Mesurer un mouvement et la taille d'une position, puis les traduire en argent",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 2,
  dureeMin: 12,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Mesurer un mouvement en pips ou en points",
    "Connaître les tailles de lot et leur effet sur le résultat",
    "Calculer la valeur d'un pip et d'un mouvement",
  ],
  concepts: ["pip", "lot", "valeur-pip"],
  prerequis: [],
  intro:
    "« 20 pips », « 0,5 lot », « 50 points » : ce vocabulaire permet de parler de mouvements et de tailles sans parler d'argent. Mais c'est bien de l'argent qui est en jeu : ce chapitre fait le lien.",
  capsule: {
    titre: "Pips, points et lots",
    scenes: [
      {
        duree: 7,
        texte: "Pips, points et lots : trois mots pour mesurer les mouvements de prix et la taille de tes positions.",
        visuel: { type: "titre", titre: "Pips, points et lots" },
      },
      {
        duree: 7,
        texte: "Sur EUR/USD, le prix est coté avec quatre décimales. Le pip, c'est la quatrième : 0,0001.",
        visuel: { type: "figure", scene: "mouvement-20-pips", etape: 0 },
      },
      {
        duree: 10,
        texte: "Si EUR/USD passe de 1,0850 à 1,0870, il a monté de 0,0020 : 20 pips. Pour les paires contre le yen, le pip vaut 0,01.",
        visuel: { type: "figure", scene: "mouvement-20-pips", etape: 1 },
      },
      {
        duree: 8,
        texte: "La taille d'une position se compte en lots. Un lot standard, c'est 100 000 unités de la devise de base.",
        visuel: { type: "points", titre: "Les lots", items: ["1 lot = 100 000 unités", "Mini-lot = 10 000", "Micro-lot = 1 000"] },
      },
      {
        duree: 8,
        texte: "Sur EUR/USD, un pip pour un lot vaut 0,0001 fois 100 000, soit 10 dollars. Pour un micro-lot, 10 centimes.",
        visuel: { type: "formule", texte: "0,0001 × 100 000 = 10 $", legende: "Valeur d'un pip pour 1 lot de EUR/USD" },
      },
      {
        duree: 7,
        texte: "Notre mouvement de 20 pips vaut donc 200 dollars avec un lot, et 2 dollars avec un micro-lot.",
        visuel: { type: "formule", texte: "20 pips × 10 $ = 200 $", legende: "Avec 1 lot ; avec un micro-lot : 20 × 0,10 $ = 2 $" },
      },
      {
        duree: 10,
        texte: "Sur les indices et les matières premières, on parle de points. Leur valeur en argent dépend du contrat : lis toujours la fiche de l'instrument.",
        visuel: { type: "points", titre: "Les points", items: ["Indices, actions, matières premières", "Valeur fixée par le contrat"] },
      },
    ],
  },
  cours: [
    {
      titre: "Le pip",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Le [[pip|pip]] est l'unité de mesure des variations de prix sur le Forex. Pour la plupart des [[paire-de-devises|paires de devises]], c'est la quatrième décimale : 0,0001. Pour les paires contre le yen japonais (USD/JPY, EUR/JPY…), cotées avec deux décimales, c'est la deuxième : 0,01.",
        },
        {
          type: "formule",
          fiabilite: "calcul",
          texte: "Nombre de pips = écart de prix ÷ taille du pip",
          legende: "EUR/USD de 1,0850 à 1,0870 : 0,0020 ÷ 0,0001 = 20 pips. USD/JPY de 150,20 à 150,65 : 0,45 ÷ 0,01 = 45 pips.",
        },
        {
          type: "p",
          texte:
            "Beaucoup de plateformes affichent une décimale de plus (1,08503) : ce dernier chiffre est la pipette, un dixième de pip. Attention à ne pas confondre 5 pipettes et 5 pips.",
        },
      ],
    },
    {
      titre: "Le point",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Sur les indices, les actions et les matières premières, on parle plutôt de [[point|points]]. Un indice qui passe de 18 000 à 18 050 a monté de 50 points. Mais la valeur d'un point en argent dépend du contrat : elle peut valoir 1 €, 10 €, 25 $ ou 0,10 € selon l'instrument et le courtier.",
        },
        {
          type: "encadre",
          variante: "attention",
          texte:
            "Il n'existe pas de définition universelle du « point » : avant de trader un indice ou une matière première, lis la fiche de l'instrument chez ton courtier (taille du contrat, valeur d'un point, taille minimale).",
        },
      ],
    },
    {
      titre: "Les lots",
      blocs: [
        {
          type: "tableau",
          fiabilite: "calcul",
          entetes: ["Taille", "Unités de devise de base", "Valeur d'un pip sur EUR/USD (compte en $)"],
          lignes: [
            ["1 lot standard", "100 000", "10 $"],
            ["Mini-lot (0,1)", "10 000", "1 $"],
            ["Micro-lot (0,01)", "1 000", "0,10 $"],
          ],
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "La plupart des courtiers acceptent des tailles intermédiaires : 0,35 lot correspond à 35 000 unités, soit 3,50 $ par pip sur EUR/USD. Le [[lot|lot]] est donc le réglage qui transforme un mouvement de prix en gain ou en perte.",
        },
      ],
    },
    {
      titre: "La valeur d'un pip",
      blocs: [
        {
          type: "formule",
          fiabilite: "calcul",
          texte: "Valeur d'un pip = taille du pip × nombre d'unités",
          legende: "Elle s'exprime dans la devise de cotation : le dollar pour EUR/USD, le yen pour USD/JPY.",
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Si ton compte est dans une autre devise, il faut convertir. Pour un compte en euros, 10 $ par pip valent environ 9,22 € quand l'euro vaut 1,0850 dollar (10 ÷ 1,0850). Pour USD/JPY, un pip vaut 0,01 × 100 000 = 1 000 ¥ par lot, à convertir dans la devise du compte.",
        },
        { type: "outil", outil: "pips" },
      ],
    },
  ],
  illustrations: [{ type: "figure", scene: "mouvement-20-pips", legende: "De 1,0850 à 1,0870 : 0,0020, soit 20 pips." }],
  exemple: {
    titre: "Que vaut un mouvement ?",
    blocs: [
      { type: "p", texte: "Tu as acheté 0,5 lot de EUR/USD à 1,0850 et le prix monte à 1,0870. Ton compte est en dollars." },
      {
        type: "liste",
        ordonnee: true,
        fiabilite: "calcul",
        items: [
          "Mouvement : 1,0870 − 1,0850 = 0,0020, soit **20 pips**.",
          "Valeur d'un pip pour 0,5 lot : 0,0001 × 50 000 = **5 $**.",
          "Gain brut : 20 × 5 $ = **100 $**, avant frais.",
        ],
      },
      {
        type: "p",
        texte:
          "Avec 0,05 lot, le même mouvement rapporte 10 $ ; avec 5 lots, 1 000 $. Le mouvement est identique : seule la taille de position change le montant gagné ou perdu.",
      },
    ],
  },
  erreurs: [
    { titre: "Confondre pips et pipettes", texte: "Sur une cotation à cinq décimales, le dernier chiffre est une pipette, un dixième de pip." },
    {
      titre: "Appliquer 10 $ par pip à toutes les paires",
      texte:
        "C'est vrai pour un lot sur les paires cotées en dollars (EUR/USD, GBP/USD) avec un compte en dollars. Pour les autres, il faut calculer et convertir.",
    },
    { titre: "Supposer la valeur d'un point", texte: "La valeur d'un point dépend du contrat. Une erreur d'un facteur 10 est vite arrivée." },
  ],
  resume: [
    "Un pip vaut 0,0001 pour la plupart des paires, 0,01 pour les paires contre le yen.",
    "Un lot standard = 100 000 unités ; mini-lot 10 000 ; micro-lot 1 000.",
    "Valeur d'un pip = taille du pip × nombre d'unités, dans la devise de cotation.",
    "Sur EUR/USD avec un compte en dollars : 10 $ par pip pour un lot.",
    "La valeur d'un point d'indice dépend du contrat : lis la fiche de l'instrument.",
  ],
  quiz: [
    {
      id: "c11-q1",
      type: "unique",
      enonce: "GBP/USD passe de 1,2640 à 1,2615. De combien de pips a-t-il bougé ?",
      choix: ["2,5 pips", "25 pips", "250 pips", "0,25 pip"],
      bonne: 1,
      explication: "1,2640 − 1,2615 = 0,0025 ; divisé par 0,0001, cela fait 25 pips.",
      concepts: ["pip"],
    },
    {
      id: "c11-q2",
      type: "unique",
      enonce: "USD/JPY passe de 149,80 à 150,30. Combien de pips ?",
      choix: ["5 pips", "50 pips", "500 pips", "0,5 pip"],
      bonne: 1,
      explication: "Pour les paires en yen, le pip vaut 0,01 : 0,50 ÷ 0,01 = 50 pips.",
      concepts: ["pip"],
    },
    {
      id: "c11-q3",
      type: "unique",
      enonce: "Quelle est la valeur d'un pip pour 0,2 lot de EUR/USD, avec un compte en dollars ?",
      choix: ["0,20 $", "2 $", "20 $", "200 $"],
      bonne: 1,
      explication: "0,2 lot = 20 000 unités ; 0,0001 × 20 000 = 2 $ par pip.",
      concepts: ["valeur-pip", "lot"],
    },
    {
      id: "c11-q4",
      type: "unique",
      enonce: "Tu as 0,5 lot de EUR/USD (compte en dollars) et le prix baisse de 30 pips contre toi. Quel est le résultat ?",
      choix: ["−15 $", "−150 $", "−300 $", "−1 500 $"],
      bonne: 1,
      explication: "0,5 lot vaut 5 $ par pip ; 30 pips × 5 $ = 150 $ de perte.",
      concepts: ["valeur-pip"],
    },
    {
      id: "c11-q5",
      type: "association",
      enonce: "Associe chaque taille à son nombre d'unités de devise de base.",
      paires: [
        ["1 lot standard", "100 000 unités"],
        ["Mini-lot", "10 000 unités"],
        ["Micro-lot", "1 000 unités"],
      ],
      explication: "Chaque taille est dix fois plus petite que la précédente.",
      concepts: ["lot"],
    },
    {
      id: "c11-q6",
      type: "vraifaux",
      enonce: "La valeur d'un point est la même pour tous les indices et tous les courtiers.",
      reponse: false,
      explication: "Elle dépend de la taille du contrat, propre à chaque instrument et à chaque courtier.",
      concepts: ["pip"],
    },
  ],
};

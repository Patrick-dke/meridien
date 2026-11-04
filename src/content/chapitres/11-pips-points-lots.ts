import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "pips-points-lots",
  titre: "Pips, points et lots",
  sousTitre:
    "Mesurer un mouvement et la taille d'une position, puis les traduire en argent",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 2,
  dureeMin: 12,
  statut: "publie",
  misAJour: "2026-10-27",
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
        texte:
          "Pips, points et lots : trois mots pour mesurer les mouvements de prix, et la taille de tes positions.",
        visuel: { type: "titre", titre: "Pips, points et lots" },
      },
      {
        duree: 7,
        texte:
          "Sur l'euro dollar, le prix s'affiche avec quatre décimales. Le pip, c'est la quatrième.",
        visuel: { type: "figure", scene: "mouvement-20-pips", etape: 0 },
      },
      {
        duree: 10,
        texte:
          "Regarde : de 1,0850 à 1,0870, l'euro dollar monte de 20 pips. Pour les paires contre le yen, le pip est la deuxième décimale.",
        visuel: { type: "figure", scene: "mouvement-20-pips", etape: 1 },
      },
      {
        duree: 8,
        texte:
          "La taille d'une position se compte en lots. Un lot standard, c'est 100 000 unités de la devise de base.",
        visuel: {
          type: "points",
          titre: "Les lots",
          items: [
            "1 lot = 100 000 unités",
            "Mini-lot = 10 000",
            "Micro-lot = 1 000",
          ],
        },
      },
      {
        duree: 8,
        texte:
          "Sur l'euro dollar, un pip pour un lot vaut 10 dollars. Pour un micro-lot, cent fois plus petit, 10 centimes.",
        visuel: {
          type: "formule",
          texte: "0,0001 × 100 000 = 10 $",
          legende: "Valeur d'un pip pour 1 lot de EUR/USD",
        },
      },
      {
        duree: 7,
        texte:
          "Notre mouvement de 20 pips vaut donc 200 dollars avec un lot, et 2 dollars avec un micro-lot.",
        visuel: {
          type: "formule",
          texte: "20 pips × 10 $ = 200 $",
          legende: "Avec 1 lot ; avec un micro-lot : 20 × 0,10 $ = 2 $",
        },
      },
      {
        duree: 10,
        texte:
          "Sur les indices et les matières premières, on parle de points. Ici, 50 points. Leur valeur en argent dépend du contrat : lis toujours la fiche de l'instrument.",
        visuel: { type: "figure", scene: "pp-indice-50-points", etape: 1 },
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
          legende:
            "EUR/USD de 1,0850 à 1,0870 : 0,0020 ÷ 0,0001 = 20 pips. USD/JPY de 150,20 à 150,65 : 0,45 ÷ 0,01 = 45 pips.",
        },
        {
          type: "figure",
          scene: "pp-usdjpy-45-pips",
          fiabilite: "calcul",
          legende:
            "USD/JPY passe de 150,20 à 150,65 : 0,45 yen de hausse, soit 45 pips, car le pip vaut 0,01 pour les paires contre le yen.",
        },
        {
          type: "p",
          texte:
            "Beaucoup de plateformes affichent une décimale de plus (1,08503) : ce dernier chiffre est la pipette, un dixième de pip. Attention à ne pas confondre 5 pipettes et 5 pips.",
        },
        {
          type: "figure",
          scene: "pp-pipettes",
          fiabilite: "calcul",
          legende:
            "EUR/USD affiché à cinq décimales : de 1,08503 à 1,08553, le prix monte de 0,00050, soit 5 pips, ou 50 pipettes.",
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
          type: "figure",
          scene: "pp-indice-50-points",
          legende:
            "Un indice fictif passe de 18 000 à 18 050 : 50 points. Ce qu'ils valent en argent dépend du contrat, pas du graphique.",
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
          entetes: [
            "Taille",
            "Unités de devise de base",
            "Valeur d'un pip sur EUR/USD (compte en $)",
          ],
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
          legende:
            "Elle s'exprime dans la devise de cotation : le dollar pour EUR/USD, le yen pour USD/JPY.",
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
  illustrations: [
    {
      type: "figure",
      scene: "mouvement-20-pips",
      legende: "De 1,0850 à 1,0870 : 0,0020, soit 20 pips.",
    },
  ],
  exemple: {
    titre: "Que vaut un mouvement ?",
    blocs: [
      {
        type: "p",
        texte:
          "Tu as acheté 0,5 lot de EUR/USD à 1,0850 et le prix monte à 1,0870. Ton compte est en dollars.",
      },
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
    {
      titre: "Confondre pips et pipettes",
      texte:
        "Sur une cotation à cinq décimales, le dernier chiffre est une pipette, un dixième de pip.",
    },
    {
      titre: "Appliquer 10 $ par pip à toutes les paires",
      texte:
        "C'est vrai pour un lot sur les paires cotées en dollars (EUR/USD, GBP/USD) avec un compte en dollars. Pour les autres, il faut calculer et convertir.",
    },
    {
      titre: "Supposer la valeur d'un point",
      texte:
        "La valeur d'un point dépend du contrat. Une erreur d'un facteur 10 est vite arrivée.",
    },
  ],
  resume: [
    "Un pip vaut 0,0001 pour la plupart des paires, 0,01 pour les paires contre le yen.",
    "Un lot standard = 100 000 unités ; mini-lot 10 000 ; micro-lot 1 000.",
    "Valeur d'un pip = taille du pip × nombre d'unités, dans la devise de cotation.",
    "Sur EUR/USD avec un compte en dollars : 10 $ par pip pour un lot.",
    "La valeur d'un point d'indice dépend du contrat : lis la fiche de l'instrument.",
  ],
  exercices: [
    {
      id: "pp-11-e1",
      type: "calcul",
      consigne:
        "EUR/USD passe de 1,0912 à 1,0947. De combien de pips a-t-il monté ?",
      reponse: 35,
      tolerance: 0,
      unite: "pips",
      aide: "Sur EUR/USD, un pip vaut 0,0001.",
      corrige: "Écart : 1,0947 − 1,0912 = 0,0035 ; 0,0035 ÷ 0,0001 = 35 pips.",
      concepts: ["pip"],
    },
    {
      id: "pp-11-e2",
      type: "calcul",
      consigne:
        "Combien vaut un pip pour une position de 0,5 lot standard sur EUR/USD, sur un compte en dollars ?",
      reponse: 5,
      tolerance: 0.05,
      unite: "$",
      aide: "Un lot standard = 100 000 unités. Valeur d'un pip = taille du pip × nombre d'unités.",
      corrige:
        "0,5 lot = 50 000 unités ; 0,0001 × 50 000 = 5 $ par pip. Un mouvement de 35 pips vaudrait 175 $.",
      concepts: ["valeur-pip", "lot"],
    },
  ],
  quiz: [
    {
      id: "c11-q1",
      difficulte: 1,
      type: "unique",
      enonce:
        "GBP/USD passe de 1,2640 à 1,2615. De combien de pips a-t-il bougé ?",
      choix: ["2,5 pips", "25 pips", "250 pips", "0,25 pip"],
      bonne: 1,
      explication:
        "1,2640 − 1,2615 = 0,0025 ; divisé par 0,0001, cela fait 25 pips.",
      concepts: ["pip"],
    },
    {
      id: "c11-q2",
      difficulte: 2,
      type: "unique",
      enonce: "USD/JPY passe de 149,80 à 150,30. Combien de pips ?",
      choix: ["5 pips", "50 pips", "500 pips", "0,5 pip"],
      bonne: 1,
      explication:
        "Pour les paires en yen, le pip vaut 0,01 : 0,50 ÷ 0,01 = 50 pips.",
      concepts: ["pip"],
    },
    {
      id: "c11-q3",
      difficulte: 2,
      type: "unique",
      enonce:
        "Quelle est la valeur d'un pip pour 0,2 lot de EUR/USD, avec un compte en dollars ?",
      choix: ["0,20 $", "2 $", "20 $", "200 $"],
      bonne: 1,
      explication: "0,2 lot = 20 000 unités ; 0,0001 × 20 000 = 2 $ par pip.",
      concepts: ["valeur-pip", "lot"],
    },
    {
      id: "c11-q4",
      difficulte: 2,
      type: "unique",
      enonce:
        "Tu as 0,5 lot de EUR/USD (compte en dollars) et le prix baisse de 30 pips contre toi. Quel est le résultat ?",
      choix: ["−15 $", "−150 $", "−300 $", "−1 500 $"],
      bonne: 1,
      explication: "0,5 lot vaut 5 $ par pip ; 30 pips × 5 $ = 150 $ de perte.",
      concepts: ["valeur-pip"],
    },
    {
      id: "c11-q5",
      difficulte: 1,
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
      difficulte: 1,
      type: "vraifaux",
      enonce:
        "La valeur d'un point est la même pour tous les indices et tous les courtiers.",
      reponse: false,
      explication:
        "Elle dépend de la taille du contrat, propre à chaque instrument et à chaque courtier.",
      concepts: ["pip"],
    },
    {
      id: "c11-q7",
      type: "graphique",
      difficulte: 3,
      enonce:
        "Survole les bougies pour lire leurs prix. Touche la seule bougie haussière dont le corps, de l'ouverture à la clôture, mesure exactement 15 pips.",
      scene: "pp-q-corps-pips",
      bonnes: [5],
      explication:
        "Cette bougie ouvre à 1,0911 et clôture à 1,0926 : 0,0015, soit 15 pips. Les autres corps haussiers mesurent 5, 8, 11, 12, 18, 10 et 13 pips : il faut lire les prix, l'œil seul ne suffit pas.",
      concepts: ["pip"],
    },
    {
      id: "c11-q8",
      type: "unique",
      difficulte: 2,
      figure: { scene: "pp-q-mouvement-jpy", legende: "EUR/JPY entre le départ et l'arrivée." },
      enonce: "De combien de pips EUR/JPY a-t-il monté entre le départ et l'arrivée ?",
      choix: ["75 pips", "7,5 pips", "750 pips", "0,75 pip"],
      bonne: 0,
      explication:
        "162,45 − 161,70 = 0,75. Pour une paire contre le yen, le pip vaut 0,01 : 0,75 ÷ 0,01 = 75 pips. Diviser par 0,0001 donnerait 7 500 : c'est l'erreur classique sur les paires en yen.",
      concepts: ["pip"],
    },
    {
      id: "c11-q9",
      type: "comparaison",
      difficulte: 3,
      enonce: "Sur quel graphique le prix a-t-il monté du plus grand nombre de pips ?",
      graphiques: [{ scene: "pp-q-pips-a" }, { scene: "pp-q-pips-b" }],
      bonne: 0,
      explication:
        "A : EUR/USD de 1,0850 à 1,0880, soit 0,0030 ÷ 0,0001 = 30 pips. B : USD/JPY de 150,20 à 150,45, soit 0,25 ÷ 0,01 = 25 pips. La taille du pip change d'une paire à l'autre : compare les pips, pas les chiffres bruts.",
      concepts: ["pip"],
    },
    {
      id: "c11-q10",
      type: "unique",
      difficulte: 2,
      contexte: "Tu as vendu 0,3 lot d'EUR/USD à 1,0850, avec un compte en dollars.",
      figure: { scene: "pp-q-perte-pips", legende: "EUR/USD depuis ta vente." },
      enonce: "Le prix est maintenant à 1,0875. Quel est ton résultat latent ?",
      choix: ["−75 $", "+75 $", "−25 $", "−750 $"],
      bonne: 0,
      explication:
        "Tu as vendu : la hausse joue contre toi. 1,0875 − 1,0850 = 0,0025, soit 25 pips. 0,3 lot = 30 000 unités, soit 3 $ par pip : 25 × 3 $ = 75 $ de perte.",
      concepts: ["pip", "valeur-pip"],
    },
    {
      id: "c11-q11",
      type: "unique",
      difficulte: 1,
      enonce: "Sur la cotation 1,08503, que représente le dernier chiffre, le 3 ?",
      choix: [
        "3 pipettes, soit 0,3 pip",
        "3 pips, soit 0,0003",
        "3 points, soit 0,003",
        "30 pips, soit 0,0030",
      ],
      bonne: 0,
      explication:
        "La cinquième décimale est la pipette, un dixième de pip. 0,00003 = 3 pipettes = 0,3 pip.",
      concepts: ["pip"],
    },
  ],
};

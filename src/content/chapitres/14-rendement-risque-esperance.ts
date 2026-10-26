import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "rendement-risque-esperance",
  titre: "Rendement/risque, taux de réussite et espérance",
  sousTitre: "Gagner souvent ou gagner gros ? Ni l'un ni l'autre seul",
  academie: "fondamentaux",
  module: "gestion-du-risque",
  niveau: 2,
  dureeMin: 14,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Calculer un ratio rendement/risque et son seuil de rentabilité",
    "Comprendre pourquoi taux de réussite et ratio se lisent ensemble",
    "Calculer l'espérance d'une méthode, frais compris",
  ],
  concepts: ["rendement-risque", "taux-reussite", "esperance"],
  prerequis: ["stop-loss", "take-profit", "risque-par-trade"],
  intro:
    "Gagner souvent ne suffit pas, gagner gros non plus. Ce qui compte, c'est la combinaison des deux, mesurée sur un grand nombre de trades : l'espérance mathématique.",
  capsule: {
    titre: "Gagner souvent ou gagner gros ?",
    scenes: [
      {
        duree: 8,
        texte: "Vaut-il mieux gagner souvent, ou gagner gros ? Ni l'un ni l'autre seul. Tout est dans la combinaison des deux.",
        visuel: { type: "titre", titre: "Gagner souvent ou gagner gros ?" },
      },
      {
        duree: 9,
        texte: "Le ratio rendement sur risque compare ce que tu vises à ce que tu risques. 4,40 visés pour 2,20 risqués : un ratio de 2.",
        visuel: { type: "formule", texte: "Ratio = gain visé ÷ perte acceptée", legende: "4,40 ÷ 2,20 = 2" },
      },
      {
        duree: 12,
        texte: "Chaque ratio a son seuil de rentabilité. Avec un ratio de 1, il faut gagner plus d'une fois sur deux. Avec un ratio de 2, plus d'une fois sur trois.",
        visuel: { type: "figure", scene: "seuil-rentabilite", etape: 1 },
      },
      {
        duree: 7,
        texte: "Au-dessus de la courbe, la méthode gagne, avant frais. En dessous, elle perd, même avec de beaux trades.",
        visuel: { type: "figure", scene: "seuil-rentabilite", etape: 2 },
      },
      {
        duree: 11,
        texte: "L'espérance combine les deux. Avec 40 % de réussite, des gains de 2R et des pertes de 1R : 0,8 moins 0,6, soit plus 0,2R par trade.",
        visuel: {
          type: "formule",
          texte: "0,4 × 2R − 0,6 × 1R = +0,2R",
          legende: "Espérance = réussite × gain moyen − échec × perte moyenne",
        },
      },
      {
        duree: 9,
        texte: "Mais une espérance positive ne protège pas des séries de pertes. Elle ne se révèle que sur un grand nombre de trades.",
        visuel: { type: "figure", scene: "series-resultats", etape: 2 },
      },
      {
        duree: 9,
        texte: "Retiens : une méthode se juge sur des dizaines de trades, frais compris. Jamais sur trois trades, ni sur une capture d'écran.",
        visuel: { type: "titre", titre: "Mesurer, pas supposer", sousTitre: "Des dizaines de trades, frais compris" },
      },
    ],
  },
  cours: [
    {
      titre: "Le ratio rendement/risque",
      blocs: [
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Le [[ratio-rendement-risque|ratio rendement/risque]] (R:R) compare le gain visé à la perte acceptée sur un trade. Entrée à 50,00 €, stop à 47,80 €, objectif à 54,40 € : 4,40 € visés pour 2,20 € risqués, soit un ratio de 2. On dit aussi que l'objectif est à 2R, en prenant le risque comme [[r-unite|unité R]].",
        },
        { type: "formule", fiabilite: "calcul", texte: "Ratio = |objectif − entrée| ÷ |entrée − stop|" },
      ],
    },
    {
      titre: "Le seuil de rentabilité",
      blocs: [
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Pour un ratio donné, il existe un [[seuil-de-rentabilite|taux de réussite minimal]] en dessous duquel la méthode perd de l'argent sur la durée.",
        },
        {
          type: "formule",
          fiabilite: "calcul",
          texte: "Seuil sans frais = 1 ÷ (1 + ratio)",
          legende: "Ratio 1 : 50 %. Ratio 2 : 33,3 %. Ratio 3 : 25 %.",
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Un ratio élevé n'est donc pas « meilleur » en soi : il est plus difficile à atteindre, et le taux de réussite baisse souvent quand l'objectif s'éloigne. Un ratio de 3 avec 20 % de réussite perd de l'argent ; un ratio de 1 avec 60 % en gagne.",
        },
        { type: "outil", outil: "rendement-risque" },
      ],
    },
    {
      titre: "L'espérance mathématique",
      blocs: [
        {
          type: "formule",
          fiabilite: "calcul",
          texte: "Espérance par trade = taux de réussite × gain moyen − taux d'échec × perte moyenne",
        },
        {
          type: "tableau",
          fiabilite: "calcul",
          entetes: ["Méthode", "Réussite", "Gain moyen", "Perte moyenne", "Espérance par trade"],
          lignes: [
            ["A", "60 %", "1R", "1R", "+0,20R"],
            ["B", "40 %", "2R", "1R", "+0,20R"],
            ["C", "70 %", "0,5R", "1R", "+0,05R"],
            ["D", "30 %", "2R", "1R", "−0,10R"],
          ],
        },
        {
          type: "p",
          texte:
            "Les méthodes A et B ont la même espérance avec des profils opposés : l'une gagne souvent un peu, l'autre rarement beaucoup. La méthode D gagne gros quand elle gagne, mais trop rarement : elle perd de l'argent.",
        },
        {
          type: "encadre",
          variante: "attention",
          fiabilite: "calcul",
          texte:
            "Les frais diminuent chaque gain et augmentent chaque perte. Une méthode à +0,05R par trade avant frais peut devenir perdante une fois les coûts déduits. Calcule toujours l'[[esperance|espérance]] frais compris.",
        },
      ],
    },
    {
      titre: "Mesurer, pas supposer",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Une espérance ne se devine pas : elle se mesure sur un grand nombre de trades, notés dans un journal avec leurs frais. Sur dix trades, le hasard domine ; il faut souvent plusieurs dizaines, voire des centaines de trades pour distinguer une méthode d'un coup de chance.",
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Même une méthode à espérance positive connaît des séries de pertes. Avec 40 % de réussite, une série d'au moins 6 pertes d'affilée sur 100 trades a environ 87 % de chances de se produire. C'est pour cela que le risque par opération doit rester petit.",
        },
        { type: "outil", outil: "esperance" },
      ],
    },
  ],
  illustrations: [
    { type: "figure", scene: "seuil-rentabilite", legende: "La courbe donne le taux de réussite minimal pour chaque ratio, avant frais." },
    {
      type: "figure",
      scene: "series-resultats",
      legende: "Une méthode à espérance légèrement positive (+0,05R par trade) : +1R sur vingt trades, après six pertes d'affilée.",
    },
  ],
  exemple: {
    titre: "Juger une méthode sur vingt trades",
    blocs: [
      { type: "p", texte: "Voici vingt trades d'une méthode qui vise 2R et risque 1R : 7 gagnants, 13 perdants." },
      {
        type: "liste",
        fiabilite: "calcul",
        items: [
          "Taux de réussite : 7 ÷ 20 = **35 %**.",
          "Seuil de rentabilité pour un ratio de 2 : 33,3 %. La méthode est juste au-dessus.",
          "Résultat : 7 × 2R − 13 × 1R = **+1R**, soit +0,05R par trade avant frais.",
          "Avec 0,1R de frais par trade, le résultat devient 1R − 20 × 0,1R = **−1R** : la méthode devient perdante.",
        ],
      },
      {
        type: "p",
        texte:
          "Conclusion honnête : vingt trades ne suffisent pas pour juger. Et l'écart est si mince que les frais décident du résultat. C'est exactement le genre de méthode à mesurer davantage avant d'y engager de l'argent réel.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Juger une méthode sur son taux de réussite seul",
      texte: "80 % de trades gagnants peuvent perdre de l'argent si les pertes sont bien plus grandes que les gains.",
    },
    {
      titre: "Viser des ratios énormes",
      texte: "Un objectif lointain est rarement atteint. Le ratio ne vaut que combiné au taux de réussite réellement mesuré.",
    },
    { titre: "Calculer l'espérance sans les frais", texte: "Les frais peuvent faire passer une méthode gagnante en perte. Calcule toujours frais compris." },
    { titre: "Conclure trop tôt", texte: "Quelques trades ne prouvent rien, dans un sens comme dans l'autre." },
  ],
  resume: [
    "Ratio = gain visé ÷ perte acceptée ; on l'exprime aussi en R.",
    "Seuil de rentabilité sans frais = 1 ÷ (1 + ratio).",
    "Espérance = réussite × gain moyen − échec × perte moyenne, frais compris.",
    "Taux de réussite et ratio ne se lisent jamais séparément.",
    "Une espérance se mesure sur un grand nombre de trades ; les séries de pertes restent normales.",
  ],
  quiz: [
    {
      id: "c14-q1",
      type: "unique",
      enonce: "Entrée à 100 €, stop à 98 €, objectif à 106 €. Quel est le ratio rendement/risque ?",
      choix: ["2", "3", "4", "6"],
      bonne: 1,
      explication: "Gain visé 6 €, risque 2 € : 6 ÷ 2 = 3.",
      concepts: ["rendement-risque"],
    },
    {
      id: "c14-q2",
      type: "unique",
      enonce: "Avec un ratio de 3, quel est le taux de réussite minimal pour ne pas perdre, sans frais ?",
      choix: ["20 %", "25 %", "33 %", "75 %"],
      bonne: 1,
      explication: "1 ÷ (1 + 3) = 25 %.",
      concepts: ["rendement-risque", "taux-reussite"],
    },
    {
      id: "c14-q3",
      type: "unique",
      enonce: "50 % de réussite, gains moyens de 1,5R, pertes moyennes de 1R. Quelle est l'espérance par trade ?",
      choix: ["+0,25R", "+0,5R", "+0,75R", "−0,25R"],
      bonne: 0,
      explication: "0,5 × 1,5 − 0,5 × 1 = 0,75 − 0,5 = +0,25R.",
      concepts: ["esperance"],
    },
    {
      id: "c14-q4",
      type: "vraifaux",
      enonce: "Une méthode qui gagne 80 % du temps est forcément rentable.",
      reponse: false,
      explication: "Si ses pertes sont bien plus grandes que ses gains, elle perd de l'argent malgré son taux de réussite.",
      concepts: ["taux-reussite", "esperance"],
    },
    {
      id: "c14-q5",
      type: "unique",
      enonce: "30 % de réussite, gains de 2R, pertes de 1R. La méthode est :",
      choix: ["gagnante", "perdante", "à l'équilibre", "impossible à juger sans connaître le capital"],
      bonne: 1,
      explication: "0,3 × 2 − 0,7 × 1 = −0,1R par trade : elle perd de l'argent.",
      concepts: ["esperance", "rendement-risque"],
    },
    {
      id: "c14-q6",
      type: "multiple",
      enonce: "Que faut-il pour juger sérieusement une méthode ?",
      choix: [
        "Un grand nombre de trades enregistrés",
        "Les frais réels de chaque trade",
        "Trois trades gagnants d'affilée",
        "Le taux de réussite, le gain moyen et la perte moyenne",
      ],
      bonnes: [0, 1, 3],
      explication: "Trois trades ne prouvent rien ; il faut un échantillon important et des chiffres frais compris.",
      concepts: ["esperance"],
    },
  ],
};

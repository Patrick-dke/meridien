import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "types-ordres",
  titre: "Acheter, vendre : les types d'ordres",
  sousTitre:
    "Au marché, limite ou stop : ce que chacun garantit, et ce qu'il ne garantit pas",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 1,
  dureeMin: 11,
  statut: "publie",
  misAJour: "2026-10-27",
  objectifs: [
    "Distinguer ordre au marché, ordre limite et ordre stop",
    "Savoir où placer chaque ordre par rapport au prix actuel",
    "Comprendre ce que chaque ordre garantit, et ce qu'il ne garantit pas",
  ],
  concepts: ["ordre-marche", "ordre-limite", "ordre-stop"],
  prerequis: ["bid-ask"],
  intro:
    "Acheter ou vendre ne se résume pas à cliquer sur un bouton. Le type d'ordre choisi décide du prix obtenu, de la certitude d'être servi, et parfois de la taille de ta perte.",
  capsule: {
    titre: "Trois façons d'acheter ou de vendre",
    scenes: [
      {
        duree: 7,
        texte:
          "Il existe trois grands types d'ordres. Au marché, limite, et stop. Chacun garantit une chose, jamais tout.",
        visuel: { type: "titre", titre: "Marché, limite, stop" },
      },
      {
        duree: 8,
        texte:
          "L'ordre au marché s'exécute tout de suite, au meilleur prix disponible. Tu es sûr d'être servi. Pas du prix exact.",
        visuel: {
          type: "points",
          titre: "Ordre au marché",
          items: [
            "Exécution immédiate",
            "Au meilleur prix disponible",
            "Prix non garanti",
          ],
        },
      },
      {
        duree: 9,
        texte:
          "L'ordre limite, lui, fixe ton prix. Un achat limite se place sous le prix actuel. Tu n'achètes que si le prix descend jusque-là.",
        visuel: { type: "figure", scene: "ordres-achat", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "L'ordre stop se déclenche quand un niveau est franchi. Un achat stop se place au-dessus du prix. Tu n'achètes que si le prix monte jusque-là.",
        visuel: { type: "figure", scene: "ordres-achat", etape: 2 },
      },
      {
        duree: 10,
        texte:
          "À la vente, c'est symétrique. Vente limite au-dessus du prix, vente stop en dessous. Et le stop loss d'un achat, c'est justement une vente stop.",
        visuel: { type: "figure", scene: "ordres-vente", etape: 2 },
      },
      {
        duree: 8,
        texte:
          "Retiens ce qui est garanti. Le marché garantit l'exécution. La limite garantit le prix. Le stop, seulement le déclenchement.",
        visuel: {
          type: "points",
          titre: "Ce qui est garanti",
          items: [
            "Marché : l'exécution",
            "Limite : le prix, pas l'exécution",
            "Stop : le déclenchement, pas le prix",
          ],
        },
      },
      {
        duree: 10,
        texte:
          "Regarde ce qui arrive en cas de saut de prix. Une fois déclenché, le stop devient un ordre au marché. Il est servi plus loin que prévu.",
        visuel: { type: "figure", scene: "pp-achat-stop-gap", etape: 2 },
      },
    ],
  },
  cours: [
    {
      titre: "L'ordre au marché",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un [[ordre-au-marche|ordre au marché]] demande d'acheter ou de vendre immédiatement, au meilleur prix disponible : à l'[[ask|ask]] pour un achat, au [[bid|bid]] pour une vente. Dans un marché liquide, il est exécuté presque à coup sûr, mais son prix exact n'est pas garanti : dans un marché rapide ou peu fourni, il peut être moins bon que le prix affiché.",
        },
      ],
    },
    {
      titre: "L'ordre limite",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un [[ordre-limite|ordre limite]] fixe un prix à ne pas dépasser : prix maximal à l'achat, prix minimal à la vente. Il attend dans le carnet jusqu'à ce que le marché vienne le chercher.",
        },
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "**Achat limite** : placé **sous** le prix actuel. Tu achètes seulement si le prix descend jusqu'à ton niveau, ou plus bas.",
            "**Vente limite** : placée **au-dessus** du prix actuel. Tu vends seulement si le prix monte jusqu'à ton niveau, ou plus haut.",
          ],
        },
        {
          type: "figure",
          scene: "pp-achat-limite",
          legende:
            "Achat limite placé à 49,00 € quand le prix est à 50,00 € : l'ordre attend. Le prix descend jusqu'à 49,00 € à la neuvième bougie, l'ordre est exécuté à ce prix, puis le prix remonte.",
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "L'ordre limite garantit le prix, pas l'exécution : si le marché n'atteint pas ton niveau, ou s'il le touche sans assez de quantité disponible, tu n'es pas servi.",
        },
      ],
    },
    {
      titre: "L'ordre stop",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un [[ordre-stop|ordre stop]] reste en sommeil jusqu'à ce qu'un prix de déclenchement soit atteint. Il devient alors un ordre au marché.",
        },
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "**Achat stop** : placé **au-dessus** du prix actuel. Il sert par exemple à acheter seulement si le prix franchit un niveau.",
            "**Vente stop** : placée **sous** le prix actuel. C'est la forme du [[stop-loss|stop loss]] d'une position acheteuse : si le prix baisse jusqu'au niveau, la position est vendue.",
          ],
        },
        {
          type: "encadre",
          variante: "risque",
          fiabilite: "fait",
          texte:
            "Une fois déclenché, l'ordre stop est exécuté au marché : en cas de mouvement brutal ou de [[gap|gap]], le prix obtenu peut être nettement moins bon que le niveau du stop. Le chapitre sur les coûts y revient.",
        },
        {
          type: "figure",
          scene: "pp-achat-stop-gap",
          fiabilite: "calcul",
          legende:
            "Achat stop à 51,00 € : après une interruption, le marché rouvre directement à 51,40 €. L'ordre déclenché devient un ordre au marché et il est exécuté à ce premier prix disponible, 0,40 € plus cher que prévu.",
        },
      ],
    },
    {
      titre: "Où placer chaque ordre",
      blocs: [
        {
          type: "tableau",
          fiabilite: "fait",
          entetes: ["Ordre", "Placement", "S'exécute si…", "Garantit"],
          lignes: [
            ["Achat au marché", "—", "Immédiatement", "L'exécution"],
            [
              "Achat limite",
              "Sous le prix actuel",
              "Le prix descend jusqu'au niveau",
              "Le prix maximal",
            ],
            [
              "Achat stop",
              "Au-dessus du prix actuel",
              "Le prix monte jusqu'au niveau",
              "Le déclenchement",
            ],
            ["Vente au marché", "—", "Immédiatement", "L'exécution"],
            [
              "Vente limite",
              "Au-dessus du prix actuel",
              "Le prix monte jusqu'au niveau",
              "Le prix minimal",
            ],
            [
              "Vente stop",
              "Sous le prix actuel",
              "Le prix descend jusqu'au niveau",
              "Le déclenchement",
            ],
          ],
        },
        {
          type: "p",
          texte:
            "Il existe des variantes (ordre stop-limite, stop suiveur, ordres liés) : elles combinent ces trois briques. Les plateformes les nomment parfois différemment ; vérifie toujours leur définition chez ton courtier.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "ordres-achat",
      legende: "Achat limite sous le prix actuel, achat stop au-dessus.",
    },
    {
      type: "figure",
      scene: "ordres-vente",
      legende: "Vente limite au-dessus du prix actuel, vente stop en dessous.",
    },
  ],
  exemple: {
    titre: "Trois ordres, trois résultats",
    blocs: [
      {
        type: "p",
        texte:
          "Une action affiche un ask de 50,02 €. Trois traders veulent l'acheter :",
      },
      {
        type: "liste",
        items: [
          "Le premier passe un **achat au marché** : il est servi tout de suite, autour de 50,02 €.",
          "Le deuxième place un **achat limite à 48,50 €** : il ne sera servi que si le prix redescend à 48,50 € ou moins. Si le prix monte, il n'achète jamais.",
          "Le troisième place un **achat stop à 51,50 €** : il n'achètera que si le prix monte jusqu'à 51,50 €, et peut-être un peu plus cher si le marché est rapide.",
        ],
      },
      {
        type: "figure",
        scene: "pp-trois-ordres",
        legende:
          "Les trois ordres sur le même graphique. L'achat au marché est servi tout de suite, vers 50 € ; l'achat stop à 51,50 € est déclenché pendant la hausse, à la onzième bougie ; l'achat limite à 48,50 € n'est jamais atteint.",
      },
      {
        type: "p",
        texte:
          "Aucun n'a « raison » : chacun a choisi entre certitude d'exécution et maîtrise du prix, selon son scénario.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Placer un achat limite au-dessus du prix",
      texte:
        "Un achat limite au-dessus du prix actuel est exécuté immédiatement, au meilleur prix disponible, comme un ordre au marché. Ce n'est souvent pas ce que l'on voulait.",
    },
    {
      titre: "Croire que le stop garantit le prix",
      texte:
        "Le stop garantit seulement son déclenchement. En cas de gap, l'exécution peut se faire bien plus loin.",
    },
    {
      titre: "Confondre vente stop et vente limite",
      texte:
        "Vente limite au-dessus du prix, pour vendre plus cher ; vente stop en dessous, pour sortir si le prix baisse.",
    },
  ],
  resume: [
    "Ordre au marché : exécution immédiate, prix non garanti.",
    "Ordre limite : prix garanti, exécution non garantie ; achat limite sous le prix, vente limite au-dessus.",
    "Ordre stop : se déclenche à un niveau puis devient un ordre au marché ; achat stop au-dessus, vente stop en dessous.",
    "Le stop loss d'un achat est une vente stop : son prix d'exécution n'est pas garanti.",
  ],
  exercices: [
    {
      id: "pp-08-e1",
      type: "reflexion",
      consigne:
        "Le prix d'une action est à 50,00 €. Quel ordre places-tu pour acheter seulement si le prix casse 51,00 € ? Et pour acheter seulement s'il revient à 49,00 € ?",
      corrige:
        "Pour acheter au-dessus du prix actuel, une fois 51,00 € franchi : un ordre d'achat stop. Pour acheter en dessous, à 49,00 € ou mieux : un ordre d'achat limite. Retenir : la limite garantit le prix (pas l'exécution), le stop déclenche un ordre au marché quand le seuil est atteint.",
      concepts: ["ordre-stop", "ordre-limite"],
    },
    {
      id: "pp-08-e2",
      type: "calcul",
      consigne:
        "Tu as placé un ordre d'achat stop à 51,00 € pour 100 actions. Le marché ouvre directement à 51,40 € et ton ordre est exécuté à ce prix. Combien paies-tu de plus que prévu, au total, sans compter les frais ?",
      reponse: 40,
      tolerance: 0.5,
      unite: "€",
      corrige:
        "Écart : 51,40 − 51,00 = 0,40 € par action, soit 0,40 × 100 = 40,00 € de plus. Un ordre stop devient un ordre au marché : il est servi au premier prix disponible.",
      concepts: ["ordre-stop", "ordre-marche"],
    },
    {
      id: "pp-08-e3",
      type: "graphique",
      consigne:
        "Un achat stop est placé à 51,50 € (trait pointillé). Touche la bougie qui le déclenche : la première dont le plus haut atteint ce prix.",
      scene: "pp-e-achat-stop",
      bonnes: [10],
      corrige:
        "Le déclenchement a lieu à la première bougie dont le plus haut atteint 51,50 € : celle qui monte jusqu'à 51,85 €. La bougie d'avant s'arrête à 51,45 €, juste en dessous. Déclenché, l'ordre devient un ordre au marché : il est servi vers 51,50 €, ou un peu plus cher si le marché va vite.",
      concepts: ["ordre-stop"],
    },
  ],
  quiz: [
    {
      id: "c08-q1",
      difficulte: 1,
      type: "association",
      enonce: "Associe chaque ordre à ce qu'il garantit.",
      paires: [
        ["Ordre au marché", "L'exécution immédiate"],
        ["Ordre limite", "Le prix, pas l'exécution"],
        ["Ordre stop", "Le déclenchement à un niveau, pas le prix"],
      ],
      explication:
        "Chaque ordre arbitre entre certitude d'exécution et maîtrise du prix.",
      concepts: ["ordre-marche", "ordre-limite", "ordre-stop"],
    },
    {
      id: "c08-q2",
      difficulte: 1,
      type: "unique",
      enonce:
        "Le prix est à 50 €. Tu veux acheter seulement si le prix redescend à 48 €. Quel ordre places-tu ?",
      choix: [
        "Achat au marché",
        "Achat limite à 48 €",
        "Achat stop à 48 €",
        "Vente stop à 48 €",
      ],
      bonne: 1,
      explication:
        "Pour acheter plus bas que le prix actuel, on place un achat limite sous le prix.",
      concepts: ["ordre-limite"],
    },
    {
      id: "c08-q3",
      difficulte: 1,
      type: "unique",
      enonce:
        "Le prix est à 50 €. Tu veux acheter seulement si le prix franchit 52 €. Quel ordre places-tu ?",
      choix: [
        "Achat limite à 52 €",
        "Achat stop à 52 €",
        "Vente limite à 52 €",
        "Achat au marché",
      ],
      bonne: 1,
      explication:
        "Pour acheter seulement si le prix monte jusqu'à un niveau, on place un achat stop au-dessus du prix.",
      concepts: ["ordre-stop"],
    },
    {
      id: "c08-q4",
      difficulte: 2,
      type: "vraifaux",
      enonce:
        "Une fois déclenché, un ordre stop est toujours exécuté exactement à son niveau.",
      reponse: false,
      explication:
        "Déclenché, il devient un ordre au marché : en marché rapide ou en cas de gap, il peut être exécuté plus loin.",
      concepts: ["ordre-stop", "ordre-marche"],
    },
    {
      id: "c08-q5",
      difficulte: 2,
      type: "unique",
      enonce: "Le stop loss d'une position acheteuse est :",
      choix: [
        "un achat limite",
        "une vente limite",
        "une vente stop",
        "un achat stop",
      ],
      bonne: 2,
      explication:
        "Il vend la position si le prix descend jusqu'au niveau choisi : c'est une vente stop.",
      concepts: ["ordre-stop"],
    },
    {
      id: "c08-q6",
      difficulte: 2,
      type: "multiple",
      enonce: "Parmi ces placements, lesquels sont corrects ?",
      choix: [
        "Vente limite au-dessus du prix actuel",
        "Achat limite sous le prix actuel",
        "Achat stop sous le prix actuel",
        "Vente stop sous le prix actuel",
      ],
      bonnes: [0, 1, 3],
      explication:
        "L'achat stop se place au-dessus du prix actuel ; les trois autres placements sont corrects.",
      concepts: ["ordre-limite", "ordre-stop"],
    },
    {
      id: "c08-q7",
      type: "graphique",
      difficulte: 2,
      enonce: "Un achat limite est placé à 24,50 € (trait horizontal). Touche la bougie qui l'exécute.",
      scene: "pp-q-limite-execution",
      bonnes: [7],
      explication:
        "C'est la seule bougie dont le plus bas atteint 24,50 € : elle descend jusqu'à 24,45 €. L'ordre est servi à 24,50 €, ou mieux. Les bougies voisines s'en approchent sans le toucher : un ordre limite peut attendre longtemps, voire ne jamais être servi.",
      concepts: ["ordre-limite"],
    },
    {
      id: "c08-q8",
      type: "unique",
      difficulte: 2,
      figure: { scene: "pp-q-niveaux-ab", legende: "L'action cote 50,40 € ; A est au-dessus, B en dessous." },
      enonce:
        "Tu détiens cette action. Tu veux la vendre automatiquement si le prix baisse jusqu'au niveau B, pour limiter ta perte. Quel ordre places-tu ?",
      choix: ["Une vente stop en B", "Une vente limite en B", "Une vente stop en A", "Une vente limite en A"],
      bonne: 0,
      explication:
        "Pour sortir si le prix baisse, on place une vente stop sous le prix actuel, en B : c'est un stop loss. Une vente limite en B serait exécutée tout de suite, car elle accepte de vendre à 48,90 € ou mieux alors que le marché paie davantage. Une vente limite en A sert à vendre plus cher, si le prix monte.",
      concepts: ["ordre-stop", "ordre-limite"],
    },
    {
      id: "c08-q9",
      type: "comparaison",
      difficulte: 1,
      enonce:
        "Le prix est à 50,40 €. Tu veux acheter seulement si le prix monte jusqu'à un niveau choisi. Dans quel graphique l'achat stop est-il bien placé ?",
      graphiques: [{ scene: "pp-q-stop-place-a" }, { scene: "pp-q-stop-place-b" }],
      bonne: 1,
      explication:
        "Un achat stop se place au-dessus du prix actuel : il se déclenche si le prix monte jusque-là, comme en B. En A, il est sous le prix : selon les plateformes, il est refusé ou déclenché aussitôt, ce qui revient à acheter au marché.",
      concepts: ["ordre-stop"],
    },
    {
      id: "c08-q10",
      type: "unique",
      difficulte: 3,
      contexte: "Le prix est à 50,00 €. Par erreur, tu places un achat limite à 51,00 € au lieu d'un achat stop.",
      figure: { scene: "pp-q-limite-au-dessus", legende: "Le prix actuel et l'achat limite placé par erreur." },
      enonce: "Que se passe-t-il ?",
      choix: [
        "L'ordre est exécuté tout de suite, au meilleur prix disponible",
        "L'ordre attend que le prix monte jusqu'à 51,00 €",
        "L'ordre attend que le prix redescende sous 50,00 €",
        "L'ordre est exécuté à 51,00 € quand le prix y arrive",
      ],
      bonne: 0,
      explication:
        "Un achat limite fixe un prix maximal : 51,00 € ou moins. Le prix actuel, 50,00 €, est déjà en dessous : la condition est remplie et l'ordre est servi aussitôt, vers 50,00 €. Pour acheter seulement si le prix monte à 51,00 €, il fallait un achat stop.",
      concepts: ["ordre-limite", "ordre-stop"],
    },
    {
      id: "c08-q11",
      type: "vraifaux",
      difficulte: 1,
      enonce: "Un ordre limite peut ne jamais être exécuté.",
      reponse: true,
      explication:
        "Il garantit le prix, pas l'exécution : si le marché n'atteint jamais ton niveau, tu n'es jamais servi. L'achat limite à 48,50 € de l'exemple en est un cas.",
      concepts: ["ordre-limite"],
    },
  ],
};

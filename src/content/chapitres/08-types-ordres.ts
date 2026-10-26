import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "types-ordres",
  titre: "Acheter, vendre : les types d'ordres",
  sousTitre: "Au marché, limite ou stop : ce que chacun garantit, et ce qu'il ne garantit pas",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 1,
  dureeMin: 11,
  statut: "publie",
  misAJour: "2026-10-26",
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
        texte: "Trois grands types d'ordres : au marché, limite et stop. Chacun garantit une chose, jamais tout.",
        visuel: { type: "titre", titre: "Marché, limite, stop" },
      },
      {
        duree: 8,
        texte: "L'ordre au marché s'exécute tout de suite, au meilleur prix disponible. Tu es sûr d'être servi, pas du prix exact.",
        visuel: { type: "points", titre: "Ordre au marché", items: ["Exécution immédiate", "Au meilleur prix disponible", "Prix non garanti"] },
      },
      {
        duree: 9,
        texte: "L'ordre limite fixe ton prix. Un achat limite se place sous le prix actuel : tu n'achètes que si le prix descend jusque-là.",
        visuel: { type: "figure", scene: "ordres-achat", etape: 1 },
      },
      {
        duree: 10,
        texte: "L'ordre stop se déclenche quand un prix est franchi. Un achat stop se place au-dessus : tu n'achètes que si le prix monte jusque-là.",
        visuel: { type: "figure", scene: "ordres-achat", etape: 2 },
      },
      {
        duree: 10,
        texte: "À la vente, c'est symétrique : vente limite au-dessus du prix, vente stop en dessous. Le stop loss d'un achat est une vente stop.",
        visuel: { type: "figure", scene: "ordres-vente", etape: 2 },
      },
      {
        duree: 8,
        texte: "Retiens les garanties : le marché garantit l'exécution, la limite garantit le prix, le stop garantit seulement le déclenchement.",
        visuel: {
          type: "points",
          titre: "Ce qui est garanti",
          items: ["Marché : l'exécution", "Limite : le prix, pas l'exécution", "Stop : le déclenchement, pas le prix"],
        },
      },
      {
        duree: 10,
        texte: "Une fois déclenché, un ordre stop devient un ordre au marché. Dans un marché rapide, il peut donc être exécuté plus loin que prévu.",
        visuel: { type: "titre", titre: "Stop déclenché = ordre au marché" },
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
            ["Achat limite", "Sous le prix actuel", "Le prix descend jusqu'au niveau", "Le prix maximal"],
            ["Achat stop", "Au-dessus du prix actuel", "Le prix monte jusqu'au niveau", "Le déclenchement"],
            ["Vente au marché", "—", "Immédiatement", "L'exécution"],
            ["Vente limite", "Au-dessus du prix actuel", "Le prix monte jusqu'au niveau", "Le prix minimal"],
            ["Vente stop", "Sous le prix actuel", "Le prix descend jusqu'au niveau", "Le déclenchement"],
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
    { type: "figure", scene: "ordres-achat", legende: "Achat limite sous le prix actuel, achat stop au-dessus." },
    { type: "figure", scene: "ordres-vente", legende: "Vente limite au-dessus du prix actuel, vente stop en dessous." },
  ],
  exemple: {
    titre: "Trois ordres, trois résultats",
    blocs: [
      { type: "p", texte: "Une action affiche un ask de 50,02 €. Trois traders veulent l'acheter :" },
      {
        type: "liste",
        items: [
          "Le premier passe un **achat au marché** : il est servi tout de suite, autour de 50,02 €.",
          "Le deuxième place un **achat limite à 48,50 €** : il ne sera servi que si le prix redescend à 48,50 € ou moins. Si le prix monte, il n'achète jamais.",
          "Le troisième place un **achat stop à 51,50 €** : il n'achètera que si le prix monte jusqu'à 51,50 €, et peut-être un peu plus cher si le marché est rapide.",
        ],
      },
      {
        type: "p",
        texte: "Aucun n'a « raison » : chacun a choisi entre certitude d'exécution et maîtrise du prix, selon son scénario.",
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
      texte: "Le stop garantit seulement son déclenchement. En cas de gap, l'exécution peut se faire bien plus loin.",
    },
    {
      titre: "Confondre vente stop et vente limite",
      texte: "Vente limite au-dessus du prix, pour vendre plus cher ; vente stop en dessous, pour sortir si le prix baisse.",
    },
  ],
  resume: [
    "Ordre au marché : exécution immédiate, prix non garanti.",
    "Ordre limite : prix garanti, exécution non garantie ; achat limite sous le prix, vente limite au-dessus.",
    "Ordre stop : se déclenche à un niveau puis devient un ordre au marché ; achat stop au-dessus, vente stop en dessous.",
    "Le stop loss d'un achat est une vente stop : son prix d'exécution n'est pas garanti.",
  ],
  quiz: [
    {
      id: "c08-q1",
      type: "association",
      enonce: "Associe chaque ordre à ce qu'il garantit.",
      paires: [
        ["Ordre au marché", "L'exécution immédiate"],
        ["Ordre limite", "Le prix, pas l'exécution"],
        ["Ordre stop", "Le déclenchement à un niveau, pas le prix"],
      ],
      explication: "Chaque ordre arbitre entre certitude d'exécution et maîtrise du prix.",
      concepts: ["ordre-marche", "ordre-limite", "ordre-stop"],
    },
    {
      id: "c08-q2",
      type: "unique",
      enonce: "Le prix est à 50 €. Tu veux acheter seulement si le prix redescend à 48 €. Quel ordre places-tu ?",
      choix: ["Achat au marché", "Achat limite à 48 €", "Achat stop à 48 €", "Vente stop à 48 €"],
      bonne: 1,
      explication: "Pour acheter plus bas que le prix actuel, on place un achat limite sous le prix.",
      concepts: ["ordre-limite"],
    },
    {
      id: "c08-q3",
      type: "unique",
      enonce: "Le prix est à 50 €. Tu veux acheter seulement si le prix franchit 52 €. Quel ordre places-tu ?",
      choix: ["Achat limite à 52 €", "Achat stop à 52 €", "Vente limite à 52 €", "Achat au marché"],
      bonne: 1,
      explication: "Pour acheter seulement si le prix monte jusqu'à un niveau, on place un achat stop au-dessus du prix.",
      concepts: ["ordre-stop"],
    },
    {
      id: "c08-q4",
      type: "vraifaux",
      enonce: "Une fois déclenché, un ordre stop est toujours exécuté exactement à son niveau.",
      reponse: false,
      explication: "Déclenché, il devient un ordre au marché : en marché rapide ou en cas de gap, il peut être exécuté plus loin.",
      concepts: ["ordre-stop", "ordre-marche"],
    },
    {
      id: "c08-q5",
      type: "unique",
      enonce: "Le stop loss d'une position acheteuse est :",
      choix: ["un achat limite", "une vente limite", "une vente stop", "un achat stop"],
      bonne: 2,
      explication: "Il vend la position si le prix descend jusqu'au niveau choisi : c'est une vente stop.",
      concepts: ["ordre-stop"],
    },
    {
      id: "c08-q6",
      type: "multiple",
      enonce: "Parmi ces placements, lesquels sont corrects ?",
      choix: [
        "Vente limite au-dessus du prix actuel",
        "Achat limite sous le prix actuel",
        "Achat stop sous le prix actuel",
        "Vente stop sous le prix actuel",
      ],
      bonnes: [0, 1, 3],
      explication: "L'achat stop se place au-dessus du prix actuel ; les trois autres placements sont corrects.",
      concepts: ["ordre-limite", "ordre-stop"],
    },
  ],
};

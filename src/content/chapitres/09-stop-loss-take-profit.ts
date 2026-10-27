import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "stop-loss-take-profit",
  titre: "Stop Loss et Take Profit",
  sousTitre: "Décider de ses sorties avant d'entrer",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 1,
  dureeMin: 12,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Définir le stop loss et le take profit",
    "Placer un stop là où le scénario devient faux, et non à une distance arbitraire",
    "Connaître les limites d'un stop : gaps, slippage, stop qu'on déplace",
  ],
  concepts: ["stop-loss", "take-profit"],
  prerequis: ["ordre-stop", "ordre-limite"],
  intro:
    "Avant d'entrer dans un trade, un trader sait déjà où il sortira : en perte si son idée s'avère fausse, en gain si elle se réalise. Le stop loss et le take profit inscrivent ces deux décisions dans la plateforme.",
  capsule: {
    titre: "Stop Loss et Take Profit",
    scenes: [
      {
        duree: 8,
        texte:
          "Avant d'entrer dans un trade, pose-toi deux questions : où ai-je tort ? Et où je sors si j'ai raison ?",
        visuel: {
          type: "titre",
          titre: "Où ai-je tort ?",
          sousTitre: "Et où je sors si j'ai raison ?",
        },
      },
      {
        duree: 9,
        texte:
          "Le Stop Loss est un ordre qui ferme ta position automatiquement si le prix atteint un niveau de perte fixé à l'avance.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 1 },
      },
      {
        duree: 5,
        texte: "Le Take Profit la ferme quand le prix atteint ton objectif.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 2 },
      },
      {
        duree: 12,
        texte:
          "Un exemple. Tu achètes une action à 50 euros. Ton idée ne tient plus si le prix passe sous 48 : ton Stop Loss va juste en dessous, à 47,80.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 2 },
      },
      {
        duree: 10,
        texte:
          "Ton objectif est à 54,40. Tu risques 2,20 euros par action pour en viser le double. Les deux ordres se posent dès l'entrée.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 3 },
      },
      {
        duree: 11,
        texte:
          "L'erreur classique : éloigner son Stop quand le prix s'en approche. Et en cas de mouvement brutal, le Stop peut s'exécuter plus loin : c'est le slippage.",
        visuel: { type: "figure", scene: "gap-stop", etape: 1 },
      },
      {
        duree: 7,
        texte:
          "À retenir : ton Stop Loss se décide avant d'entrer, là où ton idée devient fausse.",
        visuel: {
          type: "titre",
          titre: "Le stop se décide avant d'entrer",
          sousTitre: "Là où ton idée devient fausse",
        },
      },
    ],
  },
  cours: [
    {
      titre: "Deux sorties décidées à l'avance",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Le [[stop-loss|stop loss]] (SL) est un ordre qui ferme automatiquement une position perdante à un niveau choisi à l'avance. Le [[take-profit|take profit]] (TP) ferme automatiquement une position gagnante à un objectif. Placés dès l'entrée, ils évitent de prendre ces décisions sous le coup de l'émotion.",
        },
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Techniquement, pour une position acheteuse, le stop loss est une vente stop placée sous le prix d'entrée, et le take profit une vente limite placée au-dessus. Pour une position vendeuse, c'est l'inverse : le stop loss est un achat stop au-dessus, le take profit un achat limite en dessous.",
        },
      ],
    },
    {
      titre: "Où placer son stop loss",
      blocs: [
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "Le stop se place à l'endroit où ton scénario devient faux, pas à une distance choisie au hasard ni selon la perte que tu « acceptes ». Si tu achètes parce que le prix tient au-dessus de 48 €, ton idée est invalidée quand il passe nettement sous 48 € : le stop va juste en dessous.",
        },
        {
          type: "encadre",
          variante: "retenir",
          texte:
            "D'abord le niveau d'invalidation, ensuite la taille de position. Le chapitre « Le risque par opération et la taille de position » montre comment ajuster la taille pour que la perte, si le stop est touché, reste celle que tu as choisie.",
        },
        {
          type: "p",
          texte:
            "Un stop trop serré est touché par les variations normales du prix, le « bruit », même quand l'idée était bonne. Un stop trop large expose à une perte importante, sauf à réduire fortement la taille de position. La volatilité de l'actif guide cette distance.",
        },
      ],
    },
    {
      titre: "Où placer son take profit",
      blocs: [
        {
          type: "p",
          fiabilite: "convention",
          texte:
            "L'objectif se place là où ton scénario prévoit que le mouvement s'essouffle : un niveau de prix important, un plus haut précédent, ou un multiple du risque. Le rapport entre le gain visé et la perte acceptée s'appelle le [[ratio-rendement-risque|ratio rendement/risque]] : dans l'exemple de ce chapitre, 4,40 € visés pour 2,20 € risqués, soit un ratio de 2.",
        },
        {
          type: "p",
          fiabilite: "hypothese",
          texte:
            "Certains traders ferment une partie de leur position à un premier objectif, ou déplacent leur stop à mesure que le prix avance (stop suiveur). Ces techniques se testent ; elles ne sont pas meilleures par principe.",
        },
      ],
    },
    {
      titre: "Les limites du stop loss",
      blocs: [
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "**Pas de prix garanti** : déclenché, le stop devient un ordre au marché. En cas de mouvement brutal, il est exécuté plus loin : c'est le [[slippage|slippage]].",
            "**Les gaps** : si le marché rouvre bien au-delà de ton stop, après un week-end ou une annonce, le stop est exécuté au premier prix disponible.",
            "**Le stop qu'on déplace** : éloigner son stop parce que le prix s'en approche transforme une petite perte prévue en grosse perte imprévue.",
          ],
        },
        {
          type: "encadre",
          variante: "risque",
          fiabilite: "fait",
          texte:
            "Certains courtiers proposent des stops garantis, exécutés exactement à leur niveau, moyennant un coût. Sans eux, considère que ta perte réelle peut dépasser la perte prévue.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "sl-tp-achat",
      legende:
        "Entrée à 50,00 €, stop loss à 47,80 €, take profit à 54,40 €. Le prix recule d'abord sans toucher le stop, puis atteint l'objectif.",
    },
    {
      type: "figure",
      scene: "gap-stop",
      legende:
        "Le marché rouvre à 46,90 € alors que le stop était à 47,80 € : il est exécuté à 46,90 €, 0,90 € plus bas que prévu.",
    },
  ],
  exemple: {
    titre: "Un plan de trade complet",
    blocs: [
      {
        type: "tableau",
        fiabilite: "calcul",
        entetes: ["Élément", "Valeur", "Pourquoi"],
        lignes: [
          [
            "Entrée",
            "50,00 €",
            "Le prix tient au-dessus de 48 € depuis plusieurs séances",
          ],
          [
            "Stop loss",
            "47,80 €",
            "Sous 48 €, l'idée est invalidée ; 0,20 € de marge contre le bruit",
          ],
          ["Take profit", "54,40 €", "Objectif fixé à deux fois le risque"],
          ["Risque par action", "2,20 €", "50,00 − 47,80"],
          ["Gain visé par action", "4,40 €", "54,40 − 50,00"],
          ["Ratio rendement/risque", "2", "4,40 ÷ 2,20"],
        ],
      },
      {
        type: "p",
        texte:
          "Ce plan est écrit avant d'entrer. Pendant le trade, on ne le modifie que selon des règles prévues à l'avance, jamais pour éviter une perte.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Trader sans stop loss",
      texte:
        "Sans stop, une perte n'a pas de limite décidée. Une seule position peut effacer des semaines de gains.",
    },
    {
      titre: "Placer le stop selon la perte que l'on veut bien subir",
      texte:
        "Le stop se place au niveau d'invalidation. C'est la taille de position qui s'ajuste pour que la perte reste acceptable.",
    },
    {
      titre: "Éloigner son stop en cours de trade",
      texte:
        "C'est refuser d'avoir tort. La petite perte prévue devient une grosse perte.",
    },
    {
      titre: "Croire que le stop protège exactement",
      texte:
        "Gaps et slippage peuvent faire exécuter le stop plus loin : la perte réelle peut dépasser la perte prévue.",
    },
  ],
  resume: [
    "Le stop loss ferme une position perdante, le take profit une position gagnante, à des niveaux fixés avant d'entrer.",
    "Le stop se place là où le scénario devient faux ; la taille de position s'adapte ensuite.",
    "Le ratio rendement/risque compare le gain visé à la perte acceptée.",
    "Un stop n'a pas de prix garanti : gaps et slippage peuvent aggraver la perte.",
    "On ne déplace jamais un stop pour éviter une perte.",
  ],
  exercices: [
    {
      id: "pp-09-e1",
      type: "calcul",
      consigne:
        "Tu achètes 200 actions à 32,00 € avec un stop loss à 30,50 € et un take profit à 35,00 €. Combien perds-tu si le stop est touché et exécuté à son prix, sans frais ?",
      reponse: 300,
      tolerance: 1,
      unite: "€",
      corrige:
        "Distance du stop : 32,00 − 30,50 = 1,50 € par action ; 1,50 × 200 = 300 €. L'objectif, lui, rapporterait (35,00 − 32,00) × 200 = 600 € : deux fois le risque.",
      concepts: ["stop-loss"],
    },
    {
      id: "pp-09-e2",
      type: "graphique",
      consigne:
        "Achat à 50,00 €, take profit à 54,40 €. Touche la première bougie qui atteint l'objectif, c'est-à-dire dont le plus haut touche ou dépasse 54,40 €.",
      scene: "sl-tp-achat",
      etape: 3,
      bonnes: [21],
      corrige:
        "C'est la dernière bougie : son plus haut atteint 54,55 €. La précédente culmine à 54,05 €, juste sous l'objectif. Le take profit est exécuté dès que le prix le touche, même si la bougie clôture plus bas.",
      concepts: ["take-profit"],
    },
  ],
  quiz: [
    {
      id: "c09-q1",
      type: "unique",
      enonce:
        "Tu achètes à 30 €. Ton idée est invalidée si le prix passe sous 28 €. Où places-tu ton stop loss ?",
      choix: [
        "À 31 €",
        "Juste sous 28 €, par exemple à 27,80 €",
        "À 15 €, pour être tranquille",
        "Nulle part, je surveillerai l'écran",
      ],
      bonne: 1,
      explication:
        "Le stop se place juste au-delà du niveau qui invalide le scénario, avec une petite marge contre le bruit.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q2",
      type: "unique",
      enonce:
        "Entrée à 50 €, stop à 47,80 €, objectif à 54,40 €. Quel est le ratio rendement/risque ?",
      choix: ["1", "1,5", "2", "4,4"],
      bonne: 2,
      explication: "Gain visé 4,40 €, risque 2,20 € : 4,40 ÷ 2,20 = 2.",
      concepts: ["take-profit", "stop-loss"],
    },
    {
      id: "c09-q3",
      type: "vraifaux",
      enonce:
        "Pour une position vendeuse, le stop loss se place au-dessus du prix d'entrée.",
      reponse: true,
      explication:
        "Une position vendeuse perd quand le prix monte : son stop est un achat stop placé au-dessus.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q4",
      type: "unique",
      enonce:
        "Le marché rouvre après le week-end à 46,90 € alors que ton stop était à 47,80 €. À quel prix ta position est-elle probablement vendue ?",
      choix: [
        "47,80 €",
        "Autour de 46,90 €",
        "48,00 €",
        "Elle n'est pas vendue",
      ],
      bonne: 1,
      explication:
        "Le stop se déclenche puis s'exécute au premier prix disponible, ici autour de 46,90 €.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q5",
      type: "multiple",
      enonce: "Quelles pratiques sont saines ?",
      choix: [
        "Définir stop et objectif avant d'entrer",
        "Éloigner son stop quand le prix s'en approche",
        "Placer le stop au niveau où l'idée devient fausse",
        "Adapter la taille de position à la distance du stop",
      ],
      bonnes: [0, 2, 3],
      explication:
        "Éloigner son stop pour éviter une perte est la seule mauvaise pratique de la liste.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q6",
      type: "vraifaux",
      enonce: "Un take profit est un ordre limite.",
      reponse: true,
      explication:
        "Il s'exécute au niveau choisi ou à un meilleur prix : vente limite pour une position acheteuse, achat limite pour une position vendeuse.",
      concepts: ["take-profit"],
    },
  ],
};

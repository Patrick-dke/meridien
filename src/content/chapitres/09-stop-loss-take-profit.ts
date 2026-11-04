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
  misAJour: "2026-10-27",
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
          "Avant d'entrer dans un trade, pose-toi deux questions. Où ai-je tort ? Et où je sors, si j'ai raison ?",
        visuel: {
          type: "titre",
          titre: "Où ai-je tort ?",
          sousTitre: "Et où je sors si j'ai raison ?",
        },
      },
      {
        duree: 9,
        texte:
          "Le stop loss est un ordre qui ferme ta position tout seul, si le prix atteint un niveau de perte fixé à l'avance.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 1 },
      },
      {
        duree: 5,
        texte: "Le take profit, lui, la ferme quand le prix atteint ton objectif.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 2 },
      },
      {
        duree: 12,
        texte:
          "Prenons un exemple. Tu achètes une action à 50 euros. Ton idée ne tient plus si le prix passe sous 48. Alors ton stop va juste en dessous, à 47 euros 80.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 2 },
      },
      {
        duree: 10,
        texte:
          "Ton objectif est à 54 euros 40. Tu risques 2 euros 20 par action, pour en viser le double. Et les deux ordres se posent dès l'entrée.",
        visuel: { type: "figure", scene: "sl-tp-achat", etape: 3 },
      },
      {
        duree: 11,
        texte:
          "L'erreur classique ? Éloigner son stop quand le prix s'en approche. Et regarde ce gap : en cas de mouvement brutal, le stop s'exécute plus loin. C'est le slippage.",
        visuel: { type: "figure", scene: "gap-stop", etape: 1 },
      },
      {
        duree: 7,
        texte:
          "À retenir : ton stop se décide avant d'entrer, là où ton idée devient fausse.",
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
        {
          type: "figure",
          scene: "pp-sl-tp-vente",
          fiabilite: "calcul",
          legende:
            "Position vendeuse ouverte à 60,50 € : stop loss au-dessus, à 61,70 €, take profit en dessous, à 58,10 €. Le prix monte d'abord sans toucher le stop, puis baisse jusqu'à l'objectif : 2,40 € de gain visé pour 1,20 € de risque.",
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
          type: "figure",
          scene: "pp-stop-invalidation",
          legende:
            "Le prix rebondit trois fois juste au-dessus de 48,00 €. Achat à 50,00 €, stop juste sous ce support, à 47,80 € : s'il est touché, l'idée « le prix tient au-dessus de 48 € » est fausse.",
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
        {
          type: "figure",
          scene: "pp-stop-trop-serre",
          legende:
            "Entrée à 50,00 € avec un stop serré à 49,70 € : une petite baisse ordinaire le touche dès la bougie suivante, puis le prix monte jusqu'à l'objectif de 51,50 €. Un stop sous le dernier creux, à 48,90 €, aurait tenu.",
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
      difficulte: 1,
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
      difficulte: 2,
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
      difficulte: 2,
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
      difficulte: 2,
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
      difficulte: 1,
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
      difficulte: 2,
      type: "vraifaux",
      enonce: "Un take profit est un ordre limite.",
      reponse: true,
      explication:
        "Il s'exécute au niveau choisi ou à un meilleur prix : vente limite pour une position acheteuse, achat limite pour une position vendeuse.",
      concepts: ["take-profit"],
    },
    {
      id: "c09-q7",
      type: "graphique",
      difficulte: 2,
      enonce: "Achat à 50,00 € avec un stop loss à 48,80 €. Touche la bougie qui déclenche le stop.",
      scene: "pp-q-stop-touche",
      bonnes: [8],
      explication:
        "C'est la seule bougie dont le plus bas passe sous 48,80 € : elle descend à 48,70 €. Le stop est exécuté et la perte est limitée à environ 1,20 € par action. Le prix remonte ensuite au-dessus de 50 € : le stop n'a pas « eu tort », il a fait ce qui était prévu.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q8",
      type: "comparaison",
      difficulte: 2,
      enonce:
        "Même achat à 50,00 €, sur un prix qui a rebondi trois fois au-dessus de 48,00 €. Quel plan place son stop au bon endroit ?",
      graphiques: [{ scene: "pp-q-plan-a" }, { scene: "pp-q-plan-b" }],
      bonne: 1,
      explication:
        "En B, le stop à 47,80 € est juste sous le support : s'il est touché, l'idée « le prix tient au-dessus de 48 € » est fausse. En A, le stop à 49,40 € ne correspond à rien : un recul ordinaire peut le toucher alors que le scénario tient toujours. C'est ensuite la taille de position qui s'adapte à la distance du stop.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q9",
      type: "unique",
      difficulte: 2,
      contexte:
        "Tu vends à découvert 100 unités à 60,50 €, avec un stop loss à 61,70 € et un take profit à 58,10 €.",
      figure: { scene: "pp-sl-tp-vente", etape: 2, legende: "Entrée, stop loss et take profit de la position vendeuse." },
      enonce: "Combien perds-tu si le stop loss est touché et exécuté à son prix, sans frais ?",
      choix: ["120 €", "240 €", "60 €", "1,20 €"],
      bonne: 0,
      explication:
        "Pour une position vendeuse, le stop est au-dessus : (61,70 − 60,50) × 100 = 1,20 × 100 = 120 €. Le take profit rapporterait (60,50 − 58,10) × 100 = 240 €, deux fois le risque. 1,20 € est la perte pour une seule unité.",
      concepts: ["stop-loss", "take-profit"],
    },
    {
      id: "c09-q10",
      type: "unique",
      difficulte: 3,
      figure: { scene: "pp-q-stop-serre-plan", legende: "Achat à 50,00 €, stop à 49,70 €, objectif à 51,50 €." },
      enonce: "Ce trader a été sorti avec une perte, puis le prix a atteint son objectif. Quelle est la cause la plus probable ?",
      choix: [
        "Son stop était trop serré, dans le bruit normal du prix",
        "Son objectif était trop éloigné de son entrée",
        "Il aurait dû entrer avec un ordre limite",
        "Le marché a fait un gap au-delà de son stop",
      ],
      bonne: 0,
      explication:
        "Le stop à 49,70 € n'était qu'à 0,30 € de l'entrée, alors que chaque bougie parcourt de 0,45 € à 1,00 € : un recul ordinaire l'a touché. Un stop sous le dernier creux, vers 48,90 €, aurait tenu, avec une taille de position réduite pour garder le même risque.",
      concepts: ["stop-loss"],
    },
    {
      id: "c09-q11",
      type: "vraifaux",
      difficulte: 1,
      enonce: "Le stop loss et le take profit se décident avant d'entrer dans le trade.",
      reponse: true,
      explication:
        "Les deux sorties font partie du plan. Une fois en position, l'émotion pousse à éloigner le stop ou à couper le gain trop tôt.",
      concepts: ["stop-loss", "take-profit"],
    },
  ],
};

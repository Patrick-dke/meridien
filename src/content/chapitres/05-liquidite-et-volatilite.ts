import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "liquidite-et-volatilite",
  titre: "Liquidité et volatilité",
  sousTitre:
    "Pourras-tu sortir facilement ? De combien le prix peut-il bouger ?",
  academie: "fondamentaux",
  module: "introduction",
  niveau: 1,
  dureeMin: 12,
  statut: "publie",
  misAJour: "2026-10-26",
  objectifs: [
    "Définir la liquidité et reconnaître un marché liquide",
    "Définir la volatilité et ses effets sur le risque",
    "Anticiper les moments où elles changent : sessions, annonces, week-ends",
  ],
  concepts: ["liquidite", "volatilite"],
  prerequis: ["carnet-ordres"],
  intro:
    "Deux mots reviennent sans cesse en trading : liquidité et volatilité. Le premier dit si tu peux entrer et sortir facilement, le second de combien le prix peut bouger. Ensemble, ils déterminent une bonne part de ton risque réel.",
  capsule: {
    titre: "Liquidité et volatilité",
    scenes: [
      {
        duree: 10,
        texte:
          "Deux mots à ne pas confondre : la liquidité, c'est la facilité à acheter ou vendre. La volatilité, c'est l'ampleur des mouvements de prix.",
        visuel: { type: "titre", titre: "Liquidité ≠ volatilité" },
      },
      {
        duree: 10,
        texte:
          "Un marché liquide a beaucoup d'ordres à chaque prix. Ici, un achat de 1 000 actions est exécuté au meilleur prix, sans bouger le marché.",
        visuel: { type: "figure", scene: "carnet-profond", etape: 1 },
      },
      {
        duree: 8,
        texte:
          "Dans un carnet mince, le même ordre consomme plusieurs niveaux : le prix obtenu se dégrade. C'est le slippage.",
        visuel: { type: "figure", scene: "carnet-mince", etape: 1 },
      },
      {
        duree: 6,
        texte:
          "La volatilité, maintenant. Ici, les bougies sont petites : le prix bouge peu.",
        visuel: { type: "figure", scene: "volatilite-annonce", etape: 0 },
      },
      {
        duree: 10,
        texte:
          "Puis une annonce économique tombe : les bougies deviennent quatre à cinq fois plus grandes. Un stop placé trop près peut être touché en quelques secondes.",
        visuel: { type: "figure", scene: "volatilite-annonce", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "Liquidité et volatilité changent selon l'heure, les annonces et les jours. Le même actif peut être calme le matin et agité l'après-midi.",
        visuel: {
          type: "points",
          titre: "Quand ça change",
          items: [
            "Ouverture et fermeture des sessions",
            "Annonces économiques",
            "Nuits, week-ends, jours fériés",
          ],
        },
      },
      {
        duree: 8,
        texte:
          "Retiens : avant d'entrer, demande-toi si tu pourras sortir facilement, et de combien le prix peut bouger contre toi.",
        visuel: {
          type: "points",
          items: [
            "Pourrai-je sortir facilement ?",
            "De combien le prix peut-il bouger ?",
          ],
        },
      },
    ],
  },
  cours: [
    {
      titre: "La liquidité",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "La [[liquidite|liquidité]] mesure la facilité avec laquelle on peut acheter ou vendre un actif rapidement, sans faire bouger son prix. Un marché liquide a beaucoup d'ordres à chaque niveau de prix : le spread est serré, l'exécution rapide et le prix obtenu proche du prix affiché.",
        },
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "**Très liquides** : les grandes paires de devises (EUR/USD, USD/JPY), les grands indices, les actions des plus grandes entreprises.",
            "**Moins liquides** : les petites entreprises cotées, de nombreuses cryptomonnaies secondaires, certaines paires de devises dites exotiques.",
            "**Variable** : la liquidité d'un même actif change selon l'heure, le jour et l'actualité.",
          ],
        },
        {
          type: "encadre",
          variante: "ecole",
          fiabilite: "ecole",
          texte:
            "Attention au vocabulaire : les écoles SMC et ICT appellent aussi « liquidité » les zones où des ordres stop seraient regroupés, au-dessus des sommets ou sous les creux. C'est un second sens, propre à ces écoles, étudié dans l'académie « Liquidité et ICT ». Dans ce chapitre, liquidité veut dire facilité d'échange.",
        },
      ],
    },
    {
      titre: "La volatilité",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "La [[volatilite|volatilité]] décrit l'amplitude des variations de prix. Un actif volatil peut bouger de plusieurs pour cent en une journée ; un actif peu volatil, de quelques dixièmes. On la mesure par exemple avec l'ATR, proche de l'amplitude moyenne des bougies, ou avec l'écart-type des variations.",
        },
        {
          type: "p",
          texte:
            "Plus la volatilité est forte, plus le prix peut aller loin contre toi en peu de temps. Un stop loss doit donc être plus éloigné, et la taille de position plus petite pour garder le même risque en euros. C'est le lien direct entre volatilité et gestion du risque.",
        },
      ],
    },
    {
      titre: "Quand elles changent",
      blocs: [
        {
          type: "tableau",
          fiabilite: "fait",
          entetes: ["Moment", "Liquidité", "Volatilité"],
          lignes: [
            [
              "Chevauchement des sessions de Londres et de New York (Forex)",
              "Élevée",
              "Souvent élevée",
            ],
            [
              "Nuit, fin de session",
              "Plus faible",
              "Souvent plus faible, sauf événement",
            ],
            [
              "Autour d'une [[annonce-economique|annonce économique]]",
              "Peut chuter quelques instants",
              "Très élevée, mouvements brusques",
            ],
            [
              "Réouverture après un week-end",
              "Faible à l'ouverture",
              "Risque de [[gap|gap]]",
            ],
          ],
        },
        {
          type: "encadre",
          variante: "attention",
          texte:
            "Autour des annonces, le spread peut s'élargir fortement et le slippage devenir important. Beaucoup de traders débutants évitent simplement d'avoir une position ouverte à ces moments-là.",
        },
      ],
    },
    {
      titre: "Liquidité et volatilité ensemble",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Les deux notions sont liées sans être identiques. Un marché peut être liquide et volatil (une grande paire de devises pendant une annonce), ou peu liquide et pourtant calme (une petite action peu échangée, jusqu'au jour où un ordre important la fait bondir). Le cas le plus dangereux combine faible liquidité et forte volatilité : prix qui sautent, spreads larges, stops exécutés loin de leur niveau.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "carnet-profond",
      legende:
        "Carnet profond : un achat de 1 000 actions est exécuté entièrement au meilleur prix vendeur.",
    },
    {
      type: "figure",
      scene: "carnet-mince",
      legende:
        "Carnet mince : le même achat consomme quatre niveaux, prix moyen 50,03 € au lieu de 50,02 €.",
    },
    {
      type: "figure",
      scene: "volatilite-annonce",
      legende:
        "Après l'annonce, l'amplitude des bougies est multipliée par quatre à cinq.",
    },
  ],
  exemple: {
    titre: "Le même stop, deux volatilités",
    blocs: [
      {
        type: "p",
        texte:
          "Sur une paire de devises calme, les bougies d'un quart d'heure font environ 4 pips. Un stop placé à 10 pips de l'entrée laisse au prix de la marge pour respirer. Après une annonce, ces bougies font 18 pips : le même stop de 10 pips peut être touché par une seule bougie, sans que ton scénario soit pour autant faux.",
      },
      {
        type: "p",
        texte:
          "Deux réponses cohérentes : ne pas avoir de position au moment de l'annonce, ou élargir le stop et réduire la taille de position pour garder le même risque en euros. La pire réponse : garder un stop serré par habitude.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Confondre les deux sens de « liquidité »",
      texte:
        "Facilité d'échange d'un côté, zones de stops supposées de l'autre (écoles ICT et SMC). Précise toujours de quel sens il s'agit.",
    },
    {
      titre: "Utiliser le même stop quelle que soit la volatilité",
      texte:
        "Un stop doit tenir compte de l'amplitude habituelle du prix. Trop serré, il est touché par le bruit ; plus large, il impose une position plus petite.",
    },
    {
      titre: "Trader une annonce sans le savoir",
      texte:
        "Consulte le calendrier des annonces avant de prendre position. Une annonce peut transformer un trade calme en trade très risqué en quelques secondes.",
    },
  ],
  resume: [
    "La liquidité est la facilité à acheter ou vendre sans faire bouger le prix.",
    "La volatilité est l'amplitude des variations de prix.",
    "Les deux varient selon l'heure, les annonces et les jours.",
    "Plus de volatilité impose un stop plus large et une position plus petite pour le même risque.",
    "En ICT et SMC, « liquidité » désigne aussi des zones de stops supposées : c'est un autre sens, d'école.",
  ],
  exercices: [
    {
      id: "pp-05-e1",
      type: "calcul",
      consigne:
        "Sur un actif très liquide, le spread vaut 0,05 € ; sur un actif peu liquide, 0,30 €. Tu fais 20 allers-retours d'une action. Combien te coûte en plus l'actif peu liquide, en spread seulement ?",
      reponse: 5,
      tolerance: 0.05,
      unite: "€",
      corrige:
        "Différence de spread : 0,30 − 0,05 = 0,25 € par aller-retour. Sur 20 allers-retours : 0,25 × 20 = 5,00 €. La liquidité se paie (ou s'économise) à chaque transaction.",
      concepts: ["liquidite"],
    },
    {
      id: "pp-05-e2",
      type: "reflexion",
      consigne:
        "Une annonce économique importante tombe dans dix minutes sur la paire que tu trades. Cite deux effets possibles sur tes ordres et une précaution à prendre.",
      corrige:
        "Effets possibles : écartement du spread, glissement (slippage) à l'exécution, stop exécuté plus loin que prévu, mouvements brusques dans les deux sens. Précautions : ne pas ouvrir de position juste avant, réduire la taille, ou vérifier que le stop et le risque restent acceptables même avec du glissement.",
      concepts: ["volatilite"],
    },
  ],
  quiz: [
    {
      id: "c05-q1",
      type: "unique",
      enonce: "Qu'est-ce qu'un marché liquide ?",
      choix: [
        "Un marché dont le prix monte souvent",
        "Un marché où l'on peut acheter et vendre rapidement sans faire bouger le prix",
        "Un marché où les bougies sont grandes",
        "Un marché ouvert 24 heures sur 24",
      ],
      bonne: 1,
      explication:
        "La liquidité, c'est la facilité d'échange : beaucoup d'ordres à chaque prix, spread serré, peu de slippage.",
      concepts: ["liquidite"],
    },
    {
      id: "c05-q2",
      type: "vraifaux",
      enonce: "La volatilité mesure la facilité à trouver un acheteur.",
      reponse: false,
      explication:
        "C'est la liquidité. La volatilité mesure l'amplitude des mouvements de prix.",
      concepts: ["volatilite", "liquidite"],
    },
    {
      id: "c05-q3",
      type: "multiple",
      enonce:
        "Quels moments s'accompagnent souvent d'une volatilité accrue ou d'un risque de saut de prix ?",
      choix: [
        "La publication d'une annonce économique importante",
        "La réouverture du marché après un week-end",
        "Le milieu d'une séance calme, sans actualité",
        "Une décision de taux d'une banque centrale",
      ],
      bonnes: [0, 1, 3],
      explication:
        "Annonces, décisions de banques centrales et réouvertures concentrent les mouvements brusques et les gaps.",
      concepts: ["volatilite"],
    },
    {
      id: "c05-q4",
      type: "unique",
      enonce:
        "La volatilité d'un actif double. Pour garder le même risque en euros avec un stop adapté, que fais-tu ?",
      choix: [
        "Je garde le même stop et la même taille",
        "J'élargis le stop et je réduis la taille de position",
        "Je resserre le stop et j'augmente la taille",
        "Je supprime le stop",
      ],
      bonne: 1,
      explication:
        "Un stop plus large tient compte de mouvements plus grands ; une taille plus petite garde la perte possible au même niveau.",
      concepts: ["volatilite"],
    },
    {
      id: "c05-q5",
      type: "vraifaux",
      enonce:
        "Dans les écoles ICT et SMC, « liquidité » peut désigner des zones où des ordres stop seraient regroupés.",
      reponse: true,
      explication:
        "C'est un second sens, propre à ces écoles et non démontré comme mécanisme. Le sens courant reste la facilité d'échange.",
      concepts: ["liquidite"],
    },
    {
      id: "c05-q6",
      type: "unique",
      enonce: "Dans un carnet mince, un gros achat au marché :",
      choix: [
        "est exécuté au prix affiché",
        "consomme plusieurs niveaux de prix et obtient un prix moyen moins bon",
        "est automatiquement refusé",
        "fait baisser le prix",
      ],
      bonne: 1,
      explication:
        "Faute de quantité au meilleur prix, l'ordre remonte le carnet : c'est le slippage dû au manque de liquidité.",
      concepts: ["liquidite"],
    },
  ],
};

import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "couts-du-trading",
  titre: "Les coûts : spread, commission, slippage",
  sousTitre: "Des coûts certains pour des gains incertains",
  academie: "fondamentaux",
  module: "outils-du-trader",
  niveau: 1,
  dureeMin: 11,
  statut: "publie",
  misAJour: "2026-10-27",
  objectifs: [
    "Identifier les trois coûts principaux d'une opération",
    "Calculer le coût d'un aller-retour",
    "Comprendre pourquoi les coûts pèsent davantage sur les petits objectifs",
  ],
  concepts: ["spread", "commission", "slippage"],
  prerequis: ["bid-ask", "ordre-marche"],
  intro:
    "Chaque opération coûte quelque chose, même quand le courtier affiche « zéro commission ». Ces coûts sont certains, alors que les gains ne le sont pas : il faut savoir les calculer.",
  capsule: {
    titre: "Ce que coûte un trade",
    scenes: [
      {
        duree: 10,
        texte:
          "Un trade coûte de l'argent avant même de rapporter quoi que ce soit. Il y a trois coûts principaux : le spread, la commission et le slippage.",
        visuel: {
          type: "titre",
          titre: "Ce que coûte un trade",
          sousTitre: "Spread, commission, slippage",
        },
      },
      {
        duree: 9,
        texte:
          "Le spread, d'abord. Tu achètes au prix vendeur, et tu revends au prix acheteur. Si tu revends aussitôt, tu perds l'écart.",
        visuel: { type: "figure", scene: "carnet-simple" },
      },
      {
        duree: 9,
        texte:
          "La commission, ensuite : des frais fixes, ou un pourcentage, à chaque ordre. Sans commission, le spread est souvent plus large.",
        visuel: {
          type: "points",
          titre: "La commission",
          items: [
            "Fixe par lot ou par ordre",
            "Ou en pourcentage du montant",
            "Parfois remplacée par un spread plus large",
          ],
        },
      },
      {
        duree: 9,
        texte:
          "Le slippage, enfin. C'est l'écart entre le prix demandé et le prix obtenu, quand le marché bouge vite ou manque de profondeur.",
        visuel: { type: "figure", scene: "carnet-mince", etape: 1 },
      },
      {
        duree: 6,
        texte:
          "Il frappe surtout les ordres au marché et les stops, pendant les annonces et les gaps.",
        visuel: { type: "figure", scene: "gap-stop", etape: 1 },
      },
      {
        duree: 8,
        texte:
          "Additionne-les. Sur un objectif de 10 pips, un coût de 2 pips, c'est déjà un cinquième du gain visé.",
        visuel: {
          type: "formule",
          texte: "2 pips ÷ 10 pips = 20 %",
          legende: "Part de l'objectif absorbée par les coûts",
        },
      },
      {
        duree: 8,
        texte:
          "Retiens bien : les coûts sont certains, les gains ne le sont pas. Plus ton objectif est petit, plus ils pèsent.",
        visuel: { type: "titre", titre: "Coûts certains, gains incertains" },
      },
    ],
  },
  cours: [
    {
      titre: "Le spread",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Le [[spread|spread]] est l'écart entre le prix vendeur (ask) et le prix acheteur (bid). Comme on achète à l'ask et qu'on vend au bid, une position démarre toujours légèrement en perte : il faut que le prix bouge au moins de la valeur du spread pour revenir à zéro.",
        },
        {
          type: "figure",
          scene: "pp-spread-depart",
          fiabilite: "calcul",
          legende:
            "Achat à l'ask, 1,0852, alors que le bid est à 1,0850 ; les bougies montrent le bid. La position démarre 2 pips en perte et ne repasse au-dessus de zéro que lorsque le bid dépasse 1,0852, à la neuvième bougie.",
        },
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Sur le Forex, le spread se compte en pips : quelques dixièmes de pip sur les grandes paires aux heures actives, plusieurs pips sur des paires moins échangées, davantage la nuit ou autour d'une annonce. Sur une action, il se compte en centimes.",
        },
      ],
    },
    {
      titre: "La commission",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "La [[commission|commission]] est facturée par le courtier à chaque ordre : un montant fixe par lot ou par ordre, ou un pourcentage du montant échangé. Certains comptes n'en prennent pas mais élargissent le spread ; d'autres affichent un spread très serré et facturent une commission. Seul le **coût total d'un aller-retour** permet de comparer.",
        },
        {
          type: "encadre",
          variante: "attention",
          fiabilite: "fait",
          texte:
            "D'autres frais ne dépendent pas d'un ordre : les frais de financement (swap) pour garder une position à effet de levier d'un jour sur l'autre, les frais de conversion de devise, parfois des frais d'inactivité. Lis la grille tarifaire complète de ton courtier.",
        },
      ],
    },
    {
      titre: "Le slippage",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Le [[slippage|slippage]] est l'écart entre le prix attendu et le prix réellement obtenu. Il apparaît quand le prix bouge entre l'envoi de l'ordre et son exécution, ou quand la quantité disponible au meilleur prix ne suffit pas.",
        },
        {
          type: "liste",
          fiabilite: "fait",
          items: [
            "Il touche les **ordres au marché** et les **ordres stop**, qui s'exécutent au prix disponible.",
            "Il augmente autour des [[annonce-economique|annonces économiques]], à l'ouverture des marchés et lors des [[gap|gaps]].",
            "Les **ordres limite** n'en subissent pas de défavorable : ils s'exécutent à leur prix ou mieux, ou pas du tout.",
          ],
        },
      ],
    },
    {
      titre: "Le coût total, rapporté à l'objectif",
      blocs: [
        {
          type: "formule",
          fiabilite: "calcul",
          texte:
            "Coût d'un aller-retour = spread + commissions (entrée et sortie) + slippage",
        },
        {
          type: "p",
          fiabilite: "calcul",
          texte:
            "Ce coût se compare à l'objectif du trade. Un coût de 1,5 pip est négligeable face à un objectif de 100 pips (1,5 %), mais il absorbe 15 % d'un objectif de 10 pips. C'est pourquoi le scalping, aux objectifs minuscules, est le style le plus exigeant en matière de coûts.",
        },
        {
          type: "figure",
          scene: "pp-couts-objectif",
          fiabilite: "calcul",
          legende:
            "Entrée à 1,08500, objectif à 1,08600 : 10 pips. Les coûts d'un aller-retour, 1,5 pip, en représentent 15 % : le prix doit d'abord les couvrir avant le moindre gain.",
        },
      ],
    },
  ],
  illustrations: [
    {
      type: "figure",
      scene: "carnet-simple",
      legende:
        "Le spread : 0,02 € entre le meilleur vendeur (50,02 €) et le meilleur acheteur (50,00 €).",
    },
    {
      type: "figure",
      scene: "carnet-mince",
      legende:
        "Slippage par manque de profondeur : prix moyen de 50,03 € au lieu des 50,02 € affichés.",
    },
    {
      type: "figure",
      scene: "gap-stop",
      legende: "Slippage par gap : stop à 47,80 €, exécution à 46,90 €.",
    },
  ],
  exemple: {
    titre: "Le coût d'un aller-retour sur EUR/USD",
    blocs: [
      {
        type: "p",
        texte:
          "Tu achètes 1 lot de EUR/USD (100 000 euros), puis tu revends. Ton compte est en dollars : un pip vaut 10 $ pour cette taille. Ton courtier affiche un spread de 0,8 pip et facture 3,50 $ de commission par lot, à l'entrée et à la sortie. À la sortie, un léger slippage de 0,2 pip s'ajoute.",
      },
      {
        type: "tableau",
        fiabilite: "calcul",
        entetes: ["Coût", "Calcul", "Montant"],
        lignes: [
          ["Spread", "0,8 pip × 10 $", "8,00 $"],
          ["Commissions", "2 × 3,50 $", "7,00 $"],
          ["Slippage", "0,2 pip × 10 $", "2,00 $"],
          ["**Total**", "", "**17,00 $**"],
        ],
      },
      {
        type: "p",
        fiabilite: "calcul",
        texte:
          "17 $ correspondent à 1,7 pip. Pour un objectif de 10 pips (100 $), les coûts représentent 17 % du gain espéré ; pour un objectif de 50 pips (500 $), 3,4 %.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Croire les publicités « zéro commission »",
      texte:
        "Le courtier se rémunère alors sur le spread, parfois plus large. Compare toujours le coût total.",
    },
    {
      titre: "Négliger le slippage dans ses calculs",
      texte:
        "Sur les ordres au marché et les stops, surtout autour des annonces, il fait partie du coût réel.",
    },
    {
      titre: "Viser des objectifs minuscules",
      texte:
        "Plus l'objectif est petit, plus la part absorbée par les coûts est grande.",
    },
  ],
  resume: [
    "Trois coûts principaux : spread, commission, slippage.",
    "On achète à l'ask, on vend au bid : chaque position démarre en perte de la valeur du spread.",
    "Commission et spread se comparent ensemble : seul compte le coût total d'un aller-retour.",
    "Le slippage touche les ordres au marché et les stops, surtout lors des annonces et des gaps.",
    "Les coûts pèsent d'autant plus que l'objectif est petit.",
  ],
  exercices: [
    {
      id: "pp-10-e1",
      type: "calcul",
      consigne:
        "Tu fais un aller-retour sur 100 actions : spread de 0,04 € par action, commission de 2 € à l'entrée et 2 € à la sortie, et glissement de 0,02 € par action à l'exécution. Quel est le coût total de l'aller-retour ?",
      reponse: 10,
      tolerance: 0.2,
      unite: "€",
      aide: "Coût d'un aller-retour = spread + commissions (entrée et sortie) + glissement.",
      corrige:
        "Spread : 0,04 × 100 = 4 €. Commissions : 2 + 2 = 4 €. Glissement : 0,02 × 100 = 2 €. Total : 10 €.",
      concepts: ["spread", "commission", "slippage"],
    },
    {
      id: "pp-10-e2",
      type: "calcul",
      consigne:
        "Ta méthode vise un gain brut moyen de 30 € par trade, et chaque aller-retour coûte 10 €. Quelle part du gain brut les coûts emportent-ils, en pourcentage ?",
      reponse: 33.3,
      tolerance: 0.4,
      unite: "%",
      corrige:
        "10 ÷ 30 = 0,333, soit environ 33,3 %. Un tiers du gain visé part en coûts : plus les objectifs sont petits, plus les coûts pèsent.",
      concepts: ["spread", "commission"],
    },
  ],
  quiz: [
    {
      id: "c10-q1",
      difficulte: 2,
      type: "unique",
      enonce:
        "Sur EUR/USD, l'ask est à 1,08512 et le bid à 1,08500. Quel est le spread ?",
      choix: ["0,12 pip", "1,2 pip", "12 pips", "0,0012 pip"],
      bonne: 1,
      explication:
        "1,08512 − 1,08500 = 0,00012, soit 1,2 pip (un pip vaut 0,0001).",
      concepts: ["spread"],
    },
    {
      id: "c10-q2",
      difficulte: 1,
      type: "vraifaux",
      enonce: "Un ordre limite peut subir un slippage défavorable.",
      reponse: false,
      explication:
        "Un ordre limite s'exécute à son prix ou à un meilleur prix, ou pas du tout.",
      concepts: ["slippage"],
    },
    {
      id: "c10-q3",
      difficulte: 2,
      type: "unique",
      enonce:
        "Spread de 1 pip et commission de 7 $ aller-retour pour 1 lot de EUR/USD, compte en dollars. Quel est le coût total, hors slippage ?",
      choix: ["8 $", "10 $", "17 $", "70 $"],
      bonne: 2,
      explication:
        "1 pip × 10 $ = 10 $ de spread, plus 7 $ de commission : 17 $.",
      concepts: ["spread", "commission"],
    },
    {
      id: "c10-q4",
      difficulte: 1,
      type: "unique",
      enonce:
        "Un coût total de 2 pips représente quelle part d'un objectif de 10 pips ?",
      choix: ["2 %", "5 %", "10 %", "20 %"],
      bonne: 3,
      explication: "2 ÷ 10 = 20 % : un cinquième du gain visé.",
      concepts: ["spread", "commission", "slippage"],
    },
    {
      id: "c10-q5",
      difficulte: 2,
      type: "multiple",
      enonce: "Dans quelles situations le slippage est-il le plus probable ?",
      choix: [
        "Lors d'une annonce économique importante",
        "À la réouverture après un week-end",
        "Sur un ordre limite placé loin du prix",
        "Sur un ordre au marché dans un marché peu liquide",
      ],
      bonnes: [0, 1, 3],
      explication:
        "Annonces, gaps et manque de liquidité provoquent le slippage ; un ordre limite n'en subit pas de défavorable.",
      concepts: ["slippage"],
    },
    {
      id: "c10-q6",
      type: "graphique",
      difficulte: 2,
      enonce:
        "Tu as acheté EUR/USD à l'ask, 1,0852 ; les bougies montrent le bid. Touche la seule bougie qui clôture avec ta position en gain, hors commission.",
      scene: "pp-q-retour-zero",
      bonnes: [6],
      explication:
        "Pour revendre, tu passes par le bid. Ta position n'est en gain que si le bid dépasse ton prix d'achat, 1,0852. Seule cette bougie clôture au-dessus, à 1,0853 : toutes les autres clôturent entre 1,0848 et 1,0851, donc en perte du point de vue de ta position.",
      concepts: ["spread"],
    },
    {
      id: "c10-q7",
      type: "unique",
      difficulte: 1,
      contexte:
        "Tu achètes 200 actions au marché, puis tu changes d'avis et tu les revends aussitôt au marché. Ce courtier ne prend pas de commission.",
      figure: { scene: "pp-q-carnet-couts", legende: "Le carnet d'ordres au moment de ton aller-retour." },
      enonce: "Combien te coûte cet aller-retour ?",
      choix: ["10 €", "5 €", "20 €", "0 €"],
      bonne: 0,
      explication:
        "Tu achètes au meilleur vendeur, 25,05 €, et tu revends au meilleur acheteur, 25,00 €. Les quantités affichées, 600 et 500 actions, suffisent pour 200 actions. Tu perds le spread, 0,05 € par action : 0,05 × 200 = 10 €.",
      concepts: ["spread"],
    },
    {
      id: "c10-q8",
      type: "comparaison",
      difficulte: 1,
      enonce:
        "Deux plans avec les mêmes coûts d'un aller-retour, 1,5 pip. Dans quel plan les coûts absorbent-ils la plus grande part du gain visé ?",
      graphiques: [{ scene: "pp-q-objectif-court" }, { scene: "pp-q-objectif-long" }],
      bonne: 0,
      explication:
        "Le plan A vise 10 pips : 1,5 ÷ 10 = 15 % de l'objectif part en coûts. Le plan B vise 50 pips : 1,5 ÷ 50 = 3 %. Les coûts sont les mêmes, mais ils pèsent beaucoup plus sur un petit objectif.",
      concepts: ["spread", "commission"],
    },
    {
      id: "c10-q9",
      type: "unique",
      difficulte: 3,
      contexte:
        "Tu as acheté 1 lot d'EUR/USD avec un compte en dollars : 1 pip vaut 10 $. Ton stop est à 1,0820. Après le week-end, le marché rouvre à 1,0805.",
      figure: { scene: "pp-q-gap-stop", legende: "EUR/USD avant et après le week-end." },
      enonce: "Combien te coûte le slippage sur ce stop ?",
      choix: ["150 $", "15 $", "50 $", "1 500 $"],
      bonne: 0,
      explication:
        "Une fois atteint, un stop devient un ordre au marché. Le marché rouvre directement à 1,0805, sans passer par 1,0820 : l'exécution se fait vers 1,0805. L'écart vaut 1,0820 − 1,0805 = 0,0015, soit 15 pips × 10 $ = 150 $ de perte en plus de celle prévue.",
      concepts: ["slippage"],
    },
    {
      id: "c10-q10",
      type: "unique",
      difficulte: 2,
      contexte:
        "Compte A : spread de 1,8 pip, sans commission. Compte B : spread de 0,3 pip et commission de 7 $ par lot pour l'aller-retour. Tu trades 1 lot d'EUR/USD, où 1 pip vaut 10 $.",
      enonce: "Quel compte coûte le moins cher par aller-retour ?",
      choix: [
        "Le compte B : 10 $ au total",
        "Le compte A : 18 $ au total",
        "Les deux coûtent autant",
        "Le compte A, sans commission",
      ],
      bonne: 0,
      explication:
        "A : 1,8 pip × 10 $ = 18 $. B : 0,3 pip × 10 $ = 3 $, plus 7 $ de commission, soit 10 $. « Sans commission » ne veut pas dire moins cher : seul le coût total d'un aller-retour compte.",
      concepts: ["spread", "commission"],
    },
    {
      id: "c10-q11",
      type: "vraifaux",
      difficulte: 1,
      enonce:
        "Juste après un achat, ta position affiche une petite perte égale au spread, même si le prix n'a pas bougé.",
      reponse: true,
      explication:
        "Tu achètes à l'ask, et ta position se valorise au bid, le prix auquel tu pourrais revendre. L'écart entre les deux, le spread, apparaît tout de suite comme une perte.",
      concepts: ["spread"],
    },
  ],
};

import type { Chapitre } from "../schema";

export const chapitre: Chapitre = {
  slug: "participants-du-marche",
  titre: "Les participants du marché",
  sousTitre: "Qui est de l'autre côté de ton trade, et pourquoi",
  academie: "fondamentaux",
  module: "introduction",
  niveau: 1,
  dureeMin: 10,
  statut: "publie",
  misAJour: "2026-10-27",
  objectifs: [
    "Identifier les grands types d'acteurs et leurs motivations",
    "Comprendre le rôle du courtier et du teneur de marché",
    "Situer la place du particulier face aux autres acteurs",
  ],
  concepts: ["participants", "courtier"],
  prerequis: ["trading"],
  intro:
    "Derrière chaque prix, il y a des acteurs aux objectifs très différents : piloter l'économie, gérer l'épargne, se protéger d'un risque, animer le marché, spéculer. Les connaître aide à comprendre pourquoi les prix bougent, et quelle est ta place.",
  capsule: {
    titre: "Qui est de l'autre côté ?",
    scenes: [
      {
        duree: 7,
        texte:
          "Quand tu achètes, quelqu'un te vend. Mais qui est de l'autre côté ? Et pourquoi est-il là ?",
        visuel: { type: "titre", titre: "Qui est de l'autre côté ?" },
      },
      {
        duree: 8,
        texte:
          "D'abord, les banques centrales. Elles fixent les taux directeurs. Regarde : une seule décision, et le prix bouge d'un coup.",
        visuel: { type: "figure", scene: "pp-decision-taux", etape: 1 },
      },
      {
        duree: 8,
        texte:
          "Ensuite, les banques, les fonds, les assureurs. Ils gèrent des sommes énormes. Tu vois ? Un seul de leurs ordres déplace le prix.",
        visuel: { type: "figure", scene: "pp-ordre-institution", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "Les entreprises, elles, achètent des devises pour payer à l'étranger. Souvent, elles fixent leur prix à l'avance. Elles se couvrent. Elles ne spéculent pas.",
        visuel: { type: "figure", scene: "pp-couverture", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "Les teneurs de marché affichent en permanence un prix d'achat et un prix de vente. Ils gagnent l'écart. Ton courtier, lui, te donne accès au marché.",
        visuel: { type: "figure", scene: "carnet-simple" },
      },
      {
        duree: 9,
        texte:
          "Et puis les particuliers, comme toi. Tes ordres pèsent peu. Tu paies plus de frais, et tu vas moins vite que les professionnels.",
        visuel: { type: "figure", scene: "pp-ordre-particulier", etape: 1 },
      },
      {
        duree: 10,
        texte:
          "Ce n'est pas une raison d'abandonner. C'est une raison d'être humble. Ton avantage ne viendra ni de la vitesse, ni de la taille, mais de ta discipline.",
        visuel: {
          type: "titre",
          titre: "Ton terrain",
          sousTitre: "Patience, discipline, maîtrise du risque",
        },
      },
    ],
  },
  cours: [
    {
      titre: "Des objectifs différents",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Tous les participants n'achètent et ne vendent pas pour les mêmes raisons. Certains cherchent à se protéger d'un risque (on parle de **couverture**), d'autres à placer de l'épargne, d'autres à fournir de la liquidité contre rémunération, d'autres encore à spéculer sur les variations de prix.",
        },
        {
          type: "tableau",
          fiabilite: "fait",
          entetes: ["Acteur", "Exemples", "Motivation principale"],
          lignes: [
            [
              "Banques centrales",
              "BCE, Réserve fédérale américaine, BEAC, BCEAO",
              "Politique monétaire : inflation, activité, stabilité financière",
            ],
            [
              "Banques",
              "Grandes banques commerciales et d'investissement",
              "Opérations pour leurs clients, tenue de marché, gestion de leurs propres risques",
            ],
            [
              "Gestionnaires d'actifs",
              "Fonds d'investissement, fonds de pension, assureurs",
              "Faire fructifier l'épargne sur le long terme",
            ],
            [
              "Entreprises",
              "Exportateurs, compagnies aériennes, industriels",
              "Se couvrir contre les variations de devises ou de matières premières",
            ],
            [
              "Teneurs de marché",
              "Sociétés spécialisées, banques",
              "Gagner le spread en affichant des prix en permanence",
            ],
            [
              "Fonds spéculatifs et sociétés de trading",
              "Fonds alternatifs, trading à haute fréquence",
              "Profiter des variations de prix ou d'écarts entre prix",
            ],
            [
              "Particuliers",
              "Investisseurs et traders individuels",
              "Épargne ou spéculation",
            ],
          ],
        },
      ],
    },
    {
      titre: "Le courtier et le teneur de marché",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un particulier n'accède pas directement aux marchés : il passe par un [[courtier|courtier]] qui transmet ou exécute ses ordres. Selon son modèle, le courtier peut transmettre tes ordres au marché, ou se placer lui-même en [[contrepartie|contrepartie]] : il est alors de l'autre côté de ton trade.",
        },
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Un [[teneur-de-marche|teneur de marché]] affiche en permanence un prix d'achat et un prix de vente. Il apporte de la liquidité et se rémunère principalement sur le [[spread|spread]].",
        },
        {
          type: "figure",
          scene: "carnet-simple",
          fiabilite: "calcul",
          legende:
            "Les deux prix d'un teneur de marché : il achète au bid, 50,00 €, et vend à l'ask, 50,02 €. S'il achète puis revend 1 000 actions, il encaisse le spread : 1 000 × 0,02 = 20 €, à condition que le prix ne bouge pas contre lui entre-temps.",
        },
        {
          type: "encadre",
          variante: "attention",
          fiabilite: "fait",
          texte:
            "Avant d'ouvrir un compte, vérifie que le courtier est agréé par une autorité financière reconnue (par exemple l'AMF en France ou la FCA au Royaume-Uni). L'AMF publie des listes noires de sites non autorisés. Un courtier non réglementé n'offre aucune garantie sur tes fonds.",
        },
      ],
    },
    {
      titre: "Pourquoi les prix bougent",
      blocs: [
        {
          type: "p",
          fiabilite: "fait",
          texte:
            "Les prix bougent quand l'équilibre entre ces acteurs change : une banque centrale modifie ses taux, une entreprise doit acheter des devises en grande quantité, des fonds réorganisent leurs portefeuilles, une nouvelle économique change les anticipations. Beaucoup de ces flux n'ont rien à voir avec l'analyse des graphiques.",
        },
        {
          type: "figure",
          scene: "pp-decision-taux",
          fiabilite: "calcul",
          legende:
            "Une paire de devises fictive, heure par heure. Douze heures calmes, de 6 à 8 pips d'amplitude, puis la décision de taux : la bougie suivante parcourt 78 pips et le prix baisse d'environ 0,5 %. Les heures d'après restent agitées.",
        },
        {
          type: "figure",
          scene: "pp-ordre-institution",
          fiabilite: "calcul",
          legende:
            "Un fonds achète 1 500 actions au marché : son ordre prend quatre niveaux du carnet, paie environ 50,04 € en moyenne, et le dernier échange se fait à 50,05 €. Un gros ordre déplace le prix.",
        },
        {
          type: "encadre",
          variante: "ecole",
          fiabilite: "ecole",
          texte:
            "Certaines écoles de trading (SMC, ICT) parlent de « smart money » et prêtent aux institutions des intentions précises, comme « aller chercher les stops des particuliers ». Ce sont des interprétations, pas des faits établis : elles sont présentées comme telles dans les académies concernées.",
        },
      ],
    },
    {
      titre: "Ta place de particulier",
      blocs: [
        {
          type: "liste",
          items: [
            "**Taille** : tes ordres ne font pas bouger le marché. C'est un avantage (tu entres et sors facilement) et une limite (tu n'influences rien).",
            "**Coûts** : tu paies en général un spread et des frais plus élevés que les institutions.",
            "**Vitesse et information** : tu ne battras pas les professionnels sur la rapidité. Ton éventuel avantage viendra de la discipline, de la patience et de la gestion du risque.",
          ],
        },
        {
          type: "figure",
          scene: "pp-ordre-particulier",
          legende:
            "Le même carnet face à un particulier : son achat de 50 actions est servi en entier au meilleur prix, 50,02 €. Le prix affiché ne bouge pas.",
        },
      ],
    },
  ],
  illustrations: [],
  exemple: {
    titre: "Une même journée, des acteurs différents",
    blocs: [
      {
        type: "p",
        texte:
          "Une entreprise européenne doit payer 50 millions de dollars à un fournisseur américain dans trois mois. Pour ne pas subir une hausse du dollar d'ici là, elle fixe dès aujourd'hui le prix auquel elle achètera ces dollars : c'est une couverture, pas un pari.",
      },
      {
        type: "figure",
        scene: "pp-couverture",
        fiabilite: "calcul",
        legende:
          "EUR/USD, en dollars pour un euro, passe de 1,0850 à 1,0600 en treize semaines : le dollar s'apprécie. Sans couverture, 50 millions de dollars coûteraient 47 169 811 € au lieu de 46 082 949 €, environ 1,09 million d'euros de plus. Couverte, l'entreprise paie au taux fixé ; elle n'aurait pas non plus profité d'une baisse du dollar.",
      },
      {
        type: "p",
        texte:
          "Le même jour, un fonds spéculatif vend des dollars parce qu'il anticipe une baisse, un teneur de marché affiche des prix aux deux et gagne le spread, et un particulier prend une petite position à l'achat sur le dollar avec un CFD. Ils échangent tous sur le même marché, pour des raisons sans rapport entre elles.",
      },
    ],
  },
  erreurs: [
    {
      titre: "Imaginer un « marché » qui pense et qui veut",
      texte:
        "Le marché n'a pas d'intention : il est la somme de milliers de décisions aux objectifs différents. Lui prêter une volonté conduit à chercher des complots là où il y a des flux.",
    },
    {
      titre: "Choisir un courtier pour son bonus",
      texte:
        "Bonus de dépôt, levier très élevé et promesses de gains sont des signaux d'alerte. Le premier critère est la réglementation.",
    },
    {
      titre: "Croire qu'on peut battre les professionnels sur leur terrain",
      texte:
        "Vitesse, information, coûts : un particulier part avec un handicap. Son terrain, c'est la patience et la maîtrise du risque.",
    },
  ],
  resume: [
    "Les participants ont des objectifs différents : politique monétaire, épargne, couverture, tenue de marché, spéculation.",
    "Le particulier passe par un courtier, qui transmet ses ordres ou en est la contrepartie.",
    "Vérifier la réglementation du courtier est indispensable.",
    "Les prix bougent quand l'équilibre des flux change ; beaucoup de ces flux ignorent les graphiques.",
    "« Smart money » et intentions prêtées aux institutions relèvent de l'interprétation d'école.",
  ],
  exercices: [
    {
      id: "pp-04-e1",
      type: "reflexion",
      consigne:
        "Classe ces quatre acteurs : une banque centrale qui relève ses taux, un fonds de pension, un particulier qui trade sur son téléphone, un teneur de marché. Lequel fournit en permanence des prix d'achat et de vente ? Lequel a l'horizon le plus long ? Lequel pèse le moins sur les prix ?",
      corrige:
        "Le teneur de marché affiche en continu un prix d'achat et un prix de vente : il fournit la liquidité. Le fonds de pension a l'horizon le plus long (des années). Le particulier pèse le moins sur les prix. La banque centrale n'est pas un « trader » : ses décisions de taux déplacent tout le marché des devises et des taux.",
      concepts: ["participants"],
    },
    {
      id: "pp-04-e2",
      type: "reflexion",
      consigne:
        "Un courtier inconnu te propose un « bonus de 100 % » sur ton dépôt et un levier de 1:1000. Cite trois vérifications à faire avant d'ouvrir un compte chez lui.",
      corrige:
        "Vérifications attendues : 1) la régulation (nom de l'autorité, numéro de licence vérifiable sur le site de cette autorité) ; 2) les conditions du bonus (volume à trader avant tout retrait, souvent impossible à atteindre) ; 3) les modalités et délais de retrait ; aussi la séparation des fonds clients et la protection contre le solde négatif. Un levier extrême et un bonus agressif sont des signaux d'alerte, pas des avantages.",
      concepts: ["courtier"],
    },
    {
      id: "pp-04-e3",
      type: "calcul",
      consigne:
        "Un teneur de marché affiche 49,98 € à l'achat et 50,02 € à la vente. Dans la journée, il achète 2 000 actions à son prix d'achat puis les revend toutes à son prix de vente. Combien gagne-t-il sur l'écart, en euros, avant ses propres frais ?",
      reponse: 80,
      tolerance: 1,
      unite: "€",
      aide: "Gain = écart entre ses deux prix × quantité.",
      corrige:
        "Écart : 50,02 − 49,98 = 0,04 € par action. 2 000 × 0,04 = 80 €. Il ne gagne cette somme que s'il revend avant que le prix ne parte contre lui : son métier comporte aussi un risque.",
      concepts: ["participants"],
    },
    {
      id: "pp-04-e4",
      type: "calcul",
      consigne:
        "Une entreprise européenne doit payer 1 085 000 dollars dans trois mois. Elle fixe dès aujourd'hui le taux à 1,0850 dollar pour un euro. Combien d'euros paiera-t-elle, quel que soit le cours à l'échéance ?",
      reponse: 1000000,
      tolerance: 1,
      unite: "€",
      aide: "Montant en euros = montant en dollars ÷ taux, exprimé en dollars pour un euro.",
      corrige:
        "1 085 000 ÷ 1,0850 = 1 000 000 €. Si le dollar monte, elle est protégée ; s'il baisse, elle ne profite pas de la baisse. Ce qu'elle achète, c'est un montant connu dès aujourd'hui.",
      concepts: ["participants"],
    },
  ],
  quiz: [
    {
      id: "c04-q1",
      difficulte: 1,
      type: "association",
      enonce: "Associe chaque acteur à sa motivation principale.",
      paires: [
        ["Banque centrale", "Piloter l'inflation et l'activité par les taux"],
        ["Exportateur", "Se couvrir contre une variation de devise"],
        [
          "Teneur de marché",
          "Gagner le spread en affichant des prix en permanence",
        ],
        ["Fonds de pension", "Faire fructifier l'épargne sur le long terme"],
      ],
      explication:
        "Chaque acteur a sa logique : politique monétaire, couverture, tenue de marché, gestion d'épargne.",
      concepts: ["participants"],
    },
    {
      id: "c04-q2",
      difficulte: 2,
      type: "unique",
      enonce:
        "Une compagnie aérienne fixe aujourd'hui le prix du carburant qu'elle achètera dans six mois. Que fait-elle ?",
      choix: [
        "Elle spécule sur une hausse du pétrole",
        "Elle se couvre contre une variation du prix",
        "Elle fait de la tenue de marché",
        "Elle manipule le marché",
      ],
      bonne: 1,
      explication:
        "Elle se protège d'une hausse future du carburant : c'est une couverture.",
      concepts: ["participants"],
    },
    {
      id: "c04-q3",
      difficulte: 2,
      type: "vraifaux",
      enonce: "Un courtier peut être la contrepartie de tes ordres.",
      reponse: true,
      explication:
        "Certains courtiers (teneurs de marché) se placent eux-mêmes de l'autre côté des ordres de leurs clients.",
      concepts: ["courtier"],
    },
    {
      id: "c04-q4",
      difficulte: 1,
      type: "unique",
      enonce: "Quel est le premier critère pour choisir un courtier ?",
      choix: [
        "Le bonus offert au dépôt",
        "Le levier maximal proposé",
        "Son agrément par une autorité financière reconnue",
        "Son nombre d'abonnés sur les réseaux sociaux",
      ],
      bonne: 2,
      explication:
        "La réglementation protège tes fonds ; bonus et levier élevé sont plutôt des signaux d'alerte.",
      concepts: ["courtier"],
    },
    {
      id: "c04-q5",
      difficulte: 2,
      type: "vraifaux",
      enonce:
        "L'idée que les institutions « vont chercher les stops des particuliers » est un fait démontré.",
      reponse: false,
      explication:
        "C'est une interprétation propre à certaines écoles (SMC, ICT). Elle peut être discutée et testée, mais elle n'est pas établie.",
      concepts: ["participants"],
    },
    {
      id: "c04-q6",
      type: "graphique",
      difficulte: 2,
      enonce:
        "Ce jour-là, une banque centrale annonce sa décision de taux. Touche la bougie qui réagit à l'annonce : celle dont l'écart entre le plus haut et le plus bas est le plus grand.",
      scene: "pp-q-annonce-taux",
      bonnes: [10],
      explication:
        "Cette bougie parcourt environ 73 pips, quand les heures calmes d'avant en parcourent moins de 10. Une décision de taux change d'un coup les anticipations : banques, fonds et entreprises ajustent leurs positions en même temps. Les heures suivantes restent agitées.",
      concepts: ["participants"],
    },
    {
      id: "c04-q7",
      type: "unique",
      difficulte: 2,
      contexte:
        "Un teneur de marché affiche les deux meilleurs prix de ce carnet. Dans la journée, il achète 2 500 actions à son prix d'achat et en revend autant à son prix de vente.",
      figure: { scene: "carnet-simple", legende: "Carnet d'ordres de l'action, cinq niveaux de chaque côté." },
      enonce: "Combien gagne-t-il sur l'écart, avant ses propres frais ?",
      choix: ["25 €", "50 €", "125 €", "500 €"],
      bonne: 1,
      explication:
        "Il achète à 50,00 € et revend à 50,02 € : 0,02 € par action, soit 2 500 × 0,02 = 50 €. Quelques centimes, mais répétés des milliers de fois par jour : c'est le métier du teneur de marché. Il prend aussi un risque si le prix bouge avant qu'il ait revendu.",
      concepts: ["participants"],
    },
    {
      id: "c04-q8",
      type: "unique",
      difficulte: 3,
      contexte:
        "Une entreprise européenne a fixé à 1,0850 le taux auquel elle achètera 50 millions de dollars dans trois mois. À l'échéance, le marché est à 1,1000 dollar pour un euro.",
      figure: { scene: "pp-q-couverture", legende: "EUR/USD sur treize semaines, et le taux fixé par l'entreprise." },
      enonce: "Quel est l'effet de sa couverture ?",
      choix: [
        "Elle paie au taux fixé, sans profiter de la baisse du dollar",
        "Elle paie au taux du marché, plus avantageux ce jour-là",
        "Elle touche la différence en plus du taux du marché",
        "Sa couverture est annulée puisque le dollar a baissé",
      ],
      bonne: 0,
      explication:
        "À 1,1000, un euro achète plus de dollars : sans couverture, 50 millions de dollars auraient coûté 45 454 545 € au lieu de 46 082 949 €, environ 628 000 € de moins. La couverture fait renoncer à ce gain possible en échange d'un coût connu à l'avance. C'est le prix de la sécurité, pas une erreur.",
      concepts: ["participants"],
    },
    {
      id: "c04-q9",
      type: "unique",
      difficulte: 1,
      figure: { scene: "carnet-simple", legende: "Carnet d'ordres de l'action, cinq niveaux de chaque côté." },
      enonce: "Un particulier achète 50 actions au marché. À quel prix sont-elles servies ?",
      choix: ["50,00 €", "50,01 €", "50,02 €", "50,03 €"],
      bonne: 2,
      explication:
        "300 actions sont proposées au meilleur prix, 50,02 € : les 50 actions y sont toutes servies, et le prix affiché ne bouge pas. Un particulier pèse trop peu pour déplacer ce carnet ; un fonds qui achète 1 500 actions le ferait monter.",
      concepts: ["participants"],
    },
    {
      id: "c04-q10",
      type: "unique",
      difficulte: 2,
      contexte:
        "Un site te propose un compte avec un « bonus de 100 % » et un levier de 1:500. Tu ne trouves son nom sur la liste d'aucune autorité financière.",
      enonce: "Que fais-tu ?",
      choix: [
        "Je renonce tant que son agrément n'est pas vérifié",
        "J'ouvre un petit compte pour tester ses services",
        "Je dépose vite pour profiter du bonus offert",
        "Je demande à des amis s'ils y ont déjà gagné",
      ],
      bonne: 0,
      explication:
        "Sans agrément vérifiable, rien ne protège ton argent, même pour un petit dépôt. Le bonus et le levier très élevé sont des signaux d'alerte, et les gains d'un ami ne disent rien de la solidité du courtier.",
      concepts: ["courtier"],
    },
    {
      id: "c04-q11",
      type: "multiple",
      difficulte: 2,
      enonce: "Face aux professionnels, quels sont les vrais handicaps d'un particulier ?",
      choix: [
        "Il paie souvent un spread et des frais plus élevés",
        "Il est moins rapide et moins bien informé",
        "Ses ordres font bouger les prix contre lui",
        "Il ne peut pas sortir facilement d'une position",
      ],
      bonnes: [0, 1],
      explication:
        "Coûts plus élevés, vitesse et information moindres : ce sont ses handicaps. En revanche, ses petits ordres ne déplacent pas le prix et il entre et sort facilement : sa petite taille est même un avantage sur ce point.",
      concepts: ["participants"],
    },
  ],
};

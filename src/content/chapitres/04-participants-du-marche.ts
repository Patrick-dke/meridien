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
  misAJour: "2026-10-26",
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
          "Quand tu achètes, quelqu'un te vend. Qui sont ces autres participants, et pourquoi sont-ils là ?",
        visuel: { type: "titre", titre: "Qui est de l'autre côté ?" },
      },
      {
        duree: 8,
        texte:
          "Les banques centrales fixent les taux d'intérêt directeurs. Leurs décisions font bouger les devises et des marchés entiers.",
        visuel: {
          type: "points",
          titre: "Banques centrales",
          items: [
            "Fixent les taux directeurs",
            "Pilotent l'inflation et l'activité",
          ],
        },
      },
      {
        duree: 8,
        texte:
          "Banques, fonds et assureurs gèrent des sommes énormes : épargne, retraites, couverture de risques. Leurs ordres pèsent lourd.",
        visuel: {
          type: "points",
          titre: "Banques et institutions",
          items: [
            "Gestion de l'épargne",
            "Couverture des risques",
            "Opérations pour leurs clients",
          ],
        },
      },
      {
        duree: 10,
        texte:
          "Les entreprises achètent des devises pour payer à l'étranger, ou fixent à l'avance le prix d'une matière première. Elles se couvrent, elles ne spéculent pas.",
        visuel: {
          type: "points",
          titre: "Entreprises",
          items: ["Paiements internationaux", "Couverture des prix futurs"],
        },
      },
      {
        duree: 10,
        texte:
          "Les teneurs de marché affichent en permanence un prix d'achat et un prix de vente. Ton courtier, lui, te donne accès au marché et exécute tes ordres.",
        visuel: {
          type: "points",
          titre: "Intermédiaires",
          items: [
            "Teneurs de marché : gagnent le spread",
            "Courtiers : donnent accès au marché",
          ],
        },
      },
      {
        duree: 9,
        texte:
          "Et puis les particuliers, comme toi. Ils pèsent peu, paient souvent plus de frais, et n'ont ni la vitesse ni l'information des professionnels.",
        visuel: {
          type: "points",
          titre: "Particuliers",
          items: ["Petits volumes", "Frais plus élevés", "Moins d'information"],
        },
      },
      {
        duree: 10,
        texte:
          "Ce n'est pas une raison d'abandonner, mais une raison d'être humble : ton avantage ne viendra ni de la vitesse ni de la taille, mais de la discipline.",
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
  ],
  quiz: [
    {
      id: "c04-q1",
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
      type: "vraifaux",
      enonce: "Un courtier peut être la contrepartie de tes ordres.",
      reponse: true,
      explication:
        "Certains courtiers (teneurs de marché) se placent eux-mêmes de l'autre côté des ordres de leurs clients.",
      concepts: ["courtier"],
    },
    {
      id: "c04-q4",
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
      type: "vraifaux",
      enonce:
        "L'idée que les institutions « vont chercher les stops des particuliers » est un fait démontré.",
      reponse: false,
      explication:
        "C'est une interprétation propre à certaines écoles (SMC, ICT). Elle peut être discutée et testée, mais elle n'est pas établie.",
      concepts: ["participants"],
    },
  ],
};

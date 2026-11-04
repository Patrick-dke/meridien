import Link from "next/link";
import { ApercuOutils } from "@/components/accueil/ApercuOutils";
import { ApercuSeance } from "@/components/accueil/ApercuSeance";
import { Contact } from "@/components/accueil/Contact";
import { PrixDepart, ProgrammeTarifs } from "@/components/offre/Programme";
import { duree } from "@/lib/duree";
import { BoutonReprendre } from "@/components/progression/Indicateurs";
import { fiche, parcours, titresChapitres } from "@/content";
import { modulesPresentes } from "@/content/presentation";
import { typographie } from "@/lib/typographie";

const totalChapitres = modulesPresentes.reduce((a, m) => a + m.chapitres.length, 0);
const totalMinutes = modulesPresentes.reduce((a, m) => a + (m.resume?.dureeMin ?? 0), 0);
const introduction = modulesPresentes.find((m) => m.gratuit)!;

const deroule = [
  { titre: "Capsule", texte: "Une à quatre vidéos narrées d'une à deux minutes : le graphique s'annote au rythme de la voix." },
  { titre: "Cours", texte: "Le texte complet, illustré de figures et de graphiques annotés, notion par notion." },
  { titre: "Exemple", texte: "Un cas chiffré, pas à pas, sur un graphique." },
  { titre: "Exercices", texte: "Repérer une zone, toucher la bougie qui casse la structure, calculer un risque." },
  { titre: "Quiz", texte: "Tiré d'une banque de questions, réponses mélangées, corrigé détaillé." },
  { titre: "Examen", texte: "À la fin du module : connaissances, application et graphiques jamais vus." },
];

/** Les questions d'un visiteur qui débute, et l'endroit du parcours qui y répond. */
const questions = [
  {
    question: "Par où commencer quand on part de zéro ?",
    reponse: "Trois questions sur ton niveau et le temps dont tu disposes, et Méridien t'indique ton point de départ. Sans compte, sans e-mail.",
    lien: "/commencer/",
    action: "Trouver mon point de départ",
  },
  {
    question: "Comment lit-on un graphique ?",
    reponse: "Corps, mèches, clôtures, unités de temps : un chapitre gratuit pour lire ce que le prix a fait, bougie par bougie.",
    lien: "/chapitre/chandeliers-japonais/",
    action: "Lire le chapitre",
  },
  {
    question: "Comment repère-t-on une opportunité ?",
    reponse:
      "Supports, structure de marché, rejets, cassures et retests : tu apprends à repérer les zones où le prix réagit, puis à attendre que le contexte confirme.",
    lien: "/formations/analyse-technique/",
    action: "Découvrir l'analyse technique",
  },
  {
    question: "Comment construire une stratégie ?",
    reponse:
      "Huit modèles présentés comme des hypothèses, puis la méthode pour écrire tes propres règles, les tester sur un grand nombre de cas et passer au compte démo.",
    lien: "/formations/modeles-et-methode/",
    action: "Explorer les stratégies",
  },
  {
    question: "Comment éviter les décisions impulsives ?",
    reponse:
      "Un plan écrit avant d'entrer, un journal tenu après chaque position, et les biais qui poussent à agir trop vite, reconnus avant qu'ils ne coûtent.",
    lien: "/formations/risque-et-discipline/",
    action: "Développer ma discipline",
  },
  {
    question: "Comment s'entraîner avant d'engager de l'argent réel ?",
    reponse:
      "Le compte d'entraînement rejoue un marché bougie par bougie avec un solde fictif, en FCFA, en euros ou en dollars. Tu appliques tes règles et tu mesures le résultat.",
    lien: "/pratique/",
    action: "Essayer le compte d'entraînement",
  },
  {
    question: "Quels outils utilisent les traders ?",
    reponse:
      "TradingView et MetaTrader 5 pris en main pas à pas, des calculateurs de position et de risque, puis l'indicateur et le robot Méridien pour appliquer tes règles.",
    lien: "/outils/",
    action: "Explorer les outils",
  },
];

const pratique = [
  { titre: "Compte d'entraînement", texte: "Un compte fictif en FCFA, euros ou dollars, sur un marché rejoué bougie par bougie." },
  { titre: "Calculateurs", texte: "Taille de position, rendement/risque avec frais, valeur du pip, espérance." },
  { titre: "Journal de trading", texte: "Chaque position notée, puis taux de réussite, espérance et drawdown." },
];

export default function Accueil() {
  const titres = Object.fromEntries(titresChapitres);
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_1.08fr] lg:gap-14 lg:pb-24 lg:pt-16">
        <div className="min-w-0">
          <h1 className="text-[1.7rem] leading-[1.08] text-ink min-[360px]:text-[2rem] sm:text-5xl lg:text-[2.85rem]">
            <span className="block">Comprends les marchés.</span> <span className="block">Construis ta méthode.</span>{" "}
            <span className="accent block">Passe à la pratique.</span>
          </h1>
          <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-relaxed text-ink-2 sm:text-lg">
            {typographie(
              "Et si tu apprenais enfin à lire un graphique, à repérer une opportunité et à décider avec méthode ? Huit modules progressifs, du premier chandelier aux modèles avancés, et un marché d'entraînement pour essayer sans argent réel.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BoutonReprendre parcours={parcours} titres={titres} />
            <Link href="/formations/" className="btn btn-secondaire btn-grand">
              Découvrir le programme
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-3">
            Le premier module est gratuit, en entier. Les suivants se débloquent un par un
            <PrixDepart prefixe=", à partir de " />, en paiement unique.
          </p>
        </div>
        <div className="min-w-0 lg:pl-2">
          <ApercuSeance />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 border-y border-line-strong sm:grid-cols-4">
          {[
            [String(modulesPresentes.length), "modules, du débutant à l'avancé"],
            [String(totalChapitres), "chapitres"],
            [`${Math.round(totalMinutes / 60)} h`, "de cours, capsules comprises"],
            ["Gratuit", "le premier module, en entier"],
          ].map(([chiffre, libelle], i) => (
            <div
              key={libelle}
              className={`py-5 pr-4 ${i % 2 ? "pl-4 sm:pl-5" : ""} ${i > 0 ? "sm:border-l sm:border-line sm:pl-5" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""}`}
            >
              <dt className="sr-only">{libelle}</dt>
              <dd>
                <span className="block font-[family-name:var(--font-display)] text-2xl text-ink sm:text-3xl">{chiffre}</span>
                <span className="mt-1 block text-sm text-ink-2">{libelle}</span>
              </dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="titre-questions" className="grid gap-10 pt-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="surtitre">Tes questions</p>
            <h2 id="titre-questions" className="mt-2 text-3xl text-ink sm:text-4xl">
              Ce que tu veux savoir, et où l&apos;apprendre
            </h2>
            <p className="mt-4 max-w-md text-ink-2">
              {typographie("Les questions que se pose presque tout le monde au départ. Chacune a sa réponse quelque part dans le parcours : la voici.")}
            </p>
          </div>
          <ol className="min-w-0 border-t border-line">
            {questions.map((q, i) => (
              <li key={q.question} className="revele grid gap-2 border-b border-line py-5 sm:grid-cols-[2rem_1fr] sm:gap-x-4">
                <span className="hidden font-mono text-xs text-ink-3 tabular sm:block sm:pt-1.5">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-xl leading-snug text-ink">{typographie(q.question)}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{typographie(q.reponse)}</p>
                  <Link href={q.lien} className="lien mt-2 inline-block text-sm">
                    {typographie(q.action)}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titre-programme" className="pt-24">
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
            <h2 id="titre-programme" className="text-3xl text-ink sm:text-4xl">
              Un parcours en huit étapes
            </h2>
            <p className="text-ink-2 md:text-right">
              {typographie(
                "Chaque module s'appuie sur le précédent : tu sais ce que tu as acquis et ce qui vient ensuite. Paiement unique par module, accès sans limite de durée.",
              )}
            </p>
          </div>
          <div className="mt-8">
            <ProgrammeTarifs modules={modulesPresentes} />
          </div>
          <p className="mt-4 text-sm">
            <Link href="/formations/" className="lien">
              Découvrir les formations
            </Link>
          </p>
        </section>

        <section aria-labelledby="titre-introduction" className="grid gap-10 pt-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="surtitre">Gratuit, en entier</p>
            <h2 id="titre-introduction" className="mt-2 text-3xl text-ink sm:text-4xl">
              Premiers pas
            </h2>
            <p className="mt-4 max-w-md text-ink-2">
              {typographie(
                `${introduction.chapitres.length} chapitres pour poser des bases solides : marchés, prix, chandeliers, ordres, coûts, levier, taille de position. Environ ${duree(introduction.resume?.dureeMin ?? 0)} de cours. Les chapitres s'ouvrent sans compte ; un compte gratuit enregistre ta progression et ouvre les quiz.`,
              )}
            </p>
            <div className="mt-6">
              <BoutonReprendre parcours={parcours} titres={titres} />
            </div>
          </div>
          <ol className="grid min-w-0 gap-x-8 border-t border-line sm:grid-cols-2">
            {introduction.chapitres.map((slug, i) => (
              <li key={slug} className="revele border-b border-line" style={{ animationRangeStart: `entry ${(i % 2) * 8}%` }}>
                <Link href={`/chapitre/${slug}/`} className="group flex items-baseline gap-3 py-3">
                  <span className="font-mono text-xs text-ink-3 tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[0.95rem] text-ink group-hover:underline group-hover:underline-offset-4">
                    {typographie(fiche(slug)?.titre ?? slug)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titre-deroule" className="pt-24">
          <h2 id="titre-deroule" className="max-w-xl text-3xl text-ink sm:text-4xl">
            Comprendre, essayer, vérifier
          </h2>
          <p className="mt-3 max-w-xl text-ink-2">
            {typographie("Chaque chapitre suit le même chemin, de la vidéo à l'examen : tu sais toujours où tu en es.")}
          </p>
          <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
            <span className="absolute left-0 right-0 top-[0.7rem] hidden h-px bg-line-strong lg:block" aria-hidden="true" />
            {deroule.map((e, i) => (
              <li key={e.titre} className="revele relative" style={{ animationRangeStart: `entry ${i * 6}%` }}>
                <span className="relative flex size-6 items-center justify-center bg-bg font-mono text-xs text-ink">
                  <span className={`absolute inset-0 border ${i === deroule.length - 1 ? "border-accent bg-accent-soft" : "border-line-strong"}`} />
                  <span className="relative">{i + 1}</span>
                </span>
                <p className="mt-3 font-semibold text-ink">{e.titre}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{typographie(e.texte)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm">
            <Link href="/methode/" className="lien">
              La méthode pédagogique en détail
            </Link>
          </p>
        </section>
      </div>

      <section aria-labelledby="titre-pratique" className="mt-24 bg-brand-solid text-on-solid">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:py-20">
          <div>
            <h2 id="titre-pratique" className="text-3xl sm:text-4xl">
              Passe à la pratique, sans argent réel
            </h2>
            <p className="mt-4 max-w-md opacity-75">
              {typographie(
                "Ce que tu apprends dans un chapitre, tu l'essaies aussitôt sur un marché rejoué, avec tes propres règles de risque. Ton journal mesure ensuite ce qui fonctionne, et ce qui reste à travailler.",
              )}
            </p>
            <Link href="/pratique/" className="btn btn-grand mt-7 bg-accent !text-[#17160f] hover:brightness-95">
              Essayer le compte d&apos;entraînement
            </Link>
          </div>
          <ol className="divide-y divide-current/15 border-y border-current/15">
            {pratique.map((p, i) => (
              <li key={p.titre} className="revele-gauche flex gap-5 py-5">
                <span className="font-mono text-sm opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-lg font-semibold">{p.titre}</span>
                  <span className="mt-1 block text-sm leading-relaxed opacity-75">{typographie(p.texte)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section aria-labelledby="titre-outils" className="pt-24">
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
            <div>
              <p className="surtitre">Indicateurs et robots</p>
              <h2 id="titre-outils" className="mt-2 text-3xl text-ink sm:text-4xl">
                Tes règles, sur ton graphique
              </h2>
            </div>
            <p className="text-ink-2 md:text-right">
              {typographie(
                "L'indicateur Méridien pour TradingView et le robot pour MetaTrader 5 reprennent des règles enseignées dans le cours. Ils sont offerts aux apprenants qui terminent la formation et réussissent ses évaluations.",
              )}
            </p>
          </div>
          <div className="mt-8">
            <ApercuOutils />
          </div>
          <p className="mt-5 text-sm">
            <Link href="/outils/" className="lien">
              Explorer les outils
            </Link>
          </p>
        </section>

        <section aria-labelledby="titre-engagements" className="grid gap-8 pt-24 md:grid-cols-[1fr_1.4fr]">
          <h2 id="titre-engagements" className="text-3xl text-ink sm:text-4xl">
            Ce qui guide Méridien
          </h2>
          <div>
            <ul className="divide-y divide-line border-y border-line">
              {[
                ["Tu apprends à décider.", "Pas de signaux à copier : tu apprends à lire un graphique et à construire tes propres règles."],
                ["Ton compte reste le tien.", "Personne ne trade à ta place, et aucun outil ne demande ton mot de passe de trading."],
                [
                  "Le risque, appris en premier.",
                  "Le trading peut faire perdre de l'argent, et la plupart des débutants en perdent. La gestion du risque arrive donc dès le premier module, avant toute stratégie.",
                ],
              ].map(([titre, texte]) => (
                <li key={titre} className="py-4">
                  <span className="font-semibold text-ink">{titre}</span> <span className="text-ink-2">{typographie(texte)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/legal/risques/" className="lien">
                Avertissement sur les risques
              </Link>
            </p>
          </div>
        </section>

        <section id="contact" aria-labelledby="titre-contact" className="scroll-mt-20 pt-24">
          <h2 id="titre-contact" className="mb-6 text-3xl text-ink sm:text-4xl">
            Contact
          </h2>
          <Contact />
        </section>
      </div>
    </div>
  );
}

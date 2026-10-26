import Link from "next/link";
import { Visuel } from "@/components/figures/Figure";
import { BoutonReprendre } from "@/components/progression/Indicateurs";
import { academies, chapitre, estPublie, parcours, titresChapitres } from "@/content";
import { typographie } from "@/lib/typographie";

const etapesApprentissage = [
  ["Comprendre", "Un chapitre court, une capsule animée, un cours détaillé."],
  ["Observer", "Des figures annotées et des exemples chiffrés."],
  ["Pratiquer", "Des calculateurs pour manipuler risque, pips et levier."],
  ["Évaluer", "Un quiz corrigé à chaque chapitre, noté par concept."],
  ["Corriger", "Des recommandations qui expliquent quoi revoir et pourquoi."],
];

const principes = [
  {
    titre: "Aucune promesse de gains",
    texte: "Pas de signaux, pas de « méthode infaillible ». La plupart des particuliers perdent de l'argent en trading : on commence par là.",
  },
  {
    titre: "Chaque affirmation a son badge",
    texte: "Fait établi, calcul, convention, interprétation d'école ou hypothèse à tester : tu sais toujours ce qui est prouvé, et ce qui ne l'est pas.",
  },
  {
    titre: "Des chiffres vérifiés",
    texte: "Les calculs des cours et des quiz sont recalculés par des tests automatiques à chaque mise à jour du site.",
  },
  {
    titre: "Gratuit, sans compte, hors ligne",
    texte: "Ta progression reste dans ton navigateur. Les chapitres consultés restent lisibles sans connexion.",
  },
];

export default function Accueil() {
  const titres = Object.fromEntries(titresChapitres);
  const totalChapitres = academies.flatMap((a) => a.modules.flatMap((m) => m.chapitres)).length;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-brand/40 bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            Académie de trading gratuite
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Apprendre à lire les marchés avec méthode.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
            {typographie(
              "Sans argent réel, sans promesse de gains. Des chapitres courts, des capsules animées, des quiz corrigés et des calculateurs pour comprendre — et maîtriser — ton risque.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BoutonReprendre parcours={parcours} titres={titres} />
            <Link href="/parcours/premiers-pas/" className="rounded-xl border border-line-strong px-5 py-3.5 font-medium text-ink hover:border-ink-3">
              Voir le parcours
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-3">Aucune inscription. Ta progression reste dans ce navigateur.</p>
        </div>
        <figure className="rounded-2xl border border-line bg-surface p-3 shadow-2xl shadow-black/40 sm:p-4">
          <Visuel scene="sl-tp-achat" />
          <figcaption className="mt-3 px-1 text-sm text-ink-2">
            {typographie(
              "Un plan de trade : entrée à 50 €, stop loss à 47,80 €, objectif à 54,40 €. Le risque est décidé avant d'entrer. Données synthétiques.",
            )}
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="titre-methode" className="py-10">
        <h2 id="titre-methode" className="text-2xl font-semibold tracking-tight text-ink">
          Comprendre, pratiquer, être évalué, corriger
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {etapesApprentissage.map(([titre, texte], i) => (
            <li key={titre} className="rounded-xl border border-line bg-surface p-4">
              <span className="font-mono text-sm text-brand">0{i + 1}</span>
              <p className="mt-1 font-semibold text-ink">{titre}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{typographie(texte)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titre-parcours" className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="titre-parcours" className="text-2xl font-semibold tracking-tight text-ink">
              Le parcours « Premiers pas »
            </h2>
            <p className="mt-1 text-ink-2">{typographie(`${parcours.length} chapitres pour partir de zéro : marchés, graphiques, ordres, coûts, levier et risque.`)}</p>
          </div>
          <Link href="/parcours/premiers-pas/" className="text-sm font-medium text-brand hover:underline">
            Tout le parcours
          </Link>
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {parcours.map((slug, i) => {
            const c = chapitre(slug)!;
            return (
              <li key={slug}>
                <Link href={`/chapitre/${slug}/`} className="flex h-full gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand/60">
                  <span className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-medium leading-snug text-ink">{typographie(c.titre)}</span>
                    <span className="mt-1 block text-sm text-ink-3">{c.dureeMin} min · quiz de {c.quiz.length} questions</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="titre-principes" className="py-10">
        <h2 id="titre-principes" className="text-2xl font-semibold tracking-tight text-ink">
          Ce qui guide Méridien
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {principes.map((p) => (
            <div key={p.titre} className="rounded-xl border border-line bg-surface p-5">
              <p className="font-semibold text-ink">{typographie(p.titre)}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{typographie(p.texte)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Link href="/methode/" className="text-brand hover:underline">
            La méthode et les badges de fiabilité en détail
          </Link>
        </p>
      </section>

      <section aria-labelledby="titre-academies" className="py-10">
        <h2 id="titre-academies" className="text-2xl font-semibold tracking-tight text-ink">
          Les académies
        </h2>
        <p className="mt-1 text-ink-2">
          {typographie(
            `${totalChapitres} chapitres sont prévus. Ils sont publiés au fil de leur rédaction et de leur vérification ; les autres sont annoncés comme tels.`,
          )}
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {academies.map((a) => {
            const chapitres = a.modules.flatMap((m) => m.chapitres);
            const publies = chapitres.filter((c) => estPublie(c.slug)).length;
            return (
              <li key={a.slug}>
                <Link href={`/academies/${a.slug}/`} className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand/60">
                  <span className="font-mono text-xs text-ink-3">{a.code}</span>
                  <span className="mt-1 font-semibold text-ink">{typographie(a.titre)}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{typographie(a.description)}</span>
                  <span className={`mt-4 text-xs font-medium ${publies ? "text-ok" : "text-ink-3"}`}>
                    {publies ? `${publies} chapitre${publies > 1 ? "s" : ""} disponible${publies > 1 ? "s" : ""} sur ${chapitres.length}` : `${chapitres.length} chapitres en préparation`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

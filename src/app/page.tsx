import Link from "next/link";
import { BougieVivante } from "@/components/accueil/BougieVivante";
import { ChampMarche } from "@/components/accueil/ChampMarche";
import { CarteEnsemble } from "@/components/catalogue/CarteEnsemble";
import { CarteParcours } from "@/components/catalogue/Parcours";
import { Contact } from "@/components/accueil/Contact";
import { CarteModule } from "@/components/offre/Offre";
import { modulesPresentes } from "@/content/presentation";
import { BoutonReprendre } from "@/components/progression/Indicateurs";
import { IconeBouclier, IconeBoussole, IconeCible, IconeEclair, IconeGraphique, IconeLivre, IconeOeil, IconeOutils } from "@/components/ui/Icones";
import { academies, fiche, parcours, titresChapitres } from "@/content";
import { motifsAcademies, teintesAcademies } from "@/content/identite";
import { typographie } from "@/lib/typographie";

const etapesApprentissage = [
  { titre: "Comprendre", texte: "Une capsule narrée de 90 secondes au plus, puis un cours qui se dévoile notion par notion.", Icone: IconeLivre },
  { titre: "Observer", texte: "Des graphiques qu'on explore du doigt : chaque bougie se lit, chaque zone s'explique.", Icone: IconeOeil },
  { titre: "Pratiquer", texte: "Des calculateurs pour manipuler risque, pips et levier sur tes propres chiffres.", Icone: IconeOutils },
  { titre: "Évaluer", texte: "Un quiz corrigé à chaque chapitre, noté concept par concept.", Icone: IconeCible },
  { titre: "Corriger", texte: "Des recommandations qui disent quoi revoir, et pourquoi.", Icone: IconeBoussole },
];

const principes = [
  {
    titre: "Aucune promesse de gains",
    texte: "Pas de signaux, pas de « méthode infaillible ». La plupart des particuliers perdent de l'argent en trading : on commence par là.",
    Icone: IconeBouclier,
  },
  {
    titre: "Chaque affirmation a son badge",
    texte: "Fait établi, calcul, convention, interprétation d'école ou hypothèse à tester : tu sais toujours ce qui est prouvé, et ce qui ne l'est pas.",
    Icone: IconeGraphique,
  },
  {
    titre: "Des chiffres vérifiés",
    texte: "Les calculs des cours et des quiz sont recalculés par des tests automatiques à chaque mise à jour du site.",
    Icone: IconeCible,
  },
  {
    titre: "Gratuit, sans compte, léger",
    texte: "Ta progression reste dans ton navigateur. Le site est pensé pour les téléphones modestes et les connexions irrégulières.",
    Icone: IconeEclair,
  },
];

export default function Accueil() {
  const titres = Object.fromEntries(titresChapitres);
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        {/* Le champ forme un horizon sous le texte et la démonstration, fondu vers le haut et sur les côtés. */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[46%] opacity-80 [mask-image:linear-gradient(to_top,#000_35%,transparent)] lg:h-[38%]">
          <ChampMarche />
        </div>
        <div className="grille-ciel pointer-events-none absolute inset-0 -z-20 opacity-60" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-2 lg:pb-44 lg:pt-16">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-sm font-medium text-cyan">
              <span className="size-1.5 rounded-full bg-cyan" aria-hidden="true" /> Académie de trading gratuite
            </p>
            <h1 className="text-[2.6rem] font-semibold leading-[1.04] text-ink sm:text-6xl lg:text-[3.4rem] xl:text-6xl">
              Apprendre à lire les marchés <span className="accent">avec méthode.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              {typographie(
                "Sans argent réel, sans promesse de gains. Des capsules narrées, des graphiques à explorer, des quiz corrigés et des calculateurs pour comprendre — et maîtriser — ton risque.",
              )}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <BoutonReprendre parcours={parcours} titres={titres} />
              <Link href="/academies/" className="btn btn-secondaire btn-grand">
                Explorer les cours
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-3">Aucune inscription. Ta progression reste dans ce navigateur.</p>
          </div>
          <div className="lg:pl-6">
            <BougieVivante />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section aria-labelledby="titre-parcours" className="revele py-10">
          <h2 id="titre-parcours" className="sr-only">
            Le parcours « Premiers pas »
          </h2>
          <CarteParcours
            fiches={parcours.map((s) => fiche(s)!)}
            titre="Premiers pas"
            description={`${parcours.length} chapitres pour partir de zéro : marchés, graphiques, ordres, coûts, levier et risque.`}
          />
        </section>

        <section aria-labelledby="titre-methode" className="hors-ecran py-12">
          <p className="text-sm font-medium text-cyan">La méthode</p>
          <h2 id="titre-methode" className="mt-1 max-w-2xl text-3xl font-semibold text-ink">
            Comprendre, observer, pratiquer, <span className="accent">être évalué, corriger</span>
          </h2>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {etapesApprentissage.map(({ titre, texte, Icone }, i) => (
              <li key={titre} className="revele carte p-5" style={{ ["--i" as string]: i }}>
                <span className="flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-brand-soft text-brand">
                  <Icone className="size-5" />
                </span>
                <p className="mt-4 font-mono text-xs text-ink-3">0{i + 1}</p>
                <p className="mt-1 font-semibold text-ink">{titre}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{typographie(texte)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titre-academies" className="hors-ecran py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan">Le catalogue</p>
              <h2 id="titre-academies" className="mt-1 text-3xl font-semibold text-ink">
                Les académies
              </h2>
            </div>
            <Link href="/academies/" className="btn btn-discret">
              Tout explorer
            </Link>
          </div>
          <ul className="rangee -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {academies.map((a, i) => {
              const chapitres = a.modules.flatMap((m) => m.chapitres.map((c) => c.slug));
              return (
                <li key={a.slug} className="revele w-[82%] shrink-0 sm:w-auto" style={{ ["--i" as string]: i }}>
                  <CarteEnsemble
                    href={`/academies/${a.slug}/`}
                    surtitre={`${a.code} · ${a.niveau}`}
                    titre={a.titre}
                    description={a.description}
                    motif={motifsAcademies[a.slug]}
                    teinte={teintesAcademies[a.slug]}
                    publies={chapitres.filter((s) => fiche(s)?.publie)}
                    total={chapitres.length}
                    details={[`${chapitres.length} chapitres`]}
                    ecole={a.ecole}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="titre-formations" className="hors-ecran py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan">Les formations</p>
              <h2 id="titre-formations" className="mt-1 text-3xl font-semibold text-ink">
                Commence gratuitement, <span className="accent">avance à ton rythme</span>
              </h2>
              <p className="mt-2 max-w-2xl text-ink-2">{typographie("« Premiers pas » est gratuit. Les modules suivants se débloquent un par un, par Orange Money ou MTN MoMo.")}</p>
            </div>
            <Link href="/formations/" className="btn btn-discret">
              Toutes les formations
            </Link>
          </div>
          <ul className="rangee -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {modulesPresentes.slice(0, 3).map((m, i) => (
              <li key={m.id} className="revele w-[82%] shrink-0 sm:w-auto" style={{ ["--i" as string]: i }}>
                <CarteModule m={m} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titre-outils-inclus" className="hors-ecran py-12">
          <div className="carte relative overflow-hidden p-6 sm:p-10">
            <div className="grille-ciel pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="text-sm font-medium text-cyan">Outils MetaTrader 5</p>
              <h2 id="titre-outils-inclus" className="mt-1 text-3xl font-semibold text-ink">
                Votre formation terminée, accédez à nos outils de trading inclus.
              </h2>
              <p className="mt-3 text-ink-2">
                {typographie(
                  "Un indicateur et un Expert Advisor pour MetaTrader 5, remis aux apprenants qui ont terminé le parcours requis et réussi ses évaluations. Ils aident à appliquer la méthode enseignée : ils ne garantissent aucun résultat, se testent d'abord sur un compte de démonstration, et le risque de perte reste entier.",
                )}
              </p>
              <ol className="mt-5 grid gap-2 text-sm text-ink-2 sm:grid-cols-3">
                <li className="rounded-xl border border-line bg-surface/60 p-3">
                  <span className="font-mono text-xs text-ink-3">01</span>
                  <span className="block text-ink">Crée ton compte</span>
                </li>
                <li className="rounded-xl border border-line bg-surface/60 p-3">
                  <span className="font-mono text-xs text-ink-3">02</span>
                  <span className="block text-ink">Termine le parcours et réussis les quiz</span>
                </li>
                <li className="rounded-xl border border-line bg-surface/60 p-3">
                  <span className="font-mono text-xs text-ink-3">03</span>
                  <span className="block text-ink">Demande l&apos;accès depuis ton espace</span>
                </li>
              </ol>
              <Link href="/compte/#outils" className="btn btn-primaire mt-6">
                Voir mes conditions d&apos;accès
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="titre-principes" className="hors-ecran py-12">
          <p className="text-sm font-medium text-cyan">Nos principes</p>
          <h2 id="titre-principes" className="mt-1 text-3xl font-semibold text-ink">
            Ce qui guide Méridien
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {principes.map(({ titre, texte, Icone }, i) => (
              <div key={titre} className="revele carte flex gap-4 p-5" style={{ ["--i" as string]: i }}>
                <Icone className="mt-0.5 size-6 shrink-0 text-cyan" />
                <div>
                  <p className="font-semibold text-ink">{typographie(titre)}</p>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">{typographie(texte)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm">
            <Link href="/methode/" className="text-brand underline underline-offset-4 hover:text-ink">
              La méthode et les badges de fiabilité en détail
            </Link>
          </p>
        </section>

        <section id="contact" aria-labelledby="titre-contact" className="hors-ecran scroll-mt-20 py-12">
          <p className="text-sm font-medium text-cyan">Contact</p>
          <h2 id="titre-contact" className="mb-6 mt-1 text-3xl font-semibold text-ink">
            Une question ? Écris-nous
          </h2>
          <Contact />
        </section>
      </div>
    </div>
  );
}

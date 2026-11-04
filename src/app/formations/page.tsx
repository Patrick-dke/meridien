import type { Metadata } from "next";
import Link from "next/link";
import { ProgrammeTarifs } from "@/components/offre/Programme";
import { modulesPresentes } from "@/content/presentation";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Formations et tarifs",
  description:
    "Huit modules de formation au trading, du premier graphique aux modèles avancés. Le premier est gratuit, en entier ; les suivants se débloquent un par un, en paiement unique.",
};

const conditions = [
  ["Paiement", "Unique, par module, en Orange Money ou MTN MoMo. Rien n'est prélevé ensuite."],
  ["Accès", "Sans limite de durée, sur ton compte Méridien, depuis n'importe quel appareil."],
  ["Ordre", "Les modules se suivent : chacun s'appuie sur les précédents. Tu peux les acheter dans l'ordre que tu veux."],
  [
    "Évaluation",
    "Un quiz par chapitre, un examen à trois niveaux à la fin de chaque module, un certificat interne quand tous les quiz du module sont réussis.",
  ],
  ["Outils", "L'indicateur et le robot Méridien sont offerts aux apprenants qui terminent la formation et réussissent ses évaluations."],
];

const etapes = [
  ["Essaie gratuitement", "Le premier module en entier, sans paiement : tu juges la méthode avant de t'engager."],
  ["Avance à ton rythme", "Débloque le module suivant quand tu te sens prêt. Paiement unique, rien n'est prélevé ensuite."],
  ["Valide tes acquis", "Un quiz à chaque chapitre, un examen à la fin du module, et une progression que tu suis d'un coup d'œil."],
];

export default function PageFormations() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
        <div>
          <p className="surtitre">Formations et tarifs</p>
          <h1 className="mt-2 text-4xl text-ink sm:text-5xl">Du premier graphique à ta propre méthode</h1>
        </div>
        <p className="text-ink-2">
          {typographie(
            "Huit modules qui s'enchaînent. Commence gratuitement avec Premiers pas ; quand tu es prêt, débloque le module suivant. Chaque module s'achète une fois et reste accessible sans limite de durée.",
          )}
        </p>
      </header>

      <ol className="mt-10 grid border-y border-line-strong sm:grid-cols-3">
        {etapes.map(([titre, texte], i) => (
          <li key={titre} className={`py-5 sm:px-5 ${i ? "border-t border-line sm:border-l sm:border-t-0" : "sm:pl-0"}`}>
            <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 font-semibold text-ink">{titre}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">{typographie(texte)}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <ProgrammeTarifs modules={modulesPresentes} ouvrirPremier />
      </div>

      <section aria-labelledby="titre-conditions" className="mt-16 grid gap-8 md:grid-cols-[1fr_2fr]">
        <h2 id="titre-conditions" className="text-2xl text-ink sm:text-3xl">
          Conditions d&apos;accès
        </h2>
        <div>
          <dl className="divide-y divide-line border-y border-line">
            {conditions.map(([terme, texte]) => (
              <div key={terme} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="font-semibold text-ink">{terme}</dt>
                <dd className="text-ink-2">{typographie(texte)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-ink-3">
            Une formation t&apos;apprend à analyser un marché et à gérer ton risque ; elle ne garantit pas de résultat sur les marchés, où des pertes restent
            possibles. Avant d&apos;acheter, lis les{" "}
            <Link href="/legal/conditions/" className="lien font-normal">
              conditions de vente
            </Link>{" "}
            et l&apos;
            <Link href="/legal/risques/" className="lien font-normal">
              avertissement sur les risques
            </Link>
            .
          </p>
          <p className="mt-6">
            <Link href="/academies/" className="btn btn-secondaire">
              Parcourir tous les chapitres
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BadgeFiabilite, fiabilites } from "@/components/ui/BadgeFiabilite";
import type { Fiabilite } from "@/content/schema";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Méthode et fiabilité",
  description: "Comment Méridien enseigne, comment les contenus sont vérifiés, et ce que signifient les badges de fiabilité.",
};

const exemples: Record<Fiabilite, string> = {
  fait: "Le spread est l'écart entre le prix vendeur et le prix acheteur.",
  calcul: "Risquer 1 % de 2 000 € avec un stop de 2 € par action donne 10 actions.",
  convention: "Un support est une zone où le prix a plusieurs fois rebondi.",
  ecole: "Selon l'approche ICT, le prix chercherait la liquidité au-dessus des sommets égaux.",
  hypothese: "Après une prise de liquidité suivie d'un MSS, un retour dans la FVG offrirait une entrée.",
  mesure: "Sur l'échantillon décrit dans le rapport, frais inclus, la méthode a obtenu tel résultat.",
};

function Section({ id, titre, children }: { id: string; titre: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`titre-${id}`} className="scroll-mt-20">
      <h2 id={`titre-${id}`} className="mb-4 text-2xl font-semibold tracking-tight text-ink">
        {titre}
      </h2>
      <div className="prose-cours text-ink-2">{children}</div>
    </section>
  );
}

export default function PageMethode() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm font-medium text-cyan">Nos règles</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
          Méthode et <span className="accent">fiabilité</span>
        </h1>
        <p className="mt-2 text-ink-2">
          {typographie("Comment Méridien enseigne, comment ses contenus sont vérifiés, et ce que tu peux attendre — ou non — de la plateforme.")}
        </p>
      </header>

      <Section id="pedagogie" titre="Comprendre, pratiquer, être évalué, corriger">
        <p>
          {typographie(
            "Chaque chapitre suit la même structure : introduction, capsule animée, cours détaillé, illustrations, exemple chiffré, erreurs fréquentes, résumé, quiz et validation. Un chapitre est validé quand le quiz atteint 80 % de bonnes réponses ; les tentatives sont illimitées.",
          )}
        </p>
        <p>
          {typographie(
            "Chaque question est rattachée à un ou plusieurs concepts. La maîtrise d'un concept est une moyenne de tes derniers résultats, les plus récents comptant davantage : « acquis » à partir de 80 % sur au moins deux questions, « à revoir » sous 60 %.",
          )}
        </p>
        <p>{typographie("Les recommandations du tableau de bord suivent des règles explicites, et chacune affiche sa raison :")}</p>
        <ul>
          <li>{typographie("une base fragile (un prérequis sous 60 %) est recommandée avant le concept qui en dépend ;")}</li>
          <li>{typographie("un concept sous 60 % renvoie au chapitre qui l'enseigne ;")}</li>
          <li>{typographie("un quiz sous 50 % invite à revoir la capsule et l'exemple ;")}</li>
          <li>{typographie("après sept jours d'absence, on reprend là où on s'était arrêté ;")}</li>
          <li>{typographie("sinon, la suite du parcours.")}</li>
        </ul>
      </Section>

      <Section id="fiabilite" titre="Les badges de fiabilité">
        <p>
          {typographie(
            "En trading, faits, conventions et croyances d'école se mélangent facilement. Chaque bloc de cours porte donc un badge qui dit ce qu'il est.",
          )}
        </p>
        <ul className="not-prose space-y-3">
          {(Object.keys(fiabilites) as Fiabilite[]).map((f) => (
            <li key={f} className="rounded-xl border border-line bg-surface p-4">
              <BadgeFiabilite fiabilite={f} />
              <p className="mt-2 text-[0.95rem] text-ink">{typographie(fiabilites[f].aide)}</p>
              <p className="mt-1 text-sm italic text-ink-3">{typographie(`Exemple : « ${exemples[f]} »`)}</p>
            </li>
          ))}
        </ul>
        <p>
          {typographie(
            "Aucune stratégie n'est présentée comme validée statistiquement : le badge « Résultat mesuré » n'apparaîtra qu'avec un rapport de test traçable (données, période, frais, méthode, nombre de trades).",
          )}
        </p>
      </Section>

      <Section id="verification" titre="Comment les contenus sont produits et vérifiés">
        <p>
          {typographie(
            "Les chapitres sont rédigés avec l'aide d'une intelligence artificielle (Claude, d'Anthropic), puis vérifiés selon un cycle « brouillon, en vérification, validé, publié ». Seuls les contenus publiés apparaissent sur le site.",
          )}
        </p>
        <ul>
          <li>{typographie("Tous les calculs des cours, des figures et des corrigés sont recalculés par des tests automatiques à chaque mise à jour.")}</li>
          <li>{typographie("Chaque terme cité, chaque concept et chaque figure est vérifié automatiquement (existence, cohérence des bougies, des corrigés, du rythme des capsules).")}</li>
          <li>{typographie("Les affirmations sont classées par badge ; les interprétations d'école sont rédigées au conditionnel.")}</li>
          <li>{typographie("Une relecture par un trader expérimenté est prévue pour les académies avancées.")}</li>
        </ul>
        <p>
          {typographie("Les graphiques utilisent des données synthétiques construites pour illustrer un mécanisme. Elles sont signalées comme telles et ne décrivent aucun marché réel.")}
        </p>
      </Section>

      <Section id="aujourdhui" titre="Ce qui existe aujourd'hui, et ce qui arrive">
        <p>{typographie("Disponible : le parcours « Premiers pas » (14 chapitres, capsules, quiz), le glossaire, les calculateurs, le tableau de bord, le mode hors ligne.")}</p>
        <p>{typographie("En préparation, dans cet ordre :")}</p>
        <ol>
          <li>{typographie("la voix off des capsules ;")}</li>
          <li>{typographie("les exercices sur graphique, les examens de module et la révision espacée ;")}</li>
          <li>{typographie("la suite de l'académie Fondamentaux (marchés, analyse technique, risque, psychologie, protection contre les arnaques) ;")}</li>
          <li>{typographie("les académies Price Action, SMC, Liquidité et ICT, puis les fiches de stratégie, le Strategy Lab et le simulateur ;")}</li>
          <li>{typographie("des comptes facultatifs pour synchroniser sa progression entre appareils.")}</li>
        </ol>
        <p>
          <Link href="/legal/risques/">{typographie("Lire l'avertissement complet sur les risques")}</Link>
        </p>
      </Section>
    </div>
  );
}

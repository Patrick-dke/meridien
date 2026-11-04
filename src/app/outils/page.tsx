import type { Metadata } from "next";
import Link from "next/link";
import { Vitrine } from "@/components/outils/Vitrine";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Indicateurs et robots",
  description:
    "L'indicateur Méridien pour TradingView et l'Expert Advisor Méridien pour MetaTrader 5 : fonctionnalités, conditions d'utilisation et d'accès, licence liée à tes comptes, sans jamais demander ton mot de passe.",
};

const etapesTradingView = [
  ["Ta demande", "Tu indiques ton identifiant TradingView, celui de l'adresse de ton profil."],
  [
    "L'ouverture",
    "Méridien ajoute cet identifiant à la liste d'accès du script privé, sur TradingView, à la main : TradingView ne propose pas d'automatisation officielle.",
  ],
  ["Sur ton graphique", "Le script apparaît dans Indicateurs, onglet « Scripts sur invitation », sur le site comme sur l'application."],
  ["La durée", "L'accès peut avoir une date de fin ; il se retire si les conditions de la licence ne sont plus remplies."],
];

const comparaison: [string, string, string][] = [
  ["Qui installe", "Toi, avec le guide pas à pas", "Toi, guidé en direct pendant une session"],
  ["Ce que tu reçois", "Le fichier compilé (.ex5) et ta clé de licence", "La même chose, plus un rendez-vous"],
  ["Accès à ton ordinateur", "Aucun", "Ponctuel : une session que tu lances et fermes toi-même, avec ton accord écrit"],
  ["Mot de passe de trading", "Jamais demandé", "Jamais demandé : tu le tapes toi-même si MetaTrader le réclame"],
  ["Comptes autorisés", "Enregistrés au premier lancement, dans la limite de ta licence", "Ceux indiqués dans ta demande"],
  ["Pour qui", "À l'aise avec MetaTrader 5", "Première installation d'un robot"],
];

const engagements = [
  ["Aucun mot de passe", "Ni mot de passe principal, ni mot de passe investisseur : la licence n'utilise que ton numéro de compte et le nom du serveur."],
  ["Aucun accès permanent", "Pas de prise en main à distance durable. Une assistance, si tu la demandes, se limite à l'installation."],
  [
    "Le logiciel, pas ton compte",
    "La licence autorise le robot à fonctionner ; elle ne donne à Méridien aucun pouvoir sur ton compte, tes ordres ou tes fonds.",
  ],
  ["Toujours réversible", "Tu retires le robot de ton graphique quand tu veux ; Méridien peut suspendre une licence, jamais toucher à tes positions."],
];

export default function PageOutils() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="grid gap-4 pb-10 md:grid-cols-[1fr_1.3fr] md:items-end">
        <div>
          <p className="surtitre">Outils</p>
          <h1 className="mt-2 text-4xl text-ink sm:text-5xl">Indicateurs et robots</h1>
        </div>
        <div className="space-y-3 text-ink-2">
          <p>
            {typographie(
              "L'indicateur et le robot Méridien reprennent, sur TradingView et MetaTrader 5, des règles enseignées dans la formation. Tu gardes la main : c'est toi qui choisis les marchés, les réglages et le risque.",
            )}
          </p>
          <p className="text-sm">
            Offerts aux apprenants qui terminent la formation et réussissent ses évaluations.{" "}
            <Link href="/formations/" className="lien">
              Découvrir les formations
            </Link>
          </p>
        </div>
      </header>

      <Vitrine />

      <section aria-labelledby="titre-tradingview" className="grid gap-8 pt-20 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="surtitre">TradingView</p>
          <h2 id="titre-tradingview" className="mt-2 text-3xl text-ink">
            Un script privé, ouvert à ton identifiant
          </h2>
          <p className="mt-3 text-ink-2">
            {typographie(
              "L'indicateur est publié sur TradingView en accès sur invitation, selon les règles de publication de TradingView. Son code reste privé.",
            )}
          </p>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {etapesTradingView.map(([titre, texte], i) => (
            <li key={titre} className="revele bg-bg p-5">
              <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-semibold text-ink">{titre}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{typographie(texte)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titre-licence" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="surtitre">MetaTrader 5</p>
            <h2 id="titre-licence" className="mt-2 text-3xl text-ink">
              Une licence liée à tes comptes
            </h2>
            <p className="mt-3 text-ink-2">
              {typographie(
                "Au démarrage, puis régulièrement, le robot vérifie sa licence : il envoie ta clé, ton numéro de compte et le nom du serveur. Le serveur de Méridien renvoie une réponse signée, que le robot contrôle.",
              )}
            </p>
          </div>
          <figure className="revele m-0 rounded-lg border border-line bg-chart p-4 sm:p-6">
            <svg viewBox="0 0 560 190" className="block w-full" role="img" aria-labelledby="schema-licence">
              <title id="schema-licence">
                Le robot, dans MetaTrader 5, envoie la clé, le numéro de compte et le serveur au serveur de Méridien, qui renvoie une réponse signée : autorisé
                ou non. Aucun mot de passe ne circule.
              </title>
              <g className="font-mono" fontSize="11">
                <rect x="1" y="40" width="170" height="96" rx="6" fill="var(--surface)" stroke="var(--line-strong)" />
                <text x="16" y="64" fill="var(--ink)" fontWeight="600">
                  MetaTrader 5
                </text>
                <text x="16" y="84" fill="var(--ink-2)">
                  Robot Méridien
                </text>
                <text x="16" y="104" fill="var(--ink-3)">
                  sur ton compte
                </text>
                <text x="16" y="122" fill="var(--ink-3)">
                  et ton ordinateur
                </text>
                <rect x="389" y="40" width="170" height="96" rx="6" fill="var(--brand-solid)" />
                <text x="404" y="64" fill="var(--on-solid)" fontWeight="600">
                  Serveur Méridien
                </text>
                <text x="404" y="84" fill="var(--on-solid)" opacity="0.75">
                  licence active ?
                </text>
                <text x="404" y="102" fill="var(--on-solid)" opacity="0.75">
                  compte autorisé ?
                </text>
                <text x="404" y="120" fill="var(--on-solid)" opacity="0.75">
                  date de fin ?
                </text>
                <line
                  x1="180"
                  y1="70"
                  x2="380"
                  y2="70"
                  stroke="var(--ink)"
                  strokeWidth="1.4"
                  className="trace-defile"
                  style={{ ["--longueur" as string]: 200 }}
                />
                <path d="M380 70 l-8 -4 v8 z" fill="var(--ink)" />
                <text x="190" y="60" fill="var(--ink-2)" fontSize="10">
                  clé · n° de compte · serveur
                </text>
                <line
                  x1="380"
                  y1="108"
                  x2="180"
                  y2="108"
                  stroke="var(--jauge)"
                  strokeWidth="1.4"
                  className="trace-defile"
                  style={{ ["--longueur" as string]: 200 }}
                />
                <path d="M180 108 l8 -4 v8 z" fill="var(--jauge)" />
                <text x="190" y="126" fill="var(--ink-2)" fontSize="10">
                  oui / non + signature
                </text>
                <text x="280" y="176" textAnchor="middle" fill="var(--bad)" fontSize="10.5">
                  jamais transmis : mot de passe, mot de passe investisseur, fonds
                </text>
              </g>
            </svg>
          </figure>
        </div>
      </section>

      <section aria-labelledby="titre-installation" className="pt-20">
        <h2 id="titre-installation" className="text-3xl text-ink">
          Deux façons d&apos;installer le robot
        </h2>
        <p className="mt-2 max-w-2xl text-ink-2">
          {typographie("Tu choisis dans ta demande. Dans les deux cas, ton compte et tes réglages restent entre tes mains.")}
        </p>
        <div className="mt-8 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="titre-installation">
          <table className="w-full min-w-[40rem] border-y border-line-strong text-left text-[0.95rem]">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-[24%] py-3 pr-4 font-normal text-ink-3">
                  <span className="sr-only">Critère</span>
                </th>
                <th scope="col" className="py-3 pr-4">
                  <span className="surtitre">Option B</span>
                  <span className="mt-0.5 block text-lg font-semibold text-ink">Autonome</span>
                </th>
                <th scope="col" className="py-3">
                  <span className="surtitre">Option A</span>
                  <span className="mt-0.5 block text-lg font-semibold text-ink">Accompagnée</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {comparaison.map(([critere, b, a]) => (
                <tr key={critere}>
                  <th scope="row" className="py-3 pr-4 align-top text-sm font-medium text-ink-3">
                    {critere}
                  </th>
                  <td className="py-3 pr-4 align-top text-ink">{typographie(b)}</td>
                  <td className="py-3 align-top text-ink">{typographie(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-3">
          L&apos;installation autonome demande d&apos;autoriser l&apos;adresse de vérification dans MetaTrader 5 (Outils, Options, Expert Advisors, « Autoriser
          WebRequest ») : le guide fourni avec le fichier l&apos;indique.
        </p>
      </section>

      <section aria-labelledby="titre-engagements-outils" className="grid gap-8 pt-20 md:grid-cols-[1fr_1.6fr]">
        <h2 id="titre-engagements-outils" className="text-3xl text-ink">
          Ce que la licence ne fait jamais
        </h2>
        <dl className="divide-y divide-line border-y border-line">
          {engagements.map(([titre, texte]) => (
            <div key={titre} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <dt className="font-semibold text-ink">{titre}</dt>
              <dd className="text-ink-2">{typographie(texte)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-16 max-w-3xl text-sm leading-relaxed text-ink-3">
        Les indicateurs et robots sont des outils d&apos;aide à la décision et à l&apos;exécution de règles que tu choisis. Ils ne constituent pas un conseil en
        investissement et ne garantissent aucun rendement ; des résultats passés ne préjugent pas des résultats futurs. Teste d&apos;abord sur un compte de
        démonstration. Le trading comporte un risque élevé de perte en capital.{" "}
        <Link href="/legal/risques/" className="lien font-normal">
          Avertissement sur les risques
        </Link>
      </p>
    </div>
  );
}

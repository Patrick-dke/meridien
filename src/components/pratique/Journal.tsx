"use client";

import { useMemo, useState } from "react";
import { CODES_DEVISES, formaterMontant, type Devise } from "@/lib/trading/devises";
import { rEntree, statistiques, versCsv, type EntreeJournal } from "@/lib/trading/journal";
import { useJournal } from "@/lib/trading/stockage";
import { Champ, Choix, lireNombre, nombre } from "./Calculateurs";

const EMOTIONS: { valeur: NonNullable<EntreeJournal["emotion"]>; libelle: string }[] = [
  { valeur: "calme", libelle: "Calme" },
  { valeur: "hesitant", libelle: "Hésitant" },
  { valeur: "impatient", libelle: "Impatient" },
  { valeur: "frustre", libelle: "Frustré" },
  { valeur: "euphorique", libelle: "Euphorique" },
];

/** En dessous, les statistiques décrivent surtout le hasard : on le dit à côté des chiffres. */
const ECHANTILLON_MINIMAL = 30;

const aujourdhui = () => new Date().toISOString().slice(0, 10);

function Saisie({ deviseParDefaut, onAjout }: { deviseParDefaut: Devise; onAjout: (e: EntreeJournal) => void }) {
  const [date, setDate] = useState(aujourdhui);
  const [symbole, setSymbole] = useState("");
  const [sens, setSens] = useState<"achat" | "vente">("achat");
  const [entree, setEntree] = useState("");
  const [stop, setStop] = useState("");
  const [sortie, setSortie] = useState("");
  const [resultat, setResultat] = useState("");
  const [devise, setDevise] = useState<Devise>(deviseParDefaut);
  const [emotion, setEmotion] = useState<EntreeJournal["emotion"]>();
  const [respectPlan, setRespectPlan] = useState<boolean | undefined>();
  const [notes, setNotes] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        const e = lireNombre(entree);
        const s = lireNombre(sortie);
        const r = lireNombre(resultat);
        const sl = stop.trim() ? lireNombre(stop) : undefined;
        if (!symbole.trim()) return setErreur("Indique l'instrument (par exemple EUR/USD).");
        if ([e, s, r].some(Number.isNaN) || (sl !== undefined && Number.isNaN(sl)))
          return setErreur("Prix d'entrée, de sortie et résultat : des nombres (la virgule est acceptée).");
        const ligne = { sens, entree: e, sortie: s, stop: sl };
        onAjout({
          id: crypto.randomUUID().slice(0, 12),
          date: new Date(`${date}T12:00:00`).toISOString(),
          symbole: symbole.trim().toUpperCase(),
          ...ligne,
          resultat: r,
          devise,
          r: rEntree(ligne),
          emotion,
          respectPlan,
          notes: notes.trim() || undefined,
          source: "manuel",
        });
        setErreur(null);
        setEntree("");
        setStop("");
        setSortie("");
        setResultat("");
        setNotes("");
        setEmotion(undefined);
        setRespectPlan(undefined);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="journal-date" className="block text-sm font-medium text-ink-2">
            Date
          </label>
          <input id="journal-date" type="date" value={date} max={aujourdhui()} onChange={(e) => setDate(e.target.value)} className="champ mt-1 !min-h-11" />
        </div>
        <div>
          <label htmlFor="journal-symbole" className="block text-sm font-medium text-ink-2">
            Instrument
          </label>
          <input
            id="journal-symbole"
            value={symbole}
            onChange={(e) => setSymbole(e.target.value)}
            placeholder="EUR/USD"
            autoComplete="off"
            className="champ mt-1 !min-h-11 font-mono uppercase"
          />
        </div>
        <Choix
          label="Sens"
          valeur={sens}
          onChange={setSens}
          options={[
            { valeur: "achat", libelle: "Achat" },
            { valeur: "vente", libelle: "Vente" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Champ label="Entrée" valeur={entree} onChange={setEntree} />
        <Champ label="Stop initial" valeur={stop} onChange={setStop} aide="Sert au calcul en R." />
        <Champ label="Sortie" valeur={sortie} onChange={setSortie} />
        <div>
          <Champ label="Résultat net" valeur={resultat} onChange={setResultat} aide="Frais déduits, signe − si perte." />
          <label htmlFor="journal-devise" className="sr-only">
            Devise du résultat
          </label>
          <select id="journal-devise" value={devise} onChange={(e) => setDevise(e.target.value as Devise)} className="champ mt-1.5 !min-h-9 !py-1 text-sm">
            {CODES_DEVISES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="journal-emotion" className="block text-sm font-medium text-ink-2">
            État d&apos;esprit à l&apos;entrée
          </label>
          <select
            id="journal-emotion"
            value={emotion ?? ""}
            onChange={(e) => setEmotion((e.target.value || undefined) as EntreeJournal["emotion"])}
            className="champ mt-1 !min-h-11"
          >
            <option value="">Non renseigné</option>
            {EMOTIONS.map((o) => (
              <option key={o.valeur} value={o.valeur}>
                {o.libelle}
              </option>
            ))}
          </select>
        </div>
        <Choix
          label="Plan respecté ?"
          valeur={respectPlan === undefined ? "nr" : respectPlan ? "oui" : "non"}
          onChange={(v) => setRespectPlan(v === "nr" ? undefined : v === "oui")}
          options={[
            { valeur: "oui", libelle: "Oui" },
            { valeur: "non", libelle: "Non" },
            { valeur: "nr", libelle: "Je ne sais pas" },
          ]}
        />
      </div>
      <div>
        <label htmlFor="journal-notes" className="block text-sm font-medium text-ink-2">
          Notes
        </label>
        <textarea
          id="journal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="champ mt-1"
          placeholder="Pourquoi cette entrée, ce qui s'est passé, ce que tu referais."
        />
      </div>
      {erreur ? (
        <p role="alert" className="text-sm text-bad">
          {erreur}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primaire">
        Ajouter au journal
      </button>
    </form>
  );
}

/** Courbe du résultat cumulé, trade après trade, avec la ligne du zéro. */
function Courbe({ points, devise }: { points: number[]; devise: Devise }) {
  const L = 600;
  const H = 140;
  const min = Math.min(0, ...points);
  const max = Math.max(0, ...points);
  const etendue = max - min || 1;
  const x = (i: number) => (points.length < 2 ? L / 2 : (i / (points.length - 1)) * L);
  const y = (v: number) => 8 + (1 - (v - min) / etendue) * (H - 16);
  const trace = points.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const dernier = points[points.length - 1];
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${L} ${H}`}
        preserveAspectRatio="none"
        className="block h-36 w-full"
        role="img"
        aria-label={`Résultat cumulé sur ${points.length - 1} trades : ${formaterMontant(dernier, devise, { signe: true })}`}
      >
        <rect width={L} height={H} fill="var(--chart)" />
        <line x1="0" x2={L} y1={y(0)} y2={y(0)} stroke="var(--line-strong)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <polyline points={trace} fill="none" stroke="var(--ink)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <circle cx={x(points.length - 1)} cy={y(dernier)} r="3.5" fill={dernier >= 0 ? "var(--bull)" : "var(--bear)"} />
      </svg>
      <figcaption className="mt-1 flex justify-between font-mono text-xs text-ink-3">
        <span>Trade 1</span>
        <span>Trade {points.length - 1}</span>
      </figcaption>
    </figure>
  );
}

function telecharger(trades: EntreeJournal[]) {
  const blob = new Blob(["﻿" + versCsv(trades)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `journal-meridien-${aujourdhui()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Journal de trading, gardé sur l'appareil : saisie manuelle ou trades fermés du compte d'entraînement,
 * statistiques par devise (on n'additionne jamais des FCFA et des dollars), export CSV.
 */
export function Journal() {
  const [trades, setTrades] = useJournal();
  const devises = useMemo(() => {
    const n = new Map<Devise, number>();
    trades.forEach((t) => n.set(t.devise, (n.get(t.devise) ?? 0) + 1));
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([d]) => d);
  }, [trades]);
  const [choix, setChoix] = useState<Devise | null>(null);
  const devise = choix && devises.includes(choix) ? choix : (devises[0] ?? "XAF");
  const filtres = useMemo(() => trades.filter((t) => t.devise === devise), [trades, devise]);
  const stats = useMemo(() => statistiques(filtres), [filtres]);
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const recents = [...filtres].sort((a, b) => b.date.localeCompare(a.date));
  const m = (v: number, signe = false) => formaterMontant(v, devise, { signe });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primaire" aria-expanded={saisieOuverte} onClick={() => setSaisieOuverte((o) => !o)}>
          {saisieOuverte ? "Fermer la saisie" : "Noter un trade"}
        </button>
        {trades.length ? (
          <button type="button" className="btn btn-secondaire" onClick={() => telecharger(trades)}>
            Exporter en CSV
          </button>
        ) : null}
        {devises.length > 1 ? (
          <div className="ml-auto flex items-center gap-2 text-sm text-ink-2">
            <label htmlFor="journal-filtre">Devise</label>
            <select id="journal-filtre" value={devise} onChange={(e) => setChoix(e.target.value as Devise)} className="champ !min-h-9 !w-auto !py-1">
              {devises.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {saisieOuverte ? (
        <div className="carte apparition p-4 sm:p-5">
          <Saisie
            deviseParDefaut={devise}
            onAjout={(e) => {
              setTrades([...trades, e]);
              setChoix(e.devise);
            }}
          />
        </div>
      ) : null}

      {!stats ? (
        <div className="border-y border-line py-8 text-ink-2">
          <p className="font-semibold text-ink">Ton journal est vide.</p>
          <p className="mt-1 max-w-xl text-sm">
            Note chaque trade, réel ou d&apos;entraînement : instrument, entrée, stop, sortie, résultat et ce que tu ressentais. Les positions fermées sur le
            compte d&apos;entraînement s&apos;ajoutent toutes seules.
          </p>
        </div>
      ) : (
        <>
          <section aria-label={`Statistiques en ${devise}`}>
            <dl className="grid grid-cols-2 border-y border-line-strong sm:grid-cols-4">
              {(
                [
                  ["Trades", String(stats.nombre)],
                  ["Taux de réussite", `${nombre(stats.tauxReussite * 100, 0)} %`],
                  ["Espérance par trade", m(stats.esperance, true)],
                  ["Facteur de profit", stats.facteurProfit === null ? "—" : nombre(stats.facteurProfit, 2)],
                  ["Gain moyen", m(stats.gainMoyen)],
                  ["Perte moyenne", m(stats.perteMoyenne)],
                  ["Baisse maximale", m(stats.drawdownMax)],
                  ["Pire série de pertes", String(stats.pireSerie)],
                ] as const
              ).map(([k, v], i) => (
                <div
                  key={k}
                  className={`py-3 ${i % 2 ? "pl-4" : ""} sm:pl-4 ${i % 4 ? "sm:border-l sm:border-line" : "sm:pl-0"} ${i > 1 ? "border-t border-line" : ""} ${i > 3 ? "" : "sm:border-t-0"}`}
                >
                  <dt className="text-xs text-ink-3">{k}</dt>
                  <dd className="mt-0.5 font-mono text-base text-ink tabular">{v}</dd>
                </div>
              ))}
            </dl>
            {stats.esperanceR !== null ? (
              <p className="mt-2 text-sm text-ink-2">
                En multiples du risque : {nombre(stats.totalR ?? 0, 2)} R au total, {nombre(stats.esperanceR, 2)} R par trade en moyenne (trades avec stop).
              </p>
            ) : null}
            {stats.nombre < ECHANTILLON_MINIMAL ? (
              <p className="mt-2 text-sm text-warn">
                {stats.nombre} trade{stats.nombre > 1 ? "s" : ""} : trop peu pour juger une méthode. Ces chiffres changeront beaucoup d&apos;ici{" "}
                {ECHANTILLON_MINIMAL} trades.
              </p>
            ) : null}
            <div className="mt-6">
              <p className="surtitre mb-2">Résultat cumulé en {devise}</p>
              <Courbe points={stats.courbe} devise={devise} />
            </div>
          </section>

          <section aria-labelledby="titre-trades">
            <h3 id="titre-trades" className="text-lg font-semibold text-ink">
              Trades notés
            </h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {recents.map((t) => (
                <li key={t.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-3 text-sm sm:grid-cols-[6rem_1fr_auto_auto] sm:items-center">
                  <span className="font-mono text-xs text-ink-3">{new Date(t.date).toLocaleDateString("fr-FR")}</span>
                  <span className="col-span-2 min-w-0 sm:col-span-1">
                    <span className="font-mono text-ink">
                      {t.sens === "achat" ? "▲" : "▼"} {t.symbole}
                    </span>
                    <span className="ml-2 text-ink-3">
                      {nombre(t.entree, 5).replace(/0+$/, "").replace(/,$/, "")} → {nombre(t.sortie, 5).replace(/0+$/, "").replace(/,$/, "")}
                    </span>
                    {t.source === "simulateur" ? <span className="ml-2 text-xs text-ink-3">· entraînement</span> : null}
                    {t.respectPlan === false ? <span className="ml-2 text-xs text-warn">· plan non respecté</span> : null}
                    {t.notes ? <span className="mt-0.5 block truncate text-xs text-ink-3">{t.notes}</span> : null}
                  </span>
                  <span
                    className={`row-start-1 col-start-2 text-right font-mono tabular sm:row-auto sm:col-auto ${t.resultat > 0 ? "text-ok" : t.resultat < 0 ? "text-bad" : "text-ink"}`}
                  >
                    {formaterMontant(t.resultat, t.devise, { signe: true })}
                    {t.r !== null ? <span className="ml-1.5 text-xs text-ink-3">{nombre(t.r, 2)} R</span> : null}
                  </span>
                  <button
                    type="button"
                    className="justify-self-end text-xs text-ink-3 underline-offset-2 hover:text-bad hover:underline"
                    aria-label={`Supprimer le trade ${t.symbole} du ${new Date(t.date).toLocaleDateString("fr-FR")}`}
                    onClick={() => {
                      if (window.confirm("Supprimer ce trade du journal ?")) setTrades(trades.filter((x) => x.id !== t.id));
                    }}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-ink-3">
              Le journal reste sur cet appareil : exporte-le en CSV pour le garder ou l&apos;ouvrir dans un tableur. Statistiques calculées devise par devise,
              sans conversion.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

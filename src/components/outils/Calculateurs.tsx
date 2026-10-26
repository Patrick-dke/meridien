"use client";

import { useId, useState } from "react";
import {
  esperance,
  pipsEntre,
  probabiliteSerieDePertes,
  ratioRendementRisque,
  seuilRentabilite,
  seuilRentabiliteAvecFrais,
  taillePositionPrix,
  tailleLots,
  valeurPipParLot,
  type Sens,
} from "@/lib/trading/calculs";

/** Lit un nombre saisi à la française (virgule, espaces). Renvoie NaN si le champ est vide ou invalide. */
export function lireNombre(saisie: string) {
  const propre = saisie.replace(/[\s  ]/g, "").replace(",", ".");
  if (propre === "" || !/^-?\d*\.?\d+$/.test(propre)) return Number.NaN;
  return Number(propre);
}

const nombre = (v: number, decimales = 2) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(v);

function Champ({
  label,
  valeur,
  onChange,
  suffixe,
  aide,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  suffixe?: string;
  aide?: string;
}) {
  const id = useId();
  const invalide = valeur !== "" && Number.isNaN(lireNombre(valeur));
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-2">
        {label}
      </label>
      <div className="mt-1 flex items-center rounded-lg border border-line-strong bg-bg focus-within:border-brand">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalide}
          aria-describedby={aide ? `${id}-aide` : undefined}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 font-mono text-ink tabular outline-none"
        />
        {suffixe ? <span className="pr-3 text-sm text-ink-3">{suffixe}</span> : null}
      </div>
      {aide ? (
        <p id={`${id}-aide`} className="mt-1 text-xs text-ink-3">
          {aide}
        </p>
      ) : null}
    </div>
  );
}

function Choix<T extends string>({
  label,
  valeur,
  options,
  onChange,
}: {
  label: string;
  valeur: T;
  options: { valeur: T; libelle: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-2">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.valeur}
            type="button"
            aria-pressed={valeur === o.valeur}
            onClick={() => onChange(o.valeur)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              valeur === o.valeur ? "border-brand bg-brand-soft text-ink" : "border-line-strong text-ink-2 hover:border-ink-3"
            }`}
          >
            {o.libelle}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Resultats({ lignes, erreur, note }: { lignes?: [string, string, boolean?][]; erreur?: string; note?: string }) {
  return (
    <div aria-live="polite" className="rounded-xl border border-line bg-chart p-4">
      {erreur ? (
        <p className="text-sm text-warn">{erreur}</p>
      ) : (
        <dl className="space-y-2">
          {lignes?.map(([cle, valeur, fort]) => (
            <div key={cle} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-ink-2">{cle}</dt>
              <dd className={`text-right font-mono tabular ${fort ? "text-lg font-semibold text-ink" : "text-ink"}`}>{valeur}</dd>
            </div>
          ))}
        </dl>
      )}
      {note ? <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{note}</p> : null}
    </div>
  );
}

const incomplet = "Renseignez tous les champs avec des nombres (la virgule est acceptée).";

export function CalculateurPosition() {
  const [mode, setMode] = useState<"prix" | "lots">("prix");
  const [capital, setCapital] = useState("2000");
  const [risque, setRisque] = useState("1");
  const [entree, setEntree] = useState("50");
  const [stop, setStop] = useState("48");
  const [stopPips, setStopPips] = useState("25");
  const [valeurPip, setValeurPip] = useState("10");

  let contenu: React.ReactNode;
  if (mode === "prix") {
    const [c, r, e, s] = [capital, risque, entree, stop].map(lireNombre);
    if ([c, r, e, s].some(Number.isNaN)) contenu = <Resultats erreur={incomplet} />;
    else {
      const res = taillePositionPrix({ capital: c, risquePct: r, entree: e, stop: s });
      contenu =
        "erreur" in res ? (
          <Resultats erreur={res.erreur} />
        ) : (
          <Resultats
            lignes={[
              ["Montant risqué", `${nombre(res.montantRisque)} €`],
              ["Distance du stop", `${nombre(res.distance)} € par unité`],
              ["Quantité (arrondie à l'unité inférieure)", `${nombre(res.quantiteArrondie, 0)}`, true],
              ["Perte si le stop est touché", `${nombre(res.risqueEffectif)} €`],
              ["Valeur de la position", `${nombre(res.quantiteArrondie * e)} €`],
            ]}
            note={
              res.quantiteArrondie * e > c
                ? "La position vaut plus que votre capital : elle n'est possible qu'avec un effet de levier. Le risque reste celui calculé si le stop est exécuté à son prix, ce qui n'est pas garanti (gap, slippage)."
                : "Le risque réel peut dépasser ce montant si le stop est exécuté plus loin (gap, slippage) et ne compte pas les frais."
            }
          />
        );
    }
  } else {
    const [c, r, sp, vp] = [capital, risque, stopPips, valeurPip].map(lireNombre);
    if ([c, r, sp, vp].some(Number.isNaN)) contenu = <Resultats erreur={incomplet} />;
    else {
      const res = tailleLots({ capital: c, risquePct: r, stopPips: sp, valeurPipParLot: vp });
      contenu =
        "erreur" in res ? (
          <Resultats erreur={res.erreur} />
        ) : (
          <Resultats
            lignes={[
              ["Montant risqué", nombre(res.montantRisque)],
              ["Taille exacte", `${nombre(res.lots, 3)} lot`],
              ["Taille arrondie (0,01 lot)", `${nombre(res.lotsArrondis)} lot`, true],
              ["Perte si le stop est touché", nombre(res.risqueEffectif)],
            ]}
            note={
              res.lotsArrondis === 0
                ? "Le risque accepté est trop faible pour ce stop, même avec le plus petit lot (0,01). Élargissez votre risque ou réduisez la distance du stop."
                : "Montants dans la devise de votre compte. La valeur du pip dépend de la paire et de la devise du compte : utilisez le calculateur de pips en cas de doute."
            }
          />
        );
    }
  }

  return (
    <div className="space-y-4">
      <Choix
        label="Instrument"
        valeur={mode}
        onChange={setMode}
        options={[
          { valeur: "prix", libelle: "Actions, crypto (stop en prix)" },
          { valeur: "lots", libelle: "Forex (stop en pips)" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label="Capital du compte" valeur={capital} onChange={setCapital} suffixe={mode === "prix" ? "€" : undefined} />
        <Champ label="Risque par opération" valeur={risque} onChange={setRisque} suffixe="%" aide="Souvent 0,5 à 2 % du capital." />
        {mode === "prix" ? (
          <>
            <Champ label="Prix d'entrée" valeur={entree} onChange={setEntree} suffixe="€" />
            <Champ label="Prix du stop loss" valeur={stop} onChange={setStop} suffixe="€" />
          </>
        ) : (
          <>
            <Champ label="Distance du stop" valeur={stopPips} onChange={setStopPips} suffixe="pips" />
            <Champ
              label="Valeur d'un pip pour 1 lot"
              valeur={valeurPip}
              onChange={setValeurPip}
              aide="10 pour EUR/USD avec un compte en dollars."
            />
          </>
        )}
      </div>
      {contenu}
    </div>
  );
}

export function CalculateurRendementRisque() {
  const [sens, setSens] = useState<Sens>("achat");
  const [entree, setEntree] = useState("50");
  const [stop, setStop] = useState("47,8");
  const [objectif, setObjectif] = useState("54,4");
  const [frais, setFrais] = useState("0,1");

  const [e, s, o, f] = [entree, stop, objectif, frais].map(lireNombre);
  let contenu: React.ReactNode;
  if ([e, s, o].some(Number.isNaN) || (frais !== "" && Number.isNaN(f))) contenu = <Resultats erreur={incomplet} />;
  else {
    const res = ratioRendementRisque({ sens, entree: e, stop: s, objectif: o });
    if ("erreur" in res) contenu = <Resultats erreur={res.erreur} />;
    else {
      const coutAllerRetour = Number.isNaN(f) ? 0 : f;
      const fraisR = coutAllerRetour / res.risque;
      const ratioNet = (res.rendement - coutAllerRetour) / (res.risque + coutAllerRetour);
      contenu = (
        <Resultats
          lignes={[
            ["Risque par unité", nombre(res.risque)],
            ["Gain visé par unité", nombre(res.rendement)],
            ["Ratio rendement/risque", `${nombre(res.ratio)} R`, true],
            ["Ratio après frais", `${nombre(ratioNet)} R`],
            ["Réussite minimale, sans frais", `${nombre(seuilRentabilite(res.ratio) * 100, 1)} %`],
            ["Réussite minimale, frais inclus", `${nombre(seuilRentabiliteAvecFrais(res.ratio, fraisR) * 100, 1)} %`, true],
          ]}
          note="La réussite minimale est le taux de trades gagnants en dessous duquel cette configuration perd de l'argent sur la durée. Elle ne dit rien de vos chances réelles : seule une mesure sur vos propres trades le peut."
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      <Choix
        label="Sens"
        valeur={sens}
        onChange={setSens}
        options={[
          { valeur: "achat", libelle: "Achat" },
          { valeur: "vente", libelle: "Vente" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label="Prix d'entrée" valeur={entree} onChange={setEntree} />
        <Champ label="Stop loss" valeur={stop} onChange={setStop} />
        <Champ label="Objectif (take profit)" valeur={objectif} onChange={setObjectif} />
        <Champ label="Frais aller-retour par unité" valeur={frais} onChange={setFrais} aide="Spread et commission, dans la même unité que les prix." />
      </div>
      {contenu}
    </div>
  );
}

export function CalculateurPips() {
  const [type, setType] = useState<"standard" | "yen">("standard");
  const [prixA, setPrixA] = useState("1,0850");
  const [prixB, setPrixB] = useState("1,0870");
  const [taille, setTaille] = useState("100000");
  const [conversion, setConversion] = useState("1");

  const taillePip = type === "standard" ? 0.0001 : 0.01;
  const [a, b, t, conv] = [prixA, prixB, taille, conversion].map(lireNombre);
  let contenu: React.ReactNode;
  if ([a, b, t, conv].some(Number.isNaN)) contenu = <Resultats erreur={incomplet} />;
  else if (t <= 0 || conv <= 0 || a <= 0 || b <= 0) contenu = <Resultats erreur="Les prix, la taille et la conversion doivent être positifs." />;
  else {
    const pips = pipsEntre(a, b, taillePip);
    const valeur = valeurPipParLot({ taillePip, tailleContrat: t, conversion: conv });
    contenu = (
      <Resultats
        lignes={[
          ["Écart", `${nombre(pips, 1)} pips`, true],
          ["Valeur d'un pip pour cette taille", nombre(valeur, 2)],
          ["Valeur du mouvement", nombre(valeur * pips, 2), true],
        ]}
        note="Valeurs dans la devise du compte. Conversion = valeur d'une unité de la devise de cotation dans la devise du compte : 1 si elles sont identiques (EUR/USD avec un compte en dollars)."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Choix
        label="Type de paire"
        valeur={type}
        onChange={setType}
        options={[
          { valeur: "standard", libelle: "4 décimales (EUR/USD…)" },
          { valeur: "yen", libelle: "Paires en yen (USD/JPY…)" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label="Premier prix" valeur={prixA} onChange={setPrixA} />
        <Champ label="Second prix" valeur={prixB} onChange={setPrixB} />
        <Champ label="Taille de la position" valeur={taille} onChange={setTaille} suffixe="unités" aide="1 lot = 100 000 ; mini-lot = 10 000 ; micro-lot = 1 000." />
        <Champ label="Conversion vers la devise du compte" valeur={conversion} onChange={setConversion} />
      </div>
      {contenu}
    </div>
  );
}

export function CalculateurEsperance() {
  const [reussite, setReussite] = useState("40");
  const [gain, setGain] = useState("2");
  const [perte, setPerte] = useState("1");
  const [trades, setTrades] = useState("100");
  const [serie, setSerie] = useState("6");

  const [p, g, l, n, k] = [reussite, gain, perte, trades, serie].map(lireNombre);
  let contenu: React.ReactNode;
  if ([p, g, l, n, k].some(Number.isNaN)) contenu = <Resultats erreur={incomplet} />;
  else if (p < 0 || p > 100) contenu = <Resultats erreur="Le taux de réussite doit être compris entre 0 et 100 %." />;
  else if (g <= 0 || l <= 0) contenu = <Resultats erreur="Le gain moyen et la perte moyenne doivent être positifs." />;
  else if (!Number.isInteger(n) || n < 1 || n > 5000 || !Number.isInteger(k) || k < 1) {
    contenu = <Resultats erreur="Le nombre de trades (1 à 5 000) et la longueur de série doivent être des nombres entiers." />;
  } else {
    const e = esperance(p / 100, g, l);
    contenu = (
      <Resultats
        lignes={[
          ["Espérance par trade", `${e >= 0 ? "+" : ""}${nombre(e)} R`, true],
          [`Résultat attendu sur ${n} trades`, `${e >= 0 ? "+" : ""}${nombre(e * n, 1)} R`],
          ["Réussite minimale pour ces gains et pertes", `${nombre((l / (g + l)) * 100, 1)} %`],
          [`Probabilité d'au moins ${k} pertes d'affilée`, `${nombre(probabiliteSerieDePertes(n, k, 1 - p / 100) * 100, 1)} %`, true],
        ]}
        note="Calcul théorique : trades indépendants et taux de réussite constant. La réalité est plus irrégulière, et un petit nombre de trades peut s'écarter fortement de l'espérance."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label="Taux de réussite" valeur={reussite} onChange={setReussite} suffixe="%" />
        <Champ label="Gain moyen" valeur={gain} onChange={setGain} suffixe="R" />
        <Champ label="Perte moyenne" valeur={perte} onChange={setPerte} suffixe="R" />
        <Champ label="Nombre de trades" valeur={trades} onChange={setTrades} />
        <Champ label="Longueur de série de pertes" valeur={serie} onChange={setSerie} suffixe="trades" />
      </div>
      {contenu}
    </div>
  );
}

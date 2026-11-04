"use client";

import { useEffect, useMemo, useState } from "react";
import type { SceneBougies } from "@/lib/chartkit/types";
import { chargerTauxBCE, CODES_DEVISES, DEVISES, formaterMontant, TAUX_FIXES, type Devise, type TableTaux } from "@/lib/trading/devises";
import type { EntreeJournal } from "@/lib/trading/journal";
import {
  avancer,
  fermer,
  graineInstrument,
  instrument,
  INSTRUMENTS,
  LONGUEUR_SERIE,
  lotsPourRisque,
  marge,
  nouveauCompte,
  resultatCotation,
  serie,
  versCompte,
  type Compte,
  type Fermeture,
  type Sens,
} from "@/lib/trading/simulateur";
import { ajouterAuJournal, useCompteEntrainement } from "@/lib/trading/stockage";
import { GraphiqueBougies } from "../figures/GraphiqueBougies";
import { Champ, Choix, lireNombre, nombre } from "./Calculateurs";

const SOLDES: Record<Devise, number> = {
  EUR: 10_000,
  USD: 10_000,
  GBP: 10_000,
  CAD: 10_000,
  CHF: 10_000,
  JPY: 1_500_000,
  XAF: 5_000_000,
  XOF: 5_000_000,
};

/** Taux de conversion : BCE du jour si le réseau répond, parités fixes du FCFA toujours, saisie manuelle en secours. */
function useTaux() {
  const [table, setTable] = useState<TableTaux | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [manuels, setManuels] = useState<Partial<Record<Devise, number>>>({});
  useEffect(() => {
    chargerTauxBCE().then(setTable, (e) => setErreur((e as Error).message));
  }, []);
  const taux = { ...TAUX_FIXES, ...(table?.parEuro ?? {}), ...manuels };
  return { taux, table, erreur, manuels, setManuels };
}

const versJournal = (f: Fermeture, devise: Devise): EntreeJournal => ({
  id: `${f.id}-${f.fermeeA}`,
  date: new Date().toISOString(),
  symbole: f.symbole,
  sens: f.sens,
  entree: f.entree,
  sortie: f.sortie,
  stop: f.stop,
  resultat: f.resultat,
  devise,
  r: f.resultatR,
  notes: f.motif === "manuel" ? "Fermeture manuelle" : f.motif === "stop" ? "Stop loss touché" : "Objectif atteint",
  source: "simulateur",
});

function Creation({ onCree }: { onCree: (c: Compte) => void }) {
  const [devise, setDevise] = useState<Devise>("XAF");
  const [solde, setSolde] = useState(String(SOLDES.XAF));
  const [levier, setLevier] = useState("30");
  return (
    <form
      className="grid gap-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        const s = lireNombre(solde);
        if (!(s > 0)) return;
        onCree(nouveauCompte(devise, s, Number(levier), crypto.getRandomValues(new Uint32Array(1))[0]));
      }}
    >
      <div>
        <label htmlFor="devise-compte" className="block text-sm font-medium text-ink-2">
          Devise du compte
        </label>
        <select
          id="devise-compte"
          value={devise}
          onChange={(e) => {
            const d = e.target.value as Devise;
            setDevise(d);
            setSolde(String(SOLDES[d]));
          }}
          className="champ mt-1 !min-h-11"
        >
          {CODES_DEVISES.map((d) => (
            <option key={d} value={d}>
              {d} · {DEVISES[d].nom}
            </option>
          ))}
        </select>
      </div>
      <Champ label="Solde de départ" valeur={solde} onChange={setSolde} suffixe={devise} />
      <div>
        <label htmlFor="levier-compte" className="block text-sm font-medium text-ink-2">
          Levier maximal
        </label>
        <select id="levier-compte" value={levier} onChange={(e) => setLevier(e.target.value)} className="champ mt-1 !min-h-11">
          {[1, 10, 30, 50, 100].map((l) => (
            <option key={l} value={l}>
              1:{l}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primaire sm:col-span-3">
        Ouvrir le compte d&apos;entraînement
      </button>
    </form>
  );
}

/**
 * Compte d'entraînement multi-devises : marché synthétique rejoué bougie par bougie, ordres au marché avec stop
 * et objectif, résultats calculés dans la devise de cotation puis convertis dans celle du compte.
 */
export function CompteEntrainement() {
  const [compte, setCompte] = useCompteEntrainement();
  const { taux, table, erreur, manuels, setManuels } = useTaux();
  const [symbole, setSymbole] = useState(INSTRUMENTS[0].symbole);
  const [sens, setSens] = useState<Sens>("achat");
  const [lots, setLots] = useState("0,10");
  const [stop, setStop] = useState("");
  const [objectif, setObjectif] = useState("");
  const [risque, setRisque] = useState("1");
  const [lecture, setLecture] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Les séries ne dépendent que de la graine du compte : inutile de les recalculer à chaque bougie.
  const series = useMemo(
    () => (compte ? Object.fromEntries(INSTRUMENTS.map((i) => [i.symbole, serie(i, graineInstrument(compte, i))])) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compte?.graine],
  );

  const pas = (n = 1) => {
    if (!compte) return;
    let c = compte;
    const fermees: Fermeture[] = [];
    for (let k = 0; k < n; k++) {
      const r = avancer(c, series, taux);
      c = r.compte;
      fermees.push(...r.fermees);
    }
    if (fermees.length) {
      ajouterAuJournal(fermees.map((f) => versJournal(f, c.devise)));
      setMessage(
        fermees
          .map(
            (f) => `${f.symbole} : ${f.motif === "stop" ? "stop loss touché" : "objectif atteint"} (${formaterMontant(f.resultat, c.devise, { signe: true })})`,
          )
          .join(" · "),
      );
    }
    setCompte(c);
  };

  useEffect(() => {
    if (!lecture) return;
    const t = setInterval(() => pas(1), 700);
    return () => clearInterval(t);
  });

  if (!compte) {
    return (
      <div className="space-y-4">
        <p className="text-ink-2">
          Choisis la devise de ton compte, puis entraîne-toi sur un marché <strong className="text-ink">synthétique</strong> rejoué bougie par bougie : passe
          des ordres, pose tes stops, observe la marge et tes résultats convertis dans ta devise. Aucun argent réel, aucun cours réel.
        </p>
        <Creation onCree={setCompte} />
      </div>
    );
  }

  const i = instrument(symbole);
  const bougies = series[symbole];
  const prix = bougies[compte.index].c;
  const fin = compte.index >= LONGUEUR_SERIE - 1;
  const latent = compte.positions.reduce<number | null>((s, p) => {
    const ip = instrument(p.symbole);
    const v = versCompte(resultatCotation(p, series[p.symbole][compte.index].c, ip), ip, series[p.symbole][compte.index].c, compte.devise, taux);
    return s === null || v === null ? null : s + v;
  }, 0);
  const margeUtilisee = compte.positions.reduce<number | null>((s, p) => {
    const ip = instrument(p.symbole);
    const v = marge(p, series[p.symbole][compte.index].c, ip, compte.devise, compte.levier, taux);
    return s === null || v === null ? null : s + v;
  }, 0);
  const equite = latent === null ? null : compte.solde + latent;
  const conversionPossible = versCompte(1, i, prix, compte.devise, taux) !== null;
  const m = (v: number | null) => (v === null ? "taux manquant" : formaterMontant(v, compte.devise));

  const visibles = bougies.slice(Math.max(0, compte.index - 47), compte.index + 1);
  const decalage = Math.max(0, compte.index - 47);
  const scene: SceneBougies = {
    kind: "bougies",
    description: `${i.symbole}, marché synthétique : ${visibles.length} dernières bougies, dernier prix ${nombre(prix, i.decimales)}.`,
    bougies: visibles,
    decimales: i.decimales,
    annotations: compte.positions
      .filter((p) => p.symbole === symbole)
      .flatMap((p) => [
        {
          type: "niveau" as const,
          prix: p.entree,
          label: `${p.sens === "achat" ? "Achat" : "Vente"} ${nombre(p.lots, 2)}`,
          couleur: "ink" as const,
          style: "pointille" as const,
          de: Math.max(0, p.ouverteA - decalage),
        },
        ...(p.stop !== undefined
          ? [
              {
                type: "niveau" as const,
                prix: p.stop,
                label: "Stop",
                couleur: "bear" as const,
                de: Math.max(0, p.ouverteA - decalage),
              },
            ]
          : []),
        ...(p.objectif !== undefined
          ? [
              {
                type: "niveau" as const,
                prix: p.objectif,
                label: "Objectif",
                couleur: "bull" as const,
                de: Math.max(0, p.ouverteA - decalage),
              },
            ]
          : []),
      ]),
  };

  const ouvrir = () => {
    const l = lireNombre(lots);
    const sl = stop.trim() ? lireNombre(stop) : undefined;
    const tp = objectif.trim() ? lireNombre(objectif) : undefined;
    if (!(l >= 0.01)) return setMessage("Taille minimale : 0,01 lot.");
    if (sl !== undefined && (Number.isNaN(sl) || (sens === "achat" ? sl >= prix : sl <= prix)))
      return setMessage(`Le stop d'un${sens === "achat" ? " achat se place sous" : "e vente se place au-dessus du"} prix actuel.`);
    if (tp !== undefined && (Number.isNaN(tp) || (sens === "achat" ? tp <= prix : tp >= prix)))
      return setMessage(`L'objectif d'un${sens === "achat" ? " achat se place au-dessus du" : "e vente se place sous le"} prix actuel.`);
    if (!conversionPossible) return setMessage(`Il manque un taux de conversion ${i.cotation} → ${compte.devise} : saisis-le ci-dessous.`);
    const p = {
      id: crypto.randomUUID().slice(0, 8),
      symbole,
      sens,
      lots: l,
      entree: prix,
      stop: sl,
      objectif: tp,
      ouverteA: compte.index,
    };
    const mg = marge(p, prix, i, compte.devise, compte.levier, taux);
    if (mg !== null && equite !== null && margeUtilisee !== null && mg > equite - margeUtilisee)
      return setMessage(`Marge insuffisante : il faut ${m(mg)}, il reste ${m(equite - margeUtilisee)} de marge libre.`);
    setCompte({ ...compte, positions: [...compte.positions, p] });
    setMessage(`${sens === "achat" ? "Achat" : "Vente"} de ${nombre(l, 2)} lot sur ${symbole} à ${nombre(prix, i.decimales)}.`);
  };

  const calculerLots = () => {
    const sl = lireNombre(stop);
    const r = lireNombre(risque);
    if (Number.isNaN(sl) || Number.isNaN(r)) return setMessage("Indique d'abord le stop et le risque en %.");
    const n = lotsPourRisque({
      solde: compte.solde,
      risquePct: r,
      entree: prix,
      stop: sl,
      i,
      devise: compte.devise,
      taux,
    });
    if (n === null) return setMessage("Calcul impossible : taux de conversion manquant ou stop au prix d'entrée.");
    setLots(nombre(n, 2));
    setMessage(
      n < 0.01
        ? "Ce risque est trop faible pour une position de 0,01 lot avec ce stop : élargis ton risque ou rapproche ton stop."
        : `${nombre(n, 2)} lot pour risquer ${nombre(r, 1)} % du solde jusqu'au stop.`,
    );
  };

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Solde", m(compte.solde)],
          ["Équité", m(equite)],
          ["Marge utilisée", m(margeUtilisee)],
          ["Résultat latent", latent === null ? "taux manquant" : formaterMontant(latent, compte.devise, { signe: true })],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-surface p-3">
            <dt className="text-xs text-ink-3">{k}</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-ink tabular sm:text-base">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Instrument">
        {INSTRUMENTS.map((x) => (
          <button
            key={x.symbole}
            type="button"
            role="tab"
            aria-selected={x.symbole === symbole}
            onClick={() => setSymbole(x.symbole)}
            className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs ${x.symbole === symbole ? "border-brand bg-brand-soft text-ink" : "border-line-strong text-ink-2 hover:text-ink"}`}
          >
            {x.symbole}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-line bg-chart p-3">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="text-ink-2">
                {i.nom} · coté en <strong className="text-ink">{i.cotation}</strong>
              </span>
              <span className="font-mono text-lg font-semibold text-ink tabular">{nombre(prix, i.decimales)}</span>
            </div>
            <div className="mx-auto max-w-3xl">
              <GraphiqueBougies scene={scene} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secondaire !min-h-10" onClick={() => pas(1)} disabled={fin}>
                Bougie suivante
              </button>
              <button type="button" className="btn btn-secondaire !min-h-10" onClick={() => pas(10)} disabled={fin}>
                +10 bougies
              </button>
              <button type="button" className="btn btn-discret !min-h-10" aria-pressed={lecture} onClick={() => setLecture((l) => !l)} disabled={fin}>
                {lecture ? "Pause" : "Lecture auto"}
              </button>
              <span className="ml-auto text-xs text-ink-3">
                Bougie {compte.index + 1} / {LONGUEUR_SERIE} · données synthétiques
              </span>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <h3 className="font-semibold text-ink">Positions ouvertes</h3>
            {compte.positions.length === 0 ? <p className="text-sm text-ink-3">Aucune position.</p> : null}
            <ul className="space-y-2">
              {compte.positions.map((p) => {
                const ip = instrument(p.symbole);
                const px = series[p.symbole][compte.index].c;
                const enCotation = resultatCotation(p, px, ip);
                const enCompte = versCompte(enCotation, ip, px, compte.devise, taux);
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line px-3 py-2 text-sm">
                    <span className="font-mono text-ink">
                      {p.sens === "achat" ? "▲" : "▼"} {nombre(p.lots, 2)} {p.symbole}
                    </span>
                    <span className="text-ink-3">à {nombre(p.entree, ip.decimales)}</span>
                    <span className={`ml-auto font-mono font-semibold tabular ${enCotation >= 0 ? "text-ok" : "text-bad"}`}>
                      {enCompte === null
                        ? "taux manquant"
                        : formaterMontant(enCompte, compte.devise, {
                            signe: true,
                          })}
                      {ip.cotation !== compte.devise ? (
                        <span className="ml-1 text-xs font-normal text-ink-3">
                          (
                          {formaterMontant(enCotation, ip.cotation, {
                            signe: true,
                          })}
                          )
                        </span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-brand underline"
                      onClick={() => {
                        const apres = fermer(compte, p, px, "manuel", taux);
                        if (!apres) return setMessage("Fermeture impossible : taux de conversion manquant.");
                        ajouterAuJournal([versJournal(apres.historique[apres.historique.length - 1], compte.devise)]);
                        setCompte(apres);
                      }}
                    >
                      Fermer
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-line pt-3 text-xs leading-relaxed text-ink-3">
              Résultat d&apos;une position = écart de prix × lots × taille du contrat, dans la devise de cotation, puis converti en {compte.devise}.{" "}
              {table
                ? `Taux de référence BCE du ${new Date(table.date).toLocaleDateString("fr-FR")}`
                : erreur
                  ? "Taux BCE indisponibles hors connexion"
                  : "Chargement des taux BCE…"}{" "}
              ; FCFA à parité fixe (1 € = 655,957 FCFA). Les trades fermés s&apos;ajoutent à ton journal.
            </p>
            {!conversionPossible ? (
              <div className="rounded-lg border border-warn/50 bg-warn/10 p-3">
                <Champ
                  label={`Taux manuel : 1 € = ? ${i.cotation}`}
                  valeur={manuels[i.cotation] ? String(manuels[i.cotation]) : ""}
                  onChange={(v) =>
                    setManuels({
                      ...manuels,
                      [i.cotation]: lireNombre(v) || undefined,
                    })
                  }
                  aide="Saisis un taux daté que tu connais (par exemple celui de ta banque) : il ne sert qu'à cet entraînement."
                />
              </div>
            ) : null}
            <button
              type="button"
              className="btn btn-discret !min-h-9 text-xs"
              onClick={() => {
                if (
                  window.confirm("Fermer ce compte d'entraînement et en ouvrir un nouveau ? Les positions ouvertes seront perdues ; le journal est conservé.")
                )
                  setCompte(null);
              }}
            >
              Recommencer avec un nouveau compte
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 xl:sticky xl:top-32">
          <h3 className="font-semibold text-ink">Passer un ordre au marché</h3>
          <Choix
            label="Sens"
            valeur={sens}
            onChange={setSens}
            options={[
              { valeur: "achat", libelle: "Acheter" },
              { valeur: "vente", libelle: "Vendre" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Stop loss (prix)" valeur={stop} onChange={setStop} aide="Facultatif, mais conseillé." />
            <Champ label="Objectif (prix)" valeur={objectif} onChange={setObjectif} />
            <Champ label="Risque" valeur={risque} onChange={setRisque} suffixe="% du solde" />
            <Champ
              label="Taille"
              valeur={lots}
              onChange={setLots}
              suffixe="lot"
              aide={`1 lot = ${nombre(i.contrat, 0)} ${i.base ?? (i.symbole.startsWith("XAU") ? "onces" : "points")}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-discret !min-h-10" onClick={calculerLots}>
              Calculer la taille pour ce risque
            </button>
            <button type="button" className="btn btn-primaire !min-h-10 flex-1" onClick={ouvrir} disabled={fin}>
              {sens === "achat" ? "Acheter" : "Vendre"} {symbole}
            </button>
          </div>
          {message ? (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink" role="status">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

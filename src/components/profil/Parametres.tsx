"use client";

import { useRef, useState } from "react";
import type { Reglages } from "@/lib/progression/etat";
import { changerReglages, effacerTout, exporter, importer, useProgression } from "@/lib/progression/store";

function Option<T extends string>({
  legende,
  aide,
  valeur,
  options,
  onChange,
}: {
  legende: string;
  aide: string;
  valeur: T;
  options: { valeur: T; libelle: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-line bg-surface p-5">
      <legend className="sr-only">{legende}</legend>
      <p className="font-semibold text-ink" aria-hidden="true">
        {legende}
      </p>
      <p className="mt-1 text-sm text-ink-2">{aide}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.valeur}
            type="button"
            aria-pressed={valeur === o.valeur}
            onClick={() => onChange(o.valeur)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${valeur === o.valeur ? "border-brand bg-brand-soft text-ink" : "border-line-strong text-ink-2 hover:text-ink"}`}
          >
            {o.libelle}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Parametres() {
  const { reglages, chapitres } = useProgression();
  const fichier = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [confirmer, setConfirmer] = useState(false);
  const maj = (r: Partial<Reglages>) => changerReglages(r);

  const telecharger = () => {
    const blob = new Blob([exporter()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meridien-progression-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, texte: "Fichier de progression téléchargé." });
  };

  const charger = async (f: File | undefined) => {
    if (!f) return;
    const ok = f.size < 1_000_000 && importer(await f.text());
    setMessage(ok ? { ok: true, texte: "Progression importée." } : { ok: false, texte: "Ce fichier n'est pas une progression Méridien valide. Rien n'a été modifié." });
    if (fichier.current) fichier.current.value = "";
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="titre-affichage" className="space-y-3">
        <h2 id="titre-affichage" className="text-xl font-semibold text-ink">
          Affichage
        </h2>
        <Option
          legende="Couleurs de hausse et de baisse"
          aide="Bleu et orange se distinguent mieux que vert et rouge en cas de daltonisme."
          valeur={reglages.palette}
          onChange={(palette) => maj({ palette })}
          options={[
            { valeur: "standard", libelle: "Vert et rouge" },
            { valeur: "daltonien", libelle: "Bleu et orange" },
          ]}
        />
        <Option
          legende="Taille du texte"
          aide="Agrandit tout le texte du site."
          valeur={reglages.texte}
          onChange={(texte) => maj({ texte })}
          options={[
            { valeur: "normal", libelle: "Normale" },
            { valeur: "grand", libelle: "Grande" },
          ]}
        />
        <Option
          legende="Mode léger"
          aide="Supprime les animations. En automatique, il s'active si ton appareil ou ta connexion le signalent (économie de données, réseau lent)."
          valeur={reglages.leger}
          onChange={(leger) => maj({ leger })}
          options={[
            { valeur: "auto", libelle: "Automatique" },
            { valeur: "oui", libelle: "Activé" },
            { valeur: "non", libelle: "Désactivé" },
          ]}
        />
      </section>

      <section id="donnees" aria-labelledby="titre-donnees" className="scroll-mt-20 space-y-3">
        <h2 id="titre-donnees" className="text-xl font-semibold text-ink">
          Tes données
        </h2>
        <p className="max-w-2xl text-sm text-ink-2">
          Ta progression ({Object.keys(chapitres).length} chapitre{Object.keys(chapitres).length > 1 ? "s" : ""} ouvert
          {Object.keys(chapitres).length > 1 ? "s" : ""}), tes notes et tes réglages sont enregistrés uniquement dans ce navigateur. Rien n&apos;est envoyé
          à un serveur. Pour changer d&apos;appareil, exporte un fichier puis importe-le sur l&apos;autre appareil.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={telecharger} className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
            Exporter ma progression
          </button>
          <label className="cursor-pointer rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-3">
            Importer un fichier
            <input ref={fichier} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => charger(e.target.files?.[0])} />
          </label>
          {!confirmer ? (
            <button type="button" onClick={() => setConfirmer(true)} className="rounded-lg border border-bad/50 px-4 py-2.5 text-sm font-medium text-bad hover:bg-bad/10">
              Effacer toutes mes données
            </button>
          ) : (
            <span className="flex flex-wrap items-center gap-2 rounded-lg border border-bad/50 px-3 py-2 text-sm">
              <span className="text-ink">Tout effacer, définitivement ?</span>
              <button
                type="button"
                onClick={() => {
                  effacerTout();
                  setConfirmer(false);
                  setMessage({ ok: true, texte: "Toutes tes données ont été effacées de ce navigateur." });
                }}
                className="rounded-md bg-bad px-3 py-1.5 font-medium text-white"
              >
                Oui, effacer
              </button>
              <button type="button" onClick={() => setConfirmer(false)} className="rounded-md px-3 py-1.5 text-ink-2 hover:text-ink">
                Annuler
              </button>
            </span>
          )}
        </div>
        {message ? (
          <p role="status" className={`text-sm ${message.ok ? "text-ok" : "text-warn"}`}>
            {message.texte}
          </p>
        ) : null}
      </section>
    </div>
  );
}

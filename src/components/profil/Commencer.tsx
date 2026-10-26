"use client";

import Link from "next/link";
import { useState } from "react";
import type { Profil } from "@/lib/progression/etat";
import { enregistrerProfil } from "@/lib/progression/store";

type Choix<T extends string> = { valeur: T; libelle: string; detail: string };

const objectifs: Choix<Profil["objectif"]>[] = [
  { valeur: "decouvrir", libelle: "Découvrir", detail: "Comprendre ce qu'est le trading avant de décider quoi que ce soit." },
  { valeur: "methode", libelle: "Trader avec méthode", detail: "Structurer mes décisions et maîtriser mon risque." },
  { valeur: "smc-ict", libelle: "Aller vers SMC et ICT", detail: "Étudier ces écoles, avec un regard critique." },
];
const niveaux: Choix<Profil["niveau"]>[] = [
  { valeur: "debutant", libelle: "Je pars de zéro", detail: "Les mots spread, pip ou levier ne me disent rien." },
  { valeur: "notions", libelle: "J'ai des notions", detail: "J'ai lu ou regardé des vidéos, sans pratiquer." },
  { valeur: "pratique", libelle: "J'ai déjà tradé", detail: "J'ai passé des ordres, en démo ou en réel." },
];
const temps: Choix<Profil["temps"]>[] = [
  { valeur: "10", libelle: "10 minutes par jour", detail: "Un chapitre tous les un ou deux jours." },
  { valeur: "20", libelle: "20 minutes par jour", detail: "Un à deux chapitres par jour." },
  { valeur: "45", libelle: "45 minutes ou plus", detail: "Trois à quatre chapitres par jour." },
];

function Groupe<T extends string>({ legende, options, valeur, onChange }: { legende: string; options: Choix<T>[]; valeur: T | null; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-lg font-semibold text-ink">{legende}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.valeur}
            className={`cursor-pointer rounded-xl border p-4 transition-colors ${valeur === o.valeur ? "border-brand bg-brand-soft" : "border-line-strong hover:border-ink-3"}`}
          >
            <input type="radio" name={legende} value={o.valeur} checked={valeur === o.valeur} onChange={() => onChange(o.valeur)} className="sr-only" />
            <span className="block font-medium text-ink">{o.libelle}</span>
            <span className="mt-1 block text-sm text-ink-2">{o.detail}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Trois questions pour orienter l'apprenant ; les réponses restent dans ce navigateur. */
export function Commencer() {
  const [objectif, setObjectif] = useState<Profil["objectif"] | null>(null);
  const [niveau, setNiveau] = useState<Profil["niveau"] | null>(null);
  const [rythme, setRythme] = useState<Profil["temps"] | null>(null);
  const [valide, setValide] = useState(false);
  const complet = objectif && niveau && rythme;

  if (valide && objectif && niveau) {
    return (
      <div className="apparition space-y-5 rounded-2xl border border-brand/50 bg-brand-soft p-6">
        <p className="text-sm font-medium text-brand">Ton point de départ</p>
        <p className="text-2xl font-semibold text-ink">Parcours « Premiers pas »</p>
        <ul className="space-y-2 text-ink">
          {niveau === "pratique" ? (
            <li>Tu as déjà tradé : sur chaque chapitre, le bouton « Je connais déjà » te permet de valider directement par le quiz.</li>
          ) : (
            <li>Suis les chapitres dans l&apos;ordre : chacun s&apos;appuie sur les précédents.</li>
          )}
          {objectif === "smc-ict" ? (
            <li>
              Les académies SMC et Liquidité/ICT sont en préparation. Elles supposent de maîtriser structure, ordres, coûts et risque : c&apos;est
              exactement l&apos;objet de ce parcours.
            </li>
          ) : null}
          {objectif === "decouvrir" ? <li>Le premier chapitre suffit pour savoir si tu veux aller plus loin. Aucun engagement.</li> : null}
          <li>
            Le parcours dure environ 2 h 40 : à ton rythme, compte{" "}
            {rythme === "10" ? "environ trois semaines" : rythme === "20" ? "un peu plus d'une semaine" : "environ quatre jours"}.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link href="/chapitre/quest-ce-que-le-trading/" className="rounded-xl bg-brand-solid px-5 py-3 font-semibold text-white hover:brightness-110">
            Commencer le chapitre 1
          </Link>
          <Link href="/parcours/premiers-pas/" className="rounded-xl border border-line-strong px-5 py-3 font-medium text-ink hover:border-ink-3">
            Voir tout le parcours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!objectif || !niveau || !rythme) return;
        enregistrerProfil({ objectif, niveau, temps: rythme });
        setValide(true);
      }}
    >
      <Groupe legende="Ce que tu cherches" options={objectifs} valeur={objectif} onChange={setObjectif} />
      <Groupe legende="Ton niveau" options={niveaux} valeur={niveau} onChange={setNiveau} />
      <Groupe legende="Ton temps disponible" options={temps} valeur={rythme} onChange={setRythme} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={!complet} className="rounded-xl bg-brand-solid px-6 py-3 font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          Voir mon point de départ
        </button>
        <Link href="/chapitre/quest-ce-que-le-trading/" className="text-sm text-ink-2 hover:text-ink">
          Passer et commencer directement
        </Link>
      </div>
    </form>
  );
}

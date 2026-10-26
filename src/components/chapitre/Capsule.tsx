"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene, VisuelScene } from "@/content/schema";
import { texteBrut, typographie } from "@/lib/typographie";
import { Visuel } from "../figures/Figure";
import { IconeCoche, IconeLecture, IconePause, IconePrecedent, IconeSuivant, IconeTexte } from "../ui/Icones";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function RenduVisuel({ visuel }: { visuel: VisuelScene }) {
  switch (visuel.type) {
    case "titre":
      return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="apparition text-2xl font-semibold leading-tight text-ink sm:text-3xl">{typographie(visuel.titre)}</p>
          {visuel.sousTitre ? <p className="apparition mt-3 text-base text-brand sm:text-lg">{typographie(visuel.sousTitre)}</p> : null}
        </div>
      );
    case "figure":
      return (
        <div className="flex h-full items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-xl">
            <Visuel scene={visuel.scene} etape={visuel.etape} />
          </div>
        </div>
      );
    case "points":
      return (
        <div className="flex h-full flex-col justify-center px-6 sm:px-10">
          {visuel.titre ? <p className="apparition mb-4 text-xl font-semibold text-ink sm:text-2xl">{typographie(visuel.titre)}</p> : null}
          <ul className="space-y-3">
            {visuel.items.map((item, i) => (
              <li key={item} className="apparition flex items-start gap-3 text-base text-ink sm:text-lg" style={{ animationDelay: `${i * 180}ms` }}>
                <IconeCoche className="mt-1 size-5 shrink-0 text-brand" />
                {typographie(item)}
              </li>
            ))}
          </ul>
        </div>
      );
    case "formule":
      return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="apparition font-mono text-xl text-ink tabular sm:text-2xl">{typographie(visuel.texte)}</p>
          {visuel.legende ? <p className="apparition mt-3 text-sm text-ink-2 sm:text-base">{typographie(visuel.legende)}</p> : null}
        </div>
      );
  }
}

/**
 * Capsule animée sous-titrée : chaque scène s'affiche pendant sa durée, calée sur un débit de narration
 * de 140 à 160 mots par minute. La voix off viendra se poser sur ce même minutage.
 */
export function Capsule({ titre, scenes }: { titre: string; scenes: Scene[] }) {
  const debuts = scenes.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + scenes[i - 1].duree], []);
  const total = debuts[scenes.length - 1] + scenes[scenes.length - 1].duree;
  const [index, setIndex] = useState(0);
  const [ecoule, setEcoule] = useState(0);
  const [lecture, setLecture] = useState(false);
  const [vitesse, setVitesse] = useState(1);
  const [transcription, setTranscription] = useState(false);
  const etat = useRef({ index: 0, ecoule: 0 });

  useEffect(() => {
    if (!lecture) return;
    let precedent = performance.now();
    let id = 0;
    const avancer = (t: number) => {
      const dt = ((t - precedent) / 1000) * vitesse;
      precedent = t;
      const e = etat.current;
      e.ecoule += dt;
      if (e.ecoule >= scenes[e.index].duree) {
        if (e.index === scenes.length - 1) {
          e.ecoule = scenes[e.index].duree;
          setEcoule(e.ecoule);
          setLecture(false);
          return;
        }
        e.index += 1;
        e.ecoule = 0;
        setIndex(e.index);
      }
      setEcoule(e.ecoule);
      id = requestAnimationFrame(avancer);
    };
    id = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(id);
  }, [lecture, vitesse, scenes]);

  const allerA = (i: number) => {
    etat.current = { index: i, ecoule: 0 };
    setIndex(i);
    setEcoule(0);
  };

  const basculer = () => {
    if (!lecture && index === scenes.length - 1 && ecoule >= scenes[index].duree) allerA(0);
    setLecture((l) => !l);
  };

  const position = debuts[index] + ecoule;
  const scene = scenes[index];

  return (
    <section aria-label={`Capsule : ${titre}`} className="not-prose">
      <div className="overflow-hidden rounded-2xl border border-line bg-chart">
        <div
          className="relative aspect-[4/3] w-full sm:aspect-[16/10]"
          onClick={basculer}
          role="presentation"
        >
          <div key={index} className="absolute inset-0">
            <RenduVisuel visuel={scene.visuel} />
          </div>
          {!lecture && position === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-solid text-white shadow-lg">
                <IconeLecture className="size-8" />
              </span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-line bg-surface px-4 py-3">
          <p className="min-h-[3.2em] text-[0.98rem] leading-relaxed text-ink" aria-live={lecture ? "off" : "polite"}>
            {typographie(texteBrut(scene.texte))}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2.5">
          <button
            type="button"
            onClick={basculer}
            aria-label={lecture ? "Mettre en pause" : "Lire la capsule"}
            className="inline-flex size-10 items-center justify-center rounded-full bg-brand-solid text-white hover:brightness-110"
          >
            {lecture ? <IconePause className="size-5" /> : <IconeLecture className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => allerA(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label="Scène précédente"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-overlay disabled:opacity-40"
          >
            <IconePrecedent />
          </button>
          <button
            type="button"
            onClick={() => allerA(Math.min(scenes.length - 1, index + 1))}
            disabled={index === scenes.length - 1}
            aria-label="Scène suivante"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-overlay disabled:opacity-40"
          >
            <IconeSuivant />
          </button>
          <span className="font-mono text-xs text-ink-3 tabular">
            {mmss(position)} / {mmss(total)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="vitesse-capsule">
              Vitesse
            </label>
            <select
              id="vitesse-capsule"
              value={vitesse}
              onChange={(e) => setVitesse(Number(e.target.value))}
              className="rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-ink-2"
            >
              {[0.75, 1, 1.25, 1.5].map((v) => (
                <option key={v} value={v}>
                  {v.toLocaleString("fr-FR")}×
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setTranscription((t) => !t)}
              aria-expanded={transcription}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm text-ink-2 hover:text-ink"
            >
              <IconeTexte className="size-4" />
              Transcription
            </button>
          </div>
        </div>

        <div className="flex gap-1 px-3 pb-3" aria-label="Scènes de la capsule" role="group">
          {scenes.map((s, i) => {
            const rempli = i < index ? 1 : i === index ? Math.min(1, ecoule / s.duree) : 0;
            return (
              <button
                key={i}
                type="button"
                onClick={() => allerA(i)}
                aria-label={`Aller à la scène ${i + 1}`}
                aria-current={i === index ? "step" : undefined}
                style={{ flexGrow: s.duree }}
                className="h-2 basis-0 overflow-hidden rounded-full bg-line"
              >
                <span className="block h-full rounded-full bg-brand" style={{ width: `${rempli * 100}%` }} />
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-3">
        Capsule animée sous-titrée, {Math.round(total)} secondes. La voix off est en préparation ; le texte affiché est celui qui sera dit.
      </p>
      {transcription ? (
        <div className="mt-3 rounded-xl border border-line bg-surface p-4">
          <p className="mb-2 text-sm font-semibold text-ink">Transcription</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-2">
            {scenes.map((s, i) => (
              <li key={i}>{typographie(texteBrut(s.texte))}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

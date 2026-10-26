"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scenes as scenesFigures } from "@/content/scenes";
import type { Scene, VisuelScene } from "@/content/schema";
import { ressource } from "@/lib/chemin";
import { phrasesAffichees, type Narration, type SceneNarree } from "@/lib/narration";
import { typographie } from "@/lib/typographie";
import { GraphiqueBougies } from "../figures/GraphiqueBougies";
import { Visuel } from "../figures/Figure";
import {
  IconeCoche,
  IconeHautParleur,
  IconeLecture,
  IconePause,
  IconePleinEcran,
  IconePrecedent,
  IconeRejouer,
  IconeSourdine,
  IconeSousTitres,
  IconeSuivant,
  IconeTexte,
} from "../ui/Icones";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const ms = (s: number) => `${Math.round(s * 1000)}ms`;

type EtatLecture = "repos" | "lecture" | "pause" | "fin";

/** Visibles d'une scène de chandeliers à une étape donnée. */
function visiblesA(scene: string, etape: number | undefined) {
  const s = scenesFigures[scene];
  if (!s || s.kind !== "bougies") return 0;
  const e = etape ?? Number.POSITIVE_INFINITY;
  return s.revele ? (s.revele[Math.min(e, s.revele.length - 1)] ?? s.bougies.length) : s.bougies.length;
}

/**
 * Le visuel d'une scène, chorégraphié sur sa narration. Les apparitions sont des animations CSS dont les délais
 * sont calés sur les phrases ; un `decalage` (secondes déjà écoulées dans la scène) les avance d'autant après un
 * saut. Elles se mettent en pause avec la voix (data-pause) et suivent sa vitesse (Web Animations).
 */
function VisuelAnime({ visuel, precedent, duree, phrases, decalage }: { visuel: VisuelScene; precedent?: VisuelScene; duree: number; phrases: number[]; decalage: number }) {
  const retard = (s: number) => ms(s - decalage);
  switch (visuel.type) {
    case "titre": {
      const mots = typographie(visuel.titre).split(" ");
      return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="titre-affiche text-2xl font-semibold leading-tight text-ink sm:text-[2.1rem]">
            {mots.map((m, i) => (
              <span key={i} className="apparition inline-block" style={{ animationDelay: retard(0.15 + i * 0.09) }}>
                {m}&nbsp;
              </span>
            ))}
          </p>
          {visuel.sousTitre ? (
            <p className="apparition mt-4 text-base text-cyan sm:text-lg" style={{ animationDelay: retard(Math.max(0.6, phrases[1] ?? duree * 0.45)) }}>
              {typographie(visuel.sousTitre)}
            </p>
          ) : null}
        </div>
      );
    }
    case "points":
      return (
        <div className="flex h-full flex-col justify-center px-6 sm:px-12">
          {visuel.titre ? (
            <p className="apparition mb-5 text-xl font-semibold text-ink sm:text-2xl" style={{ animationDelay: retard(0.1) }}>
              {typographie(visuel.titre)}
            </p>
          ) : null}
          <ul className="space-y-3.5">
            {visuel.items.map((item, i) => {
              // Chaque point apparaît quand sa phrase commence ; à défaut, à intervalles réguliers.
              const t = phrases.length >= visuel.items.length ? phrases[i] : 0.3 + (i * duree * 0.7) / visuel.items.length;
              return (
                <li key={item} className="apparition flex items-start gap-3 text-base text-ink sm:text-lg" style={{ animationDelay: retard(t + 0.1) }}>
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <IconeCoche className="size-3.5" />
                  </span>
                  {typographie(item)}
                </li>
              );
            })}
          </ul>
        </div>
      );
    case "formule":
      return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="apparition rounded-2xl border border-brand/30 bg-brand-soft px-5 py-4 font-mono text-xl text-ink tabular sm:text-2xl" style={{ animationDelay: retard(0.2) }}>
            {typographie(visuel.texte)}
          </p>
          {visuel.legende ? (
            <p className="apparition mt-4 text-sm text-ink-2 sm:text-base" style={{ animationDelay: retard(Math.max(1, phrases[1] ?? duree * 0.4)) }}>
              {typographie(visuel.legende)}
            </p>
          ) : null}
        </div>
      );
    case "figure": {
      const s = scenesFigures[visuel.scene];
      const meme = precedent?.type === "figure" && precedent.scene === visuel.scene;
      let contenu: React.ReactNode;
      if (s?.kind === "bougies") {
        // Les nouvelles bougies se forment sur les 60 premiers pour cent de la scène, puis les annotations arrivent.
        const depuis = meme ? visiblesA(visuel.scene, precedent.etape) : 0;
        const nouvelles = Math.max(0, visiblesA(visuel.scene, visuel.etape) - depuis);
        const pasMs = nouvelles ? Math.min(240, (duree * 600) / nouvelles) : 0;
        const finFormation = 0.25 + (nouvelles * pasMs) / 1000;
        const depuisEtape = meme ? (precedent.etape ?? 0) + 1 : 0;
        contenu = (
          <GraphiqueBougies
            scene={s}
            etape={visuel.etape}
            formation={nouvelles ? { depuis, pasMs, delaiMs: Math.round((0.25 - decalage) * 1000) } : undefined}
            annotationsDepuis={{ etape: depuisEtape, delaiMs: Math.round((finFormation + 0.2 - decalage) * 1000) }}
          />
        );
      } else {
        contenu = (
          <div className={meme ? undefined : "apparition"} style={{ animationDelay: retard(0.1) }}>
            <Visuel scene={visuel.scene} etape={visuel.etape} />
          </div>
        );
      }
      return (
        <div className="flex h-full items-center justify-center p-2 sm:p-5">
          <div className="zoom-lent w-full max-w-xl" style={{ animationDuration: `${duree}s`, animationDelay: retard(0) }}>
            {contenu}
          </div>
        </div>
      );
    }
  }
}

/** Minutage de secours sans narration : durées prévues des scènes, phrases réparties à parts égales. */
function minutageDeSecours(scenes: Scene[]): SceneNarree[] {
  let t = 0;
  return scenes.map((s) => {
    const debut = t;
    t += s.duree;
    const phrases = phrasesAffichees(s.texte);
    const d = s.duree / phrases.length;
    return { debut, fin: t, phrases: phrases.map((texte, k) => ({ debut: debut + k * d, fin: debut + (k + 1) * d, texte })) };
  });
}

/**
 * Capsule narrée : une piste audio (voix de synthèse) donne le tempo ; scènes, animations et sous-titres
 * suivent la voix à la phrase près. Sans narration (ou si le son échoue), la capsule continue en sous-titres
 * sur une horloge interne.
 */
export function Capsule({ titre, scenes, narration }: { titre: string; scenes: Scene[]; narration?: Narration | null }) {
  const avecNarration = Boolean(narration && narration.scenes.length === scenes.length);
  const minutage = useMemo(() => (avecNarration ? narration!.scenes : minutageDeSecours(scenes)), [avecNarration, narration, scenes]);
  const total = minutage.at(-1)!.fin;

  const audio = useRef<HTMLAudioElement>(null);
  const conteneur = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const tempsEl = useRef<HTMLSpanElement>(null);
  const barres = useRef<(HTMLSpanElement | null)[]>([]);
  const horloge = useRef(0);
  const position = useRef({ index: 0, phrase: 0 });

  const [etat, setEtat] = useState<EtatLecture>("repos");
  const [attente, setAttente] = useState(false);
  const [index, setIndex] = useState(0);
  const [phrase, setPhrase] = useState(0);
  const [montage, setMontage] = useState(0);
  const [decalage, setDecalage] = useState(0);
  const [vitesse, setVitesse] = useState(1);
  const [muet, setMuet] = useState(false);
  const [sousTitres, setSousTitres] = useState(true);
  const [transcription, setTranscription] = useState(false);
  const [erreurSon, setErreurSon] = useState<string | null>(null);
  const [pleinEcran, setPleinEcran] = useState(false);
  const sansSon = !avecNarration || erreurSon !== null;

  const reperer = useCallback(
    (t: number) => {
      let i = 0;
      while (i < minutage.length - 1 && t >= minutage[i + 1].debut) i++;
      const ph = minutage[i].phrases;
      let k = 0;
      while (k < ph.length - 1 && t >= ph[k + 1].debut) k++;
      return { i, k };
    },
    [minutage],
  );

  // Écritures directes dans le DOM à chaque image : minuterie et barres de scène, sans rendu React.
  const peindre = useCallback(
    (t: number) => {
      if (tempsEl.current) tempsEl.current.textContent = `${mmss(t)} / ${mmss(total)}`;
      minutage.forEach((m, i) => {
        const b = barres.current[i];
        if (b) b.style.width = `${Math.max(0, Math.min(1, (t - m.debut) / (m.fin - m.debut))) * 100}%`;
      });
    },
    [minutage, total],
  );

  const temps = useCallback(() => (sansSon ? horloge.current : (audio.current?.currentTime ?? 0)), [sansSon]);

  const placer = useCallback(
    (t: number, remonter: boolean) => {
      const { i, k } = reperer(t);
      if (i !== position.current.index || remonter) {
        setIndex(i);
        setDecalage(Math.max(0, t - minutage[i].debut));
        if (remonter) setMontage((m) => m + 1);
      }
      if (k !== position.current.phrase || i !== position.current.index) setPhrase(k);
      position.current = { index: i, phrase: k };
      peindre(t);
    },
    [minutage, peindre, reperer],
  );

  const aller = useCallback(
    (t: number) => {
      const cible = Math.max(0, Math.min(total - 0.05, t));
      horloge.current = cible;
      if (!sansSon && audio.current) audio.current.currentTime = cible;
      placer(cible, true);
      if (etat === "fin") setEtat("pause");
    },
    [etat, placer, sansSon, total],
  );

  const finir = useCallback(() => {
    setEtat("fin");
    peindre(total);
  }, [peindre, total]);

  // Boucle d'affichage pendant la lecture : la voix est l'horloge (ou l'horloge interne, sans son).
  useEffect(() => {
    if (etat !== "lecture") return;
    let id = 0;
    let precedent = performance.now();
    const boucle = (now: number) => {
      if (sansSon && !attente) horloge.current += ((now - precedent) / 1000) * vitesse;
      precedent = now;
      const t = temps();
      if (t >= total - 0.02) {
        finir();
        return;
      }
      placer(t, false);
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
  }, [attente, etat, finir, placer, sansSon, temps, total, vitesse]);

  // Les animations CSS de la scène suivent la vitesse de lecture.
  useEffect(() => {
    scene.current?.getAnimations({ subtree: true }).forEach((a) => (a.playbackRate = vitesse));
  }, [index, montage, vitesse]);

  useEffect(() => {
    if (audio.current) {
      audio.current.playbackRate = vitesse;
      audio.current.muted = muet;
    }
  }, [vitesse, muet]);

  useEffect(() => {
    const surChangement = () => setPleinEcran(document.fullscreenElement === conteneur.current);
    document.addEventListener("fullscreenchange", surChangement);
    return () => document.removeEventListener("fullscreenchange", surChangement);
  }, []);

  const lire = async () => {
    if (etat === "fin") {
      horloge.current = 0;
      if (audio.current) audio.current.currentTime = 0;
      placer(0, true);
    }
    if (sansSon || !audio.current) {
      setEtat("lecture");
      return;
    }
    const a = audio.current;
    a.playbackRate = vitesse;
    a.muted = muet;
    if (a.readyState < 3) setAttente(true);
    setEtat("lecture");
    try {
      await a.play();
    } catch (e) {
      setAttente(false);
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setEtat("pause");
        setErreurSon(null);
      } else {
        horloge.current = a.currentTime;
        setErreurSon("La narration n'a pas pu être lue sur cet appareil. La capsule continue en sous-titres.");
      }
    }
  };

  const pause = () => {
    audio.current?.pause();
    setEtat("pause");
  };

  const basculer = () => (etat === "lecture" ? pause() : void lire());

  const scenePrecedente = () => aller(minutage[Math.max(0, index - 1)].debut);
  const sceneSuivante = () => aller(minutage[Math.min(minutage.length - 1, index + 1)].debut);

  const raccourcis = (e: React.KeyboardEvent) => {
    const cible = e.target as HTMLElement;
    if (cible.tagName === "SELECT" || cible.tagName === "INPUT") return;
    const touche = e.key.toLowerCase();
    if (touche === "k" || (touche === " " && cible.tagName !== "BUTTON")) {
      e.preventDefault();
      basculer();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      sceneSuivante();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scenePrecedente();
    } else if (touche === "m") setMuet((m) => !m);
    else if (touche === "c") setSousTitres((s) => !s);
    else if (touche === "f") void basculerPleinEcran();
  };

  const basculerPleinEcran = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await conteneur.current?.requestFullscreen();
    } catch {
      // Plein écran refusé (iOS notamment) : rien à faire, la capsule reste lisible.
    }
  };

  const enPause = etat !== "lecture" || attente;
  const m = minutage[index];
  const phrasesRelatives = m.phrases.map((p) => p.debut - m.debut);
  const sousTitre = m.phrases[phrase]?.texte ?? "";
  const repos = etat === "repos";

  return (
    <section aria-label={`Capsule : ${titre}`} className="not-prose" onKeyDown={raccourcis} ref={conteneur}>
      {avecNarration ? (
        <audio
          ref={audio}
          src={ressource(narration!.audio)}
          preload="metadata"
          onWaiting={() => setAttente(true)}
          onPlaying={() => setAttente(false)}
          onCanPlay={() => setAttente(false)}
          onEnded={finir}
          onError={() => {
            if (erreurSon) return;
            horloge.current = audio.current?.currentTime ?? 0;
            setAttente(false);
            setErreurSon("La narration n'a pas pu être chargée (réseau ou format). La capsule continue en sous-titres.");
          }}
        />
      ) : null}
      <div className={`overflow-hidden border border-line bg-chart ${pleinEcran ? "flex h-full flex-col" : "rounded-2xl"}`}>
        <div
          className={`relative w-full cursor-pointer select-none ${pleinEcran ? "flex-1" : "aspect-[4/3] sm:aspect-[16/10]"}`}
          onClick={basculer}
          role="presentation"
        >
          <div className="grille-ciel pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div ref={scene} data-pause={enPause ? "true" : "false"} key={`${index}-${montage}`} className="capsule-scene absolute inset-0 pb-14">
            <VisuelAnime visuel={scenes[index].visuel} precedent={scenes[index - 1]?.visuel} duree={m.fin - m.debut} phrases={phrasesRelatives} decalage={decalage} />
          </div>

          {sousTitres && !repos ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-10">
              <p key={`${index}-${phrase}`} data-sous-titre="" className="apparition max-w-2xl text-center text-[0.95rem] font-medium leading-snug text-white sm:text-lg">
                {typographie(sousTitre)}
              </p>
            </div>
          ) : null}

          {repos ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-black/30 to-black/60">
              <span className="relative flex size-20 items-center justify-center rounded-full bg-brand-solid text-white shadow-[0_0_0_10px_rgb(106_92_246/0.18),0_20px_50px_-10px_rgb(106_92_246/0.8)] transition-transform hover:scale-105">
                <IconeLecture className="ml-1 size-9" />
              </span>
              <span className="rounded-full bg-black/50 px-3 py-1 text-sm text-white/90 backdrop-blur">
                {avecNarration ? `Capsule narrée · ${mmss(total)} · avec le son` : `Capsule sous-titrée · ${mmss(total)}`}
              </span>
            </div>
          ) : null}

          {attente && etat === "lecture" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30" role="status">
              <span className="flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                Chargement de la narration…
              </span>
            </div>
          ) : null}

          {etat === "fin" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 text-center" onClick={(e) => e.stopPropagation()} role="presentation">
              <p className="text-lg font-semibold text-white">Capsule terminée</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => void lire()} className="btn btn-secondaire">
                  <IconeRejouer className="size-4" /> Revoir
                </button>
                <a href="#etape-cours" className="btn btn-primaire">
                  Passer au cours <IconeSuivant className="size-4" />
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-1 px-3 pt-3" aria-label="Scènes de la capsule" role="group">
          {minutage.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => aller(s.debut)}
              aria-label={`Aller à la scène ${i + 1}`}
              aria-current={i === index ? "step" : undefined}
              style={{ flexGrow: s.fin - s.debut }}
              className="group h-5 basis-0 py-1.5"
            >
              <span className="block h-full overflow-hidden rounded-full bg-line transition-transform group-hover:scale-y-150">
                <span
                  ref={(el) => {
                    barres.current[i] = el;
                  }}
                  className="block h-full rounded-full"
                  style={{ width: "0%", background: "var(--meridien)" }}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-3 pt-1.5">
          <button
            type="button"
            onClick={basculer}
            aria-label={etat === "lecture" ? "Mettre en pause" : "Lire la capsule"}
            className="inline-flex size-11 items-center justify-center rounded-full bg-brand-solid text-white transition-transform hover:bg-[#5f51f3] active:scale-95"
          >
            {etat === "lecture" ? <IconePause className="size-5" /> : <IconeLecture className="ml-0.5 size-5" />}
          </button>
          <button type="button" onClick={scenePrecedente} disabled={index === 0} aria-label="Scène précédente" className="btn btn-discret !min-h-10 !px-2.5 disabled:opacity-40">
            <IconePrecedent />
          </button>
          <button type="button" onClick={sceneSuivante} disabled={index === minutage.length - 1} aria-label="Scène suivante" className="btn btn-discret !min-h-10 !px-2.5 disabled:opacity-40">
            <IconeSuivant />
          </button>
          <span ref={tempsEl} className="ml-1 font-mono text-xs text-ink-3 tabular">
            {mmss(0)} / {mmss(total)}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {avecNarration ? (
              <button
                type="button"
                onClick={() => setMuet((x) => !x)}
                aria-pressed={muet}
                aria-label={muet ? "Activer le son" : "Couper le son"}
                className="btn btn-discret !min-h-10 !px-2.5"
              >
                {muet ? <IconeSourdine /> : <IconeHautParleur />}
              </button>
            ) : null}
            <button type="button" onClick={() => setSousTitres((x) => !x)} aria-pressed={sousTitres} aria-label="Sous-titres" className={`btn !min-h-10 !px-2.5 ${sousTitres ? "bg-brand-soft text-brand" : "btn-discret"}`}>
              <IconeSousTitres />
            </button>
            <label className="sr-only" htmlFor={`vitesse-${titre}`}>
              Vitesse
            </label>
            <select
              id={`vitesse-${titre}`}
              value={vitesse}
              onChange={(e) => setVitesse(Number(e.target.value))}
              className="min-h-10 rounded-xl border border-line bg-bg px-2 text-sm text-ink-2"
            >
              {[0.75, 1, 1.25, 1.5].map((v) => (
                <option key={v} value={v}>
                  {v.toLocaleString("fr-FR")}×
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setTranscription((t) => !t)} aria-expanded={transcription} className="btn btn-secondaire !min-h-10 !px-3 text-sm">
              <IconeTexte className="size-4" />
              Transcription
            </button>
            <button type="button" onClick={() => void basculerPleinEcran()} aria-label="Plein écran" className="btn btn-discret hidden !min-h-10 !px-2.5 sm:inline-flex">
              <IconePleinEcran />
            </button>
          </div>
        </div>
      </div>

      {erreurSon ? (
        <p role="alert" className="mt-2 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-ink">
          {erreurSon}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-ink-3">
        {avecNarration
          ? `Capsule narrée, ${mmss(total)}. Voix de synthèse (${narration!.voix}). Raccourcis : espace ou K pour lire, flèches pour changer de scène, M pour le son, C pour les sous-titres.`
          : `Capsule sous-titrée, ${mmss(total)}. La narration de cette capsule n'est pas encore disponible.`}
      </p>
      {transcription ? (
        <div className="apparition carte mt-3 p-4">
          <p className="mb-3 text-sm font-semibold text-ink">Transcription</p>
          <ol className="space-y-1 text-sm leading-relaxed text-ink-2">
            {minutage.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 w-5 shrink-0 font-mono text-xs text-ink-3">{i + 1}</span>
                <span>
                  {s.phrases.map((p, k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => aller(p.debut)}
                      className={`mr-1 rounded px-0.5 text-left transition-colors hover:bg-surface-2 hover:text-ink ${i === index && k === phrase && !repos ? "bg-brand-soft text-ink" : ""}`}
                    >
                      {typographie(p.texte)}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

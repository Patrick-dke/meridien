"use client";

import MiniSearch from "minisearch";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ressource } from "@/lib/chemin";
import type { DocumentRecherche } from "@/lib/recherche";
import { IconeRecherche } from "../ui/Icones";

type Resultat = { id: string; titre: string; type: string; url: string };

const sansAccents = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Recherche globale : bouton dans l'en-tête, raccourci Ctrl+K (ou ⌘K). */
export function Recherche() {
  const dialogue = useRef<HTMLDialogElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const index = useRef<MiniSearch<DocumentRecherche> | null>(null);
  const [requete, setRequete] = useState("");
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [actif, setActif] = useState(0);
  const [erreur, setErreur] = useState(false);
  const router = useRouter();

  const charger = useCallback(async () => {
    if (index.current) return;
    try {
      const docs: DocumentRecherche[] = await fetch(ressource("/recherche.json")).then((r) => r.json());
      const m = new MiniSearch<DocumentRecherche>({
        fields: ["titre", "texte"],
        storeFields: ["titre", "type", "url"],
        processTerm: (t) => sansAccents(t),
        searchOptions: { boost: { titre: 3 }, prefix: true, fuzzy: 0.2 },
      });
      m.addAll(docs);
      index.current = m;
      setErreur(false);
    } catch {
      setErreur(true);
    }
  }, []);

  const ouvrir = useCallback(() => {
    dialogue.current?.showModal();
    void charger();
    setTimeout(() => champ.current?.focus(), 0);
  }, [charger]);

  useEffect(() => {
    const raccourci = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ouvrir();
      }
    };
    window.addEventListener("keydown", raccourci);
    return () => window.removeEventListener("keydown", raccourci);
  }, [ouvrir]);

  const chercher = (texte: string) => {
    setRequete(texte);
    setActif(0);
    if (!index.current || texte.trim().length < 2) {
      setResultats([]);
      return;
    }
    setResultats(index.current.search(texte).slice(0, 12) as unknown as Resultat[]);
  };

  const aller = (r: Resultat) => {
    dialogue.current?.close();
    setRequete("");
    setResultats([]);
    router.push(r.url);
  };

  return (
    <>
      <button
        type="button"
        onClick={ouvrir}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
      >
        <IconeRecherche className="size-[1.1rem]" />
        <span>Rechercher</span>
        <kbd className="hidden rounded border border-line px-1.5 font-mono text-xs text-ink-3 md:inline">Ctrl K</kbd>
      </button>
      <dialog
        ref={dialogue}
        aria-label="Recherche"
        onClick={(e) => {
          if (e.target === dialogue.current) dialogue.current?.close();
        }}
        className="m-auto mt-[10vh] w-[min(40rem,calc(100vw-1.5rem))] rounded-2xl border border-line-strong bg-overlay p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <IconeRecherche className="size-5 text-ink-3" />
          <input
            ref={champ}
            type="search"
            value={requete}
            onChange={(e) => chercher(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActif((a) => Math.min(a + 1, resultats.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActif((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && resultats[actif]) {
                e.preventDefault();
                aller(resultats[actif]);
              }
            }}
            placeholder="Un chapitre, un terme, un outil…"
            aria-label="Rechercher dans Méridien"
            aria-controls="resultats-recherche"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-ink-3"
          />
        </div>
        <ul id="resultats-recherche" aria-label="Résultats" className="max-h-[55vh] overflow-y-auto p-2">
          {erreur ? <li className="px-3 py-6 text-center text-sm text-warn">Index de recherche indisponible hors ligne.</li> : null}
          {!erreur && requete.trim().length >= 2 && resultats.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-3">Aucun résultat pour « {requete} ».</li>
          ) : null}
          {resultats.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                aria-current={i === actif ? "true" : undefined}
                onClick={() => aller(r)}
                onMouseEnter={() => setActif(i)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left ${i === actif ? "bg-brand-soft" : ""}`}
              >
                <span className="text-[0.95rem]">{r.titre}</span>
                <span className={`shrink-0 text-xs ${r.type === "Bientôt" ? "text-ink-3" : "text-brand"}`}>{r.type}</span>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}

"use client";

import { useSyncExternalStore } from "react";

function sAbonner(f: () => void) {
  window.addEventListener("popstate", f);
  window.addEventListener("hashchange", f);
  return () => {
    window.removeEventListener("popstate", f);
    window.removeEventListener("hashchange", f);
  };
}

/**
 * Paramètre de l'adresse (?nom=…), lu sans effet ni second rendu. `undefined` pendant le rendu statique et
 * l'hydratation, puis la valeur réelle (ou null).
 */
export function useParametreAdresse(nom: string): string | null | undefined {
  return useSyncExternalStore(
    sAbonner,
    () => new URLSearchParams(window.location.search).get(nom),
    () => undefined,
  );
}

/** Ancre de l'adresse (#…), sans le dièse ; `undefined` pendant le rendu statique. */
export function useAncre(): string | undefined {
  return useSyncExternalStore(
    sAbonner,
    () => window.location.hash.slice(1),
    () => undefined,
  );
}

"use client";

import { useId, useState } from "react";
import { IconeOeil } from "../ui/Icones";

export function Champ({
  libelle,
  aide,
  erreur,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { libelle: string; aide?: React.ReactNode; erreur?: string | null }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="etiquette">
        {libelle}
      </label>
      <input id={id} className="champ" aria-invalid={erreur ? true : undefined} aria-describedby={aide || erreur ? `${id}-aide` : undefined} {...props} />
      {aide || erreur ? (
        <p id={`${id}-aide`} className={`mt-1.5 text-sm ${erreur ? "text-bad" : "text-ink-3"}`}>
          {erreur ?? aide}
        </p>
      ) : null}
    </div>
  );
}

export function ChampMotDePasse(props: Omit<React.ComponentProps<typeof Champ>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Champ {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1.5 top-[1.85rem] grid size-10 place-items-center rounded-lg text-ink-3 hover:text-ink"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        <IconeOeil className="size-5" />
      </button>
    </div>
  );
}

export function Alerte({ ton = "erreur", children }: { ton?: "erreur" | "ok" | "info"; children: React.ReactNode }) {
  const classes = { erreur: "border-bad/50 bg-bad/10 text-ink", ok: "border-ok/50 bg-ok/10 text-ink", info: "border-cyan/40 bg-cyan/10 text-ink" }[ton];
  return (
    <div role={ton === "erreur" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${classes}`}>
      {children}
    </div>
  );
}

export function BoutonEnvoi({ enCours, children, className = "" }: { enCours: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={enCours} aria-busy={enCours} className={`btn btn-primaire btn-grand w-full ${className}`}>
      {enCours ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** Logo « G » de Google, utilisé conformément à ses consignes pour les boutons de connexion. */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function BoutonGoogle({ onClick, enCours }: { onClick: () => void; enCours: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={enCours} className="btn btn-grand w-full border border-line-strong bg-white !text-[#1f1f1f] hover:bg-[#f2f2f2]">
      <LogoGoogle />
      Continuer avec Google
    </button>
  );
}

export function Separateur() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-3" aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      ou
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Adresse de retour après connexion : seulement un chemin interne au site. */
export function suiteSure(brut: string | null, defaut = "/compte/") {
  return brut && /^\/(?!\/)[\w\-./?=&%#]*$/.test(brut) ? brut : defaut;
}

export function CadreCompte({ surtitre, titre, children, large = false }: { surtitre: string; titre: string; children: React.ReactNode; large?: boolean }) {
  return (
    <div className={`mx-auto px-4 py-8 sm:px-6 sm:py-12 ${large ? "max-w-4xl" : "max-w-md"}`}>
      <p className="text-sm font-medium text-cyan">{surtitre}</p>
      <h1 className="mb-6 mt-1 text-3xl font-semibold text-ink sm:text-4xl">{titre}</h1>
      {children}
    </div>
  );
}

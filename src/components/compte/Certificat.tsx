"use client";

import { useEffect, useState } from "react";
import { useParametreAdresse } from "@/lib/adresse";
import { lirePublic } from "@/lib/firebase/client";
import { Logo } from "../shell/Logo";

type Certificat = { numero: string; nom: string; titreModule: string; date: string; scoreMoyen: number; chapitres: number };

/** Certificat interne Méridien : vérifiable par son numéro, imprimable. Ce n'est pas un diplôme d'État. */
export function VoirCertificat() {
  const n = useParametreAdresse("n");
  const valide = typeof n === "string" && /^MER-[A-F0-9]{10}$/.test(n);
  const [lu, setLu] = useState<{ n: string; c: Certificat | null } | null>(null);
  useEffect(() => {
    if (!valide) return;
    lirePublic<Certificat>(`certificats/${n}`).then(
      (c) => setLu({ n, c }),
      () => setLu({ n, c: null }),
    );
  }, [n, valide]);
  const c = n === undefined ? undefined : !valide ? null : lu?.n === n ? lu.c : undefined;
  if (c === undefined) return <div className="carte h-72 animate-pulse" aria-busy="true" />;
  if (c === null) return <p className="carte p-6 text-ink-2">Aucun certificat ne correspond à ce numéro.</p>;
  return (
    <div>
      <div className="carte relative overflow-hidden p-8 text-center sm:p-12 print:border-black print:bg-white print:text-black">
        <div className="mx-auto w-fit">
          <Logo />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-ink-3">Certificat de réussite</p>
        <p className="mt-4 text-ink-2">Méridien atteste que</p>
        <p className="mt-2 text-3xl font-semibold text-ink">{c.nom || "Apprenant Méridien"}</p>
        <p className="mt-4 text-ink-2">a réussi l&apos;ensemble des évaluations du module</p>
        <p className="mt-2 text-2xl font-semibold text-brand">{c.titreModule}</p>
        <p className="mt-4 text-sm text-ink-2">
          {c.chapitres} chapitres · moyenne {Math.round(c.scoreMoyen * 100)} % · le {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p className="mt-6 font-mono text-xs text-ink-3">N° {c.numero}</p>
        <p className="mx-auto mt-4 max-w-md text-xs text-ink-3">Certificat interne de formation, délivré automatiquement après réussite des quiz. Il atteste un parcours pédagogique, pas une compétence professionnelle réglementée.</p>
      </div>
      <button type="button" className="btn btn-secondaire mt-4 print:hidden" onClick={() => window.print()}>
        Imprimer ou enregistrer en PDF
      </button>
    </div>
  );
}

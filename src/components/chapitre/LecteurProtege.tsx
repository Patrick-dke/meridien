"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ajouterScenes } from "@/content/scenes";
import type { Chapitre } from "@/content/schema";
import type { SceneFigure } from "@/lib/chartkit/types";
import { useSession } from "@/lib/compte/session";
import { obtenirDb } from "@/lib/firebase/client";
import type { Narration } from "@/lib/narration";
import { useDroits } from "@/lib/offre/commercial";
import { IconeCadenas } from "../ui/Icones";
import { construireEtapes } from "./EtapesChapitre";
import { LecteurChapitre } from "./LecteurChapitre";

type Etat = "chargement" | "verrouille" | "preparation" | "pret" | "erreur";
type DocNarration = Omit<Narration, "audio"> & { audio?: string; morceaux?: number; type?: string };

/** Reconstitue la piste audio (MP3 en base64, éventuellement en morceaux) en adresse locale lisible par le lecteur. */
async function narrationDepuis(d: DocNarration, lireMorceau: (i: number) => Promise<string>): Promise<Narration> {
  const b64 = d.audio ?? (await Promise.all(Array.from({ length: d.morceaux ?? 0 }, (_, i) => lireMorceau(i)))).join("");
  const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([octets], { type: d.type ?? "audio/mpeg" }));
  return { slug: d.slug, voix: d.voix, empreinte: d.empreinte, duree: d.duree, scenes: d.scenes, audio: url };
}

/**
 * Chapitre payant. La page publiée ne contient que son titre : le contenu est lu dans la base, qui ne le sert
 * qu'à un compte ayant un droit d'accès actif sur le module (règles Firestore, vérifiées côté serveur).
 */
export function LecteurProtege({ slug, module, titreModule, suivant }: { slug: string; module: string; titreModule: string; suivant: { slug: string; titre: string } | null }) {
  const s = useSession(true);
  const droits = useDroits();
  const [etatLu, setEtat] = useState<Etat>("chargement");
  const [contenu, setContenu] = useState<{ c: Chapitre; narration: Narration | null } | null>(null);
  const uid = s.utilisateur?.uid;

  const etat: Etat = s.etat === "deconnecte" ? "verrouille" : etatLu;

  useEffect(() => {
    if (!uid) return;
    let actif = true;
    let urlAudio: string | null = null;
    void (async () => {
      const [db, m] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
      try {
        const d = await m.getDoc(m.doc(db, "contenus", slug));
        if (!actif) return;
        if (!d.exists()) return setEtat("preparation");
        // Stockés en texte JSON : Firestore refuse les tableaux imbriqués (paires, tableaux de cours).
        const chapitre = JSON.parse(d.get("chapitreJson")) as Chapitre;
        ajouterScenes(JSON.parse(d.get("scenesJson") ?? "{}") as Record<string, SceneFigure>);
        let narration: Narration | null = null;
        try {
          const n = await m.getDoc(m.doc(db, "narrations", slug));
          if (n.exists()) {
            narration = await narrationDepuis(n.data() as DocNarration, async (i) => (await m.getDoc(m.doc(db, "narrations", slug, "morceaux", String(i)))).get("donnees") as string);
            urlAudio = narration.audio;
          }
        } catch {
          // Sans narration, la capsule se lit en mode texte, au rythme des sous-titres.
        }
        if (!actif) return;
        setContenu({ c: chapitre, narration });
        setEtat("pret");
      } catch (e) {
        if (!actif) return;
        // Un document absent est aussi refusé par les règles : on distingue grâce aux droits de l'utilisateur.
        setEtat((e as { code?: string }).code === "permission-denied" ? "verrouille" : "erreur");
      }
    })();
    return () => {
      actif = false;
      if (urlAudio) URL.revokeObjectURL(urlAudio);
    };
  }, [uid, slug]);

  const etapes = useMemo(() => (contenu ? construireEtapes({ c: contenu.c, narration: contenu.narration, suivant }) : null), [contenu, suivant]);

  if (etat === "pret" && etapes) return <LecteurChapitre slug={slug} etapes={etapes} />;
  if (etat === "chargement" || (etat === "verrouille" && s.etat === "connecte" && !droits.pret))
    return (
      <div className="carte grid min-h-64 place-items-center p-6" role="status">
        <span className="size-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" aria-hidden="true" />
        <span className="sr-only">Chargement du chapitre…</span>
      </div>
    );
  if (etat === "verrouille" && droits.modules.has(module)) return <Message titre="Chapitre en préparation">Ce chapitre est en cours de publication. Reviens dans quelques heures.</Message>;
  if (etat === "preparation") return <Message titre="Chapitre en préparation">Ce chapitre est en cours de publication. Reviens dans quelques heures.</Message>;
  if (etat === "erreur") return <Message titre="Chargement impossible">Vérifie ta connexion à Internet, puis recharge la page.</Message>;
  return (
    <div className="carte p-6 text-center sm:p-8">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
        <IconeCadenas className="size-6" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-ink">Ce chapitre fait partie du module « {titreModule} »</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-2">Débloque le module pour accéder à ses capsules, cours, exercices et quiz. Paiement unique par Orange Money ou MTN MoMo.</p>
      <Link href={`/formations/${module}/`} className="btn btn-primaire btn-grand mt-5">
        Voir le module et son prix
      </Link>
      {s.etat !== "connecte" ? (
        <p className="mt-3 text-sm text-ink-2">
          Déjà acheté ?{" "}
          <Link href={`/connexion/?suite=${encodeURIComponent(`/chapitre/${slug}/`)}`} className="font-semibold text-brand underline">
            Connecte-toi
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function Message({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="carte p-6 text-center">
      <h2 className="text-xl font-semibold text-ink">{titre}</h2>
      <p className="mt-2 text-ink-2">{children}</p>
    </div>
  );
}

import type { Metadata } from "next";
import { Commencer } from "@/components/profil/Commencer";

export const metadata: Metadata = {
  title: "Commencer",
  description: "Trois questions pour trouver ton point de départ, sans compte et sans inscription.",
};

export default function PageCommencer() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Bienvenue</h1>
      <p className="mb-8 mt-2 max-w-2xl text-ink-2">
        Trois questions pour trouver ton point de départ. Pas de compte, pas d&apos;e-mail : tes réponses restent dans ce navigateur.
      </p>
      <Commencer />
    </div>
  );
}

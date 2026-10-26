import type { Metadata } from "next";
import { Parametres } from "@/components/profil/Parametres";

export const metadata: Metadata = {
  title: "Réglages et données",
  description: "Palette daltonien, taille du texte, mode léger, export et suppression de ta progression.",
};

export default function PageParametres() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-ink">Réglages et données</h1>
      <Parametres />
    </div>
  );
}

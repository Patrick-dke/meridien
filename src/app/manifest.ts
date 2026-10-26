import type { MetadataRoute } from "next";
import { basePath } from "@/lib/chemin";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Méridien — Académie de trading",
    short_name: "Méridien",
    description: "Apprendre à lire les marchés avec méthode, sans argent réel et sans promesse de gains.",
    lang: "fr",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#0a0d13",
    theme_color: "#0a0d13",
    categories: ["education", "finance"],
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${basePath}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

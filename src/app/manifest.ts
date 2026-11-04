import type { MetadataRoute } from "next";
import { basePath } from "@/lib/chemin";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Méridien — Académie de trading",
    short_name: "Méridien",
    description: "Formation au trading en huit modules. Introduction gratuite, modules suivants à l'unité.",
    lang: "fr",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#f4f2ed",
    theme_color: "#f4f2ed",
    categories: ["education", "finance"],
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${basePath}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

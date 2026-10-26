import type { MetadataRoute } from "next";
import { academies, chapitresPublies } from "@/content";
import { glossaire } from "@/content/glossaire";
import { basePath, urlSite } from "@/lib/chemin";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (chemin: string) => `${urlSite}${basePath}${chemin}`;
  const pages = [
    "/",
    "/commencer/",
    "/parcours/premiers-pas/",
    "/academies/",
    "/outils/",
    "/glossaire/",
    "/methode/",
    "/legal/risques/",
    "/legal/confidentialite/",
    "/legal/mentions/",
    ...academies.map((a) => `/academies/${a.slug}/`),
    ...academies.flatMap((a) => a.modules.map((m) => `/academies/${a.slug}/${m.slug}/`)),
    ...chapitresPublies.map((c) => `/chapitre/${c.slug}/`),
    ...glossaire.map((t) => `/glossaire/${t.slug}/`),
  ];
  return pages.map((p) => ({ url: url(p) }));
}

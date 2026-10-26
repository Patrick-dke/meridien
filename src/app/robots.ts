import type { MetadataRoute } from "next";
import { basePath, urlSite } from "@/lib/chemin";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [`${basePath}/hors-ligne/`] },
    sitemap: `${urlSite}${basePath}/sitemap.xml`,
  };
}

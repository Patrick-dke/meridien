import { documentsRecherche } from "@/lib/recherche";

export const dynamic = "force-static";

/** Index de recherche généré une fois à la construction du site. */
export function GET() {
  return Response.json(documentsRecherche());
}

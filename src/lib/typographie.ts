/**
 * Typographie française : espace fine insécable avant ; ! ?, espace insécable avant : et à l'intérieur
 * des guillemets. Évite qu'un signe se retrouve seul en début de ligne.
 */
export function typographie(texte: string) {
  return texte
    .replace(/ ([;!?])/g, " $1")
    .replace(/ ([:»])/g, " $1")
    .replace(/« /g, "« ");
}

export type Segment =
  | { type: "texte"; valeur: string }
  | { type: "gras"; valeur: string }
  | { type: "terme"; slug: string; valeur: string };

/**
 * Découpe un texte de cours : **gras**, [[slug]] et [[slug|texte affiché]].
 * Exportée pour les tests et pour vérifier que chaque terme cité existe dans le glossaire.
 */
export function decouper(texte: string): Segment[] {
  const segments: Segment[] = [];
  const motif = /\*\*(.+?)\*\*|\[\[([a-z0-9-]+)(?:\|(.+?))?\]\]/g;
  let dernier = 0;
  for (const m of texte.matchAll(motif)) {
    if (m.index > dernier) segments.push({ type: "texte", valeur: texte.slice(dernier, m.index) });
    if (m[1] !== undefined) segments.push({ type: "gras", valeur: m[1] });
    else segments.push({ type: "terme", slug: m[2], valeur: m[3] ?? "" });
    dernier = m.index + m[0].length;
  }
  if (dernier < texte.length) segments.push({ type: "texte", valeur: texte.slice(dernier) });
  return segments;
}

/** Version texte brut (transcriptions, recherche, attributs aria). */
export function texteBrut(texte: string) {
  return decouper(texte)
    .map((s) => s.valeur || (s.type === "terme" ? s.slug.replace(/-/g, " ") : ""))
    .join("");
}

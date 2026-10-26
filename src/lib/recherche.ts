import { academies, chapitresPublies, estPublie } from "@/content";
import { glossaire } from "@/content/glossaire";
import { texteBrut } from "./typographie";

export type DocumentRecherche = { id: string; type: string; titre: string; texte: string; url: string };

/** Index de recherche : chapitres, chapitres à venir, glossaire, outils et pages utiles. */
export function documentsRecherche(): DocumentRecherche[] {
  const docs: DocumentRecherche[] = [];
  for (const c of chapitresPublies) {
    docs.push({
      id: `c:${c.slug}`,
      type: "Chapitre",
      titre: c.titre,
      texte: texteBrut([c.sousTitre, c.intro, ...c.objectifs, ...c.resume].join(" ")),
      url: `/chapitre/${c.slug}/`,
    });
  }
  for (const a of academies) {
    for (const m of a.modules) {
      for (const c of m.chapitres) {
        if (estPublie(c.slug)) continue;
        docs.push({ id: `b:${c.slug}`, type: "Bientôt", titre: c.titre, texte: `${a.titre} ${m.titre}`, url: `/academies/${a.slug}/${m.slug}/` });
      }
    }
  }
  for (const t of glossaire) {
    docs.push({ id: `t:${t.slug}`, type: "Glossaire", titre: t.terme, texte: [...t.synonymes, t.court].join(" "), url: `/glossaire/${t.slug}/` });
  }
  docs.push(
    { id: "o:position", type: "Outil", titre: "Calculateur de taille de position", texte: "risque lots actions stop", url: "/outils/#position" },
    { id: "o:rr", type: "Outil", titre: "Calculateur de rendement/risque", texte: "ratio seuil de rentabilité frais", url: "/outils/#rendement-risque" },
    { id: "o:pips", type: "Outil", titre: "Calculateur de pips", texte: "valeur du pip lot devise conversion", url: "/outils/#pips" },
    { id: "o:esperance", type: "Outil", titre: "Espérance et séries de pertes", texte: "taux de réussite probabilité série", url: "/outils/#esperance" },
    { id: "p:parcours", type: "Page", titre: "Parcours « Premiers pas »", texte: "débuter les 14 chapitres", url: "/parcours/premiers-pas/" },
    { id: "p:tdb", type: "Page", titre: "Tableau de bord", texte: "progression recommandations concepts", url: "/tableau-de-bord/" },
    { id: "p:methode", type: "Page", titre: "Méthode et badges de fiabilité", texte: "fait établi interprétation d'école hypothèse", url: "/methode/" },
    { id: "p:reglages", type: "Page", titre: "Réglages et données", texte: "daltonien mode léger export suppression", url: "/parametres/" },
  );
  return docs;
}

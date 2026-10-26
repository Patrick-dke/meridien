import type { Motif } from "@/content/identite";
import { typographie } from "@/lib/typographie";
import { Carte } from "../ui/Carte";
import { Vignette } from "../ui/Vignette";
import { AvancementEnsemble } from "./AvancementEnsemble";

/**
 * Carte d'académie ou de module, rendue côté serveur : la vignette et les textes arrivent tout faits ; seul
 * l'avancement (lu dans le navigateur) est un petit composant client.
 */
export function CarteEnsemble({
  href,
  surtitre,
  titre,
  description,
  motif,
  teinte,
  publies,
  total,
  details,
  ecole,
}: {
  href: string;
  surtitre: string;
  titre: string;
  description: string;
  motif: Motif;
  teinte: string;
  publies: string[];
  total: number;
  details: string[];
  ecole?: boolean;
}) {
  return (
    <Carte href={href} className="group flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-line">
        <Vignette motif={motif} teinte={teinte} graine={href} className="aspect-[16/7] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-lg bg-bg/70 px-2 py-0.5 font-mono text-xs backdrop-blur" style={{ color: teinte }}>
          {surtitre}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-ink">{typographie(titre)}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-2">{typographie(description)}</p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-3">
          {details.map((d) => (
            <span key={d}>{d}</span>
          ))}
          {ecole ? <span className="text-warn">Interprétation d&apos;école</span> : null}
        </p>
        <AvancementEnsemble titre={titre} publies={publies} total={total} />
      </div>
    </Carte>
  );
}

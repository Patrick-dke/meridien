import type { Bloc, Fiabilite } from "@/content/schema";
import { typographie } from "@/lib/typographie";
import { Figure } from "../figures/Figure";
import { CalculateurIntegre } from "../outils/CalculateurIntegre";
import { BadgeFiabilite } from "../ui/BadgeFiabilite";
import { TexteRiche } from "./TexteRiche";

const encadres = {
  retenir: { titre: "À retenir", classes: "border-brand/50 bg-brand-soft" },
  attention: { titre: "Attention", classes: "border-warn/50 bg-warn/10" },
  risque: { titre: "Risque", classes: "border-bad/50 bg-bad/10" },
  ecole: { titre: "Interprétation d'école", classes: "border-warn/50 bg-warn/5" },
  exemple: { titre: "Exemple", classes: "border-line-strong bg-surface" },
} as const;

function AvecBadge({ fiabilite, children }: { fiabilite?: Fiabilite; children: React.ReactNode }) {
  if (!fiabilite) return <>{children}</>;
  return (
    <div className="space-y-2">
      <BadgeFiabilite fiabilite={fiabilite} />
      {children}
    </div>
  );
}

export function RenduBloc({ bloc }: { bloc: Bloc }) {
  switch (bloc.type) {
    case "p":
      return (
        <AvecBadge fiabilite={bloc.fiabilite}>
          <p>
            <TexteRiche texte={bloc.texte} />
          </p>
        </AvecBadge>
      );
    case "liste": {
      const Liste = bloc.ordonnee ? "ol" : "ul";
      return (
        <AvecBadge fiabilite={bloc.fiabilite}>
          <Liste>
            {bloc.items.map((item, i) => (
              <li key={i}>
                <TexteRiche texte={item} />
              </li>
            ))}
          </Liste>
        </AvecBadge>
      );
    }
    case "encadre": {
      const e = encadres[bloc.variante];
      return (
        <aside className={`rounded-xl border-l-4 p-4 ${e.classes}`}>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{typographie(bloc.titre ?? e.titre)}</p>
            {bloc.fiabilite ? <BadgeFiabilite fiabilite={bloc.fiabilite} /> : null}
          </div>
          <p className="text-[0.98rem] text-ink">
            <TexteRiche texte={bloc.texte} />
          </p>
        </aside>
      );
    }
    case "formule":
      return (
        <AvecBadge fiabilite={bloc.fiabilite}>
          <div className="rounded-xl border border-line bg-chart px-4 py-3">
            <p className="font-mono text-[0.95rem] text-ink tabular">{typographie(bloc.texte)}</p>
            {bloc.legende ? <p className="mt-1 text-sm text-ink-2">{typographie(bloc.legende)}</p> : null}
          </div>
        </AvecBadge>
      );
    case "tableau":
      return (
        <AvecBadge fiabilite={bloc.fiabilite}>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[28rem] border-collapse text-left text-[0.95rem]">
              {bloc.legende ? <caption className="px-4 pt-3 text-left text-sm text-ink-2">{typographie(bloc.legende)}</caption> : null}
              <thead>
                <tr className="border-b border-line">
                  {bloc.entetes.map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 font-semibold text-ink-2">
                      {typographie(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloc.lignes.map((ligne, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {ligne.map((cellule, j) => (
                      <td key={j} className="px-4 py-2.5 align-top tabular">
                        <TexteRiche texte={cellule} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AvecBadge>
      );
    case "figure":
      return (
        <AvecBadge fiabilite={bloc.fiabilite}>
          <Figure scene={bloc.scene} legende={bloc.legende} />
        </AvecBadge>
      );
    case "outil":
      return <CalculateurIntegre outil={bloc.outil} />;
  }
}

export function RenduBlocs({ blocs }: { blocs: Bloc[] }) {
  return (
    <div className="prose-cours">
      {blocs.map((b, i) => (
        <RenduBloc key={i} bloc={b} />
      ))}
    </div>
  );
}

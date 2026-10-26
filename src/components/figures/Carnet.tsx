import { formatPrix } from "@/lib/chartkit/outils";
import type { LigneCarnet, SceneCarnet } from "@/lib/chartkit/types";

const L = 480;
const LIGNE = 26;

/** Exécute un ordre au marché contre le carnet : quantité prise à chaque niveau et prix moyen. */
export function executerOrdre(niveaux: LigneCarnet[], quantite: number) {
  let reste = quantite;
  let cout = 0;
  const pris: number[] = [];
  for (const n of niveaux) {
    const q = Math.min(reste, n.quantite);
    pris.push(q);
    cout += q * n.prix;
    reste -= q;
  }
  const rempli = quantite - reste;
  return { pris, rempli, prixMoyen: rempli > 0 ? cout / rempli : Number.NaN };
}

/** Carnet d'ordres : vendeurs en haut, acheteurs en bas, spread au milieu. */
export function Carnet({ scene, etape = Number.POSITIVE_INFINITY }: { scene: SceneCarnet; etape?: number }) {
  const ventes = [...scene.ventes].reverse(); // le plus cher en haut
  const max = Math.max(...scene.ventes.map((v) => v.quantite), ...scene.achats.map((a) => a.quantite));
  const largeurBarre = (q: number) => (q / max) * 150;
  const meilleurAsk = scene.ventes[0].prix;
  const meilleurBid = scene.achats[0].prix;
  const ordre = scene.ordreMarche && etape >= scene.ordreMarche.etape ? scene.ordreMarche : null;
  const execution = ordre
    ? executerOrdre(ordre.sens === "achat" ? scene.ventes : scene.achats, ordre.quantite)
    : null;

  const hauteurVentes = ventes.length * LIGNE;
  const ySpread = 34 + hauteurVentes;
  const yAchats = ySpread + 34;
  const H = yAchats + scene.achats.length * LIGNE + (execution ? 62 : 16);
  const fmt = (p: number) => formatPrix(p, scene.decimales);

  return (
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={scene.description} className="h-auto w-full">
      <title>{scene.description}</title>
      <rect x={0} y={0} width={L} height={H} rx={12} fill="var(--chart)" />
      <text x={150} y={22} textAnchor="end" fontSize={12.5} fill="var(--ink-3)">Acheteurs (bid)</text>
      <text x={240} y={22} textAnchor="middle" fontSize={12.5} fill="var(--ink-3)">Prix</text>
      <text x={330} y={22} fontSize={12.5} fill="var(--ink-3)">Vendeurs (ask)</text>

      {ventes.map((v, i) => {
        const y = 30 + i * LIGNE;
        const indexReel = scene.ventes.length - 1 - i;
        const pris = execution && ordre?.sens === "achat" ? execution.pris[indexReel] : 0;
        return (
          <g key={`v${v.prix}`}>
            <rect x={290} y={y + 3} width={largeurBarre(v.quantite)} height={LIGNE - 6} rx={3} fill="var(--bear)" fillOpacity={0.35} />
            {pris > 0 ? (
              <rect x={290} y={y + 3} width={largeurBarre(pris)} height={LIGNE - 6} rx={3} fill="var(--brand)" fillOpacity={0.85} className="apparition" />
            ) : null}
            <text x={240} y={y + 17} textAnchor="middle" fontSize={13} fill="var(--bear)" className="font-mono tabular">{fmt(v.prix)}</text>
            <text x={296 + largeurBarre(v.quantite)} y={y + 17} fontSize={12} fill="var(--ink-2)" className="tabular">{v.quantite}</text>
          </g>
        );
      })}

      <rect x={170} y={ySpread - 2} width={140} height={28} rx={6} fill="var(--brand-soft)" />
      <text x={240} y={ySpread + 16} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--brand)" className="tabular">
        Spread : {fmt(meilleurAsk - meilleurBid)}
      </text>

      {scene.achats.map((a, i) => {
        const y = yAchats + i * LIGNE;
        const pris = execution && ordre?.sens === "vente" ? execution.pris[i] : 0;
        return (
          <g key={`a${a.prix}`}>
            <rect x={190 - largeurBarre(a.quantite)} y={y + 3} width={largeurBarre(a.quantite)} height={LIGNE - 6} rx={3} fill="var(--bull)" fillOpacity={0.35} />
            {pris > 0 ? (
              <rect x={190 - largeurBarre(pris)} y={y + 3} width={largeurBarre(pris)} height={LIGNE - 6} rx={3} fill="var(--brand)" fillOpacity={0.85} className="apparition" />
            ) : null}
            <text x={240} y={y + 17} textAnchor="middle" fontSize={13} fill="var(--bull)" className="font-mono tabular">{fmt(a.prix)}</text>
            <text x={184 - largeurBarre(a.quantite)} y={y + 17} textAnchor="end" fontSize={12} fill="var(--ink-2)" className="tabular">{a.quantite}</text>
          </g>
        );
      })}

      {execution && ordre ? (
        <g className="apparition">
          <text x={24} y={H - 38} fontSize={13} fontWeight={600} fill="var(--brand)">
            {ordre.sens === "achat" ? "Achat" : "Vente"} au marché de {ordre.quantite} : prix moyen {fmt(execution.prixMoyen)}
          </text>
          <text x={24} y={H - 16} fontSize={12.5} fill="var(--ink-2)">
            Meilleur prix affiché : {fmt(ordre.sens === "achat" ? meilleurAsk : meilleurBid)} · écart (slippage) :{" "}
            {fmt(Math.abs(execution.prixMoyen - (ordre.sens === "achat" ? meilleurAsk : meilleurBid)))}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

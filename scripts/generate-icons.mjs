// Génère les icônes PNG de l'application installable à partir du logo SVG.
// Usage : npm run icons
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const logo = readFileSync("src/app/icon.svg", "utf8");
mkdirSync("public/icons", { recursive: true });

function rendre(svg, taille, fichier) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: taille } }).render().asPng();
  writeFileSync(`public/icons/${fichier}`, png);
  console.log(`public/icons/${fichier} (${taille} px)`);
}

rendre(logo, 192, "icon-192.png");
rendre(logo, 512, "icon-512.png");
rendre(logo, 180, "apple-touch-icon.png");

// Version « maskable » : le logo occupe la zone sûre (80 %) sur un fond plein, sans coins arrondis.
const interieur = logo.replace(/<svg[^>]*>|<\/svg>/g, "").replace('rx="9" ', "");
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#6553f5"/><g transform="translate(4 4)">${interieur}</g></svg>`;
rendre(maskable, 512, "icon-maskable-512.png");

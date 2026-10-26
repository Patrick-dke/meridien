// Mesure des performances du site exporté (out/, construit sans sous-chemin) :
// - Lighthouse sur 5 pages, profils mobile (téléphone limité en réseau et processeur) et ordinateur ;
// - fluidité sur un processeur ralenti 4× (téléphone de milieu de gamme) : images par seconde
//   pendant la lecture d'une capsule et sur l'accueil, délai d'un changement de page et d'étape.
// Usage : LIGHTHOUSE_DIR=<dossier contenant node_modules/lighthouse> node scripts/mesurer.mjs <libellé>
// Résultats : docs/mesures/<libellé>.json et docs/mesures/<libellé>.md
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, devices } from "@playwright/test";

const libelle = process.argv[2] ?? "mesure";
const port = 4180;
const base = `http://localhost:${port}`;
// MESURES_REPETEES=3 : chaque page est mesurée trois fois et la médiane de chaque indicateur est retenue.
const repetitions = Number(process.env.MESURES_REPETEES ?? 1);
const mediane = (v) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];
const pages = ["/", "/academies/", "/parcours/premiers-pas/", "/chapitre/quest-ce-que-le-trading/", "/tableau-de-bord/"];

const dossierLh = process.env.LIGHTHOUSE_DIR;
if (!dossierLh) throw new Error("LIGHTHOUSE_DIR doit indiquer le dossier où lighthouse est installé.");
const importer = (chemin) => import(pathToFileURL(join(dossierLh, "node_modules", chemin)).href);
const { default: lighthouse } = await importer("lighthouse/core/index.js");
const { default: configOrdinateur } = await importer("lighthouse/core/config/desktop-config.js");

const serveur = spawn(process.execPath, ["scripts/serve-out.mjs", String(port)], {
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "" },
  stdio: ["ignore", "pipe", "inherit"],
});
await new Promise((ok) => serveur.stdout.on("data", (d) => String(d).includes("servi sur") && ok()));

const arrondi = (x, n = 0) => Math.round(x * 10 ** n) / 10 ** n;
const resultats = { libelle, date: new Date().toISOString(), lighthouse: [], fluidite: {} };

try {
  // 1. Lighthouse, branché sur un Chromium lancé par Playwright (port de débogage fixe).
  const portDebogage = 9333;
  const chrome = await chromium.launch({ args: [`--remote-debugging-port=${portDebogage}`] });
  for (const profil of ["mobile", "ordinateur"]) {
    for (const chemin of pages) {
      const options = { port: portDebogage, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices"] };
      const essais = [];
      for (let k = 0; k < repetitions; k++) {
        const { lhr } = await lighthouse(base + chemin, options, profil === "ordinateur" ? configOrdinateur : undefined);
        const a = lhr.audits;
        const scripts = a["resource-summary"].details.items.find((i) => i.resourceType === "script");
        essais.push({
          performance: lhr.categories.performance.score * 100,
          accessibilite: lhr.categories.accessibility.score * 100,
          bonnesPratiques: lhr.categories["best-practices"].score * 100,
          fcp: a["first-contentful-paint"].numericValue,
          lcp: a["largest-contentful-paint"].numericValue,
          tbt: a["total-blocking-time"].numericValue,
          cls: a["cumulative-layout-shift"].numericValue,
          si: a["speed-index"].numericValue,
          poidsKo: a["total-byte-weight"].numericValue / 1024,
          jsKo: (scripts?.transferSize ?? 0) / 1024,
        });
      }
      const m = (cle, n = 0) => arrondi(mediane(essais.map((e) => e[cle])), n);
      resultats.lighthouse.push({
        profil,
        chemin,
        performance: m("performance"),
        accessibilite: m("accessibilite"),
        bonnesPratiques: m("bonnesPratiques"),
        fcp: m("fcp"),
        lcp: m("lcp"),
        tbt: m("tbt"),
        cls: m("cls", 3),
        si: m("si"),
        poidsKo: m("poidsKo"),
        jsKo: m("jsKo"),
      });
      console.log(`lighthouse ${profil} ${chemin} : ${resultats.lighthouse.at(-1).performance}`);
    }
  }
  await chrome.close();

  // 2. Fluidité sur processeur ralenti 4×
  const navigateur = await chromium.launch();
  const contexte = await navigateur.newContext({ ...devices["Pixel 7"], locale: "fr-FR" });
  const page = await contexte.newPage();
  const cdp = await contexte.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const images = (duree) =>
    page.evaluate(
      (duree) =>
        new Promise((ok) => {
          const t = [];
          let longues = 0;
          const obs = new PerformanceObserver((l) => (longues += l.getEntries().length));
          try {
            obs.observe({ type: "longtask", buffered: false });
          } catch {}
          const debut = performance.now();
          const boucle = (now) => {
            t.push(now);
            if (now - debut < duree) requestAnimationFrame(boucle);
            else {
              obs.disconnect();
              const ecarts = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b);
              ok({
                ips: ((t.length - 1) * 1000) / (t.at(-1) - t[0]),
                p95: ecarts[Math.floor(ecarts.length * 0.95)] ?? 0,
                imagesLentes: ecarts.filter((e) => e > 50).length,
                tachesLongues: longues,
              });
            }
          };
          requestAnimationFrame(boucle);
        }),
      duree,
    );
  const resume = (m) => ({ ips: arrondi(m.ips, 1), p95ms: arrondi(m.p95, 1), imagesLentes: m.imagesLentes, tachesLongues: m.tachesLongues });

  // Blocage réel du fil principal : somme des dépassements de 50 ms des tâches longues, 5 s après le chargement.
  resultats.fluidite.blocageReel = {};
  for (const chemin of pages) {
    const c = await navigateur.newContext({ ...devices["Pixel 7"], locale: "fr-FR" });
    const p = await c.newPage();
    await (await c.newCDPSession(p)).send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await p.addInitScript(() => {
      window.__taches = [];
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__taches.push(e.duration))).observe({ type: "longtask", buffered: true });
    });
    await p.goto(base + chemin, { waitUntil: "load" });
    await p.waitForTimeout(5000);
    resultats.fluidite.blocageReel[chemin] = await p.evaluate(() => Math.round(window.__taches.reduce((a, d) => a + Math.max(0, d - 50), 0)));
    await c.close();
  }

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  resultats.fluidite.accueil = resume(await images(4000));

  await page.goto(`${base}/chapitre/stop-loss-take-profit/#etape-capsule`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Lire la capsule" }).first().click();
  resultats.fluidite.capsule = resume(await images(5000));

  // Délai ressenti, mesuré dans la page : du clic à la première image affichée après le changement
  // (les attentes de Playwright avant un clic ne sont pas comptées).
  const delaiDansLaPage = (selecteurClic, condition, texte = "") =>
    page.evaluate(
      ({ selecteurClic, condition, texte }) =>
        new Promise((ok) => {
          const cible = [...document.querySelectorAll(selecteurClic)].filter((el) => el.textContent.includes(texte)).at(-1);
          const t0 = performance.now();
          cible.click();
          const verifier = () => {
            if (new Function(`return ${condition}`)()) requestAnimationFrame(() => requestAnimationFrame(() => ok(Math.round(performance.now() - t0))));
            else setTimeout(verifier, 5);
          };
          verifier();
        }),
      { selecteurClic, condition, texte },
    );
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  resultats.fluidite.navigationMs = await delaiDansLaPage(
    'nav[aria-label="Navigation principale"] a[href$="/outils/"]',
    'location.pathname.endsWith("/outils/") && Boolean(document.querySelector("h1")?.textContent.toLowerCase().includes("outils"))',
  );
  await page.goto(`${base}/chapitre/types-ordres/#etape-introduction`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  resultats.fluidite.etapeMs = await delaiDansLaPage("main button", '!document.querySelector("#etape-capsule")?.hidden', "Continuer");
  await navigateur.close();
} finally {
  serveur.kill();
}

mkdirSync("docs/mesures", { recursive: true });
writeFileSync(`docs/mesures/${libelle}.json`, JSON.stringify(resultats, null, 2) + "\n");
const lignes = [
  `# Mesures « ${libelle} » (${resultats.date.slice(0, 10)})`,
  "",
  `Lighthouse 12, ${repetitions > 1 ? `médiane de ${repetitions} exécutions` : "une exécution"} par page. Mobile : réseau et processeur limités (profil par défaut). Ordinateur : profil desktop.`,
  "",
  "| Profil | Page | Perf. | Access. | LCP (ms) | TBT (ms) | CLS | Poids (Ko) | JS (Ko) |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...resultats.lighthouse.map((r) => `| ${r.profil} | ${r.chemin} | ${r.performance} | ${r.accessibilite} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.poidsKo} | ${r.jsKo} |`),
  "",
  "Fluidité, processeur ralenti 4× (Pixel 7 émulé) :",
  "",
  "| Mesure | Images/s | p95 entre images (ms) | Images > 50 ms | Tâches longues |",
  "| --- | --- | --- | --- | --- |",
  ...["accueil", "capsule"].map((k) => {
    const m = resultats.fluidite[k];
    return `| ${k} | ${m.ips} | ${m.p95ms} | ${m.imagesLentes} | ${m.tachesLongues} |`;
  }),
  "",
  `Changement de page (accueil → outils) : ${resultats.fluidite.navigationMs} ms. Changement d'étape dans un chapitre : ${resultats.fluidite.etapeMs} ms (du clic à l'image affichée).`,
  "",
  "Blocage réel du fil principal (tâches longues, 5 s après le chargement, processeur ralenti 4×) :",
  "",
  "| Page | Blocage (ms) |",
  "| --- | --- |",
  ...Object.entries(resultats.fluidite.blocageReel).map(([c, v]) => `| ${c} | ${v} |`),
  "",
];
writeFileSync(`docs/mesures/${libelle}.md`, lignes.join("\n"));
console.log(lignes.join("\n"));

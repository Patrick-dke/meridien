// Petit serveur statique pour tester le site exporté (dossier out/) comme en production.
// Usage : node scripts/serve-out.mjs [port]  —  respecte NEXT_PUBLIC_BASE_PATH.
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const port = Number(process.argv[2] ?? 4173);
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// OUT_DIR permet de servir un autre export (par exemple l'ancienne version, pour une mesure comparative).
const root = join(process.cwd(), process.env.OUT_DIR ?? "out");
const compresses = new Map();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".vtt": "text/vtt",
};

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404, { "content-type": types[".html"] });
    createReadStream(join(root, "404.html")).pipe(res);
    return;
  }
  const type = types[extname(file)] ?? "application/octet-stream";
  // Compression gzip des fichiers texte, comme GitHub Pages et Firebase : les mesures restent réalistes.
  if (/text|javascript|json|xml|svg|manifest/.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
    // La clé tient compte de la date du fichier : après une reconstruction, rien de périmé n'est servi.
    const cle = `${file}:${statSync(file).mtimeMs}`;
    if (!compresses.has(cle)) compresses.set(cle, gzipSync(readFileSync(file)));
    res.writeHead(200, { "content-type": type, "content-encoding": "gzip", vary: "accept-encoding" });
    res.end(compresses.get(cle));
    return;
  }
  // Requêtes partielles (Range) : indispensables pour avancer ou reculer dans une piste audio.
  const taille = statSync(file).size;
  const plage = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (plage) {
    const debut = plage[1] ? Number(plage[1]) : Math.max(0, taille - Number(plage[2]));
    const fin = plage[1] && plage[2] ? Math.min(Number(plage[2]), taille - 1) : taille - 1;
    res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${debut}-${fin}/${taille}`, "content-length": fin - debut + 1 });
    createReadStream(file, { start: debut, end: fin }).pipe(res);
    return;
  }
  res.writeHead(200, { "content-type": type, "accept-ranges": "bytes", "content-length": taille });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Site exporté servi sur http://localhost:${port}${base}/`));

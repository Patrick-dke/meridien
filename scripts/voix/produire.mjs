// Régénère la narration de toutes les capsules publiées : export des textes, synthèse, encodage, minutage.
// Prérequis (une fois) : ffmpeg (dans le PATH ou indiqué par la variable FFMPEG) et un environnement Python :
// .outils/voix2-env avec kokoro (voix ff_siwis, la voix retenue), ou .outils/voix-env avec piper-tts. Voir le README.
// Usage : npm run voix (capsules gratuites), npm run voix -- prives (capsules payantes),
// npm run voix -- prives price-action (un seul module payant).
// La variable VOIX choisit une autre voix : chemin d'un modèle Piper (.onnx). Changer de voix renarre toutes les capsules.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";

const executer = (commande, args) => {
  const r = spawnSync(commande, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const voix = process.env.VOIX ?? "kokoro:ff_siwis";
const kokoro = voix.startsWith("kokoro:");
const env = kokoro ? "voix2-env" : "voix-env";
const python = ["Scripts/python.exe", "bin/python"].map((p) => join(".outils", env, p)).find(existsSync);
if (!python) throw new Error(`Environnement Python introuvable : créez .outils/${env} et installez ${kokoro ? "kokoro" : "piper-tts"} (voir le README).`);
// Identifiant de la voix tel qu'il apparaît dans les minutages : une narration d'une autre voix est refaite.
const identifiant = kokoro ? voix.slice("kokoro:".length) : basename(voix, ".onnx");

// « npm run voix -- prives » : capsules des modules payants ; l'audio reste dans prive/, hors du site public.
const prives = process.argv.includes("prives");
const unModule = process.argv.slice(2).find((a) => a !== "prives");
const scripts = prives ? ".outils/voix/scripts-prives" : ".outils/voix/scripts";
const audio = prives ? "prive/audio" : "public/audio/capsules";
const minutage = prives ? "prive/narration" : "src/content/narration";

executer(process.execPath, [join("node_modules", "tsx", "dist", "cli.mjs"), "scripts/voix/exporter.ts", scripts, minutage, `--voix=${identifiant}`, ...(prives ? ["--prives"] : []), ...(unModule ? [`--module=${unModule}`] : [])]);
// Durée maximale : 90 s pour l'introduction gratuite, 2 minutes pour les capsules des modules.
executer(python, ["scripts/voix/synthetiser.py", scripts, voix, audio, minutage, process.env.FFMPEG ?? "ffmpeg", prives ? "120" : "90"]);

// Régénère la narration de toutes les capsules publiées : export des textes, synthèse, encodage, minutage.
// Prérequis (une fois) : environnement Python dans .outils/voix-env avec piper-tts, voix fr_FR-siwis-medium
// dans .outils/voix, et ffmpeg (dans le PATH ou indiqué par la variable FFMPEG). Voir le README.
// Usage : npm run voix (capsules gratuites) ou npm run voix -- prives (capsules payantes)
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const executer = (commande, args) => {
  const r = spawnSync(commande, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const python = ["Scripts/python.exe", "bin/python"].map((p) => join(".outils", "voix-env", p)).find(existsSync);
if (!python) throw new Error("Environnement Python introuvable : créez .outils/voix-env et installez piper-tts (voir le README).");

// « npm run voix -- prives » : capsules des modules payants ; l'audio reste dans prive/, hors du site public.
const prives = process.argv.includes("prives");
const scripts = prives ? ".outils/voix/scripts-prives" : ".outils/voix/scripts";
const audio = prives ? "prive/audio" : "public/audio/capsules";
const minutage = prives ? "prive/narration" : "src/content/narration";

executer(process.execPath, [join("node_modules", "tsx", "dist", "cli.mjs"), "scripts/voix/exporter.ts", scripts, minutage, ...(prives ? ["--prives"] : [])]);
executer(python, ["scripts/voix/synthetiser.py", scripts, ".outils/voix/fr_FR-siwis-medium.onnx", audio, minutage, process.env.FFMPEG ?? "ffmpeg"]);

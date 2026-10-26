"""Vérifie les narrations : flux audio, durée, volume et intelligibilité (retranscription Whisper).

Pour chaque capsule : le MP3 doit contenir un flux audio mono lisible, durer ce qu'annonce son minutage
(à 0,15 s près), avoir un volume normal (pas de saturation, pas de silence), et sa retranscription
automatique doit retrouver le texte affiché (taux d'erreur sur les mots, WER).

Usage : python verifier.py <dossier audio> <dossier minutage> <ffmpeg> [modèle whisper]
"""

import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path


def mesures(ffmpeg: Path, mp3: Path):
    sortie = subprocess.run([str(ffmpeg), "-hide_banner", "-i", str(mp3), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    # Premier flux audio : celui du fichier d'entrée (« Audio: mp3 (mp3float), 22050 Hz, mono, … »).
    flux = re.search(r"Audio: (\w+)[^,]*, (\d+) Hz, (\w+)", sortie)
    duree = re.search(r"Duration: (\d+):(\d+):([\d.]+)", sortie)
    moyen = re.search(r"mean_volume: (-?[\d.]+) dB", sortie)
    crete = re.search(r"max_volume: (-?[\d.]+) dB", sortie)
    h, m, s = duree.groups()
    return {
        "codec": flux.group(1),
        "frequence": int(flux.group(2)),
        "canaux": flux.group(3),
        "duree": int(h) * 3600 + int(m) * 60 + float(s),
        "moyen": float(moyen.group(1)),
        "crete": float(crete.group(1)),
    }


def normaliser(texte: str) -> list[str]:
    t = texte.lower().replace("€", " euros ").replace("%", " pour cent ")
    t = re.sub(r"(\d)[\s  ](?=\d{3}\b)", r"\1", t)
    t = unicodedata.normalize("NFD", t)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return t.split()


def wer(reference: list[str], hypothese: list[str]) -> float:
    d = list(range(len(hypothese) + 1))
    for i, r in enumerate(reference, 1):
        precedent, d[0] = d[0], i
        for j, h in enumerate(hypothese, 1):
            precedent, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, precedent + (r != h))
    return d[len(hypothese)] / max(1, len(reference))


def main():
    dossier_audio, dossier_minutage, ffmpeg = map(Path, sys.argv[1:4])
    modele = sys.argv[4] if len(sys.argv) > 4 else None
    whisper = None
    if modele:
        from faster_whisper import WhisperModel

        whisper = WhisperModel(modele, device="cpu", compute_type="int8")
    echecs = 0
    for chemin in sorted(dossier_minutage.glob("*.json")):
        n = json.loads(chemin.read_text(encoding="utf-8"))
        mp3 = dossier_audio / Path(n["audio"]).name
        m = mesures(ffmpeg, mp3)
        problemes = []
        if m["codec"] != "mp3" or m["canaux"] != "mono":
            problemes.append(f"flux {m['codec']} {m['canaux']}")
        if abs(m["duree"] - n["duree"]) > 0.15:
            problemes.append(f"durée {m['duree']:.2f} s au lieu de {n['duree']:.2f} s")
        if m["crete"] > -0.5:
            problemes.append(f"saturation (crête {m['crete']} dB)")
        if m["moyen"] < -35:
            problemes.append(f"trop faible (moyenne {m['moyen']} dB)")
        ligne = f"{n['slug']:<34} {m['duree']:6.2f} s  {m['codec']} {m['frequence']} Hz {m['canaux']}  moyenne {m['moyen']:6.1f} dB  crête {m['crete']:5.1f} dB"
        if whisper:
            import numpy as np

            # Décodage par ffmpeg (16 kHz, mono, flottants) : la version de PyAV installée ne s'ouvre pas avec faster-whisper.
            brut = subprocess.run([str(ffmpeg), "-loglevel", "error", "-i", str(mp3), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
            segments, _ = whisper.transcribe(np.frombuffer(brut, dtype=np.float32), language="fr", beam_size=5, vad_filter=False)
            transcrit = " ".join(s.text for s in segments)
            reference = " ".join(p["texte"] for s in n["scenes"] for p in s["phrases"])
            taux = wer(normaliser(reference), normaliser(transcrit))
            ligne += f"  WER {taux * 100:4.1f} %"
            if taux > 0.2:
                problemes.append(f"retranscription éloignée du texte (WER {taux * 100:.0f} %) : « {transcrit.strip()[:160]} »")
        print(ligne + ("  OK" if not problemes else "  ÉCHEC : " + " ; ".join(problemes)), flush=True)
        echecs += bool(problemes)
    print(f"{echecs} capsule(s) en échec.")
    sys.exit(1 if echecs else 0)


if __name__ == "__main__":
    main()

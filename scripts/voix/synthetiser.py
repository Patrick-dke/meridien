"""Narration des capsules : synthèse vocale locale (Piper), assemblage et minutage exact.

Chaque phrase est synthétisée séparément : sa durée est donc connue à l'échantillon près, sans alignement
approximatif. Les phrases sont assemblées avec des pauses calibrées sur le guide de style (0,7 s après une
question), la piste est normalisée en volume (-16 LUFS) puis encodée en MP3 mono. Le minutage (scènes et
phrases) est écrit à côté, pour synchroniser animations et sous-titres sur la voix.

Usage : python synthetiser.py <scripts> <modele.onnx> <dossier audio> <dossier minutage> <ffmpeg> [rythme]
"""

import io
import json
import subprocess
import sys
import wave
from array import array
from pathlib import Path

from piper import PiperVoice, SynthesisConfig

DEBUT = 0.30  # silence avant la première phrase (s)
ENTRE_PHRASES = 0.32
APRES_QUESTION = 0.72
ENTRE_SCENES = 0.50
FIN = 0.60
CIBLE_MOTS_MIN = 160  # débit de parole visé (pauses exclues) : environ 150 mots par minute pauses comprises
ECHELLE_MAX = 1.6
DUREE_MAX = 90.0


def synthese(voix: PiperVoice, texte: str, echelle: float) -> tuple[array, int]:
    tampon = io.BytesIO()
    with wave.open(tampon, "wb") as wav:
        voix.synthesize_wav(texte, wav, syn_config=SynthesisConfig(length_scale=echelle, noise_scale=0.6, noise_w_scale=0.75))
    tampon.seek(0)
    with wave.open(tampon, "rb") as wav:
        taux = wav.getframerate()
        echantillons = array("h", wav.readframes(wav.getnframes()))
    # Les silences de début et de fin de chaque phrase sont rognés : les pauses sont posées ensuite, à la main.
    seuil = 300
    i = next((k for k, v in enumerate(echantillons) if abs(v) > seuil), 0)
    j = next((k for k in range(len(echantillons) - 1, -1, -1) if abs(echantillons[k]) > seuil), len(echantillons) - 1)
    marge = int(0.03 * taux)
    return echantillons[max(0, i - marge) : min(len(echantillons), j + marge)], taux


def mots(texte: str) -> int:
    return len([m for m in texte.replace("'", " ").split() if any(c.isalnum() for c in m)])


def produire(voix: PiperVoice, script: dict, echelle: float):
    taux = voix.config.sample_rate
    piste = array("h")
    silence = lambda s: array("h", [0] * int(s * taux))  # noqa: E731
    piste.extend(silence(DEBUT))
    scenes = []
    parole = 0.0
    total_mots = 0
    for n, scene in enumerate(script["scenes"]):
        debut_scene = len(piste) / taux
        phrases = []
        for k, p in enumerate(scene["phrases"]):
            son, _ = synthese(voix, p["oral"], echelle)
            debut = len(piste) / taux
            piste.extend(son)
            fin = len(piste) / taux
            parole += fin - debut
            total_mots += mots(p["oral"])
            phrases.append({"debut": round(debut, 3), "fin": round(fin, 3), "texte": p["affiche"]})
            derniere = k == len(scene["phrases"]) - 1
            if p["affiche"].rstrip().endswith("?"):
                piste.extend(silence(APRES_QUESTION))
            elif not derniere:
                piste.extend(silence(ENTRE_PHRASES))
        piste.extend(silence(FIN if n == len(script["scenes"]) - 1 else ENTRE_SCENES))
        scenes.append({"debut": round(debut_scene, 3), "fin": round(len(piste) / taux, 3), "phrases": phrases})
    return piste, taux, scenes, total_mots / parole * 60, len(piste) / taux, total_mots


def main():
    dossier_scripts, modele, dossier_audio, dossier_minutage, ffmpeg = map(Path, sys.argv[1:6])
    rythme_force = float(sys.argv[6]) if len(sys.argv) > 6 else None
    voix = PiperVoice.load(str(modele))
    dossier_audio.mkdir(parents=True, exist_ok=True)
    dossier_minutage.mkdir(parents=True, exist_ok=True)
    bilan = []
    for chemin in sorted(dossier_scripts.glob("*.json")):
        script = json.loads(chemin.read_text(encoding="utf-8"))
        echelle = rythme_force or 1.0
        piste, taux, scenes, debit, duree, nb_mots = produire(voix, script, echelle)
        if rythme_force is None:
            # Un second passage règle la vitesse sur le débit visé, sans dépasser 90 secondes au total.
            echelle = max(0.85, min(ECHELLE_MAX, echelle * debit / CIBLE_MOTS_MIN))
            piste, taux, scenes, debit, duree, nb_mots = produire(voix, script, echelle)
            while duree > DUREE_MAX - 1 and echelle > 0.85:
                echelle = max(0.85, echelle * (DUREE_MAX - 2) / duree)
                piste, taux, scenes, debit, duree, nb_mots = produire(voix, script, echelle)
        wav_tmp = dossier_audio / f"{script['slug']}.wav"
        with wave.open(str(wav_tmp), "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(taux)
            wav.writeframes(piste.tobytes())
        mp3 = dossier_audio / f"{script['slug']}.mp3"
        subprocess.run(
            [str(ffmpeg), "-y", "-loglevel", "error", "-i", str(wav_tmp), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "22050", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "48k", str(mp3)],
            check=True,
        )
        wav_tmp.unlink()
        minutage = {
            "slug": script["slug"],
            "voix": "Piper, voix fr_FR-siwis-medium (synthèse locale)",
            "empreinte": script["empreinte"],
            "duree": round(duree, 3),
            "audio": f"/audio/capsules/{script['slug']}.mp3",
            "scenes": scenes,
        }
        (dossier_minutage / f"{script['slug']}.json").write_text(json.dumps(minutage, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        bilan.append((script["slug"], round(duree, 1), round(debit), round(echelle, 3), mp3.stat().st_size // 1024))
        global_ = nb_mots / duree * 60
        print(f"{script['slug']:<34} {duree:6.1f} s  parole {debit:4.0f} mots/min  global {global_:4.0f}  échelle {echelle:.3f}  {mp3.stat().st_size // 1024} Ko", flush=True)
    print(f"{len(bilan)} capsules narrées.")


if __name__ == "__main__":
    main()

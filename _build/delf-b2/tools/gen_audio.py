#!/usr/bin/env python3
"""Generate all MP3 recordings for a KCE DELF B2 week with free local voices.

Usage:  python3 gen_audio.py 1                 (all recordings of week 1)
        python3 gen_audio.py 1 co1 po-a1       (only these files, by recording id / examiner file stem)
        python3 gen_audio.py 1 --phonemes      (print phonemes of acronyms/names to check pronunciation)

Reads  /home/claude/delf/content/weekNN.built.json   (run build_week.py first)
Writes /home/claude/kgh/delf-b2/audio/weekNN/*.mp3     (mono, 80 kbps, loudness-normalized)

Voices (spec section 4):
  piper:siwis   fr_FR-siwis-medium (female)        piper:tom     fr_FR-tom-medium (male)  <- EXAMINER voice, all weeks
  piper:upmc:0  fr_FR-upmc-medium jessica (female) piper:upmc:1  fr_FR-upmc-medium pierre (male)
  kokoro:ff_siwis  Kokoro ff_siwis (female)
  Variants: append @<pitch factor> for a distinct speaker from the same model, e.g. piper:upmc:0@1.08 (higher, younger).
  Rule: never use piper:siwis and kokoro:ff_siwis in the same document (same speaker).
Pronunciation: text is normalized for TTS (IA -> "I A", % -> "pour cent", M. -> Monsieur, acronyms spelled out);
a segment can override with its "say" field.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PIPER_DIR = "/home/claude/piper"
KOKORO_MODEL = "/home/claude/ss/tts/kokoro.onnx"
KOKORO_VOICES = "/home/claude/ss/tts/voices.bin"
CONTENT = "/home/claude/delf/content"
REPO = "/home/claude/kgh/delf-b2"
SR = 24000
EXAMINER = "piper:tom"

# pacing (natural radio pace ~165-180 words/min)
PIPER_LENGTH = {"siwis": 0.94, "tom": 0.95, "upmc": 0.95}
PIPER_SENT_SIL = 0.32
KOKORO_SPEED = 1.03
PAUSE_TURN = 0.55       # between two different speakers
PAUSE_VOXPOP = 0.9      # between interviewees in a vox pop / separate voices in a report
PAUSE_SAME = 0.3
LEAD_IN, TAIL = 0.6, 0.8

ACRONYMS_KEEP = {"OK"}
REPLACE = [
    (r"\bl['’]IA\b", "l'I A"), (r"\bIA\b", "I A"), (r"(\d)\s*%", r"\1 pour cent"), (r"\bM\.\s", "Monsieur "),
    (r"\bMme\s", "Madame "), (r"\bJO\b", "J O"), (r"\bZFE\b", "Z F E"), (r"\bDELF\b", "delf"), (r"\bTCF\b", "T C F"),
    (r"«\s*|\s*»", ""), (r"…", "..."), (r"\s*—\s*", ", "),
]

def tts_text(s):
    t = s.replace(" ", " ").replace(" ", " ")
    for a, b in REPLACE:
        t = re.sub(a, b, t)
    # any other all-caps acronym of 2-4 letters -> spelled letters
    t = re.sub(r"\b([A-Z]{2,4})\b", lambda m: m.group(1) if m.group(1) in ACRONYMS_KEEP else " ".join(m.group(1)), t)
    return re.sub(r"\s+", " ", t).strip()

_kokoro = None
def kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        _kokoro = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _kokoro

def pitch_shift(a, f):
    """Shift pitch by factor f, keeping duration (ffmpeg asetrate + atempo)."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as fi, tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as fo:
        i, o = fi.name, fo.name
    sf.write(i, a, SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", i, "-af",
                    "asetrate=%d,aresample=%d,atempo=%.5f" % (round(SR * f), SR, 1.0 / f), o], check=True)
    b, _ = sf.read(o, dtype="float32"); os.unlink(i); os.unlink(o)
    return b

def synth(voice, text):
    """Return float32 mono audio at SR. A voice may carry a pitch factor: 'piper:upmc:0@1.08'."""
    if "@" in voice:
        base, f = voice.split("@")
        return trim(level(pitch_shift(synth(base, text), float(f))))
    parts = voice.split(":")
    if parts[0] == "piper":
        model = os.path.join(PIPER_DIR, "fr_FR-%s-medium.onnx" % parts[1])
        spk = parts[2] if len(parts) > 2 else "0"
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            out = f.name
        subprocess.run(["piper", "-m", model, "-s", spk, "-f", out, "--length-scale", str(PIPER_LENGTH[parts[1]]),
                        "--sentence-silence", str(PIPER_SENT_SIL)], input=text.encode("utf-8"),
                       check=True, capture_output=True)
        a, sr = sf.read(out, dtype="float32"); os.unlink(out)
    elif parts[0] == "kokoro":
        a, sr = kokoro().create(text, voice=parts[1], lang="fr-fr", speed=KOKORO_SPEED, sentence_pause=0.3)
        a = np.asarray(a, dtype="float32")
    else:
        raise ValueError(voice)
    if a.ndim > 1: a = a.mean(axis=1)
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr); a = resample_poly(a, SR // g, sr // g).astype("float32")
    return trim(level(a))

def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    s, e = max(0, idx[0] - int(0.03 * SR)), min(len(a), idx[-1] + int(0.08 * SR))
    return a[s:e]

def level(a, target_db=-20.0):
    """Match loudness between voices: scale voiced RMS to target, soft-limit peaks."""
    frame = int(0.03 * SR)
    if len(a) < frame: return a
    n = len(a) // frame
    rms = np.sqrt(np.mean(a[:n * frame].reshape(n, frame) ** 2, axis=1))
    voiced = rms[rms > 0.02 * rms.max()] if rms.max() > 0 else rms
    cur = 20 * np.log10(np.sqrt(np.mean(voiced ** 2)) + 1e-9)
    a = a * (10 ** ((target_db - cur) / 20))
    return np.tanh(a * 1.2) / np.tanh(1.2) if np.abs(a).max() > 0.95 else a

def silence(sec):
    return np.zeros(int(sec * SR), dtype="float32")

def encode(a, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    sf.write(tmp, a, SR, subtype="PCM_16")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp,
                    "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "24000", "-ac", "1",
                    "-c:a", "libmp3lame", "-b:a", "80k", path], check=True)
    os.unlink(tmp)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                             capture_output=True, text=True).stdout.strip())
    return d

def build_recording(r, multi_pause):
    chunks = [silence(LEAD_IN)]
    prev = None
    for seg in r["segments"]:
        voice = r["speakers"][seg["spk"]]["voice"]
        text = tts_text(seg.get("say") or seg["fr"])
        if prev is not None:
            chunks.append(silence(PAUSE_SAME if prev == seg["spk"] else multi_pause))
        chunks.append(synth(voice, text))
        prev = seg["spk"]
    chunks.append(silence(TAIL))
    return np.concatenate(chunks)

def main():
    n = int(sys.argv[1]); only = [x for x in sys.argv[2:] if not x.startswith("--")]
    d = json.load(open(os.path.join(CONTENT, "week%02d.built.json" % n), encoding="utf-8"))
    outdir = os.path.join(REPO, d["audioBase"])
    if "--phonemes" in sys.argv:
        from piper import PiperVoice
        v = PiperVoice.load(os.path.join(PIPER_DIR, "fr_FR-tom-medium.onnx"))
        words = set()
        for sc in d["screens"]:
            for r in sc.get("recordings", []):
                for s in r["segments"]:
                    for w in re.findall(r"\b[A-ZÉ][\w'’-]+", tts_text(s.get("say") or s["fr"])): words.add(w)
        for w in sorted(words): print(w, "->", " ".join("".join(p) for p in v.phonemize(w)))
        return
    report = []
    for sc in d["screens"]:
        if sc["type"] == "co":
            for r in sc["recordings"]:
                if only and r["id"] not in only: continue
                pause = PAUSE_VOXPOP if len(r["speakers"]) >= 3 and sc["ex"] == 3 else PAUSE_TURN
                a = build_recording(r, pause)
                dur = encode(a, os.path.join(outdir, r["file"]))
                report.append((r["file"], dur))
        if sc["type"] == "po":
            voice = sc.get("examinerVoice", EXAMINER)
            for doc in sc["docs"]:
                for q in doc["examiner"]:
                    stem = q["file"].rsplit(".", 1)[0]
                    if only and stem not in only and q["id"] not in only: continue
                    a = np.concatenate([silence(0.4), synth(voice, tts_text(q.get("say") or q["fr"])), silence(0.5)])
                    dur = encode(a, os.path.join(outdir, q["file"]))
                    report.append((q["file"], dur))
    for f, du in report:
        print("%-14s %5.1f s  (%d:%02d)" % (f, du, int(du) // 60, round(du) % 60))

if __name__ == "__main__":
    main()

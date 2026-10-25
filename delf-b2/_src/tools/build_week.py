#!/usr/bin/env python3
"""Build a KCE DELF B2 week page from its content source.

Usage:  python3 build_week.py 1            (reads /home/claude/delf/content/week01.py or week01.json)
        python3 build_week.py 1 --check    (validate only, no output)

What it does:
  1. Loads the source (Python module exposing DATA [+ SEED], or a JSON file with the same structure).
  2. Normalizes authoring shortcuts into the final schema (see /home/claude/delf/SCHEMA.md).
  3. Shuffles MCQ options (authored CORRECT FIRST) into balanced A/B/C positions with no letter 3 times in a row.
  4. Applies French typography (espaces insecables) to French strings.
  5. Validates format rules (item counts, weights, word counts, English spelling, the word "session").
  6. Reads audio durations from the repo (if the MP3s exist) and writes them into the data.
  7. Writes weekNN.html (page shell + JSON data block) and content/weekNN.built.json.
"""
import json, os, re, sys, random, subprocess, importlib.util, html

ROOT = "/home/claude/delf"
CONTENT = os.path.join(ROOT, "content")
REPO = "/home/claude/kgh/delf-b2"
NBSP = " "

# ---------------------------------------------------------------- helpers
def word_count(text):
    """DELF rule: a word is any group of characters between two spaces (c'est-a-dire = 1, l'IA = 1).
    Tokens made only of punctuation (? ! : ; « » - ...) are not counted."""
    text = re.sub(r"<[^>]+>", " ", text or "")
    toks = re.split(r"[\s  ]+", text)
    return sum(1 for t in toks if re.search(r"[0-9A-Za-zÀ-ÖØ-öø-ÿŒœ]", t))

def pair(v):
    """[fr, en] -> {fr, en}; dict passes through; str -> {fr: str, en: ''}."""
    if isinstance(v, dict):
        return v
    if isinstance(v, (list, tuple)):
        return {"fr": v[0], "en": v[1] if len(v) > 1 else ""}
    if isinstance(v, str):
        return {"fr": v, "en": ""}
    return v

def fr_typo(s):
    """French typography on text nodes only (HTML tags untouched)."""
    parts = re.split(r"(<[^>]+>)", s)
    out = []
    for p in parts:
        if p.startswith("<") and p.endswith(">"):
            out.append(p)
            continue
        p = re.sub(r"[  ]+([;:!?»])", NBSP + r"\1", p)          # space before high punctuation -> nbsp
        p = re.sub(r"«[  ]+", "«" + NBSP, p)                       # space after « -> nbsp
        p = re.sub(r"(?<=[A-Za-zÀ-ÖØ-öø-ÿ0-9…»)\]])([;!?])", NBSP + r"\1", p)   # missing space before ; ! ?
        p = re.sub(r"(?<=[A-Za-zÀ-ÖØ-öø-ÿ…»)\]]):(?!\d)", NBSP + ":", p)          # missing space before :
        p = re.sub(r"«(?=[^\s ])", "«" + NBSP, p)
        p = re.sub(r"(?<=[^\s ])»", NBSP + "»", p)
        out.append(p)
    return "".join(out)

FR_KEYS = {"fr", "ex", "text", "before", "after", "verb", "title", "source", "paras", "quote", "items", "bank", "role"}
SKIP_KEYS = {"en", "exEn", "accept", "answer", "id", "file", "voice", "href", "spk", "say", "kind", "type",
             "section", "audioBase", "hub", "course", "mode", "promptId", "examinerVoice", "rec", "label", "name"}

def typo_walk(obj, key=None):
    if isinstance(obj, dict):
        return {k: (v if k in SKIP_KEYS else typo_walk(v, k)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [typo_walk(v, key) for v in obj]
    if isinstance(obj, str) and key in FR_KEYS:
        return fr_typo(obj)
    return obj

def ffprobe_dur(path):
    try:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                             capture_output=True, text=True, check=True).stdout.strip()
        return round(float(out), 1)
    except Exception:
        return None

def load_source(n):
    base = os.path.join(CONTENT, "week%02d" % n)
    if os.path.exists(base + ".py"):
        spec = importlib.util.spec_from_file_location("weeksrc", base + ".py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return json.loads(json.dumps(mod.DATA)), getattr(mod, "SEED", n)
    with open(base + ".json", encoding="utf-8") as f:
        d = json.load(f)
    return d, d.pop("_seed", n)

# ---------------------------------------------------------------- normalization
def norm_mcq(it, fixed=False):
    o = {"id": it["id"], "weight": it.get("weight", it.get("w")), "q": pair(it["q"]),
         "explain": pair(it.get("explain", it.get("ex")))}
    if it.get("rec"):
        o["rec"] = it["rec"]
    if "opts" in it:                       # authored correct-first
        o["_opts"] = [pair(x) for x in it["opts"]]
    elif "options" in it:                  # already final
        o["options"] = [pair(x) for x in it["options"]]
        o["answer"] = it["answer"]
    if fixed or ("answer" in it and "opts" not in it and "options" not in it):
        o["answer"] = it["answer"]
    return o

def normalize(d):
    for sc in d["screens"]:
        t = sc["type"]
        if t == "co":
            for r in sc["recordings"]:
                r["segments"] = [s if isinstance(s, dict) else
                                 dict({"spk": s[0], "fr": s[1], "en": s[2]}, **({"say": s[3]} if len(s) > 3 else {}))
                                 for s in r["segments"]]
            sc["items"] = [norm_mcq(i) for i in sc["items"]]
        elif t == "ce":
            doc = sc["doc"]
            doc["title"] = pair(doc["title"])
            doc["lead"] = pair(doc["lead"]) if doc.get("lead") else None
            doc["paras"] = [pair(p) for p in doc["paras"]]
            sc["items"] = [norm_mcq(i) for i in sc["items"]]
        elif t == "ce3":
            doc = sc["doc"]
            doc["question"] = pair(doc["question"])
            for op in doc["opinions"]:
                op["role"] = pair(op["role"])
                op["text"] = pair(op["text"])
            sc["items"] = [norm_mcq(i, fixed=True) for i in sc["items"]]
        elif t == "po":
            for doc in sc["docs"]:
                for q in doc["examiner"]:
                    q.setdefault("file", "po-%s.mp3" % q["id"])
    return d

# ---------------------------------------------------------------- answer positions
def assign_positions(d, seed):
    rng = random.Random(seed)
    for section in ("co", "ce"):
        scs = [s for s in d["screens"] if s.get("section") == section and s["type"] in ("co", "ce", "ce3")]
        items = [(s, i) for s in scs for i in s["items"]]
        if not items:
            continue
        free = [k for k, (s, i) in enumerate(items) if "_opts" in i]
        for attempt in range(20000):
            seq = [i.get("answer") for s, i in items]
            for k in free:
                seq[k] = rng.randrange(3)
            if ok_sequence(seq, [s["id"] for s, i in items]):
                break
        else:
            raise SystemExit("could not balance positions for " + section)
        for k in free:
            s, i = items[k]
            opts = i.pop("_opts")
            correct, wrong = opts[0], opts[1:]
            rng.shuffle(wrong)
            pos = seq[k]
            arr = wrong[:]
            arr.insert(pos, correct)
            i["options"] = arr
            i["answer"] = pos
    return d

def ok_sequence(seq, groups):
    n = len(seq)
    counts = [seq.count(x) for x in range(3)]
    lo, hi = n // 3, -(-n // 3)
    if min(counts) < lo or max(counts) > hi:
        return False
    for k in range(2, n):
        if seq[k] == seq[k - 1] == seq[k - 2]:
            return False
    for g in set(groups):
        sub = [seq[k] for k in range(n) if groups[k] == g]
        if len(sub) >= 6 and (len(set(sub)) < 3 or max(sub.count(x) for x in range(3)) > 3):
            return False
    return True

# ---------------------------------------------------------------- validation
BRITISH = r"\b(colour|favour|honour|behaviour|neighbour|organis|apologis|recognis|realis(e|ed|es|ing|ation)|analys(e|ed|ing)|practis|centre|programme|travell|cancell|grey|defence|licence|judgement|catalogue|dialogue box|whilst|amongst|learnt|spelt|mum)\w*"

def walk_strings(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk_strings(v, path + "." + k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_strings(v, path + "[%d]" % i)
    elif isinstance(obj, str):
        yield path, obj

def validate(d):
    errs, warns, report = [], [], []
    for sc in d["screens"]:
        t = sc["type"]
        if t in ("co", "ce", "ce3"):
            ws = [i["weight"] for i in sc["items"]]
            for i in sc["items"]:
                if t != "ce3":
                    if len(i["options"]) != 3: errs.append(i["id"] + ": needs 3 options")
                if i["answer"] not in (0, 1, 2): errs.append(i["id"] + ": bad answer")
                if not i["explain"]["fr"] or not i["explain"]["en"]: errs.append(i["id"] + ": explanation missing")
                if not i["q"]["en"]: errs.append(i["id"] + ": English question missing")
            exp = {1: (7, 9), 2: (7, 9), 3: (6, 7)}[sc["ex"]]
            if len(ws) != exp[0] or abs(sum(ws) - exp[1]) > 1e-9:
                errs.append("%s: %d items / %.1f pts (expected %d / %d)" % (sc["id"], len(ws), sum(ws), exp[0], exp[1]))
            if ws.count(1.5) != {1: 4, 2: 4, 3: 2}[sc["ex"]]:
                errs.append(sc["id"] + ": wrong count of 1.5-point items")
        if t == "co":
            for r in sc["recordings"]:
                wc = sum(word_count(s["fr"]) for s in r["segments"])
                lo, hi = (450, 550) if sc["ex"] in (1, 2) else (150, 200)
                report.append(("CO " + r["id"], wc, "%d-%d" % (lo, hi)))
                if not lo <= wc <= hi: errs.append("%s transcript %d words (want %d-%d)" % (r["id"], wc, lo, hi))
                for s in r["segments"]:
                    if s["spk"] not in r["speakers"]: errs.append(r["id"] + ": unknown speaker " + s["spk"])
                    if not s["en"]: errs.append(r["id"] + ": segment without English")
        if t == "ce":
            doc = sc["doc"]
            body = (doc["lead"]["fr"] + " " if doc.get("lead") else "") + " ".join(p["fr"] for p in doc["paras"])
            wc = word_count(body)
            wct = wc + word_count(doc["title"]["fr"])
            report.append(("CE " + sc["id"] + " (body; with title %d)" % wct, wc, "425-450"))
            if not 425 <= wc <= 450: errs.append("%s text %d words (want 425-450)" % (sc["id"], wc))
        if t == "ce3":
            for op in sc["doc"]["opinions"]:
                wc = word_count(op["text"]["fr"])
                report.append(("CE3 " + op["label"] + " " + op["name"], wc, "100-120"))
                if not 100 <= wc <= 120: errs.append("CE3 %s %d words (want 100-120)" % (op["label"], wc))
            seq = [i["answer"] for i in sc["items"]]
            if sorted(seq) != [0, 0, 1, 1, 2, 2]: warns.append("CE3 attributions not 2/2/2: %s" % seq)
        if t == "pe":
            m = sc["model"]
            wc = word_count(" ".join(m["paras"]))
            m["wordCount"] = wc
            report.append(("PE model (incl. greeting/signature)", wc, "280-320"))
            if not 280 <= wc <= 320: errs.append("PE model %d words (want 280-320)" % wc)
            for a in m["annotations"]:
                if not any(a["quote"].replace(NBSP, " ") in p.replace(NBSP, " ") for p in m["paras"]):
                    errs.append("PE annotation quote not found: " + a["quote"])
        if t == "po":
            for doc in sc["docs"]:
                n = len(doc["examiner"])
                if not 6 <= n <= 8: errs.append("PO doc %s has %d examiner questions" % (doc["id"], n))
                report.append(("PO doc " + doc["id"], word_count(doc["text"]), "~80-150"))
        if t == "lexicon":
            n = sum(len(g["items"]) for g in sc["groups"])
            report.append(("Lexique items", n, "25-30"))
            if not 25 <= n <= 30: errs.append("lexicon has %d items" % n)
            for it in sc["practice"]["items"]:
                if it["answer"] not in sc["practice"]["bank"]: errs.append("lexicon practice answer not in bank: " + it["answer"])
            if len(sc["practice"]["items"]) != 8: errs.append("lexicon practice must have 8 items")
        if t == "grammar":
            if len(sc["exercise"]["items"]) != 10: errs.append("grammar exercise must have 10 items")
            for it in sc["exercise"]["items"]:
                if not it.get("accept"): errs.append("grammar item without accepted answers")
    # English checks
    for path, s in walk_strings(d):
        if re.search(r"\.(en|exEn)$|\.en\b", path) or path.endswith(".en"):
            if re.search(r"\bsessions?\b", s, re.I): errs.append("word 'session' in English at " + path)
            m = re.search(BRITISH, s, re.I)
            if m: warns.append("British spelling? '%s' at %s" % (m.group(0), path))
    # positions report
    for section in ("co", "ce"):
        seq = [i["answer"] for s in d["screens"] if s.get("section") == section and s["type"] in ("co", "ce", "ce3") for i in s["items"]]
        if seq:
            report.append((section.upper() + " answer letters", "".join("ABC"[x] for x in seq), "A=%d B=%d C=%d" % tuple(seq.count(x) for x in range(3))))
            for k in range(2, len(seq)):
                if seq[k] == seq[k-1] == seq[k-2]: errs.append(section + ": same letter 3 times in a row at item %d" % (k+1))
    return errs, warns, report

# ---------------------------------------------------------------- durations
def add_durations(d):
    adir = os.path.join(REPO, d["audioBase"])
    for sc in d["screens"]:
        if sc["type"] == "co":
            for r in sc["recordings"]:
                du = ffprobe_dur(os.path.join(adir, r["file"]))
                if du: r["duration"] = du
        if sc["type"] == "po":
            for doc in sc["docs"]:
                for q in doc["examiner"]:
                    du = ffprobe_dur(os.path.join(adir, q["file"]))
                    if du: q["duration"] = du

# ---------------------------------------------------------------- page shell
SHELL = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>{title}</title>
<link rel="stylesheet" href="assets/delf.css">
</head>
<body>
<a class="skip" href="#delf-app">Aller au contenu</a>
<header class="mast">
  <div class="wrap">
    <div class="brandrow"><div class="kc" aria-hidden="true"><span>KC</span></div><div class="wordmark">KingCretot Experience</div></div>
    <div class="tagline"><span class="e1">EDUCATE.</span> <span class="e2">EMPOWER.</span> <span class="e3">EXCEL.</span></div>
    <p class="course">DELF B2 · Préparation complète · Citizenship Language Program</p>
    <h1>{h1}</h1>
    <p class="sub">{sub}</p>
  </div>
  <div class="tricolor" aria-hidden="true"><i></i><i></i><i></i></div>
</header>
<main id="delf-app" class="wrap" tabindex="-1"><noscript><p class="card">Ce cours nécessite JavaScript. Activez-le dans votre navigateur. (This course requires JavaScript.)</p></noscript></main>
<footer class="foot">
  <div class="wrap">
    <b>KingCretot Experience</b> · PO Box 2322, Arcadia, FL 34265 · <a href="mailto:kce@kingcretot.com">kce@kingcretot.com</a><br>
    Approved provider: Step Up For Students · Arizona ESA · West Virginia Hope Scholarship<br>
    &copy; 2026 KingCretot Experience. All rights reserved. Licensed for KCE students only. Do not copy, share or distribute.<br>
    <span class="fine">Le DELF est un diplôme du ministère français de l'Éducation nationale administré par France Éducation international. Ce cours est une préparation indépendante proposée par KCE.</span>
  </div>
  <div class="tricolor" aria-hidden="true"><i></i><i></i><i></i></div>
</footer>
<script type="application/json" id="delf-data">{data}</script>
<script src="assets/delf.js"></script>
</body>
</html>
"""

def write_page(d, n):
    data = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    data = data.replace("</", "<\\/").replace("<!--", "<\\!--")
    page = SHELL.format(
        title=html.escape("Semaine %d · DELF B2 · KCE" % n),
        h1=html.escape("Semaine %d · %s" % (n, d["title"]["fr"]) if d.get("mode") != "mock" else d["title"]["fr"]),
        sub=html.escape(d["subtitle"]["fr"]) if d.get("subtitle") else "",
        data=data)
    os.makedirs(REPO, exist_ok=True)
    out = os.path.join(REPO, "week%02d.html" % n)
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)
    with open(os.path.join(CONTENT, "week%02d.built.json" % n), "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    return out

def main():
    n = int(sys.argv[1])
    d, seed = load_source(n)
    d = normalize(d)
    d = assign_positions(d, seed)
    d = typo_walk(d)
    errs, warns, report = validate(d)
    print("== Report week %d" % n)
    for name, val, want in report:
        print("  %-48s %-22s %s" % (name, val, want))
    for w in warns: print("  WARN", w)
    for e in errs: print("  ERROR", e)
    if "--check" in sys.argv:
        return
    if errs:
        raise SystemExit("not written: fix errors first")
    add_durations(d)
    print("wrote", write_page(d, n))

if __name__ == "__main__":
    main()

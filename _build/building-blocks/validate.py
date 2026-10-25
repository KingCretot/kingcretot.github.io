#!/usr/bin/env python3
"""python3 validate.py data/<who>_LNN.json -> prints OK or problems"""
import json, sys, re, collections
BRIT = re.compile(r"\b(colour|favour|favourite|centre|metre|grey|organis|realis|recognis|apologis|travell|cancell|programme|neighbour|behaviour|practise|maths|learnt|spelt|whilst|honour|labour|theatre|mum)\w*", re.I)
SLIDE = {"hello","talk","learn","tap","recall","sort","order","build","vocab","check"}
VIS = {"groups","uneven","array","numberline","triangle","area","longdiv","placevalue","contraction","bigtext","emoji","passage","svg","compare"}
def mins(t):
    a,b = re.split(r"[–-]", t); f=lambda s: int(s.split(":")[0])*60+int(s.split(":")[1]); return f(a), f(b)
def main(p):
    L = json.load(open(p)); P = []
    who = L.get("student"); n = L.get("n")
    for k in ("title","goal","card","slides","practice","packet","teacher","tasks"):
        if k not in L: P.append(f"missing {k}")
    if P: return P
    def chkq(q, where):
        if q.get("type") == "fill":
            if not q.get("answers") or not all(isinstance(a, str) and a.strip() for a in q["answers"]): P.append(f"{where}: fill needs answers list")
            if not q.get("why"): P.append(f"{where}: missing why")
            if "____" not in q.get("q", "") and "?" not in q.get("q", ""): P.append(f"{where}: fill question needs a blank ____ or a question")
            for a in q.get("answers", []):
                if len(a) > 30: P.append(f"{where}: fill answer too long to type ({a[:20]}…)")
            v = q.get("visual")
            if v and v.get("kind") not in VIS: P.append(f"{where}: unknown visual {v.get('kind')}")
            return
        if not isinstance(q.get("choices"), list) or len(q["choices"]) < 2: P.append(f"{where}: needs 2+ choices")
        elif not (0 <= q.get("a", -1) < len(q["choices"])): P.append(f"{where}: answer index out of range")
        if len(set(map(str, q.get("choices", [])))) != len(q.get("choices", [])): P.append(f"{where}: duplicate choices")
        if not q.get("why"): P.append(f"{where}: missing why")
        if "no" in q and len(q["no"]) != len(q["choices"]): P.append(f"{where}: 'no' length must match choices")
        if len(q.get("choices", [])) < 3: P.append(f"{where}: multiple choice needs 3+ choices (3 tries are allowed)")
        v = q.get("visual")
        if v and v.get("kind") not in VIS: P.append(f"{where}: unknown visual {v.get('kind')}")
    def fillshare(qs, where, need=0.5):
        if qs and sum(q.get("type") == "fill" for q in qs) / len(qs) < need: P.append(f"{where}: at least {int(need*100)}% must be typed fill-in questions")
    types = [s.get("type") for s in L["slides"]]
    for i, s in enumerate(L["slides"]):
        if s.get("type") not in SLIDE: P.append(f"slide {i+1}: unknown type {s.get('type')}")
        if s.get("visual") and s["visual"].get("kind") not in VIS: P.append(f"slide {i+1}: unknown visual")
        if s.get("type") in ("tap","recall"):
            for j, q in enumerate(s.get("items") or [s]): chkq(q, f"slide {i+1} q{j+1}")
        if s.get("type") == "sort":
            for it in s["items"]:
                if not (0 <= it["b"] < len(s["buckets"])): P.append(f"slide {i+1}: sort bucket out of range")
        if s.get("type") == "build" and not all(k in s for k in ("groups","each","why","text")): P.append(f"slide {i+1}: build needs groups/each/why/text")
        if s.get("type") == "vocab":
            for w in s["words"]:
                if not all(w.get(k) for k in ("word","meaning","example")): P.append(f"slide {i+1}: vocab word missing fields")
    if types.count("check") != 1: P.append("exactly one check slide required")
    if types[0] != "hello": P.append("first slide must be hello")
    if "talk" not in types: P.append("needs a talk slide (book talk)")
    chk = next((s for s in L["slides"] if s.get("type") == "check"), None)
    if chk:
        need = 8 if who == "bristol" else 10
        sets = chk.get("sets")
        if not sets or len(sets) != 3: P.append("check needs 'sets': exactly 3 different question sets (retakes rotate)")
        else:
            seen = set()
            for k, QS in enumerate(sets, 1):
                if len(QS) != need: P.append(f"check set {k} must have {need} questions (has {len(QS)})")
                for j, q in enumerate(QS):
                    chkq(q, f"check set{k} q{j+1}")
                    if q["q"] in seen: P.append(f"check set{k} q{j+1}: same question text appears in another set")
                    seen.add(q["q"])
                fillshare(QS, f"check set {k}")
                pos = collections.Counter(q["a"] for q in QS if q.get("type") != "fill" and len(q["choices"]) > 2)
                if pos and max(pos.values()) > max(2, sum(pos.values()) * 0.6): P.append(f"check set {k} answers bunched {dict(pos)}")
        if "questions" in chk: P.append("check: use 'sets' instead of 'questions'")
    T2 = L.get("teach")
    if not T2 or not T2.get("slides"): P.append("missing teach (class lesson for Jonathan)")
    else:
        for i, s2 in enumerate(T2["slides"]):
            if s2.get("type") not in SLIDE - {"check"}: P.append(f"teach slide {i+1}: bad type {s2.get('type')}")
            if not s2.get("notes"): P.append(f"teach slide {i+1}: needs notes (do/say/ask/listen)")
            for j, q in enumerate((s2.get("items") or [s2]) if s2.get("type") in ("tap","recall") else []): chkq(q, f"teach slide {i+1} q{j+1}")
        if T2["slides"][0].get("type") != "hello": P.append("teach: first slide must be hello")
        if not 10 <= len(T2["slides"]) <= 22: P.append("teach: 10-22 slides")
    pq = L["practice"].get("questions", [])
    if not 10 <= len(pq) <= 12: P.append(f"practice needs 10-12 questions (has {len(pq)})")
    for j, q in enumerate(pq): chkq(q, f"practice q{j+1}")
    fillshare(pq, "practice")
    if who == "bailey" and "vocab" not in types: P.append("Bailey lessons need a vocab slide")
    pages = L["packet"].get("pages", [])
    if len(pages) != 2: P.append("packet must have exactly 2 pages")
    T = L["teacher"]
    for k in ("objective","materials","plan","watch","packet_key"):
        if not T.get(k): P.append(f"teacher.{k} missing")
    try:
        sp = [mins(x["time"]) for x in T["plan"]]
        if sp[0][0] != 0 or sp[-1][1] != 60 or any(sp[i][1] != sp[i+1][0] for i in range(len(sp)-1)): P.append("teacher plan times must run 0:00 to 1:00 with no gaps")
    except Exception as e: P.append(f"teacher plan time format: {e}")
    if not 2 <= len(L["tasks"]) <= 7: P.append("tasks: 2-7 items")
    for a in L.get("also", []):
        if not all(a.get(k) for k in ("label","url","how")): P.append("also link needs label/url/how")
        if "1111" not in a["how"]: P.append("also.how must tell the student to type 1111 if locked")
    txt = json.dumps(L, ensure_ascii=False)
    for m in set(x.group(0) for x in BRIT.finditer(txt)): P.append(f"British spelling/word: {m}")
    if re.search(r"\bsession", txt, re.I): P.append("say 'lesson' not 'session'")
    return P
if __name__ == "__main__":
    bad = 0
    for p in sys.argv[1:]:
        r = main(p); print(("OK  " if not r else "BAD ") + p); [print("   -", x) for x in r]; bad += bool(r)
    sys.exit(1 if bad else 0)

#!/usr/bin/env python3
"""Shape check for a State Focus JSON file. Usage: python3 check.py data/oh.json [...]"""
import json, sys, re

def err(f, m): print(f"{f}: {m}"); return 1

def check(path):
    bad = 0
    try:
        d = json.load(open(path))
    except Exception as e:
        return err(path, f"not valid JSON: {e}")
    req = ["state", "postal", "region", "facts", "government", "first_peoples", "history", "trailblazers",
           "geography", "science", "units", "sources"]
    for k in req:
        if k not in d: bad += err(path, f"missing {k}")
    if bad: return bad
    if d["region"] not in ("Northeast", "Midwest", "South", "West"): bad += err(path, "region must be a Census region")
    for k in ["capital", "largest_city", "statehood", "order", "nickname", "motto", "borders", "symbols", "name_origin"]:
        if k not in d["facts"]: bad += err(path, f"facts.{k} missing")
    if not isinstance(d["facts"].get("order"), int) or not 1 <= d["facts"]["order"] <= 50: bad += err(path, "facts.order 1-50")
    for k in ["legislature", "chambers", "executive", "courts", "local", "constitution", "kid_line"]:
        if not d["government"].get(k): bad += err(path, f"government.{k} missing")
    fp = d["first_peoples"]
    if len(fp.get("long_ago", [])) < 3: bad += err(path, "first_peoples.long_ago needs 3+")
    if "today" not in fp or "today_note" not in fp or "sites" not in fp: bad += err(path, "first_peoples keys")
    if not 8 <= len(d["history"]) <= 16: bad += err(path, "history needs 8-14 entries")
    if not 5 <= len(d["trailblazers"]) <= 8: bad += err(path, "trailblazers needs 5-7")
    for t in d["trailblazers"]:
        for k in ("name", "years", "group", "text"):
            if not t.get(k): bad += err(path, f"trailblazer {t.get('name')} missing {k}")
    for k in ("ecosystems", "weather", "resources", "highlight"):
        if not d["science"].get(k): bad += err(path, f"science.{k} missing")
    for k in ("g3_ss", "g45_ss", "g3_sci", "g45_sci"):
        u = d["units"].get(k, [])
        if len(u) != 3 or not all(x.get("title") and x.get("plan") for x in u): bad += err(path, f"units.{k} needs 3 title+plan")
    if len(d["sources"]) < 8: bad += err(path, "sources needs 8+")
    for s in d["sources"]:
        if not re.match(r"https?://", s.get("url", "")): bad += err(path, f"bad source url {s}")
    txt = json.dumps(d, ensure_ascii=False)
    for w in ("session", "runaway slave"):
        if w in txt: bad += err(path, f"avoid the wording '{w}'")
    if "—" in txt: bad += err(path, "no em dashes")
    if not bad: print(f"{path}: OK")
    return bad

if __name__ == "__main__":
    sys.exit(1 if sum(check(p) for p in sys.argv[1:]) else 0)

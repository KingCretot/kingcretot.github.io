#!/usr/bin/env python3
"""Make one 'Print everything for today' PDF per Building Blocks lesson:
the lesson's packet, then the Pre/Post sheet of every linked Pathways lesson (in Also-do order).
Writes kgh/building-blocks/<who>/print-NN.pdf and data/printday/<who>_LNN.json (contents list)."""
import json, glob, os, re, sys, io
from pypdf import PdfReader, PdfWriter
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/claude/kgh/building-blocks"
PW = "/home/claude/sec/KCE_Pathways_Curriculum"
BASE = "https://kingcretot.github.io/KCE_Pathways_Curriculum/"

M = {}
for b in ("grade3", "grade4-5"):
    s = open(f"{PW}/{b}/index.html", encoding="utf-8").read()
    for a in re.findall(r'<article class="card[^"]*"[^>]*>.*?</article>', s, re.S):
        h = re.search(r'class="btn primary" href="([^"]+)"', a); pdf = re.search(r"kcePrintPdf\('([^']+)'\)", a)
        if h and pdf: M[f"{b}/{h.group(1)}"] = f"{PW}/{b}/{pdf.group(1)}"

for b in ("grade3", "grade4-5"):   # optional Holiday Culture lessons are not course-page cards
    for h in glob.glob(f"{PW}/{b}/holidays/*.html"):
        pdf = re.search(r"kcePrintPdf\('([^']+)'\)", open(h, encoding="utf-8").read())
        if pdf: M[f"{b}/holidays/{os.path.basename(h)}"] = os.path.normpath(f"{PW}/{b}/holidays/{pdf.group(1)}")
os.makedirs(f"{HERE}/data/printday", exist_ok=True)
who_list = sys.argv[1:] or ["bristol", "bailey", "ethan"]
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page()
    for who in who_list:
        for f in sorted(glob.glob(f"{HERE}/data/{who}_L*.json")):
            L = json.load(open(f)); n = L["n"]
            packet = f"{OUT}/{who}/packet-{n:02d}.html"
            if not os.path.exists(packet): continue
            w = PdfWriter(); contents = []
            pg.goto("file://" + packet); pg.wait_for_timeout(300); pg.emulate_media(media="print")
            pk = PdfReader(io.BytesIO(pg.pdf(format="Letter", print_background=True, prefer_css_page_size=True)))
            for page in pk.pages: w.add_page(page)
            if len(pk.pages) % 2: w.add_blank_page()
            contents.append(f"Lesson {n} Packet ({len(pk.pages)} pages)")
            for a in L.get("also", []):
                u = a["url"]
                if not u.startswith(BASE): continue
                rel = u[len(BASE):].split("#")[0].split("?")[0]
                pdf = M.get(rel)
                if not pdf or not os.path.exists(pdf): print("  no sheet for", rel); continue
                r = PdfReader(pdf)
                for page in r.pages: w.add_page(page)
                if len(r.pages) % 2: w.add_blank_page()
                lab = a["label"]
                opt = lab.startswith("OPTIONAL · ")
                contents.append(("OPTIONAL: " if opt else "") + (lab[len("OPTIONAL · "):] if opt else lab) + f" Pre/Post sheet ({len(r.pages)} pages)")
            out = f"{OUT}/{who}/print-{n:02d}.pdf"
            with open(out, "wb") as fh: w.write(fh)
            json.dump(contents, open(f"{HERE}/data/printday/{who}_L{n:02d}.json", "w"), ensure_ascii=False, indent=1)
            print(who, n, len(w.pages), "pages:", "; ".join(contents))
    br.close()

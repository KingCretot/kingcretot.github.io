#!/usr/bin/env python3
"""Build KCE Building Blocks pages from data/<student>_LNN.json into kgh/building-blocks/<student>/"""
import os as _os
import json, os, sys, glob, html, datetime, shutil
sys.path.insert(0, os.path.dirname(__file__))
from plan import *
OUT = "/home/claude/kgh/building-blocks"
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">'
TOP = '<div class="top"><span class="wm">KingCretot Experience</span><span class="tg"><span class="e">EDUCATE.</span> <span class="m">EMPOWER.</span> <span class="x">EXCEL.</span></span></div><div class="tri"><span class="b"></span><span class="g"></span><span class="r"></span></div>'
E = html.escape

def _extra(who, n):
    p = f"/home/claude/bb_build/data/practice_extra/{who}_L{n:02d}.json"
    return json.load(open(p))["sets"] if _os.path.exists(p) else []



def _printday(who, n):
    p = f"{HERE}/data/printday/{who}_L{n:02d}.json"
    if not os.path.exists(p): return ""
    items = json.load(open(p))
    lst = "".join(f"<li>{E(x)}</li>" for x in items)
    return (f'<a class="b5" href="print-{n:02d}.pdf" target="_blank" rel="noopener">🖨️ Print everything for today</a>'
            f'<details class="pdl"><summary>What prints</summary><ol>{lst}</ol></details>')

READALOUD = {'bristol'}
def _ra(who, data=None):
    if who not in READALOUD: return ''
    noq = '<script>window.KCE_RA_NOQ=true</script>' if isinstance(data, dict) and data.get('ra_noq') else ''
    return '<script>window.KCE_READALOUD=true</script>' + noq + '<script src="clips.js"></script>'


def _breakwork(who, pf):
    p = f"{HERE}/data/breakwork.json"
    if not os.path.exists(p): return ""
    weeks = json.load(open(p)).get(who, {}).get(pf)
    if not weeks: return ""
    out = ('<div class="also" style="margin-top:12px"><span class="optpill">OPTIONAL · STAY SHARP</span>'
           '<p style="margin:6px 0 4px">Light work to keep your skills fresh over the break, about 20 minutes each. The family project comes first. '
           'Do these only if you want to. If a lesson asks for a code, type <b>1111</b>.</p>')
    for i, wk in enumerate(weeks):
        out += f'<p style="margin:8px 0 2px;font-weight:800;color:#0A1F3D">{E(wk["week"])}</p>'
        for j, it in enumerate(wk["items"]):
            ic = "🔢" if it["kind"] == "math" else "🌍"
            out += (f'<label class="task"><input type="checkbox" id="t-{who}-{pf.split(".")[0]}-{i}-{j}"> {ic} '
                    f'<a href="{it["url"]}" target="_blank">{E(it["label"])}</a></label>')
    if any(it["kind"] == "culture" for wk in weeks for it in wk["items"]):
        out += '<p style="margin:8px 0 0;font-size:14px">🌍 The Holiday Culture lesson ends with a family interview: ask someone in your family about one tradition you have at this time of year.</p>'
    return out + '</div>'

def dlabel(iso, short=False):
    d = datetime.date.fromisoformat(iso)
    return d.strftime("%a, %b ") + str(d.day) if short else d.strftime("%A, %B ") + str(d.day) + d.strftime(", %Y")
def mdy(iso):
    d = datetime.date.fromisoformat(iso); return f"{d.month}/{d.day}/{d.year}"

def load(who):
    out = {}
    for f in sorted(glob.glob(f"{HERE}/data/{who}_L*.json")):
        L = json.load(open(f)); out[L["n"]] = L
    return out

def meta(who, n):
    nn, iso, wd, mode = dates_for(who)[n-1]
    w = next(wk for wk, ns in weeks_for(who) if n in ns); t = TOPICS[who][w]
    return dict(n=n, date=iso, wd=wd, mode=mode, week=w, topic=t[0], focus=t[1], color=t[2], links=t[3])

def page(title, body, extra_head=""):
    return f'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)}</title>{FONTS}<link rel="stylesheet" href="../bb.css">{extra_head}</head><body>{body}</body></html>'

def lesson_page(who, L, m, prev, teach=False):
    data = dict(teacherView=teach, student=who, studentName=NAMES[who], id=f"bb-{who}-L{m['n']:02d}", label=f"Lesson {m['n']}", title=L["title"], goal=L["goal"],
                date=m["date"], mastery=MASTERY[who], color=m["color"], slides=(L["teach"]["slides"] if teach else L["slides"]), win=L.get("win", ""),
                prev=(f"bb-{who}-L{prev:02d}" if prev else None), prevTitle=(f"Lesson {prev}" if prev else ""))
    body = (TOP + '<div class="stage"><div class="bar"><a href="index.html" style="font-family:Fredoka,sans-serif;text-decoration:none">🏠</a><div class="prog"><i id="pi"></i></div><span class="stars" id="stars">⭐ 0</span></div><div id="stage"></div></div>'
            '<div class="nav"><button class="back" id="back">⬅ Back</button><button class="next" id="next">Next ➜</button></div>' +
            (_ra(who, L)) + f'<script src="../bb.js"></script><script>BBLesson({json.dumps(data, ensure_ascii=False)});</script>')
    return page(("Class Lesson · " if teach else "") + f"{NAMES[who]} · Lesson {m['n']}: {L['title']}", body)

def practice_page(who, L, m):
    data = dict(studentName=NAMES[who], label=f"Lesson {m['n']}", title=L["title"], mastery=MASTERY[who], color=m["color"], questions=L["practice"]["questions"], id=f"{who}-L{m['n']:02d}", sets=[L["practice"]["questions"]] + _extra(who, m["n"]))
    body = (TOP + f'<div class="stage"><div class="bar"><a href="index.html" style="font-family:Fredoka,sans-serif;text-decoration:none">🏠</a><div class="prog"><i id="pi"></i></div></div>'
            f'<h1 style="color:#0A1F3D;margin:4px 0 2px;font-size:28px">📝 Practice: {E(L["title"])}</h1><p style="margin:0 0 12px;color:#5b6578">{E(L["practice"].get("intro","Three tries on each one. Only your first try counts. Your score goes to KCE."))}</p><div id="stage"></div></div>' +
            (_ra(who, L)) + f'<script src="../bb.js"></script><script>BBPractice({json.dumps(data, ensure_ascii=False)});</script>')
    return page(f"{NAMES[who]} · Practice {m['n']}", body)

PACKET_CSS = """<style>
@page{size:letter;margin:0}
body{background:#e9e4d8;font-size:15px}
.pg{width:8.5in;height:11in;margin:0 auto 20px;background:#fff;padding:0.5in 0.55in;position:relative;overflow:hidden;font-family:Arial,Helvetica,sans-serif}
.ph{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #0A1F3D;padding-bottom:6px;margin-bottom:10px}
.ph .wm{font-family:Georgia,serif;color:#0A1F3D;font-weight:bold;font-size:15px}.ph .wm b{color:#C9A84C}
.nd{font-size:15px;font-family:Arial,sans-serif}.nd span{display:inline-block;border-bottom:2px solid #333;width:2.1in;margin:0 10px 0 4px}.nd span.d{width:1.4in}
.pt{font-family:Fredoka,Arial,sans-serif;font-size:24px;color:#0A1F3D;margin:2px 0 2px}
.sec{margin:10px 0 4px}.sec h3{font-family:Fredoka,Arial,sans-serif;font-size:19px;margin:0 0 2px;color:#0A1F3D}.sec .dir{font-size:15px;margin:0 0 4px;color:#333}
.it{margin:6px 0 4px;font-size:16px}.it .t{font-weight:bold}
.ln{border-bottom:2px solid #9aa3b2;height:0.5in}
.bx{border:2px dashed #9aa3b2;border-radius:10px}
.opt{display:inline-block;border:2px solid #333;border-radius:20px;padding:3px 14px;margin:4px 8px 0 0}
.bank{border:2px solid #C9A84C;border-radius:10px;padding:6px 10px;margin:4px 0;font-size:16px}.bank span{display:inline-block;margin:0 12px}
.mt{display:grid;grid-template-columns:1fr 1fr;gap:4px 40px;font-size:17px}.mt div{padding:7px 0}
.pf{position:absolute;bottom:0.3in;left:0.55in;right:0.55in;font-size:10px;color:#777;text-align:center;border-top:1px solid #ddd;padding-top:4px}
.prt{text-align:center;margin:12px}.prt button{font-family:Fredoka,sans-serif;font-size:20px;background:#0A1F3D;color:#fff;border:none;border-radius:14px;padding:10px 24px;cursor:pointer}
@media print{body{background:#fff}.pg{margin:0;page-break-after:always;box-shadow:none}.prt,.top,.tri{display:none}}
</style>"""

def packet_item(it):
    t = it["type"]; s = '<div class="it">'
    if it.get("text"): s += f'<div class="t">{it["text"]}</div>'
    if t in ("problem", "write", "fill"):
        s += '<div class="ln"></div>' * int(it.get("lines", 1 if t == "fill" else 3))
    elif t == "draw":
        s += f'<div class="bx" style="height:{it.get("height",1.6)}in"></div>'
        s += '<div class="ln"></div>' * int(it.get("lines", 0))
    elif t == "choice":
        s += "".join(f'<span class="opt">{o}</span>' for o in it["options"])
    elif t == "match":
        rows = "".join(f'<div>{a} &nbsp;•</div><div>•&nbsp; {b}</div>' for a, b in zip(it["left"], it["right"]))
        s += f'<div class="mt">{rows}</div>'
    elif t == "bank":
        s += '<div class="bank"><b>Word bank:</b> ' + "".join(f"<span>{w}</span>" for w in it["words"]) + "</div>"
    return s + "</div>"

def packet_page(who, L, m):
    P = L["packet"]; pages = P["pages"]; out = ""
    for i, pg in enumerate(pages, 1):
        out += (f'<div class="pg"><div class="ph"><span class="wm">KingCretot <b>Experience</b> · Building Blocks</span>'
                f'<span class="nd">Name<span></span>Date<span class="d"></span></span></div>')
        if i == 1:
            out += f'<div class="pt">{E(P.get("title", L["title"]))}</div><div style="font-size:14px;color:#555">Lesson {m["n"]} · {dlabel(m["date"])} · Your task list says which page to do and when.</div>'
        for sec in pg:
            out += f'<div class="sec"><h3>{sec["title"]}</h3>' + (f'<p class="dir">{sec["directions"]}</p>' if sec.get("directions") else "")
            out += "".join(packet_item(it) for it in sec["items"]) + "</div>"
        out += f'<div class="pf">KingCretot Experience, LLC · PO Box 2322, Arcadia, FL 34265 · Page {i} of {len(pages)}</div></div>'
    body = TOP + f'<div class="prt"><button onclick="print()">🖨 Print my packet</button> <a href="index.html" style="margin-left:14px">Back to my lessons</a></div>' + out
    return page(f"{NAMES[who]} · Packet {m['n']}", body, PACKET_CSS)

def strip(x):
    import re
    return re.sub(r"\s+", " ", re.sub("<[^>]+>", "", re.sub(r"<br\s*/?>", " ", str(x)))).strip()

def teacher_page(who, L, m):
    T = L["teacher"]
    chk = next(s for s in L["slides"] if s["type"] == "check")
    def ans(q):
        return ("<i>typed:</i> " + " / ".join(E(a) for a in q["answers"])) if q.get("type") == "fill" else f'<b>{"ABCDEFGH"[q["a"]]}.</b> {strip(q["choices"][q["a"]])}'
    sets = chk.get("sets") or [chk["questions"]]
    rows = "".join(f'<tr><th colspan="3">Question set {k} (attempt {k}{", " + str(k+len(sets)) + "…" if len(sets)>1 else ""})</th></tr>' + "".join(f'<tr><td>{i}</td><td>{strip(q["q"])}</td><td>{ans(q)}</td></tr>' for i, q in enumerate(QS, 1)) for k, QS in enumerate(sets, 1))
    psets = [L["practice"]["questions"]] + _extra(who, m["n"])
    prow = "".join((f'<tr><th colspan="3">Practice set {k}</th></tr>' if len(psets) > 1 else '') + "".join(f'<tr><td>{i}</td><td>{strip(q["q"])}</td><td>{ans(q)}</td></tr>' for i, q in enumerate(PS, 1)) for k, PS in enumerate(psets, 1))
    krow = "".join(f'<tr><td>{E(k["item"])}</td><td>{k["answer"]}</td></tr>' for k in T["packet_key"])
    plan = "".join(f'<tr><td style="white-space:nowrap"><b>{E(p["time"])}</b></td><td><b>{p["block"]}</b><br>{p["do"]}</td></tr>' for p in T["plan"])
    also = "".join((f'<li><b>OPTIONAL, self-paced (not taught in class):</b> <a href="{a["url"]}" target="_blank">{E(a["label"][len("OPTIONAL · "):])}</a></li>' if a["label"].startswith("OPTIONAL · ") else f'<li><a href="{a["url"]}" target="_blank">{E(a["label"])}</a>: {a["how"]}</li>') for a in L.get("also", []))
    body = (TOP + '<div class="stage" style="padding-bottom:40px"><div id="tbody" style="display:none">'
        f'<p><a href="index.html">⬅ Course page</a></p><h1 style="color:#0A1F3D;margin:0">Teacher Plan · Lesson {m["n"]}: {E(L["title"])}</h1>'
        f'<p style="color:#5b6578;margin:2px 0 12px">{dlabel(m["date"])} · {m["mode"]} · 60 minutes · Week {m["week"]}: {E(m["topic"])} · Focus: {E(m["focus"])}</p>'
        f'<div class="tip" style="margin:0 0 12px">🎯 <b>Objective:</b> {T["objective"]}<br><b>Student goal:</b> {E(L["goal"])}<br><b>Mastery to unlock the next lesson:</b> {MASTERY[who]}</div>'
        f'<h2 style="color:#0A1F3D">Materials</h2><ul>' + "".join(f"<li>{x}</li>" for x in T["materials"]) + '</ul>'
        f'<h2 style="color:#0A1F3D">60-minute plan</h2><table class="tt">{plan}</table>'
        f'<h2 style="color:#0A1F3D">Watch for</h2><ul>' + "".join(f"<li>{x}</li>" for x in T["watch"]) + '</ul>'
        + (f'<h2 style="color:#0A1F3D">Linked KCE lessons</h2><ul>{also}</ul><p style="font-size:15px">If a linked lesson is locked, the student types <b>1111</b> (you get a Formspree note), or you type 9110.</p>' if also else "")
        + f'<h2 style="color:#0A1F3D">Answer key: Show What You Know (lesson check)</h2><table class="tt"><tr><th>#</th><th>Question</th><th>Answer</th></tr>{rows}</table>'
        f'<h2 style="color:#0A1F3D">Answer key: Practice sets</h2><table class="tt"><tr><th>#</th><th>Question</th><th>Answer</th></tr>{prow}</table>'
        f'<h2 style="color:#0A1F3D">Answer key: Packet</h2><table class="tt"><tr><th>Item</th><th>Answer</th></tr>{krow}</table>'
        f'<h2 style="color:#0A1F3D">Task list given to the student</h2><ul>' + "".join(f"<li>{t}</li>" for t in L["tasks"]) + '</ul>'
        + (f'<div class="tip">📝 {T["notes"]}</div>' if T.get("notes") else "") +
        '</div></div><style>.tt{border-collapse:collapse;width:100%;font-size:16px;background:#fff}.tt td,.tt th{border:1px solid #E2D8C2;padding:7px 9px;vertical-align:top;text-align:left}.tt th{background:#0A1F3D;color:#fff}h2{font-size:22px;margin:20px 0 6px}</style>'
        '<script src="../bb.js"></script><script>BBTeacher();</script>')
    return page(f"Teacher Plan · {NAMES[who]} Lesson {m['n']}", body)

def course_page(who, Ls):
    nm = NAMES[who]
    secs = ""
    for w, ns in weeks_for(who):
        t = TOPICS[who][w]
        secs += f'<section class="wk" style="--acc:{t[2]}"><div class="wkh"><span class="wn">Week {w}</span><h2>{E(t[0])}</h2><span class="ff">Focus: {E(t[1])}</span></div><div class="grid">'
        for n in ns:
            m = meta(who, n); L = Ls.get(n)
            if who in SINGLE:
                dayname = f"Pathways Week {w}"
            else:
                di, dn = day_in_week(n)
                dayname = ["", "Learn it", "Practice it", "Prove it"][di] if dn == 3 else (["", "Learn it", "Prove it"][di] if dn == 2 else "Review")
            prev = n - 1 if n > 1 else None
            head = f'<div class="dt">{E(dlabel(m["date"], True))} · {"💻 Zoom" if m["mode"]=="Zoom" else "🏫 In person"}</div><div class="ln">Lesson {n} · {dayname}</div>'
            if not L:
                secs += f'<div class="card soon">{head}<h3>{E(t[0])}</h3><p class="desc">This lesson is being built. It will be here before {E(dlabel(m["date"], True))}.</p></div>'
                continue
            also = "".join((f'<li class="opt"><span class="optpill">OPTIONAL · SELF-PACED</span><br>🔗 <a href="{a["url"]}" target="_blank">{E(a["label"][len("OPTIONAL · "):])}</a><br><span>{a["how"]}</span></li>' if a["label"].startswith("OPTIONAL · ") else f'<li>🔗 <a href="{a["url"]}" target="_blank">{E(a["label"])}</a><br><span>{a["how"]}</span></li>') for a in L.get("also", []))
            tasks = "".join(f'<label class="task"><input type="checkbox" id="t-{who}-{n}-{i}"> {tk}</label>' for i, tk in enumerate(L["tasks"]))
            wide = who in SINGLE
            c1 = (f'{head}<h3>{E(L["title"])}</h3><div class="gl">🎯 {E(L["goal"])}</div><p class="desc">{L["card"]["desc"]}</p><span class="status"></span>'
                  f'<div class="btns">' + (f'<a class="b4" href="class-{n:02d}.html">🧑‍🏫 Class lesson (teacher leads it)</a>' if L.get("teach") else '') + f'<a class="b1 go-lesson" href="lesson-{n:02d}.html">▶ After-class lesson</a>'
                  f'<a class="b2" href="practice-{n:02d}.html">📝 Practice</a><a class="b2" href="packet-{n:02d}.html">🖨 Packet</a>' + _printday(who, n) + f'<a class="b3" href="teacher-{n:02d}.html">🔒 Teacher plan &amp; key</a></div>')
            c2 = (f'<div class="also"><b>Also do:</b><ul>{also}</ul></div>' if also else "")
            c3 = f'<div class="tasks"><b>✅ Before the next lesson:</b>{tasks}</div>'
            inner = (f'<div class="wcol">{c1}</div><div class="wcol">{c2}</div><div class="wcol">{c3}</div>' if wide else c1 + c2 + c3)
            secs += (f'<div class="card{" wide" if wide else ""}" data-lesson="bb-{who}-L{n:02d}" data-label="Lesson {n}" data-date="{m["date"]}"' + (f' data-prev="bb-{who}-L{prev:02d}"' if prev else "") + '>'
                     + inner + '</div>')
        secs += '</div></section>'
        for pw, pf, ptitle, pdates, pshow, pdesc in PROJECTS.get(who, []):
            if pw == w:
                secs += (f'<section class="wk" style="--acc:#C9A84C"><div class="wkh"><span class="wn">Break</span><h2>{E(ptitle)}</h2><span class="ff">{E(pdates)} · show it at {E(pshow)}</span></div>'
                         f'<div class="grid"><div class="card" style="border-top-color:#C9A84C"><div class="dt">{E(pdates)}</div><div class="ln">Family project · no lessons</div><h3>{E(ptitle)}</h3>'
                         f'<p class="desc">{E(pdesc)}</p>'
                         f'<div class="btns"><a class="b1" href="../projects/{pf}">📋 Open the project plan and worksheets</a></div>' + _breakwork(who, pf) + '</div></div></section>')
    css = """<style>
.hero{max-width:1100px;margin:0 auto;padding:22px 16px 6px}.hero h1{font-size:40px;color:#0A1F3D;margin:0}.hero p{margin:6px 0;font-size:18px}
.note{background:#fff;border:3px solid #EEE4CF;border-radius:20px;padding:12px 16px;margin:12px 0;font-size:16px}
.wk{max-width:1100px;margin:18px auto;padding:0 16px}.wkh{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;border-bottom:4px solid var(--acc);padding-bottom:6px}
.wkh h2{margin:0;font-size:26px;color:#0A1F3D}.wn{background:var(--acc);color:#fff;font-family:Fredoka,sans-serif;border-radius:99px;padding:2px 12px}.ff{color:#5b6578;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-top:12px}
.card{background:#fff;border:3px solid #EEE4CF;border-top:8px solid var(--acc);border-radius:22px;padding:16px}
.card.today{box-shadow:0 0 0 4px var(--acc)}.card.locked .go-lesson{background:#d9d4c7;color:#666}.card.locked .go-lesson:before{content:"🔒 "}
.card.soon{opacity:.75;border-top-style:dashed}
.dt{font-family:Fredoka,sans-serif;color:var(--acc);font-size:18px}.ln{font-size:13px;color:#5b6578;text-transform:uppercase;letter-spacing:1px}
.card h3{margin:4px 0;font-size:23px;color:#0A1F3D}.gl{font-weight:700;font-size:16px}.desc{font-size:16px;margin:6px 0}
.status{display:none;background:#E5F7EC;color:#0d5e33;border-radius:99px;padding:2px 10px;font-size:14px;margin:4px 0}
.btns{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.btns a{text-decoration:none;font-family:Fredoka,sans-serif;border-radius:14px;padding:9px 14px;font-size:17px}
.b1{background:#0A1F3D;color:#fff;flex-basis:100%;text-align:center;font-size:20px!important}.b2{background:#F3EEDF;color:#0A1F3D}.b4{background:#C9A84C;color:#0A1F3D;flex-basis:100%;text-align:center}.b3{background:#fff;border:2px solid #C9A84C;color:#0A1F3D}
.also{background:#F3F8FF;border-radius:14px;padding:8px 12px;font-size:15px;margin:8px 0}.also ul{margin:4px 0;padding-left:4px;list-style:none}.also li{margin:6px 0}.also li.opt{border:2px dashed #C9A84C;border-radius:10px;padding:6px 8px;background:#FFFBF0}.also .optpill{display:inline-block;background:#DB2F30;color:#fff!important;font-weight:800;font-size:12px;letter-spacing:1px;border-radius:999px;padding:2px 10px}.also span{color:#5b6578}.lk{margin:4px 0 0;font-size:14px}.b5{background:#C9A84C!important;color:#0A1F3D!important;font-weight:800}.pdl{font-size:13px;margin:2px 0 6px;color:#5b6578}.pdl summary{cursor:pointer}.pdl ol{margin:4px 0 0 18px;padding:0}
.tasks{background:#FFF8E1;border-radius:14px;padding:8px 12px;font-size:15px}.task{display:block;margin:6px 0;cursor:pointer}.task input{transform:scale(1.3);margin-right:6px}
.foot{background:#0A1F3D;color:#cdd6e4;text-align:center;font-size:13px;padding:14px;margin-top:30px;font-family:Arial,sans-serif}
.card.wide{grid-column:1/-1;display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:18px;align-items:start}
.card.wide .wcol>.also,.card.wide .wcol>.tasks{margin:0}.card.wide .wcol:empty{display:none}
@media(max-width:900px){.card.wide{grid-template-columns:1fr}}
#tmode{background:none;border:none;color:#0047BA;text-decoration:underline;cursor:pointer;font-size:14px}
</style>"""
    intro = ("Every lesson has a date. Get " + str(MASTERY[who]) + " or more on <b>Show What You Know</b> (at the end of the after-class lesson) to open the next lesson.")
    body = (TOP + css + f'<div class="hero"><h1>🧱 {nm}\'s Building Blocks</h1><p>{intro}</p>'
            '<div class="note">🧑‍🏫 <b>Class lesson</b>: your teacher teaches it with you. ▶ <b>After-class lesson</b>: do it on your own after class. 📝 <b>Practice</b>: more work during the week. 🖨 <b>Packet</b>: paper work to print. ✅ <b>Before the next lesson</b>: your to-do list. '
            'You get 3 tries on every question, but only your first try counts. 🔒 Each lesson opens when you score '+str(MASTERY[who])+' or more on the lesson before it. If an <b>Also do</b> lesson is locked, type the code <b>1111</b>.</div></div>' + secs +
            '<p style="text-align:center"><button id="tmode"></button></p><div class="foot">KingCretot Experience, LLC · PO Box 2322, Arcadia, FL 34265 · Step Up For Students · Arizona ESA · West Virginia Hope Scholarship</div>'
            f'<script src="../bb.js"></script><script>BBCourse({{mastery:{MASTERY[who]},studentName:"{nm}"}});</script>')
    return page(f"{nm}'s Building Blocks | KingCretot Experience", body)

def build(who):
    Ls = load(who); d = f"{OUT}/{who}"; os.makedirs(d, exist_ok=True)
    for n, L in Ls.items():
        m = meta(who, n); prev = n - 1 if n > 1 else None
        L.setdefault("also", [])
        open(f"{d}/lesson-{n:02d}.html", "w").write(lesson_page(who, L, m, prev))
        open(f"{d}/practice-{n:02d}.html", "w").write(practice_page(who, L, m))
        open(f"{d}/packet-{n:02d}.html", "w").write(packet_page(who, L, m))
        open(f"{d}/teacher-{n:02d}.html", "w").write(teacher_page(who, L, m))
        if L.get("teach"): open(f"{d}/class-{n:02d}.html", "w").write(lesson_page(who, L, m, prev, teach=True))
    open(f"{d}/index.html", "w").write(course_page(who, Ls))
    return sorted(Ls)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    shutil.copy(f"{HERE}/assets/bb.css", f"{OUT}/bb.css"); shutil.copy(f"{HERE}/assets/bb.js", f"{OUT}/bb.js")
    for who in (sys.argv[1:] or ["bristol", "bailey"]):
        print(who, build(who))
    root = page("KCE Building Blocks", TOP + '<div class="stage" style="text-align:center"><h1 style="color:#0A1F3D;font-size:40px">🧱 KCE Building Blocks</h1><p>Pick your name.</p><p><a class="btn2" style="text-decoration:none;font-size:26px;display:inline-block;margin:10px" href="bristol/index.html">Bristol</a> <a class="btn2" style="text-decoration:none;font-size:26px;display:inline-block;margin:10px;background:#8E44AD" href="bailey/index.html">Bailey</a> <a class="btn2" style="text-decoration:none;font-size:26px;display:inline-block;margin:10px;background:#10AC84" href="ethan/index.html">Ethan</a> <a class="btn2" style="text-decoration:none;font-size:26px;display:inline-block;margin:10px;background:#E84393" href="celine/index.html">Ce&#39;Line</a></p></div>')
    open(f"{OUT}/index.html", "w").write(root.replace('href="../bb.css"', 'href="bb.css"'))
    import protect; print("protected", protect.run([OUT]))   # noindex + KCE copyright notice (Oct 23, 2026)

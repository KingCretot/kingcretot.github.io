#!/usr/bin/env python3
"""Build the two family break projects into kgh/building-blocks/projects/ (shared by Bristol and Bailey)."""
import os, html
from build import page, TOP, FONTS, OUT
E = html.escape

CSS = """<style>
/* KCE type standard on project pages: Arial body, Georgia headings */
body{background:#FFF9EF;font-family:Arial,Helvetica,sans-serif}
body *{font-family:inherit}
h1,h2,h3,h4,.pt,.wkband,table.plan tr.wk td,.mast .n,.kc{font-family:Georgia,'Times New Roman',serif}
.q,.tag,.btnrow button,.ph .for,.who div{font-family:Arial,Helvetica,sans-serif}
/* masthead with KC double-rule monogram */
.top{flex-wrap:wrap;row-gap:4px}
.top .brand{display:inline-flex;align-items:center;gap:10px;min-width:0}
.kc{display:inline-block;border-top:2px solid #C9A84C;border-bottom:2px solid #C9A84C;padding:2px 0;line-height:1;flex:none}
.kc span{display:block;border-top:1px solid #C9A84C;border-bottom:1px solid #C9A84C;padding:3px 7px;color:#C9A84C;font-weight:bold;font-size:15px;letter-spacing:2px;font-family:Georgia,'Times New Roman',serif}
.ph .wm{display:inline-flex;align-items:center;gap:7px}
.kc.sm{padding:1px 0}.kc.sm span{font-size:10px;padding:1px 4px;letter-spacing:1.5px}
@media(max-width:520px){.top{flex-direction:column;align-items:flex-start;padding:8px 16px}.top .tg{padding-left:2px}}
.kcefoot{background:#0A1F3D;color:#cdd6e4;text-align:center;font-size:13px;line-height:1.6;padding:14px 16px;margin-top:30px}
.kcefoot span{display:block}
@media screen and (max-width:880px){.sheets .pg,.planprint .pg{zoom:.7}}
@media screen and (max-width:620px){.sheets .pg,.planprint .pg{zoom:.43}}
.wrap{max-width:1050px;margin:0 auto;padding:18px 16px 40px}
.wrap h1{font-size:36px;color:#0A1F3D;margin:6px 0 4px;font-family:Georgia,serif}
.wrap h2{font-size:25px;color:#0A1F3D;margin:26px 0 8px;font-family:Georgia,serif;border-bottom:4px solid var(--acc);padding-bottom:4px}
.wrap h3{font-size:20px;color:#0A1F3D;margin:16px 0 6px;font-family:Georgia,serif}
.wrap p,.wrap li{font-size:17px;font-family:Arial,sans-serif;line-height:1.45}
.sub{font-size:19px;color:#5b6578;font-family:Arial,sans-serif}
.box{background:#fff;border:3px solid #EEE4CF;border-radius:18px;padding:12px 16px;margin:12px 0}
.box.gold{border-color:#C9A84C;background:#FFF8E1}
.who{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.who div{background:#fff;border:2px solid #EEE4CF;border-radius:14px;padding:8px 10px;font-family:Arial,sans-serif;font-size:15px}.who b{font-size:17px}
.btnrow{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
.btnrow button{font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:18px;border:none;border-radius:14px;padding:10px 16px;cursor:pointer;background:#0A1F3D;color:#fff}
.btnrow button.g{background:#C9A84C;color:#0A1F3D}
table.plan{border-collapse:collapse;width:100%;background:#fff;font-family:Arial,sans-serif;font-size:15.5px}
table.plan th{background:#0A1F3D;color:#fff;text-align:left;padding:8px}
table.plan td{border:1px solid #E2D8C2;padding:8px;vertical-align:top}
table.plan td.d{white-space:nowrap;font-weight:bold;color:#0A1F3D;width:110px}
table.plan td.ck{width:44px;text-align:center}table.plan td.ck input{transform:scale(1.5)}
table.plan tr.wk td{background:var(--acc);color:#fff;font-family:Georgia,serif;font-size:18px;font-weight:bold}
table.plan tr.off td{background:#F3EEDF;color:#5b6578}
.tag{display:inline-block;border-radius:99px;padding:1px 9px;font-size:13px;font-weight:bold;margin-right:4px}
.tB{background:#E3F0FF;color:#0047BA}.tY{background:#FDE7EF;color:#B0124F}.tF{background:#E5F7EC;color:#0d5e33}
@media(max-width:700px){table.plan,table.plan tbody,table.plan tr,table.plan td{display:block;width:auto!important}table.plan th{display:none}table.plan tr{border-bottom:6px solid #FFF9EF}table.plan td.ck{text-align:left}}
/* printable worksheet pages */
.pg{width:8.5in;height:11in;margin:20px auto;background:#fff;padding:0.5in 0.55in;position:relative;overflow:hidden;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.12);font-size:15px}
.ph{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #0A1F3D;padding-bottom:6px;margin-bottom:10px}
.ph .wm{font-family:Georgia,serif;color:#0A1F3D;font-weight:bold;font-size:15px}.ph .wm b{color:#C9A84C}
.ph .for{font-family:Arial,Helvetica,sans-serif;font-size:15px;border-radius:99px;padding:2px 12px;color:#fff;background:#0A1F3D}
.pt{font-family:Georgia,serif;font-size:25px;color:#0A1F3D;margin:2px 0 4px;font-weight:bold}
.dir{font-size:15px;margin:2px 0 8px;color:#333}
.ln{border-bottom:2px solid #9aa3b2;height:0.42in}
.bx{border:2px dashed #9aa3b2;border-radius:10px}
.slips{display:grid;grid-template-columns:1fr 1fr;gap:0}.slip{border:1.5px dashed #9aa3b2;height:1.2in;padding:8px 10px;font-size:14px}.slip .l{border-bottom:1.5px solid #bbb;height:.3in}
table.ws{border-collapse:collapse;width:100%;font-size:15px}table.ws td,table.ws th{border:2px solid #9aa3b2;padding:6px;text-align:left;vertical-align:top}table.ws th{background:#F3EEDF}
/* bar graphs: gridlines are real elements (gradients drop lines in print); left gutter holds the scale numbers */
.gg{position:relative;border-left:2px solid #333;border-bottom:2px solid #333;box-sizing:border-box}
.gg .gline{position:absolute;left:-.12in;right:0;height:0;border-top:1px solid #b5bcc8}
.gg .g0{position:absolute;left:-.24in;bottom:-.09in;font-size:11px;color:#555}
.gg .gcols{position:absolute;inset:0;display:grid}.gg .gcols div{border-right:1px dashed #ccc}
.glab{display:grid;font-size:12.5px;text-align:center;margin-top:3px}
.bank{border:2px solid #C9A84C;border-radius:10px;padding:6px 10px;margin:4px 0 8px;font-size:14px}.bank div{margin:3px 0}
.q{font-weight:bold;margin:8px 0 2px;font-size:15.5px}
.mast{text-align:center;border-bottom:5px double #0A1F3D;margin-bottom:8px}.mast .n{font-family:Georgia,serif;font-size:34px;font-weight:bold;color:#0A1F3D}.mast .s{font-size:13px;letter-spacing:2px;color:#5b6578}
.card2{display:grid;grid-template-columns:1fr 1fr;gap:14px}.tn{border:3px solid #C9A84C;border-radius:12px;padding:10px;height:4.05in}
/* printable plan pages */
.planprint{display:none}
.pf{position:absolute;left:0.55in;right:0.55in;bottom:0.2in;border-top:2px solid #0A1F3D;padding-top:3px;font-size:9px;line-height:1.25;color:#5b6578;display:flex;justify-content:space-between;gap:12px;font-family:Arial,Helvetica,sans-serif}
.pf>div{display:flex;flex-direction:column;white-space:nowrap}.pf .r{text-align:right}
.guide h1{font-size:24px;margin:0 0 2px;font-family:Georgia,serif;color:#0A1F3D}.guide .sub{font-size:13.5px}.guide p,.guide li{font-size:14.5px;line-height:1.4;margin:4px 0}
.guide h3{font-size:17px;margin:12px 0 4px;color:#0A1F3D}.guide .box{padding:6px 10px;margin:6px 0;border-width:2px;border-radius:10px}.guide ul,.guide ol{margin:2px 0;padding-left:20px}
.guide .who{grid-template-columns:repeat(6,1fr);gap:5px}.guide .who div{font-size:11.5px;padding:4px 6px;border-radius:8px}.guide .who b{font-size:13px}
table.pp{border-collapse:collapse;width:100%;font-size:12.5px;table-layout:fixed}table.pp th{background:#0A1F3D;color:#fff;text-align:left;padding:5px 6px;font-size:12.5px}
table.pp td{border:1.5px solid #9aa3b2;padding:6px;vertical-align:top;line-height:1.3}table.pp td.d{font-weight:bold;color:#0A1F3D}table.pp td.ck{text-align:center;font-size:18px}
table.pp tr.off td{background:#F3EEDF;color:#555}
.wkband{font-family:Georgia,serif;font-size:17px;font-weight:bold;color:#fff;background:var(--acc);border-radius:8px;padding:5px 10px;margin:6px 0 8px}
@media print{
 @page{size:letter;margin:0}
 body{background:#fff}
 .top,.tri,.btnrow,.noprint{display:none!important}
 .wrap{display:none!important}
 body.p-plan .sheets{display:none!important}
 body.p-sheets .planprint{display:none!important}
 .planprint{display:block}
 .pg{margin:0;box-shadow:none;page-break-after:always;break-after:page}
 table.plan tr{break-inside:avoid}
}
</style>"""

FAMILY = [("Tia", "Mom"), ("Jerry", "Dad"), ("Bristol", "Writes River's slips"), ("Bailey", "Writes Cam's slips"), ("River", "Dog 🐶"), ("Cam", "Dog 🐶")]

KC = '<span class="kc"><span>KC</span></span>'
# Project-page masthead: KC double-rule monogram beside the wordmark; the tagline stacks under it on phones.
PTOP = TOP.replace('<span class="wm">KingCretot Experience</span>', '<span class="brand">' + KC + '<span class="wm">KingCretot Experience</span></span>')
assert PTOP != TOP
ADDR = "KingCretot Experience, LLC · PO Box 2322, Arcadia, FL 34265 · kingcretot.com"
PROV = "Approved Provider: Step Up For Students · Arizona ESA · West Virginia Hope Scholarship"
SCREEN_FOOT = f'<div class="kcefoot noprint"><span>{ADDR}</span><span>{PROV}</span></div>'

def pf(left, pagetxt):
    """Printed page footer: KCE address + approved-provider line on the left, project title + page number on the right."""
    return f'<div class="pf"><div><span>{ADDR}</span><span>{PROV}</span></div><div class="r"><span>{left}</span><span>{pagetxt}</span></div></div>'

def gridgraph(labels, nlines, step_in, height_in, gutter_in=0.42):
    """Bar-graph grid. The nlines horizontal lines are real bordered elements so every one prints.
    The left gutter (gutter_in) is left blank for the scale numbers the student writes."""
    n = len(labels)
    gl = "".join(f'<div class="gline" style="bottom:{k*step_in:.2f}in"></div>' for k in range(1, nlines + 1))
    cols = f'<div class="gcols" style="grid-template-columns:repeat({n},1fr)">' + '<div></div>' * n + '</div>'
    return (f'<div class="gg" style="height:{height_in}in;margin-left:{gutter_in}in">{cols}{gl}<span class="g0">0</span></div>'
            f'<div class="glab" style="grid-template-columns:repeat({n},1fr);margin-left:{gutter_in}in">' + "".join(f'<div>{t}</div>' for t in labels) + '</div>')

def ph(forwho, title):
    return f'<div class="ph"><span class="wm"><span class="kc sm"><span>KC</span></span><span>KingCretot <b>Experience</b></span></span><span class="for">{forwho}</span></div><div class="pt">{title}</div>'

def lines(n):
    return '<div class="ln"></div>' * n

def plan_table(rows):
    out = '<table class="plan"><tr><th>Day</th><th>Whole family</th><th>Bristol</th><th>Bailey</th><th>Done</th></tr>'
    for i, r in enumerate(rows):
        if r[0] == "WEEK":
            out += f'<tr class="wk"><td colspan="5">{r[1]}</td></tr>'; continue
        d, fam, br, ba = r[:4]
        off = ' class="off"' if len(r) > 4 and r[4] == "off" else ""
        out += f'<tr{off}><td class="d">{d}</td><td>{fam}</td><td>{br}</td><td>{ba}</td><td class="ck"><input type="checkbox" class="dck" data-k="{i}"></td></tr>'
    return out + "</table>"

def plan_pages(title, color, guide_html, rows):
    weeks=[];cur=None
    for r in rows:
        if r[0]=="WEEK": cur=[r[1],[]];weeks.append(cur)
        else: cur[1].append(r)
    total=len(weeks)+1
    out=f'<div class="planprint" style="--acc:{color}">'
    out+=f'<div class="pg guide">{ph("Family guide · for Tia","")}{guide_html}{pf(f"{title} · Family plan", f"Plan page 1 of {total}")}</div>'
    for i,(wt,rs) in enumerate(weeks,2):
        tr=""
        for r in rs:
            off=' class="off"' if len(r)>4 and r[4]=="off" else ""
            tr+=f'<tr{off}><td class="d">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td class="ck">☐</td></tr>'
        out+=(f'<div class="pg">{ph("Family plan · for Tia",E(title))}<div class="wkband">{wt}</div>'
              '<table class="pp"><colgroup><col style="width:1.05in"><col><col><col><col style="width:.45in"></colgroup><tr><th>Day</th><th>Whole family</th><th>Bristol</th><th>Bailey</th><th>Done</th></tr>'
              f'{tr}</table>{pf(f"{title} · Family plan", f"Plan page {i} of {total}")}</div>')
    return out+'</div>'

SCRIPT = """<script>
(function(){var K=document.body.dataset.key;function get(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return {}}}
function put(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
var st=get(),mig=false;document.querySelectorAll('.dck[data-old]').forEach(function(c){var o=c.dataset.old;if(o in st){if(!(c.dataset.k in st))st[c.dataset.k]=st[o];delete st[o];mig=true}});if(mig)put(st);
document.querySelectorAll('.dck').forEach(function(c){c.checked=!!st[c.dataset.k];c.onchange=function(){var o=get();o[c.dataset.k]=c.checked;put(o)}});
window.pr=function(m){document.body.classList.remove('p-plan','p-sheets');document.body.classList.add(m);window.print()};})();
</script>"""

def number_sheets(sheets_html, title):
    parts=sheets_html.split('<div class="pg">')[1:]
    n=len(parts);out=''
    for i,p in enumerate(parts,1):
        p=p[:-6]+pf(f"{title} · Worksheets", f"Page {i} of {n}")+'</div>'
        out+='<div class="pg">'+p
    return out

def build(fname, title, color, key, intro_html, plan_rows, sheets_html):
    guide=intro_html
    sheets_html='<div class="sheets">'+number_sheets(sheets_html, title)+'</div>'
    body = (PTOP + CSS + f'<div class="wrap" style="--acc:{color}">' + intro_html
            + '<div class="btnrow"><button onclick="pr(\'p-plan\')">🖨 Print the day-by-day plan</button><button class="g" onclick="pr(\'p-sheets\')">🖨 Print the worksheets</button></div>'
            + '<h2>Day by day</h2><p class="noprint">Tick each day when it is done. The ticks stay on this device.</p>' + plan_table(plan_rows)
            + '<h2 class="noprint">The worksheets</h2><p class="noprint">These are the pages to print. Each page says whose it is at the top.</p></div>'
            + sheets_html + plan_pages(title, color, guide, plan_rows) + SCREEN_FOOT + SCRIPT)
    write_page(fname, title, key, body)

def write_page(fname, title, key, body):
    html_out = page(title, body).replace(FONTS, "").replace("<body>", f'<body data-key="{key}">')
    d = f"{OUT}/projects"; os.makedirs(d, exist_ok=True)
    open(f"{d}/{fname}", "w").write(html_out)

# ───────────────────────── Project 1: Gratitude (Nov 16 – Dec 2) ─────────────────────────
G_WORDS = [("grateful", "thankful for something"), ("appreciate", "to see the value in something and be glad for it"),
           ("cherish", "to love something and take good care of it"), ("generous", "happy to give or share"),
           ("thoughtful", "thinking about what other people need"), ("fortunate", "lucky"),
           ("treasure", "to value something a lot"), ("acknowledge", "to say out loud that something is true or that someone helped")]

g_intro = f"""
<h1>🫙 The Simon Family Gratitude Project</h1>
<div class="sub">Monday, November 16 – Wednesday, December 2 · The girls present it at <b>Lesson 12 on Thursday, December 3</b></div>
<div class="box gold"><p><b>What it is:</b> For two and a half weeks, the whole family fills a <b>Gratitude Jar</b>. Every day, each person writes one thing they are thankful for, and the girls write slips for River and Cam too. The girls count and sort the slips (math), interview Mom and Dad (speaking and writing), write thank-you notes, and finish with a book (Bristol) and a poster (Bailey) to show at Lesson 12.</p>
<p><b>Time:</b> about 20 minutes a day, plus 5 minutes at dinner for the jar. Thanksgiving week is lighter.</p>
<p><b>The Lesson 11 task list still counts.</b> It is short and already spread over these three weeks. Do it alongside this project.</p></div>
<h3>Who is in it</h3>
<div class="who">{''.join(f'<div><b>{n}</b><br>{r}</div>' for n, r in FAMILY)}</div>
<h3>Supplies</h3>
<ul><li>A clean jar or box with a lid</li><li>Scissors, tape, markers or crayons</li><li>The printed worksheets (use the <b>Print the worksheets</b> button on the project page). Then print these extra copies: page 1 (slips) <b>6 more times</b>, so you have about 84 slips (6 people × 14 days); page 5 and page 6 <b>1 more time each</b> (one interview for Mom, one for Dad); page 7 <b>1 more time</b> (5 thank-you notes in all). You can also cut plain paper into strips for slips.</li>
<li>Bristol: 4 sheets of plain paper, folded in half and stapled, for her book</li><li>Bailey: a poster board or 2 sheets of paper taped together</li>
<li>Envelopes for the thank-you notes</li></ul>
<h3>The jar rules (read these out loud on Day 1)</h3>
<ol><li>Every day, each person writes <b>one</b> slip and puts it in the jar.</li>
<li>Bristol writes one slip for <b>River</b>. Bailey writes one slip for <b>Cam</b>. Write what the dog would be thankful for: "River is thankful for…"</li>
<li><b>Bristol's rule:</b> one full sentence. Start with a capital letter. End with a period. Example: <i>I am thankful for Dad because he makes pancakes.</i></li>
<li><b>Bailey's rule:</b> use the word <b>because</b>, and use one word from the Gratitude Word Bank at least every other day.</li>
<li>At dinner, each person reads their slip out loud. Then it goes in the jar.</li><li><b>Star rule:</b> starting at dinner on Saturday, November 21, everyone draws a <b>★</b> in the corner of every new slip. That way the girls can count Week 1 and Week 2 apart. Everything stays in the same jar the whole time.</li><li>Do not read old slips out loud until Thanksgiving. (Counting them on Saturdays is fine.)</li></ol>
"""

g_rows = [
 ("WEEK", "Week 1 · Fill the jar (Nov 16 – 22)"),
 ("Mon, Nov 16", "Family meeting (10 minutes). Tia leads it. Bailey reads the jar rules out loud. Decorate the jar and tape on the label (bottom of page 1). At dinner, everyone writes and reads the first slip.",
  "Cut out the slips (page 1). Color the jar label. Write River's first slip.", "Read the jar rules out loud at the family meeting. Read the Word Bank (page 2) out loud. Write Cam's first slip."),
 ("Tue, Nov 17 – Fri, Nov 20", "Every dinner: each person writes one slip, reads it, and puts it in the jar.",
  "Write your slip and River's slip. Check: capital letter, period.", "Write your slip and Cam's slip. Use <b>because</b>. Use a Word Bank word every other day."),
 ("Sat, Nov 21", "<b>Count day 1</b> (Saturday morning). Empty the jar on the table. Every slip in it is from Monday to Friday. When the girls finish counting, put all the slips back in the jar. <b>Tonight at dinner, start the star rule:</b> every new slip gets a ★ in the corner.",
  "Make one pile for each person: Mom, Dad, Bristol, Bailey, River, Cam. Count each pile. Fill in <b>Week 1</b> on <b>Count the Slips</b> (page 3).",
  "Sort the same slips by topic. Fill in the <b>Week 1</b> tallies and bar graph on <b>Gratitude by Topic</b> (page 4). Answer the 3 questions."),
 ("Sun, Nov 22", "Jar at dinner. Remember the ★ on every new slip.", "Your slip and River's slip, with a ★.", "Your slip and Cam's slip, with a ★."),
 ("WEEK", "Week 2 · Talk and thank (Nov 23 – 29) · Thanksgiving week"),
 ("Mon, Nov 23", "Jar at dinner.", "Interview <b>Mom</b> (page 5). Ask each question. Write short answers.", "Interview <b>Dad</b> (page 6). Write each answer in a full sentence."),
 ("Tue, Nov 24", "Jar at dinner.", "Interview <b>Dad</b> (second copy of page 5).", "Interview <b>Mom</b> (second copy of page 6)."),
 ("Wed, Nov 25", "Help the girls pick who gets a thank-you note: family who live away, a friend, a neighbor, or a helper (a coach, a mail carrier).",
  "Write <b>2</b> thank-you notes (page 7). Cut them apart. Fold them. Put them in envelopes.", "Write <b>3</b> thank-you notes (page 7). Use one Word Bank word in each note. Cut, fold, and put them in envelopes."),
 ("Thu, Nov 26 · Thanksgiving", "At the Thanksgiving meal, open the jar. Each girl picks <b>3</b> favorite slips and reads them out loud. Put them back in the jar after. Jar at dinner as usual.", "Read 3 slips at the meal.", "Read 3 slips at the meal."),
 ("Fri, Nov 27", "Mail or hand out the thank-you notes.", "Help mail your notes.", "Help mail your notes."),
 ("Sat, Nov 28", "<b>Count day 2</b> (Saturday morning). Empty the jar. Take out only the slips with a <b>★</b>. Those are the Week 2 slips (Saturday Nov 21 to Friday Nov 27). The girls count only the ★ slips. Then put every slip back in the jar.",
  "Make the 6 piles again with only the ★ slips. Fill in <b>Week 2</b> on page 3.", "Sort only the ★ slips by topic. Fill in the <b>Week 2</b> tallies on page 4. Add them to the graph in a second color."),
 ("Sun, Nov 29", "Last jar slips at dinner. The slips from Saturday dinner (Nov 28) and tonight are not counted. They stay in the jar for the book and poster.", "Your last slip and River's last slip.", "Your last slip and Cam's last slip."),
 ("WEEK", "Week 3 · Make it and share it (Nov 30 – Dec 3)"),
 ("Mon, Nov 30", "Help find favorite slips and interview answers to use.",
  "Make <b>My Thankful Book</b> (page 8 plan). Pages for Mom, Dad and Bailey: draw a picture and write one sentence on each.",
  "Write your <b>Gratitude Report</b> paragraph (page 9): a main idea sentence, 3 details from your graph and interviews, and a closing sentence. Use 3 Word Bank words."),
 ("Tue, Dec 1", "No family part today.", "Finish the book: pages for River, Cam and Me, and the cover with the title and your name.", "Make the poster: title, your bar graph, your paragraph, and 3 favorite quotes from the interviews or the jar."),
 ("Wed, Dec 2", "<b>Practice show.</b> The family sits and listens. After each girl, every person says one thing they liked.",
  "Read your book out loud (about 3 minutes).", "Present your poster (about 5 minutes). Look up at the family, not only at the poster."),
 ("Thu, Dec 3", "Have the book, the poster, and pages 3 and 4 ready for Jonathan at Lesson 12.", "Show your book to Jonathan.", "Present your poster to Jonathan."),
]

def g_sheets():
    s = ""
    # p1 slips
    slip = '<div class="slip"><b>From:</b> ______________ &nbsp; <b>Date:</b> ________<div class="l"></div><div class="l"></div></div>'
    s += f'<div class="pg">{ph("Family · print 7 copies in all", "Gratitude Jar Slips")}<p class="dir">Cut on the dashed lines. Each person writes one slip every day. From Saturday, Nov 21 at dinner on, draw a ★ in the corner of every new slip.</p><div class="slips">{slip*12}</div>'
    s += '<div style="margin-top:10px;border:3px solid #C9A84C;border-radius:12px;padding:10px;text-align:center"><div style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#0A1F3D">The Simon Family Gratitude Jar</div><div style="font-size:14px">Tape this label on the jar.</div></div></div>'
    # p2 word bank + rules
    wb = "".join(f'<div><b>{w}</b>: {m}</div>' for w, m in G_WORDS)
    s += f'<div class="pg">{ph("Bailey", "Gratitude Word Bank")}<p class="dir">Use one of these words in your slip at least every other day. Use 3 in your report and one in each thank-you note.</p><div class="bank" style="font-size:16px">{wb}</div>'
    s += '<p class="q">Write a sentence for 4 of the words. Tell something true about your family.</p>' + "".join(f'<p class="q" style="font-weight:normal">{i}. Word: ____________</p>' + lines(2) for i in range(1, 5)) + '</div>'
    # p3 Bristol count
    def countblock(wk):
        rows = "".join(f'<tr><td>{n}</td><td style="width:2.4in"></td></tr>' for n in ["Mom", "Dad", "Bristol", "Bailey", "River", "Cam"])
        return (f'<p class="q">{wk}</p><table class="ws"><tr><th>Pile</th><th>How many slips?</th></tr>{rows}</table>'
                '<p class="q" style="font-weight:normal">Each pile has ______ slips. There are ______ piles.</p><p class="q" style="font-weight:normal">______ × ______ = ______ slips in all.</p>'
                '<p class="q" style="font-weight:normal">Check it: count all the slips one by one. Did you get the same number? &nbsp; Yes &nbsp; / &nbsp; No</p>')
    s += f'<div class="pg">{ph("Bristol", "Count the Slips")}<p class="dir">Make one pile for each person. Count each pile. If every pile has the same number, they are <b>equal groups</b>. Then you can multiply!</p>{countblock("Week 1 (Saturday, Nov 21): all the slips")}{countblock("Week 2 (Saturday, Nov 28): only the slips with a ★")}</div>'
    # p4 Bailey topics
    tops = ["People", "Pets", "Food", "Home", "Fun", "Nature", "Other"]
    trows = "".join(f'<tr><td>{t}</td><td style="width:2in"></td><td style="width:.7in"></td><td style="width:2in"></td><td style="width:.7in"></td></tr>' for t in tops)
    s += (f'<div class="pg">{ph("Bailey", "Gratitude by Topic")}<p class="dir">Sort the slips by what they are about. Make a tally mark for each slip. Then make a bar graph. Use one color for Week 1 and a second color for Week 2. For Week 2, use only the slips with a ★.</p>'
          f'<table class="ws"><tr><th>Topic</th><th>Week 1 tally</th><th>Total</th><th>Week 2 tally</th><th>Total</th></tr>{trows}</table>'
          '<p class="q">Bar graph (each line = 2 slips; for an odd number, color to halfway between two lines)</p>' + gridgraph(tops, 8, 0.32, 2.8) + ''
          '<p class="q">1. Which topic had the most slips in Week 1? ______________</p><p class="q">2. What fraction of all the Week 1 slips were about pets? ______ / ______</p>'
          '<p class="q">3. What is one thing the graph tells you about your family?</p>' + lines(2) + '</div>')
    # p5 Bristol interview
    bq = ["What is one thing you are thankful for?", "What is your favorite thing we do as a family?", "What do you like about River and Cam?", "What is one thing you are thankful for about me?"]
    s += f'<div class="pg">{ph("Bristol · print 2 copies", "My Interview")}<p class="dir">Ask each question. Listen. Write a short answer. You can write just a few words.</p><p class="q">I am interviewing: &nbsp; Mom &nbsp; / &nbsp; Dad &nbsp; (circle one)</p>' + "".join(f'<p class="q">{i}. {q}</p>' + lines(2) for i, q in enumerate(bq, 1)) + '<p class="q">Draw the person you interviewed.</p><div class="bx" style="height:2.4in"></div></div>'
    # p6 Bailey interview
    yq = ["What is something you are grateful for that you did not have when you were my age?", "Who is a person you appreciate, and why?", "What is a family moment you cherish?",
          "What is something River or Cam does that makes you smile?", "What is one way our family is fortunate?", "What is one thing you are thankful for about me?"]
    s += f'<div class="pg">{ph("Bailey · print 2 copies", "Gratitude Interview")}<p class="dir">Ask each question. Write the answer in a full sentence. If the answer is long, write the most important part. Circle your favorite answer.</p><p class="q">I am interviewing: &nbsp; Mom &nbsp; / &nbsp; Dad &nbsp; (circle one)</p>' + "".join(f'<p class="q">{i}. {q}</p>' + lines(2) for i, q in enumerate(yq, 1)) + '</div>'
    # p7 thank-you notes
    note = ('<div class="tn"><div style="font-family:Georgia,serif;font-size:22px;color:#0A1F3D;text-align:center">Thank You!</div><p>Dear ______________________,</p>'
            '<p style="font-size:13px;color:#555">Thank you for ______. It made me feel ______ because ______.</p>' + lines(5) + '<p style="margin-top:10px">From, ______________________</p></div>')
    s += f'<div class="pg">{ph("Bristol and Bailey · print 2 copies", "Thank-You Notes")}<p class="dir">Bristol writes 2 notes. Bailey writes 3 notes. Print this page twice. Cut the notes apart on the lines between them. Fold each note and put it in an envelope.</p><div class="card2">{note*4}</div></div>'
    # p8 Bristol book plan
    bp = ["Cover: My Thankful Book, by Bristol", "Mom", "Dad", "Bailey", "River", "Cam", "Me"]
    s += (f'<div class="pg">{ph("Bristol", "My Thankful Book: Plan")}<p class="dir">Plan each page here first. Then make the book: fold 4 sheets of paper in half and staple the fold. On each page, draw a big picture and write your sentence under it.</p>'
          '<table class="ws"><tr><th style="width:1.4in">Page</th><th>My sentence (capital letter at the start, period at the end)</th></tr>'
          + "".join(f'<tr><td>{p}</td><td style="height:.95in">{"" if i else "Draw a picture of the whole family."}</td></tr>' for i, p in enumerate(bp)) + '</table>'
          '<p class="dir" style="margin-top:8px">Sentence starters: I am thankful for… · I love it when… · ___ is thankful for… because…</p></div>')
    # p9 Bailey report
    s += (f'<div class="pg">{ph("Bailey", "Gratitude Report: Plan")}<p class="dir">Plan your paragraph here. Then copy it neatly onto your poster.</p>'
          '<p class="q">Main idea sentence (what your whole report is about):</p>' + lines(2) +
          '<p class="q">Detail 1 (from your graph):</p>' + lines(2) + '<p class="q">Detail 2 (from an interview):</p>' + lines(2) + '<p class="q">Detail 3 (from the jar):</p>' + lines(2) +
          '<p class="q">Closing sentence:</p>' + lines(2) + '<p class="q">Word Bank words I used: ____________ &nbsp; ____________ &nbsp; ____________</p>'
          '<p class="q">Poster checklist: ☐ Title &nbsp; ☐ Bar graph &nbsp; ☐ Paragraph &nbsp; ☐ 3 favorite quotes &nbsp; ☐ My name</p></div>')
    return s


# ───────────────────────── Project 2: Holiday Gazette (Dec 20 – Jan 3) ─────────────────────────
H_WORDS = [("festive", "cheerful and full of celebration"), ("tradition", "something a family does the same way, again and again, over the years"),
           ("anticipate", "to look forward to something before it happens"), ("reminisce", "to talk or think about happy times from the past"),
           ("resolution", "a promise to yourself to do something better in the new year"), ("jubilant", "very, very happy, like you want to cheer")]

h_intro = f"""
<h1>📰 The Simon Family Holiday Gazette</h1>
<div class="sub">Sunday, December 20 – Sunday, January 3 · The girls present it at <b>Lesson 19 on Monday, January 4 (Zoom)</b></div>
<div class="box gold"><p><b>What it is:</b> The family makes its own holiday newspaper. Bailey is the <b>Editor</b>. Bristol is the <b>Reporter and Pet Columnist</b>. Mom and Dad are interviewed, the family bakes together, River and Cam get their own diary page, everyone does kind acts and sets a goal for 2027, and it all goes into one gazette the girls show on Zoom on January 4.</p>
<p><b>Time:</b> about 20–30 minutes on work days. Christmas Eve, Christmas Day and the day after are <b>off</b> except for the Kindness Log. New Year's Eve and New Year's Day are fully <b>off</b>.</p></div>
<h3>Who is in it</h3>
<div class="who"><div><b>Tia</b><br>Mom · interviewed</div><div><b>Jerry</b><br>Dad · interviewed</div><div><b>Bailey</b><br>Editor</div><div><b>Bristol</b><br>Reporter and Pet Columnist</div><div><b>River</b><br>Dog · diary by Bristol</div><div><b>Cam</b><br>Dog · diary by Bailey</div></div>
<h3>Supplies</h3>
<ul><li>The printed worksheets (use the <b>Print the worksheets</b> button on the project page)</li><li>Pencils, markers or crayons, glue or tape, a stapler</li><li>Ingredients for one family recipe you choose together. Pick one that goes on a tray in rows (cookies, muffins or rolls), so Bristol can do Tray Math.</li><li>A photo of River and Cam (printed), or the girls draw them</li></ul>
<h3>The gazette, page by page</h3>
<ol><li><b>Front Page:</b> "Our Family Tradition" story (Bailey writes it, Bristol draws the picture and writes the caption)</li>
<li><b>Kitchen Corner:</b> the family recipe and the math from baking it</li><li><b>The Pet Page:</b> diaries written by River (Bristol) and Cam (Bailey)</li>
<li><b>Kindness Report:</b> the family's kind acts, counted</li><li><b>Hello, 2027:</b> everyone's goals for the new year</li></ol>
"""

h_rows = [
 ("WEEK", "Week 1 · Interview, write and bake (Dec 20 – 26)"),
 ("Sun, Dec 20", "Family meeting (10 minutes). Tia reads \"The gazette, page by page\" out loud. Put the <b>Kindness Log</b> (page 5) on the fridge. From today through Monday, Dec 28, every person tries to do one kind act a day, and the girls make a tally mark for each one.",
  "Make a tally on the Kindness Log for each kind act.", "Read the Word Bank (page 1) out loud to the family."),
 ("Mon, Dec 21", "Mom and Dad answer the girls' questions about a family tradition.",
  "Listen to the interview. Draw a picture of the tradition in the box on page 2.", "Interview Mom and Dad with the <b>Tradition Interview</b> (page 1). Write their answers."),
 ("Tue, Dec 22", "No family part today.", "Write a 2-sentence caption under your picture (page 2). Capital letters, periods.",
  "Write the front-page story on page 2: a headline that tells the main idea, then a paragraph of 5–7 sentences. Use 2 Word Bank words."),
 ("Wed, Dec 23", "<b>Kitchen day.</b> Bake your family recipe together (one that goes on a tray in rows). The girls help measure.",
  "Before the tray goes in the oven, count it: how many rows, and how many in each row. Fill in <b>Tray Math</b> (page 3).", "Copy the recipe on page 3. Fill in the <b>Double It</b> column for a double batch."),
 ("Thu, Dec 24 – Sat, Dec 26", "<b>Off.</b> Enjoy the holiday. Keep the Kindness Log going.", "Kindness tallies only.", "Kindness tallies only.", "off"),
 ("WEEK", "Week 2 · Pets, kindness and 2027 (Dec 27 – Jan 3)"),
 ("Sun, Dec 27", "<b>Off.</b> Kindness Log.", "", "", "off"),
 ("Mon, Dec 28", "Take or print a photo of River and Cam for the Pet Page.",
  "Write <b>River's Diary</b> on page 4. Write as if you are River. Use <b>I</b>. Write 4–5 sentences about River's holiday.",
  "Write <b>Cam's Diary</b> on page 4. Write as if you are Cam. Use <b>I</b>. Write a full paragraph. Use 1 Word Bank word."),
 ("Tue, Dec 29", "Take the Kindness Log off the fridge. It covers Dec 20 to Dec 28.",
  "Count the tally marks for each person. Write the totals on page 5.", "After Bristol counts, write the <b>Kindness Report</b> on page 5: the total, who did the most, and your favorite kind act. 4–5 sentences."),
 ("Wed, Dec 30", "Every family member answers: What is one goal for 2027?",
  "Ask <b>Mom</b> and <b>Bailey</b> their goal. Write them on page 6. Make up a funny goal for River. Write your own 3 goals.", "Ask <b>Dad</b> and <b>Bristol</b> their goal. Write them on page 6. Make up a funny goal for Cam. Write your own 3 goals, then one sentence that uses <b>resolution</b>."),
 ("Thu, Dec 31 – Fri, Jan 1", "<b>Off.</b> Happy New Year!", "", "", "off"),
 ("Sat, Jan 2", "<b>Put the gazette together.</b> Stack worksheet pages 2 to 6 in order: Front Page, Kitchen Corner, Pet Page, Kindness Log and Report, Hello 2027. Staple them. (Page 1, the interview notes, is not part of the gazette.)",
  "Color your pictures. Check every sentence: capital letter, period.", "Read every page as the Editor. Fix spelling. Write the gazette's name and the date on the front."),
 ("Sun, Jan 3", "<b>Practice show</b> for the family.", "Read River's Diary and show your Tray Math (2–3 minutes).", "Read the front-page story and the Kindness Report (about 5 minutes)."),
 ("Mon, Jan 4", "Lesson 19 is on Zoom. Have the gazette next to the computer before the lesson starts.", "Hold your pages up to the camera and read them.", "Hold your pages up to the camera and present."),
]

def h_sheets():
    s = ""
    wb = "".join(f'<div><b>{w}</b>: {m}</div>' for w, m in H_WORDS)
    iq = ["What is one holiday tradition from when you were a kid?", "What did you anticipate most about the holidays when you were my age?",
          "What is a tradition our family has now?", "Why is it important to you?", "What is a holiday memory you like to reminisce about?"]
    s += (f'<div class="pg">{ph("Bailey", "Tradition Interview + Word Bank")}<div class="bank" style="font-size:15px"><b>Word Bank</b> · use 2 in your story and 1 in Cam\'s Diary{wb}</div>'
          '<p class="dir">Ask Mom and Dad each question. Write the important part of each answer.</p>' + "".join(f'<p class="q">{i}. {q}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div>Mom:{lines(1)}</div><div>Dad:{lines(1)}</div></div>' for i, q in enumerate(iq, 1)) + '</div>')
    s += (f'<div class="pg">{ph("Bailey and Bristol", "Front Page")}<div class="mast"><div class="n">The Simon Family Holiday Gazette</div><div class="s">EDITOR: BAILEY · REPORTER: BRISTOL · DATE: _______________</div></div>'
          '<p class="q">Headline (Bailey):</p><div class="ln" style="height:.5in"></div><p class="q">Story (Bailey):</p>' + lines(9) +
          '<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:8px"><div><p class="q">Picture (Bristol):</p><div class="bx" style="height:2.3in"></div></div><div><p class="q">Caption, 2 sentences (Bristol):</p>' + lines(4) + '</div></div></div>')
    s += (f'<div class="pg">{ph("Bristol and Bailey", "Kitchen Corner")}<p class="q">Recipe name: ___________________________________</p>'
          '<p class="q">Bristol: Tray Math</p><p class="dir">Before the tray goes in the oven, count it.</p><p style="font-size:16px">My tray has ______ rows. Each row has ______. &nbsp; ______ × ______ = ______ in all.</p><p style="font-size:16px">Second tray: ______ rows of ______. &nbsp; ______ × ______ = ______</p><div class="bx" style="height:1.6in"><span style="font-size:13px;color:#777;padding:6px;display:block">Draw tray 1 here. One dot for each one.</span></div>'
          '<p class="q">Bailey: Double It</p><p class="dir">Copy each ingredient. Then write how much you need for a <b>double batch</b> (2 times as much). Example: ¾ cup × 2 = 1½ cups (¾ × 2 means ¾ + ¾).</p>'
          '<table class="ws"><tr><th>Ingredient</th><th>Amount</th><th>Double it</th></tr>' + '<tr><td style="height:.36in"></td><td></td><td></td></tr>' * 8 + '</table></div>')
    s += (f'<div class="pg">{ph("Bristol and Bailey", "The Pet Page")}<div class="bx" style="height:1.7in;margin-bottom:8px"><span style="font-size:13px;color:#777;padding:6px;display:block">Tape the photo of River and Cam here, or draw them.</span></div>'
          '<p class="q">River\'s Diary · by Bristol</p><p class="dir">You are River. Use <b>I</b> and <b>my</b>. What did you see, smell, eat and do this holiday?</p><p style="font-size:15px">Dear Diary,</p>' + lines(5) +
          '<p class="q">Cam\'s Diary · by Bailey</p><p class="dir">You are Cam. Use <b>I</b> and <b>my</b>. Tell about the holiday from a dog\'s point of view. Use 1 Word Bank word.</p><p style="font-size:15px">Dear Diary,</p>' + lines(6) + '</div>')
    names = ["Mom", "Dad", "Bristol", "Bailey", "River", "Cam"]
    krows = "".join(f'<tr><td>{n}</td><td style="height:.42in"></td><td style="width:.8in"></td></tr>' for n in names)
    s += (f'<div class="pg">{ph("Family · on the fridge", "Kindness Log + Kindness Report")}<p class="dir">Dec 20 – Dec 28. Every time someone does a kind act, make a tally mark next to their name. (River and Cam count too, for a good dog thing!)</p>'
          f'<table class="ws"><tr><th>Name</th><th>Tally marks</th><th>Total (Bristol)</th></tr>{krows}</table>'
          '<p class="q">Bristol: Who did the most? ______________ &nbsp; How many in all? ______</p>'
          '<p class="q">Kindness Report · by Bailey</p><p class="dir">4–5 sentences: the total, who did the most, and your favorite kind act and why.</p>' + lines(6) + '</div>')
    grows = "".join(f'<tr><td>{n}</td><td style="height:.5in"></td></tr>' for n in ["Mom (Bristol asks)", "Dad (Bailey asks)", "Bristol (Bailey asks)", "Bailey (Bristol asks)", "River (Bristol makes it up)", "Cam (Bailey makes it up)"])
    col = lambda who: (f'<div><p class="q">{who}\'s 3 goals</p><p style="font-size:14px;margin:4px 0 0">📚 School goal:</p>' + lines(1) + '<p style="font-size:14px;margin:4px 0 0">🏠 Family goal:</p>' + lines(1) + '<p style="font-size:14px;margin:4px 0 0">🎉 Fun goal:</p>' + lines(1) + '</div>')
    s += (f'<div class="pg">{ph("Bristol and Bailey", "Hello, 2027!")}<p class="dir">Ask each person: What is one goal for 2027? Write the answer next to their name.</p><table class="ws"><tr><th style="width:2.3in">Name</th><th>Goal for 2027</th></tr>{grows}</table>'
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">' + col("Bristol") + col("Bailey") + '</div>'
          '<p class="dir" style="margin-top:6px">Bailey: write one sentence that uses the word <b>resolution</b>.</p>' + lines(1) + '</div>')
    return s

if __name__ == "__main__":   # guarded so projects_ethan.py can import the shared helpers
    build("gratitude.html", "Simon Family Gratitude Project", "#C9A84C", "kce_bb_proj_gratitude", g_intro, g_rows, g_sheets())
    build("holiday.html", "Simon Family Holiday Gazette", "#DB2F30", "kce_bb_proj_holiday", h_intro, h_rows, h_sheets())
    print("projects built")

#!/usr/bin/env python3
"""Build Ethan Ferguson's two family break projects into kgh/building-blocks/projects/.
Modeled on projects.py (Simon family). Reuses its CSS, lines(), SCRIPT and number_sheets().
Family facts (Jonathan, Oct 21 2026): Mom = Skyler, Dad = Matt, sister Joyce (about 3-4, youngest), brother Clyde
(about 5-6). Ethan (about 9-10) is the oldest. Tasks are matched to the little ones' ages. Ethan: Pathways Grades 4-5, interests = flight class and jiu-jitsu."""
import os, html, re
from fractions import Fraction as F
from decimal import Decimal as D
from build import page, TOP, OUT
from projects import CSS, lines, SCRIPT, number_sheets, ph as plain_ph, pf, PTOP, SCREEN_FOOT, gridgraph, write_page
E = html.escape

ECSS = """<style>
.ndl{display:flex;gap:18px;font-size:15px;margin:0 0 8px}.ndl span{display:inline-block;border-bottom:2px solid #333;min-width:2.6in;margin-left:4px}.ndl span.d{min-width:0;border:none}
.ndl i{display:inline-block;border-bottom:2px solid #333;width:.45in;margin:0 2px}.ndl i.y{width:.7in}
.tag.tm{background:#E3F0FF;color:#0047BA}
.mm{display:inline-block;font-size:13px;font-weight:bold;color:#0047BA;background:#E3F0FF;border-radius:99px;padding:0 8px;margin-left:4px;white-space:nowrap}
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pb{border:2px solid #9aa3b2;border-radius:10px;padding:6px 9px;height:1.9in;position:relative;font-size:14px}
.pb b.n{color:#0A1F3D}.pb .ans{position:absolute;left:9px;right:9px;bottom:6px;font-weight:bold}
.fold{border-top:2px dashed #DB2F30;margin:10px 0 6px;font-size:12px;color:#DB2F30;text-align:center;padding-top:2px}
.medals{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;justify-items:center}.medal{width:2.2in;height:2.2in;border:3px dashed #9aa3b2;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:13px;padding:10px;box-sizing:border-box}
.medal b{font-family:Georgia,serif;font-size:19px;color:#0A1F3D}
.key td{font-size:13px}
details.key{background:#fff;border:3px solid #EEE4CF;border-radius:18px;padding:10px 16px;margin:14px 0;font-family:Arial,sans-serif}details.key summary{cursor:pointer;font-weight:bold;font-size:17px;color:#0A1F3D}
details.key table{border-collapse:collapse;width:100%;margin-top:8px}details.key td,details.key th{border:1px solid #E2D8C2;padding:6px 8px;text-align:left;vertical-align:top;font-size:15px}details.key th{background:#0A1F3D;color:#fff}
@media print{details.key{display:none!important}}
</style>"""

SIS = "Joyce"
BRO = "Clyde"

def ph(forwho, title):
    """Worksheet header: KCE wordmark, who it is for, title, then Name and Date (month/day/year)."""
    return (plain_ph(forwho, title) +
            '<div class="ndl"><div>Name<span></span></div><div>Date <span class="d"><i></i>/<i></i>/<i class="y"></i></span></div></div>')

def cklist(items):
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:15px;margin:4px 0">' + ''.join(f'<div>☐ {i}</div>' for i in items) + '</div>'

def mins(n): return f'<span class="mm">⏱ {n} min</span>'

MON = {"Nov": (2026, 11), "Dec": (2026, 12), "Jan": (2027, 1)}
def iso(label):
    """'Thu, Nov 12 · Thanksgiving' -> '2026-11-12' (first date in the row label). Used as the tick-box storage key."""
    m = re.match(r"(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (Nov|Dec|Jan) (\d+)", label); y, mo = MON[m.group(2)]
    return f"{y}-{mo:02d}-{int(m.group(3)):02d}"

def plan_table(rows):
    keys = [iso(r[0]) for r in rows if r[0] != "WEEK"]; assert len(keys) == len(set(keys)), "duplicate day keys"
    out = '<table class="plan"><tr><th>Day</th><th>Whole family</th><th>Ethan</th><th>Done</th></tr>'
    for i, r in enumerate(rows):
        if r[0] == "WEEK":
            out += f'<tr class="wk"><td colspan="4">{r[1]}</td></tr>'; continue
        d, fam, et = r[:3]
        off = ' class="off"' if len(r) > 3 and r[3] == "off" else ""
        out += f'<tr{off}><td class="d">{d}</td><td>{fam}</td><td>{et}</td><td class="ck"><input type="checkbox" class="dck" data-k="{iso(d)}" data-old="{i}" aria-label="Done: {E(d)}"></td></tr>'
    return out + "</table>"

def plan_pages(title, color, guide_html, rows, key_html):
    weeks = []; cur = None
    for r in rows:
        if r[0] == "WEEK": cur = [r[1], []]; weeks.append(cur)
        else: cur[1].append(r)
    total = len(weeks) + 2
    out = f'<div class="planprint" style="--acc:{color}">'
    out += f'<div class="pg guide">{plain_ph("Family guide · for Skyler","")}{guide_html}{pf(f"{title} · Family plan", f"Plan page 1 of {total}")}</div>'
    for i, (wt, rs) in enumerate(weeks, 2):
        tr = ""
        for r in rs:
            off = ' class="off"' if len(r) > 3 and r[3] == "off" else ""
            tr += f'<tr{off}><td class="d">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td class="ck">☐</td></tr>'
        out += (f'<div class="pg">{plain_ph("Family plan · for Skyler", E(title))}<div class="wkband">{wt}</div>'
                '<table class="pp"><colgroup><col style="width:1.1in"><col><col><col style="width:.45in"></colgroup><tr><th>Day</th><th>Whole family</th><th>Ethan</th><th>Done</th></tr>'
                f'{tr}</table>{pf(f"{title} · Family plan", f"Plan page {i} of {total}")}</div>')
    out += (f'<div class="pg">{plain_ph("For parents · Skyler", "Answer Key (for parents)")}{key_html}'
            f'{pf(f"{title} · Family plan", f"Plan page {total} of {total}")}</div>')
    return out + '</div>'

def build(fname, title, color, key, intro_html, guide_html, plan_rows, sheets_html, key_html):
    sheets_html = '<div class="sheets">' + number_sheets(sheets_html, title) + '</div>'
    body = (PTOP + CSS + ECSS + f'<div class="wrap" style="--acc:{color}">' + intro_html
            + '<div class="btnrow"><button onclick="pr(\'p-plan\')">🖨 Print the day-by-day plan</button><button class="g" onclick="pr(\'p-sheets\')">🖨 Print the worksheets</button></div>'
            + '<h2>Day by day</h2><p class="noprint">Tick each day when it is done. The ticks stay on this device. The blue tag shows about how long Ethan\'s part takes.</p>' + plan_table(plan_rows)
            + f'<details class="key"><summary>🔑 For parents: answer key (tap to open)</summary>{key_html}</details>'
            + '<h2 class="noprint">The worksheets</h2><p class="noprint">These are the pages to print. Each page says whose it is at the top. Every page has a place for a name and the date.</p></div>'
            + sheets_html + plan_pages(title, color, guide_html, plan_rows, key_html) + SCREEN_FOOT + SCRIPT)
    write_page(fname, title, key, body)

# ───────────── shared helpers ─────────────
def money(x): return f"${D(x):,.2f}"
def mixed(fr):
    fr = F(fr); w, r = divmod(fr.numerator, fr.denominator)
    return (f"{w} {r}/{fr.denominator}" if w and r else (str(w) if not r else f"{r}/{fr.denominator}"))

def word_page(forwho, title, words, try1, try2, use_note):
    """Word Bank on top; fold line; then meanings (shuffled) where Ethan writes each word from memory."""
    bank = "".join(f'<div><b>{w}</b>: {m}</div>' for w, m in words)
    order = [words[i] for i in (3, 0, 5, 2, 4, 1)]
    rows = "".join(f'<tr><td>{i}. {m}</td><td style="width:1.55in;height:.5in"></td><td style="width:1.55in"></td></tr>' for i, (w, m) in enumerate(order, 1))
    return (f'<div class="pg">{ph(forwho, title)}<p class="dir">Read each word and its meaning out loud. {use_note}</p>'
            f'<div class="bank" style="font-size:16px">{bank}</div>'
            '<div class="fold">⤵ FOLD HERE: fold the top of the page back on this line so the Word Bank is hidden ⤵</div>'
            '<p class="q">From memory: read the meaning, then write the word. Spell it exactly. No peeking!</p>'
            f'<table class="ws"><tr><th>Meaning</th><th>Try 1 · {try1}</th><th>Try 2 · {try2}</th></tr>{rows}</table>'
            '<p class="q" style="font-weight:normal">Unfold and check. Try 1: ______ out of 6 &nbsp;&nbsp;&nbsp; Try 2: ______ out of 6</p></div>')

def story_page(forwho, title, prompt):
    def half(who):
        return (f'<div style="border:2px solid #C9A84C;border-radius:12px;padding:8px 12px;margin-bottom:10px">'
                f'<p class="q" style="margin-top:2px">Told by {who} &nbsp;·&nbsp; Written down by Ethan</p>'
                f'<div class="bx" style="height:1.55in"><span style="font-size:13px;color:#777;padding:6px;display:block">{who} draws a picture here.</span></div>'
                + lines(4) + '</div>')
    return (f'<div class="pg">{ph(forwho, title)}<p class="dir">{prompt} Write their words exactly, even the funny parts. Read it back to them to check you got it right.</p>'
            + half(SIS) + half(BRO) + '</div>')

def problems_page(forwho, title, intro, probs):
    boxes = "".join(f'<div class="pb"><b class="n">{i}.</b> {q}<div class="ans">{a}</div></div>' for i, (q, a, _k) in enumerate(probs, 1))
    return f'<div class="pg">{ph(forwho, title)}<p class="dir">{intro}</p><div class="pgrid">{boxes}</div></div>'

def key_table(title, probs):
    return (f'<p class="q">{title}</p><table class="ws key"><tr><th style="width:.35in">#</th><th>Answer</th></tr>'
            + "".join(f'<tr><td>{i}</td><td>{k}</td></tr>' for i, (_q, _a, k) in enumerate(probs, 1)) + '</table>')

# ═════════════════ Project 1: Ferguson Family Feast Planner (Thu Nov 12 – Tue Dec 1) ═════════════════
# Feast Math Warm-Up: every answer computed and checked here.
a1 = 14 * 125; assert a1 == 1750
a2 = 245 * 12; assert a2 == 2940
q3, r3 = divmod(38, 5); assert (q3, r3) == (7, 3)
q4, r4 = divmod(50, 12); packs = q4 + (1 if r4 else 0); assert (q4, r4, packs) == (4, 2, 5)
a5 = F(1, 2) + F(1, 3); assert a5 == F(5, 6)
a6 = F(1, 4) + F(1, 8); left6 = 1 - a6; assert (a6, left6) == (F(3, 8), F(5, 8))
a7 = D("1.79") * 3; assert a7 == D("5.37")
a8 = D("4.25") + D("3.89"); ch8 = D("10.00") - a8; assert (a8, ch8) == (D("8.14"), D("1.86"))
ex_rolls = D("3.49") * 2; assert ex_rolls == D("6.98")
ex_milk = F(3, 4) * 2; assert ex_milk == F(3, 2)

FEAST_PROBS = [
 ("If one serving of mashed potatoes is 125 grams, how many grams do 14 servings take? Use an <b>area model</b> or <b>partial products</b>.", "Answer: ________ grams",
  f"14 × 125 = {a1:,} grams (area model: 10 × 125 = 1,250 and 4 × 125 = 500; 1,250 + 500 = 1,750)"),
 ("✈️ A pilot flies 245 miles on each trip. She makes 12 trips. How many miles is that in all? Use the <b>standard algorithm</b>.", "Answer: ________ miles",
  f"245 × 12 = {a2:,} miles (245 × 2 = 490; 245 × 10 = 2,450; 490 + 2,450 = 2,940)"),
 ("There are 38 rolls for 5 people. Everyone gets the same number. How many rolls does each person get? How many are left over?", "Each: ______ &nbsp; Left over: ______",
  f"38 ÷ 5 = {q3} R{r3}: each person gets {q3} rolls, and {r3} are left over"),
 ("Paper plates come in packs of 12. The family needs 50 plates. How many packs must they buy? Think about the remainder!", "Answer: ________ packs",
  f"50 ÷ 12 = {q4} R{r4}. 4 packs is only 48 plates, so they must buy {packs} packs"),
 ("A recipe uses ½ cup of brown sugar and ⅓ cup of white sugar. How much sugar is that in all? Find a common denominator first.", "Answer: ________ cup",
  f"1/2 + 1/3 = 3/6 + 2/6 = {a5} cup"),
 ("A pie is cut into equal slices. ¼ of the pie is eaten at lunch and ⅛ of the pie is eaten at dinner. What fraction was eaten? What fraction is left?", "Eaten: ______ &nbsp; Left: ______",
  f"1/4 + 1/8 = 2/8 + 1/8 = {a6} eaten; 8/8 − 3/8 = {left6} left"),
 ("If a can of cranberry sauce costs $1.79, how much do 3 cans cost?", "Answer: $ ________",
  f"$1.79 × 3 = {money(a7)}"),
 ("Potatoes cost $4.25 and butter costs $3.89. Line up the decimal points and add. Then: you pay with a $10 bill. How much change do you get back?", "Total: $ ______ &nbsp; Change: $ ______",
  f"$4.25 + $3.89 = {money(a8)}; $10.00 − $8.14 = {money(ch8)} change"),
]

F_WORDS = [("budget", "the amount of money you plan to spend"), ("estimate", "a careful guess that is close to the real number"),
           ("quantity", "how many or how much of something"), ("portion", "the amount of food that one person gets"),
           ("viewpoint", "what one person thinks or believes about something"), ("evidence", "facts or words that show something is true")]

f_who = [("Skyler", "Mom · Co-Planner and Price Checker"), ("Matt", "Dad · Head Taster and Interview Guest"), ("Ethan", "Head Planner · leads the project"),
         (SIS, "Little sister · Table Artist and Taste-Tester"), (BRO, "Little brother · Official Counter and Taste-Tester")]

f_intro = f"""
<h1>🍽️ The Ferguson Family Feast Planner</h1>
<div class="sub">Thursday, November 12 – Tuesday, December 1 · Ethan presents it at <b>Lesson 5 on Wednesday, December 2 (in person)</b></div>
<div class="box gold"><p><b>What it is:</b> Ethan is the <b>Head Planner</b> for one special family meal: your Thanksgiving dinner on Thursday, November 26, or another special family dinner during the break. He plans the menu with the family, finds <b>real store prices</b> and keeps to a budget (money and decimals), makes a recipe big enough for everyone (multiplying and fractions), shares the leftovers fairly (division with remainders), runs a taste-test, and interviews Mom and Dad to compare their two viewpoints. He finishes with a <b>Feast Report poster</b> and presents it in 3 to 5 minutes at Lesson 5.</p>
<p><b>Time:</b> 10 to 25 minutes a day for Ethan. Each day's time is shown in blue. A few days are off.</p>
<p><b>Why it helps:</b> Lesson 5 is the Unit 2 Checkpoint. The Feast Math Warm-Up (page 4) reviews the same skills as Lessons 1 to 4.</p>
<p><b>Thu Nov 12–Tue Nov 17: finish Lesson 4's task list first; the project's daily part is short those days</b> (10 minutes or less).</p>
<p><b>If your feast is on a different day,</b> just move the Feast Day row to that day.</p></div>
<h3>Who is in it</h3>
<div class="who">{''.join(f'<div><b>{n}</b><br>{r}</div>' for n, r in f_who)}</div>
<h3>Supplies</h3>
<ul><li>The printed worksheets (use the <b>Print the worksheets</b> button on this page): 11 pages, printed once. Print page 3 (Price Hunt) twice if your menu has more than 10 items to buy.</li>
<li>A poster board, or 2 sheets of paper taped together</li><li>Markers or crayons, scissors, glue or tape</li>
<li>Measuring cups and spoons (for the recipe you make bigger)</li><li>A store, the store's website, or the weekly ad, to find real prices</li></ul>
<h3>The Head Planner rules</h3>
<ol><li>Every price is a <b>real</b> price. Write it with a $ and two digits after the decimal point, like $3.49.</li>
<li>Do the math by hand first. You can check it with a calculator after.</li>
<li>Joyce and Clyde each pick one dish for the menu.</li>
<li>When you interview someone, write their <b>exact words</b> in quotation marks. That is your evidence.</li></ol>
"""

f_guide = f"""
<h1>🍽️ The Ferguson Family Feast Planner</h1>
<div class="sub">Thu, Nov 12 – Tue, Dec 1 · Ethan presents it at <b>Lesson 5, Wed, Dec 2 (in person)</b></div>
<div class="box gold"><p><b>What it is:</b> Ethan is Head Planner for one special family meal (Thanksgiving dinner on Thu, Nov 26, or another family dinner during the break). He plans the menu, finds real prices and keeps to a budget, makes a recipe bigger, shares leftovers fairly, runs a taste-test, interviews Mom and Dad, and makes a Feast Report poster.</p>
<p><b>Time:</b> 10 to 25 minutes a day for Ethan (shown on each day). Page 4 reviews Lessons 1 to 4 before the Unit 2 Checkpoint at Lesson 5. <b>Thu Nov 12–Tue Nov 17: finish Lesson 4's task list first; the project's daily part is short those days.</b></p></div>
<h3>Who is in it</h3><div class="who" style="grid-template-columns:repeat(5,1fr)">{''.join(f'<div><b>{n}</b><br>{r}</div>' for n, r in f_who)}</div>
<h3>Supplies</h3><ul><li>The 11 printed worksheets (page 3 twice if you buy more than 10 items)</li><li>Poster board or 2 sheets of paper taped together; markers, scissors, glue or tape</li><li>Measuring cups and spoons; a store, its website, or the weekly ad for prices</li></ul>
<h3>Head Planner rules</h3><ol><li>Every price is a real price, written like $3.49.</li><li>Math by hand first, then check with a calculator.</li><li>Joyce and Clyde each pick one dish.</li><li>Interview answers: write exact words in quotation marks.</li></ol>
<h3>What to bring on Wed, Dec 2</h3><p>The poster and worksheet pages 1 to 11.</p>
"""

f_rows = [
 ("WEEK", "Week 1 · Plan the feast (Thu, Nov 12 – Sun, Nov 15) · Lesson 4's task list comes first"),
 ("Thu, Nov 12", "<b>Family meeting</b> (10 minutes). Skyler reads \"What it is\" out loud. Choose the feast: Thanksgiving dinner on Thu, Nov 26, or another special family dinner. Joyce and Clyde each pick one dish.",
  "Lesson 4's task list first. Then lead the meeting with Mom and fill in <b>Feast Crew and Menu</b> (page 1) as the family decides." + mins(10)),
 ("Fri, Nov 13", "No family part today.", "Lesson 4's task list first. Then <b>Feast Math Warm-Up</b> (page 4), problems 1 and 2. Show your work in each box." + mins(10)),
 ("Sat, Nov 14", "<b>Price hunt.</b> Mom or Dad and Ethan look up prices: at the store, on the store's website, or in the weekly ad. Joyce and Clyde help spot the items.",
  "Lesson 4's task list first. On <b>Price Hunt</b> (page 3), write each item, its size, its real price, and how many you need. No math yet." + mins(10)),
 ("Sun, Nov 15", "Joyce draws the menu picture on page 1.", "Lesson 4's task list first. Read the Word Bank (page 2) out loud to the family. Then <b>Word Bank, Try 1</b>: fold the page and write each word from memory." + mins(10)),
 ("WEEK", "Week 2 · Do the math (Mon, Nov 16 – Sun, Nov 22)"),
 ("Mon, Nov 16", "Mom or Dad tells Ethan the budget: how much money the family wants to spend on the feast.",
  "Lesson 4's task list first. On page 3, write the budget. Then fill in the <b>Cost</b> column: price × how many." + mins(10)),
 ("Tue, Nov 17", "No family part today.", "Lesson 4's task list first. Then <b>Feast Math Warm-Up</b> (page 4), problems 3 and 4." + mins(10)),
 ("Wed, Nov 18", "No lesson today.", "Finish <b>Price Hunt</b> (page 3): add the costs with the decimal points lined up, and compare the total with the budget." + mins(15)),
 ("Thu, Nov 19", "Mom and Dad each answer Ethan's 3 interview questions (about 5 minutes each).", "<b>Viewpoint Interview</b> (page 7). Write their exact words in quotation marks." + mins(15)),
 ("Fri, Nov 20", "No family part today.", "<b>Two Viewpoints, One Feast</b> (page 8): fill in the plan at the top. Then <b>Word Bank, Try 2</b> (page 2)." + mins(25)),
 ("Sat, Nov 21", "No family part today.", "Write your paragraph on page 8. Use the words <b>viewpoint</b> and <b>evidence</b>. Read it out loud and check: a main idea sentence, evidence in quotation marks, and a closing sentence." + mins(20)),
 ("Sun, Nov 22", "<b>Off.</b> Family day.", "", "off"),
 ("WEEK", "Week 3 · Feast week (Mon, Nov 23 – Sun, Nov 29)"),
 ("Mon, Nov 23", "Help Ethan choose one real recipe from the menu.", "<b>Scale It Up</b> (page 5): make the recipe big enough for everyone." + mins(20)),
 ("Tue, Nov 24", "Whenever you shop this week, Ethan brings Price Hunt (page 3) and checks off each item.",
  "<b>Feast Math Warm-Up</b> (page 4), problems 5 to 8." + mins(20) + "<br>Whenever you shop, fill in the bottom of page 3: the real total on the receipt, and how far off your estimate was." + mins(5)),
 ("Wed, Nov 25", "No lesson today. Get the table ready: Clyde counts plates, forks and cups (one for each person), then writes a name card for each person (a grown-up can help with the letters). Joyce decorates the name cards.",
  "Help measure the recipe with your <b>Scale It Up</b> amounts (page 5)." + mins(15)),
 ("Thu, Nov 26 · Thanksgiving", "<b>Feast day!</b> At the meal, everyone rates each dish on the <b>Taste-Test Scorecard</b> (page 9). Enjoy!", "Run the taste-test. Write every score in the table." + mins(10)),
 ("Fri, Nov 27", "Leftovers! Clyde counts the leftover rolls (or cookies, or slices). Joyce colors the pie picture.",
  "<b>Fair Share</b> (page 6)." + mins(15)),
 ("Sat, Nov 28", "Joyce tells Ethan the story of the feast.", "<b>Little Storytellers</b> (page 10, top half): write down Joyce's story. Then add up the taste-test scores and answer the questions on page 9." + mins(25)),
 ("Sun, Nov 29", "Clyde tells Ethan the story of the feast.", "<b>Little Storytellers</b> (page 10, bottom half): write down Clyde's story. Then start your poster: fill in <b>Feast Report: Poster Plan</b> (page 11)." + mins(25)),
 ("WEEK", "Week 4 · Make it and show it (Mon, Nov 30 – Wed, Dec 2)"),
 ("Mon, Nov 30", "No family part today.", "Make the poster from your plan on page 11. Use the checklist." + mins(20)),
 ("Tue, Dec 1", "<b>Practice show.</b> The family sits and listens. After Ethan presents, each person says one thing they liked.",
  "Practice presenting the poster in 3 to 5 minutes. Look at the family, not only at the poster. Pack the poster and pages 1 to 11." + mins(15)),
 ("Wed, Dec 2", "Lesson 5 is in person. Send the poster and the worksheets with Ethan.", "Present your Feast Report poster to Jonathan (3 to 5 minutes). Then do the Unit 2 Checkpoint."),
]

def f_sheets():
    s = ""
    # p1 crew + menu
    crew = [("Head Planner (that's you!)", "Ethan"), ("Co-Planner and Price Checker", "Mom (Skyler)"), ("Head Taster and Interview Guest", "Dad (Matt)"),
            ("Table Artist and Taste-Tester", SIS), ("Official Counter and Taste-Tester", BRO)]
    crows = "".join(f'<tr><td>{j}</td><td style="width:2.2in">{w}</td></tr>' for j, w in crew)
    menu = ["Main dish", "Side dish", "Side dish", "Side dish", "Bread", "Dessert", "Drink"]
    mrows = "".join(f'<tr><td style="width:1.3in">{c}</td><td style="height:.36in"></td><td style="width:1.8in"></td></tr>' for c in menu)
    s += (f'<div class="pg">{ph("Ethan", "Feast Crew and Menu")}<p class="dir">Here is your Feast Crew. Read each job out loud to the family. Then write the menu together.</p>'
          f'<table class="ws"><tr><th>Job</th><th>Who</th></tr>{crows}</table>'
          '<p class="q">Our feast is on ____________________ (day and date). &nbsp; ______ people will eat.</p>'
          f'<table class="ws"><tr><th>Course</th><th>Dish</th><th>Who picked it?</th></tr>{mrows}</table>'
          '<p class="q">Menu art by Joyce:</p><div class="bx" style="height:1.75in"></div></div>')
    # p2 word bank
    s += word_page("Ethan", "Feast Word Bank", F_WORDS, "Sun, Nov 15", "Fri, Nov 20", "Use at least 2 of these words on your poster.")
    # p3 price hunt
    prow = '<tr><td style="height:.38in"></td><td></td><td></td><td></td><td></td></tr>' * 10
    s += (f'<div class="pg">{ph("Ethan + Mom", "Price Hunt")}<p class="dir">Find the <b>real</b> price of each thing you need: at the store, on the store\'s website, or in the weekly ad. Write money with a $ and two digits after the decimal point. Then multiply: price × how many = cost.</p>'
          f'<div class="box" style="margin:4px 0 8px;font-size:14px;padding:6px 10px"><b>Example:</b> rolls cost $3.49 a bag. We need 2 bags. &nbsp; $3.49 × 2 = {money(ex_rolls)}</div>'
          f'<table class="ws"><tr><th>Item</th><th style="width:1.2in">Size (like 5 lb)</th><th style="width:1.05in">Price for one</th><th style="width:.8in">How many</th><th style="width:1.05in">Cost</th></tr>{prow}</table>'
          '<p class="q">Add all the costs. Line up the decimal points! &nbsp; Total: $ ____________</p>'
          '<p class="q">Our budget: $ ____________</p><p class="q">Are we over or under? ____________ &nbsp; By how much? $ ____________</p>'
          '<p class="q" style="font-weight:normal">Show the subtraction here:</p><div class="bx" style="height:.75in"></div>'
          '<p class="q">After shopping: the real total on the receipt was $ ____________.</p><p class="q">My estimate was off by $ ____________.</p></div>')
    # p4 warm-up
    s += problems_page("Ethan", "Feast Math Warm-Up", "These are like the problems from Lessons 1 to 4. Show your work in each box. Write your answer on the line, with the unit (grams, miles, $, cups).", FEAST_PROBS)
    # p5 scale it up
    srow = '<tr><td style="height:.38in"></td><td></td><td style="width:.8in"></td><td></td></tr>' * 8
    s += (f'<div class="pg">{ph("Ethan", "Scale It Up")}<p class="dir">Pick one real recipe from your menu. Copy each ingredient. Then make it big enough for everyone.</p>'
          f'<div class="box" style="margin:4px 0 8px;font-size:14px;padding:6px 10px"><b>Example:</b> a recipe serves 4 and uses ¾ cup of milk. We need 8 servings, so we multiply by 2. &nbsp; ¾ × 2 means ¾ + ¾ = 6/4 = {mixed(ex_milk)} cups.</div>'
          '<p class="q">Recipe name: ______________________________</p>'
          '<p class="q" style="font-weight:normal">The recipe serves ______ people. We need ______ servings. ______ ÷ ______ = ______, so I multiply every amount by ______.</p>'
          '<p class="dir">If the division does not come out even, round up. A little extra food is better than not enough! <b>Fraction × whole number:</b> ¾ × 2 means ¾ + ¾. Add the fraction that many times.</p>'
          f'<table class="ws"><tr><th>Ingredient</th><th style="width:1.5in">Amount in the recipe</th><th>× ___</th><th style="width:1.7in">New amount</th></tr>{srow}</table>'
          '<p class="q">Fraction check: find two amounts in your new recipe that use the same unit (like cups). Add them. If the denominators are different, find a common denominator first.</p>'
          '<div class="bx" style="height:1.1in"></div></div>')
    # p6 fair share
    pie = ('<svg width="190" height="190" viewBox="-100 -100 200 200" style="display:block;margin:4px auto"><circle r="94" fill="#fff" stroke="#333" stroke-width="3"/>'
           + "".join(f'<line x1="0" y1="0" x2="{94*__import__("math").cos(k*3.14159265/4):.1f}" y2="{94*__import__("math").sin(k*3.14159265/4):.1f}" stroke="#333" stroke-width="2"/>' for k in range(8)) + '</svg>')
    s += (f'<div class="pg">{ph("Ethan + Joyce + Clyde", "Fair Share")}'
          '<p class="q">Part 1 · Share the leftovers</p><p class="dir">Clyde counts the leftovers (rolls, cookies, or slices). Ethan divides them so everyone gets the same number.</p>'
          '<p class="q" style="font-weight:normal">We have ______ ______________ (what?) for ______ people.</p>'
          '<p class="q" style="font-weight:normal">______ ÷ ______ = ______ R ______</p>'
          '<p class="q" style="font-weight:normal">Each person gets ______. There are ______ left over.</p>'
          '<p class="q">What should we do with the leftover ones? Save them, share them with someone, or cut them into pieces? Explain.</p>' + lines(2) +
          '<p class="q">Part 2 · The pie picture</p><p class="dir">Ethan counts the slices of pie (or cake) that were eaten and points to one slice on the picture for each; Joyce colors each slice he points to. If your pie was not cut into 8 slices, draw your own pie on the back.</p>' + pie +
          '<p class="q" style="font-weight:normal">______ of 8 slices were eaten. &nbsp; Eaten: ______ / 8 &nbsp;&nbsp; Left: ______ / 8</p>'
          '<p class="q">Can you write the eaten fraction a simpler way? (Example: 4/8 = 1/2)</p>' + lines(1) + '</div>')
    # p7 interview
    iq = ["What is the most important part of a great family meal: the food, the people, or something else? Why?",
          "Should a holiday meal be fancy or simple? Why?", "What is one thing you would change about how we do holiday meals?"]
    s += (f'<div class="pg">{ph("Ethan interviews Mom and Dad", "Viewpoint Interview")}<p class="dir">Ask Mom and Dad these 3 questions (about 5 minutes each). Write the most important words they say. Put their exact words in quotation marks: "like this." These words are your <b>evidence</b>.</p>'
          + "".join(f'<p class="q">{i}. {q}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div>Mom:{lines(3)}</div><div>Dad:{lines(3)}</div></div>' for i, q in enumerate(iq, 1)) + '</div>')
    # p8 two viewpoints
    s += (f'<div class="pg">{ph("Ethan", "Two Viewpoints, One Feast")}<p class="dir">Use your interview (page 7). Plan first. Then write one paragraph.</p>'
          '<table class="ws"><tr><th style="width:50%">Mom\'s viewpoint</th><th>Dad\'s viewpoint</th></tr><tr><td style="height:.55in"></td><td></td></tr>'
          '<tr><th>Evidence: her exact words</th><th>Evidence: his exact words</th></tr><tr><td style="height:.55in"></td><td></td></tr></table>'
          '<p class="q">How are their viewpoints the same? How are they different?</p>' + lines(1) +
          '<p class="q">My paragraph</p><p class="dir">1. Main idea sentence. 2. Mom\'s viewpoint and her evidence. 3. Dad\'s viewpoint and his evidence. 4. How they are alike or different. 5. Your own viewpoint. Use the words <b>viewpoint</b> and <b>evidence</b>.</p>'
          + lines(10) + '</div>')
    # p9 taste test
    trow = '<tr><td style="height:.48in"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' * 8
    s += (f'<div class="pg">{ph("Whole family", "Taste-Test Scorecard")}<p class="dir">At the feast, everyone rates each dish. Mom, Dad and Ethan give 1 to 5 stars. Joyce and Clyde point to a face, and Ethan writes the stars: 😀 = 5 &nbsp; 🙂 = 4 &nbsp; 😐 = 3 &nbsp; 🙁 = 2 &nbsp; 😖 = 1</p>'
          f'<table class="ws"><tr><th>Dish</th><th style="width:.7in">Mom</th><th style="width:.7in">Dad</th><th style="width:.7in">Ethan</th><th style="width:.8in">Joyce</th><th style="width:.85in">Clyde</th><th style="width:.7in">Total</th></tr>{trow}</table>'
          '<p class="q">1. Which dish got the highest total? ____________________ &nbsp; How many stars? ______</p>'
          '<p class="q">2. Which dish got the lowest total? ____________________</p>'
          '<p class="q">3. 5 people × 5 stars = 25 stars is a perfect score.<br>Write the top dish\'s score as a fraction: ______ / 25</p>'
          '<p class="q">4. Write one main idea sentence about what the family liked best.</p>' + lines(3) + '</div>')
    # p10 stories
    s += story_page("Ethan + Joyce + Clyde", "Little Storytellers", "Ask Joyce, then Clyde: <i>What was your favorite part of the feast? What happened?</i>")
    # p11 poster plan
    s += (f'<div class="pg">{ph("Ethan", "Feast Report: Poster Plan")}<p class="dir">Plan your poster here. You will present it in 3 to 5 minutes at Lesson 5.</p>'
          '<p class="q">Main idea sentence (what your whole poster is about):</p>' + lines(2) +
          '<p class="q">Detail 1 · The budget (total cost, budget, over or under):</p>' + lines(2) +
          '<p class="q">Detail 2 · The recipe I made bigger (show one step of the math):</p>' + lines(2) +
          '<p class="q">Detail 3 · The taste-test winner:</p>' + lines(1) +
          '<p class="q">Detail 4 · Two viewpoints (one sentence about Mom\'s and Dad\'s views):</p>' + lines(2) +
          '<p class="q">Poster checklist</p>' + cklist(["Title: The Ferguson Family Feast", "The menu, with Joyce\'s art", "Price Hunt total and budget", "One math example, step by step", "Taste-test winner", "Your Two Viewpoints paragraph", "2 Word Bank words", "Your name"]) +
          '<p class="q">Bring to Lesson 5 (Wed, Dec 2): ☐ the poster &nbsp; ☐ worksheet pages 1 to 11</p></div>')
    return s

f_key = ('<p class="dir">Feast Math Warm-Up (worksheet page 4). Price Hunt, Scale It Up, Fair Share and the taste-test use your family\'s own numbers, so check those by redoing the math together.</p>'
         + key_table("Feast Math Warm-Up", FEAST_PROBS))

# ═════════════════ Project 2: Ferguson Family Winter Games (Thu Dec 17 – Tue Jan 5) ═════════════════
b1 = 165 * 24; assert b1 == 3960
b2 = 46 * 37; assert b2 == 1702
q3b, r3b = divmod(87, 8); assert (q3b, r3b) == (10, 7)
h4, m4 = divmod(140, 60); assert (h4, m4) == (2, 20)
b5 = F(3, 4) + F(2, 3); assert b5 == F(17, 12) and mixed(b5) == "1 5/12"
b6 = F(3, 4) - F(5, 8); assert b6 == F(1, 8)
hang = [D("2.4"), D("1.85"), D("2.09")]; order = sorted(hang, reverse=True); assert order == [D("2.4"), D("2.09"), D("1.85")]
b8 = D("2.5") * D("1.4"); assert b8 == D("3.5")
ex_sock = (F(7, 10), F(4, 6)); assert ex_sock[0] == F(21, 30) and ex_sock[1] == F(20, 30) and ex_sock[0] > ex_sock[1]
place_pts = [5, 4, 3, 2, 1]; one_event = sum(place_pts); assert one_event == 15 and one_event * 3 == 45 and 5 * 3 == 15

GAMES_PROBS = [
 ("✈️ A small plane flies 165 miles a day for 24 days. How many miles is that in all? Use the <b>standard algorithm</b>.", "Answer: ________ miles",
  f"165 × 24 = {b1:,} miles (165 × 4 = 660; 165 × 20 = 3,300; 660 + 3,300 = 3,960)"),
 ("🥋 A gym floor is 46 feet long and 37 feet wide. What is its area? Use an <b>area model</b>.", "Answer: ________ square feet",
  f"46 × 37 = {b2:,} square feet (40 × 30 = 1,200; 40 × 7 = 280; 6 × 30 = 180; 6 × 7 = 42; total 1,702)"),
 ("🥋 87 students line up in rows of 8. How many full rows are there? How many students are in the last, short row?", "Full rows: ______ &nbsp; Last row: ______",
  f"87 ÷ 8 = {q3b} R{r3b}: {q3b} full rows, and {r3b} students in the last row"),
 ("✈️ A flight lasts 140 minutes. How many hours and minutes is that? (60 minutes = 1 hour)", "Answer: ______ hours ______ minutes",
  f"140 ÷ 60 = {h4} R{m4}: {h4} hours {m4} minutes"),
 ("A student practices for ¾ hour on Monday and ⅔ hour on Tuesday. How long is that in all? Write it as a mixed number.", "Answer: ________ hours",
  f"3/4 + 2/3 = 9/12 + 8/12 = 17/12 = {mixed(b5)} hours"),
 ("Plane A flies ¾ of the way down the hall. Plane B flies ⅝ of the way. Which plane flies farther? By how much?", "Plane: ______ &nbsp; By: ______",
  f"Plane A. 3/4 = 6/8, and 6/8 − 5/8 = {b6} of the hall"),
 ("Hang times: 2.4 seconds, 1.85 seconds, 2.09 seconds. Put them in order from <b>longest</b> to <b>shortest</b>. Tip: write 2.4 as 2.40.", "Order: ________, ________, ________",
  "2.4 s, 2.09 s, 1.85 s (2.40 > 2.09 > 1.85)"),
 ("A paper plane flies 2.5 meters. A bigger plane flies 1.4 times as far. How far does the bigger plane fly?", "Answer: ________ meters",
  f"2.5 × 1.4 = {b8} meters (25 × 14 = 350, then 2 decimal places: 3.50)"),
]

G_WORDS = [("sportsmanship", "playing fair and being kind, whether you win or lose"), ("persevere", "to keep trying, even when something is hard"),
           ("accurate", "exactly right, with no mistakes"), ("data", "facts and numbers that you collect"),
           ("compete", "to try to win against others"), ("discipline", "making yourself practice and follow the rules, even when you don't feel like it")]

w_who = [("Skyler", "Mom · Scorekeeper and Measurer"), ("Matt", "Dad · Head Judge and Timer"), ("Ethan", "Games Director · leads the project"),
         (SIS, "Little sister · Medal Designer and Artist"), (BRO, "Little brother · Official Counter and Cheer Captain")]

w_intro = f"""
<h1>🏅 The Ferguson Family Winter Games</h1>
<div class="sub">Thursday, December 17 – Tuesday, January 5 · Ethan presents it at <b>his first January lesson, Wednesday, January 6 (in person)</b></div>
<div class="box gold"><p><b>What it is:</b> Ethan is the <b>Games Director</b> of a family Winter Games with three events: <b>Paper Airplane Distance</b> ✈️, <b>Paper Airplane Hang Time</b>, and the <b>Sock Toss</b>. Everyone plays. Ethan measures and records the data, makes a bar graph, turns places into points (adding and multiplying), compares decimals and fractions, collects quotes, and writes a news report. Every event starts and ends with a bow or a handshake, the way it is done on the jiu-jitsu mat. It all goes into a stapled <b>Winter Games Record Book</b> that Ethan presents in 3 to 5 minutes on January 6.</p>
<p><b>Time:</b> 10 to 25 minutes a day for Ethan, shown in blue. <b>Christmas Eve, Christmas Day and New Year's Day are off.</b></p></div>
<h3>Who is in it</h3>
<div class="who">{''.join(f'<div><b>{n}</b><br>{r}</div>' for n, r in w_who)}</div>
<h3>Supplies</h3>
<ul><li>The printed worksheets (use the <b>Print the worksheets</b> button on this page): 14 pages, printed once</li>
<li>Plain paper for paper airplanes (a few sheets for each person)</li><li>A tape measure, and masking tape or painter's tape for a start line</li>
<li>A phone or watch with a stopwatch</li><li>A few pairs of rolled-up socks and a laundry basket</li>
<li>Crayons or markers, scissors, a stapler, and ribbon or string for the medals</li></ul>
<h3>The Respect Rules (Ethan reads these out loud on Day 1)</h3>
<ol><li>Bow or shake hands before and after every event.</li><li>Cheer for everybody, not only the winner.</li>
<li><b>Little-kid rule:</b> grown-ups and Ethan stand behind the start line; Joyce and Clyde start closer. Ethan decides how much closer.</li>
<li>Measure carefully and write every number down exactly.</li><li>The Head Judge (Dad) has the final say.</li></ol>
"""

w_guide = f"""
<h1>🏅 The Ferguson Family Winter Games</h1>
<div class="sub">Thu, Dec 17 – Tue, Jan 5 · Ethan presents it at <b>his first January lesson, Wed, Jan 6 (in person)</b></div>
<div class="box gold"><p><b>What it is:</b> Ethan is Games Director of a family Winter Games: Paper Airplane Distance, Paper Airplane Hang Time, and the Sock Toss. He records the data, makes a bar graph, scores the events, collects quotes, writes a news report, and puts it all in a stapled Winter Games Record Book. Every event starts and ends with a bow or a handshake.</p>
<p><b>Time:</b> 10 to 25 minutes a day for Ethan (shown on each day). Dec 24, Dec 25 and Jan 1 are off.</p></div>
<h3>Who is in it</h3><div class="who" style="grid-template-columns:repeat(5,1fr)">{''.join(f'<div><b>{n}</b><br>{r}</div>' for n, r in w_who)}</div>
<h3>Supplies</h3><ul><li>The 14 printed worksheets; plain paper for airplanes</li><li>Tape measure, masking tape for a start line, a stopwatch (phone is fine)</li><li>Rolled-up socks and a laundry basket; crayons, scissors, stapler, ribbon or string</li></ul>
<h3>Respect Rules</h3><ol><li>Bow or shake hands before and after every event.</li><li>Cheer for everybody.</li><li>Grown-ups and Ethan stand behind the start line; Joyce and Clyde start closer (Ethan decides how much).</li><li>Measure carefully. Write every number exactly.</li><li>The Head Judge (Dad) has the final say.</li></ol>
<h3>What to bring on Wed, Jan 6</h3><p>The Record Book, the other worksheet pages, and Ethan's paper airplane.</p>
"""

w_rows = [
 ("WEEK", "Week 1 · Get ready and Games Day 1 (Thu, Dec 17 – Sun, Dec 20)"),
 ("Thu, Dec 17", "<b>Family meeting</b> (10 minutes). Skyler reads \"What it is\" out loud. Ethan reads the Respect Rules. Everyone practices a bow and a handshake.",
  "Read the crew out loud on <b>Games Director's Page</b> (page 1). Read the Word Bank (page 2) out loud. Teach the family one warm-up stretch from your jiu-jitsu class." + mins(20)),
 ("Fri, Dec 18", "<b>Airplane workshop.</b> Everyone folds a paper airplane. Joyce and Clyde decorate theirs (a grown-up can help them fold).",
  "Show the family how you fold your plane. Then <b>Word Bank, Try 1</b> (page 2): fold the page and write each word from memory." + mins(20)),
 ("Sat, Dec 19", "<b>Games Day 1: Paper Airplane Distance.</b> Bow in. Tape a start line. Each person throws 3 times. Mom measures and writes the numbers. Dad is Head Judge: he watches the start line and has the final say.",
  "Run the event. Make sure every throw is written on <b>page 4</b>, to the nearest inch." + mins(20)),
 ("Sun, Dec 20", "No family part today.", "Fill in the places and answer the questions on page 4." + mins(15)),
 ("WEEK", "Week 2 · Games Day 2 and the holidays (Mon, Dec 21 – Sun, Dec 27)"),
 ("Mon, Dec 21", "<b>Games Day 2: Hang Time and Sock Toss.</b> Bow in. Dad times each flight. Mom writes the times. Clyde counts the socks that land in the basket.",
  "Write every time and every score on <b>page 6</b>." + mins(20)),
 ("Tue, Dec 22", "No family part today.", "Fill in the places and answer the questions on page 6. Then <b>Flight School Math Warm-Up</b> (page 3), problems 1 and 2." + mins(20)),
 ("Wed, Dec 23", "No lesson today. Joyce colors and decorates the <b>medals</b> (page 7). The Head Judge (Dad) picks Best Sportsmanship, Never Give Up and Loudest Cheerer.",
  "<b>Points Table</b> (page 8): turn places into points and find the champion. Write the winners' names on the medals." + mins(20)),
 ("Thu, Dec 24 – Fri, Dec 25", "<b>Off.</b> Family days. Enjoy the holiday!", "", "off"),
 ("Sat, Dec 26", "<b>Medal Ceremony</b> (10 minutes). Bow, shake hands, and give out the medals. Everyone cheers.",
  "After the ceremony: <b>Quote Collector</b> (page 9). Interview Mom and Dad. Write their exact words." + mins(20)),
 ("Sun, Dec 27", "<b>Story time.</b> Joyce tells Ethan the story of the Games.",
  "<b>Little Storytellers</b> (page 10, top half): write down Joyce's story. Then <b>Flight School Math Warm-Up</b>, problems 3 and 4." + mins(20)),
 ("WEEK", "Week 3 · Write it and show it (Mon, Dec 28 – Wed, Jan 6)"),
 ("Mon, Dec 28", "Clyde tells Ethan the story of the Games.",
  "<b>Little Storytellers</b> (page 10, bottom half): write down Clyde's story. Then <b>Flight School Math Warm-Up</b>, problems 5 and 6." + mins(20)),
 ("Tue, Dec 29", "No family part today.", "Make the <b>bar graph</b> (page 5) from the best throws on page 4." + mins(20)),
 ("Wed, Dec 30", "No lesson today. Everyone shares one goal for 2027.", "<b>Goals for 2027</b> (page 13). Then <b>Flight School Math Warm-Up</b>, problems 7 and 8." + mins(25)),
 ("Thu, Dec 31", "No family part today.", "<b>Report Plan</b> (page 11)." + mins(20)),
 ("Fri, Jan 1", "<b>Off.</b> Happy New Year!", "", "off"),
 ("Sat, Jan 2", "Clyde draws the picture for Ethan's news report (page 12).", "Write the <b>Winter Games Report</b> (page 12)." + mins(25)),
 ("Sun, Jan 3", "Mom listens to Ethan read his report.", "Read your report out loud to Mom. Fix spelling, capital letters and punctuation. Then <b>Word Bank, Try 2</b> (page 2)." + mins(20)),
 ("Mon, Jan 4", "Joyce and Clyde draw on the <b>Record Book cover</b> (page 14).",
  "Put the <b>Record Book</b> together in the order on page 14. Staple it." + mins(20)),
 ("Tue, Jan 5", "<b>Practice show.</b> The family sits and listens. After Ethan presents, each person says one thing they liked.",
  "Present the Record Book in 3 to 5 minutes. Look at the family, not only at the pages. Then pack your bag: the Record Book, the other worksheet pages, and your paper airplane." + mins(20)),
 ("Wed, Jan 6", "First January lesson, in person. Send the Record Book with Ethan.", "Present the Record Book to Jonathan (3 to 5 minutes). Bring your paper airplane for a demo flight!"),
]

PLAYERS = ["Mom", "Dad", "Ethan", "Joyce", "Clyde"]

def w_sheets():
    s = ""
    # p1 director page
    crew = [("Games Director (that's you!)", "Ethan"), ("Head Judge and Timer", "Dad (Matt)"), ("Scorekeeper and Measurer", "Mom (Skyler)"),
            ("Medal Designer and Artist", SIS), ("Official Counter and Cheer Captain", BRO)]
    crows = "".join(f'<tr><td>{j}</td><td style="width:2.2in">{w}</td></tr>' for j, w in crew)
    ev = [("Event 1 · Paper Airplane Distance", "Sat, Dec 19", "How far does your plane fly?"), ("Event 2 · Paper Airplane Hang Time", "Mon, Dec 21", "How long does your plane stay in the air?"),
          ("Event 3 · Sock Toss", "Mon, Dec 21", "How many socks land in the basket?")]
    erows = "".join(f'<tr><td><b>{a}</b><br><span style="font-size:13px">{c}</span></td><td style="width:1.3in">{b}</td></tr>' for a, b, c in ev)
    s += (f'<div class="pg">{ph("Ethan", "Games Director\'s Page")}<p class="dir">Here is your Games crew. Read each job out loud to the family.</p>'
          f'<table class="ws"><tr><th>Job</th><th>Who</th></tr>{crows}</table>'
          f'<p class="q">The events</p><table class="ws"><tr><th>Event</th><th>Day</th></tr>{erows}</table>'
          '<p class="q">The Respect Rules (read them out loud)</p><ol style="font-size:15px;margin:2px 0;padding-left:22px"><li>Bow or shake hands before and after every event.</li><li>Cheer for everybody, not only the winner.</li>'
          '<li>Little-kid rule: Joyce and Clyde start ______ steps closer to the basket and ______ steps closer for the airplane throws.</li>'
          '<li>Measure carefully. Write every number down exactly.</li><li>The Head Judge (Dad) has the final say.</li></ol>'
          '<p class="q">The jiu-jitsu warm-up I will teach the family:</p>' + lines(1) + '</div>')
    # p2 words
    s += word_page("Ethan", "Winter Games Word Bank", G_WORDS, "Fri, Dec 18", "Sun, Jan 3", "Use at least 2 of these words in your news report.")
    # p3 warm-up
    s += problems_page("Ethan", "Flight School Math Warm-Up", "Review of the math from this fall. Show your work in each box. Write your answer on the line, with the unit.", GAMES_PROBS)
    # p4 distance
    drow = "".join(f'<tr><td>{p}</td><td style="height:.42in"></td><td></td><td></td><td></td><td></td><td></td><td style="width:.55in"></td></tr>' for p in PLAYERS)
    s += (f'<div class="pg">{ph("Ethan + the whole family", "Event 1: Paper Airplane Distance")}<p class="dir">Grown-ups and Ethan stand behind the start line; Joyce and Clyde start closer (Little-kid rule, page 1). Everyone throws 3 times. Mom measures from where the thrower stood to the nose of the plane, to the nearest inch, and writes the number. Dad is Head Judge. Before you throw, write your estimate! (Joyce and Clyde just say “near” or “far,” and Ethan writes it.)</p>'
          f'<table class="ws"><tr><th>Pilot</th><th>Estimate (in.)</th><th>Throw 1</th><th>Throw 2</th><th>Throw 3</th><th>Best</th><th>Total of 3</th><th>Place</th></tr>{drow}</table>'
          '<p class="dir" style="margin-top:6px">Place: the longest best throw is 1st, the next is 2nd, and so on to 5th. Tie? Both get the same place.</p>'
          '<p class="q">1. Who had the longest best throw? ______________ &nbsp; How long? ______ inches</p>'
          '<p class="q">2. Longest best throw − shortest best throw = ______ − ______ = ______ inches</p>'
          '<p class="q">3. Ethan: what is the total of your 3 throws? ______ inches. Divide by 3 to find your average throw:</p>'
          '<p style="font-size:15px;margin:2px 0 4px">______ ÷ 3 = ______ R ______ &nbsp; My average throw is about ______ inches.</p><div class="bx" style="height:.8in"></div>'
          '<p class="q">4. Change your best throw into feet and inches (12 inches = 1 foot):</p>'
          '<p style="font-size:15px;margin:2px 0 4px">______ ÷ 12 = ______ R ______ &nbsp; So my best throw was ______ feet ______ inches.</p><div class="bx" style="height:.8in"></div>'
          '<p class="q">5. Was your estimate close? How far off was it?</p>' + lines(1) + '</div>')
    # p5 graph
    s += (f'<div class="pg">{ph("Ethan", "Event 1 Bar Graph: Best Throws")}<p class="dir">Make a bar graph of each pilot\'s best throw from page 4. First pick a scale so the longest bar fits. Write the numbers up the left side, one next to each line (the bottom is 0).</p>'
          '<p class="q">My scale: each line = ______ inches. &nbsp; <span style="font-weight:normal">(Tip: the graph has 12 lines. If the longest throw is under 240 inches, try 20 inches per line. If it is longer, try 25 or 50.)</span></p>'
          '<p class="q" style="margin-bottom:.18in">Title: ________________________________________</p>' +
          gridgraph(PLAYERS, 12, 0.36, 4.32, 0.5) +
          '<p class="q">What does the graph show? Write a main idea sentence. Use a number from your data.</p>' + lines(3) + '</div>')
    # p6 hang time + sock toss
    hrow = "".join(f'<tr><td>{p}</td><td style="height:.32in"></td><td></td><td></td><td style="width:.55in"></td></tr>' for p in PLAYERS)
    srow = "".join(f'<tr><td>{p}</td><td style="height:.32in"></td><td style="width:.9in">{"6" if p in ("Joyce", "Clyde") else "10"}</td><td></td><td style="width:.55in"></td></tr>' for p in PLAYERS)
    s += (f'<div class="pg">{ph("Ethan + the whole family", "Events 2 and 3: Hang Time and Sock Toss")}'
          '<p class="q" style="margin-top:2px">Event 2 · Hang Time</p><p class="dir">Throw the plane up and out. Dad starts the stopwatch when it leaves the hand and stops it when it touches the floor. Write the seconds with the decimal point, like 2.35.</p>'
          f'<table class="ws"><tr><th>Pilot</th><th>Try 1 (seconds)</th><th>Try 2 (seconds)</th><th>Best</th><th>Place</th></tr>{hrow}</table>'
          '<p class="dir" style="margin-top:4px">Place: the longest best time is 1st. Tie? Both get the same place.</p><p class="q">Put the best times in order, longest to shortest:</p><p style="font-size:15px;margin:2px 0">________ &gt; ________ &gt; ________ &gt; ________ &gt; ________</p>'
          '<p class="q">1st place − 2nd place = ______ − ______ = ______ seconds <span style="font-weight:normal">(line up the decimal points!)</span></p>'
          '<p class="q" style="margin-top:10px">Event 3 · Sock Toss</p><p class="dir">Mom, Dad and Ethan get 10 tosses. Joyce and Clyde get 6 tosses from closer. Clyde counts the socks that land in the basket.</p>'
          f'<table class="ws"><tr><th>Player</th><th>Socks in</th><th>Tosses</th><th>Fraction in</th><th>Place</th></tr>{srow}</table>'
          '<p class="dir" style="margin-top:4px">Place: the biggest fraction in is 1st. Tie? Both get the same place. To compare fractions with different denominators, find a common denominator. <b>Example:</b> 7/10 and 4/6 → 21/30 and 20/30, so 7/10 is bigger.</p>'
          '<p class="q">Compare your fraction with Joyce\'s. Use a common denominator.</p><p style="font-size:15px;margin:2px 0">Mine: ____/____ = ____/____ &nbsp;&nbsp; Hers: ____/____ = ____/____ &nbsp;&nbsp; Who did better? ____________</p></div>')
    # p7 medals
    med = [("1st Place", "Gold"), ("2nd Place", "Silver"), ("3rd Place", "Bronze"), ("Best Sportsmanship", ""), ("Never Give Up", "for the player who persevered"), ("Loudest Cheerer", "")]
    medals = "".join(f'<div class="medal"><b>{a}</b><span>{b}</span><span style="margin-top:6px">Winner: __________</span></div>' for a, b in med)
    s += (f'<div class="pg">{ph("Joyce + Ethan", "The Medals")}<p class="dir">Joyce colors and decorates each medal. Ethan writes the 1st, 2nd and 3rd place names after the Points Table (page 8) is done. The Head Judge (Dad) picks Best Sportsmanship, Never Give Up and Loudest Cheerer. Cut out each medal and tape a ribbon or string on the back. Give them out at the Medal Ceremony.</p>'
          f'<p class="q">Medal Designer: Joyce</p><div class="medals">{medals}</div></div>')
    # p8 points
    prow = "".join(f'<tr><td>{p}</td><td style="height:.42in"></td><td></td><td></td><td></td><td></td></tr>' for p in PLAYERS)
    s += (f'<div class="pg">{ph("Ethan", "Points Table")}<p class="dir">Turn each place into points. 1st = 5 points, 2nd = 4, 3rd = 3, 4th = 2, 5th = 1. <b>Respect bonus:</b> 1 point for each event where the player bowed or shook hands before and after (the Head Judge decides). Then add. <b>Tie rule (all events):</b> players who tie get the same place and the same points, and the next player skips a place (two 2nds, then 4th).</p>'
          f'<table class="ws"><tr><th>Player</th><th>Event 1 points</th><th>Event 2 points</th><th>Event 3 points</th><th>Respect bonus (0 to 3)</th><th>Total</th></tr>{prow}</table>'
          '<p class="q">Champion of the Ferguson Family Winter Games: ____________________ with ______ points!</p>'
          '<p class="q">1. If there are no ties, how many place points are given out in one event?</p><p style="font-size:15px;margin:2px 0">5 + 4 + 3 + 2 + 1 = ______</p>'
          '<p class="q">2. How many place points are given out in all 3 events? ______ × 3 = ______</p>'
          '<p class="q">3. What is the most points one player could get, with every respect bonus?</p><p style="font-size:15px;margin:2px 0">(______ × 3) + 3 = ______</p>'
          f'<p class="q">4. Add up everyone\'s totals. Does it match {one_event*3} (from question 2) plus the respect bonuses? If not, was there a tie? Explain.</p>' + lines(2) + '</div>')
    # p9 quotes
    qq = ["What was your favorite event? Why?", "What was the most exciting or funniest moment?", "How did it feel to win, or to not win?", "When did you see someone show good sportsmanship?"]
    s += (f'<div class="pg">{ph("Ethan interviews Mom and Dad", "Quote Collector")}<p class="dir">Ask each question. Write their <b>exact words</b> inside quotation marks: "like this." Reporters copy quotes exactly, word for word. Read it back to check.</p>'
          + "".join(f'<p class="q">{i}. {q}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div>Mom:{lines(2)}</div><div>Dad:{lines(2)}</div></div>' for i, q in enumerate(qq, 1))
          + '<p class="q">Circle the 2 best quotes. You will use them in your news report.</p></div>')
    # p10 stories
    s += story_page("Ethan + Joyce + Clyde", "Little Storytellers: The Games", "Ask Joyce, then Clyde: <i>Tell me the story of the Winter Games. What happened first? What was the best part?</i>")
    # p11 report plan
    s += (f'<div class="pg">{ph("Ethan", "Winter Games Report: Plan")}<p class="dir">A news report tells the most important facts first. Plan it here, then write it on page 12.</p>'
          '<p class="q">Headline (the main idea in a few words):</p>' + lines(1) +
          '<p class="q">Lead sentence: answer Who? What? When? Where?</p>' + lines(2) +
          '<p class="q">3 facts from your data (use real numbers from pages 4, 6 and 8):</p>' + lines(3) +
          '<p class="q">2 quotes from page 9 (exact words, and who said them):</p>' + lines(2) +
          '<p class="q">One thing from Joyce\'s or Clyde\'s story (page 10):</p>' + lines(1) +
          '<p class="q">Ending sentence:</p>' + lines(1) +
          '<p class="q">Word Bank words I will use: ______________ &nbsp; ______________</p></div>')
    # p12 report
    s += (f'<div class="pg">{ph("Ethan", "Winter Games Report")}<div class="mast"><div class="n" style="font-size:30px">The Ferguson Family Winter Games Report</div><div class="s" style="letter-spacing:.5px">By Ethan, Games Director · Art by Clyde</div></div>'
          '<p class="q">Headline:</p><div class="ln" style="height:.5in"></div><p class="q">Report:</p>' + lines(10) +
          '<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:8px"><div><p class="q">Picture (Clyde):</p><div class="bx" style="height:1.9in"></div></div><div><p class="q">Caption (Ethan):</p>' + lines(3) + '</div></div></div>')
    # p13 goals
    grow = "".join(f'<tr><td>{p}</td><td style="height:.48in"></td></tr>' for p in ["Mom", "Dad", "Joyce", "Clyde"])
    goal = lambda icon, lab: f'<p style="font-size:15px;margin:6px 0 0"><b>{icon} {lab}</b></p>' + lines(1) + '<p style="font-size:13.5px;margin:2px 0 0;color:#555">How I will practice:</p>' + lines(1)
    s += (f'<div class="pg">{ph("Ethan", "Goals for 2027: Practice, Respect, Keep Going")}<p class="dir">On the mat and in the sky, people get better by practicing a little every day. Ask each person: <i>What is one goal for 2027?</i></p>'
          f'<table class="ws"><tr><th style="width:1.8in">Name</th><th>Goal for 2027</th></tr>{grow}</table>'
          '<p class="q" style="margin-top:10px">My 3 goals for 2027</p>' + goal("✈️", "Flight class goal:") + goal("🥋", "Jiu-jitsu goal:") + goal("📚", "School goal:") +
          '<p class="q">Write one sentence that uses <b>persevere</b> or <b>discipline</b>.</p>' + lines(1) + '</div>')
    # p14 cover
    s += (f'<div class="pg">{ph("Ethan + Joyce + Clyde", "Record Book Cover")}<div class="mast"><div class="n" style="font-size:32px">The Ferguson Family<br>Winter Games Record Book</div><div class="s">GAMES DIRECTOR: ETHAN · DECEMBER 2026</div></div>'
          '<div class="bx" style="height:3.3in"><span style="font-size:13px;color:#777;padding:6px;display:block">Joyce and Clyde draw the Winter Games here.</span></div>'
          '<p class="q">Put the Record Book together in this order, then staple it:</p>' + cklist(["1. This cover (page 14)", "2. Winter Games Report (page 12)", "3. Bar Graph (page 5)", "4. Points Table (page 8)", "5. Little Storytellers (page 10)", "6. Goals for 2027 (page 13)"]) +
          '<p class="q">Presenting it (3 to 5 minutes):</p><p style="font-size:15px;line-height:1.6;margin:2px 0">1. Read your headline and lead sentence. &nbsp; 2. Show the bar graph and tell who won each event. &nbsp; 3. Name the champion and read one quote. &nbsp; 4. Read one of your goals for 2027.</p>'
          '<p class="q">Bring on Wed, Jan 6: ☐ the Record Book &nbsp; ☐ the other worksheet pages &nbsp; ☐ your paper airplane</p></div>')
    return s

w_key = ('<p class="dir">Flight School Math Warm-Up (worksheet page 3). The event pages use your family\'s own numbers, so check those by redoing the math together. Points Table check: with no ties, each event gives out 5 + 4 + 3 + 2 + 1 = '
         f'{one_event} place points, so 3 events give out {one_event} × 3 = {one_event*3}. The most one player can get is (5 × 3) + 3 = {5*3+3}.</p>'
         + key_table("Flight School Math Warm-Up", GAMES_PROBS))

if __name__ == "__main__":
    build("ethan-november.html", "Ferguson Family Feast Planner", "#C9A84C", "kce_bb_proj_ethan_nov", f_intro, f_guide, f_rows, f_sheets(), f_key)
    build("ethan-holiday.html", "Ferguson Family Winter Games", "#0047BA", "kce_bb_proj_ethan_hol", w_intro, w_guide, w_rows, w_sheets(), w_key)
    print("ethan projects built")

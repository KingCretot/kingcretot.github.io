# KCE Building Blocks — lesson writer spec (Bristol & Bailey)

You write ONE JSON file per lesson: `/home/claude/bb_build/data/<who>_LNN.json` (who = bristol | bailey, NN = 01..32).
Write it with a Python script (json.dump, ensure_ascii=False, indent=1) kept in YOUR OWN scratch folder (given in your task).
Then run, in this order, and fix until all pass:
1. `cd /home/claude/bb_build && python3 validate.py data/<who>_LNN.json` → OK
2. `python3 build.py <who>`
3. `NODE_PATH=$(npm root -g) node test.js <who> <n> [<n>...]` → every line OK (packet must not overflow; it prints exactly 2 pages)
Study the approved model first: `data/bristol_L01.json` (built from `gen/bristol_L01.py`), the runtime `assets/bb.js` (what each slide type and visual does), `build.py` (how packet/teacher/course pages render) and `plan.py` (dates, weekly topics, existing KCE lessons to link).
Do NOT edit bb.js, bb.css, build.py, plan.py, validate.py or test.js. Do NOT touch other agents' JSON files. Do NOT git commit or push.

## Who the students are
- **Bristol Simon** — homeschooled, Grade 2–3 level, reads on her own: write ALL student-facing text at her level — short sentences (usually under 12 words), common words, one idea per line, bold the key word. Reading her book *Amy and the Missing Puppy* (Critter Club #1: Amy, Ellie, Liz, Marion; Amy's mom is a vet). Strengths: place value, regrouping, story elements, sequencing, recalling her book. Weak: picks the wrong operation in word problems, facts 4/6/7/8/9 (knows 2s, 5s, 10s and skip-counting by 5 and 10 — do NOT teach those), contractions, spelling (wrote "red/bock" for read/book), run-ons, theme, point of view, forgets things day to day. Mastery to unlock next lesson: **85** → her check has **8** questions (7/8 needed).
- **Bailey Simon** — homeschooled, Grade 4–5 level, reading *How to Train Your Dragon* (Hiccup, Toothless, Fishlegs, Stoick, Berk, Vikings). Strengths: reading comprehension, character & conflict, math vocabulary, persistence. Weak: 6–9 facts are not automatic (she adds a number over and over — "75 times"), picks the most complicated method then loses track, division breaks down with bigger numbers, says "I can't do it". **Vocabulary is a large part of every Bailey lesson**: a `vocab` slide with 6–8 words (mix of the math words for the topic and rich academic/tier-2 words, some tied to her book), vocabulary questions inside the practice set and the check, and a vocabulary part in the packet. Never repeat a vocab word already used in another Bailey lesson file. Mastery: **90** → her check has **10** questions (9/10 needed).
- They are homeschooled. There is NO rush: one topic per week, each day a different assignment and goal. Never cram several skills into one lesson.

## Jonathan's quality bar (non-negotiable)
- Questions must be genuinely challenging for the level and make academic sense. No giveaway questions (no "pick the only word in the sentence", no answer obvious from wording). Wrong choices are real mistakes students make (e.g. adding instead of multiplying, 7×8=54, forgetting the remainder).
- Every multiple-choice item: correct answer in varied positions (validator checks), a `why`, and a `no` array with a specific explanation for each wrong choice (null for the correct one) on tap/recall/practice items.
- Do not repeat lessons/questions/examples from other lessons — check the other data files that exist. Each day of a week builds on the last.
- American English only. Say "lesson", never "session". No calendar dates inside lesson text except what the engine adds.
- Every number fact must be correct. Re-compute every answer with Python before saving.
- Mondays are Zoom: the lesson is tap-and-talk only (it always is — no typing anywhere). Writing happens only in the printed packet.
- No voice/audio. No videos. Visuals come from the built-in visual kinds and emoji.

## JSON shape
```
{ "student","n","title","goal" ("I can …", kid language),
  "card": {"desc": 2–3 sentences for Jonathan/Tia on what this lesson does and why (may use <b>)},
  "win": short praise shown on mastery,
  "slides": [...], "practice": {"intro","questions":[10–12 mcq]},
  "packet": {"title","pages":[[sections...],[sections...]]}   // exactly 2 pages
  "teacher": {"objective","materials":[...],"plan":[{"time":"0:00–0:08","block","do"}... must run 0:00 to 1:00],"watch":[...],"packet_key":[{"item","answer"}],"notes"},
  "tasks": [3–6 short items for the student to finish before the next lesson, kid language],
  "also": [ {"label","url","how"} ]   // optional: existing KCE lessons from plan.py for this week; "how" says exactly what to do AND "If it is locked, type 1111."
}
```
mcq = `{"q","visual"?,"choices":[...],"a":index,"why","no":[...]}` (html allowed: <b>, <i>, <br>).

### Slide types (see bb.js)
`hello` (always first: title, text, visual) · `talk` (book talk or say-it-aloud: prompts, starters — every lesson has one book-talk slide near the start) · `learn` (text, visual, optional `steps` revealed one at a time, tip) · `vocab` (words: word, pos, meaning, example, emoji) · `tap` / `recall` (items: list of mcq; `recall` = spaced review of EARLIER lessons, use from Lesson 2 on) · `sort` (buckets, items {text,b,why,hint}, done) · `order` (steps in correct order, why, hint) · `build` (groups, each, emoji, text, why, hint — student makes equal groups) · `check` (exactly one, near the end: title, questions — one try each, scored, sends to Formspree, unlocks next lesson).
Aim for 11–15 slides; the on-screen lesson is about 40 minutes, the rest of the hour is in the teacher plan (book talk, hands-on, wrap-up).

### Visual kinds (see vis() in bb.js)
groups {groups,each,emoji,label} · uneven {sets:[..],emoji} · array {rows,cols,emoji,label} · numberline {start,jump,jumps} · triangle {a,b,c} (fact family) · area {a? ,b,split:[70,5],show:true|false} · longdiv {text: monospace layout with \n} · placevalue {n} · contraction {a:"do",b:"not",drop:[1],result:"don't"} (drop = indexes of letters in b to strike) · bigtext {text,sub} · emoji {text} · passage {text} (short reading passage, html ok) · svg {svg} (only if truly needed).

### Packet (2 printed pages, letter, wide lines, Name/Date automatic)
sections {title, directions, items}; item types: choice {text,options} · fill {text} · problem {text,lines} · write {text,lines} · draw {text,height inches,lines} · match {left,right} (right side must be scrambled) · bank {words}. Number items 1, 2, 3… in the text. Kid-language directions. Must fit: test.js fails on overflow — trim lines/heights until it passes. Every item has an answer in teacher.packet_key.

## Week day pattern
3-lesson week: Mon (Zoom) **Learn it** · Tue (in person) **Practice it** (hands-on, more application) · Thu (in person) **Prove it** (mixed harder application + strongest check).
2-lesson week: **Learn it** · **Prove it**. 1-lesson week (Dec 3) and holiday weeks: **Review**.
Each lesson's tasks = what to finish before the NEXT lesson date (practice set + named packet pages + reading minutes + any "also" lesson).

## Weekly goals — Weeks 1–4
### Bristol
- W1 Equal Groups: Multiply or Add? — L1 (done: what equal groups are; equal→multiply, unequal→add). **L2 Thu Oct 22 Prove it**: harder word problems where she must find the groups in the words (each/every/per, "in all" traps where it's actually addition), write the number sentence, arrays as equal groups (rows), turn-around (3×4 and 4×3 same total), two-step-free.
- W2 Facts for 4 and 6 — **L3 Mon Oct 26 Learn it**: ×4 = double, double (2×n then double); ×4 facts to 4×10 with arrays/number lines. **L4 Tue Oct 27 Practice it**: ×6 = ×5 + one more group; 6 facts to 6×10; mixing 4s and 6s in pictures and word problems. **L5 Thu Oct 29 Prove it**: mixed 4s and 6s fluency, missing factor (4 × ? = 24), choose the operation in word problems. Also: Times Table Trail L3 (4s) as practice.
- W3 Facts for 7, 8 and 9 — **L6 Mon Nov 2 Learn it**: ×8 = double the 4s; ×9 = ×10 minus one group. **L7 Tue Nov 3 Practice it**: ×7 = ×5 + ×2; 7s with arrays. **L8 Thu Nov 5 Prove it**: mixed 4/6/7/8/9, turn-around facts, missing factors, word problems. Also: Times Table Trail L4 and L5.
- W4 Word Problem Detective — **L9 Mon Nov 9 Learn it**: the 3-question detective routine (What is happening? Equal groups or not? Which operation?) on multiply/add/subtract stories; draw a picture. **L10 Tue Nov 10 Practice it**: pricing problems like Pathways Week 7 (equal prices × how many, compare costs, making a total), skip-count money. **L11 Thu Nov 12 Prove it**: mixed word problems at Week 7 level; then the "also" is the Pathways Week 7 Math retake with Jonathan (must get 85). Also: Times Table Trail L7.

### Bailey
- W1 Fact Shortcuts: ×9 and ×6 — **L1 Tue Oct 20 Learn it**: why repeated adding is slow; ×9 = ×10 minus one group (9×7 = 70−7); ×6 = ×5 plus one group (6×8 = 40+8); the 9s finger/digit-sum patterns as a check (digits of 9×n add to 9 for n 2–10). **L2 Thu Oct 22 Prove it**: all ×6 and ×9 facts to 10, missing factors (9 × ? = 63), turn-around, word problems, spotting a wrong fact and fixing it. Also: Times Table Trail L4.
- W2 Fact Shortcuts: ×8 and ×7 — **L3 Mon Oct 26 Learn it**: ×8 = double, double, double (8×7: 14, 28, 56); ×4 = double double as a stepping stone. **L4 Tue Oct 27 Practice it**: ×7 = ×5 + ×2 (7×6 = 30+12); 7×8=56 "5,6,7,8"; break-apart (distributive) idea. **L5 Thu Oct 29 Prove it**: all 6–9 facts mixed, choose the fastest strategy for a fact, fact families preview, word problems. Also: Times Table Trail L5 and L8.
- W3 The Area Model — **L6 Mon Nov 2 Learn it**: area model for 2-digit × 1-digit (75 × 8 = 70×8 + 5×8) — and why it beats adding 8 seventy-five times. **L7 Tue Nov 3 Practice it**: area model 3-digit × 1-digit and 2-digit × 2-digit small (e.g. 23 × 14 with 4 boxes); estimating first. **L8 Thu Nov 5 Prove it**: choosing the efficient method (fact, break-apart, area model) for a problem; find the error in someone's repeated-adding or area model; word problems. Also: Multiplication Mountain L1.
- W4 Division Undoes Multiplication — **L9 Mon Nov 9 Learn it**: division as "how many groups / how many in each", fact triangles for 6–9, "56 ÷ 8 means 8 × ? = 56". **L10 Tue Nov 10 Practice it**: fact families (four facts), division facts 6–9, remainders introduced only as "left over" with small numbers (e.g. 30 ÷ 7). **L11 Thu Nov 12 Prove it**: mixed division facts, missing numbers in fact families, word problems that are division (equal sharing vs equal groups), checking division by multiplying. Also: Division Station L4 and L5.

## Teacher plan
60 minutes for the in-person/Zoom lesson. Blocks with exact times, what Jonathan does and asks, which slides, hands-on materials (counters, cups, whiteboard, index cards). Include the book talk (5–8 min), the check (on her own), wrap-up showing the task list. `watch` = the specific mistakes to look for and what to say. `notes` = what to do if she does not reach mastery.

---------------------------------------------------------------------------
# V2 CHANGES (Oct 20, Jonathan's decisions) — these OVERRIDE anything above
Each lesson date now has THREE layers:
1. **`teach` = the Class Lesson** (NEW). Jonathan teaches it live (in person Tue/Thu, screen-shared on Zoom Mon). Detailed and robust: 14–20 slides covering the whole 60 minutes — book talk, the new idea taught from scratch with worked examples, hands-on work (beans/cups/index cards/whiteboard — at home on Zoom days), guided practice he asks out loud, quick checks for understanding, and a wrap-up. Slide types: any except `check`. EVERY teach slide has `"notes": {"do": "...", "say": "...", "ask": "...", "listen": "..."}` (use the keys that fit; at least one) — exact words to say, questions to ask, and what a right/wrong answer sounds like. Questions in the class lesson are for discussion (tap/fill items allowed). The teacher plan (`teacher.plan`) times must match the class lesson.
2. **`slides` = the After-Class Lesson** (was "the lesson"). The student does it ALONE after class to reinforce what Jonathan just taught (about 20–30 minutes). It does NOT reteach from scratch: quick reminder of the idea, then mostly doing. Ends with the `check`. Typing IS allowed here (done at home, not on Zoom).
3. **`practice`** = more work during the week.

## Fewer multiple choice — make them recall
- New question type **fill**: `{"type":"fill","q":"text with ____ or a question","answers":["multiply","times"],"why":"...","no":"short nudge after a wrong try","hint":"shown after the 2nd wrong try (optional)","placeholder":"optional","visual":{...}}`. The student types a word or number from memory. Answers are matched ignoring case, extra spaces, $ and punctuation — list every acceptable spelling/form ("4 × 6", "4 x 6", "4x6"; "don't", "dont"; "24"). Keep answers short (one word, a number, or a tiny expression). Bristol: simple words she was taught (equal, multiply, add, groups, each, double, the contraction itself) and numbers.
- At least **50%** of every check set and of the practice set must be `fill`. Multiple choice items need **3–4 choices** (no Yes/No — turn those into fill: "Are they equal? Type <b>equal</b> or <b>not equal</b>").
- Every question allows **3 tries**. A wrong try resets the choices (nothing stays marked). After the 3rd wrong try the student sees the answer + why. **Only the first try counts** for the score.
## Retakes get a completely different set
- `check` now uses `"sets": [[...],[...],[...]]` — exactly **3 different sets** (Bristol 8 questions each, Bailey 10 each), same difficulty, same skills, no question repeated across sets (new numbers/stories). Attempt 1 uses set 1, a retake uses set 2, then set 3, then rotates. Remove the old `"questions"` key.
## Homework load (the `tasks` list) — Jonathan sees them Mon (Zoom) + Tue + Thu
- **Monday lesson → Tuesday (one night): LIGHT.** Tasks = this lesson's After-Class Lesson + read 10 minutes. Nothing else. (Monday's practice set and packet are assigned on Tuesday's task list.)
- **Tuesday lesson → Thursday (two nights): HEAVY is OK.** Tasks = Tuesday's After-Class Lesson, Tuesday's practice, Tuesday's packet page 1, PLUS Monday's practice and Monday's packet (link them: `<a href="practice-NN.html">…</a>`, `<a href="packet-NN.html">…</a>`), + reading. Split across Tue night / Wed.
- **Thursday lesson → Monday (weekend): MEDIUM.** Tasks = Thursday's After-Class Lesson, Thursday's practice, Thursday's packet, Tuesday's packet page 2, reading 15 min/day, plus any "also" KCE lesson.
- 2-lesson week (Tue/Thu, Week 1): Tue → Thu heavy as above (no Monday items); Thu → Mon medium.
- Long breaks (Lesson 11 → Dec 3, Lesson 18 → Dec 29, Lesson 19 → Jan 4): spread work week by week with no calendar dates in the text ("first week", "second week").
- Task items are short, kid-language, each one a single action. Use links for practice/packet of another lesson. 3–7 items.

## ELA in every lesson (Jonathan, Oct 23, 2026) — overrides anything above
Every Bristol and Bailey lesson links ONE reading (ELA) lesson in `also` (two for a long break), plus a matching task line, even in math weeks. Bristol: Reading Foundations or Pathways Grade 3 Reading. Bailey: Reading Power or Pathways Grades 4–5 Reading. Mark it `"ela": true`. Lessons 1–11 used: Bristol RF U8L5–U8L8 and Pathways G3 Reading Weeks 2, 3, 8, 9, 11–14; Bailey RP U7L2–U7L7 and Pathways G4–5 Reading Weeks 8, 9, 11–14 — do not reuse these. Monday's reading task goes on "Tuesday or Wednesday" to keep Monday night light. build.py runs protect.py at the end (noindex + copyright notice; hidden when printing packets).

---------------------------------------------------------------------------
# Weekly goals — Weeks 5–7 (December, written Oct 25, 2026)
Same rules as above (V2 layers: `teach` class lesson with notes, `slides` after-class lesson ending in `check` with 3 sets, `practice`, 2-page `packet`, `teacher`, `tasks`, `also`). Dates come from plan.py: L12 Thu Dec 3 · L13 Mon Dec 7 (Zoom) · L14 Tue Dec 8 · L15 Thu Dec 10 · L16 Mon Dec 14 (Zoom) · L17 Tue Dec 15 · L18 Thu Dec 17. After L18 the girls are on winter break (Holiday Gazette family project Dec 20–Jan 3); the next lesson is L19 on Mon Jan 4 (Zoom).

## Bristol
- **W5 Welcome Back Review — L12 Thu Dec 3 (Review).** First lesson after the three-week break. Open with her Gratitude Project book (she presents it: "The girls present it at Lesson 12"), then a spaced review of Weeks 1–4 only: equal groups → multiply vs. unequal → add; facts for 4, 6, 7, 8, 9 (mixed, missing factors); the Word Problem Detective routine; price-tag problems. No new skill. Find out what she kept and what slipped.
- **W6 Contractions** (one of her weak areas). **L13 Mon Dec 7 Learn it:** what a contraction is (two words pushed together, the apostrophe takes the place of the missing letters); the "not" family only: don't, can't, isn't, aren't, wasn't, didn't, doesn't (won't waits for L15). **L14 Tue Dec 8 Practice it:** the pronoun families: I'm, you're, he's/she's/it's, we're, they're; I'll, you'll, we'll; I've, we've, they've; expand ↔ contract; apostrophe in the right spot (did'nt → didn't). **L15 Thu Dec 10 Prove it:** all of them mixed, plus the odd ones (won't = will not, let's = let us), choosing the contraction that makes sense in a sentence, fixing a wrong one, and using contractions in her own sentences in the packet. Use the `contraction` visual.
- **W7 Spelling Teams: ea and oo** (her spelling weakness: she wrote "red/bock" for read/book). **L16 Mon Dec 14 Learn it:** vowel teams; ea says long e (eat, read, beach, clean, dream, team); note that a few ea words say short e (head, bread) — teach as "try long e first." **L17 Tue Dec 15 Practice it:** oo has two sounds: long oo (moon, food, spoon, school, room) and short oo (book, look, good, foot, cook, wood); sorting by sound; fixing "bock." **L18 Thu Dec 17 Prove it:** ea and oo mixed: sort, choose the right spelling, read and spell words in sentences; the packet includes a short spelling list Tia can read aloud. Break tasks after L18 cover the two break weeks ("first week of the break", "second week of the break"), light, alongside the Holiday Gazette.
- Math stays alive: from L13 on, every after-class lesson has a short `recall` slide with 2–3 fact or word-problem items from Weeks 1–4.

## Bailey
- **W5 Welcome Back Review — L12 Thu Dec 3 (Review).** Open with her Gratitude Project poster, then a spaced review of Weeks 1–4 only: 6–9 fact strategies (×9 = ×10 − one group, ×6 = ×5 + one group, ×8 double-double-double, ×7 = ×5 + ×2), choosing the efficient method (fact, break-apart, area model), the area model, division facts, fact families, small remainders as leftovers. No new skill. Vocabulary: new words only (never used in any earlier Bailey file).
- **W6 Long Division, One Step at a Time.** **L13 Mon Dec 7 Learn it:** the long-division steps Divide, Multiply, Subtract, Bring down (and repeat), with what each step means in place value; 2-digit ÷ 1-digit with no remainder (e.g. 84 ÷ 4, 96 ÷ 6, 72 ÷ 3); estimate first. **L14 Tue Dec 8 Practice it:** 3-digit ÷ 1-digit with no remainder (e.g. 432 ÷ 4, 756 ÷ 7), including a zero in the quotient (618 ÷ 6 = 103) and a first digit too small to divide (184 ÷ 8). **L15 Thu Dec 10 Prove it:** mixed long division with no remainder, word problems that need division, finding the mistake in a worked problem, and a quick multiply-back check. Use the `longdiv` visual. Also: Long Division Lane L1, L2, L4 (from plan.py).
- **W7 Remainders and Checking.** **L16 Mon Dec 14 Learn it:** long division with remainders (2- and 3-digit ÷ 1-digit), the remainder must be smaller than the divisor, and checking: quotient × divisor + remainder = dividend. **L17 Tue Dec 15 Practice it:** what to do with the remainder in a word problem: round up (vans needed), drop it (full boxes), or the remainder is the answer (cookies left over). **L18 Thu Dec 17 Prove it:** mixed long division with remainders, checking, error spotting, and remainder word problems. Also: Long Division Lane L3, L6. Break tasks as for Bristol.
- She says "I can't do it": every long-division slide shows one step at a time, and the class lesson has Jonathan praise each correct step.

## Also-links for Lessons 12–18 (use exactly these; do not reuse anything from Lessons 1–11)
ELA (mark `"ela": true`, with a matching task line):
- Bristol: L12 Pathways G3 Reading Week 1 (`grade3/week1/reading.html`) · L13 Reading Foundations U8L3 Syllables · L14 RF U8L1 oi/oy · L15 Pathways G3 Reading Week 6 (`grade3/week6/reading.html`) · L16 RF U6L2 ee/ea · L17 RF U6L5 oo · L18 RF U6L7 Vowel Team Sentences and RF U6L6 Team Mix (break). Reading Foundations base: https://readingfoundations.kingcretot.com/ (file names as in plan.py, e.g. KCE_RF_U8L3_Syllables.html, KCE_RF_U8L1_OIOY.html, KCE_RF_U6L6_TeamMix.html).
- Bailey: L12 Reading Power U7L8 Nonfiction Ninja (KCE_RP_U7L8_NonfictionNinja.html) · L13 Pathways G4–5 Reading Week 1 (`grade4-5/week1/reading.html`) · L14 RP U8L1 Expression (KCE_RP_U8L1_Expression.html) · L15 Pathways G4–5 Reading Week 2 · L16 RP U8L2 (KCE_RP_U8L2_MorphContext.html) · L17 Pathways G4–5 Reading Week 3 · L18 RP U8L3 (KCE_RP_U8L3_RootContext.html) and Pathways G4–5 Reading Week 4 (break). Reading Power base: https://readingpower.kingcretot.com/
Optional Social Studies (label starts with "OPTIONAL · ", same wording pattern as Lessons 9–11, not taught in class, no task line beyond "optional"): Pathways base https://kingcretot.github.io/KCE_Pathways_Curriculum/ — Bristol uses grade3/, Bailey uses grade4-5/: L12 Week 10 Social Studies Checkpoint (`week10/socialstudies-checkpoint.html`) · L13 Week 11 · L14 Week 12 · L15 Week 13 · L16 Week 14 (`weekNN/socialstudies.html`) plus Florida Focus 3 (`florida/socialstudies-u3.html`) · L17 Week 15 Social Studies Checkpoint · L18 the optional Holiday Culture winter lesson (`holidays/winter.html`). Open each page's title in the repo at /home/claude/sec/KCE_Pathways_Curriculum to write the label.

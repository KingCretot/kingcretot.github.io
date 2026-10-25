# Ce'Line Mosely — Building Blocks writer brief (Oct 25, 2026)

## Who she is
- Ce'Line Mosely, Grade 4 by age, working on **Pathways Grades 2–3** (moved down from Grades 4–5 on Oct 15, 2026 because 4–5 was too difficult). Lives in DeSoto County (Arcadia), Florida. Mom: Lexus. Sibling: Se'Niya.
- Scores so far (her Weekly Score Log): Math Foundations Fraction Falls L1 45 / 50 / 30 (locked), L2 45; Pathways Grades 4–5 Week 1 Math 39, Reading 33; Pathways Grades 2–3 Week 1 Reading 56 (Oct 21). She needs confidence and a lot of support. Never mention her grade level, being "moved down", or "Grade 3" in student-facing text — the course is just "Ce'Line's Building Blocks".
- Write ALL student-facing text at a Grade 2–3 reading level (like Bristol's lessons): short sentences (usually under 12 words), common words, one idea per line, bold the key word. Warm, encouraging, never babyish (she is 9–10).
- She is taught by Jonathan (Mr. Jonathan) **in person, Tuesdays 4:00–5:00 PM ET at the DeSoto County Library**. One lesson a week. Each lesson = one Pathways Grades 2–3 week (math AND reading of that week), exactly like Ethan's course does for Grades 4–5.
- Mastery to unlock the next lesson: **85**. Her `check` has **3 sets of 8 questions** (7/8 needed). Practice: 10–12 questions. At least 50% of check and practice items are `fill` (typed, short answers, list every acceptable form).
- No audio, no video. No book of her own: the book-talk / `talk` slide uses the story from that week's Pathways reading lesson (read the real file).

## Files to read first (completely)
- `/home/claude/bb_build/SPEC.md` — all of it (quality bar, JSON shape, V2 layers: `teach` class lesson with notes on every slide, `slides` after-class lesson ending in `check` with 3 sets, `practice`, 2-page `packet`, `teacher`, `tasks`, `also`). Rules written for Bristol/Bailey apply to her unless this brief says otherwise.
- `/home/claude/bb_build/AUDIT.md`, `AUDIT2.md`, `AUDIT3.md` — mistakes already found in earlier lessons; do not repeat them.
- `/home/claude/bb_build/plan.py` — Ce'Line's dates and week topics are at the bottom (`STU_DATES["celine"]`, `TOPICS["celine"]`, SINGLE layout).
- The approved single-lesson model: `/home/claude/bb_build/data/ethan_L01.json` … `ethan_L03.json` (structure, depth, task-list style, `also` style; Ethan is Grades 4–5, so match his STRUCTURE but use Bristol's reading level — see `/home/claude/bb_build/data/bristol_L03.json` for voice).
- The real Pathways Grades 2–3 files for your week: `/home/claude/kce_pathways_curriculum/grade3/weekN/math.html` and `reading.html` (Week 5: `checkpoint.html`). Teach and practice exactly the skills of that week so she can pass the Pathways retake. Never copy Pathways questions; write new ones at the same level.

## Lesson map (Pathways base https://kingcretot.github.io/KCE_Pathways_Curriculum/grade3/)
| Lesson | Date | Pathways week | Required "also" (retakes, aim 85, "If it is locked, type 1111.") | OPTIONAL items |
|---|---|---|---|---|
| 1 | Tue Oct 27 | Week 1: Place Value & Rounding / Story Elements | week1/math.html, week1/reading.html | Science Week 1: What Living Things Need; Social Studies Week 1: What Is a Community? |
| 2 | Tue Nov 3 | Week 2: Comparing & Ordering Numbers / Plot & Conflict | week2/math.html, week2/reading.html | Science Week 2: Life Cycles; Social Studies Week 2: How Communities Are Led |
| 3 | Tue Nov 10 | Week 3: Addition & Subtraction with Regrouping / Sequencing & Story Structure | week3/math.html, week3/reading.html | Science Week 3: Habitats and Adaptations; Social Studies Week 3: Rules, Rights and Responsibilities; Holiday Culture: Harvest Celebrations Around the World (holidays/harvest.html, bonus for the break) |
| 4 | Tue Dec 1 (first lesson after a 3-week break, Nov 16–30) | Week 4: Word Problems & Estimation / Theme & Lesson of a Story | week4/math.html, week4/reading.html | Science Week 4: Food Chains; Social Studies Week 4: Maps and Globes: Finding Our Place |
| 5 | Tue Dec 8 | Week 5: Unit 1 Checkpoint (review of Weeks 1–4) | week5/checkpoint.html | Science Week 5 Checkpoint (week5/science-checkpoint.html); Social Studies Week 5 Checkpoint (week5/socialstudies-checkpoint.html); Florida Focus 1 Science: The Everglades: A River of Grass (florida/science-u1.html); Florida Focus 1 Social Studies: Florida's Communities and Government (florida/socialstudies-u1.html) |
| 6 | Tue Dec 15 (last lesson of 2026; winter break Dec 16 – Jan 4, next lesson Tue Jan 5) | Week 6: Stocking the Shelves (math) / The Storm in the Stockroom (reading) | week6/math.html, week6/reading.html | Science Week 6: Weather and How We Measure It; Social Studies Week 6: Needs, Wants and Choices; Holiday Culture: Winter Celebrations and the Longest Night (holidays/winter.html) |

Week files: `weekN/science.html`, `weekN/socialstudies.html`. Open each target file and copy its real title for the label.

### OPTIONAL items — exact format (Jonathan wants Science and Social Studies in her Classroom as optional)
- Label starts with `OPTIONAL · ` then e.g. `Science Week 1: What Living Things Need`, `Social Studies Week 1: What Is a Community?`, `Florida Focus 1 (Science): The Everglades: A River of Grass`, `Holiday Culture: Harvest Celebrations Around the World`.
- Weekly Science/Social Studies `how`: `<b>OPTIONAL and self-paced.</b> This is not part of your class lessons and your teacher does not teach it. Do it on your own if you want to, one week at a time. Aim for 85 or more so the next week opens. If it is locked, type 1111.`
- Florida Focus / Holiday `how`: `<b>OPTIONAL and self-paced bonus.</b> … It never locks and never blocks your next lesson. Do it on your own if you want to. If it asks for a code, type 1111.` (see bristol_L18.json for the holiday wording).
- Optional items get at most one task line: "Optional: …". Required retakes get real task lines.

## Tasks (`tasks`)
One lesson a week: tasks run from Tuesday after class to the next Monday, one short item per day (see ethan_L01.json): after-class lesson Tuesday, practice, packet page 1, Pathways reading retake, packet page 2, practice again (new set), Pathways math retake. Lesson 3 → Lesson 4 spans the 3-week break (Nov 16–30): spread light work over "first week of the break / second week / third week" with no calendar dates in the text. Lesson 6 → Jan 5 spans the winter break: same idea, light.

## Workflow
Python script in your own scratch folder `/home/claude/bb_build/scratch_cN` (create it). Recompute every number with Python. Then:
`cd /home/claude/bb_build && python3 validate.py data/celine_LNN.json && python3 build.py celine && NODE_PATH=$(npm root -g) node test.js celine N` until all pass (packet exactly 2 pages). Screenshot class-NN, lesson-NN and packet-NN at phone (390px) and laptop (1280px) width with Playwright and fix anything ugly.
If ethan_L01 has `/home/claude/bb_build/data/practice_extra/ethan_L01.json`, also write `data/practice_extra/celine_LNN.json` the same way (`{"sets":[[12 questions],[12 questions]]}`) and run `python3 check_extra.py` on it.
Do NOT edit bb.js, bb.css, build.py, plan.py, validate.py, test.js or any other student's files. Other writers are writing Ce'Line's other lessons at the same time — never touch their files; vocabulary words must come from YOUR week's Pathways files so they do not overlap. No git. Final report: short summary, anything unsure, check results.

## UPDATE Oct 25 (overrides the table above)
Jonathan is away Dec 20–28 only. Ce'Line HAS a lesson on **Tue Dec 29**:
| 7 | Tue Dec 29 (first lesson after Christmas; next lesson Tue Jan 5) | Week 7: Pricing Day at the Trading Post (math) / The Grumpy Hiker (reading) | week7/math.html, week7/reading.html | Science Week 7: The Sun, Seasons and Day and Night; Social Studies Week 7: Goods, Services, Producers and Consumers |
Lesson 6 (Dec 15) tasks therefore run to Mon Dec 28 (two weeks: one week before Christmas and Christmas week), and Lesson 7 tasks run Tue Dec 29 – Mon Jan 4 (no lesson Jan 1, a holiday).

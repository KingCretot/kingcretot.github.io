# V3 "student's-eye" review — KCE Building Blocks

Jonathan opened Lesson 1 and found mistakes the earlier audits missed. They passed because those audits read the JSON. **This review is done from the screen.** You did not write these lessons, so be the most demanding reviewer possible. Jonathan says: "just be clean and clear with the words I am giving you and stop making up shit."

Read /home/claude/bb_build/SPEC.md (with its "V2 CHANGES" section) and AUDIT2.md for the rules. Then, for each assigned lesson, use Playwright (NODE_PATH=$(npm root -g)). The pages are in /home/claude/kgh/building-blocks/<who>/:
- `class-NN.html`: type 9110 into `#tp`, then click `#to`.
- `lesson-NN.html`: to move past a slide without answering, set localStorage `kce_bb_teacher=1` and reload.
- `practice-NN.html`, `packet-NN.html`, `teacher-NN.html` (9110).
- The course card for the lesson on `index.html`.

Screenshot EVERY slide at 1100 px wide, after any fade-in has finished (wait about 600 ms). LOOK at each image. On every interactive slide (build, sort, order, tap, fill), first give a WRONG answer, then the right one, and confirm what the student sees each time.

The two bugs Jonathan found show what to look for:
- A picture showed 6 identical cups while the text asked "which set is fair?" Nothing on the screen let her answer.
- A build slide gave unclear feedback.

Check every slide for:
1. **Screen vs. words.** Can a child answer from what is ON THE SCREEN? Does the picture show the counts the question needs? Does it match the numbers in the text exactly? A picture must never contradict the text or hide what is needed. In class lessons, the teacher note may add physical materials, but the slide itself must still make sense.
2. **Exactly one right answer, given what is shown.** No trick wording, and no question that needs information that isn't there. In fill-ins, does the placeholder or prompt make the expected form obvious (a number, a word, "equal / not equal")? Try 2–3 reasonable answers a child might type that should count, and confirm they are accepted.
3. **Feedback.** Is the "no" or hint message helpful and true for the wrong answer you gave? Is the "why" true?
4. **Words.** Short, plain and correct, with no made-up facts. Bristol (Grade 2–3) should be able to read every student-facing line alone. Grammar and spelling must be correct and in American English. Never use "session".
5. **Teacher notes.** Times, actions, "listen for" lines and fixes are correct, match the slide, and are doable. Monday lessons are on Zoom, where she can't tap or type on Jonathan's screen.
6. **Task list ("before the next lesson").** Read it on the course card as Tia would. Each line should be one clear action with a day and a link where one exists. Nothing should be vague, duplicated or contradictory, and the list must match what the lesson and packet actually contain. Day names must be right for the lesson date (see plan.py DATES). Links must open the right page.
7. **Packet.** The print view is 2 clean pages. Directions are clear, every item can be answered, the key is correct, and nothing is cut off.
8. **Course card.** The date, title and buttons are correct and everything links.

Fix every problem directly in data/<who>_LNN.json (json.dump ensure_ascii=False, indent=1). Then run `python3 validate.py <file>` (must be OK), `python3 build.py <who>`, and `NODE_PATH=$(npm root -g) node test.js <who> <n...>` (must be OK). Re-screenshot what you changed and look again.

If the problem is in the engine (bb.js, bb.css, build.py), do NOT edit it. Describe it exactly in your reply. Don't commit or push. Only edit your assigned files.

Reply with a short list per lesson: every fix (before → after), every engine issue, and "clean" where there was none.

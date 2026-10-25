# Independent page-by-page audit — KCE Building Blocks
You did NOT write these lessons. Read /home/claude/bb_build/SPEC.md (the rules and the student profiles) first. Then audit each assigned data/<who>_LNN.json slide by slide, item by item, as a demanding teacher would, AND open the built pages in a browser (Playwright, NODE_PATH=$(npm root -g); pages in /home/claude/kgh/building-blocks/<who>/) to look at every slide, the practice set, the packet (print view) and the teacher page (code 9110). Take screenshots and look at them.

Check:
1. Math/facts: recompute every answer, every visual matches its question (group counts, arrays, number lines), every "why" and every "no" explanation is true.
2. Exactly one defensible answer per question; wrong choices are real mistakes; no giveaways; not too easy for the student; nothing repeated from her other lessons.
3. Level: Bristol text short and simple enough for a Grade 2–3 reader to follow alone; Bailey Grade 4–5 with a strong vocabulary component (words not repeated across her lessons, meanings accurate, used in questions).
4. Sort items go in exactly one bucket; order steps have exactly one order; build targets match the text.
5. Packet: kid-language directions, every item numbered and keyed in teacher.packet_key with a correct answer; match right column scrambled; prints 2 pages clean.
6. Teacher plan: 60 minutes, realistic, refers to the right slides, useful watch-fors; tasks fit the time until the next lesson; "also" links point to the right existing lesson and say to type 1111 if locked.
7. American English, "lesson" not "session", no typing required on screen, no voice/video references.
Fix every problem directly in the JSON (python, json.dump ensure_ascii=False, indent=1). Then: python3 validate.py <file> → OK; python3 build.py <who>; NODE_PATH=$(npm root -g) node test.js <who> <n...> → OK.
Do NOT edit engine files (bb.js, bb.css, build.py, plan.py, validate.py, test.js) — if you find an engine bug, describe it in your reply. Do not commit or push.
Reply with a short per-lesson list: every fix (before → after, brief) and "no issues" where none.

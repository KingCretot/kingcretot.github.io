# KCE Building Blocks — engine source and how to add a new student

Saved to GitHub on Oct 25, 2026 (repo KingCretot/kingcretot.github.io, branch `building-blocks-source`,
folder `_build/building-blocks/`). This branch is NOT served by GitHub Pages; the live site is the `main` branch.

## What Building Blocks is
A custom, kid-friendly course for ONE student, built from their diagnostic and learner profile and run for the school
year. Jonathan's standing approach (Oct 25, 2026): Pathways stays the master course as-is; each new child gets their
own Building Blocks course that links into Pathways (and Math Foundations, Reading Foundations, Reading Power) for
practice. Live examples: building-blocks/bristol, /bailey (3 lessons a week), /ethan (1 lesson a week = 1 Pathways week).

Each lesson date has: Class Lesson (teacher-led, code 9110), After-Class Lesson ending in a scored Show What You Know
(3 rotating sets; score unlocks the next lesson), Practice (3 rotating sets), 2-page printable Packet, locked Teacher
Plan & Key, a task list until the next lesson, and "Also do" links into Pathways/Foundations (1111 unlocks those).
Results go to Formspree `maeqzabe` and are logged in each student's Weekly Score Log in Drive.

## Files
- `plan.py` — dates, weekly topics, colors, mastery, names, books, linked KCE lessons, family break projects.
- `data/<student>_LNN.json` — one file per lesson (content). `gen/` — generator scripts for some lessons.
- `build.py` — renders data into `/home/claude/kgh/building-blocks/<student>/` (course page, class-NN, lesson-NN,
  practice-NN, packet-NN, teacher-NN, print-NN.pdf). Shared runtime: `assets/bb.js`, `assets/bb.css`
  (copied live as building-blocks/bb.js, bb.css).
- `validate.py` (data checks), `test.js` (click-through test, packet must print exactly 2 pages), `print_day.py`,
  `projects.py` / `projects_ethan.py` (family projects), `protect.py`.
- `SPEC.md` — the lesson-writer spec and Jonathan's quality bar. `AUDIT*.md` — review findings and fixes.

## Set up a fresh workspace
    git clone https://github.com/KingCretot/kingcretot.github.io /home/claude/kgh
    cd /home/claude/kgh && git fetch origin building-blocks-source
    git worktree add /tmp/bbsrc building-blocks-source
    cp -r /tmp/bbsrc/_build/building-blocks /home/claude/bb_build
    (build.py writes to /home/claude/kgh/building-blocks — keep that path.)

## Add a new student (e.g. "maya")
1. Diagnostic + learner profile first (strengths, weak areas, reading book, grade band, mastery 85 or 90).
2. In `plan.py`: add `STU_DATES["maya"]` (lesson n, ISO date, weekday, "In person"/"Zoom"), `STU_WEEKS["maya"]`,
   `TOPICS["maya"]` (week → title, focus area, color, [linked Pathways/Foundations lessons]), `MASTERY`, `NAMES`,
   `BOOKS`, and `SINGLE` if one lesson per week; `PROJECTS["maya"]` for long breaks if wanted.
   Respect KCE no-lesson periods (e.g. Nov 16–30, Dec 20–28, Jan 1 in 2026–27).
3. Add a student section to `SPEC.md` (who they are, level, weak areas, book) so lesson writers match them.
4. Write `data/maya_L01.json` … following SPEC.md; run `python3 validate.py data/maya_L01.json`,
   `python3 build.py maya`, `NODE_PATH=$(npm root -g) node test.js maya 1`.
5. Add the student's button to the root picker page in `build.py` (search "Pick your name").
6. Independent review of every lesson, then commit `building-blocks/maya/` to `main` and verify live.
7. Create the student's Weekly Score Log in their Drive folder; post the course page link in their Classroom.
   Single-student courses never go in the Members Portal.
8. Save any engine or plan changes back to this branch.

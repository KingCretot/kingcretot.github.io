# State Focus — independent fact-check brief (Oct 25)

You did not write these files. KCE (KingCretot Experience) teachers will use them to build State Focus lessons for kids, so
every fact must be right. Read /home/claude/statefocus/BRIEF.md (the content rules and JSON shape, including ROUND 2 RULES)
first. Then, for EACH of your states, open /home/claude/statefocus/data/<postal>.json and check it.

## What to check (highest risk first)
1. Numbers and dates: statehood date and admission order, legislature chamber sizes, number of justices, counties/parishes/
   boroughs, constitution year, governor term, trailblazer years, every history date.
2. Names: tribal nations must use their OFFICIAL names (names containing "Indians" are fine and should be restored if a
   writer shortened them); "today" lists only nations actually recognized (federal or state; say which) in that state.
3. Trailblazers: each claim in "text" is true; the person is genuinely tied to that state; no current officeholders.
4. Honesty and tone rules from BRIEF.md (Indigenous Peoples named, slavery told plainly, "enslaved people", no em dashes,
   American English, no "session").
5. Gaps the writer left (e.g. empty symbols, a kid_line that is a teacher note instead of an exact quote, missing justices
   count): fill them ONLY if you open a source that supports it. Otherwise leave the honest gap.
6. Sources: every URL in "sources" should be real; remove any that you find is dead or irrelevant (keep 8+).

## Budget and tools
- Search budget is shared: at most 7 WebSearch calls per state. WebFetch only (never curl/wget/Python for web pages).
- Fix the JSON directly with a Python script in your scratch folder (json.load / json.dump ensure_ascii=False, indent=1),
  then run `python3 /home/claude/statefocus/check.py data/<postal>.json` until OK.
- Do not touch other states' files. No git.

## Report
One line per state: OK as is / what you corrected (old → new, with the source) / gaps left. Keep it short.

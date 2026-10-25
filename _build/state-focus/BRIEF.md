# KCE State Focus repository — state researcher brief (Oct 25, 2026)

## What this is
KingCretot Experience (KCE) has "Florida Focus": optional state lessons inside KCE Pathways Science and Social Studies
(Grades 2–3 and Grades 4–5), e.g. Grades 2–3 "Florida's Communities and Government", "Florida's First Peoples",
"Florida Trailblazers"; Grades 4–5 "Florida's First Nations", "Spanish Florida and Fort Mose", "Florida 1821–1877";
Science "The Everglades", "Hurricanes", "Springs and Manatees", "Space Coast". Jonathan (CEO) wants a **State Focus
repository for every U.S. state**: one reference file that holds, for each state, the verified content needed to pull that
state into a student's custom course later (e.g. a child from Ohio gets Ohio Focus lessons). It is a content bank, not
lessons yet. Teachers read it; accuracy is everything.

## Your job
Research the states assigned to you and write ONE JSON file per state: `/home/claude/statefocus/data/<postal>.json`
(e.g. `oh.json`), with a Python script in your own scratch folder (json.dump, ensure_ascii=False, indent=1).
Use WebSearch/WebFetch. Prefer official sources (state legislature, governor's office, state library/archives, Secretary
of State, NPS, USGS, NOAA, state historical society, tribal nations' own sites, Bureau of Indian Affairs, Library of
Congress, Smithsonian, National Archives, Britannica). Every fact you write must come from a source you actually opened
in this task — no facts from memory alone. If you cannot confirm something, leave it out.

## Content rules (Jonathan's standing rules for KCE Social Studies)
- American English. Plain, kid-usable wording (teachers will adapt it), but precise.
- Say "Indigenous Peoples" and always name the nation (e.g. "the Shawnee", "the Hopi"). Use the nation's own preferred
  name where known (give the older/English name in parentheses if helpful).
- Honest, non-Europeanized history: include Indigenous nations, Africans and Black Americans, Mexican/Latino, Chinese and
  other Asian American, and women's history with NAMED people, and tell white figures honestly (what they did, good and bad).
  Hard history stated plainly and calmly, never graphically: "enslaved people", "enslavers", "freedom seekers".
- Grades 4–5 history arc is before 1492 → Reconstruction (1877). Trailblazers may be from any era.
- Do NOT name current officeholders (governors etc. change); name the office and what it does.
- No dates you cannot source. Statehood: exact date and the state's order of admission (original 13: date of ratifying
  the U.S. Constitution, and say so).

## JSON shape (all keys required; lists may be shorter only if sources truly do not support more)
```
{
 "state": "Ohio", "postal": "OH", "region": "Midwest",          // US Census region: Northeast, Midwest, South, West
 "facts": {
   "capital": "Columbus", "largest_city": "Columbus",
   "statehood": "March 1, 1803", "order": 17, "statehood_note": "",   // e.g. "ratified the U.S. Constitution" for the 13
   "nickname": "The Buckeye State", "motto": "With God, all things are possible",
   "borders": ["Michigan", "Indiana", "Kentucky", "West Virginia", "Pennsylvania", "Lake Erie"],
   "symbols": [{"type": "state bird", "name": "Northern cardinal"}, ...3–5 symbols],
   "name_origin": "From the Seneca word for 'great river' (the Ohio River)."
 },
 "government": {
   "legislature": "Ohio General Assembly", "chambers": "Ohio Senate (33) and Ohio House of Representatives (99)",
   "executive": "Governor (4-year term; ...)", "courts": "Supreme Court of Ohio (7 justices) ...",
   "local": "88 counties; ...",                                   // Louisiana parishes, Alaska boroughs, CT/RI notes
   "constitution": "Current constitution adopted 1851 ...",
   "kid_line": "One short real line or idea from the state constitution, quoted exactly, with article/section."
 },
 "first_peoples": {
   "long_ago": [{"nation": "...", "about": "1–2 sentences: where they lived, how they lived, a sourced detail"}, ...3–6],
   "today": [{"nation": "...", "about": "federally or state recognized nation in the state today, 1 sentence"}, ...0–8],
   "today_note": "e.g. 'Ohio has no federally recognized tribes today; many nations removed from Ohio now live in Oklahoma, Kansas ...' — sourced",
   "sites": ["Serpent Mound (Adena/Fort Ancient) ...", ...1–4 places to see]
 },
 "history": [ {"year": "c. 1000", "event": "..."} , ... 8–14 entries from before 1492 through 1877, in order,
              including European arrival, slavery/freedom (or free-state status and the Underground Railroad, if true),
              Indigenous removal or treaties, statehood, the Civil War role, Reconstruction ],
 "trailblazers": [ {"name": "...", "years": "1820–1913", "group": "e.g. Black American woman", "text": "2–3 sentences, what they did, sourced"}, ...5–7,
                   mixing eras, women and men, and the communities above that apply to the state ],
 "geography": {"landforms": ["..."], "waters": ["..."], "regions": "the state's natural regions in one sentence"},
 "science": {
   "ecosystems": [{"name": "...", "about": "1–2 sentences with a sourced living-things detail"}, ...2–4],
   "weather": "the state's real weather/hazards (tornadoes, lake-effect snow, earthquakes, wildfire, hurricanes ...)",
   "resources": "main natural resources / economy in 1–2 sentences",
   "highlight": "one standout science topic for kids (e.g. a famous fossil site, volcano, space center, glacier) with a fact"
 },
 "units": {   // ready-to-build State Focus units modeled on Florida Focus (title + one-line plan each)
   "g3_ss":  [{"title": "...", "plan": "..."}, x3],   // U1 communities & government, U2 first peoples, U3 trailblazers
   "g45_ss": [{"title": "...", "plan": "..."}, x3],   // U1 first nations, U2 colonial/early, U3 statehood→Reconstruction
   "g3_sci": [{"title": "...", "plan": "..."}, x3],
   "g45_sci":[{"title": "...", "plan": "..."}, x3]
 },
 "sources": [{"title": "...", "url": "https://..."}, ...8+ real URLs you opened]
}
```

## Quality
- Re-read every entry against its source before saving. Numbers (seats, counties, justices, dates) must match the source.
- Do not repeat the same trailblazer list every state uses (e.g. only presidents); find people tied to THAT state.
- Validate: `python3 /home/claude/statefocus/check.py data/<postal>.json` must print OK (it checks the shape).
- Do not touch other researchers' files. No git.
- Final report: one line per state (done / anything you could not confirm).

## ROUND 2 RULES (Oct 25) — override anything above
- Search budget is shared by every researcher: use AT MOST 10 WebSearch calls per state (30 total for 3 states). Make each search count:
  one search can return several official URLs (e.g. "Ohio General Assembly senators representatives number official site").
  Then open pages with WebFetch (URLs from search results, or links on pages you already opened).
- Do not fetch web pages with curl, wget, Python or any shell command. Use WebFetch only.
- Use each nation's OFFICIAL name exactly, including names that contain "Indians" (e.g. "Poarch Band of Creek Indians"). The checker no longer rejects it.
- Wikipedia may be used for background, but prefer official/state/NPS/tribal pages for numbers (seats, justices, counties, dates).
- Finish one state completely (file written, checker OK) before starting the next, so a budget stop never leaves all three unfinished.

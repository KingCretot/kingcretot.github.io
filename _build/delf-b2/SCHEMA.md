# KCE DELF B2 — week data schema (v1)

Every week page (`/delf-b2/weekNN.html`) is a fixed shell plus ONE JSON block:

```html
<script type="application/json" id="delf-data"> …week data… </script>
<script src="assets/delf.js"></script>
```

The engine (`assets/delf.js` + `assets/delf.css`) renders everything from that block. Weeks 2–12 and the two mock exams are produced by **filling data only**; no engine changes are needed.

## Workflow (tools in `/home/claude/delf/tools/`)

1. Author `content/weekNN.py` (a Python module exposing `DATA` and optional `SEED`) or `content/weekNN.json` (same structure, optional `"_seed"`). Week 1 (`week01.py` + `w01_part1..3.py`) is the reference.
2. `python3 build_week.py NN --check` — normalizes, shuffles answer positions, applies French typography, validates, prints word counts and the A/B/C sequence. Fix every `ERROR`.
3. `python3 gen_audio.py NN` — generates every MP3 into `delf-b2/audio/weekNN/` (CO recordings + examiner questions). Prints durations.
4. `python3 build_week.py NN` — writes `delf-b2/weekNN.html` (with audio durations) and `content/weekNN.built.json`.
5. `node test_week.js NN` — headless end-to-end test (port 8799, or `PORT=…`), screenshots in `/home/claude/delf/shots/`.
6. In `delf-b2/index.html`, set `"available": true` for the week; in the previous week's source set `next.available: true`, rebuild it.

## Conventions

- **L** = localized text `{"fr": "...", "en": "..."}`. Authoring shortcut: `["fr", "en"]` is accepted wherever an L is expected for `q`, `ex`/`explain`, CE `title`/`lead`/`paras`, CE3 `question`/`role`/`text`.
- **HTML fields** (trusted, rendered as HTML): `strategy.html`, `lessons[].html`, `pe.prompt`, `po.structure`, `po.docs[].outline`. Everything else is plain text and escaped.
- **French typography** is applied by the builder (non-breaking spaces before `; : ! ?` and inside `« »`). Write normal spaces.
- **English**: American spelling; never the word "session" (the builder rejects it and warns on British spellings).
- **MCQ authoring**: write `opts` with the **correct option first**; the builder shuffles into balanced A/B/C positions (counts within one of each other per section, never the same letter 3 times in a row across the section, every letter used in each 7-item exercise) and records `answer`. Already-final items (`options` + `answer`) are kept as is. Explanations must not refer to letters.
- Item **weights**: Ex 1 and Ex 2 = 7 items, four at 1.5 + three at 1 (9 pts); Ex 3 = 6 items, two at 1.5 + four at 1 (7 pts). Section total 25. The builder enforces this.
- **Option lengths**: the key must not be a length cue. The builder reports how often the key is strictly the longest and strictly the shortest option (target about a third or less each; error above 40% for longest).
- Every « quoted » passage in an explanation should be an exact excerpt of the document.
- Word counts enforced by the builder: CO Ex1/Ex2 transcripts 450–550; CO Ex3 items 150–200 each; CE Ex1/Ex2 body (paragraphs only; title and lead excluded) 425–450; CE3 opinions 100–120 each; PE model 280–320; lexicon 25–30 items; practice 8; grammar exercise 10; examiner questions 6–8 per document.

## Top level

| key | type | notes |
|---|---|---|
| `schemaVersion` | 1 | |
| `course` | `"delf-b2"` | |
| `id` | `"w01"`… `"w12"` | localStorage key is `kceDelfB2:<id>`; IndexedDB recordings are `<id>:<recKey>` |
| `week` | number | |
| `mode` | `"week"` or `"mock"` | `mock`: English help hidden on questions/options until the section is submitted; CE 60-min timer and PE timer start automatically when the screen opens |
| `title`, `subtitle` | L | |
| `audioBase` | `"audio/weekNN/"` | relative to the page |
| `next` | `{href, available, label: L}` | Bilan shows a link, or "bientôt disponible" |
| `hub` | `"index.html"` | |
| `formspree` | url, optional | default `https://formspree.io/f/moevakrw` |
| `screens` | array of Screen | order = stepper order; any subset/order is allowed |

Every Screen has `id`, `type`, `label: L`. Sections: `co` screens share `section: "co"`, `ce`/`ce3` share `section: "ce"`. The screen with `submit: true` carries the section's submit button (put it on the last screen of the section).

## Screen types

### `welcome`
`intro: L`, `objectives: [L]`, `plan: [{fr, en, min}]`, `strategy: {title: L, html: L(HTML)}`. Contains the name gate (name stored once for the whole course at `kceDelfB2:name`).

### `lexicon`
`intro: L`, `groups: [{title: L, items: [{fr, en, ex, exEn}]}]`, `practice: {instructions: L, bank: [str], items: [{text (with ___), en, answer (must be in bank), explain: L}]}` — dropdown cloze, 8 items.

### `grammar`
`intro: L`, `lessons: [{title: L, html: L(HTML)}]`, `exercise: {instructions: L, items: [{before, verb?, blank?, after, en, accept: [str], explain: L}]}`. `verb` shows "(verbe)" after the input; `accept` lists every correct variant (comparison ignores case, apostrophe style, extra spaces, edge punctuation).

### `co` (listening exercise)
`ex: 1|2|3`, `title: L`, `instructions: L`, `readSeconds` (60 for Ex1/2, 30 for Ex3; per recording), `submit?`,
`recordings: [{id, file, maxPlays (2 for Ex1/2, 1 for Ex3), label?: L, genre: L, source: L, duration (s, added by builder), speakers: {key: {name, role: L, voice}}, segments: [{spk, fr, en, say?}]}]`,
`items: [MCQ + rec]` (`rec` = recording id; items are shown under their recording).
Authoring shortcut for segments: `[spk, fr, en, say?]`. `say` = text read by TTS when pronunciation needs help. `voice` ∈ `piper:siwis`, `piper:tom`, `piper:upmc:0` (jessica), `piper:upmc:1` (pierre), `kokoro:ff_siwis`, optionally with a pitch factor for an extra distinct speaker: `piper:upmc:0@1.1` (higher/younger), `piper:upmc:1@0.92` (deeper). **`piper:tom` is reserved for the examiner** (all weeks); use pierre for male speakers in documents. **Never put `piper:siwis` and `kokoro:ff_siwis` in the same document: they are the same speaker.** Kokoro garbles some words; prefer Piper for key lines. Spell out numbers if needed, avoid "l'IA" in audio (write "l'intelligence artificielle"), and check every recording with faster-whisper (medium) before publishing — rephrase any key line that does not transcribe correctly.

Behavior: reading countdown → play (no pause/seek) → play count saved immediately to localStorage (reload cannot reset it). After section submission: score /25 with weights, per-item explanation, native audio controls (unlimited replay), transcript with speaker names and English.

### `ce` (reading Ex1/Ex2)
`ex`, `title: L`, `instructions: L`, `timer: {minutes: 60, scope: "ce"}` (optional section timer), `doc: {kind, source: L, title: L, lead: L|null, paras: [L]}`, `items: [MCQ]`. English of the document is shown only after submission.

### `ce3` (reading Ex3, attribuer un point de vue)
`doc: {kind: "opinions", source: L, question: L, opinions: [{label: "A"|"B"|"C", name, role: L, text: L}]}`, `items: [{id, weight, q: L, answer: 0|1|2, explain: L}]` (answer = index of the person; options are generated from the opinions). Keep 2/2/2 and no letter three times in a row (also across the end of CE Ex2 — the builder checks the whole section).

### MCQ
`{id, weight: 1.5|1, q: L, options: [L, L, L], answer: 0|1|2, explain: L, rec?}`. Explanations cite the document and say why each distractor is wrong.

### `pe`
`promptId`, `genre: L`, `minutes: 60`, `minWords: 250`, `zeroWords: 124`, `warnMinutes: 10`, `prompt: L(HTML)`, `checklist: [L]`, `model: {title, paras: [str], annotations: [{quote (exact substring of a paragraph), fr, en}], wordCount (builder)}`. The official 0/1/3/5 grid is built into the engine.

### `po`
`prepMinutes: 30`, `monologueMin: 5`, `monologueMax: 7`, `instructions: L`, `structure: L(HTML)`, `examinerVoice: "piper:tom"`,
`docs: [{id: "A"|"B", title, source, text, en, problem: L, outline: L(HTML), examiner: [{id (unique in the week, e.g. a1…b7), fr, en, file (default "po-<id>.mp3"), duration}]}]`,
`expressions: [{title: L, items: [str]}]`. Recording keys: `mono` + each examiner `id`.

### `bilan`
No fields. Shows lexicon/grammar/CO/CE scores, PE/PO sent dates, projection and pass rule, "Envoyer mon bilan", next-week link, reset.

## Mock exams (Weeks 11–12)
Use `mode: "mock"` and only exam screens, e.g. `[welcome, co1, co2, co3, ce1, ce2, ce3, pe, po, bilan]`. Same types and fields; PE prompt and PO documents "as drawn". Title in `title` (e.g. "Examen blanc 1").

## Saved state (localStorage `kceDelfB2:<id>`, all access in try/catch)
`{screen, visited, lex:{a,checked}, gram:{a,checked}, co:{a:{itemId:idx}, plays:{recId:n}, read:{recId:{start,skip|done}}, submitted, score, byEx, at}, ce:{a, submitted, score, timerStart, at}, pe:{text, timerStart, checks, sentAt, sentWords, atLimit:{text,words,at}}, po:{doc, prepStart, prepEnd, notes, rec:{key:{dur,at,type,size}}, tr:{key:text}, sentAt}, bilan:{sentAt}, sends:{co,ce}}`. Recording blobs: IndexedDB database `kceDelfB2`, store `rec`. Global: `kceDelfB2:name`, `kceDelfB2:en`. The hub reads each week's key to show status (Non commencée / En cours · n/4 épreuves / Terminée) and scores.

## Formspree payloads (endpoint moevakrw)
All: `_subject`, `student`, `week`, `week_id`, `part`, `submitted_at`.
- CO / CE (sent automatically on submission): `score` ("17,5/25"), `detail` (per exercise), `answers` (one line per item with chosen/correct), CO `listens`, CE `timer`.
- PE: `prompt_id`, `genre`, `word_count`, `time_used`, `overtime`, `self_check`, `essay` (full text); if text changed after time ran out: `words_at_60_min`, `essay_at_60_min`.
- PO: `document`, `preparation`, `notes`, `monologue_duration`, `monologue_transcript`, `interaction` (each question + duration + transcript), `recordings` (reminder that audio is emailed to kce@kingcretot.com with subject "DELF B2 oral — Semaine N — Name").
- Bilan: `co`, `ce`, `pe`, `po`, `lexique`, `outils`.

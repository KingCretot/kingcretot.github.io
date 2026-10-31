KCE Student Progress System — source and tests (Phase 2, sessions 1–2).
Live copies (not connected to any lesson yet): /kce-progress/ on main.
- firestore.rules: database security rules v2 (after the independent review)
- kce-progress.js: shared progress file course pages will load (Phase 3)
- dashboard.html / dashboard.js: KCE's private dashboard and enrollment form
- rules.test.mjs (53 rule tests), e2e.mjs (27 browser tests), dash.mjs (16), sec.mjs (5) — run against the local Firebase emulators
- review/: the independent reviewer's proof tests (written to show weaknesses; now fail where fixed)

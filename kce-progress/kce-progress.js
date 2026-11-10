// KCE Student Progress — shared progress file for every KCE course page.
// Load with:  <script type="module" src="/kce-progress/kce-progress.js" data-course="bb-bristol"></script>
// It never changes how a lesson works: lessons keep saving on the device and Formspree
// keeps running. When someone signs in, this file copies that progress to KCE's
// database, brings it back on any other device, and records each lesson score.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, signOut, connectAuthEmulator, signInWithCredential }
  from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator, collection, doc, getDocs, addDoc, query, where, serverTimestamp, runTransaction }
  from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const CONFIG = {
  apiKey: 'AIzaSyDgsGuF7rkFEzJ8ls2t67_ss1-4HEvaQe0',
  authDomain: 'kce-student-progress.firebaseapp.com',
  projectId: 'kce-student-progress',
  storageBucket: 'kce-student-progress.firebasestorage.app',
  messagingSenderId: '571768874119',
  appId: '1:571768874119:web:cd2092d52fb15552a8c422'
};
const ADMIN = 'kce@kingcretot.com';
// KCE codes: 12 letters/numbers (shown as XXXX-XXXX-XXXX). The code is the whole sign-in.
const CODE_DOMAIN = '@code.kingcretot.com';
// The sign-in name is a one-way scramble of the code, so the code itself is never kept anywhere
// (not in Firebase, not on the device). The code is the password, which Firebase stores scrambled too.
async function codeToLogin(c) {
  const k = String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (k.length !== 12) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(k), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('kce-code-v1'), iterations: 100000 }, key, 96);
  const id = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { email: id + CODE_DOMAIN, password: 'kce-' + k };
}
const isCodeUser = (u) => !!u && (u.email || '').endsWith(CODE_DOMAIN);
// Device storage keys used by the Building Blocks engine.
const KEYS = { items: 'kce_bb_progress', attempts: 'kce_bb_attempts', tasks: 'kce_bb_tasks' };

const me = document.querySelector('script[data-course][src*="kce-progress"]');
const COURSE = me && me.dataset.course;
// Building Blocks pages also keep their lesson unlocks in step across devices. Every other
// course (Pathways, Math Foundations, Reading Power, Reading Foundations) records scores only.
const SYNC = /^bb-/.test(COURSE || '');
const PART = { 'pathways-g23': 'Weekly check', 'pathways-g45': 'Weekly check', 'mathfound-g23': 'Lesson check', 'mathfound-g45': 'Lesson check', readpower: 'Lesson check', readfound: 'Lesson check' };
// This course's own entries, matched exactly (e.g. bb-bristol-L01, practice-bb-bristol-L01, t-bristol-1-0).
const rx = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WHO = COURSE ? COURSE.replace(/^bb-/, '') : '';
const PAT = {
  items: new RegExp('^' + rx(COURSE || '') + '-L\\d+$'),
  attempts: new RegExp('^(practice-)?(' + rx(COURSE || '') + '|' + rx(WHO || '-') + ')-L\\d+$'),  // practice pages use practice-bristol-L01
  tasks: new RegExp('^t-' + rx(WHO) + '-\\d+-\\d+$')
};
const PARTS = ['items', 'attempts', 'tasks'];
const state = { user: null, admin: false, student: null, ready: false, canLog: false, syncError: '', saving: null, base: {} };
// Short, readable reason for a failure (shown on the bar so it can be read out to KCE).
const why = (e) => String((e && (e.code || e.name)) || (e && e.message) || 'unknown').replace(/^firestore\//, '').replace(/^auth\//, '').slice(0, 60);

function rd(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
const rawSet = Storage.prototype.setItem;
function wr(k, v) { try { rawSet.call(localStorage, k, JSON.stringify(v)); } catch (e) {} }

// Clean values so only plain numbers and yes/no ever travel between device and database.
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(1000, n)) : 0; };
const clean = {
  items: (o = {}) => { const r = {}; for (const k in o) if (PAT.items.test(k)) { const x = o[k] || {}; r[k] = { best: num(x.best), passed: x.passed === true, last: x.last == null ? null : num(x.last) }; } return r; },
  attempts: (o = {}) => { const r = {}; for (const k in o) if (PAT.attempts.test(k)) r[k] = num(o[k]); return r; },
  tasks: (o = {}) => { const r = {}; for (const k in o) if (PAT.tasks.test(k)) r[k] = o[k] === true; return r; }
};
const local = () => ({ items: clean.items(rd(KEYS.items)), attempts: clean.attempts(rd(KEYS.attempts)), tasks: clean.tasks(rd(KEYS.tasks)) });
const fromCloud = (c = {}) => ({ items: clean.items(c.items), attempts: clean.attempts(c.attempts), tasks: clean.tasks(c.tasks) });

// Combine two copies without ever losing a score: best score, "passed" once passed,
// highest attempt count, finished tasks stay finished.
function mergeItems(a = {}, b = {}) {
  const out = { ...a };
  for (const k in b) {
    const x = out[k] || {}, y = b[k] || {};
    out[k] = { best: Math.max(x.best || 0, y.best || 0), passed: !!(x.passed || y.passed), last: y.last != null ? y.last : (x.last ?? null) };
  }
  return out;
}
function mergeMax(a = {}, b = {}) { const out = { ...a }; for (const k in b) out[k] = Math.max(out[k] || 0, b[k] || 0); return out; }
function mergeTrue(a = {}, b = {}) { const out = { ...a }; for (const k in b) out[k] = !!(out[k] || b[k]); return out; }
const mergeAll = (a, b) => ({ items: mergeItems(a.items, b.items), attempts: mergeMax(a.attempts, b.attempts), tasks: mergeTrue(a.tasks, b.tasks) });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Put this course's entries on the device, leaving every other course's entries alone.
function putLocal(data) {
  for (const p of PARTS) {
    const all = rd(KEYS[p]);
    for (const k in all) if (PAT[p].test(k)) delete all[k];
    wr(KEYS[p], { ...all, ...data[p] });
  }
}
function clearLocal() { putLocal({ items: {}, attempts: {}, tasks: {} }); }
const OWNER = 'kcep_owner_' + COURSE;   // which student this device's course progress belongs to

// ---------- small on-page bar (text only, never HTML from the database) ----------
const css = `.kcep{position:fixed;right:12px;bottom:12px;z-index:2147483600;font:600 13px/1.3 Arial,Helvetica,sans-serif;
background:#0A1F3D;color:#fff;border:2px solid #C9A84C;border-radius:22px;padding:8px 14px;box-shadow:0 3px 12px rgba(0,0,0,.25);
display:flex;gap:10px;align-items:center;max-width:92vw}
.kcep button{font:inherit;cursor:pointer;border:0;border-radius:16px;padding:5px 12px;background:#C9A84C;color:#0A1F3D}
.kcep a{color:#C9A84C;cursor:pointer;text-decoration:underline;font-weight:400}
.kcep input{font:600 14px Arial,Helvetica,sans-serif;letter-spacing:1px;text-transform:uppercase;border:0;border-radius:12px;padding:5px 10px;width:170px}
.kcep-ov{position:fixed;inset:0;background:rgba(10,31,61,.55);z-index:2147483646;display:flex;align-items:center;justify-content:center}
.kcep-box{background:#fff;color:#0A1F3D;border-top:6px solid #C9A84C;border-radius:14px;padding:22px 24px;width:min(380px,90vw);
font:15px/1.4 Arial,Helvetica,sans-serif;text-align:center}
.kcep-box h3{font:bold 20px Georgia,'Times New Roman',serif;margin:0 0 14px}
.kcep-box button{display:block;width:100%;margin:8px 0;padding:12px;border-radius:10px;border:2px solid #0A1F3D;background:#fff;
color:#0A1F3D;font:bold 17px Arial,Helvetica,sans-serif;cursor:pointer}
.kcep-box button:hover{background:#0A1F3D;color:#fff}`;
let bar;
function el(tag, text, attrs = {}) { const e = document.createElement(tag); if (text != null) e.textContent = text; Object.assign(e, attrs); return e; }
function ui(...children) {
  if (!bar) {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    bar = el('div', null, { className: 'kcep' }); document.body.appendChild(bar);
  }
  bar.replaceChildren(...children);
  return bar;
}
function picker(title, people) {
  return new Promise((resolve) => {
    const ov = el('div', null, { className: 'kcep-ov' }), box = el('div', null, { className: 'kcep-box' });
    box.appendChild(el('h3', title));
    people.forEach((p) => box.appendChild(el('button', p.firstName, { onclick: () => { ov.remove(); resolve(p); } })));
    ov.appendChild(box); document.body.appendChild(ov);
  });
}

// ---------- start ----------
let auth, db;
if (COURSE) {
  try { const app = initializeApp(CONFIG); auth = getAuth(app); db = getFirestore(app); }
  catch (e) { console.warn('[KCE progress] could not start', e); }
  // Local testing only (never active on a live page).
  if (auth && me.dataset.emulator === 'local' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    window.__kcepTestSignIn = (email) => signInWithCredential(auth,
      GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })));
  }

  if (auth) onAuthStateChanged(auth, async (user) => {
    state.user = user; state.student = null; state.ready = false; state.canLog = false; state.syncError = '';
    if (!user) return showSignIn();
    state.admin = !isCodeUser(user) && (user.email || '').toLowerCase() === ADMIN;
    try {
      const people = await findStudents(user);
      if (!people.length) {
        return ui(el('span', isCodeUser(user) ? "This KCE code isn't set up for this course yet. Please contact KCE." : "This Google account isn't set up for this course yet. Please contact KCE."),
                  el('a', 'Sign out', { onclick: () => leave() }));
      }
      const key = 'kcep_pick_' + COURSE + '_' + user.uid;
      let who = null;
      try { const saved = sessionStorage.getItem(key); who = people.find((p) => p.path === saved) || null; } catch (e) {}
      if (!who) who = people.length === 1 ? people[0]
        : await picker(state.admin ? 'Teaching:' : "Who's learning today?", people);
      try { sessionStorage.setItem(key, who.path); } catch (e) {}
      state.student = who;
      // Scores are recorded as soon as we know who is learning, even if the lesson sync below fails.
      // KCE's own teaching laptop never records anything to a student's profile.
      state.canLog = !state.admin;
      try {
        if (SYNC && await syncDown()) return; // page is refreshing to show the saved progress
        state.ready = true;
      } catch (e) {
        state.syncError = why(e);
        console.warn('[KCE progress] lesson sync failed; scores still record', e);
      }
      showSaving(people.length > 1);
    } catch (e) {
      console.warn('[KCE progress]', e);
      ui(el('span', 'Progress is saving on this device only right now (' + why(e) + ').'));
    }
  });

  // Save whenever the lesson saves on the device (grouped, so we don't save every click).
  Storage.prototype.setItem = function (k, v) {
    rawSet.call(this, k, v);
    if (SYNC && this === localStorage && Object.values(KEYS).includes(k) && state.ready && !state.admin) queueSave();
  };

  // Mirror each score the lesson already sends to Formspree into the student's score history.
  const rawFetch = window.fetch;
  window.fetch = function (url, opts) {
    try {
      if (typeof url === 'string' && url.indexOf('formspree.io') !== -1 && opts && opts.body) {
        if (state.canLog) logEvent(JSON.parse(opts.body));
        else if (state.admin && typeof opts.body === 'string') {
          // Taught on KCE's laptop: mark the email so it is never logged as the student's score.
          const b = JSON.parse(opts.body);
          b.kce_device = 'KCE teaching laptop - not a student score';
          b._subject = '[TEACHING - not logged] ' + (b._subject || 'Lesson result');
          opts = Object.assign({}, opts, { body: JSON.stringify(b) });
          return rawFetch.call(this, url, opts);
        }
      }
    } catch (e) {}
    return rawFetch.apply(this, arguments);
  };
}

function showSignIn(note) {
  const kids = [el('span', note || 'Save your progress to KCE'), el('button', 'Sign in with Google', { onclick: async () => {
    const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
    try { await signInWithPopup(auth, p); }
    catch (e) {
      const c = (e && e.code) || '';
      if (c === 'auth/popup-blocked') showSignIn('Please allow pop-ups for this page, then tap Sign in again.');
      else if (c !== 'auth/popup-closed-by-user' && c !== 'auth/cancelled-popup-request') showSignIn("Sign-in didn't work. Please try again, or contact KCE for help.");
    }
  } }), el('a', 'Use a KCE code', { onclick: () => showCode() })];
  ui(...kids);
}
function showCode(note) {
  const box = el('input', null, { type: 'text', placeholder: 'XXXX-XXXX-XXXX', autocomplete: 'off', spellcheck: false, maxLength: 16 });
  box.setAttribute('aria-label', 'KCE code');
  const go = async () => {
    const login = await codeToLogin(box.value);
    if (!login) return showCode('Please type all 12 letters and numbers of your KCE code.');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try { await signInWithEmailAndPassword(auth, login.email, login.password); }
    catch (e) { showCode("That code didn't work. Please check it, or ask KCE for a new one."); }
  };
  const btn = el('button', 'Sign in', { onclick: go });
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  ui(el('span', note || 'Your KCE code:'), box, btn, el('a', 'Back', { onclick: () => showSignIn() }));
  box.focus();
}
function showSaving(canSwitch) {
  const kids = [el('span', state.admin ? 'Teaching: ' + state.student.firstName + ' · nothing on this laptop is recorded to the student’s profile' : '✓ Saving for ' + state.student.firstName + (state.syncError ? ' · scores save to KCE; lesson unlocks on this device only (' + state.syncError + ')' : ''))];
  if (canSwitch) kids.push(el('a', 'Switch', { onclick: () => { try { sessionStorage.removeItem('kcep_pick_' + COURSE + '_' + state.user.uid); } catch (e) {} location.reload(); } }));
  kids.push(el('a', 'Sign out', { onclick: () => leave() }));
  ui(...kids);
}
// Signing out takes this course's progress off the device, so the next person starts clean.
async function leave() {
  clearTimeout(state.saving); state.ready = false;
  if (SYNC) { clearLocal(); try { localStorage.removeItem(OWNER); } catch (e) {} }
  await signOut(auth); location.reload();
}

async function findStudents(user) {
  const email = (user.email || '').toLowerCase();
  const fams = state.admin
    ? await getDocs(collection(db, 'families'))
    : isCodeUser(user)
      ? await getDocs(query(collection(db, 'families'), where('codeUids', 'array-contains', user.uid)))
      : await getDocs(query(collection(db, 'families'), where('parentEmails', 'array-contains', email)));
  const out = [];
  for (const f of fams.docs) {
    const studs = await getDocs(collection(db, 'families', f.id, 'students'));
    studs.forEach((s) => {
      const d = s.data();
      if ((d.courses || []).includes(COURSE)) out.push({ path: `families/${f.id}/students/${s.id}`, firstName: String(d.firstName || '') });
    });
  }
  return out.sort((a, b) => a.firstName.localeCompare(b.firstName));
}

// Bring saved progress onto this device, and send this device's progress up, so nobody starts over.
async function syncDown() {
  const ref = doc(db, state.student.path, 'progress', COURSE);
  let owner = null; try { owner = localStorage.getItem(OWNER); } catch (e) {}
  // Only a family's own device progress is added to their child's record. KCE's teaching
  // screen, or a device last used for a different student, just shows the saved record.
  const useDevice = !state.admin && (owner === null || owner === state.student.path);
  const dev = local();
  let result;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const cloud = fromCloud(snap.exists() ? snap.data() : {});
    result = useDevice ? mergeAll(cloud, dev) : cloud;
    result.unlocked = (snap.exists() && snap.data().unlocked) || {};
    if (useDevice && !same(fromCloud(result), cloud)) {
      tx.set(ref, { items: result.items, attempts: result.attempts, tasks: result.tasks, updatedAt: serverTimestamp() }, { merge: true });
    }
  });
  let changedHere = false;
  if (!same(fromCloud(result), dev)) { putLocal(result); changedHere = true; }
  // KCE's unlocks count on this device too.
  const ul = {}; for (const k in result.unlocked) if (PAT.items.test(k) && result.unlocked[k] === true) ul[k] = true;
  if (Object.keys(ul).length) {
    const u = rd('kce_bb_unlocked'); const nu = { ...u, ...ul };
    if (!same(u, nu)) { wr('kce_bb_unlocked', nu); changedHere = true; }
  }
  if (!state.admin) { try { rawSet.call(localStorage, OWNER, state.student.path); } catch (e) {} }
  state.base = fromCloud(result);
  // Show the brought-back progress once, so the page reflects it.
  const flag = 'kcep_synced_' + COURSE + '_' + state.student.path;
  if (changedHere) { try { if (!sessionStorage.getItem(flag)) { sessionStorage.setItem(flag, '1'); location.reload(); return true; } } catch (e) {} }
  return false;
}

// Save: read the database copy, keep the best of both, then write — so a second open
// device with an older copy can never lower a score.
function queueSave() {
  clearTimeout(state.saving);
  state.saving = setTimeout(async () => {
    const now = local();
    const change = {}; let any = false;
    for (const p of PARTS) for (const k in now[p]) {
      if (!same(now[p][k], (state.base[p] || {})[k])) { (change[p] = change[p] || {})[k] = now[p][k]; any = true; }
    }
    if (!any) return;
    const ref = doc(db, state.student.path, 'progress', COURSE);
    try {
      let merged;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const cloud = fromCloud(snap.exists() ? snap.data() : {});
        merged = mergeAll(cloud, { items: change.items || {}, attempts: change.attempts || {}, tasks: change.tasks || {} });
        tx.set(ref, { items: merged.items, attempts: merged.attempts, tasks: merged.tasks, updatedAt: serverTimestamp() }, { merge: true });
      });
      state.base = merged;
      // If another device had a better score, show it here too.
      const dev = local();
      if (!same(mergeAll(dev, merged), dev)) putLocal(mergeAll(dev, merged));
    } catch (e) {
      console.warn('[KCE progress] save will retry; progress stays on this device', e);
      state.saving = setTimeout(queueSave, 3000);
    }
  }, 1500);
}

// The first name a lesson was given must match the signed-in student, so a score typed in
// under another child's name on a shared computer is never filed to the wrong record.
const firstWord = (v) => String(v || '').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z']/g, '');
function sameChild(o) {
  const typed = firstWord(o.student || o.student_name);
  if (!typed || typed === 'unnamed' || typed === 'student' || typed === 'reader') return true;
  return typed === firstWord(state.student && state.student.firstName);
}
async function logEvent(o) {
  if (o.score == null || o.score === '') return;
  if (!sameChild(o)) { console.warn('[KCE progress] score is for a different child than the one signed in; not recorded (Formspree still has it)'); return; }
  const s = (v, n) => String(v == null ? '' : v).slice(0, n);
  const int = (v, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(500, n)) : d; };
  const total = int(o.total, 0);
  const mastered = o.mastered === 'yes' || o.mastered === true;
  // Attempt number: Building Blocks and Reading send it; Pathways sends "attempts";
  // Math Foundations sends the number of failed tries.
  const attempt = o.attempt != null ? int(o.attempt, 1) : o.attempts != null ? int(o.attempts, 1)
    : o.failedAttempts != null ? Math.max(1, int(o.failedAttempts, 0) + (mastered ? 1 : 0)) : 1;
  const ev = {
    course: COURSE,
    part: s(o.part || PART[COURSE] || 'Lesson', 40),
    lesson: s(o.lesson || o.module || o.lesson_title || '', 80),
    lessonTitle: s(o.lesson_title || '', 200),
    score: Math.max(0, Math.min(100, parseFloat(o.score) || 0)),
    correct: Math.min(int(o.correct, 0), total),
    total,
    mastered,
    attempt,
    questionSet: int(o.question_set, 1),
    missed: (Array.isArray(o.missed) ? o.missed : []).map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join('\n').slice(0, 8000),
    by: state.admin ? 'teacher' : 'family',
    at: serverTimestamp()
  };
  try { await addDoc(collection(db, state.student.path, 'events'), ev); }
  catch (e) {
    console.warn('[KCE progress] score not recorded in database (Formspree still has it)', e);
    ui(el('span', 'Score not saved to KCE (' + why(e) + '). KCE still received it by email.'));
  }
}

// Courses whose lessons don't send every score to Formspree (Reading Power, Reading
// Foundations) hand the score to this directly when a quiz ends.
function record(o) { try { if (state.canLog && !state.admin && o) logEvent(o); } catch (e) {} }
window.KCEProgress = { state, course: COURSE, record };

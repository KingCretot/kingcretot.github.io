// KCE Student Progress — shared progress file for every KCE course page.
// Load with:  <script type="module" src="/kce-progress/kce-progress.js" data-course="bb-bristol"></script>
// It never changes how a lesson works: lessons keep saving on the device and Formspree
// keeps running. When someone signs in, this file copies that progress to KCE's
// database, brings it back on any other device, and records each lesson score.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, connectAuthEmulator, signInWithCredential }
  from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator, collection, doc, getDoc, getDocs, setDoc, addDoc, query, where, serverTimestamp }
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
// Device storage keys used by the Building Blocks engine. Other engines add theirs here.
const KEYS = { items: 'kce_bb_progress', attempts: 'kce_bb_attempts', tasks: 'kce_bb_tasks' };

const me = document.querySelector('script[data-course][src*="kce-progress"]');
const COURSE = me && me.dataset.course;
const state = { user: null, admin: false, student: null, ready: false, saving: null, base: {} };

function rd(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
const rawSet = Storage.prototype.setItem;
function wr(k, v) { try { rawSet.call(localStorage, k, JSON.stringify(v)); } catch (e) {} }
// Only this course's entries (Building Blocks ids carry the course in them, e.g. bb-bristol-L01).
function mine(obj) { const out = {}; for (const k in obj) if (k.indexOf(COURSE + '-') !== -1) out[k] = obj[k]; return out; }

// Combine two copies of progress without ever losing a score: keep the best score,
// keep "passed" once passed, keep the higher attempt count, keep finished tasks.
function mergeItems(a = {}, b = {}) {
  const out = { ...a };
  for (const k in b) {
    const x = out[k] || {}, y = b[k] || {};
    out[k] = { best: Math.max(x.best || 0, y.best || 0), passed: !!(x.passed || y.passed),
               last: (y.last != null ? y.last : x.last) ?? null };
  }
  return out;
}
function mergeMax(a = {}, b = {}) { const out = { ...a }; for (const k in b) out[k] = Math.max(out[k] || 0, b[k] || 0); return out; }
function mergeTrue(a = {}, b = {}) { const out = { ...a }; for (const k in b) out[k] = !!(out[k] || b[k]); return out; }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- small on-page bar ----------
const css = `.kcep{position:fixed;right:12px;bottom:12px;z-index:9999;font:600 13px/1.3 Arial,Helvetica,sans-serif;
background:#0A1F3D;color:#fff;border:2px solid #C9A84C;border-radius:22px;padding:8px 14px;box-shadow:0 3px 12px rgba(0,0,0,.25);
display:flex;gap:10px;align-items:center;max-width:92vw}
.kcep button{font:inherit;cursor:pointer;border:0;border-radius:16px;padding:5px 12px;background:#C9A84C;color:#0A1F3D}
.kcep a{color:#C9A84C;cursor:pointer;text-decoration:underline;font-weight:400}
.kcep-ov{position:fixed;inset:0;background:rgba(10,31,61,.55);z-index:10000;display:flex;align-items:center;justify-content:center}
.kcep-box{background:#fff;color:#0A1F3D;border-top:6px solid #C9A84C;border-radius:14px;padding:22px 24px;width:min(380px,90vw);
font:15px/1.4 Arial,Helvetica,sans-serif;text-align:center}
.kcep-box h3{font:bold 20px Georgia,'Times New Roman',serif;margin:0 0 14px}
.kcep-box button{display:block;width:100%;margin:8px 0;padding:12px;border-radius:10px;border:2px solid #0A1F3D;background:#fff;
color:#0A1F3D;font:bold 17px Arial,Helvetica,sans-serif;cursor:pointer}
.kcep-box button:hover{background:#0A1F3D;color:#fff}`;
let bar;
function ui(html) {
  if (!bar) {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    bar = document.createElement('div'); bar.className = 'kcep'; document.body.appendChild(bar);
  }
  bar.innerHTML = html;
  return bar;
}
function picker(title, people) {
  return new Promise((resolve) => {
    const ov = document.createElement('div'); ov.className = 'kcep-ov';
    ov.innerHTML = `<div class="kcep-box"><h3>${title}</h3></div>`;
    const box = ov.firstChild;
    people.forEach((p) => { const b = document.createElement('button'); b.textContent = p.firstName; b.onclick = () => { ov.remove(); resolve(p); }; box.appendChild(b); });
    document.body.appendChild(ov);
  });
}

// ---------- start ----------
if (COURSE) {
  let app, auth, db;
  try { app = initializeApp(CONFIG); auth = getAuth(app); db = getFirestore(app); }
  catch (e) { console.warn('[KCE progress] could not start', e); }
  // Local testing only (never set on a live page).
  if (auth && me.dataset.emulator === 'local' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    window.__kcepTestSignIn = (email) => signInWithCredential(auth,
      GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })));
  }

  if (auth) onAuthStateChanged(auth, async (user) => {
    state.user = user; state.student = null; state.ready = false;
    if (!user) return showSignIn(auth);
    state.admin = (user.email || '').toLowerCase() === ADMIN;
    try {
      const people = await findStudents(db, user);
      if (!people.length) {
        ui(`<span>This Google account isn't set up for this course yet. Please contact KCE.</span><a id="kcep-out">Sign out</a>`);
        bar.querySelector('#kcep-out').onclick = () => signOut(auth);
        return;
      }
      const key = 'kcep_pick_' + COURSE + '_' + user.uid;
      let who = null;
      try { const saved = sessionStorage.getItem(key); who = people.find((p) => p.path === saved) || null; } catch (e) {}
      if (!who) who = people.length === 1 ? people[0]
        : await picker(state.admin ? 'Teaching:' : "Who's learning today?", people);
      try { sessionStorage.setItem(key, who.path); } catch (e) {}
      state.student = who;
      if (await syncDown(db)) return; // page is refreshing to show the saved progress
      state.ready = true;
      showSaving(auth, people.length > 1);
    } catch (e) {
      console.warn('[KCE progress]', e);
      ui(`<span>Progress is saving on this device only right now.</span>`);
    }
  });

  // Save whenever the lesson saves on the device (debounced so we don't save every click).
  Storage.prototype.setItem = function (k, v) {
    rawSet.call(this, k, v);
    if (this === localStorage && Object.values(KEYS).includes(k) && state.ready) queueSave(db);
  };

  // Mirror each score the lesson already sends to Formspree into the student's score history.
  const rawFetch = window.fetch;
  window.fetch = function (url, opts) {
    try {
      if (state.ready && typeof url === 'string' && url.indexOf('formspree.io') !== -1 && opts && opts.body) {
        logEvent(db, JSON.parse(opts.body));
      }
    } catch (e) {}
    return rawFetch.apply(this, arguments);
  };
}

function showSignIn(auth) {
  ui(`<span>Save your progress to KCE</span><button id="kcep-in">Sign in with Google</button>`);
  bar.querySelector('#kcep-in').onclick = async () => {
    const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
    try { await signInWithPopup(auth, p); }
    catch (e) { if (e && e.code === 'auth/popup-blocked') signInWithRedirect(auth, p); }
  };
}
function showSaving(auth, canSwitch) {
  const label = state.admin ? 'Teaching: ' + state.student.firstName : 'Saving for ' + state.student.firstName;
  ui(`<span>✓ ${label}</span>${canSwitch ? '<a id="kcep-sw">Switch</a>' : ''}<a id="kcep-out">Sign out</a>`);
  const sw = bar.querySelector('#kcep-sw');
  if (sw) sw.onclick = () => { try { sessionStorage.removeItem('kcep_pick_' + COURSE + '_' + state.user.uid); } catch (e) {} location.reload(); };
  bar.querySelector('#kcep-out').onclick = () => signOut(auth);
}

async function findStudents(db, user) {
  const email = (user.email || '').toLowerCase();
  const fams = state.admin
    ? await getDocs(collection(db, 'families'))
    : await getDocs(query(collection(db, 'families'), where('parentEmails', 'array-contains', email)));
  const out = [];
  for (const f of fams.docs) {
    const studs = await getDocs(collection(db, 'families', f.id, 'students'));
    studs.forEach((s) => {
      const d = s.data();
      if ((d.courses || []).includes(COURSE)) out.push({ path: `families/${f.id}/students/${s.id}`, firstName: d.firstName });
    });
  }
  return out.sort((a, b) => a.firstName.localeCompare(b.firstName));
}

// Bring saved progress onto this device, and send this device's progress up, so nobody starts over.
async function syncDown(db) {
  const ref = doc(db, state.student.path, 'progress', COURSE);
  const snap = await getDoc(ref);
  const cloud = snap.exists() ? snap.data() : {};
  const local = { items: mine(rd(KEYS.items)), attempts: mine(rd(KEYS.attempts)), tasks: mine(rd(KEYS.tasks)) };
  // A family's device: combine both copies so nothing is lost.
  // KCE's teaching screen: show exactly the student's saved record, and never send up
  // whatever was clicked on Jonathan's own device before choosing the student.
  const merged = state.admin
    ? { items: cloud.items || {}, attempts: cloud.attempts || {}, tasks: cloud.tasks || {} }
    : { items: mergeItems(cloud.items, local.items), attempts: mergeMax(cloud.attempts, local.attempts), tasks: mergeTrue(cloud.tasks, local.tasks) };
  let changedHere = false;
  for (const part of ['items', 'attempts', 'tasks']) {
    if (!same(merged[part], local[part])) {
      const all = rd(KEYS[part]);
      for (const k in all) if (k.indexOf(COURSE + '-') !== -1) delete all[k];
      wr(KEYS[part], { ...all, ...merged[part] }); changedHere = true;
    }
  }
  // KCE's unlocks count on this device too.
  const unlocked = cloud.unlocked || {};
  if (Object.keys(unlocked).length) {
    const u = rd('kce_bb_unlocked'); const nu = { ...u, ...unlocked };
    if (!same(u, nu)) { wr('kce_bb_unlocked', nu); changedHere = true; }
  }
  if (!state.admin && (!same(merged.items, cloud.items || {}) || !same(merged.attempts, cloud.attempts || {}) || !same(merged.tasks, cloud.tasks || {}))) {
    await setDoc(ref, { ...merged, updatedAt: serverTimestamp() }, { merge: true });
  }
  state.base = JSON.parse(JSON.stringify(merged));
  // Show the brought-back progress once, so the page reflects it.
  const flag = 'kcep_synced_' + COURSE + '_' + state.student.path;
  if (changedHere) { try { if (!sessionStorage.getItem(flag)) { sessionStorage.setItem(flag, '1'); location.reload(); return true; } } catch (e) {} }
  return false;
}

// Send only what changed since the last save.
function queueSave(db) {
  clearTimeout(state.saving);
  state.saving = setTimeout(async () => {
    const now = { items: mine(rd(KEYS.items)), attempts: mine(rd(KEYS.attempts)), tasks: mine(rd(KEYS.tasks)) };
    const change = {}; let any = false;
    for (const part of ['items', 'attempts', 'tasks']) {
      for (const k in now[part]) {
        if (!same(now[part][k], (state.base[part] || {})[k])) { (change[part] = change[part] || {})[k] = now[part][k]; any = true; }
      }
    }
    if (!any) return;
    try {
      await setDoc(doc(db, state.student.path, 'progress', COURSE), { ...change, updatedAt: serverTimestamp() }, { merge: true });
      for (const part in change) state.base[part] = { ...state.base[part], ...change[part] };
    } catch (e) { console.warn('[KCE progress] save failed; it stays on this device', e); }
  }, 1500);
}

async function logEvent(db, o) {
  if (o.score == null) return;
  const s = (v, n) => String(v == null ? '' : v).slice(0, n);
  const ev = {
    course: COURSE,
    part: s(o.part || 'Lesson', 40),
    lesson: s(o.lesson || o.lesson_title || '', 80),
    lessonTitle: s(o.lesson_title || '', 200),
    score: Math.max(0, Math.min(100, Number(o.score) || 0)),
    correct: Number(o.correct) || 0,
    total: Number(o.total) || 0,
    mastered: o.mastered === 'yes' || o.mastered === true,
    attempt: Number(o.attempt) || 1,
    questionSet: Number(o.question_set) || 1,
    missed: (Array.isArray(o.missed) ? o.missed : []).slice(0, 60).map((m) => (typeof m === 'string' ? m : JSON.stringify(m)).slice(0, 300)),
    by: state.admin ? 'teacher' : 'family',
    at: serverTimestamp()
  };
  try { await addDoc(collection(db, state.student.path, 'events'), ev); }
  catch (e) { console.warn('[KCE progress] score not recorded in database (Formspree still has it)', e); }
}

window.KCEProgress = { state, course: COURSE };

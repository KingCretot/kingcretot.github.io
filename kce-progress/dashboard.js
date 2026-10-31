import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, initializeAuth, inMemoryPersistence, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, connectAuthEmulator, signInWithCredential }
  from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator, collection, doc, getDocs, setDoc, addDoc, updateDoc, query, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove, deleteField, runTransaction, Timestamp, getDoc, deleteDoc }
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
// Courses that can be assigned. Add each course here as it switches over.
const COURSES = [
  { id: 'bb-bristol', name: 'Building Blocks — Bristol' },
  { id: 'bb-bailey', name: 'Building Blocks — Bailey' },
  { id: 'bb-ethan', name: 'Building Blocks — Ethan' },
  { id: 'bb-celine', name: "Building Blocks — Ce'Line" },
  { id: 'bb-practice', name: 'Practice page (testing only)' }
];
const courseName = (id) => (COURSES.find((c) => c.id === id) || { name: id }).name;

const app = initializeApp(CONFIG), auth = getAuth(app), db = getFirestore(app);
// A second, separate sign-in used only to create KCE codes, so KCE stays signed in here.
const maker = initializeAuth(initializeApp(CONFIG, 'code-maker'), { persistence: inMemoryPersistence });
const me = document.querySelector('script[data-emulator]');
const EMU = !!(me && me.dataset.emulator === 'local' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
if (EMU) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectAuthEmulator(maker, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  window.__kcepTestSignIn = (email) => signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })));
}

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n0 = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const lessonName = (k) => { const m = /L(\d+)$/.exec(k); return m ? 'Lesson ' + Number(m[1]) : k.replace(/^practice-/, 'Practice ').replace(/^bb-[a-z]+-/, ''); };
const toDate = (t) => (t && t.toDate ? t.toDate() : t ? new Date(t) : null);
const fmt = (d) => d ? d.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
const fmtDay = (d) => d ? d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '—';
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'student';
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !e.endsWith('@code.kingcretot.com');
// KCE codes: 12 random letters and numbers (no look-alikes such as 0/O or 1/I/L).
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  const out = []; const buf = new Uint8Array(1);
  while (out.length < 12) { crypto.getRandomValues(buf); if (buf[0] < 248) out.push(ABC[buf[0] % 31]); }
  return out.join('').replace(/(.{4})(?=.)/g, '$1-');
}
// Same one-way scramble as the course pages: the sign-in name never reveals the code.
async function codeLogin(code) {
  const k = code.toLowerCase().replace(/[^a-z0-9]/g, ''); const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(k), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('kce-code-v1'), iterations: 100000 }, key, 96);
  return { email: [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('') + '@code.kingcretot.com', password: 'kce-' + k };
}

let DATA = [];   // [{fid, family, students:[{sid, student, progress:{cid:doc}, events:[...]}]}]
let VIEW = 'students';

onAuthStateChanged(auth, async (user) => {
  if (!user) return gate();
  $('#who').innerHTML = `<span>${esc(user.email)}</span><a id="out">Sign out</a>`;
  $('#out').onclick = () => signOut(auth);
  const google = (user.providerData || []).some((p) => p.providerId === 'google.com');
  if ((user.email || '').toLowerCase() !== ADMIN || !google) {
    $('#app').innerHTML = `<div class="gate card"><h2>KCE staff only</h2><p>This page is for KingCretot Experience. Please sign in with the KCE account.</p></div>`;
    return;
  }
  await load();
});

function gate() {
  $('#who').innerHTML = '';
  $('#app').innerHTML = `<div class="gate card"><h2>Student Progress Dashboard</h2><p class="muted">KCE staff sign-in</p><button class="btn gold" id="in">Sign in with Google</button></div>`;
  $('#in').onclick = async () => {
    const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
    try { await signInWithPopup(auth, p); } catch (e) { const g = document.querySelector('.gate'); if (g) { const m = document.createElement('p'); m.className = 'msg bad'; m.textContent = (e && e.code === 'auth/popup-blocked') ? 'Please allow pop-ups for this page, then click Sign in again.' : 'Sign-in did not finish (' + ((e && e.code) || 'unknown') + '). Please try again.'; g.appendChild(m); } }
  };
}

async function load() {
  $('#app').innerHTML = `<p class="muted">Loading every student…</p>`;
  try {
    const fams = await getDocs(collection(db, 'families'));
    DATA = await Promise.all(fams.docs.map(async (f) => {
      const studs = await getDocs(collection(db, 'families', f.id, 'students'));
      const students = await Promise.all(studs.docs.map(async (s) => {
        const base = ['families', f.id, 'students', s.id];
        const [pg, ev] = await Promise.all([
          getDocs(collection(db, ...base, 'progress')),
          getDocs(query(collection(db, ...base, 'events'), orderBy('at', 'desc'), limit(200)))
        ]);
        const progress = {}; pg.forEach((d) => (progress[d.id] = d.data()));
        return { sid: s.id, student: s.data(), progress, events: ev.docs.map((d) => d.data()) };
      }));
      return { fid: f.id, family: f.data(), students: students.sort((a, b) => a.student.firstName.localeCompare(b.student.firstName)) };
    }));
    DATA.sort((a, b) => (a.family.name || '').localeCompare(b.family.name || ''));
    render();
  } catch (e) {
    console.error(e);
    $('#app').innerHTML = `<div class="card"><h2>Couldn't load</h2><p>${esc(e.message)}</p></div>`;
  }
}

function render() {
  $('#app').innerHTML = `<div class="tabs">
      <button data-v="students" class="${VIEW === 'students' ? 'on' : ''}">Students</button>
      <button data-v="families" class="${VIEW === 'families' ? 'on' : ''}">Families &amp; enrollment</button>
      <button id="reload" class="light">Refresh</button></div><div id="view"></div>`;
  document.querySelectorAll('.tabs [data-v]').forEach((b) => (b.onclick = () => { VIEW = b.dataset.v; render(); }));
  $('#reload').onclick = load;
  if (VIEW === 'students') renderStudents(); else renderFamilies();
}

// One row per student per course.
function rows() {
  const out = [];
  for (const F of DATA) for (const S of F.students) for (const cid of S.student.courses || []) {
    const p = S.progress[cid] || {}, items = p.items || {};
    const ev = S.events.filter((e) => e.course === cid);
    const lessons = Object.keys(items).filter((k) => !k.startsWith('practice-')).sort();
    const passed = lessons.filter((k) => items[k] && items[k].passed === true);
    const unfinished = lessons.filter((k) => !(items[k] && items[k].passed === true));
    const last = [toDate(p.updatedAt), ...ev.map((e) => toDate(e.at))].filter(Boolean).sort((a, b) => b - a)[0] || null;
    const current = unfinished[0] || (passed.length ? passed[passed.length - 1] : null);
    out.push({ F, S, cid, items, ev, passed, unfinished, last, current, lastScore: ev[0] });
  }
  return out;
}

function renderStudents() {
  const R = rows();
  const weekAgo = Date.now() - 7 * 864e5;
  const active = R.filter((r) => r.last && r.last.getTime() > weekAgo).length;
  const notMastered = R.reduce((n, r) => n + r.unfinished.length, 0);
  const scoresWeek = R.reduce((n, r) => n + r.ev.filter((e) => toDate(e.at) && toDate(e.at).getTime() > weekAgo).length, 0);
  let h = `<div class="sum">
     <div><b>${new Set(R.map((r) => r.S.sid + r.F.fid)).size}</b><span>students enrolled</span></div>
     <div><b>${active}</b><span>active in the last 7 days</span></div>
     <div><b>${scoresWeek}</b><span>scores in the last 7 days</span></div>
     <div><b>${notMastered}</b><span>lessons started, not yet mastered</span></div></div>`;
  h += `<div class="card"><h2>Every student</h2>`;
  if (!R.length) h += `<p class="muted">No students yet. Add a family under “Families &amp; enrollment.”</p>`;
  else {
    h += `<table><tr><th>Student</th><th>Course</th><th>Where they are</th><th>Mastered</th><th class="hide-s">Started, not mastered</th><th>Last score</th><th class="hide-s">Last activity</th></tr>`;
    R.sort((a, b) => (b.last || 0) - (a.last || 0));
    for (const r of R) {
      const ls = r.lastScore;
      h += `<tr><td><span class="stu" data-f="${esc(r.F.fid)}" data-s="${esc(r.S.sid)}">${esc(r.S.student.firstName)}</span></td>
        <td>${esc(courseName(r.cid))}</td>
        <td>${r.current ? esc(lessonName(r.current)) : '<span class="muted">Not started</span>'}</td>
        <td>${n0(r.passed.length)}</td>
        <td class="hide-s">${r.unfinished.map((k) => `<span class="pill wait">${esc(lessonName(k))} · best ${n0(r.items[k].best)}</span>`).join('') || '—'}</td>
        <td>${ls ? `<span class="pill ${ls.mastered === true ? 'ok' : 'no'}">${n0(ls.score)}</span> <span class="muted">${esc(ls.lesson)}</span>` : '—'}</td>
        <td class="hide-s">${fmt(r.last)}</td></tr>`;
    }
    h += `</table>`;
  }
  h += `</div><div id="detail"></div>`;
  $('#view').innerHTML = h;
  document.querySelectorAll('.stu').forEach((s) => (s.onclick = () => detail(s.dataset.f, s.dataset.s)));
}

function detail(fid, sid) {
  const F = DATA.find((x) => x.fid === fid), S = F.students.find((x) => x.sid === sid);
  let h = `<div class="card"><h2>${esc(S.student.firstName)} · score history</h2><p class="muted">Family: ${esc(F.family.name)}</p>`;
  for (const cid of S.student.courses || []) {
    const items = (S.progress[cid] || {}).items || {};
    const keys = Object.keys(items).filter((k) => !k.startsWith('practice-')).sort();
    h += `<h3 style="margin:14px 0 6px">${esc(courseName(cid))}</h3>`;
    h += keys.length ? `<p>${keys.map((k) => `<span class="pill ${items[k].passed === true ? 'ok' : 'wait'}">${esc(lessonName(k))} · best ${n0(items[k].best)}${items[k].passed === true ? ' ✓' : ''}</span>`).join(' ')}</p>` : `<p class="muted">No lessons saved yet.</p>`;
  }
  if (!S.events.length) h += `<p class="muted">No scores recorded yet.</p>`;
  else {
    h += `<table><tr><th>When</th><th>Course</th><th>What</th><th>Score</th><th class="hide-s">Right</th><th class="hide-s">Try</th><th class="hide-s">By</th></tr>`;
    for (const e of S.events) h += `<tr><td>${fmt(toDate(e.at))}</td><td>${esc(courseName(e.course))}</td><td>${esc(e.lesson)} · ${esc(e.part)}${e.lessonTitle ? `<br><span class="muted">${esc(e.lessonTitle)}</span>` : ''}</td>
      <td><span class="pill ${e.mastered === true ? 'ok' : 'no'}">${n0(e.score)}</span></td><td class="hide-s">${n0(e.correct)}/${n0(e.total)}</td><td class="hide-s">${n0(e.attempt)}</td><td class="hide-s">${e.by === 'teacher' ? 'Live lesson' : e.by === 'import' ? 'Past score' : 'Student'}</td></tr>`;
    h += `</table>`;
  }
  h += `</div>`;
  $('#detail').innerHTML = h;
  $('#detail').scrollIntoView({ behavior: 'smooth' });
}

// ---------- enrollment ----------
function courseBoxes(name, checked = []) {
  return `<div class="courses">${COURSES.map((c) => `<label><input type="checkbox" name="${name}" value="${c.id}" ${checked.includes(c.id) ? 'checked' : ''}> ${esc(c.name)}</label>`).join('')}</div>`;
}
function childBlock(i) {
  return `<div class="child" data-i="${i}"><label>Child's first name</label><input type="text" class="cn" maxlength="40" placeholder="e.g. Bristol">
    <label>Courses</label>${courseBoxes('cc' + i)}</div>`;
}

function renderFamilies() {
  let h = `<div class="card"><h2>Add a family</h2>
    <p class="muted">First names only. Add the parent's Google sign-in email if they use Google. If they don't, leave it empty and give the family a KCE code after saving. Never a child's email.</p>
    <label>Parent's first name</label><input type="text" id="pn" maxlength="40" placeholder="e.g. Tia">
    <label>Google sign-in email(s) <span class="muted" style="font-weight:normal">(optional)</span></label><input type="text" id="pe" placeholder="one or more, separated by commas — or leave empty and use a KCE code">
    <div id="kids">${childBlock(0)}</div>
    <button class="btn light" id="addkid">+ Add another child</button><button class="btn gold" id="savefam">Save family</button>
    <div class="msg" id="fmsg"></div></div>`;
  h += `<div class="card"><h2>Load past scores</h2>
    <p class="muted">Adds scores from before the switch (the Weekly Score Logs) to each student's history. Enter the family first. Loading the same file again does not make copies.</p>
    <input type="file" id="impf" accept=".json,application/json"> <div class="msg" id="impmsg"></div></div>`;
  h += `<div class="card"><h2>Families</h2>`;
  if (!DATA.length) h += `<p class="muted">No families yet.</p>`;
  for (const F of DATA) {
    h += `<div class="fam" data-f="${esc(F.fid)}"><h3>${esc(F.family.name)}</h3>
      <p>${(F.family.parentEmails || []).map((e) => `<span class="pill wait">${esc(e)}<span class="x" data-rm-email="${esc(e)}" title="Remove this email">×</span></span>`).join(' ')}
      <a class="stu" data-add-email>+ email</a></p>
      <p>${(F.family.codeUids || []).map((u) => [u, (F.family.codeInfo || {})[u] || { label: '(no label)' }]).map(([u, c]) => `<span class="pill ok">KCE code · ${esc(c && c.label)} · made ${esc(fmtDay(toDate(c && c.at)))}<span class="x" data-rm-code="${esc(u)}" title="Turn off this code">×</span></span>`).join(' ')}
      <a class="stu" data-add-code>+ Create a sign-in code</a></p>
      <div class="msg good" data-code-out></div>`;
    for (const S of F.students) {
      h += `<div class="child"><b>${esc(S.student.firstName)}</b><br>${(S.student.courses || []).map((c) => `<span class="pill ok">${esc(courseName(c))}<span class="x" data-s="${esc(S.sid)}" data-rm-course="${esc(c)}" title="Remove this course">×</span></span>`).join(' ') || '<span class="muted">No courses</span>'}
        <div style="margin-top:6px"><select data-s="${esc(S.sid)}" class="addc"><option value="">+ Assign a course…</option>${COURSES.filter((c) => !(S.student.courses || []).includes(c.id)).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div></div>`;
    }
    h += `<a class="stu" data-add-child>+ Add a child to this family</a> <a class="x" style="float:right" data-del-fam>Remove this family</a></div>`;
  }
  h += `</div>`;
  $('#view').innerHTML = h;

  let n = 1;
  $('#addkid').onclick = () => $('#kids').insertAdjacentHTML('beforeend', childBlock(n++));
  $('#savefam').onclick = saveFamily;
  $('#impf').onchange = (e) => importFile(e.target.files && e.target.files[0]);

  document.querySelectorAll('.fam').forEach((box) => {
    const fid = box.dataset.f;
    box.querySelectorAll('[data-rm-email]').forEach((x) => (x.onclick = async () => {
      const F = DATA.find((d) => d.fid === fid);
      if ((F.family.parentEmails || []).length <= 1 && !(F.family.codeUids || []).length) return alertMsg('A family needs at least one sign-in email or KCE code.');
      await updateDoc(doc(db, 'families', fid), { parentEmails: arrayRemove(x.dataset.rmEmail) }); load();
    }));
    box.querySelector('[data-add-email]').onclick = async () => {
      const e = (window.prompt('Google sign-in email to add') || '').trim().toLowerCase();
      if (!e) return; if (!emailOk(e)) return alertMsg('That email does not look right.');
      await updateDoc(doc(db, 'families', fid), { parentEmails: arrayUnion(e) }); load();
    };
    box.querySelector('[data-del-fam]').onclick = async () => {
      const F = DATA.find((d) => d.fid === fid);
      const kids = F.students.map((S) => S.student.firstName).join(', ') || 'no children';
      if (!window.confirm(`Remove the ${F.family.name} family (${kids}) and all of their saved progress and scores? This cannot be undone.`)) return;
      try {
        for (const S of F.students) {
          const base = ['families', fid, 'students', S.sid];
          for (const sub of ['events', 'progress']) { const all = await getDocs(collection(db, ...base, sub)); for (const d of all.docs) await deleteDoc(d.ref); }
          await deleteDoc(doc(db, ...base));
        }
        await deleteDoc(doc(db, 'families', fid)); load();
      } catch (e) { alertMsg('Could not remove the family: ' + e.message); }
    };
    box.querySelector('[data-add-code]').onclick = () => makeCode(fid, box);
    box.querySelectorAll('[data-rm-code]').forEach((x) => (x.onclick = async () => {
      const F = DATA.find((d) => d.fid === fid);
      if (!(F.family.parentEmails || []).length && (F.family.codeUids || []).length <= 1) return alertMsg('A family needs at least one sign-in email or KCE code. Create a new code first.');
      if (!window.confirm('Turn off this KCE code? Anyone using it will no longer see this family.')) return;
      const u = x.dataset.rmCode;
      await updateDoc(doc(db, 'families', fid), { codeUids: arrayRemove(u), ['codeInfo.' + u]: deleteField() }); load();
    }));
    box.querySelectorAll('[data-rm-course]').forEach((x) => (x.onclick = async () => {
      await updateDoc(doc(db, 'families', fid, 'students', x.dataset.s), { courses: arrayRemove(x.dataset.rmCourse) }); load();
    }));
    box.querySelectorAll('.addc').forEach((sel) => (sel.onchange = async () => {
      if (!sel.value) return;
      await updateDoc(doc(db, 'families', fid, 'students', sel.dataset.s), { courses: arrayUnion(sel.value) }); load();
    }));
    box.querySelector('[data-add-child]').onclick = async () => {
      const name = (window.prompt("Child's first name") || '').trim();
      if (!name) return;
      const F = DATA.find((d) => d.fid === fid);
      let sid = slug(name); while (F.students.some((s) => s.sid === sid)) sid += '-2';
      await setDoc(doc(db, 'families', fid, 'students', sid), { firstName: name, courses: [], createdAt: serverTimestamp() });
      load();
    };
  });
}
// Create a KCE code for a family: shown once here, never stored. Only its sign-in account id is saved.
async function makeCode(fid, box) {
  const F = DATA.find((d) => d.fid === fid);
  const label = (window.prompt('Who is this code for? (e.g. "Lexus" or "Lexus – tablet")', F.family.name) || '').trim().slice(0, 40);
  if (!label) return;
  const out = box.querySelector('[data-code-out]'); out.className = 'msg'; out.textContent = 'Creating code…';
  try {
    const code = newCode(); const login = await codeLogin(code);
    const cred = await createUserWithEmailAndPassword(maker, login.email, login.password);
    const uid = cred.user.uid; await signOut(maker);
    await updateDoc(doc(db, 'families', fid), { codeUids: arrayUnion(uid), ['codeInfo.' + uid]: { label, at: serverTimestamp() } });
    await load();
    const again = document.querySelector(`.fam[data-f="${CSS.escape(fid)}"] [data-code-out]`);
    again.className = 'msg good';
    again.innerHTML = `<div class="card" style="border:2px solid #C9A84C;margin-top:8px"><div>KCE code for ${esc(label)}:</div>
      <div style="font:bold 28px Georgia,serif;letter-spacing:3px;color:#0A1F3D;margin:6px 0" data-code>${esc(code)}</div>
      <div class="muted" style="font-weight:normal">Copy it now and send it to the family. For safety, KCE does not keep this code, so it will not be shown again. If it is lost, create a new one and turn this one off.</div>
      <button class="btn light" data-copy>Copy code</button></div>`;
    again.querySelector('[data-copy]').onclick = async (e) => { try { await navigator.clipboard.writeText(code); e.target.textContent = 'Copied ✓'; } catch (_) { e.target.textContent = 'Select the code and copy it'; } };
  } catch (e) { out.className = 'msg bad'; out.textContent = 'Could not create the code: ' + (e.code || e.message); }
}
// ---------- past scores ----------
const IMP_ID = /^imp-[a-z0-9-]{1,80}$/;
const s0 = (v, n) => String(v == null ? '' : v).slice(0, n);
const i0 = (v, d = 0) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(500, n)) : d; };
let PENDING = null;
async function importFile(file) {
  const m = $('#impmsg'); m.className = 'msg'; m.textContent = ''; PENDING = null;
  if (!file) return;
  let d; try { d = JSON.parse(await file.text()); } catch (e) { m.className = 'msg bad'; m.textContent = 'That file could not be read. Please choose the past-scores file KCE prepared.'; return; }
  if (!d || d.kind !== 'kce-past-scores' || typeof d.courses !== 'object') { m.className = 'msg bad'; m.textContent = 'That is not a KCE past-scores file.'; return; }
  const plan = []; const lines = [];
  for (const cid of Object.keys(d.courses)) {
    if (!COURSES.some((c) => c.id === cid)) { lines.push(`${esc(cid)}: not a KCE course here — skipped.`); continue; }
    const who = []; DATA.forEach((F) => F.students.forEach((S) => { if ((S.student.courses || []).includes(cid)) who.push({ F, S }); }));
    const evs = (d.courses[cid].events || []).filter((e) => e && IMP_ID.test(e.id || ''));
    if (who.length !== 1) { lines.push(`<b>${esc(courseName(cid))}</b>: ${who.length ? 'more than one student has this course' : 'no student has this course yet — enter the family first'}. Skipped.`); continue; }
    const { F, S } = who[0];
    plan.push({ cid, F, S, evs, items: d.courses[cid].items || {}, attempts: d.courses[cid].attempts || {} });
    lines.push(`<b>${esc(courseName(cid))}</b> → ${esc(S.student.firstName)} (${esc(F.family.name)} family): ${evs.length} past scores.`);
  }
  m.innerHTML = lines.join('<br>') + (plan.length ? `<br><button class="btn gold" id="impgo">Load these scores</button>` : '');
  if (plan.length) { PENDING = plan; $('#impgo').onclick = runImport; }
}
async function runImport() {
  const m = $('#impmsg'); const plan = PENDING; PENDING = null; if (!plan) return;
  m.className = 'msg'; m.textContent = 'Loading…'; const done = [];
  try {
    for (const P of plan) {
      const base = ['families', P.F.fid, 'students', P.S.sid];
      for (const e of P.evs) {
        const when = new Date(e.at); if (isNaN(when)) continue;
        const total = i0(e.total);
        await setDoc(doc(db, ...base, 'events', e.id), {
          course: P.cid, part: s0(e.part || 'Lesson', 40), lesson: s0(e.lesson, 80), lessonTitle: s0(e.lessonTitle, 200),
          score: Math.max(0, Math.min(100, Number(e.score) || 0)), correct: Math.min(i0(e.correct), total), total,
          mastered: e.mastered === true, attempt: i0(e.attempt, 1), questionSet: i0(e.questionSet, 1),
          missed: s0(e.missed, 8000), by: 'import', at: Timestamp.fromDate(when)
        });
      }
      // Add the past results to the saved lesson record, keeping whatever is already better.
      const pat = new RegExp('^' + P.cid + '-L\\d+$');
      await runTransaction(db, async (tx) => {
        const ref = doc(db, ...base, 'progress', P.cid); const cur = (await tx.get(ref)).data() || {};
        const items = { ...(cur.items || {}) }, attempts = { ...(cur.attempts || {}) };
        for (const k of Object.keys(P.items)) { if (!pat.test(k)) continue; const x = items[k] || {}, y = P.items[k] || {};
          items[k] = { best: Math.max(Number(x.best) || 0, Math.min(100, Number(y.best) || 0)), passed: !!(x.passed || y.passed === true), last: x.last != null ? x.last : (Number(y.last) || 0) }; }
        for (const k of Object.keys(P.attempts)) { if (pat.test(k)) attempts[k] = Math.max(Number(attempts[k]) || 0, i0(P.attempts[k])); }
        tx.set(ref, { items, attempts, updatedAt: serverTimestamp() }, { merge: true });
      });
      done.push(`${P.evs.length} for ${P.S.student.firstName}`);
    }
    m.className = 'msg good'; m.textContent = 'Loaded past scores: ' + done.join(', ') + '.';
    setTimeout(load, 1200);
  } catch (e) { m.className = 'msg bad'; m.textContent = 'Stopped: ' + e.message + (done.length ? ' (already loaded: ' + done.join(', ') + ')' : ''); }
}
function alertMsg(t) { const m = $('#fmsg'); if (m) { m.className = 'msg bad'; m.textContent = t; m.scrollIntoView({ behavior: 'smooth' }); } }

async function saveFamily() {
  const m = $('#fmsg'); m.className = 'msg'; m.textContent = '';
  const name = $('#pn').value.trim();
  const emails = $('#pe').value.split(/[,\s;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
  const kids = [...document.querySelectorAll('#kids .child')].map((c) => ({
    name: c.querySelector('.cn').value.trim(),
    courses: [...c.querySelectorAll('input[type=checkbox]:checked')].map((x) => x.value)
  })).filter((k) => k.name);
  if (!name) return alertMsg("Please add the parent's first name.");
  const bad = emails.filter((e) => !emailOk(e)); if (bad.length) return alertMsg('Check this email: ' + bad.join(', '));
  if (!kids.length) return alertMsg("Please add at least one child's first name.");
  const taken = DATA.find((F) => (F.family.parentEmails || []).some((e) => emails.includes(e)));
  if (taken) return alertMsg('That email already belongs to the ' + taken.family.name + ' family. Add the child there instead.');
  try {
    const ref = await addDoc(collection(db, 'families'), { name, parentEmails: emails, createdAt: serverTimestamp() });
    const used = new Set();
    for (const k of kids) {
      let sid = slug(k.name); while (used.has(sid)) sid += '-2'; used.add(sid);
      await setDoc(doc(db, 'families', ref.id, 'students', sid), { firstName: k.name, courses: k.courses, createdAt: serverTimestamp() });
    }
    m.className = 'msg good'; m.textContent = `Saved: ${name}'s family with ${kids.map((k) => k.name).join(', ')}.`;
    setTimeout(load, 900);
  } catch (e) { alertMsg('Could not save: ' + e.message); }
}

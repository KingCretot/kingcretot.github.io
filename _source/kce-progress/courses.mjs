// Pathways, Math Foundations, Reading Power and Reading Foundations: scores reach the database.
import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 } });
await env.clearFirestore();
await env.withSecurityRulesDisabled(async (c) => { const db = c.firestore();
  await setDoc(doc(db, 'families/t'), { name: 'Tia', parentEmails: ['tia@example.com'] });
  await setDoc(doc(db, 'families/t/students/bailey'), { firstName: 'Bailey Simon', courses: ['bb-bailey', 'pathways-g45', 'readpower', 'mathfound-g23'] });
  await setDoc(doc(db, 'families/t/students/bristol'), { firstName: 'Bristol Simon', courses: ['bb-bristol', 'pathways-g45'] });
  await setDoc(doc(db, 'families/s'), { name: 'Skyler', parentEmails: ['skyler@example.com'] });
  await setDoc(doc(db, 'families/s/students/ethan'), { firstName: 'Ethan', courses: ['pathways-g23', 'readfound'] });
});
const BASE = 'http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/';
const H = { headers: { Authorization: 'Bearer owner' } };
const list = async (p) => ((await (await fetch(BASE + p, H)).json()).documents || []).map((d) => d.fields);
let pass = 0, fail = 0; const ok = (n, c) => { if (c) { pass++; console.log('  ok  ', n); } else { fail++; console.log('  FAIL', n); } };
const S = 'http://127.0.0.1:8766/';
const b = await chromium.launch({args:['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights']}); const errs = []; const posts = [];
async function ctxNew() {
  const ctx = await b.newContext();
  await ctx.route('https://formspree.io/**', (r) => { posts.push(r.request().postData()); r.fulfill({ status: 200, body: '{}', contentType: 'application/json' }); });
  await ctx.route('https://kingcretot.github.io/kce-progress/kce-progress.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync('site/kce-progress/kce-progress.js', 'utf8') }));
  await ctx.route(/127\.0\.0\.1:8766\/.*\.html$/, async (r) => {
    const res = await r.fetch(); let body = await res.text();
    body = body.replace(/(<script type="module" src="[^"]*kce-progress\.js" data-course="[^"]+")/, '$1 data-emulator="local"');
    r.fulfill({ response: res, body });
  });
  return ctx;
}
const bar = (P, s) => P.waitForFunction((s) => { const x = document.querySelector('.kcep'); return !!x && x.textContent.includes(s); }, s, { timeout: 25000 });
const signIn = async (P, email) => { await P.waitForFunction(() => !!window.__kcepTestSignIn, null, { timeout: 20000 }); await P.evaluate((e) => window.__kcepTestSignIn(e), email); };
const pick = async (P, name) => { await P.waitForSelector('.kcep-box', { timeout: 20000 }); await P.click(`.kcep-box button:has-text("${name}")`); };

// ---------- Pathways 4–5 (Tia: Bailey and Bristol both enrolled → picker) ----------
let ctx = await ctxNew(); let P = await ctx.newPage(); P.on('pageerror', (e) => errs.push('pathways: ' + e.message));
await P.goto(S + 'KCE_Pathways_Curriculum/grade4-5/week9/reading.html');
await P.waitForSelector('.kcep'); ok('Pathways 4–5 page shows the "Save your progress to KCE" bar', (await P.textContent('.kcep')).includes('Save your progress'));
const bbBefore = await P.evaluate(() => JSON.stringify([localStorage.getItem('kce_bb_progress'), localStorage.getItem('kce_bb_attempts')]));
await signIn(P, 'tia@example.com'); await pick(P, 'Bailey Simon'); await bar(P, 'Saving for Bailey Simon');
ok('Tia picks Bailey: "Saving for Bailey Simon"', true);
await P.evaluate(() => { localStorage.setItem('kcePathwaysStudentName', 'Bailey Simon'); reportProgress(98, { attempts: 3 }); });
await P.waitForTimeout(2500);
let ev = await list('families/t/students/bailey/events');
ok('Pathways score saved to Bailey: 98, grade4-5-week9-reading, mastered, try 3, course pathways-g45',
  ev.length === 1 && ev[0].score.integerValue === '98' && ev[0].lesson.stringValue === 'grade4-5-week9-reading' && ev[0].mastered.booleanValue === true && ev[0].attempt.integerValue === '3' && ev[0].course.stringValue === 'pathways-g45' && ev[0].part.stringValue === 'Weekly check');
ok('Formspree email still sent', posts.some((p) => p && p.includes('grade4-5-week9-reading')));
// a score typed under Bristol's name while Bailey is signed in is NOT filed to Bailey
await P.evaluate(() => { localStorage.setItem('kcePathwaysStudentName', 'Bristol Simon'); reportProgress(70, { attempts: 1 }); });
await P.waitForTimeout(2000);
ok("a score typed under Bristol's name is not filed to Bailey", (await list('families/t/students/bailey/events')).length === 1 && (await list('families/t/students/bristol/events')).length === 0);
ok('Building Blocks device progress untouched on a Pathways page', bbBefore === await P.evaluate(() => JSON.stringify([localStorage.getItem('kce_bb_progress'), localStorage.getItem('kce_bb_attempts')])));
await ctx.close();

// ---------- Math Foundations (only Bailey in Tia's family → no picker) ----------
ctx = await ctxNew(); P = await ctx.newPage(); P.on('pageerror', (e) => errs.push('mathfound: ' + e.message));
await P.goto(S + 'KCE_Math_Foundations/world1/lesson1.html'); await P.waitForSelector('.kcep');
await signIn(P, 'tia@example.com'); await bar(P, 'Saving for Bailey Simon');
await P.evaluate(() => { localStorage.setItem('kceMathFoundationsStudentName', 'Bailey Simon'); reportProgress(75, { failedAttempts: 2, locked: false }); });
await P.waitForTimeout(2500);
ev = (await list('families/t/students/bailey/events')).filter((e) => e.course.stringValue === 'mathfound-g23');
ok('Math Foundations score saved: 75, not mastered, try 2', ev.length === 1 && ev[0].score.integerValue === '75' && ev[0].mastered.booleanValue === false && ev[0].attempt.integerValue === '2' && /^mathfoundations-/.test(ev[0].lesson.stringValue));
await ctx.close();

// ---------- Reading Power (Bailey) — quiz end hands the score over ----------
ctx = await ctxNew(); P = await ctx.newPage(); P.on('pageerror', (e) => errs.push('readpower: ' + e.message));
await P.goto(S + 'ReadingPower/KCE_RP_U7L2_TextFeatures.html').catch(() => {});
if (!(await P.$('.kcep'))) { const f = readFileSync('/dev/null'); }
await P.waitForSelector('.kcep'); await signIn(P, 'tia@example.com'); await bar(P, 'Saving for Bailey Simon');
await P.evaluate(() => { student = 'Bailey'; correct = SERVE - 1; finishQuiz(); });
await P.waitForTimeout(2500);
ev = (await list('families/t/students/bailey/events')).filter((e) => e.course.stringValue === 'readpower');
ok('Reading Power quiz result saved with right/total (' + (ev[0] && ev[0].correct.integerValue + '/' + ev[0].total.integerValue) + ')', ev.length === 1 && ev[0].lesson.stringValue.startsWith('U7') && Number(ev[0].total.integerValue) > 0 && ev[0].part.stringValue === 'Lesson check');
await ctx.close();

// ---------- Pathways 2–3 and Reading Foundations (Skyler → Ethan) ----------
ctx = await ctxNew(); P = await ctx.newPage(); P.on('pageerror', (e) => errs.push('g23/rf: ' + e.message));
await P.goto(S + 'KCE_Pathways_Curriculum/grade3/week9/math.html'); await P.waitForSelector('.kcep');
await signIn(P, 'skyler@example.com'); await bar(P, 'Saving for Ethan');
await P.evaluate(() => { localStorage.setItem('kcePathwaysStudentName', 'Ethan Ferguson'); reportProgress(88, { attempts: 1 }); });
await P.waitForTimeout(2000);
await P.goto(S + 'ReadingFoundations/KCE_RF_U1L1_RhymeTime.html'); await P.waitForSelector('.kcep'); await bar(P, 'Saving for Ethan');
await P.evaluate(() => { student = 'Ethan'; correct = SERVE; finishQuiz(); });
await P.waitForTimeout(2500);
ev = await list('families/s/students/ethan/events');
const g23 = ev.find((e) => e.course.stringValue === 'pathways-g23'), rf = ev.find((e) => e.course.stringValue === 'readfound');
ok('Pathways 2–3 score saved to Ethan (88, grade3-math-w9)', !!g23 && g23.score.integerValue === '88' && g23.lesson.stringValue === 'grade3-math-w9');
ok('Reading Foundations score saved to Ethan (100, mastered, U1L1)', !!rf && rf.score.integerValue === '100' && rf.mastered.booleanValue === true && rf.lesson.stringValue === 'U1L1');
await ctx.close();

// ---------- not enrolled: friendly message, nothing saved ----------
ctx = await ctxNew(); P = await ctx.newPage();
await P.goto(S + 'ReadingPower/KCE_RP_U1L1_Un.html'); await P.waitForSelector('.kcep'); await signIn(P, 'skyler@example.com');
await bar(P, "isn't set up for this course"); ok('a family not enrolled in a course sees "isn\'t set up for this course yet"', true);
await ctx.close();

ok('no page errors on any page', errs.length === 0); if (errs.length) console.log(errs);
console.log(`\n${pass} passed, ${fail} failed`); await b.close(); await env.cleanup(); process.exit(fail ? 1 : 0);

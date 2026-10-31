import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'kce-rules-test',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
});

let pass = 0, fail = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log('  ok  ', name); }
  catch (e) { fail++; console.log('  FAIL', name, '-', e.message.split('\n')[0]); }
}

// Seed data as admin (bypassing rules)
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'families/simon'), { name: 'Tia', parentEmails: ['tia@example.com'] });
  await setDoc(doc(db, 'families/simon/students/bristol'), { firstName: 'Bristol', courses: ['bb-bristol'] });
  await setDoc(doc(db, 'families/simon/students/bailey'), { firstName: 'Bailey', courses: ['bb-bailey'] });
  await setDoc(doc(db, 'families/ferguson'), { name: 'Skyler', parentEmails: ['skyler@example.com'] });
  await setDoc(doc(db, 'families/ferguson/students/ethan'), { firstName: 'Ethan', courses: ['bb-ethan'] });
  await setDoc(doc(db, 'families/ferguson/students/ethan/progress/bb-ethan'), { items: { 'bb-ethan-L01': { best: 80, passed: true } }, unlocked: { 'bb-ethan-L03': true } });
});

const user = (email, verified = true, provider = 'google.com') => env.authenticatedContext(email, { email, email_verified: verified, firebase: { sign_in_provider: provider } }).firestore();
const pause = () => new Promise((r) => setTimeout(r, 1200));
const tia = user('tia@example.com');
const tiaCaps = user('TIA@Example.com');
const skyler = user('skyler@example.com');
const admin = user('kce@kingcretot.com');
const unverified = user('tia@example.com', false);
const anon = env.unauthenticatedContext().firestore();

console.log('Families and students');
await t('parent reads own family', () => assertSucceeds(getDoc(doc(tia, 'families/simon'))));
await t('parent email match ignores capital letters', () => assertSucceeds(getDoc(doc(tiaCaps, 'families/simon'))));
await t('parent finds own family by email query', () => assertSucceeds(getDocs(query(collection(tia, 'families'), where('parentEmails', 'array-contains', 'tia@example.com')))));
await t('parent cannot list all families', () => assertFails(getDocs(collection(tia, 'families'))));
await t('parent cannot read another family', () => assertFails(getDoc(doc(tia, 'families/ferguson'))));
await t('parent cannot read another family\'s student', () => assertFails(getDoc(doc(tia, 'families/ferguson/students/ethan'))));
await t('parent cannot read another family\'s progress', () => assertFails(getDoc(doc(tia, 'families/ferguson/students/ethan/progress/bb-ethan'))));
await t('parent reads own child', () => assertSucceeds(getDoc(doc(tia, 'families/simon/students/bristol'))));
await t('parent cannot add themselves to another family', () => assertFails(updateDoc(doc(tia, 'families/ferguson'), { parentEmails: ['skyler@example.com', 'tia@example.com'] })));
await t('parent cannot create a family', () => assertFails(setDoc(doc(tia, 'families/new'), { name: 'x', parentEmails: ['tia@example.com'] })));
await t('parent cannot assign a course to own child', () => assertFails(updateDoc(doc(tia, 'families/simon/students/bristol'), { courses: ['bb-bristol', 'sat'] })));
await t('signed-out visitor reads nothing', () => assertFails(getDoc(doc(anon, 'families/simon'))));
await t('unverified email reads nothing', () => assertFails(getDoc(doc(unverified, 'families/simon'))));
await t('admin lists all families', () => assertSucceeds(getDocs(collection(admin, 'families'))));
await t('admin creates a family', () => assertSucceeds(setDoc(doc(admin, 'families/mosely'), { name: 'Lexus', parentEmails: ['lexus@example.com'] })));

console.log('Progress');
const P = (d) => ({ ...d, updatedAt: serverTimestamp() });
await t('parent saves progress for an assigned course', () => assertSucceeds(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), P({ items: { 'bb-bristol-L01': { best: 90, passed: true, last: 90 } }, attempts: {}, tasks: {} }))));
await pause();
await t('parent updates that progress', () => assertSucceeds(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), P({ items: { 'bb-bristol-L01': { best: 95, passed: true, last: 95 } }, attempts: {}, tasks: {} }))));
await t('parent cannot save progress for a course not assigned', () => assertFails(setDoc(doc(tia, 'families/simon/students/bristol/progress/sat'), P({ items: {} }))));
await t('parent cannot unlock a lesson', () => assertFails(setDoc(doc(tia, 'families/simon/students/bailey/progress/bb-bailey'), P({ items: {}, unlocked: { 'bb-bailey-L05': true } }))));
await t('parent cannot add extra fields', () => assertFails(setDoc(doc(tia, 'families/simon/students/bailey/progress/bb-bailey'), P({ items: {}, grade: 'A' }))));
await t('parent cannot fake the save time', () => assertFails(setDoc(doc(tia, 'families/simon/students/bailey/progress/bb-bailey'), { items: {}, updatedAt: new Date('2020-01-01') })));
await t('parent cannot delete progress', () => assertFails(deleteDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'))));
await t('parent cannot write another family\'s progress', () => assertFails(setDoc(doc(tia, 'families/ferguson/students/ethan/progress/bb-ethan'), P({ items: {} }))));
await t('admin unlocks a lesson', () => assertSucceeds(updateDoc(doc(admin, 'families/simon/students/bailey/progress/bb-bailey'), { unlocked: { 'bb-bailey-L05': true }, updatedAt: serverTimestamp() }).catch(() => setDoc(doc(admin, 'families/simon/students/bailey/progress/bb-bailey'), { unlocked: { 'bb-bailey-L05': true }, updatedAt: serverTimestamp() }))));
await pause();
await t('parent can still save after admin unlock (unlocks kept as is)', async () => {
  const snap = await getDoc(doc(tia, 'families/simon/students/bailey/progress/bb-bailey'));
  const cur = snap.data();
  await assertSucceeds(setDoc(doc(tia, 'families/simon/students/bailey/progress/bb-bailey'), { items: { 'bb-bailey-L01': { best: 70 } }, unlocked: cur.unlocked, updatedAt: serverTimestamp() }));
});
await t('skyler saves Ethan\'s progress, keeping KCE unlocks', async () => {
  const snap = await getDoc(doc(skyler, 'families/ferguson/students/ethan/progress/bb-ethan'));
  await assertSucceeds(setDoc(doc(skyler, 'families/ferguson/students/ethan/progress/bb-ethan'), { items: { 'bb-ethan-L01': { best: 90, passed: true } }, unlocked: snap.data().unlocked, updatedAt: serverTimestamp() }));
});
await pause();
await t('skyler cannot remove KCE unlocks', () => assertFails(setDoc(doc(skyler, 'families/ferguson/students/ethan/progress/bb-ethan'), { items: {}, updatedAt: serverTimestamp() })));

await pause();
await t('client-style merge save keeps KCE unlocks without sending them', () => assertSucceeds(setDoc(doc(skyler, 'families/ferguson/students/ethan/progress/bb-ethan'), { items: { 'bb-ethan-L02': { best: 60, passed: false, last: 60 } }, attempts: { 'practice-bb-ethan-L02': 2 }, tasks: {}, updatedAt: serverTimestamp() }, { merge: true })));
await t('unlocks still there after that save', async () => { const s = await getDoc(doc(admin, 'families/ferguson/students/ethan/progress/bb-ethan')); if (!s.data().unlocked['bb-ethan-L03']) throw new Error('unlock lost'); });
console.log('Score events');
const E = (d) => ({ course: 'bb-bristol', part: 'Lesson check', lesson: 'bb-bristol-L01', score: 90, correct: 9, total: 10, mastered: true, attempt: 1, by: 'family', at: serverTimestamp(), ...d });
await t('parent logs a score event', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({}))));
await t('client-style event with title and missed questions', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ lessonTitle: 'Contractions', questionSet: 2, missed: '{"q":"x","answer":"y"}' }))));
await t('parent cannot log a score above 100', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ score: 140 }))));
await t('parent cannot log for an unassigned course', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ course: 'sat' }))));
await t('parent cannot log for another family', () => assertFails(addDoc(collection(tia, 'families/ferguson/students/ethan/events'), E({ course: 'bb-ethan', lesson: 'bb-ethan-L01' }))));
await t('parent cannot change a logged score', async () => {
  const ref = await env.withSecurityRulesDisabled(async (ctx) => { const r = doc(ctx.firestore(), 'families/simon/students/bristol/events/e1'); await setDoc(r, { course: 'bb-bristol', score: 40 }); return r; });
  await assertFails(updateDoc(doc(tia, 'families/simon/students/bristol/events/e1'), { score: 100 }));
});
await t('parent cannot delete a logged score', () => assertFails(deleteDoc(doc(tia, 'families/simon/students/bristol/events/e1'))));
await t('admin logs a score during a live lesson', () => assertSucceeds(addDoc(collection(admin, 'families/simon/students/bailey/events'), E({ course: 'bb-bailey', lesson: 'bb-bailey-L02', by: 'teacher' }))));
await t('parent reads own child\'s scores', () => assertSucceeds(getDocs(collection(tia, 'families/simon/students/bristol/events'))));
await t('other parent cannot read those scores', () => assertFails(getDocs(collection(skyler, 'families/simon/students/bristol/events'))));

console.log('Review fixes');
const XSS = '<img src=x onerror=alert(1)>';
await t('HTML in correct/total/attempt is refused', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ correct: XSS, total: XSS, attempt: XSS }))));
await t('family cannot label its own score as a live lesson', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ by: 'teacher' }))));
await t('more right than total is refused', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ correct: 11, total: 10 }))));
await t('mastered must be yes/no', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ mastered: 'yes' }))));
await t('oversized lesson title refused', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ lessonTitle: 'A'.repeat(201) }))));
await t('oversized missed-questions text refused', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ missed: 'B'.repeat(8001) }))));
await t('missed questions as a list (old shape) refused', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ missed: ['a'] }))));
await pause();
await t('family cannot erase saved lessons', () => assertFails(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items: {}, updatedAt: serverTimestamp() })));
await pause();
await t('more than 400 lesson entries refused', () => { const items = {}; for (let i = 0; i < 401; i++) items['k' + i] = { best: 1 }; return assertFails(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items, updatedAt: serverTimestamp() }, { merge: true })); });
await pause();
await t('two saves within one second: the second is refused', async () => {
  await assertSucceeds(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items: { 'bb-bristol-L03': { best: 1 } }, updatedAt: serverTimestamp() }, { merge: true }));
  await assertFails(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items: { 'bb-bristol-L04': { best: 1 } }, updatedAt: serverTimestamp() }, { merge: true }));
});
const pwAdmin = user('kce@kingcretot.com', true, 'password');
await t('KCE email through a non-Google sign-in is NOT admin', () => assertFails(getDocs(collection(pwAdmin, 'families'))));
const pwTia = user('tia@example.com', true, 'password');
await t('parent email through a non-Google sign-in reads nothing', () => assertFails(getDoc(doc(pwTia, 'families/simon'))));
console.log('Everything else');
await t('nobody writes outside families', () => assertFails(setDoc(doc(tia, 'notes/x'), { a: 1 })));
await t('even signed-in parents read nothing outside families', () => assertFails(getDoc(doc(tia, 'notes/x'))));

console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);

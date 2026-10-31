// Independent review: each test PASSES when the weakness EXISTS (i.e. "proves" the finding).
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, collectionGroup, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'kce-review', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } });
await env.clearFirestore();
let pass = 0, fail = 0;
async function t(name, fn) { try { await fn(); pass++; console.log('  ok  ', name); } catch (e) { fail++; console.log('  FAIL', name, '-', String(e.message).split('\n')[0]); } }
await env.withSecurityRulesDisabled(async (ctx) => { const db = ctx.firestore();
  await setDoc(doc(db, 'families/simon'), { name: 'Tia', parentEmails: ['tia@example.com'] });
  await setDoc(doc(db, 'families/simon/students/bristol'), { firstName: 'Bristol', courses: ['bb-bristol'] });
  await setDoc(doc(db, 'families/ferguson'), { name: 'Skyler', parentEmails: ['skyler@example.com'] });
  await setDoc(doc(db, 'families/ferguson/students/ethan'), { firstName: 'Ethan', courses: ['bb-ethan'] });
  await setDoc(doc(db, 'families/ferguson/students/ethan/progress/bb-ethan'), { items: { 'bb-ethan-L01': { best: 90, passed: true } } });
});
const ctx = (uid, claims) => env.authenticatedContext(uid, claims).firestore();
const tia = ctx('tia', { email: 'tia@example.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } });
const XSS = '<img src=x onerror="window.__pwned=1">';
const E = (d) => ({ course: 'bb-bristol', part: 'Lesson check', lesson: 'L1', score: 90, at: serverTimestamp(), ...d });

console.log('XSS payloads accepted by rules (rendered unescaped by dashboard / course page)');
await t('event.correct / total / attempt may be HTML strings', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ correct: XSS, total: XSS, attempt: XSS }))));
await t('progress items.*.best may be an HTML string', () => assertSucceeds(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items: { 'bb-bristol-L01': { best: XSS, passed: false } }, updatedAt: serverTimestamp() }, { merge: true })));

console.log('Integrity');
await t('family can label its own score as a teacher "Live lesson"', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ by: 'teacher', mastered: true, score: 100 }))));
await t('mastered:true with score 0 / correct > total accepted', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ score: 0, mastered: true, correct: 99, total: 1 }))));
await t('family can wipe progress (non-merge set with empty items) when no unlocks exist', async () => {
  await assertSucceeds(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items: {}, updatedAt: serverTimestamp() }));
});

console.log('Size / quota abuse');
const big = 'A'.repeat(900 * 1024);
await t('~900 KB lessonTitle accepted in one event (no size check)', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ lessonTitle: big }))));
await t('missed list: 60 elements x 15 KB accepted', () => assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ missed: Array(60).fill('B'.repeat(15000)) }))));
await t('~900 KB progress doc accepted', () => assertSucceeds(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { items: { x: { blob: big } }, updatedAt: serverTimestamp() }, { merge: true })));
await t('100 events in a burst accepted (no rate limit)', async () => { for (let i = 0; i < 100; i++) await assertSucceeds(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({}))); });

console.log('Identity: provider is not checked');
const pwAdmin = ctx('mallory', { email: 'kce@kingcretot.com', email_verified: true, firebase: { sign_in_provider: 'password' } });
const oidcAdmin = ctx('mallory2', { email: 'KCE@KingCretot.com', email_verified: true, firebase: { sign_in_provider: 'oidc.someidp' } });
await t('any provider asserting verified kce@kingcretot.com is admin (password)', () => assertSucceeds(getDocs(collection(pwAdmin, 'families'))));
await t('any provider asserting verified KCE@KingCretot.com is admin (custom OIDC)', () => assertSucceeds(getDocs(collection(oidcAdmin, 'families'))));

console.log('Things that are FINE (expected denials)');
await t('collection-group read of progress denied for parent', () => assertFails(getDocs(collectionGroup(tia, 'progress'))));
await t('collection-group read of events denied for parent', () => assertFails(getDocs(query(collectionGroup(tia, 'events'), where('course', '==', 'bb-ethan')))));
await t('parent query for another email denied', () => assertFails(getDocs(query(collection(tia, 'families'), where('parentEmails', 'array-contains', 'skyler@example.com')))));
await t('nonexistent family get denied (no existence oracle)', () => assertFails(getDoc(doc(tia, 'families/nope'))));
await t('parent cannot create event with chosen id over existing', async () => {
  const r = await addDoc(collection(tia, 'families/simon/students/bristol/events'), E({}));
  await assertFails(setDoc(doc(tia, r.path), E({ score: 100 })));
});
await t('parent cannot sneak unlocked via update merge', () => assertFails(setDoc(doc(tia, 'families/simon/students/bristol/progress/bb-bristol'), { unlocked: { a: true }, updatedAt: serverTimestamp() }, { merge: true })));
await t('anonymous-provider user (no email) denied', () => assertFails(getDoc(doc(ctx('anon', { firebase: { sign_in_provider: 'anonymous' } }), 'families/simon'))));
await t('admin email unverified denied', () => assertFails(getDocs(collection(ctx('m3', { email: 'kce@kingcretot.com', email_verified: false }), 'families'))));
await t('event with course != assigned denied even if path course differs', () => assertFails(addDoc(collection(tia, 'families/simon/students/bristol/events'), E({ course: 'bb-ethan' }))));
console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup(); process.exit(fail ? 1 : 0);

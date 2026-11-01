import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync, writeFileSync } from 'fs';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
const FILE = '/home/claude/kce_import/KCE_past_scores_2026-10-31.json';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules','utf8'), host:'127.0.0.1', port:8080 } });
await env.clearFirestore();
await env.withSecurityRulesDisabled(async c => { const db=c.firestore();
  await setDoc(doc(db,'families/t'),{name:'Tia',parentEmails:['tia@example.com']});
  await setDoc(doc(db,'families/t/students/bristol'),{firstName:'Bristol',courses:['bb-bristol']});
  await setDoc(doc(db,'families/t/students/bailey'),{firstName:'Bailey',courses:['bb-bailey']});
  // Bristol's device already saved something newer: Lesson 5 and a later "last" on Lesson 1.
  await setDoc(doc(db,'families/t/students/bristol/progress/bb-bristol'),{items:{'bb-bristol-L01':{best:100,passed:true,last:88},'bb-bristol-L05':{best:70,passed:false,last:70}},attempts:{'bb-bristol-L01':9},updatedAt:Timestamp.now()});
  await setDoc(doc(db,'families/s'),{name:'Skyler',parentEmails:['skyler@example.com']});
  await setDoc(doc(db,'families/s/students/ethan'),{firstName:'Ethan',courses:['bb-ethan']});
});
const BASE='http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/';
const H={headers:{Authorization:'Bearer owner'}};
const get = async p => (await (await fetch(BASE+p,H)).json());
const list = async p => (await get(p)).documents||[];
let pass=0,fail=0; const ok=(n,c)=>{ if(c){pass++;console.log('  ok  ',n)} else {fail++;console.log('  FAIL',n)} };
const b=await chromium.launch(); const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ctx=await b.newContext(); await ctx.route('https://formspree.io/**', r=>r.fulfill({status:200,body:'{}',contentType:'application/json'})); const A=await ctx.newPage(); A.on('pageerror',e=>console.log('  pageerror',e.message));
await A.goto('http://127.0.0.1:8765/kce-progress/dashboard.html'); await A.waitForSelector('#in');
await A.evaluate(()=>window.__kcepTestSignIn('kce@kingcretot.com')); await A.waitForSelector('text=Every student',{timeout:20000});
await A.click('text=Families & enrollment'); await A.waitForSelector('#impf');

await A.setInputFiles('#impf',{name:'x.json',mimeType:'application/json',buffer:Buffer.from('not json')}); await wait(400);
ok('a broken file is refused with a clear message', (await A.textContent('#impmsg')).includes('could not be read'));
await A.setInputFiles('#impf',{name:'x.json',mimeType:'application/json',buffer:Buffer.from('{"kind":"other"}')}); await wait(400);
ok('a file that is not a past-scores file is refused', (await A.textContent('#impmsg')).includes('not a KCE past-scores file'));

await A.setInputFiles('#impf',FILE); await A.waitForSelector('#impgo');
const pre=(await A.innerText('#impmsg')).replace(/\s+/g,' ');
ok('preview: Bristol 14, Bailey 11, Ethan 5', pre.includes('Bristol (Tia family): 14 past scores') && pre.includes('Bailey (Tia family): 11 past scores') && pre.includes('Ethan (Skyler family): 5 past scores'));
ok("preview: Ce'Line skipped until her family is entered", pre.includes("Ce'Line: no student has this course yet"));
ok('nothing is written before clicking Load', (await list('families/t/students/bristol/events')).length===0);
await A.click('#impgo'); await A.waitForSelector('text=Loaded past scores',{timeout:30000}); await wait(1500);
const be=await list('families/t/students/bristol/events'), ba=await list('families/t/students/bailey/events'), ee=await list('families/s/students/ethan/events');
ok('14 / 11 / 5 scores saved', be.length===14 && ba.length===11 && ee.length===5);
const e6=be.find(d=>d.name.endsWith('imp-bb-bristol-20261021-0843')).fields;
ok("Bristol's Oct 21 8:43 AM check: 100, 8/8, mastered, try 6, past score", e6.score.integerValue==='100' && e6.correct.integerValue==='8' && e6.total.integerValue==='8' && e6.mastered.booleanValue===true && e6.attempt.integerValue==='6' && e6.by.stringValue==='import');
ok('time kept as 8:43 AM Eastern (12:43 UTC)', e6.at.timestampValue.startsWith('2026-10-21T12:43:00'));
const e1=be.find(d=>d.name.endsWith('imp-bb-bristol-20261020-1509')).fields;
ok('missed questions kept', e1.missed.stringValue.startsWith('donuts equal/not equal'));
const bp=(await get('families/t/students/bristol/progress/bb-bristol')).fields;
const it=bp.items.mapValue.fields;
ok("Bristol: device's newer Lesson 1 last score (88) and Lesson 5 kept", it['bb-bristol-L01'].mapValue.fields.last.integerValue==='88' && !!it['bb-bristol-L05']);
ok('Bristol: Lessons 2–4 added as mastered, best 100', ['L02','L03','L04'].every(l=>it['bb-bristol-'+l].mapValue.fields.passed.booleanValue===true && it['bb-bristol-'+l].mapValue.fields.best.integerValue==='100'));
ok("Bristol: device's higher attempt count kept (9)", bp.attempts.mapValue.fields['bb-bristol-L01'].integerValue==='9');
const ep=(await get('families/s/students/ethan/progress/bb-ethan')).fields.items.mapValue.fields['bb-ethan-L01'].mapValue.fields;
ok('Ethan: Lesson 1 best 70, not mastered', ep.best.integerValue==='70' && ep.passed.booleanValue===false);

// load again: no copies
await A.click('text=Families & enrollment').catch(()=>{}); await A.waitForSelector('#impf'); await A.setInputFiles('#impf',FILE); await A.waitForSelector('#impgo'); await A.click('#impgo'); await A.waitForSelector('text=Loaded past scores',{timeout:30000}); await wait(1500);
ok('loading the same file again makes no copies', (await list('families/t/students/bristol/events')).length===14 && (await list('families/s/students/ethan/events')).length===5);

// dashboard shows it
await A.click('.tabs button:has-text("Students")'); await wait(500); await A.click('.person:has-text(\"Bristol\") .hist'); await wait(600);
const h=(await A.innerText('.histbox:not(:empty)')).replace(/\s+/g,' ');
const rowB=(await A.innerText('.person:has-text("Bristol") tr:has-text("Building Blocks")')).replace(/\s+/g,' ');
ok('Last activity shows her real last score time (10/28/2026, 8:03 AM), not the load time', rowB.includes('10/28/2026, 8:03 AM'));
ok('Bristol history shows "Past score" rows with lesson titles', h.includes('Past score') && h.includes('Equal Groups or Not?') && h.includes('Lesson 4 · best 100 ✓'));

// a family cannot write a "past score"
const fam = env.authenticatedContext('tiaUid',{email:'tia@example.com',email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
let denied=false; try { await setDoc(doc(fam,'families/t/students/bristol/events/imp-fake'),{course:'bb-bristol',part:'Lesson check',lesson:'Lesson 9',score:100,correct:8,total:8,mastered:true,by:'import',at:Timestamp.now()}); } catch(e){ denied=true; }
ok('a family cannot add a "past score" itself', denied);

// hostile file: odd course id and fields shown as text
const bad={kind:'kce-past-scores',courses:{'<img src=x onerror=alert(1)>':{events:[]}}};
await A.click('text=Families & enrollment'); await A.waitForSelector('#impf');
await A.setInputFiles('#impf',{name:'b.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))}); await wait(400);
ok('an odd course name in a file is shown as plain text', (await A.textContent('#impmsg')).includes('<img') && !(await A.$('#impmsg img')));
console.log(`\n${pass} passed, ${fail} failed`); await b.close(); await env.cleanup(); process.exit(fail?1:0);

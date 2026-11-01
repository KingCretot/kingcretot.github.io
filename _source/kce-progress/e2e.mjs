import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules','utf8'), host:'127.0.0.1', port:8080 } });
await env.clearFirestore();
await env.withSecurityRulesDisabled(async c => { const db=c.firestore();
  await setDoc(doc(db,'families/ferguson'),{name:'Skyler',parentEmails:['skyler@example.com']});
  await setDoc(doc(db,'families/ferguson/students/ethan'),{firstName:'Ethan',courses:['bb-ethan']});
  await setDoc(doc(db,'families/ferguson/students/ethan/progress/bb-ethan'),{items:{'bb-ethan-L01':{best:85,passed:true,last:85}},unlocked:{'bb-ethan-L03':true}});
  await setDoc(doc(db,'families/simon'),{name:'Tia',parentEmails:['tia@example.com']});
  await setDoc(doc(db,'families/simon/students/bristol'),{firstName:'Bristol',courses:['bb-ethan']});
  await setDoc(doc(db,'families/simon/students/bailey'),{firstName:'Bailey',courses:['bb-ethan']});
});
const BASE='http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/';
function dec(v){ if(!v) return v; if('stringValue' in v) return v.stringValue; if('integerValue' in v) return Number(v.integerValue); if('doubleValue' in v) return v.doubleValue; if('booleanValue' in v) return v.booleanValue; if('nullValue' in v) return null; if('timestampValue' in v) return v.timestampValue; if('mapValue' in v){const o={};for(const k in (v.mapValue.fields||{}))o[k]=dec(v.mapValue.fields[k]);return o;} if('arrayValue' in v) return (v.arrayValue.values||[]).map(dec); return v; }
const H={headers:{Authorization:'Bearer owner'}};
const read = async p => { const r=await fetch(BASE+p,H); if(!r.ok) return undefined; const j=await r.json(); return dec({mapValue:{fields:j.fields}}); };
const events = async p => { const r=await fetch(BASE+p,H); const j=await r.json(); return (j.documents||[]).map(d=>dec({mapValue:{fields:d.fields}})); };
let pass=0,fail=0; const ok=(n,c)=>{ if(c){pass++;console.log('  ok  ',n)} else {fail++;console.log('  FAIL',n)} };
const browser = await chromium.launch();
const URL='http://127.0.0.1:8765/building-blocks/ethan/index.html';
async function device(){ const ctx=await browser.newContext(); await ctx.route('https://formspree.io/**', r=>r.fulfill({status:200,body:'{}',contentType:'application/json'})); const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('   pageerror',e.message)); return {ctx,pg}; }
const wait = ms => new Promise(r=>setTimeout(r,ms));

// Device A: has L02 locally, signs in
let A=await device(); await A.pg.goto(URL); await A.pg.evaluate(()=>localStorage.setItem('kce_bb_progress',JSON.stringify({'bb-ethan-L02':{best:60,passed:false,last:60},'bb-bristol-L01':{best:99,passed:true}})));
await A.pg.reload(); await A.pg.waitForSelector('.kcep button'); ok('signed-out page shows "Sign in with Google"', (await A.pg.textContent('.kcep')).includes('Sign in with Google'));
await A.pg.evaluate(()=>window.__kcepTestSignIn('skyler@example.com'));
await A.pg.waitForFunction(()=>document.querySelector('.kcep')&&document.querySelector('.kcep').textContent.includes('Saving for Ethan'),null,{timeout:20000});
ok('Skyler signed in: bar says "Saving for Ethan"', true);
await wait(1500);
let cloud=await read('families/ferguson/students/ethan/progress/bb-ethan');
ok('device progress (Lesson 2) copied up to the database', cloud.items['bb-ethan-L02']?.best===60);
ok('existing database score (Lesson 1) kept', cloud.items['bb-ethan-L01']?.best===85 && cloud.items['bb-ethan-L01'].passed);
ok('another student\'s entry on the same device NOT copied into Ethan\'s record', !cloud.items['bb-bristol-L01']);
ok('KCE unlock still in the database', cloud.unlocked['bb-ethan-L03']===true);
let local=await A.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_progress')));
ok('database score (Lesson 1) brought onto this device', local['bb-ethan-L01']?.best===85);
ok('other student\'s device entry left untouched', local['bb-bristol-L01']?.best===99);
ok('KCE unlock brought onto this device', (await A.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_unlocked')||'{}')))['bb-ethan-L03']===true);

// Lesson saves a new score and sends to Formspree
await A.pg.evaluate(()=>{ const p=JSON.parse(localStorage.getItem('kce_bb_progress')); p['bb-ethan-L02']={best:92,passed:true,last:92}; localStorage.setItem('kce_bb_progress',JSON.stringify(p));
  fetch('https://formspree.io/f/maeqzabe',{method:'POST',body:JSON.stringify({program:'KCE Building Blocks',part:'Lesson check',student:'Ethan',lesson:'Lesson 2',lesson_title:"Deja's Food Drive",score:92,correct:11,total:12,mastered:'yes',attempt:2,question_set:2,missed:[{q:'7x8',first_try:'54',answer:'56'}]})}).catch(()=>{}); });
await wait(3500);
cloud=await read('families/ferguson/students/ethan/progress/bb-ethan');
ok('new lesson score saved to the database within seconds', cloud.items['bb-ethan-L02']?.best===92 && cloud.items['bb-ethan-L02'].passed);
let ev=await events('families/ferguson/students/ethan/events');
ok('score recorded in Ethan\'s score history', ev.length===1 && ev[0].score===92 && ev[0].mastered===true && ev[0].lesson==='Lesson 2' && ev[0].by==='family');

// Device B: brand new device, signs in, gets everything back
let B=await device(); await B.pg.goto(URL); await B.pg.waitForSelector('.kcep button');
await B.pg.evaluate(()=>window.__kcepTestSignIn('skyler@example.com'));
await B.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return b&&b.textContent.includes('Saving for Ethan')},null,{timeout:20000});
await wait(1500);
local=await B.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'));
ok('new device: all of Ethan\'s progress is there (Lessons 1 and 2)', local['bb-ethan-L01']?.best===85 && local['bb-ethan-L02']?.best===92);

// Clearing the browser erases nothing
await B.pg.evaluate(()=>{localStorage.clear();sessionStorage.clear();}); await B.pg.reload();
await B.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return b&&b.textContent.includes('Saving for Ethan')},null,{timeout:20000}); await wait(1500);
local=await B.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'));
ok('after clearing the browser, progress comes back', local['bb-ethan-L02']?.best===92);

// Admin: teaching picker
let C=await device(); await C.pg.goto(URL); await C.pg.evaluate(()=>localStorage.setItem('kce_bb_progress',JSON.stringify({'bb-ethan-L05':{best:100,passed:true,last:100}}))); await C.pg.reload(); await C.pg.waitForSelector('.kcep button');
await C.pg.evaluate(()=>window.__kcepTestSignIn('kce@kingcretot.com'));
await C.pg.waitForSelector('.kcep-box',{timeout:20000});
const t=await C.pg.textContent('.kcep-box');
ok('KCE account gets the "Teaching:" picker with every student on the course', t.includes('Teaching:')&&t.includes('Ethan')&&t.includes('Bristol')&&t.includes('Bailey'));
await C.pg.click('.kcep-box button:has-text("Bailey")');
await C.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return !!b&&b.textContent.includes('Teaching: Bailey')},null,{timeout:20000});
ok('picking Bailey shows "Teaching: Bailey"', true);
await C.pg.evaluate(()=>{ fetch('https://formspree.io/f/x',{method:'POST',body:JSON.stringify({part:'Practice set',lesson:'Lesson 1',score:70,correct:7,total:10})}).catch(()=>{}); });
await wait(2500);
ev=await events('families/simon/students/bailey/events');
ok('score from a live lesson goes to Bailey, marked as teacher', ev.length===1 && ev[0].by==='teacher' && ev[0].score===70);
let bai=await read('families/simon/students/bailey/progress/bb-ethan');
ok("Jonathan's own device clicks (a Lesson 5 preview) NOT sent into Bailey's record", !bai || !bai.items || !bai.items['bb-ethan-L05']);
await C.pg.evaluate(()=>{ const p=JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'); p['bb-ethan-L01']={best:75,passed:true,last:75}; localStorage.setItem('kce_bb_progress',JSON.stringify(p)); });
await wait(3000); bai=await read('families/simon/students/bailey/progress/bb-ethan');
ok('a score earned during the live lesson IS saved to Bailey', bai?.items?.['bb-ethan-L01']?.best===75 && !bai.items['bb-ethan-L05']);

// Parent with two children on the same course: family picker
let D=await device(); await D.pg.goto(URL); await D.pg.waitForSelector('.kcep button');
await D.pg.evaluate(()=>window.__kcepTestSignIn('tia@example.com'));
await D.pg.waitForSelector('.kcep-box',{timeout:20000});
const t2=await D.pg.textContent('.kcep-box');
ok('Tia gets "Who\'s learning today?" with only her own children', t2.includes("Who's learning today?")&&t2.includes('Bristol')&&t2.includes('Bailey')&&!t2.includes('Ethan'));
await D.pg.click('.kcep-box button:has-text("Bristol")');
await D.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return !!b&&b.textContent.includes('Saving for Bristol')},null,{timeout:20000}); await wait(1200);
await D.pg.evaluate(()=>{ const p=JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'); p['bb-ethan-L04']={best:88,passed:true,last:88}; localStorage.setItem('kce_bb_progress',JSON.stringify(p)); });
await wait(3500);
ok("Bristol's new score saved to Bristol", (await read('families/simon/students/bristol/progress/bb-ethan'))?.items?.['bb-ethan-L04']?.best===88);
await D.pg.click('.kcep a:has-text("Switch")'); await D.pg.waitForSelector('.kcep-box',{timeout:20000});
await D.pg.click('.kcep-box button:has-text("Bailey")');
await D.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return !!b&&b.textContent.includes('Saving for Bailey')},null,{timeout:20000}); await wait(2000);
let bai2=await read('families/simon/students/bailey/progress/bb-ethan');
ok("switching to Bailey on the same device does NOT copy Bristol's score into Bailey's record", !bai2 || !bai2.items || !bai2.items['bb-ethan-L04']);
const shown=await D.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'));
ok("the page now shows Bailey's own record, not Bristol's", !shown['bb-ethan-L04']);
await D.pg.click('.kcep a:has-text("Sign out")'); await D.pg.waitForSelector('.kcep button',{timeout:20000});
const after=await D.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'));
ok('signing out takes this course\'s progress off the shared device', Object.keys(after).filter(k=>/^bb-ethan-L/.test(k)).length===0);

// Two devices open at once: an older device can never lower a score
let X1=await device(), X2=await device();
for (const X of [X1,X2]) { await X.pg.goto(URL); await X.pg.waitForSelector('.kcep button'); await X.pg.evaluate(()=>window.__kcepTestSignIn('skyler@example.com')); await X.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return !!b&&b.textContent.includes('Saving for Ethan')},null,{timeout:20000}); }
await wait(1500);
await X1.pg.evaluate(()=>{ const p=JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'); p['bb-ethan-L06']={best:95,passed:true,last:95}; localStorage.setItem('kce_bb_progress',JSON.stringify(p)); });
await wait(3500);
await X2.pg.evaluate(()=>{ const p=JSON.parse(localStorage.getItem('kce_bb_progress')||'{}'); p['bb-ethan-L06']={best:40,passed:false,last:40}; localStorage.setItem('kce_bb_progress',JSON.stringify(p)); });
await wait(3500);
const l6=(await read('families/ferguson/students/ethan/progress/bb-ethan')).items['bb-ethan-L06'];
ok('two devices open: the 95 and "mastered" are kept when the other device scores 40', l6.best===95 && l6.passed===true);
const x2=await X2.pg.evaluate(()=>JSON.parse(localStorage.getItem('kce_bb_progress'))['bb-ethan-L06']);
ok('the second device then shows the 95 too', x2.best===95 && x2.passed===true);

// Account not set up
let E2=await device(); await E2.pg.goto(URL); await E2.pg.waitForSelector('.kcep button');
await E2.pg.evaluate(()=>window.__kcepTestSignIn('stranger@example.com'));
await E2.pg.waitForFunction(()=>{const b=document.querySelector('.kcep');return !!b&&b.textContent.includes("isn't set up")},null,{timeout:20000});
ok('an account KCE has not set up sees "isn\'t set up for this course yet" and reads nothing', true);
const lessonStillWorks = await E2.pg.evaluate(()=>document.querySelectorAll('.go-lesson').length>0);
ok('course page still works normally', lessonStillWorks);

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); await env.cleanup(); process.exit(fail?1:0);

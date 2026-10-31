import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules','utf8'), host:'127.0.0.1', port:8080 } });
await env.clearFirestore();
await env.withSecurityRulesDisabled(async c => { const db=c.firestore();
  await setDoc(doc(db,'families/t'),{name:'Tia Bigi-Simon',parentEmails:['turbo04tia@gmail.com']});
  await setDoc(doc(db,'families/t/students/bristol-simon'),{firstName:'Bristol Simon',courses:['bb-bristol']});
  await setDoc(doc(db,'families/t/students/bailey-simon'),{firstName:'Bailey Simon',courses:['bb-bailey']});
  // what the past-score import put there
  await setDoc(doc(db,'families/t/students/bristol-simon/progress/bb-bristol'),{items:{'bb-bristol-L01':{best:100,passed:true,last:100},'bb-bristol-L02':{best:100,passed:true,last:100},'bb-bristol-L03':{best:100,passed:true,last:100},'bb-bristol-L04':{best:100,passed:true,last:100}},attempts:{'bb-bristol-L01':7},updatedAt:Timestamp.fromDate(new Date(Date.now()-60000))});
});
const BASE='http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/'; const H={headers:{Authorization:'Bearer owner'}};
const get=async p=>(await (await fetch(BASE+p,H)).json()); const list=async p=>((await get(p)).documents||[]);
let pass=0,fail=0; const ok=(n,c)=>{ if(c){pass++;console.log('  ok  ',n)} else {fail++;console.log('  FAIL',n)} };
const b=await chromium.launch(); const wait=ms=>new Promise(r=>setTimeout(r,ms)); const errs=[];
const ctx=await b.newContext(); await ctx.route('https://formspree.io/**', r=>r.fulfill({status:200,body:'{"ok":true}',contentType:'application/json'}));
const P=await ctx.newPage(); P.on('pageerror',e=>errs.push(e.message));
const bar=(s)=>P.waitForFunction((s)=>{const x=document.querySelector('.kcep');return !!x&&x.textContent.includes(s)}, s, {timeout:25000});
// Bristol's tablet already has her progress, including a newer Lesson 5 try and practice counts
await P.goto('http://127.0.0.1:8765/building-blocks/bristol/index.html');
await P.evaluate(()=>{ localStorage.setItem('kce_bb_progress',JSON.stringify({'bb-bristol-L01':{best:100,passed:true,last:100},'bb-bristol-L02':{best:100,passed:true,last:100},'bb-bristol-L03':{best:100,passed:true,last:100},'bb-bristol-L04':{best:100,passed:true,last:100},'bb-bristol-L05':{best:70,passed:false,last:70}})); localStorage.setItem('kce_bb_attempts',JSON.stringify({'bb-bristol-L01':7,'bb-bristol-L05':2,'practice-bristol-L01':2,'practice-bristol-L02':4})); });
await P.reload(); await P.waitForSelector('.kcep');
ok('Bristol course page shows the "Save your progress to KCE" bar', (await P.textContent('.kcep')).includes('Save your progress to KCE'));
await P.evaluate(()=>window.__kcepTestSignIn('turbo04tia@gmail.com'));
await bar('Saving for Bristol Simon'); ok('Tia signs in: "Saving for Bristol Simon"', true); await wait(2500);
const pr=(await get('families/t/students/bristol-simon/progress/bb-bristol')).fields;
const it=pr.items.mapValue.fields, at=pr.attempts.mapValue.fields;
ok("tablet's Lesson 5 try (70) added to the database", it['bb-bristol-L05'] && it['bb-bristol-L05'].mapValue.fields.best.integerValue==='70');
ok('imported Lessons 1–4 still mastered', ['L01','L02','L03','L04'].every(l=>it['bb-bristol-'+l].mapValue.fields.passed.booleanValue===true));
ok('practice counts (practice-bristol-L02: 4) saved too', at['practice-bristol-L02'] && at['practice-bristol-L02'].integerValue==='4');
ok('course page still works (no page errors)', errs.length===0);
// a lesson check score sent the usual way also lands in the database
await P.goto('http://127.0.0.1:8765/building-blocks/bristol/lesson-01.html'); await bar('Saving for Bristol Simon'); await wait(800);
await P.evaluate(()=>fetch('https://formspree.io/f/maeqzabe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({program:'KCE Building Blocks',part:'Lesson check',student:'Bristol',lesson:'Lesson 5',lesson_title:'Test',score:88,correct:7,total:8,question_set:1,mastered:'yes',attempt:3,missed:[{q:'x',first_try:'y',answer:'z'}]})}));
await wait(2500);
const ev=await list('families/t/students/bristol-simon/events');
ok('a lesson-check score is recorded (88, Lesson 5, by the family)', ev.length===1 && ev[0].fields.score.integerValue==='88' && ev[0].fields.by.stringValue==='family');
ok('lesson page still works (no page errors)', errs.length===0);
// same tablet, Bailey's page: already signed in, saves for Bailey, nothing mixed
await P.goto('http://127.0.0.1:8765/building-blocks/bailey/index.html'); await bar('Saving for Bailey Simon');
ok("same device on Bailey's page: \"Saving for Bailey Simon\" without signing in again", true); await wait(2500);
const bp=await get('families/t/students/bailey-simon/progress/bb-bailey');
ok("Bristol's lessons are not copied into Bailey's record", !JSON.stringify(bp).includes('bristol'));
ok('no page errors anywhere', errs.length===0); if (errs.length) console.log(errs);
console.log(`\n${pass} passed, ${fail} failed`); await b.close(); await env.cleanup(); process.exit(fail?1:0);

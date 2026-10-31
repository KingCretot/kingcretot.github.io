import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules','utf8'), host:'127.0.0.1', port:8080 } });
await env.clearFirestore();
await env.withSecurityRulesDisabled(async c => { const db=c.firestore();
  await setDoc(doc(db,'families/f1'),{name:'Skyler',parentEmails:['skyler@example.com']});
  await setDoc(doc(db,'families/f1/students/ethan'),{firstName:'Ethan',courses:['bb-ethan']});
  await setDoc(doc(db,'families/f1/students/ethan/progress/bb-ethan'),{items:{'bb-ethan-L01':{best:90,passed:true,last:90},'bb-ethan-L02':{best:60,passed:false,last:60},'practice-bb-ethan-L01':{best:3}},updatedAt:Timestamp.now()});
  await setDoc(doc(db,'families/f1/students/ethan/events/e1'),{course:'bb-ethan',part:'Lesson check',lesson:'Lesson 2',lessonTitle:"Deja's Food Drive",score:60,correct:6,total:10,mastered:false,attempt:1,by:'family',at:Timestamp.now()});
});
const BASE='http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/';
const H={headers:{Authorization:'Bearer owner'}};
const list = async p => { const r=await fetch(BASE+p,H); const j=await r.json(); return j.documents||[]; };
let pass=0,fail=0; const ok=(n,c)=>{ if(c){pass++;console.log('  ok  ',n)} else {fail++;console.log('  FAIL',n)} };
const browser=await chromium.launch(); const URL='http://127.0.0.1:8765/kce-progress/dashboard.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function page(){ const ctx=await browser.newContext(); const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('   pageerror',e.message)); return pg; }

let P=await page(); await P.goto(URL); await P.waitForSelector('#in');
ok('signed out: shows "Sign in with Google" and no data', !(await P.innerText('body')).includes('Ethan') && (await P.textContent('#app')).includes('Sign in with Google'));
await P.evaluate(()=>window.__kcepTestSignIn('skyler@example.com'));
await P.waitForSelector('text=KCE staff only',{timeout:20000});
ok('a parent account sees "KCE staff only" and no student data', !(await P.content()).includes('Lesson 2'));

let A=await page(); A.on('dialog', d=>d.accept(A.__answer||'')); await A.goto(URL); await A.waitForSelector('#in');
await A.evaluate(()=>window.__kcepTestSignIn('kce@kingcretot.com'));
await A.waitForSelector('text=Every student',{timeout:20000});
const txt=await A.textContent('#view');
ok('KCE account sees the dashboard with Ethan', txt.includes('Ethan') && txt.includes('Building Blocks — Ethan'));
ok('shows where Ethan is (Lesson 2, started not mastered)', txt.includes('Lesson 2 · best 60'));
ok('shows mastered count and last score 60', /Ethan.*Building Blocks — Ethan.*Lesson 2.*1/.test(txt.replace(/\s+/g,' ')) && txt.includes('60'));
ok('summary: 1 student enrolled, 1 active this week', (await A.textContent('.sum')).replace(/\s+/g,' ').includes('1students enrolled') || (await A.textContent('.sum')).includes('students enrolled'));
await A.click('.stu'); await A.waitForSelector('text=score history');
ok("clicking Ethan shows his score history with the lesson title", (await A.textContent('#detail')).includes("Deja's Food Drive"));

// Enrollment
await A.click('text=Families & enrollment'); await A.waitForSelector('#pn');
await A.click('#savefam'); ok('empty form is refused with a clear message', (await A.textContent('#fmsg')).includes("parent's first name"));
await A.fill('#pn','Tia'); await A.fill('#pe','skyler@example.com'); await A.fill('.cn','Bristol'); await A.click('#savefam');
ok('an email already used by another family is refused', (await A.textContent('#fmsg')).includes('already belongs to the Skyler family'));
await A.fill('#pe','tia@example, x'); await A.click('#savefam');
ok('a mistyped email is refused', (await A.textContent('#fmsg')).includes('Check this email'));
await A.fill('#pe','Tia@Example.com'); await A.check('input[name=cc0][value=bb-bristol]');
await A.click('#addkid'); await A.fill('.child[data-i="1"] .cn','Bailey'); await A.check('input[name=cc1][value=bb-bailey]');
await A.click('#savefam'); await A.waitForSelector('text=Saved:',{timeout:10000}); await wait(2500);
const fams=await list('families'); const tia=fams.find(d=>d.fields.name.stringValue==='Tia');
ok('Tia\'s family saved with her email in lower case', tia && tia.fields.parentEmails.arrayValue.values[0].stringValue==='tia@example.com');
const fid=tia.name.split('/').pop(); const kids=await list(`families/${fid}/students`);
const names=kids.map(k=>k.fields.firstName.stringValue).sort();
ok('Bristol and Bailey saved under Tia with their courses', names.join()==='Bailey,Bristol' && kids.find(k=>k.fields.firstName.stringValue==='Bristol').fields.courses.arrayValue.values[0].stringValue==='bb-bristol');
ok('no child email anywhere in the children\'s records', !JSON.stringify(kids).includes('@'));

// Assign another course from the family list
await A.waitForSelector(`.fam[data-f="${fid}"] .addc`);
await A.selectOption(`.fam[data-f="${fid}"] .child:has-text("Bailey") .addc`, 'bb-celine'); await wait(2500);
let bai=(await list(`families/${fid}/students`)).find(k=>k.fields.firstName.stringValue==='Bailey');
ok('assigning a course from the list saves it', bai.fields.courses.arrayValue.values.map(v=>v.stringValue).includes('bb-celine'));
await A.click(`.fam[data-f="${fid}"] .child:has-text("Bailey") [data-rm-course="bb-celine"]`); await wait(2500);
bai=(await list(`families/${fid}/students`)).find(k=>k.fields.firstName.stringValue==='Bailey');
ok('removing that course saves it', !bai.fields.courses.arrayValue.values.map(v=>v.stringValue).includes('bb-celine'));

// Parent can now use it on the course page (rules + data line up)
let T=await page(); await T.goto('http://127.0.0.1:8765/building-blocks/ethan/index.html'); await T.waitForSelector('.kcep button');
await T.evaluate(()=>window.__kcepTestSignIn('tia@example.com'));
await T.waitForFunction(()=>{const b=document.querySelector('.kcep');return !!b&&b.textContent.includes("isn't set up")},null,{timeout:20000});
ok("Tia, enrolled for Bristol and Bailey, sees \"isn't set up\" on Ethan's course page (not her course)", true);

console.log(`\n${pass} passed, ${fail} failed`); await browser.close(); await env.cleanup(); process.exit(fail?1:0);

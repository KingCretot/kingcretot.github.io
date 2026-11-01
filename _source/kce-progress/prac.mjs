import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules','utf8'), host:'127.0.0.1', port:8080 } });
await env.clearFirestore();
let pass=0,fail=0; const ok=(n,c)=>{ if(c){pass++;console.log('  ok  ',n)} else {fail++;console.log('  FAIL',n)} };
const b=await chromium.launch(); const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pg=async()=>{const ctx=await b.newContext(); await ctx.route('https://formspree.io/**', r=>r.fulfill({status:200,body:'{}',contentType:'application/json'})); const p=await ctx.newPage(); p.on('pageerror',e=>console.log('  pageerror',e.message)); return p;};
// 1. KCE adds a practice family on the dashboard
const D=await pg(); await D.goto('http://127.0.0.1:8765/kce-progress/dashboard.html'); await D.waitForSelector('#in');
await D.evaluate(()=>window.__kcepTestSignIn('kce@kingcretot.com')); await D.waitForSelector('text=Every student',{timeout:20000});
await D.click('text=Families & enrollment'); await D.fill('#pn','Practice'); await D.fill('#pe','jonathan.personal@example.com'); await D.fill('.cn','Test Student'); await D.check('input[name=cc0][value=bb-practice]');
await D.click('#savefam'); await D.waitForSelector('text=Saved:'); await wait(1500);
ok('practice family added on the dashboard', true);
// 2. Second account signs in on the practice page and earns scores
const P=await pg(); await P.goto('http://127.0.0.1:8765/kce-progress/practice.html'); await P.waitForSelector('.kcep button');
await P.evaluate(()=>window.__kcepTestSignIn('jonathan.personal@example.com'));
await P.waitForFunction(()=>{const x=document.querySelector('.kcep');return !!x&&x.textContent.includes('Saving for Test Student')},null,{timeout:20000});
ok('practice page: "Saving for Test Student"', true);
await P.click('.card:has-text("Practice Lesson 1") button:has-text("Score 60")'); await wait(2500);
await P.click('.card:has-text("Practice Lesson 1") button:has-text("Score 90")'); await wait(2500);
await P.click('.card:has-text("Practice Lesson 2") button:has-text("Score 60")'); await wait(3000);
// 3. Dashboard shows it
await D.click('#reload'); await wait(1500); await D.click('.tabs button:has-text("Students")'); await D.waitForSelector('text=Every student'); await wait(500);
const t=(await D.innerText('#view')).replace(/\s+/g,' ');
ok('dashboard shows Test Student on the practice course', t.includes('Test Student') && t.includes('Practice page (testing only)'));
ok('dashboard: Lesson 2 started, not mastered (best 60)', t.includes('Lesson 2 · best 60'));
await D.click('.stu:has-text("Test Student")'); await wait(600);
const h=(await D.innerText('#detail')).replace(/\s+/g,' ');
console.log('HISTORY ROWS', (h.match(/Lesson check/g)||[]).length); ok('score history has all three scores', (h.match(/Lesson check/g)||[]).length===3 && h.includes('Lesson 1 · best 90 ✓'));
// 4. Fresh device: progress comes back
const Q=await pg(); await Q.goto('http://127.0.0.1:8765/kce-progress/practice.html'); await Q.waitForSelector('.kcep button');
await Q.evaluate(()=>window.__kcepTestSignIn('jonathan.personal@example.com'));
await Q.waitForFunction(()=>{const x=document.querySelector('.kcep');return !!x&&x.textContent.includes('Saving for')},null,{timeout:20000}); await wait(1000);
ok('second device shows Lesson 1 mastered', (await Q.innerText('[data-l="1"]')).includes('Mastered · best 90'));
console.log(`\n${pass} passed, ${fail} failed`); await b.close(); await env.cleanup(); process.exit(fail?1:0);

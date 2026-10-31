import { chromium } from 'playwright';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
const env = await initializeTestEnvironment({ projectId: 'kce-student-progress', firestore: { rules: readFileSync('firestore.rules','utf8'), host:'127.0.0.1', port:8080 } });
await env.clearFirestore();
await fetch('http://127.0.0.1:9099/emulator/v1/projects/kce-student-progress/accounts', { method: 'DELETE' });
const BASE='http://127.0.0.1:8080/v1/projects/kce-student-progress/databases/(default)/documents/';
const H={headers:{Authorization:'Bearer owner'}};
const list = async p => { const r=await fetch(BASE+p,H); const j=await r.json(); return j.documents||[]; };
let pass=0,fail=0; const ok=(n,c)=>{ if(c){pass++;console.log('  ok  ',n)} else {fail++;console.log('  FAIL',n)} };
const b=await chromium.launch(); const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pg=async()=>{const ctx=await b.newContext(); await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://127.0.0.1:8765'}); const p=await ctx.newPage(); p.on('pageerror',e=>console.log('  pageerror',e.message)); return p;};
const DASH='http://127.0.0.1:8765/kce-progress/dashboard.html', PRAC='http://127.0.0.1:8765/kce-progress/practice.html';
const bar = async (P, s) => P.waitForFunction((s)=>{const x=document.querySelector('.kcep');return !!x&&x.textContent.includes(s)}, s, {timeout:20000});

// 1. KCE adds a family with NO email
const D=await pg(); let answer=''; D.on('dialog', d=>d.accept(answer));
await D.goto(DASH); await D.waitForSelector('#in');
await D.evaluate(()=>window.__kcepTestSignIn('kce@kingcretot.com')); await D.waitForSelector('text=Every student',{timeout:20000});
await D.click('text=Families & enrollment'); await D.fill('#pn','Lexus'); await D.fill('.cn',"Ce'Line"); await D.check('input[name=cc0][value=bb-practice]');
await D.click('#savefam'); await D.waitForSelector('text=Saved:',{timeout:10000}); await wait(2000);
let fam=(await list('families')).find(d=>d.fields.name.stringValue==='Lexus');
ok('a family can be saved with no email', !!fam && !(fam.fields.parentEmails.arrayValue.values||[]).length);
const fid=fam.name.split('/').pop();

// 2. Create a code
await D.fill('#pe','x@code.kingcretot.com'); await D.fill('#pn','Bad'); await D.fill('.cn','Bad'); await D.click('#savefam');
ok('a code address cannot be typed in as a parent email', (await D.textContent('#fmsg')).includes('Check this email'));
answer='Lexus';
await D.click(`.fam[data-f="${fid}"] [data-add-code]`);
await D.waitForSelector(`.fam[data-f="${fid}"] [data-code]`,{timeout:15000});
const code=(await D.textContent(`.fam[data-f="${fid}"] [data-code]`)).trim();
ok('dashboard shows a new code in XXXX-XXXX-XXXX form', /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code));
ok('dashboard is still signed in as KCE after making the code', (await D.textContent('#who')).includes('kce@kingcretot.com'));
await D.click(`.fam[data-f="${fid}"] [data-copy]`); await wait(300);
ok('Copy code button copies the code', (await D.evaluate(()=>navigator.clipboard.readText()))===code);
fam=(await list('families')).find(d=>d.name.endsWith(fid));
const uids=(fam.fields.codeUids.arrayValue.values||[]).map(v=>v.stringValue);
ok('one code account saved on the family, labeled', uids.length===1 && fam.fields.codeInfo.mapValue.fields[uids[0]].mapValue.fields.label.stringValue==='Lexus');
const all=JSON.stringify(await list('families'))+JSON.stringify(await list(`families/${fid}/students`));
const acct=await (await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/kce-student-progress/accounts:query',{method:'POST',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:'{}'})).json();
const emails=(acct.userInfo||[]).map(u=>u.email||'').join(' ');
ok('the Firebase sign-in name does not reveal the code', /[a-f0-9]{24}@code\.kingcretot\.com/.test(emails) && !emails.includes(code.replace(/-/g,'').toLowerCase()));
ok('the code itself is not stored anywhere in the database', !all.includes(code) && !all.includes(code.replace(/-/g,'')) && !all.toLowerCase().includes(code.replace(/-/g,'').toLowerCase()));

// 3. Family signs in with the code (typed in lower case, no dashes)
const P=await pg(); await P.goto(PRAC); await P.waitForSelector('.kcep a');
await P.click('.kcep a:has-text("Use a KCE code")');
await P.fill('.kcep input','ABCD'); await P.click('.kcep button:has-text("Sign in")');
ok('a short code gets a clear message', (await P.textContent('.kcep')).includes('all 12'));
await P.fill('.kcep input','ABCD-EFGH-JKMN'); await P.click('.kcep button:has-text("Sign in")');
await bar(P,"didn't work"); ok('a wrong code is refused with a clear message', true);
await P.fill('.kcep input',code.replace(/-/g,'').toLowerCase()); await P.press('.kcep input','Enter');
await bar(P,"Saving for Ce'Line"); ok("the code signs in and saves for Ce'Line", true);
await P.click('.card:has-text("Practice Lesson 1") button:has-text("Score 90")'); await wait(3500);
const ev=await list(`families/${fid}/students/ce-line/events`);
const pr=await list(`families/${fid}/students/ce-line/progress`);
ok('score saved to the database (1 history entry, Lesson 1 best 90)', ev.length===1 && JSON.stringify(pr).includes('"best"') && JSON.stringify(pr).includes('90'));

// 4. A fresh device with the code gets progress back
const Q=await pg(); await Q.goto(PRAC); await Q.waitForSelector('.kcep a');
await Q.click('.kcep a:has-text("Use a KCE code")'); await Q.fill('.kcep input',code); await Q.click('.kcep button:has-text("Sign in")');
await bar(Q,'Saving for'); await wait(1200);
ok('second device with the code shows Lesson 1 mastered', (await Q.innerText('[data-l="1"]')).includes('Mastered · best 90'));

// 5. A code cannot open the dashboard
const X=await pg(); await X.goto(DASH); await X.waitForSelector('#in');
await X.evaluate(async (c)=>{ const m=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); }, code).catch(()=>{});
ok('dashboard has no code sign-in (staff Google only)', !(await X.content()).includes('KCE code'));

// 6. Dashboard shows the code pill; turn it off
await D.click('#reload').catch(()=>{}); await wait(1500); await D.click('text=Families & enrollment'); await wait(500);
ok('family shows "KCE code · Lexus"', (await D.textContent(`.fam[data-f="${fid}"]`)).includes('KCE code · Lexus'));
await D.click(`.fam[data-f="${fid}"] [data-rm-code]`); await wait(1500);
ok("the family's only sign-in cannot be removed by accident", (await D.textContent('#fmsg')).includes('Create a new code first'));
answer='Lexus – tablet'; await D.click(`.fam[data-f="${fid}"] [data-add-code]`); await D.waitForSelector(`.fam[data-f="${fid}"] [data-code]`,{timeout:15000});
const code2=(await D.textContent(`.fam[data-f="${fid}"] [data-code]`)).trim();
ok('a second code is different', code2!==code);
answer='';
const first=uids[0]; await D.click(`.fam[data-f="${fid}"] [data-rm-code="${first}"]`); await wait(2500);
fam=(await list('families')).find(d=>d.name.endsWith(fid));
const left=(fam.fields.codeUids.arrayValue.values||[]).map(v=>v.stringValue);
ok('turning off the first code removes it and keeps the second', left.length===1 && left[0]!==first && !fam.fields.codeInfo.mapValue.fields[first]);
const R=await pg(); await R.goto(PRAC); await R.waitForSelector('.kcep a');
await R.click('.kcep a:has-text("Use a KCE code")'); await R.fill('.kcep input',code); await R.click('.kcep button:has-text("Sign in")');
await bar(R,"isn't set up"); ok('the turned-off code no longer reaches the family', true);
console.log(`\n${pass} passed, ${fail} failed`); await b.close(); await env.cleanup(); process.exit(fail?1:0);

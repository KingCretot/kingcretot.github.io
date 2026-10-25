// node test.js <student> <n...> [--shots dir] : clicks through lesson, practice, packet, teacher; reports errors/overflow
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const args=process.argv.slice(2);const who=args[0];let shots=null;const ns=[];
for(let i=1;i<args.length;i++){if(args[i]==='--shots'){shots=args[++i];}else ns.push(+args[i]);}
const D='/home/claude/kgh/building-blocks/'+who+'/';
(async()=>{const b=await chromium.launch();let bad=0;
for(const n of ns){const nn=String(n).padStart(2,'0');const errs=[];
 for(const w of [390,1100]){
 const p=await b.newPage({viewport:{width:w,height:860}});p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|formspree|net::/i.test(m.text()))errs.push('console '+m.text())});
 await p.route(/formspree|fonts\.g/,r=>r.abort());
 await p.goto('file://'+D+'lesson-'+nn+'.html');await p.evaluate(()=>{localStorage.setItem('kce_bb_teacher','1')});await p.reload();
 let k=0;const over=[];
 for(;k<40;k++){
   const sw=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);if(sw>2)over.push(k);
   // interact: answer mcqs correctly, sort, order, build
   await p.evaluate(()=>{const s=document.querySelector('.slide');if(!s)return;
     s.querySelectorAll('.ch').forEach(()=>{});});
   if(shots&&w===1100){await p.waitForTimeout(350);}if(shots&&w===1100)await p.screenshot({path:`${shots}/${who}${nn}_s${String(k).padStart(2,'0')}.png`,fullPage:true});
   const dis=await p.$eval('#next',e=>e.disabled);
   // check slide: answer all
   for(let g=0;g<40;g++){if(!(await p.$('#cq')))break;const nb=await p.$('#cq ~ .btn2');if(nb){await nb.click();continue;}
     const cq=await p.$('#cq .ch:not([disabled])');if(cq){await cq.click();await p.waitForTimeout(30);continue;}
     const fi=await p.$('#cq .fillin:not([disabled])');if(fi){await fi.fill('zz');await fi.press('Enter');await p.waitForTimeout(30);continue;}break;}
   if(dis)break;await p.click('#next');
 }
 if(over.length)errs.push(`overflow@${w} slides ${over}`);
 const res=await p.$eval('.slide',e=>e.innerText.slice(0,80)).catch(()=>'');
 await p.close();
 }
 // practice
 const p2=await b.newPage({viewport:{width:1100,height:860}});p2.on('pageerror',e=>errs.push('practice '+e.message));await p2.route(/formspree|fonts\.g/,r=>r.abort());
 await p2.goto('file://'+D+'practice-'+nn+'.html');
 for(let g=0;g<120;g++){const nb=await p2.$('#pq ~ .btn2');if(nb){await nb.click();continue;}const c=await p2.$('#pq .ch:not([disabled])');if(c){await c.click();continue;}const fi=await p2.$('#pq .fillin:not([disabled])');if(fi){await fi.fill('zz');await fi.press('Enter');continue;}break;}
 const pr=await p2.$eval('.slide',e=>e.innerText.slice(0,40)).catch(()=>'?');await p2.close();
 // packet
 const p3=await b.newPage({viewport:{width:1100,height:900}});p3.on('pageerror',e=>errs.push('packet '+e.message));await p3.route(/fonts\.g/,r=>r.abort());
 await p3.goto('file://'+D+'packet-'+nn+'.html');
 const ov=await p3.$$eval('.pg',ps=>ps.map((pg,i)=>{const pf=pg.querySelector('.pf').getBoundingClientRect().top;let max=0;pg.querySelectorAll('.sec,.it').forEach(e=>{max=Math.max(max,e.getBoundingClientRect().bottom)});return max>pf+1?('page'+(i+1)+' overflows by '+Math.round(max-pf+4)+'px'):null}).filter(Boolean));
 if(ov.length)errs.push('packet '+ov.join(','));
 const pdf=path.join('/tmp/claude-0/-home-claude/8e8b91af-f96e-5d06-ad23-b4e9bc04814f/scratchpad',`pk_${who}${nn}.pdf`);await p3.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
 const pages=(fs.readFileSync(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;const want=await p3.$$eval('.pg',x=>x.length);if(pages!==want)errs.push(`packet prints ${pages} pages, expected ${want}`);
 if(shots)await p3.screenshot({path:`${shots}/${who}${nn}_packet.png`,fullPage:true});
 await p3.close();
 // class lesson (if present)
 if(fs.existsSync(D+'class-'+nn+'.html')){const p5=await b.newPage({viewport:{width:1100,height:860}});p5.on('pageerror',e=>errs.push('class '+e.message));await p5.route(/fonts\.g|formspree/,r=>r.abort());
  await p5.goto('file://'+D+'class-'+nn+'.html');await p5.fill('#tp','9110');await p5.click('#to');let k5=0;
  for(;k5<40;k5++){if(shots)await p5.screenshot({path:`${shots}/${who}${nn}_class${String(k5).padStart(2,'0')}.png`,fullPage:true});if(await p5.$eval('#next',e=>e.disabled))break;await p5.click('#next');}
  const nn5=await p5.$$eval('.tnote',x=>x.length);await p5.close();}
 // teacher
 const p4=await b.newPage();await p4.route(/fonts\.g/,r=>r.abort());await p4.goto('file://'+D+'teacher-'+nn+'.html');
 const locked=await p4.$('.lockov');await p4.fill('#tp','9110');await p4.click('#to');const vis=await p4.$eval('#tbody',e=>getComputedStyle(e).display);if(!locked||vis!=='block')errs.push('teacher lock failed');await p4.close();
 console.log((errs.length?'FAIL ':'OK   ')+who+' L'+nn+' practice-end:'+JSON.stringify(pr)+' packet pages:'+pages+(errs.length?' '+JSON.stringify(errs):''));if(errs.length)bad++;
}
// course page
const pc=await b.newPage({viewport:{width:1200,height:900}});const ce=[];pc.on('pageerror',e=>ce.push(e.message));await pc.route(/fonts\.g/,r=>r.abort());await pc.goto('file://'+D+'index.html');if(shots)await pc.screenshot({path:`${shots}/${who}_course.png`,fullPage:false});
console.log('course page errors:',ce.length?ce:'none');await b.close();process.exit(bad?1:0);})();

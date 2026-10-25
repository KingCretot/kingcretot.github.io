const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w,h,tag] of [[390,844,'m'],[1100,900,'d']]) {
    const c = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor: w<500?2:1 });
    await c.addInitScript(() => { localStorage.setItem('kceDelfB2:name', JSON.stringify('Camille Dupont')); });
    const p = await c.newPage();
    await p.goto('file:///home/claude/kgh/delf-b2/week01.html');
    for (const [i,name,y] of [[0,'accueil',0],[3,'co1',0],[5,'co3',0],[6,'ce1',300],[8,'ce3',0],[9,'pe',0],[10,'po',0]]) {
      await p.click(`#stepper button[data-i="${i}"]`); await p.waitForTimeout(200);
      if (name==='co1') { await p.click('[data-act=read-start][data-rec=co1]'); await p.waitForTimeout(300); }
      await p.evaluate(y=>window.scrollTo(0, document.querySelector('#screen').offsetTop - 10 + y), y);
      await p.screenshot({ path: `/home/claude/delf/shots/view-${tag}-${name}.png` });
    }
  }
  await b.close();
})();

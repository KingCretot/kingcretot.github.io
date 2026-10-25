// End-to-end test of a KCE DELF B2 week page + hub in headless Chromium.
// Usage: node test_week.js 1   (serves /home/claude/kgh/delf-b2 on localhost:8799 or $PORT; screenshots -> /home/claude/delf/shots)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const N = parseInt(process.argv[2] || '1', 10), NN = String(N).padStart(2, '0');
const ROOT = '/home/claude/kgh/delf-b2', SHOTS = '/home/claude/delf/shots', PORT = +(process.env.PORT || 8799);
const BASE = `http://localhost:${PORT}/`;
const results = []; let failures = 0;
function check(name, cond, extra) { results.push((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  [' + extra + ']' : '')); if (!cond) failures++; }

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.mp3': 'audio/mpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
  const stat = fs.statSync(f), type = MIME[path.extname(f)] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {   // audio elements need range support
    const m = /bytes=(\d*)-(\d*)/.exec(range); const s = +m[1] || 0, e = m[2] ? +m[2] : stat.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${s}-${e}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1 });
    return fs.createReadStream(f, { start: s, end: e }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(f).pipe(res);
});

async function T(pg, sel) { const t = await pg.textContent(sel); return t == null ? t : t.replace(/[\u00A0\u202F]/g, ' '); }
function wordsPy(t) { return t.split(/[\s  ]+/).filter(x => /[\p{L}\p{N}]/u.test(x)).length; }

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const html = fs.readFileSync(path.join(ROOT, `week${NN}.html`), 'utf8');
  const D = JSON.parse(/<script type="application\/json" id="delf-data">([\s\S]*?)<\/script>/.exec(html)[1].replace(/<\\\//g, '</'));
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
  await ctx.grantPermissions(['microphone'], { origin: BASE.replace(/\/$/, '') });
  const payloads = [];
  await ctx.route('**/formspree.io/**', async route => {
    try { payloads.push(JSON.parse(route.request().postData() || '{}')); } catch (e) { payloads.push({ raw: route.request().postData() }); }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const idx = id => D.screens.findIndex(s => s.id === id);
  const go = async id => { await page.click(`#stepper button[data-i="${idx(id)}"]`); await page.waitForTimeout(150); };
  const shot = async name => page.screenshot({ path: `${SHOTS}/w${NN}-${name}.png`, fullPage: true });

  // ---------- hub
  await page.goto(BASE + 'index.html');
  check('hub: 12 week cards', (await page.$$('.wcard')).length === 12);
  check('hub: week 2-12 "Bientôt disponible"', (await page.$$('.wcard.soon')).length === 11);
  check('hub: "Commencer la semaine 1" button', (await page.$$eval('a[href="week01.html"]', as => as.filter(x => /Commencer la semaine 1/.test(x.textContent)).length)) >= 2);
  await shot('hub-desktop');

  // ---------- week page: name gate
  await page.goto(BASE + `week${NN}.html`);
  check('week: noindex meta', (await page.$('meta[name=robots][content="noindex,nofollow"]')) !== null);
  check('week: 12 screens in stepper', (await page.$$('#stepper button')).length === D.screens.length && D.screens.length === 12);
  await page.click('#screen [data-act=go][data-i="1"]');
  check('name gate blocks Next without name', (await T(page, '#screen')).includes('Entrez votre nom'));
  await page.fill('#nm', 'Test Élève');
  await page.click('[data-act=save-name]');
  check('name saved', (await T(page, '#toolbar')).includes('Test Élève'));
  await shot('01-accueil');

  // ---------- lexique
  await go('lexique');
  const lex = D.screens[idx('lexique')];
  for (let i = 0; i < lex.practice.items.length; i++) {
    const ans = i === 7 ? 'filigrane' : lex.practice.items[i].answer;    // one deliberate mistake
    await page.selectOption(`select[data-lex="${i}"]`, { label: ans });
  }
  await page.click('[data-act=lex-check]');
  check('lexique score 7/8', (await T(page, '#screen')).includes('Score : 7 / 8'));
  await shot('02-lexique');

  // ---------- grammar (variants accepted)
  await go('outils');
  const gr = D.screens[idx('outils')];
  const variants = { 2: 'circula', 8: 'Laquelle', 4: 'Ce qui', 1: "avait  déjà fait" };
  for (let i = 0; i < gr.exercise.items.length; i++) await page.fill(`input[data-gram="${i}"]`, variants[i] || gr.exercise.items[i].accept[0]);
  await page.click('[data-act=gram-check]');
  check('grammar 10/10 with variants (circula, Laquelle, capital, double space)', (await T(page, '#screen')).includes('Score : 10 / 10'));
  await shot('03-outils');

  // ---------- CO: play limits, persistence
  await go('co1');
  check('CO1: reading timer shown before playing', (await page.$('[data-act=read-start][data-rec=co1]')) !== null);
  await page.click('[data-act=read-start][data-rec=co1]');
  await page.waitForTimeout(1200);
  const clockTxt = await T(page, '[data-clock="read-co1"]');
  check('CO1: reading countdown running', /^0:5\d$/.test(clockTxt.trim()), clockTxt);
  await page.click('[data-act=read-skip][data-rec=co1]');
  await page.click('[data-act=play][data-rec=co1]');
  await page.waitForFunction(() => /Écoutes utilisées : 1/.test(document.querySelector('#pl-co1 .plays').textContent), null, { timeout: 15000 });
  check('CO1: play counted (1/2)', true);
  check('CO1: play button disabled while playing', await page.$eval('[data-act=play][data-rec=co1]', b => b.disabled));
  await page.reload(); await page.waitForTimeout(300);
  check('CO1: after reload, count persisted (écoute 2 sur 2)', (await T(page, '[data-act=play][data-rec=co1]')).includes('écoute 2 sur 2'));
  await page.click('[data-act=play][data-rec=co1]');
  await page.waitForFunction(() => /Écoutes utilisées : 2/.test(document.querySelector('#pl-co1 .plays').textContent), null, { timeout: 15000 });
  await page.reload(); await page.waitForTimeout(300);
  check('CO1: after 2 plays + reload, play disabled', await page.$eval('[data-act=play][data-rec=co1]', b => b.disabled && /terminées/.test(b.textContent)));
  await shot('04-co1');

  await go('co3');
  await page.click('[data-act=read-skip][data-rec=co3a]');
  await page.click('[data-act=play][data-rec=co3a]');
  await page.waitForFunction(() => /Écoutes utilisées : 1/.test(document.querySelector('#pl-co3a .plays').textContent), null, { timeout: 15000 });
  await page.reload(); await page.waitForTimeout(300);
  check('CO3a: single play enforced after reload', await page.$eval('[data-act=play][data-rec=co3a]', b => b.disabled));

  // answer all CO items: correct except two (one 1.5 + one 1)
  const coItems = D.screens.filter(s => s.section === 'co').flatMap(s => s.items.map(it => ({ it, sc: s })));
  const wrongCO = new Set([coItems[1].it.id, coItems[16].it.id]);   // weights per data
  let expCO = 0;
  for (const { it, sc } of coItems) {
    const a = wrongCO.has(it.id) ? (it.answer + 1) % 3 : it.answer;
    if (a === it.answer) expCO += it.weight;
    await go(sc.id);
    await page.check(`input[name="${it.id}"][value="${a}"]`);
  }
  await page.reload(); await page.waitForTimeout(300);
  await go('co1');
  check('MCQ selections restored after reload', await page.$eval(`input[name="${coItems[0].it.id}"][value="${coItems[0].it.answer}"]`, e => e.checked));
  await go('co3');
  await page.click('[data-act=submit][data-sec=co]');
  check('CO submit asks confirmation first', (await T(page, '#screen')).includes('Cliquez de nouveau'));
  await page.click('[data-act=submit][data-sec=co]');
  await page.waitForTimeout(400);
  const coScoreTxt = await T(page, '.scorebox .big');
  const fmt = x => (Math.round(x * 10) / 10).toString().replace('.', ',');
  check('CO score with exam weights', coScoreTxt.includes(fmt(expCO) + ' / 25'), coScoreTxt + ' expected ' + fmt(expCO));
  check('CO explanations shown', (await page.$$('#screen .mcq .expl')).length === 6);
  check('CO transcript + replay unlocked', (await page.$$('#screen audio[controls]')).length === 3 && (await page.$$('#screen details.transcript')).length === 3);
  await page.click('details.transcript summary');
  await shot('05-co3-results');
  const coPay = payloads.find(p => /CO/.test(p.part || ''));
  check('Formspree CO payload', coPay && coPay.student === 'Test Élève' && coPay.score === fmt(expCO) + '/25' && /Ex1 Q1/.test(coPay.answers) && /co1: 2\/2/.test(coPay.listens), coPay && coPay.score);
  await page.reload(); await page.waitForTimeout(300);
  check('CO stays submitted after reload', (await T(page, '.scorebox .big')).includes(fmt(expCO)));

  // ---------- CE
  await go('ce1');
  await page.click('[data-act=ce-timer]');
  await page.waitForTimeout(700);
  check('CE timer running', /^(59|60):\d\d$/.test((await T(page, '[data-clock=ce]')).trim()));
  await shot('06-ce1');
  const ceItems = D.screens.filter(s => s.section === 'ce').flatMap(s => s.items.map(it => ({ it, sc: s })));
  let expCE = 0; const wrongCE = new Set([ceItems[0].it.id, ceItems[19].it.id]);
  for (const { it, sc } of ceItems) {
    const a = wrongCE.has(it.id) ? (it.answer + 2) % 3 : it.answer;
    if (a === it.answer) expCE += it.weight;
    await go(sc.id);
    await page.check(`input[name="${it.id}"][value="${a}"]`);
  }
  await go('ce3');
  await shot('07-ce3');
  await page.click('[data-act=submit][data-sec=ce]'); await page.click('[data-act=submit][data-sec=ce]');
  await page.waitForTimeout(400);
  check('CE score with exam weights', (await T(page, '.scorebox .big')).includes(fmt(expCE) + ' / 25'), fmt(expCE));
  check('Formspree CE payload', payloads.some(p => /CE/.test(p.part || '') && p.score === fmt(expCE) + '/25'));

  // ---------- English toggle
  await page.click('[data-act=toggle-en]');
  check('English help toggle on', await page.evaluate(() => document.body.classList.contains('en-on')));
  await go('ce1');
  check('CE text English shown after submission', await page.$eval('article.doc .en', e => getComputedStyle(e).display !== 'none'));
  await shot('08-ce1-review-en');
  await page.click('[data-act=toggle-en]');

  // ---------- PE
  await go('pe');
  await page.click('[data-act=pe-start]');
  await page.waitForTimeout(600);
  check('PE timer 60 min running', /^(59|60):\d\d$/.test((await T(page, '[data-clock=pe]')).trim()));
  const shortTxt = "Bonjour à tous ! Je ne suis pas d'accord : l'anonymat protège les plus fragiles ; c'est-à-dire les victimes. « Vraiment ? » dira Marc. ";
  await page.fill('#essay', shortTxt);
  const shortN = wordsPy(shortTxt);
  check('PE word count matches DELF rule (punctuation not counted)', (await T(page, '#wcn')).trim() === shortN + ' mots', shortN + ' vs ' + await T(page, '#wcn'));
  check('PE <=124 warning', (await T(page, '#wcmsg')).includes('124 mots ou moins'));
  const model = D.screens[idx('pe')].model.paras.join('\n\n');
  await page.fill('#essay', model);
  check('PE count of model text equals builder count', (await T(page, '#wcn')).trim() === D.screens[idx('pe')].model.wordCount + ' mots');
  await page.check('input[data-chk="0"]');
  await page.reload(); await page.waitForTimeout(300);
  check('PE text + checklist restored after reload', (await page.inputValue('#essay')) === model && await page.$eval('input[data-chk="0"]', e => e.checked));
  await page.click('[data-act=pe-send]');
  check('PE send asks confirmation when checklist incomplete', (await T(page, '#screen')).includes('Cliquez de nouveau'));
  await page.click('[data-act=pe-send]');
  await page.waitForSelector('.model', { timeout: 5000 });
  const pePay = payloads.find(p => /PE/.test(p.part || ''));
  check('Formspree PE payload has full text, count, time, prompt id', pePay && pePay.essay === model && pePay.word_count === D.screens[idx('pe')].model.wordCount && pePay.prompt_id && /min/.test(pePay.time_used));
  check('PE model answer + grid shown after sending', (await page.$$('.model mark')).length >= 8 && (await T(page, '#screen')).includes('Morphosyntaxe'));
  await shot('09-pe-sent');

  // ---------- PO
  await go('po');
  await page.click('[data-act=po-choose][data-doc=A]');
  await page.click('[data-act=po-prep-start]');
  await page.waitForTimeout(600);
  check('PO prep timer running', /^(29|30):\d\d$/.test((await T(page, '[data-clock=prep]')).trim()));
  await page.fill('#po-notes', 'Problématique : confiance et IA. Plan en trois parties.');
  await page.click('[data-act=po-prep-end]');
  await page.click('[data-act=rec-start][data-key=mono]');
  await page.waitForSelector('#rec-mono.live', { timeout: 5000 });
  await page.waitForTimeout(2500);
  await page.click('[data-act=rec-stop]');
  await page.waitForSelector('#rec-mono audio', { timeout: 5000 });
  check('Monologue recorded (audio element present)', true);
  await page.fill('#tr-mono', 'Bonjour, je vais vous présenter ce document.');
  const qid = D.screens[idx('po')].docs[0].examiner[0].id;
  await page.click(`[data-act=po-q][data-q=${qid}]`);
  await page.waitForTimeout(500);
  await page.click(`[data-act=rec-start][data-key=${qid}]`);
  await page.waitForSelector(`#rec-${qid}.live`);
  await page.waitForTimeout(1500);
  await page.click('[data-act=rec-stop]');
  await page.waitForSelector(`#rec-${qid} audio`);
  await page.waitForTimeout(500);
  await page.reload(); await page.waitForTimeout(1200);
  check('Recordings restored after reload (IndexedDB)', (await page.$('#rec-mono audio')) !== null && (await page.$(`#rec-${qid} audio`)) !== null);
  check('PO notes + transcript restored', (await page.inputValue('#po-notes')).includes('Problématique') && (await page.inputValue('#tr-mono')).includes('présenter'));
  const recSize = await page.evaluate(() => JSON.parse(localStorage.getItem('kceDelfB2:' + JSON.parse(document.getElementById('delf-data').textContent).id)).po.rec.mono.size);
  check('Monologue blob non-empty', recSize > 1000, recSize + ' bytes');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=zip-dl]')]);
  const zp = '/tmp/claude-0/-home-claude/f389bcf2-92e3-5fb2-a4a5-3ff69b1be394/scratchpad/test-download.zip'; await dl.saveAs(zp);
  const zb = fs.readFileSync(zp);
  check('ZIP download valid (PK header, 2 files)', zb.readUInt32LE(0) === 0x04034b50 && zb.readUInt16LE(zb.length - 22 + 10) === 2, dl.suggestedFilename() + ' ' + zb.length + ' bytes');

  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=rec-dl][data-key=mono]')]);
  check('Single recording download', /monologue\.(webm|ogg|m4a)$/.test(dl2.suggestedFilename()), dl2.suggestedFilename());
  await shot('10-po-recorded');
  await page.click('[data-act=po-send]'); await page.click('[data-act=po-send]');
  await page.waitForTimeout(600);
  const poPay = payloads.find(p => /PO/.test(p.part || ''));
  check('Formspree PO payload (doc, notes, transcripts)', poPay && /Document A/.test(poPay.document) && /Problématique/.test(poPay.notes) && /présenter/.test(poPay.monologue_transcript) && /Q1/.test(poPay.interaction));
  check('PO model outline + expressions shown after sending', (await T(page, '#screen')).includes('Proposition de plan') && (await T(page, '#screen')).includes('Expressions utiles'));
  await shot('11-po-sent');

  // ---------- Bilan
  await go('bilan');
  const bt = await T(page, '#screen');
  check('Bilan shows CO/CE scores and sent dates', bt.includes(fmt(expCO) + ' / 25') && bt.includes(fmt(expCE) + ' / 25') && /Envoyée pour correction le \d\d\/\d\d\/\d{4}/.test(bt));
  check('Bilan pass rule', bt.includes('au moins 50 points sur 100') && bt.includes('au moins 5 sur 25'));
  check('Next week shown as coming soon', bt.includes('bientôt disponible'));
  await page.click('[data-act=bilan-send]'); await page.waitForTimeout(400);
  check('Formspree Bilan payload', payloads.some(p => p.part === 'Bilan' && p.co === fmt(expCO) + '/25'));
  await shot('12-bilan');

  // ---------- hub status
  await page.goto(BASE + 'index.html');
  check('Hub shows week 1 completed with scores', (await T(page, '#card-w01')).includes('Terminée') && (await T(page, '#card-w01')).includes('CO ' + fmt(expCO)));

  // ---------- mobile 390px: no horizontal scroll on any screen
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await m.addInitScript(st => { try { if (!localStorage.getItem('kceDelfB2:seeded')) { localStorage.setItem('kceDelfB2:seeded', '1'); localStorage.setItem('kceDelfB2:name', JSON.stringify('Test Élève')); localStorage.setItem(st.k, st.v); } } catch (e) {} },
    { k: 'kceDelfB2:' + D.id, v: await page.evaluate(id => localStorage.getItem('kceDelfB2:' + id), D.id) });
  const mp = await m.newPage();
  mp.on('pageerror', e => errors.push('mobile pageerror: ' + e.message));
  await mp.route('**/formspree.io/**', r => r.fulfill({ status: 200, body: '{}' }));
  await mp.goto(BASE + 'index.html');
  let over = [];
  const ow = async lbl => { const w = await mp.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)); if (w > 390) over.push(lbl + ':' + w); };
  await ow('hub'); await mp.screenshot({ path: `${SHOTS}/w${NN}-m-hub.png`, fullPage: true });
  await mp.goto(BASE + `week${NN}.html`);
  for (let i = 0; i < D.screens.length; i++) {
    await mp.click(`#stepper button[data-i="${i}"]`); await mp.waitForTimeout(120);
    await ow(D.screens[i].id);
    if (['accueil', 'co1', 'ce3', 'pe', 'po', 'bilan', 'lexique'].includes(D.screens[i].id)) await mp.screenshot({ path: `${SHOTS}/w${NN}-m-${D.screens[i].id}.png`, fullPage: true });
  }
  // fresh state on mobile for pre-submission CO view
  await mp.evaluate(id => { const s = JSON.parse(localStorage.getItem('kceDelfB2:' + id)); s.co.submitted = false; localStorage.setItem('kceDelfB2:' + id, JSON.stringify(s)); }, D.id);
  { const mp2 = await m.newPage(); await mp2.goto(BASE + `week${NN}.html`); await mp2.click(`#stepper button[data-i="${idx('co2')}"]`); await mp2.waitForTimeout(150);
    const w2 = await mp2.evaluate(() => document.documentElement.scrollWidth); if (w2 > 390) over.push('co2-pre:' + w2);
    await mp2.screenshot({ path: `${SHOTS}/w${NN}-m-co2-before.png`, fullPage: true }); await mp2.close(); }
  if (0) await mp.screenshot({ path: `${SHOTS}/w${NN}-m-co2-before.png`, fullPage: true });
  check('No horizontal scroll at 390px on any screen', over.length === 0, over.join(', '));

  // ---------- French spacing in rendered UI: no plain space before : ; ! ? on any screen
  const badSpace = [];
  for (let i = 0; i < D.screens.length; i++) {
    await mp.click(`#stepper button[data-i="${i}"]`); await mp.waitForTimeout(80);
    const t = await mp.evaluate(() => { const w = document.createTreeWalker(document.getElementById('screen'), NodeFilter.SHOW_TEXT); let n, out = [];
      while ((n = w.nextNode())) { if (n.parentNode.nodeName === 'TEXTAREA') continue; const m = n.nodeValue.match(/.{0,15} [;:!?\u00BB].{0,5}/); if (m) out.push(m[0]); } return out; });
    t.forEach(x => badSpace.push(D.screens[i].id + ': ' + x));
  }
  check('French non-breaking spaces everywhere in rendered text', badSpace.length === 0, badSpace.slice(0, 4).join(' | '));
  // ---------- threshold wording at exactly 5/25
  await mp.evaluate(id => { const s = JSON.parse(localStorage.getItem('kceDelfB2:' + id)); s.co.submitted = true; s.co.score = 5; localStorage.setItem('kceDelfB2:' + id, JSON.stringify(s)); }, D.id);
  const mp5 = await m.newPage(); await mp5.goto(BASE + `week${NN}.html`); await mp5.click(`#stepper button[data-i="${idx('bilan')}"]`); await mp5.waitForTimeout(150);
  const bt5 = await T(mp5, '#screen');
  check('Exactly 5/25 shows "Seuil de 5/25 atteint"; pass rule wording', bt5.includes('Seuil de 5/25 atteint') && bt5.includes('atteint ou dépasse 50') && /Semaine 2 — Le travail aujourd'hui/.test(bt5) && bt5.includes('(bientôt disponible)'), [bt5.includes('Seuil de 5/25 atteint'), bt5.includes('atteint ou dépasse 50'), /Semaine 2 — Le travail aujourd'hui/.test(bt5)].join());

  // ---------- localStorage blocked: name and answers still work in memory
  const bctx = await browser.newContext();
  await bctx.addInitScript(() => { const thrower = () => { throw new Error('blocked'); };
    Storage.prototype.getItem = thrower; Storage.prototype.setItem = thrower; Storage.prototype.removeItem = thrower; });
  const bp = await bctx.newPage();
  bp.on('pageerror', e => errors.push('blocked pageerror: ' + e.message));
  await bp.route('**/formspree.io/**', r => r.fulfill({ status: 200, body: '{}' }));
  await bp.goto(BASE + `week${NN}.html`);
  await bp.fill('#nm', 'Sans Stockage'); await bp.click('[data-act=save-name]');
  await bp.click('#screen [data-act=go][data-i="1"]'); await bp.waitForTimeout(150);
  const onLex = await bp.$('select[data-lex="0"]') !== null;
  await bp.selectOption('select[data-lex="0"]', { label: lex.practice.items[0].answer });
  await bp.click('[data-act=lex-check]');
  const lexOk = (await T(bp, '#screen')).includes('Score : 1 / 8');
  check('Storage blocked: name saves in memory, navigation and exercises work', onLex && lexOk && (await T(bp, '#toolbar')).includes('Sans Stockage') && (await T(bp, '#save-note')).includes('impossible'));

  // ---------- file:// works
  const fp = await (await browser.newContext()).newPage();
  fp.on('pageerror', e => errors.push('file pageerror: ' + e.message));
  await fp.goto('file://' + ROOT + `/week${NN}.html`);
  check('Works from file:// (renders)', (await fp.$$('#stepper button')).length === 12);

  check('No console errors / page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  console.log(results.join('\n'));
  console.log(`\n${results.length - failures}/${results.length} checks passed`);
  fs.writeFileSync(SHOTS + `/w${NN}-payloads.json`, JSON.stringify(payloads, null, 1));
  await browser.close(); server.close();
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); console.log(results.join('\n')); process.exit(2); });

/* KCE DELF B2 — shared engine for the course hub (index.html) and every weekly page (weekNN.html).
   Each week page contains ONE <script type="application/json" id="delf-data"> block (schema: SCHEMA.md);
   the hub contains <script type="application/json" id="delf-hub">. No external libraries.
   © 2026 KingCretot Experience. All rights reserved. */
(function () {
  'use strict';

  var CFG = { formspree: 'https://formspree.io/f/moevakrw', email: 'kce@kingcretot.com', ns: 'kceDelfB2' };

  /* ------------------------------------------------------------------ utilities */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fr(o) { return o == null ? '' : (typeof o === 'object' ? (o.fr || '') : String(o)); }
  function en(o) { return o && typeof o === 'object' ? (o.en || '') : ''; }
  function enDiv(o) { var t = en(o); return t ? '<div class="en">' + esc(t) + '</div>' : ''; }
  function enHtml(o) { var t = en(o); return t ? '<div class="en">' + t + '</div>' : ''; }
  function enI(o) { var t = en(o); return t ? ' <span class="en-i">(' + esc(t) + ')</span>' : ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function fmtDate(iso) { var d = iso ? new Date(iso) : new Date(); return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear(); }
  function num(x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); }
  function nowIso() { return new Date().toISOString(); }
  var LETTERS = ['A', 'B', 'C'];
  var WORDCHAR = (function () { try { return new RegExp('[\\p{L}\\p{N}]', 'u'); } catch (e) { return /[0-9A-Za-zÀ-ɏ]/; } })();
  /* DELF rule: a word is any group of characters between two spaces; isolated punctuation is not a word. */
  function countWords(t) {
    var toks = String(t || '').split(/[\s  ]+/), n = 0;
    for (var i = 0; i < toks.length; i++) if (WORDCHAR.test(toks[i])) n++;
    return n;
  }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[\s  ]+/g, ' ')
      .replace(/^[\s.,;:!?«»"]+|[\s.,;:!?«»"]+$/g, '').replace(/\s*'\s*/g, "'").trim();
  }
  /* French typography for rendered UI text (non-breaking space before ; : ! ? » and after «). Skips form fields. */
  function frSpace(root) {
    if (!root || !document.createTreeWalker) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) {
      var p = t.parentNode && t.parentNode.nodeName;
      if (p === 'TEXTAREA' || p === 'SCRIPT' || p === 'STYLE' || p === 'OPTION') return;
      var v = t.nodeValue, nv = v.replace(/ ([;:!?\u00BB])/g, '\u00A0$1').replace(/\u00AB /g, '\u00AB\u00A0');
      if (nv !== v) t.nodeValue = nv;
    });
  }
  function slug(s) {
    var t = String(s || '');
    try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return t.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'eleve';
  }

  /* ------------------------------------------------------------------ storage (always try/catch) */
  var storageOk = true;
  /* In-memory mirror: if localStorage is blocked (private mode, disabled site data), everything still works for the
     current page view; it just is not kept after a reload. */
  var MEM = {};
  var LS = {
    get: function (k) {
      try { var v = window.localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) {}
      return Object.prototype.hasOwnProperty.call(MEM, k) ? JSON.parse(MEM[k]) : null;
    },
    set: function (k, v) {
      MEM[k] = JSON.stringify(v);
      try { window.localStorage.setItem(k, MEM[k]); return true; } catch (e) { storageOk = false; return false; }
    },
    del: function (k) { delete MEM[k]; try { window.localStorage.removeItem(k); } catch (e) {} }
  };
  function getName() { return LS.get(CFG.ns + ':name') || ''; }
  function setName(n) { LS.set(CFG.ns + ':name', n); }
  function enOn() { return !!LS.get(CFG.ns + ':en'); }
  function applyEn() {
    document.body.classList.toggle('en-on', enOn());
    $all('.toggle-en').forEach(function (b) { b.setAttribute('aria-pressed', enOn() ? 'true' : 'false'); });
  }

  /* IndexedDB for recordings (blobs survive reload). Falls back to memory only. */
  var IDB = {
    db: null,
    open: function () {
      var self = this;
      if (self._p) return self._p;
      self._p = new Promise(function (res) {
        try {
          var r = indexedDB.open(CFG.ns, 1);
          r.onupgradeneeded = function () { r.result.createObjectStore('rec'); };
          r.onsuccess = function () { self.db = r.result; res(r.result); };
          r.onerror = function () { res(null); };
          r.onblocked = function () { res(null); };
        } catch (e) { res(null); }
      });
      return self._p;
    },
    op: function (mode, fn) {
      return this.open().then(function (db) {
        if (!db) return null;
        return new Promise(function (res) {
          try {
            var tx = db.transaction('rec', mode), st = tx.objectStore('rec'), q = fn(st);
            tx.oncomplete = function () { res(q && q.result !== undefined ? q.result : true); };
            tx.onerror = function () { res(null); };
            tx.onabort = function () { res(null); };
          } catch (e) { res(null); }
        });
      });
    },
    put: function (k, v) { return this.op('readwrite', function (s) { return s.put(v, k); }); },
    get: function (k) { return this.op('readonly', function (s) { return s.get(k); }); },
    del: function (k) { return this.op('readwrite', function (s) { return s.delete(k); }); }
  };

  /* Formspree */
  function send(payload) {
    if (typeof fetch !== 'function') return Promise.reject(new Error('fetch'));
    return fetch(CFG.formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return true; });
  }

  /* Week status (shared with the hub) */
  function weekStatus(st) {
    if (!st) return { key: 'new', fr: 'Non commencée', en: 'Not started', parts: 0 };
    var p = 0;
    if (st.co && st.co.submitted) p++;
    if (st.ce && st.ce.submitted) p++;
    if (st.pe && st.pe.sentAt) p++;
    if (st.po && st.po.sentAt) p++;
    if (p === 4) return { key: 'done', fr: 'Terminée', en: 'Completed', parts: p };
    return { key: 'prog', fr: 'En cours · ' + p + '/4 épreuves', en: 'In progress · ' + p + '/4 papers', parts: p };
  }

  /* Official grids (France Éducation international, grid in force since 2022) */
  var SCALE = [
    { s: 0, fr: 'non répondu ou production insuffisante', en: 'no answer or insufficient output' },
    { s: 1, fr: 'en dessous du niveau B2', en: 'below B2' },
    { s: 3, fr: 'au niveau B2', en: 'at B2' },
    { s: 5, fr: 'B2+', en: 'B2+' }
  ];
  var PE_GRID = [
    { fr: 'Réalisation de la tâche', d: 'argumentation claire en rapport avec la tâche', en: 'Task completion: a clear argument that answers the task' },
    { fr: 'Cohérence et cohésion', d: 'texte bien organisé, gamme de mots de liaison', en: 'Coherence and cohesion: well-organized text, range of linking words' },
    { fr: 'Adéquation sociolinguistique', d: 'adapter sa production au destinataire et au registre de la tâche', en: 'Sociolinguistic fit: adapting to the reader and to the register of the task' },
    { fr: 'Lexique', d: 'large gamme de vocabulaire, précision', en: 'Vocabulary: wide range, precision' },
    { fr: 'Morphosyntaxe', d: 'bon contrôle des structures complexes les plus fréquentes', en: 'Grammar: good control of the most common complex structures' }
  ];
  var PO_GRID = [
    { fr: 'Réalisation de la tâche — monologue suivi', d: 'dégager le problème, présenter une opinion argumentée et structurée', en: 'Task completion, monologue: identify the issue, present a structured, argued opinion' },
    { fr: 'Réalisation de la tâche — exercice en interaction', d: 'défendre son point de vue, réagir aux objections, nuancer', en: 'Task completion, interaction: defend your view, react to objections, nuance' },
    { fr: 'Lexique', d: 'étendue et maîtrise du vocabulaire', en: 'Vocabulary: range and control' },
    { fr: 'Morphosyntaxe', d: 'degré d\'élaboration des phrases, correction grammaticale', en: 'Grammar: sentence complexity and accuracy' },
    { fr: 'Maîtrise du système phonologique', d: 'prononciation, intonation, aisance', en: 'Pronunciation: sounds, intonation, fluency' }
  ];
  function gridHtml(grid, title, extraFr, extraEn) {
    var h = '<div class="card"><h3>' + esc(title) + '</h3>' +
      '<p>Chaque critère est noté <strong>0, 1, 3 ou 5</strong> (total sur 25) :</p><ul>';
    SCALE.forEach(function (x) { h += '<li><strong>' + x.s + '</strong> : ' + esc(x.fr) + enI(x) + '</li>'; });
    h += '</ul><div class="tablewrap"><table class="grid"><thead><tr><th>Critère</th><th>Ce que l\'examinateur attend</th></tr></thead><tbody>';
    grid.forEach(function (c) {
      h += '<tr><td><strong>' + esc(c.fr) + '</strong></td><td>' + esc(c.d) + '<span class="en">' + esc(c.en) + '</span></td></tr>';
    });
    h += '</tbody></table></div>';
    if (extraFr) h += '<p class="small">' + extraFr + '</p>' + (extraEn ? '<div class="en">' + extraEn + '</div>' : '');
    return h + '</div>';
  }

  /* ZIP (store, no compression) so all oral recordings can be downloaded as one file */
  var CRC_T = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function blobBuf(b) {
    if (b.arrayBuffer) return b.arrayBuffer();
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsArrayBuffer(b); });
  }
  function makeZip(files) {
    return Promise.all(files.map(function (f) { return blobBuf(f.blob); })).then(function (bufs) {
      var parts = [], central = [], offset = 0, d = new Date();
      var dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
      var dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
      files.forEach(function (f, i) {
        var data = new Uint8Array(bufs[i]), name = new TextEncoder().encode(f.name), crc = crc32(data);
        var h = new DataView(new ArrayBuffer(30));
        h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
        h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true);
        h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
        parts.push(h.buffer, name, data);
        var c = new DataView(new ArrayBuffer(46));
        c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
        c.setUint16(10, 0, true); c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true);
        c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true);
        c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true);
        c.setUint32(38, 0, true); c.setUint32(42, offset, true);
        central.push(c.buffer, name);
        offset += 30 + name.length + data.length;
      });
      var csize = central.reduce(function (a, b) { return a + (b.byteLength || b.length); }, 0);
      var e = new DataView(new ArrayBuffer(22));
      e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
      e.setUint32(12, csize, true); e.setUint32(16, offset, true);
      return new Blob(parts.concat(central, [e.buffer]), { type: 'application/zip' });
    });
  }
  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  function extFor(type) { type = type || ''; if (type.indexOf('ogg') >= 0) return 'ogg'; if (type.indexOf('mp4') >= 0 || type.indexOf('aac') >= 0) return 'm4a'; return 'webm'; }

  /* ================================================================== HUB */
  function initHub() {
    var H = JSON.parse($('#delf-hub').textContent);
    if (H.formspree) CFG.formspree = H.formspree;
    var bar = $('#hub-toolbar');
    function renderBar() {
      if (!bar) return;
      var nm = getName();
      bar.innerHTML = '<span class="idbadge">' + (nm ? 'Élève : <strong>' + esc(nm) + '</strong>' : 'Votre nom sera demandé au début de la semaine 1') +
        ' · ' + fmtDate() + '</span><span class="spacer"></span>' +
        '<button type="button" class="toggle-en" aria-pressed="false" data-act="toggle-en">EN · Aide en anglais</button>';
      applyEn();
    }
    renderBar();
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="toggle-en"]');
      if (b) { LS.set(CFG.ns + ':en', !enOn()); applyEn(); }
    });
    var box = $('#weeks');
    var h = '';
    H.weeks.forEach(function (w) {
      var st = LS.get(CFG.ns + ':' + w.id), s = weekStatus(st), meta = '';
      if (st && st.co && st.co.submitted) meta += 'CO ' + num(st.co.score) + '/25 · ';
      if (st && st.ce && st.ce.submitted) meta += 'CE ' + num(st.ce.score) + '/25 · ';
      if (st && st.pe && st.pe.sentAt) meta += 'PE envoyée · ';
      if (st && st.po && st.po.sentAt) meta += 'PO envoyée · ';
      meta = meta.replace(/ · $/, '');
      var badge = !w.available ? '<span class="badge gray">Bientôt disponible</span>' :
        (s.key === 'done' ? '<span class="badge green">' + s.fr + '</span>' : s.key === 'prog' ? '<span class="badge gold">' + s.fr + '</span>' : '<span class="badge navy">' + s.fr + '</span>');
      h += '<article class="wcard' + (w.available ? '' : ' soon') + (w.mock ? ' mock' : '') + '" id="card-' + esc(w.id) + '">' +
        '<div class="wn">Semaine ' + w.n + (w.mock ? ' · Examen blanc' : '') + '</div>' +
        '<h3>' + esc(w.theme.fr) + '</h3>' + '<div class="en">' + esc(w.theme.en) + '</div>' +
        (w.tools ? '<div class="meta"><strong>Outils de langue :</strong> ' + esc(w.tools) + '</div>' : '') +
        (w.genre ? '<div class="meta"><strong>Production écrite :</strong> ' + esc(w.genre) + '</div>' : '') +
        (w.strategy ? '<div class="meta"><strong>Stratégie :</strong> ' + esc(w.strategy) + '</div>' : '') +
        (meta ? '<div class="meta">' + esc(meta) + '</div>' : '') +
        '<div class="foot-row">' + badge +
        (w.available ? '<a class="btn" href="' + esc(w.href) + '">' + (s.key === 'new' ? 'Commencer la semaine ' + w.n : 'Continuer la semaine ' + w.n) + '</a>' : '<span class="btn disabled" aria-disabled="true">Bientôt disponible</span>') +
        '</div></article>';
    });
    box.innerHTML = h;
    frSpace(box);
  }

  /* ================================================================== WEEK PAGE */
  var D, S, KEY, APP, cur = 0;
  var REC_INDEX = {};          // recording id -> {rec, screen}
  var AUD = {}, PLAYING = {};  // exam-mode audio objects
  var BLOBS = {}, URLS = {};   // oral recordings
  var REC = null;              // active recorder
  var SR = null, srOff = false;
  var pending = {};            // two-step confirmations
  var ui = { nameError: false, msg: {} };
  var EXAM_AUDIO = null;

  function freshState() {
    return { v: 1, screen: 0, visited: {}, lex: { a: {}, checked: false }, gram: { a: {}, checked: false },
      co: { a: {}, plays: {}, read: {}, submitted: false }, ce: { a: {}, submitted: false, timerStart: null },
      pe: { text: '', timerStart: null, checks: {}, sentAt: null }, po: { doc: null, prepStart: null, prepEnd: null, notes: '', rec: {}, tr: {}, sentAt: null },
      bilan: { sentAt: null }, sends: {} };
  }
  function merge(a, b) {
    if (!b || typeof b !== 'object') return a;
    Object.keys(b).forEach(function (k) {
      if (a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) && b[k] && typeof b[k] === 'object') merge(a[k], b[k]);
      else a[k] = b[k];
    });
    return a;
  }
  var saveTimer = null;
  function save() {
    S.updated = nowIso();
    var ok = LS.set(KEY, S);
    var n = $('#save-note');
    if (n) n.textContent = ok ? 'Progression enregistrée sur cet appareil' : 'Sauvegarde impossible (navigation privée ?)';
  }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
  function mock() { return D.mode === 'mock'; }
  function sectionScreens(sec) { return D.screens.filter(function (s) { return s.section === sec; }); }
  function stState(sec) { return S[sec]; }

  function initWeek() {
    D = JSON.parse($('#delf-data').textContent);
    if (D.formspree) CFG.formspree = D.formspree;
    KEY = CFG.ns + ':' + D.id;
    S = merge(freshState(), LS.get(KEY) || {});
    D.screens.forEach(function (sc, i) {
      (sc.recordings || []).forEach(function (r) { REC_INDEX[r.id] = { rec: r, screen: sc, index: i }; });
    });
    APP = $('#delf-app');
    APP.innerHTML = '<div class="toolbar" id="toolbar"></div><nav class="stepper" id="stepper" aria-label="Étapes de la semaine"></nav><section id="screen"></section>';
    APP.addEventListener('click', onClick);
    APP.addEventListener('change', onChange);
    APP.addEventListener('input', onInput);
    applyEn();
    cur = Math.min(S.screen || 0, D.screens.length - 1);
    if (!getName()) cur = 0;
    show(cur, false);
    setInterval(tick, 500);
    loadBlobs();
    window.addEventListener('beforeunload', function () { if (REC) { try { REC.mr.stop(); } catch (e) {} } save(); });
  }

  function loadBlobs() {
    var keys = Object.keys(S.po.rec || {});
    keys.forEach(function (k) {
      IDB.get(D.id + ':' + k).then(function (v) {
        if (v && v.blob) {
          BLOBS[k] = v.blob;
          if (D.screens[cur].type === 'po') rerenderRec(k);
        }
      });
    });
  }

  /* ---------------- navigation */
  function isDone(sc) {
    switch (sc.type) {
      case 'welcome': return !!getName();
      case 'lexicon': return S.lex.checked;
      case 'grammar': return S.gram.checked;
      case 'co': return S.co.submitted;
      case 'ce': case 'ce3': return S.ce.submitted;
      case 'pe': return !!S.pe.sentAt;
      case 'po': return !!S.po.sentAt;
      case 'bilan': return !!S.bilan.sentAt;
    }
    return false;
  }
  function show(i, scroll) {
    if (i < 0 || i >= D.screens.length) return;
    if (i !== 0 && !getName()) { ui.nameError = true; i = 0; }
    if (REC && i !== cur) stopRec();
    cur = i; S.screen = i; S.visited[D.screens[i].id] = true; save();
    if (mock()) autoTimers(D.screens[i]);
    renderToolbar(); renderStepper(); renderScreen();
    if (scroll !== false) { try { window.scrollTo({ top: APP.offsetTop - 6, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, APP.offsetTop); } }
  }
  function renderToolbar() {
    var nm = getName();
    $('#toolbar').innerHTML = '<a class="btn ghost small" href="' + esc(D.hub || 'index.html') + '">← Toutes les semaines</a>' +
      '<span class="idbadge">' + (nm ? 'Élève : <strong>' + esc(nm) + '</strong>' : 'Élève : —') + ' · ' + fmtDate() + '</span>' +
      '<span class="spacer"></span>' +
      '<button type="button" class="toggle-en" data-act="toggle-en" aria-pressed="' + (enOn() ? 'true' : 'false') + '">EN · Aide en anglais</button>' +
      '<span class="save-note" id="save-note" aria-live="polite"></span>';
  }
  function renderStepper() {
    var h = '';
    D.screens.forEach(function (sc, i) {
      var cls = (i === cur ? 'on' : '') + (isDone(sc) ? ' done' : '');
      h += '<button type="button" class="' + cls + '" data-act="go" data-i="' + i + '"' + (i === cur ? ' aria-current="step"' : '') +
        ' aria-label="' + esc((i + 1) + '. ' + fr(sc.label)) + '"><span class="dot">' + (isDone(sc) && i !== cur ? '✓' : (i + 1)) + '</span><span class="lbl">' + esc(fr(sc.label)) + '</span></button>';
    });
    var st = $('#stepper'); st.innerHTML = h;
    var on = $('button.on', st); if (on && on.scrollIntoView) { try { st.scrollLeft = on.offsetLeft - st.clientWidth / 2 + on.clientWidth / 2; } catch (e) {} }
  }
  function navRow() {
    var prev = cur > 0 ? '<button type="button" class="btn ghost" data-act="go" data-i="' + (cur - 1) + '">← Précédent</button>' : '<span></span>';
    var next = cur < D.screens.length - 1 ? '<button type="button" class="btn" data-act="go" data-i="' + (cur + 1) + '">Suivant →</button>' :
      '<a class="btn" href="' + esc(D.hub || 'index.html') + '">Retour au cours</a>';
    return '<div class="navrow">' + prev + next + '</div>';
  }
  function renderScreen() {
    var sc = D.screens[cur];
    var fn = R[sc.type];
    $('#screen').innerHTML = (fn ? fn(sc) : '<div class="card">Écran inconnu</div>') + navRow();
    frSpace($('#screen'));
    tick();
  }
  function head(eyebrow, title, sub) {
    return '<div class="card pagehead"><p class="eyebrow">' + esc(eyebrow) + '</p><h2>' + esc(fr(title)) + '</h2>' +
      (en(title) ? '<div class="en">' + esc(en(title)) + '</div>' : '') + (sub ? sub : '') + '</div>';
  }
  function wk() { return mock() ? fr(D.title) : 'Semaine ' + D.week; }

  /* ---------------- screen renderers */
  var R = {};

  R.welcome = function (sc) {
    var nm = getName(), total = 0;
    var h = head(wk() + ' · Accueil', D.title, '<p>' + esc(fr(D.subtitle)) + '</p>' + enDiv(D.subtitle));
    h += '<div class="card"><p>' + esc(fr(sc.intro)) + '</p>' + enDiv(sc.intro) + '</div>';
    h += '<div class="card namegate"><h3>Votre nom</h3><label for="nm">Prénom et nom (il apparaîtra sur tout ce que vous envoyez)</label>' +
      '<div class="en">First and last name (it appears on everything you send). It is saved for the whole course.</div>' +
      '<div class="btnrow"><input type="text" id="nm" autocomplete="name" value="' + esc(nm) + '" aria-describedby="nm-msg"><button type="button" class="btn" data-act="save-name">Enregistrer</button></div>' +
      '<div id="nm-msg" aria-live="polite">' + (ui.nameError && !nm ? '<p class="err">Entrez votre nom pour commencer la semaine.</p>' :
        nm ? '<p class="note green">Bonjour, ' + esc(nm) + ' ! Votre nom est enregistré pour tout le cours.</p>' : '') + '</div></div>';
    if (sc.objectives) {
      h += '<div class="card"><h3>Objectifs de la semaine</h3><ul>';
      sc.objectives.forEach(function (o) { h += '<li>' + esc(fr(o)) + '<span class="en">' + esc(en(o)) + '</span></li>'; });
      h += '</ul></div>';
    }
    if (sc.plan) {
      h += '<div class="card"><h3>Votre plan de travail</h3><div class="tablewrap"><table class="fmt"><thead><tr><th>Étape</th><th>Temps conseillé</th></tr></thead><tbody>';
      sc.plan.forEach(function (p) { total += p.min; h += '<tr><td>' + esc(p.fr) + '<span class="en">' + esc(p.en) + '</span></td><td>' + p.min + ' min</td></tr>'; });
      h += '<tr><td><strong>Total</strong></td><td><strong>' + Math.floor(total / 60) + ' h ' + pad(total % 60) + '</strong></td></tr></tbody></table></div>' +
        '<p class="small">Vous pouvez travailler en plusieurs fois : tout est enregistré automatiquement sur cet appareil.</p>' +
        '<div class="en">You can work in several sittings: everything is saved automatically on this device.</div></div>';
    }
    if (sc.strategy) h += '<div class="card"><h3>' + esc(fr(sc.strategy.title)) + '</h3>' + enDiv(sc.strategy.title) + '<div class="lesson-body">' + fr(sc.strategy.html) + '</div>' + enHtml(sc.strategy.html) + '</div>';
    return h;
  };

  R.lexicon = function (sc) {
    var h = head(wk() + ' · Lexique', sc.label, '<p>' + esc(fr(sc.intro)) + '</p>' + enDiv(sc.intro));
    sc.groups.forEach(function (g) {
      h += '<div class="card"><h3>' + esc(fr(g.title)) + enI(g.title) + '</h3><div class="lex">';
      g.items.forEach(function (it) {
        h += '<div class="lex-item"><div class="t" lang="fr">' + esc(it.fr) + '</div><div class="tr">' + esc(it.en) + '</div>' +
          '<div class="exs" lang="fr">' + esc(it.ex) + '</div>' + (it.exEn ? '<div class="en">' + esc(it.exEn) + '</div>' : '') + '</div>';
      });
      h += '</div></div>';
    });
    var p = sc.practice, bank = p.bank.slice().sort(function (a, b) { return a.localeCompare(b, 'fr'); }), score = 0;
    h += '<div class="card"><h3>Exercice</h3><p>' + esc(fr(p.instructions)) + '</p>' + enDiv(p.instructions) +
      '<div class="bank" aria-label="Expressions">' + bank.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div>';
    p.items.forEach(function (it, i) {
      var val = S.lex.a[i] || '', ok = val === it.answer, chk = S.lex.checked;
      if (chk && ok) score++;
      var sel = '<select data-lex="' + i + '" aria-label="Réponse ' + (i + 1) + '"><option value="">— choisir —</option>' +
        bank.map(function (b) { return '<option' + (b === val ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join('') + '</select>';
      var parts = esc(it.text).split('___');
      h += '<div class="fill' + (chk ? (ok ? ' ok' : ' bad') : '') + '"><span class="num">' + (i + 1) + '.</span>' + parts[0] + sel + (parts[1] || '') +
        (it.en ? '<div class="en">' + esc(it.en) + '</div>' : '') +
        (chk ? '<div class="fb"><span class="verdict">' + (ok ? '✓ Correct.' : '✗ Réponse attendue : « ' + esc(it.answer) + ' ».') + '</span> ' + esc(fr(it.explain)) + enDiv(it.explain) + '</div>' : '') + '</div>';
    });
    if (S.lex.checked) h += '<p class="score-line" aria-live="polite">Score : ' + score + ' / ' + p.items.length + '</p>';
    h += '<div class="btnrow"><button type="button" class="btn gold" data-act="lex-check">Vérifier mes réponses</button>' +
      (S.lex.checked ? '<button type="button" class="btn ghost" data-act="lex-reset">Recommencer l\'exercice</button>' : '') + '</div></div>';
    return h;
  };

  function gramOk(it, val) {
    var v = norm(val);
    return !!v && it.accept.some(function (a) { return norm(a) === v; });
  }
  R.grammar = function (sc) {
    var h = head(wk() + ' · Outils de langue', sc.label, '<p>' + esc(fr(sc.intro)) + '</p>' + enDiv(sc.intro));
    sc.lessons.forEach(function (l, i) {
      h += '<details class="lesson"' + (i === 0 ? ' open' : '') + '><summary>' + esc(fr(l.title)) + '</summary><div class="lesson-body">' +
        (en(l.title) ? '<div class="en">' + esc(en(l.title)) + '</div>' : '') + fr(l.html) + enHtml(l.html) + '</div></details>';
    });
    var ex = sc.exercise, score = 0, chk = S.gram.checked;
    h += '<div class="card"><h3>Exercice d\'application (10 phrases)</h3><p>' + esc(fr(ex.instructions)) + '</p>' + enDiv(ex.instructions);
    ex.items.forEach(function (it, i) {
      var val = S.gram.a[i] || '', ok = gramOk(it, val);
      if (chk && ok) score++;
      var input = '<input type="text" data-gram="' + i + '" value="' + esc(val) + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Réponse ' + (i + 1) + '"' + (it.verb ? ' placeholder="' + esc(it.verb) + '"' : '') + '>';
      h += '<div class="fill' + (chk ? (ok ? ' ok' : ' bad') : '') + '"><span class="num">' + (i + 1) + '.</span>' +
        (it.before ? esc(it.before) + ' ' : '') + input + (it.verb ? ' <em>(' + esc(it.verb) + ')</em>' : '') + ' ' + esc(it.after) +
        (it.en ? '<div class="en">' + esc(it.en) + '</div>' : '') +
        (chk ? '<div class="fb"><span class="verdict">' + (ok ? '✓ Correct.' : '✗ Réponse' + (it.accept.length > 1 ? 's acceptées' : ' attendue') + ' : ' + it.accept.map(function (a) { return '« ' + esc(a) + ' »'; }).join(' ou ') + '.') +
          '</span> ' + esc(fr(it.explain)) + enDiv(it.explain) + '</div>' : '') + '</div>';
    });
    if (chk) h += '<p class="score-line" aria-live="polite">Score : ' + score + ' / ' + ex.items.length + '</p>';
    h += '<div class="btnrow"><button type="button" class="btn gold" data-act="gram-check">Vérifier mes réponses</button>' +
      (chk ? '<button type="button" class="btn ghost" data-act="gram-reset">Recommencer l\'exercice</button>' : '') + '</div></div>';
    return h;
  };

  /* ----- MCQ + scoring */
  function scoreSection(sec) {
    var res = { total: 0, max: 0, ex: {}, items: [] }, st = S[sec];
    sectionScreens(sec).forEach(function (sc) {
      if (!sc.items) return;
      var e = res.ex[sc.ex] = res.ex[sc.ex] || { pts: 0, max: 0 };
      sc.items.forEach(function (it, k) {
        var ch = st.a[it.id], ok = ch === it.answer;
        e.max += it.weight; res.max += it.weight;
        if (ok) { e.pts += it.weight; res.total += it.weight; }
        res.items.push({ id: it.id, ex: sc.ex, n: k + 1, w: it.weight, chosen: ch, answer: it.answer, ok: ok, it: it, sc: sc });
      });
    });
    return res;
  }
  function optLabel(sc, k) {
    if (sc.type === 'ce3') { var o = sc.doc.opinions[k]; return o.label + ' (' + o.name + ')'; }
    return LETTERS[k];
  }
  function mcqHtml(sc, it, n, sec) {
    var st = S[sec], sub = st.submitted, ch = st.a[it.id], showEn = !mock() || sub;
    var opts = sc.type === 'ce3' ? sc.doc.opinions.map(function (o) { return { fr: o.name, en: '' }; }) : it.options;
    var cls = sub ? (ch === it.answer ? ' res-ok' : ' res-bad') : '';
    var h = '<fieldset class="mcq' + cls + '" id="q-' + esc(it.id) + '"><legend class="sr">Question ' + n + '</legend><div class="qh"><span class="qt">' + n + '. ' + esc(fr(it.q)) + '</span>' +
      '<span class="pts">' + num(it.weight) + ' pt' + (it.weight > 1 ? 's' : '') + '</span></div>' + (showEn ? enDiv(it.q) : '');
    opts.forEach(function (o, k) {
      var oc = sub ? (k === it.answer ? ' is-correct' : (k === ch ? ' is-wrong' : '')) : '';
      h += '<label class="opt' + oc + '"><input type="radio" name="' + esc(it.id) + '" value="' + k + '" data-sec="' + sec + '"' + (ch === k ? ' checked' : '') + (sub ? ' disabled' : '') + '>' +
        '<span class="L">' + LETTERS[k] + '</span><span>' + esc(fr(o)) + (showEn && en(o) ? ' <span class="en-i">(' + esc(en(o)) + ')</span>' : '') + '</span></label>';
    });
    if (sub) {
      h += '<div class="expl"><span class="verdict">' + (ch === it.answer ? '✓ Bonne réponse.' : (ch == null ? '✗ Pas de réponse.' : '✗ Réponse incorrecte.')) +
        ' Réponse : ' + esc(optLabel(sc, it.answer)) + '.</span> ' + esc(fr(it.explain)) + enDiv(it.explain) + '</div>';
    }
    return h + '</fieldset>';
  }
  function scoreBox(sec, title) {
    var r = scoreSection(sec), det = Object.keys(r.ex).map(function (k) { return 'Exercice ' + k + ' : ' + num(r.ex[k].pts) + '/' + num(r.ex[k].max); }).join(' · ');
    return '<div class="scorebox" role="status"><div><div class="det">' + esc(title) + '</div><div class="big">' + num(r.total) + ' / 25</div></div><div class="det">' + det +
      '<br>' + (r.total > 5 ? 'Au-dessus du seuil éliminatoire de 5/25.' : r.total === 5 ? 'Seuil de 5/25 atteint.' : 'Attention : en dessous de 5/25, l\'épreuve est éliminatoire.') + '</div></div>';
  }
  function submitArea(sec) {
    var st = S[sec];
    if (st.submitted) {
      var sent = S.sends[sec];
      return '<div class="card"><p class="note green">Réponses validées le ' + fmtDate(st.at) + '. Les explications sont affichées sous chaque question' + (sec === 'co' ? ', et vous pouvez réécouter les enregistrements autant que vous voulez avec leur transcription.' : '.') + '</p>' +
        '<div class="en">Answers submitted. Explanations appear under each question' + (sec === 'co' ? '; you can now replay the recordings as often as you like, with the transcript.' : '.') + '</div>' +
        (sent && sent.error ? '<p class="small">Le résultat n\'a pas pu être transmis à KCE (' + esc(sent.error) + ').</p><button type="button" class="btn ghost small" data-act="resend" data-sec="' + sec + '">Réessayer l\'envoi du résultat</button>' : '') + '</div>';
    }
    var r = scoreSection(sec), missing = r.items.filter(function (x) { return x.chosen == null; }).length;
    var warn = '';
    if (pending[sec]) {
      warn = '<p class="note red" role="alert">' + (missing ? 'Il reste ' + missing + ' question' + (missing > 1 ? 's' : '') + ' sans réponse. ' : '') +
        'Après validation, vous ne pourrez plus modifier vos réponses. Cliquez de nouveau pour confirmer.</p>';
    }
    var label = sec === 'co' ? 'Valider la compréhension de l\'oral (3 exercices)' : 'Valider la compréhension des écrits (3 exercices)';
    return '<div class="card"><h3>Validation</h3><p>Vous avez répondu à ' + (r.items.length - missing) + ' question' + ((r.items.length - missing) > 1 ? 's' : '') + ' sur ' + r.items.length + '. La note sur 25 est calculée avec le barème officiel (1,5 ou 1 point par question).</p>' +
      '<div class="en">You have answered ' + (r.items.length - missing) + ' of ' + r.items.length + ' questions. The score out of 25 uses the official weighting (1.5 or 1 point per item).</div>' + warn +
      '<div class="btnrow"><button type="button" class="btn gold" data-act="submit" data-sec="' + sec + '">' + label + '</button></div></div>';
  }

  /* ----- CO */
  function recLabel(r) { return (r.label ? fr(r.label) + ' · ' : '') + fr(r.genre); }
  function readState(id) {
    var info = REC_INDEX[id], sec = info.screen.readSeconds || 0, rs = S.co.read[id];
    if (!sec) return { done: true };
    if (!rs) return { started: false, done: false, sec: sec };
    if (rs.skip || rs.done) return { done: true };
    var left = sec - (Date.now() - rs.start) / 1000;
    if (left <= 0) { rs.done = true; save(); return { done: true }; }
    return { started: true, done: false, left: left, sec: sec };
  }
  function playerHtml(r) {
    var sub = S.co.submitted, plays = S.co.plays[r.id] || 0, max = r.maxPlays || 2;
    var dur = r.duration ? (Math.floor(r.duration / 60) ? Math.floor(r.duration / 60) + ' min ' : '') + pad(Math.round(r.duration % 60)) + ' s' : '';
    var h = '<div class="player" id="pl-' + esc(r.id) + '"><div class="ph"><span class="gname">' + esc(recLabel(r)) + '</span><span class="meta">' + (dur ? 'Durée : ' + dur + ' · ' : '') +
      (max === 1 ? 'UNE seule écoute' : max + ' écoutes') + '</span></div>';
    if (sub) {
      h += '<p class="small">Source : ' + esc(fr(r.source)) + '</p><audio controls preload="none" src="' + esc(D.audioBase + r.file) + '"></audio>' +
        '<details class="transcript"><summary>Transcription' + (enOn() ? ' (avec traduction)' : '') + '</summary><div class="tbody">';
      r.segments.forEach(function (s) {
        var sp = r.speakers[s.spk] || { name: s.spk };
        h += '<p class="seg"><span class="who">' + esc(sp.name) + ' :</span> ' + esc(s.fr) + '</p>' + (s.en ? '<div class="en">' + esc(s.en) + '</div>' : '');
      });
      return h + '</div></details></div>';
    }
    var rs = readState(r.id);
    if (!rs.done) {
      if (!rs.started) {
        h += '<div class="reading"><span>Temps de lecture des questions : <span class="clock">' + mmss(rs.sec) + '</span></span>' +
          '<button type="button" class="btn gold small" data-act="read-start" data-rec="' + esc(r.id) + '">Commencer la lecture</button>' +
          '<button type="button" class="btn ghost small" data-act="read-skip" data-rec="' + esc(r.id) + '">Passer</button></div>' +
          '<div class="en">Reading time: read the questions below before the recording starts.</div>';
      } else {
        h += '<div class="reading"><span>Lisez les questions : <span class="clock" data-clock="read-' + esc(r.id) + '">' + mmss(rs.left) + '</span></span>' +
          '<button type="button" class="btn ghost small" data-act="read-skip" data-rec="' + esc(r.id) + '">Je suis prêt(e)</button></div>';
      }
      return h + '</div>';
    }
    var anyPlaying = Object.keys(PLAYING).some(function (k) { return PLAYING[k]; });
    var left = max - plays, playing = !!PLAYING[r.id];
    var label = playing ? 'Lecture en cours…' : left <= 0 ? 'Écoutes terminées' : '▶ Écouter' + (max > 1 ? ' (écoute ' + (plays + 1) + ' sur ' + max + ')' : ' (une seule écoute)');
    h += '<div class="btnrow"><button type="button" class="btn" data-act="play" data-rec="' + esc(r.id) + '"' + (left <= 0 || anyPlaying ? ' disabled' : '') + '>' + label + '</button></div>' +
      '<div class="bar" aria-hidden="true"><i id="bar-' + esc(r.id) + '"' + (playing ? '' : ' style="width:' + (left <= 0 ? 100 : 0) + '%"') + '></i></div>' +
      '<p class="plays" aria-live="polite">Écoutes utilisées : ' + plays + ' / ' + max + (left > 0 && plays > 0 ? ' · il vous reste ' + left + ' écoute' + (left > 1 ? 's' : '') : '') + '</p>' +
      '<p class="small">Comme à l\'examen, l\'enregistrement ne peut pas être mis en pause. Le nombre d\'écoutes est enregistré, même si vous rechargez la page.</p>' +
      '<div class="en">As in the exam, the recording cannot be paused. Your listens are saved, even if you reload the page.</div>' +
      '<p class="err" id="perr-' + esc(r.id) + '"></p>';
    return h + '</div>';
  }
  function updatePlayer(id) {
    var el = document.getElementById('pl-' + id);
    if (el) { el.outerHTML = playerHtml(REC_INDEX[id].rec); frSpace(document.getElementById('pl-' + id)); }
    Object.keys(REC_INDEX).forEach(function (k) {
      if (k !== id) { var o = document.getElementById('pl-' + k); if (o && !S.co.submitted) o.outerHTML = playerHtml(REC_INDEX[k].rec); }
    });
  }
  function playRec(id) {
    var r = REC_INDEX[id].rec, n = S.co.plays[id] || 0, max = r.maxPlays || 2;
    if (S.co.submitted || n >= max || Object.keys(PLAYING).some(function (k) { return PLAYING[k]; })) return;
    if (!readState(id).done) return;
    var a = AUD[id];
    if (!a) {
      a = AUD[id] = new Audio(D.audioBase + r.file);
      a.preload = 'auto';
      a.addEventListener('timeupdate', function () {
        var b = document.getElementById('bar-' + id);
        if (b && a.duration) b.style.width = Math.min(100, a.currentTime / a.duration * 100) + '%';
      });
      a.addEventListener('ended', function () { PLAYING[id] = false; updatePlayer(id); });
      a.addEventListener('error', function () { PLAYING[id] = false; var e = document.getElementById('perr-' + id); if (e) e.textContent = 'Impossible de charger l\'enregistrement. Vérifiez votre connexion puis réessayez.'; });
    }
    try { a.currentTime = 0; } catch (e) {}
    PLAYING[id] = true;
    updatePlayer(id);
    var p = a.play();
    var counted = function () { S.co.plays[id] = (S.co.plays[id] || 0) + 1; save(); var pl = document.querySelector('#pl-' + id + ' .plays'); if (pl) pl.textContent = 'Écoutes utilisées : ' + S.co.plays[id] + ' / ' + max; };
    if (p && p.then) {
      p.then(counted).catch(function () {
        PLAYING[id] = false; updatePlayer(id);
        var e = document.getElementById('perr-' + id); if (e) e.textContent = 'La lecture n\'a pas pu démarrer. Réessayez (aucune écoute n\'a été comptée).';
      });
    } else counted();
  }
  function stopExamAudio() { Object.keys(AUD).forEach(function (k) { try { AUD[k].pause(); } catch (e) {} PLAYING[k] = false; }); }

  R.co = function (sc) {
    var sub = S.co.submitted;
    var h = head('Compréhension de l\'oral · Exercice ' + sc.ex + ' / 3', sc.title, '<p>' + esc(fr(sc.instructions)) + '</p>' + enDiv(sc.instructions));
    if (sub) h += scoreBox('co', 'Compréhension de l\'oral');
    var n = 0;
    sc.recordings.forEach(function (r) {
      h += '<div class="card">' + playerHtml(r);
      sc.items.forEach(function (it) { if ((it.rec || sc.recordings[0].id) === r.id) { n++; h += mcqHtml(sc, it, n, 'co'); } });
      h += '</div>';
    });
    if (sc.submit) h += submitArea('co');
    else if (!sub) h += '<p class="small">Vos réponses sont enregistrées automatiquement. La validation se fait à la fin de l\'exercice 3.</p><div class="en">Your answers are saved automatically. You submit at the end of Exercise 3.</div>';
    return h;
  };

  /* ----- CE */
  function ceTimerBar(sc) {
    if (!sc.timer || S.ce.submitted) return '';
    if (!S.ce.timerStart) {
      return '<div class="timerbar"><span class="lbl">Chronomètre (facultatif)</span><span>' + sc.timer.minutes + ' minutes pour les 3 exercices, comme à l\'examen.</span>' +
        '<button type="button" class="btn gold small" data-act="ce-timer">Démarrer le chrono</button><span class="en">Optional timer: 60 minutes for all three exercises, as in the exam.</span></div>';
    }
    return '<div class="timerbar"><span class="lbl">Temps restant (3 exercices)</span><span class="clock" data-clock="ce">--:--</span><span class="small" data-clock-note="ce"></span></div>';
  }
  R.ce = function (sc) {
    var sub = S.ce.submitted, d = sc.doc;
    var h = head('Compréhension des écrits · Exercice ' + sc.ex + ' / 3', sc.title, '<p>' + esc(fr(sc.instructions)) + '</p>' + enDiv(sc.instructions));
    if (sub) h += scoreBox('ce', 'Compréhension des écrits');
    h += ceTimerBar(sc);
    h += '<article class="doc" lang="fr"><div class="src">' + esc(fr(d.source)) + '</div><h3>' + esc(fr(d.title)) + '</h3>' + (sub ? enDiv(d.title) : '');
    if (d.lead) h += '<p class="lead">' + esc(fr(d.lead)) + '</p>' + (sub ? enDiv(d.lead) : '');
    d.paras.forEach(function (p) { h += '<p>' + esc(fr(p)) + '</p>' + (sub ? enDiv(p) : ''); });
    h += '</article>';
    if (sub) h += '<p class="small">Après la validation, activez « EN · Aide en anglais » pour lire la traduction du texte.</p>';
    h += '<div class="card">';
    sc.items.forEach(function (it, k) { h += mcqHtml(sc, it, k + 1, 'ce'); });
    h += '</div>';
    if (sc.submit) h += submitArea('ce');
    else if (!sub) h += '<p class="small">Vos réponses sont enregistrées automatiquement. La validation se fait à la fin de l\'exercice 3.</p><div class="en">Your answers are saved automatically. You submit at the end of Exercise 3.</div>';
    return h;
  };
  R.ce3 = function (sc) {
    var sub = S.ce.submitted, d = sc.doc;
    var h = head('Compréhension des écrits · Exercice ' + sc.ex + ' / 3', sc.title, '<p>' + esc(fr(sc.instructions)) + '</p>' + enDiv(sc.instructions));
    if (sub) h += scoreBox('ce', 'Compréhension des écrits');
    h += ceTimerBar(sc);
    h += '<div class="card"><div class="src small">' + esc(fr(d.source)) + '</div><p class="question-box" lang="fr">' + esc(fr(d.question)) + '</p>' + (sub ? enDiv(d.question) : '') + '<div class="opinions">';
    d.opinions.forEach(function (o) {
      h += '<div class="opinion" lang="fr"><div class="who"><span class="tag">' + esc(o.label) + '</span>' + esc(o.name) + ', <span class="small">' + esc(fr(o.role)) + '</span></div>' +
        '<p>' + esc(fr(o.text)) + '</p>' + (sub ? enDiv(o.text) : '') + '</div>';
    });
    h += '</div></div><div class="card"><h3>Qui exprime cette opinion ?</h3>';
    sc.items.forEach(function (it, k) { h += mcqHtml(sc, it, k + 1, 'ce'); });
    h += '</div>';
    if (sc.submit) h += submitArea('ce');
    return h;
  };

  function submitSection(sec) {
    var st = S[sec];
    if (st.submitted) return;
    var r = scoreSection(sec), missing = r.items.filter(function (x) { return x.chosen == null; }).length;
    if (!pending[sec]) { pending[sec] = true; renderScreen(); var w = $('.note.red'); if (w && w.scrollIntoView) w.scrollIntoView({ block: 'center' }); return; }
    pending[sec] = false;
    st.submitted = true; st.score = r.total; st.at = nowIso(); st.byEx = {};
    Object.keys(r.ex).forEach(function (k) { st.byEx[k] = r.ex[k].pts; });
    if (sec === 'co') stopExamAudio();
    save();
    sendSection(sec);
    renderStepper(); renderScreen();
    window.scrollTo(0, APP.offsetTop);
  }
  function sendSection(sec) {
    var r = scoreSection(sec), name = getName(), st = S[sec];
    var lines = r.items.map(function (x) {
      return 'Ex' + x.ex + ' Q' + x.n + ' (' + num(x.w) + ' pt) : ' + (x.chosen == null ? '—' : optLabel(x.sc, x.chosen)) + (x.ok ? ' ✔' : ' ✘ (bonne réponse : ' + optLabel(x.sc, x.answer) + ')');
    });
    var payload = {
      _subject: 'DELF B2 — ' + wk() + ' — ' + (sec === 'co' ? 'CO' : 'CE') + ' — ' + name,
      student: name, week: D.week, week_id: D.id, part: sec === 'co' ? 'Compréhension de l\'oral (CO)' : 'Compréhension des écrits (CE)',
      score: num(r.total) + '/25',
      detail: Object.keys(r.ex).map(function (k) { return 'Ex' + k + ' ' + num(r.ex[k].pts) + '/' + num(r.ex[k].max); }).join(' · '),
      answers: lines.join('\n'), submitted_at: st.at
    };
    if (sec === 'co') payload.listens = Object.keys(REC_INDEX).map(function (k) { return k + ': ' + (S.co.plays[k] || 0) + '/' + (REC_INDEX[k].rec.maxPlays || 2); }).join(' · ');
    if (sec === 'ce') payload.timer = S.ce.timerStart ? 'chrono utilisé : ' + Math.round((Date.parse(st.at) - S.ce.timerStart) / 60000) + ' min' : 'sans chrono';
    send(payload).then(function () { S.sends[sec] = { at: nowIso() }; save(); }).catch(function (e) { S.sends[sec] = { error: String(e.message || e) }; save(); if (D.screens[cur].submit) renderScreen(); });
  }

  /* ----- PE */
  function peClock() {
    var sc = D.screens.filter(function (s) { return s.type === 'pe'; })[0];
    if (!sc || !S.pe.timerStart) return null;
    var total = sc.minutes * 60, el = (Date.now() - S.pe.timerStart) / 1000;
    return { left: total - el, used: el, over: el > total, warn: total - el <= (sc.warnMinutes || 10) * 60, sc: sc };
  }
  function wcInfo(sc) {
    var n = countWords(S.pe.text), cls = '', msg = '';
    if (n <= sc.zeroWords) { cls = 'low'; msg = '<span class="err">Avec ' + sc.zeroWords + ' mots ou moins, la copie reçoit 0 à tous les critères (« manque de matière évaluable »).</span><span class="en-i">(' + sc.zeroWords + ' words or fewer = 0 on every criterion.)</span>'; }
    else if (n < sc.minWords) { cls = 'low'; msg = '<span>Minimum demandé : ' + sc.minWords + ' mots. Il vous manque ' + (sc.minWords - n) + ' mot' + (sc.minWords - n > 1 ? 's' : '') + '.</span><span class="en-i">(At least ' + sc.minWords + ' words required.)</span>'; }
    else msg = '<span class="badge green">Longueur suffisante</span>';
    return { n: n, cls: cls, msg: msg };
  }
  function annotate(paras, anns) {
    return paras.map(function (p) {
      var t = esc(p);
      anns.forEach(function (a, i) {
        var q = esc(a.quote), at = t.indexOf(q);
        if (at < 0) { q = q.replace(/ /g, ' '); at = t.replace(/ /g, ' ').indexOf(q); }
        if (at >= 0) t = t.slice(0, at) + '<mark>' + t.slice(at, at + q.length) + '</mark><sup>' + (i + 1) + '</sup>' + t.slice(at + q.length);
      });
      return '<p>' + t + '</p>';
    }).join('');
  }
  R.pe = function (sc) {
    var c = peClock(), w = wcInfo(sc), sent = !!S.pe.sentAt;
    var h = head('Production écrite · ' + fr(sc.genre), sc.label, '<p>Durée : ' + sc.minutes + ' minutes · ' + sc.minWords + ' mots minimum · noté sur 25.</p>' +
      '<div class="en">Time: ' + sc.minutes + ' minutes · at least ' + sc.minWords + ' words · scored out of 25.</div>');
    h += '<div class="card"><h3>Sujet</h3><div lang="fr">' + fr(sc.prompt) + '</div>' + enHtml(sc.prompt) + '</div>';
    h += '<div class="card"><h3>Chronomètre</h3>';
    if (!c) h += '<p>Le chronomètre de 60 minutes démarre quand vous cliquez. Il continue même si vous fermez la page.</p><div class="en">The 60-minute timer starts when you click and keeps running even if you close the page.</div>' +
      '<div class="btnrow"><button type="button" class="btn gold" data-act="pe-start">Commencer l\'épreuve (60 min)</button></div>';
    else h += '<div class="timerbar"><span class="lbl">Temps restant</span><span class="clock" data-clock="pe">--:--</span><span data-clock-note="pe"></span></div>';
    h += '</div>';
    h += '<div class="card"><label for="essay"><strong>Votre texte</strong></label>' +
      '<textarea id="essay" class="essay" data-pe="text" lang="fr" spellcheck="false" placeholder="Rédigez votre contribution ici…">' + esc(S.pe.text) + '</textarea>' +
      '<div class="wc ' + w.cls + '" id="wcbox" aria-live="polite"><span class="n" id="wcn">' + w.n + ' mot' + (w.n > 1 ? 's' : '') + '</span><span id="wcmsg">' + w.msg + '</span></div>' +
      '<p class="small">Le compteur applique la règle du DELF : un mot = un groupe de caractères entre deux espaces (« c\'est-à-dire » = 1 mot) ; la ponctuation isolée ne compte pas. Le correcteur automatique est désactivé, comme à l\'examen. N\'oubliez pas d\'indiquer le nombre de mots à la fin de votre texte.</p>' +
      '<div class="en">The counter applies the DELF rule: a word is any group of characters between two spaces; isolated punctuation does not count. Spellcheck is off, as in the exam. Remember to write your word count at the end.</div></div>';
    h += '<div class="card checklist"><h3>Avant d\'envoyer : auto-vérification</h3>';
    sc.checklist.forEach(function (it, i) {
      h += '<label><input type="checkbox" data-chk="' + i + '"' + (S.pe.checks[i] ? ' checked' : '') + '><span>' + esc(it.fr) + '<span class="en">' + esc(it.en) + '</span></span></label>';
    });
    h += '</div>';
    h += '<div class="card"><h3>Envoyer à mon professeur</h3><p>Votre texte complet est envoyé à KCE et corrigé selon la grille officielle du DELF B2, avec un retour détaillé.</p>' +
      '<div class="en">Your full text is sent to KCE and graded on the official DELF B2 grid, with detailed feedback.</div>';
    if (pending.pe) h += '<p class="note red" role="alert">' + (w.n <= sc.zeroWords ? 'Votre texte compte ' + w.n + ' mots : à l\'examen, il recevrait 0. ' : w.n < sc.minWords ? 'Votre texte compte moins de ' + sc.minWords + ' mots. ' : '') +
      (Object.keys(S.pe.checks).filter(function (k) { return S.pe.checks[k]; }).length < sc.checklist.length ? 'Vous n\'avez pas coché toute la liste de vérification. ' : '') + 'Cliquez de nouveau pour envoyer quand même.</p>';
    if (sent) h += '<p class="note green">Texte envoyé le ' + fmtDate(S.pe.sentAt) + ' (' + S.pe.sentWords + ' mots). Vous pouvez envoyer une version corrigée si vous le souhaitez.</p>';
    if (ui.msg.pe) h += ui.msg.pe;
    h += '<div class="btnrow"><button type="button" class="btn gold" data-act="pe-send">' + (sent ? 'Renvoyer une version corrigée' : 'Envoyer à mon professeur') + '</button>' +
      '<button type="button" class="btn ghost" data-act="pe-copy">Copier mon texte</button></div></div>';
    if (sent) {
      var m = sc.model;
      h += '<div class="card model"><h3>Proposition de corrigé (niveau B2+)</h3><p class="small">' + m.wordCount + ' mots. Les passages surlignés sont commentés en dessous.</p>' +
        '<div class="en">Model answer (B2+), ' + m.wordCount + ' words. Highlighted passages are explained below.</div>' +
        '<h4 lang="fr">' + esc(m.title) + '</h4><div lang="fr">' + annotate(m.paras, m.annotations) + '</div><p class="small">(' + m.wordCount + ' mots)</p>' +
        '<h4>Pourquoi ce texte obtient une bonne note</h4><ol class="annot">';
      m.annotations.forEach(function (a) { h += '<li><em>« ' + esc(a.quote) + ' »</em> — ' + esc(a.fr) + '<span class="en">' + esc(a.en) + '</span></li>'; });
      h += '</ol></div>';
      h += gridHtml(PE_GRID, 'La grille officielle de la production écrite',
        'Un texte de 124 mots ou moins reçoit 0 partout. Hors-sujet thématique : pas de B2+ en réalisation de la tâche ni en lexique. Hors-sujet discursif (mauvais type de texte) : pas de B2 ni B2+ en tâche et en cohérence. Hors-sujet complet : 0 en tâche, cohérence et adéquation ; pas de B2 ni B2+ en lexique et morphosyntaxe.',
        'A text of 124 words or fewer gets 0 everywhere. Off-topic theme: no B2+ for task or vocabulary. Wrong text type: no B2 or B2+ for task and coherence. Completely off-topic: 0 for task, coherence and sociolinguistic fit; no B2 or B2+ for vocabulary and grammar.');
    }
    return h;
  };
  function sendPE() {
    var sc = D.screens[cur], name = getName(), w = countWords(S.pe.text), c = peClock();
    var checks = Object.keys(S.pe.checks).filter(function (k) { return S.pe.checks[k]; }).length;
    if (!S.pe.text.trim()) { ui.msg.pe = '<p class="err">Votre texte est vide.</p>'; renderScreen(); return; }
    if (!pending.pe && (w < sc.minWords || checks < sc.checklist.length)) { pending.pe = true; renderScreen(); return; }
    pending.pe = false;
    var payload = {
      _subject: 'DELF B2 — ' + wk() + ' — PE — ' + name,
      student: name, week: D.week, week_id: D.id, part: 'Production écrite (PE)', prompt_id: sc.promptId, genre: fr(sc.genre),
      word_count: w, time_used: c ? Math.round(Math.min(c.used, 24 * 3600) / 60) + ' min' : 'chrono non utilisé',
      overtime: c && c.over ? 'oui (hors temps)' : 'non',
      self_check: checks + '/' + sc.checklist.length,
      essay: S.pe.text, submitted_at: nowIso()
    };
    if (S.pe.atLimit && S.pe.atLimit.text !== S.pe.text) { payload.words_at_60_min = S.pe.atLimit.words; payload.essay_at_60_min = S.pe.atLimit.text; }
    ui.msg.pe = '<p class="small">Envoi en cours…</p>'; renderScreen();
    send(payload).then(function () {
      S.pe.sentAt = payload.submitted_at; S.pe.sentWords = w; save(); ui.msg.pe = ''; renderStepper(); renderScreen();
    }).catch(function (e) {
      ui.msg.pe = '<div class="note red" role="alert"><p>L\'envoi a échoué (' + esc(e.message || e) + '). Vérifiez votre connexion et réessayez. Si le problème continue, copiez votre texte et envoyez-le par e-mail à <a href="mailto:' + CFG.email + '">' + CFG.email + '</a>.</p></div>';
      renderScreen();
    });
  }

  /* ----- PO */
  function poSc() { return D.screens.filter(function (s) { return s.type === 'po'; })[0]; }
  function poDoc() { var sc = poSc(); return sc ? sc.docs.filter(function (d) { return d.id === S.po.doc; })[0] : null; }
  function recKeys() { var d = poDoc(); return d ? ['mono'].concat(d.examiner.map(function (q) { return q.id; })) : ['mono']; }
  function recTitle(k) {
    if (k === 'mono') return 'Monologue suivi';
    var d = poDoc(), i = d ? d.examiner.map(function (q) { return q.id; }).indexOf(k) : -1;
    return 'Réponse à la question ' + (i + 1);
  }
  function recFile(k, type) {
    var d = poDoc(), i = d ? d.examiner.map(function (q) { return q.id; }).indexOf(k) : -1;
    return 'DELF-B2_S' + pad(D.week) + '_' + slug(getName()) + '_' + (k === 'mono' ? '1-monologue' : '2-question-' + (i + 1)) + '.' + extFor(type);
  }
  function recHtml(k, target) {
    var live = REC && REC.key === k, has = BLOBS[k], meta = S.po.rec[k];
    var h = '<div class="rec' + (live ? ' live' : '') + '" id="rec-' + k + '"><div class="rh"><span class="rt">' + esc(recTitle(k)) + '</span>' +
      (target ? '<span class="small">Objectif : ' + target[0] + ' à ' + target[1] + ' minutes</span>' : '') + '</div>';
    if (live) {
      h += '<div class="btnrow" style="align-items:center"><span class="recdot" aria-hidden="true"></span><span class="clock" data-clock="rec">0:00</span>' +
        '<button type="button" class="btn red" data-act="rec-stop">■ Arrêter l\'enregistrement</button></div>';
    } else if (has) {
      if (!URLS[k]) URLS[k] = URL.createObjectURL(has);
      h += '<audio controls src="' + URLS[k] + '"></audio><p class="small">Durée : ' + mmss(meta ? meta.dur : 0) + (target && meta ? (meta.dur < target[0] * 60 ? ' · trop court pour le monologue (visez au moins ' + target[0] + ' min)' : meta.dur > target[1] * 60 ? ' · un peu long (l\'examinateur vous arrêtera vers ' + target[1] + ' min)' : ' · bonne durée') : '') + '</p>' +
        '<div class="btnrow"><button type="button" class="btn ghost small" data-act="rec-start" data-key="' + k + '"' + (REC ? ' disabled' : '') + '>Réenregistrer</button>' +
        '<button type="button" class="btn ghost small" data-act="rec-dl" data-key="' + k + '">Télécharger</button></div>';
    } else {
      if (meta) h += '<p class="small">Un enregistrement avait été fait (' + mmss(meta.dur) + ') mais il n\'est plus disponible dans ce navigateur. Enregistrez-vous de nouveau.</p>';
      h += '<div class="btnrow"><button type="button" class="btn" data-act="rec-start" data-key="' + k + '"' + (REC ? ' disabled' : '') + '>● Enregistrer</button></div>';
    }
    if (ui.msg['rec-' + k]) h += ui.msg['rec-' + k];
    h += '<label class="small" for="tr-' + k + '">Transcription (automatique si votre navigateur le permet ; vous pouvez la corriger ou l\'écrire)</label>' +
      '<div class="interim" id="int-' + k + '" aria-live="polite"></div>' +
      '<textarea class="tr" id="tr-' + k + '" data-tr="' + k + '" lang="fr">' + esc(S.po.tr[k] || '') + '</textarea></div>';
    return h;
  }
  function rerenderRec(k) {
    var el = document.getElementById('rec-' + k);
    if (el) { el.outerHTML = recHtml(k, k === 'mono' ? [poSc().monologueMin, poSc().monologueMax] : null); frSpace(document.getElementById('rec-' + k)); }
    var s = document.getElementById('po-send'); if (s) { s.outerHTML = poSendHtml(); frSpace(document.getElementById('po-send')); }
  }
  function rerenderAllRecs() { recKeys().forEach(function (k) { if (document.getElementById('rec-' + k)) rerenderRec(k); }); }
  function pickMime() {
    var c = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
    for (var i = 0; i < c.length; i++) { try { if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c[i])) return c[i]; } catch (e) {} }
    return '';
  }
  function startRec(k) {
    if (REC) return;
    ui.msg['rec-' + k] = '';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      ui.msg['rec-' + k] = '<p class="err">Votre navigateur ne permet pas l\'enregistrement. Utilisez Chrome, Edge, Firefox ou Safari récent, ou enregistrez-vous avec votre téléphone et envoyez le fichier par e-mail.</p>';
      rerenderRec(k); return;
    }
    if (EXAM_AUDIO) { try { EXAM_AUDIO.pause(); } catch (e) {} }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var mime = pickMime(), mr;
      try { mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); } catch (e) { mr = new MediaRecorder(stream); }
      var rec = { key: k, mr: mr, chunks: [], start: Date.now(), stream: stream };
      REC = rec;
      mr.ondataavailable = function (e) { if (e.data && e.data.size) rec.chunks.push(e.data); };
      mr.onstop = function () { finishRec(rec); };
      mr.start(1000);
      startSR(k);
      rerenderAllRecs();
    }).catch(function () {
      ui.msg['rec-' + k] = '<p class="err">Micro inaccessible. Autorisez l\'accès au micro pour cette page (icône à gauche de l\'adresse), puis réessayez. Vous pouvez aussi vous enregistrer avec votre téléphone.</p>';
      rerenderRec(k);
    });
  }
  function stopRec() { if (!REC) return; stopSR(); try { REC.mr.stop(); } catch (e) { finishRec(REC); } }
  function finishRec(rec) {
    if (rec.finished) return; rec.finished = true;
    if (REC === rec) REC = null;
    try { rec.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    var type = (rec.mr && rec.mr.mimeType) || (rec.chunks[0] && rec.chunks[0].type) || 'audio/webm';
    var blob = new Blob(rec.chunks, { type: type }), dur = (Date.now() - rec.start) / 1000;
    if (URLS[rec.key]) { try { URL.revokeObjectURL(URLS[rec.key]); } catch (e) {} delete URLS[rec.key]; }
    BLOBS[rec.key] = blob;
    S.po.rec[rec.key] = { dur: Math.round(dur), at: nowIso(), type: type, size: blob.size };
    save();
    IDB.put(D.id + ':' + rec.key, { blob: blob, type: type, dur: dur }).then(function (ok) {
      if (!ok) { ui.msg['rec-' + rec.key] = '<p class="small">Attention : ce navigateur ne conserve pas les enregistrements après un rechargement. Téléchargez-les avant de quitter la page.</p>'; rerenderRec(rec.key); }
    });
    if (D.screens[cur].type === 'po') rerenderAllRecs();
  }
  var SRC = window.SpeechRecognition || window.webkitSpeechRecognition;
  function startSR(k) {
    if (!SRC || srOff) return;
    try {
      var r = new SRC();
      r.lang = 'fr-FR'; r.continuous = true; r.interimResults = true;
      r.onresult = function (e) {
        var interim = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var res = e.results[i];
          if (res.isFinal) {
            var t = (res[0].transcript || '').trim();
            if (t) {
              var c = S.po.tr[k] || '';
              S.po.tr[k] = (c ? c.replace(/\s+$/, '') + ' ' : '') + t; saveSoon();
              var ta = document.getElementById('tr-' + k); if (ta) ta.value = S.po.tr[k];
            }
          } else interim += res[0].transcript;
        }
        var el = document.getElementById('int-' + k); if (el) el.textContent = interim;
      };
      r.onerror = function (e) {
        if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture', 'language-not-supported'].indexOf(e.error) >= 0) {
          srOff = true;
          var el = document.getElementById('int-' + k);
          if (el) el.textContent = 'Transcription automatique indisponible ici : vous pouvez écrire vos notes vous-même. L\'enregistrement audio continue.';
        }
      };
      r.onend = function () { if (SR === r && REC && REC.key === k && !srOff) { try { r.start(); } catch (x) {} } };
      SR = r; r.start();
    } catch (e) { srOff = true; }
  }
  function stopSR() { var r = SR; SR = null; if (r) { try { r.stop(); } catch (e) {} } }
  function playExaminer(q) {
    if (REC) return;
    if (EXAM_AUDIO) { try { EXAM_AUDIO.pause(); } catch (e) {} }
    EXAM_AUDIO = new Audio(D.audioBase + q.file);
    var p = EXAM_AUDIO.play(); if (p && p.catch) p.catch(function () {});
  }
  function poSendHtml() {
    var keys = recKeys(), have = keys.filter(function (k) { return BLOBS[k]; }), name = getName();
    var subj = 'DELF B2 oral — ' + (mock() ? fr(D.title) : 'Semaine ' + D.week) + ' — ' + name;
    var h = '<div id="po-send"><p>' + have.length + ' enregistrement' + (have.length > 1 ? 's' : '') + ' sur ' + keys.length + ' (monologue + ' + (keys.length - 1) + ' réponses).</p>' +
      '<div class="btnrow"><button type="button" class="btn" data-act="zip-dl"' + (have.length ? '' : ' disabled') + '>Télécharger tous mes enregistrements (.zip)</button></div>' +
      '<ol><li>Téléchargez vos enregistrements (un seul fichier .zip, ou chaque partie avec « Télécharger »).</li>' +
      '<li>Envoyez-les par e-mail à <a href="mailto:' + CFG.email + '?subject=' + encodeURIComponent(subj) + '">' + CFG.email + '</a> avec l\'objet : <strong>' + esc(subj) + '</strong></li>' +
      '<li>Cliquez sur « Envoyer ma transcription et mes notes » ci-dessous.</li></ol>' +
      '<div class="en">1. Download your recordings (one .zip file, or each part with "Télécharger"). 2. Email them to ' + CFG.email + ' with the subject shown. 3. Click the button below to send your transcript and notes.</div>';
    if (pending.po) h += '<p class="note red" role="alert">' + (BLOBS.mono ? '' : 'Vous n\'avez pas encore enregistré votre monologue. ') + (have.length < keys.length ? 'Certaines réponses ne sont pas enregistrées. ' : '') + 'Cliquez de nouveau pour envoyer quand même.</p>';
    if (S.po.sentAt) h += '<p class="note green">Transcription et notes envoyées le ' + fmtDate(S.po.sentAt) + '. N\'oubliez pas d\'envoyer vos enregistrements par e-mail.</p>';
    if (ui.msg.po) h += ui.msg.po;
    h += '<div class="btnrow"><button type="button" class="btn gold" data-act="po-send">' + (S.po.sentAt ? 'Renvoyer ma transcription et mes notes' : 'Envoyer ma transcription et mes notes') + '</button></div></div>';
    return h;
  }
  function prepClock() {
    var sc = poSc(); if (!S.po.prepStart) return null;
    var end = S.po.prepEnd || Date.now(), el = (end - S.po.prepStart) / 1000, total = sc.prepMinutes * 60;
    return { left: total - el, used: el, over: el > total, done: !!S.po.prepEnd };
  }
  function stepH(n, t, tEn) { return '<div class="step-h"><span class="n">' + n + '</span><h3>' + esc(t) + '</h3></div>' + (tEn ? '<div class="en">' + esc(tEn) + '</div>' : ''); }
  R.po = function (sc) {
    var d = poDoc(), locked = !!S.po.prepStart;
    var h = head('Production orale', sc.label, '<p>' + esc(fr(sc.instructions)) + '</p>' + enDiv(sc.instructions));
    h += '<div class="card">' + stepH(1, 'Choisissez un document', 'Choose one document') + '<div class="docs2">';
    sc.docs.forEach(function (doc) {
      if (locked && doc.id !== S.po.doc) return;
      var ch = doc.id === S.po.doc;
      h += '<article class="podoc' + (ch ? ' chosen' : '') + '" lang="fr"><span class="badge navy">Document ' + esc(doc.id) + '</span><h4>' + esc(doc.title) + '</h4><p>' + esc(doc.text) + '</p>' +
        '<p class="small">' + esc(doc.source) + '</p>' + (doc.en ? '<div class="en">' + esc(doc.en) + '</div>' : '') +
        (locked ? '<span class="badge gold">Document choisi</span>' : '<button type="button" class="btn ' + (ch ? 'gold' : 'ghost') + ' small" data-act="po-choose" data-doc="' + esc(doc.id) + '">' + (ch ? '✓ Document choisi' : 'Choisir ce document') + '</button>') + '</article>';
    });
    h += '</div>' + (locked ? '<p class="small">Le document est fixé une fois la préparation commencée, comme à l\'examen.</p>' : '') + '</div>';
    if (!d) return h + '<div class="card"><p>Choisissez d\'abord un document pour continuer.</p><div class="en">Choose a document first to continue.</div></div>';
    var pc = prepClock();
    h += '<div class="card">' + stepH(2, 'Préparation (30 minutes)', 'Preparation (30 minutes)');
    if (!pc) h += '<p>À l\'examen, vous avez 30 minutes pour préparer, sans dictionnaire. Notez des mots-clés, pas un texte entier.</p><div class="btnrow"><button type="button" class="btn gold" data-act="po-prep-start">Commencer la préparation</button></div>';
    else if (!pc.done) h += '<div class="timerbar"><span class="lbl">Temps de préparation</span><span class="clock" data-clock="prep">--:--</span><button type="button" class="btn ghost small" data-act="po-prep-end">J\'ai terminé ma préparation</button></div>';
    else h += '<p class="note green">Préparation terminée (' + Math.round(pc.used / 60) + ' min).</p>';
    h += '<h4>Guide de structure</h4><div class="lesson-body">' + fr(sc.structure) + '</div>' + enHtml(sc.structure) +
      '<label for="po-notes"><strong>Mes notes</strong></label><textarea id="po-notes" class="notes" data-po="notes" lang="fr" placeholder="Problématique, plan, idées, exemples, connecteurs…">' + esc(S.po.notes) + '</textarea></div>';
    h += '<div class="card">' + stepH(3, 'Monologue suivi (5 à 7 minutes)', 'Monologue (5–7 minutes)') +
      '<p>Présentez le document, dégagez le problème qu\'il soulève et donnez votre opinion de manière argumentée. Parlez sans lire vos notes.</p>' +
      '<div class="en">Present the document, identify the issue it raises and give your argued opinion. Speak without reading your notes.</div>' +
      recHtml('mono', [sc.monologueMin, sc.monologueMax]) +
      (SRC ? '' : '<p class="small">La transcription automatique n\'est pas disponible dans ce navigateur (essayez Chrome ou Edge). L\'enregistrement fonctionne quand même.</p>') + '</div>';
    h += '<div class="card">' + stepH(4, 'Débat avec l\'examinateur', 'Debate with the examiner') +
      '<p>Écoutez chaque question ou objection, puis enregistrez votre réponse (environ 1 à 2 minutes). Défendez votre point de vue et nuancez.</p>' +
      '<div class="en">Listen to each question or objection, then record your answer (about 1–2 minutes). Defend your view and add nuance.</div>';
    d.examiner.forEach(function (q, i) {
      h += '<div class="qcard"><p lang="fr"><span class="qn">' + (i + 1) + '.</span>' + esc(q.fr) + '</p>' + (q.en ? '<div class="en">' + esc(q.en) + '</div>' : '') +
        '<div class="btnrow"><button type="button" class="btn ghost small" data-act="po-q" data-q="' + esc(q.id) + '">▶ Écouter l\'examinateur</button></div>' + recHtml(q.id, null) + '</div>';
    });
    h += '</div>';
    h += '<div class="card">' + stepH(5, 'Envoyer', 'Send') + poSendHtml() + '</div>';
    if (S.po.sentAt) {
      h += '<div class="card"><h3>Proposition de plan pour le document ' + esc(d.id) + '</h3><p><strong>Problématique possible :</strong> ' + esc(fr(d.problem)) + '</p>' + enDiv(d.problem) +
        '<div class="lesson-body" lang="fr">' + fr(d.outline) + '</div>' + enHtml(d.outline) + '</div>';
      h += '<div class="card"><h3>Expressions utiles</h3>';
      sc.expressions.forEach(function (g) {
        h += '<h4>' + esc(fr(g.title)) + enI(g.title) + '</h4><ul>' + g.items.map(function (x) { return '<li lang="fr">' + esc(x) + '</li>'; }).join('') + '</ul>';
      });
      h += '</div>';
      h += gridHtml(PO_GRID, 'La grille officielle de la production orale', 'L\'épreuve dure 20 minutes au maximum : 5 à 7 minutes de monologue, puis 10 à 13 minutes de débat.', 'The test lasts at most 20 minutes: a 5–7 minute monologue, then a 10–13 minute debate.');
    }
    return h;
  };
  function sendPO() {
    var sc = poSc(), d = poDoc(), name = getName(), keys = recKeys(), have = keys.filter(function (k) { return BLOBS[k]; });
    if (!d) return;
    if (!pending.po && (have.length < keys.length)) { pending.po = true; rerenderSend(); return; }
    pending.po = false;
    var pc = prepClock();
    var inter = d.examiner.map(function (q, i) {
      var m = S.po.rec[q.id];
      return 'Q' + (i + 1) + ' — ' + q.fr + '\nDurée : ' + (m ? mmss(m.dur) : 'non enregistrée') + '\nTranscription : ' + (S.po.tr[q.id] || '—');
    }).join('\n\n');
    var payload = {
      _subject: 'DELF B2 — ' + wk() + ' — PO — ' + name,
      student: name, week: D.week, week_id: D.id, part: 'Production orale (PO)',
      document: 'Document ' + d.id + ' — ' + d.title,
      preparation: pc ? Math.round(Math.min(pc.used, 24 * 3600) / 60) + ' min' : 'chrono non utilisé',
      notes: S.po.notes || '—',
      monologue_duration: S.po.rec.mono ? mmss(S.po.rec.mono.dur) : 'non enregistré',
      monologue_transcript: S.po.tr.mono || '—',
      interaction: inter,
      recordings: have.length + '/' + keys.length + ' enregistrés dans le navigateur ; à envoyer par e-mail à ' + CFG.email,
      submitted_at: nowIso()
    };
    ui.msg.po = '<p class="small">Envoi en cours…</p>'; rerenderSend();
    send(payload).then(function () {
      S.po.sentAt = payload.submitted_at; save(); ui.msg.po = ''; renderStepper(); renderScreen();
    }).catch(function (e) {
      ui.msg.po = '<p class="note red" role="alert">L\'envoi a échoué (' + esc(e.message || e) + '). Réessayez, ou copiez vos notes et votre transcription dans un e-mail à ' + CFG.email + '.</p>';
      rerenderSend();
    });
  }
  function rerenderSend() { var s = document.getElementById('po-send'); if (s) { s.outerHTML = poSendHtml(); frSpace(document.getElementById('po-send')); } }
  function zipAll() {
    var files = recKeys().filter(function (k) { return BLOBS[k]; }).map(function (k) { return { name: recFile(k, BLOBS[k].type), blob: BLOBS[k] }; });
    if (!files.length) return;
    makeZip(files).then(function (z) { download(z, 'DELF-B2_S' + pad(D.week) + '_' + slug(getName()) + '_oral.zip'); });
  }

  /* ----- Bilan */
  R.bilan = function (sc) {
    var h = head(wk() + ' · Bilan', sc.label, '<p>Votre récapitulatif de la semaine.</p><div class="en">Your summary for the week.</div>');
    var lexSc = D.screens.filter(function (s) { return s.type === 'lexicon'; })[0], grSc = D.screens.filter(function (s) { return s.type === 'grammar'; })[0];
    function lexScore() { var n = 0; lexSc.practice.items.forEach(function (it, i) { if (S.lex.a[i] === it.answer) n++; }); return n + ' / ' + lexSc.practice.items.length; }
    function grScore() { var n = 0; grSc.exercise.items.forEach(function (it, i) { if (gramOk(it, S.gram.a[i])) n++; }); return n + ' / ' + grSc.exercise.items.length; }
    var co = S.co.submitted ? S.co.score : null, ce = S.ce.submitted ? S.ce.score : null;
    h += '<div class="card"><div class="bilan-grid">';
    if (lexSc) h += '<div class="bilan-row"><span class="k">Lexique</span><span>' + (S.lex.checked ? lexScore() : 'non vérifié') + '</span></div>';
    if (grSc) h += '<div class="bilan-row"><span class="k">Outils de langue</span><span>' + (S.gram.checked ? grScore() : 'non vérifié') + '</span></div>';
    h += '<div class="bilan-row"><span class="k">Compréhension de l\'oral</span><span>' + (co != null ? '<strong>' + num(co) + ' / 25</strong> ' + (co > 5 ? '' : co === 5 ? '<span class="badge gold">Seuil de 5/25 atteint</span>' : '<span class="badge red">sous 5/25</span>') : '<span class="badge gray">non validée</span>') + '</span></div>';
    h += '<div class="bilan-row"><span class="k">Compréhension des écrits</span><span>' + (ce != null ? '<strong>' + num(ce) + ' / 25</strong> ' + (ce > 5 ? '' : ce === 5 ? '<span class="badge gold">Seuil de 5/25 atteint</span>' : '<span class="badge red">sous 5/25</span>') : '<span class="badge gray">non validée</span>') + '</span></div>';
    h += '<div class="bilan-row"><span class="k">Production écrite</span><span>' + (S.pe.sentAt ? '<span class="badge gold">Envoyée pour correction le ' + fmtDate(S.pe.sentAt) + '</span>' : '<span class="badge gray">non envoyée</span>') + '</span></div>';
    h += '<div class="bilan-row"><span class="k">Production orale</span><span>' + (S.po.sentAt ? '<span class="badge gold">Envoyée pour correction le ' + fmtDate(S.po.sentAt) + '</span>' : '<span class="badge gray">non envoyée</span>') + '</span></div>';
    h += '</div></div>';
    h += '<div class="card"><h3>Projection et règle de réussite</h3>' +
      '<p>Pour obtenir le DELF B2, il faut <strong>au moins 50 points sur 100</strong> au total <strong>et au moins 5 sur 25 dans chacune des quatre épreuves</strong>. Une note inférieure à 5/25 dans une seule épreuve est éliminatoire, même si le total atteint ou dépasse 50.</p>' +
      '<div class="en">To pass the DELF B2 you need at least 50/100 overall and at least 5/25 on each of the four papers. Below 5/25 on any single paper means failing, even with 50 or more overall.</div>';
    if (co != null && ce != null) {
      var known = co + ce, need = Math.max(10, 50 - known);
      h += '<p>Points déjà obtenus (CO + CE) : <strong>' + num(known) + ' / 50</strong>.</p>' +
        '<p>Pour atteindre 50/100, il vous faudrait au moins <strong>' + num(need) + ' / 50</strong> en production écrite et orale réunies, avec au moins 5/25 dans chacune. Vos productions sont corrigées par KCE sur la grille officielle : la projection sera complète quand vous recevrez vos notes.</p>' +
        '<div class="en">Points so far (listening + reading): ' + num(known) + '/50. To reach 50/100 you would need at least ' + num(need) + '/50 across writing and speaking, with at least 5/25 on each. KCE grades your writing and speaking on the official grid; your projection will be complete when you receive those scores.</div>';
      if (co < 5 || ce < 5) h += '<p class="note red">Attention : une épreuve est sous le seuil de 5/25. Reprenez les explications et le lexique avant de passer à la semaine suivante.</p>';
    } else h += '<p class="small">Validez la compréhension de l\'oral et la compréhension des écrits pour voir votre projection.</p>';
    h += '</div>';
    h += '<div class="card"><h3>Envoyer mon bilan</h3><p>Le bilan de la semaine est transmis à KCE pour suivre votre progression.</p><div class="en">Your weekly summary is sent to KCE to track your progress.</div>' +
      (S.bilan.sentAt ? '<p class="note green">Bilan envoyé le ' + fmtDate(S.bilan.sentAt) + '.</p>' : '') + (ui.msg.bilan || '') +
      '<div class="btnrow"><button type="button" class="btn gold" data-act="bilan-send">' + (S.bilan.sentAt ? 'Renvoyer mon bilan' : 'Envoyer mon bilan') + '</button></div></div>';
    var nx = D.next || {};
    h += '<div class="card navy"><h3>Et ensuite ?</h3>' + (nx.available ? '<p>Passez à la suite : <strong>' + esc(fr(nx.label)) + '</strong>.</p><div class="btnrow"><a class="btn gold" href="' + esc(nx.href) + '">Commencer ' + esc(fr(nx.label)) + ' →</a></div>' :
      '<p><strong>' + esc(fr(nx.label) || 'Semaine suivante') + '</strong> (bientôt disponible).</p><div class="btnrow"><a class="btn gold" href="' + esc(D.hub || 'index.html') + '">Retour au cours</a></div>') + '</div>';
    h += '<div class="card"><h3>Recommencer cette semaine</h3><p class="small">Efface vos réponses, vos écoutes, vos textes et vos enregistrements de cette semaine sur cet appareil (votre nom est conservé).</p>' +
      (pending.reset ? '<p class="note red" role="alert">Tout sera effacé. Cliquez de nouveau pour confirmer.</p>' : '') +
      '<div class="btnrow"><button type="button" class="btn ghost" data-act="reset-week">Recommencer la semaine</button></div></div>';
    return h;
  };
  function sendBilan() {
    var name = getName();
    var payload = {
      _subject: 'DELF B2 — ' + wk() + ' — Bilan — ' + name, student: name, week: D.week, week_id: D.id, part: 'Bilan',
      co: S.co.submitted ? num(S.co.score) + '/25' : 'non validée', ce: S.ce.submitted ? num(S.ce.score) + '/25' : 'non validée',
      pe: S.pe.sentAt ? 'envoyée le ' + fmtDate(S.pe.sentAt) : 'non envoyée', po: S.po.sentAt ? 'envoyée le ' + fmtDate(S.po.sentAt) : 'non envoyée',
      lexique: S.lex.checked ? 'vérifié' : 'non vérifié', outils: S.gram.checked ? 'vérifié' : 'non vérifié', submitted_at: nowIso()
    };
    var lexSc = D.screens.filter(function (s) { return s.type === 'lexicon'; })[0], grSc = D.screens.filter(function (s) { return s.type === 'grammar'; })[0];
    if (lexSc && S.lex.checked) payload.lexique = lexSc.practice.items.filter(function (it, i) { return S.lex.a[i] === it.answer; }).length + '/' + lexSc.practice.items.length;
    if (grSc && S.gram.checked) payload.outils = grSc.exercise.items.filter(function (it, i) { return gramOk(it, S.gram.a[i]); }).length + '/' + grSc.exercise.items.length;
    ui.msg.bilan = '<p class="small">Envoi en cours…</p>'; renderScreen();
    send(payload).then(function () { S.bilan.sentAt = payload.submitted_at; save(); ui.msg.bilan = ''; renderStepper(); renderScreen(); })
      .catch(function (e) { ui.msg.bilan = '<p class="note red" role="alert">L\'envoi a échoué (' + esc(e.message || e) + '). Réessayez plus tard.</p>'; renderScreen(); });
  }
  function resetWeek() {
    if (!pending.reset) { pending.reset = true; renderScreen(); return; }
    pending.reset = false;
    stopExamAudio(); if (REC) stopRec();
    Object.keys(S.po.rec || {}).forEach(function (k) { IDB.del(D.id + ':' + k); });
    LS.del(KEY);
    S = freshState(); BLOBS = {}; URLS = {}; AUD = {}; PLAYING = {};
    save(); show(0);
  }

  /* ----- mock exam: timers start automatically */
  function autoTimers(sc) {
    if ((sc.type === 'ce' || sc.type === 'ce3') && !S.ce.timerStart && !S.ce.submitted) { S.ce.timerStart = Date.now(); save(); }
    if (sc.type === 'pe' && !S.pe.timerStart) { S.pe.timerStart = Date.now(); save(); }
  }

  /* ---------------- ticking clocks */
  function tick() {
    if (!D) return;
    var now = Date.now();
    $all('[data-clock]').forEach(function (el) {
      var k = el.getAttribute('data-clock'), text = null, cls = '';
      if (k.indexOf('read-') === 0) {
        var id = k.slice(5), rs = readState(id);
        if (rs.done) { updatePlayer(id); return; }
        text = mmss(rs.left); if (rs.left <= 10) cls = 'warn';
      } else if (k === 'ce' && S.ce.timerStart) {
        var sc = D.screens[cur], total = ((sc.timer && sc.timer.minutes) || 60) * 60, left = total - (now - S.ce.timerStart) / 1000;
        text = left >= 0 ? mmss(left) : '+' + mmss(-left); cls = left < 0 ? 'over' : left <= 600 ? 'warn' : '';
        var nt = $('[data-clock-note="ce"]'); if (nt) nt.textContent = left < 0 ? 'Temps écoulé : à l\'examen, vous devriez rendre votre copie.' : '';
      } else if (k === 'pe') {
        var c = peClock(); if (!c) return;
        text = c.left >= 0 ? mmss(c.left) : '+' + mmss(-c.left); cls = c.over ? 'over' : c.warn ? 'warn' : '';
        var n2 = $('[data-clock-note="pe"]');
        if (n2) n2.innerHTML = c.over ? '<span class="badge red">Hors temps</span> <span class="small">Votre texte reste modifiable, mais il sera marqué « hors temps ».</span>' : c.warn ? '<span class="badge gold">Moins de 10 minutes : relisez-vous !</span>' : '';
        if (c.over && !S.pe.atLimit) { S.pe.atLimit = { text: S.pe.text, words: countWords(S.pe.text), at: nowIso() }; save(); }
      } else if (k === 'prep') {
        var p = prepClock(); if (!p) return;
        text = p.left >= 0 ? mmss(p.left) : '+' + mmss(-p.left); cls = p.over ? 'over' : p.left <= 300 ? 'warn' : '';
      } else if (k === 'rec' && REC) {
        var e2 = (now - REC.start) / 1000, sc2 = poSc();
        text = mmss(e2);
        if (REC.key === 'mono') cls = e2 < sc2.monologueMin * 60 ? '' : e2 <= sc2.monologueMax * 60 ? '' : 'warn';
      }
      if (text != null) { el.textContent = text; el.className = 'clock' + (cls ? ' ' + cls : ''); }
    });
  }

  /* ---------------- events */
  function onClick(e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    var act = b.getAttribute('data-act');
    switch (act) {
      case 'go': show(+b.getAttribute('data-i')); break;
      case 'toggle-en': LS.set(CFG.ns + ':en', !enOn()); applyEn(); break;
      case 'save-name':
        var v = ($('#nm').value || '').trim().replace(/\s+/g, ' ');
        if (v.length < 2) { ui.nameError = true; setName(''); } else { setName(v); ui.nameError = false; }
        renderToolbar(); renderStepper(); renderScreen(); break;
      case 'lex-check': S.lex.checked = true; save(); renderStepper(); renderScreen(); break;
      case 'lex-reset': S.lex = { a: {}, checked: false }; save(); renderStepper(); renderScreen(); break;
      case 'gram-check': S.gram.checked = true; save(); renderStepper(); renderScreen(); break;
      case 'gram-reset': S.gram = { a: {}, checked: false }; save(); renderStepper(); renderScreen(); break;
      case 'read-start': S.co.read[b.getAttribute('data-rec')] = { start: Date.now() }; save(); updatePlayer(b.getAttribute('data-rec')); break;
      case 'read-skip': S.co.read[b.getAttribute('data-rec')] = { start: Date.now(), skip: true }; save(); updatePlayer(b.getAttribute('data-rec')); break;
      case 'play': playRec(b.getAttribute('data-rec')); break;
      case 'submit': submitSection(b.getAttribute('data-sec')); break;
      case 'resend': sendSection(b.getAttribute('data-sec')); S.sends[b.getAttribute('data-sec')] = null; renderScreen(); break;
      case 'ce-timer': S.ce.timerStart = Date.now(); save(); renderScreen(); break;
      case 'pe-start': S.pe.timerStart = Date.now(); save(); renderScreen(); break;
      case 'pe-send': sendPE(); break;
      case 'pe-copy':
        var ta = $('#essay');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(S.pe.text).then(function () { b.textContent = 'Texte copié ✓'; }, function () { ta.select(); });
        else { ta.select(); try { document.execCommand('copy'); b.textContent = 'Texte copié ✓'; } catch (x) {} }
        break;
      case 'po-choose': if (!S.po.prepStart) { S.po.doc = b.getAttribute('data-doc'); save(); renderScreen(); } break;
      case 'po-prep-start': S.po.prepStart = Date.now(); S.po.prepEnd = null; save(); renderScreen(); break;
      case 'po-prep-end': S.po.prepEnd = Date.now(); save(); renderScreen(); break;
      case 'rec-start': startRec(b.getAttribute('data-key')); break;
      case 'rec-stop': stopRec(); break;
      case 'rec-dl': var k = b.getAttribute('data-key'); if (BLOBS[k]) download(BLOBS[k], recFile(k, BLOBS[k].type)); break;
      case 'zip-dl': zipAll(); break;
      case 'po-q': var d = poDoc(); if (d) d.examiner.forEach(function (q) { if (q.id === b.getAttribute('data-q')) playExaminer(q); }); break;
      case 'po-send': sendPO(); break;
      case 'bilan-send': sendBilan(); break;
      case 'reset-week': resetWeek(); break;
    }
  }
  function onChange(e) {
    var t = e.target;
    if (t.type === 'radio' && t.getAttribute('data-sec')) {
      var sec = t.getAttribute('data-sec');
      if (S[sec].submitted) return;
      S[sec].a[t.name] = +t.value; pending[sec] = false; save();
    } else if (t.hasAttribute('data-lex')) {
      S.lex.a[t.getAttribute('data-lex')] = t.value; save();
    } else if (t.hasAttribute('data-chk')) {
      S.pe.checks[t.getAttribute('data-chk')] = t.checked; pending.pe = false; save();
    }
  }
  function onInput(e) {
    var t = e.target;
    if (t.id === 'nm') { ui.nameError = false; return; }
    if (t.hasAttribute('data-gram')) { S.gram.a[t.getAttribute('data-gram')] = t.value; saveSoon(); }
    else if (t.getAttribute('data-pe') === 'text') {
      S.pe.text = t.value; saveSoon();
      var sc = D.screens[cur], w = wcInfo(sc), box = $('#wcbox');
      if (box) { box.className = 'wc ' + w.cls; $('#wcn').textContent = w.n + ' mot' + (w.n > 1 ? 's' : ''); $('#wcmsg').innerHTML = w.msg; }
    } else if (t.getAttribute('data-po') === 'notes') { S.po.notes = t.value; saveSoon(); }
    else if (t.hasAttribute('data-tr')) { S.po.tr[t.getAttribute('data-tr')] = t.value; saveSoon(); }
  }

  /* expose a tiny API for testing and later tools */
  window.DELF = { countWords: countWords, weekStatus: weekStatus, version: '1.0' };

  function boot() {
    try {
      if (document.getElementById('delf-data')) initWeek();
      else if (document.getElementById('delf-hub')) initHub();
    } catch (err) {
      var a = document.getElementById('delf-app') || document.body;
      a.insertAdjacentHTML('afterbegin', '<div class="card note red">Une erreur empêche l\'affichage du cours. Rechargez la page ; si le problème continue, écrivez à kce@kingcretot.com.</div>');
      if (window.console) console.error(err);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

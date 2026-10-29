/* KCE Game Plan — shared engine: franchise profile, XP, badges, season record,
   interactive items, lesson deck and Practice Here runner. */
(function () {
  'use strict';
  var FO = window.FO = {};
  var PFX = 'kce_fo_';
  FO.FORM = 'https://formspree.io/f/xppzdzwb';
  FO.MASTERY = 80;

  /* ---------- storage ---------- */
  function get(k, d) { try { var v = localStorage.getItem(PFX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) {} }
  FO.get = get; FO.set = set;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  FO.esc = esc;
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  FO.shuffle = shuffle;

  /* ---------- profile ---------- */
  FO.COLORS = ['#0A1F3D', '#0047BA', '#DB2F30', '#C9A84C', '#1E6B3A', '#5B2A86', '#E87722', '#111111', '#7A7F87', '#00A3AD'];
  FO.SHAPES = ['shield', 'circle', 'diamond', 'hex'];
  FO.profile = function () { return get('profile', { gm: '', city: '', team: '', c1: '#0047BA', c2: '#C9A84C', shape: 'shield' }); };
  FO.saveProfile = function (p) { set('profile', p); FO.renderBar(); };
  FO.gmLabel = function (n) { return /^(gm|coach|general manager)\b/i.test(n) ? n : 'GM ' + n; };
  FO.hasTeam = function () { var p = FO.profile(); return !!(p.team && p.gm); };
  FO.teamName = function () { var p = FO.profile(); return p.team ? ((p.city ? p.city + ' ' : '') + p.team) : 'Your Franchise'; };

  function shapePath(shape) {
    if (shape === 'circle') return '<circle cx="50" cy="50" r="44"/>';
    if (shape === 'diamond') return '<path d="M50 4 L96 50 L50 96 L4 50 Z"/>';
    if (shape === 'hex') return '<path d="M27 8 H73 L96 50 L73 92 H27 L4 50 Z"/>';
    return '<path d="M50 4 L90 16 V48 C90 72 72 88 50 96 C28 88 10 72 10 48 V16 Z"/>';
  }
  FO.logo = function (p, size) {
    p = p || FO.profile(); size = size || 100;
    var letter = esc(((p.team || 'F').trim()[0] || 'F').toUpperCase());
    var sp = shapePath(p.shape);
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="Team logo">' +
      '<g fill="' + p.c1 + '" stroke="' + p.c2 + '" stroke-width="6">' + sp + '</g>' +
      '<g fill="none" stroke="' + p.c2 + '" stroke-width="2" opacity=".55" transform="translate(50 50) scale(.78) translate(-50 -50)">' + sp + '</g>' +
      '<ellipse cx="50" cy="66" rx="17" ry="9" fill="' + p.c2 + '" opacity=".9"/>' +
      '<path d="M41 66 H59 M46 63 V69 M50 63 V69 M54 63 V69" stroke="' + p.c1 + '" stroke-width="1.6"/>' +
      '<text x="50" y="52" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="34" fill="' + p.c2 + '">' + letter + '</text></svg>';
  };

  /* ---------- XP, badges, record ---------- */
  FO.BADGES = {
    founder:   { n: 'Franchise Founder', d: 'Built your team', c: '#C9A84C', i: 'star' },
    fieldpos:  { n: 'Field Position', d: 'Finished Field Position', c: '#1E6B3A', i: 'ball' },
    filmroom:  { n: 'Film Room', d: 'Finished the Film Room', c: '#DB2F30', i: 'doc' },
    capwise:   { n: 'Cap Wise', d: 'Finished Cap Space', c: '#0047BA', i: 'cash' },
    w1win:     { n: 'Week 1 W', d: 'Won Practice Here, Week 1', c: '#0A1F3D', i: 'trophy' }
  };
  FO.addBadges = function (o) { for (var k in o) FO.BADGES[k] = o[k]; };
  function icon(kind, c) {
    if (kind === 'ball') return '<ellipse cx="50" cy="50" rx="20" ry="12" fill="#fff"/><path d="M40 50 H60 M45 47 V53 M50 47 V53 M55 47 V53" stroke="' + c + '" stroke-width="2"/>';
    if (kind === 'doc') return '<rect x="36" y="32" width="28" height="36" rx="3" fill="#fff"/><path d="M41 42 H59 M41 49 H59 M41 56 H53" stroke="' + c + '" stroke-width="2.5"/>';
    if (kind === 'cash') return '<text x="50" y="62" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="34" fill="#fff">$</text>';
    if (kind === 'trophy') return '<path d="M38 34 H62 V44 C62 54 56 58 50 58 C44 58 38 54 38 44 Z M47 58 H53 V64 H58 V68 H42 V64 H47 Z" fill="#C9A84C"/><path d="M38 38 H32 C32 46 36 48 39 48 M62 38 H68 C68 46 64 48 61 48" stroke="#C9A84C" stroke-width="2.5" fill="none"/>';
    return '<path d="M50 32 L55 45 L69 45 L58 53 L62 67 L50 59 L38 67 L42 53 L31 45 L45 45 Z" fill="#fff"/>';
  }
  FO.badgeSVG = function (id) {
    var b = FO.BADGES[id] || { c: '#0A1F3D', i: 'star' };
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 L88 18 V50 C88 74 70 90 50 97 C30 90 12 74 12 50 V18 Z" fill="' + b.c + '" stroke="#C9A84C" stroke-width="5"/>' + icon(b.i, b.c) + '</svg>';
  };
  FO.xp = function () { return get('xp', 0); };
  FO.addXP = function (n) { var before = Math.floor(FO.xp() / 300); set('xp', FO.xp() + n); FO.renderBar(); var after = Math.floor(FO.xp() / 300); if (after > before) setTimeout(function () { FO.toast('<b>Level up: GM Level ' + (after + 1) + '</b>Your front office is moving up.'); FO.confetti(); FO.tone('badge'); }, 3400); };
  FO.badges = function () { return get('badges', []); };
  FO.award = function (id) {
    var have = FO.badges(); if (have.indexOf(id) >= 0) return false;
    have.push(id); set('badges', have); FO.addXP(50);
    var b = FO.BADGES[id] || { n: id, d: '' };
    FO.toast('<b>Badge unlocked: ' + esc(b.n) + '</b>' + esc(b.d) + ' · +50 XP', FO.badgeSVG(id));
    FO.confetti(); FO.tone('badge'); return true;
  };
  FO.record = function () { return get('record', {}); };
  FO.setResult = function (week, score) {
    var r = FO.record(), cur = r[week];
    var wl = score >= FO.MASTERY ? 'W' : 'L';
    if (!cur || score > cur.score) { r[week] = { score: score, wl: wl }; set('record', r); }
    FO.renderBar(); return wl;
  };
  FO.wl = function () { var r = FO.record(), w = 0, l = 0; for (var k in r) { if (r[k].wl === 'W') w++; else l++; } return w + '–' + l; };

  /* ---------- top bar ---------- */
  FO.renderBar = function () {
    var el = $('#fo-bar'); if (!el) return;
    var xp = FO.xp(), lvl = Math.floor(xp / 300) + 1, pct = (xp % 300) / 3;
    var p = FO.profile();
    el.innerHTML = '<div class="fo-bar-in"><a class="fo-brand" href="' + (el.dataset.home || 'index.html') + '"><span class="fo-kc"><span>KC</span></span><span><b>Game Plan</b><small>KingCretot Experience</small></span></a>' +
      '<div class="fo-stats">' + (/(lesson|practice)\d+\.html$/.test(location.pathname) ? '<a class="fo-chip" style="color:#fff;text-decoration:none" href="' + (el.dataset.home || 'index.html') + '">⌂ Home</a>' : '') + (FO.hasTeam() ? '<span class="fo-chip tc" title="' + esc(FO.teamName()) + '"><span class="fo-mini-logo">' + FO.logo(p, 22) + '</span>' + esc(p.team) + '</span>' : '') +
      '<span class="fo-chip">Lvl ' + lvl + ' <span class="fo-xpbar"><i style="width:' + pct + '%"></i></span><span class="g">' + xp + ' XP</span></span>' +
      '<span class="fo-chip">Record <span class="g">' + FO.wl() + '</span></span></div></div>';
  };

  /* ---------- toast, confetti, sound ---------- */
  var tt;
  FO.toast = function (html, svg) {
    var t = $('#fo-toast'); if (!t) { t = document.createElement('div'); t.id = 'fo-toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = (svg || '') + '<div>' + html + '</div>'; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 3200);
  };
  FO.confetti = function () {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = $('#confetti'); if (!c) { c = document.createElement('canvas'); c.id = 'confetti'; document.body.appendChild(c); }
    var x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    var cols = ['#C9A84C', '#0047BA', '#DB2F30', '#FFFFFF', '#0A1F3D'];
    var P = []; for (var i = 0; i < 120; i++) P.push({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .4, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 5, a: Math.random() * 6, col: cols[i % 5] });
    var f = 0; (function draw() { x.clearRect(0, 0, c.width, c.height); P.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.a += .1; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.col; x.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .6); x.restore(); }); if (++f < 150) requestAnimationFrame(draw); else x.clearRect(0, 0, c.width, c.height); })();
  };
  var actx;
  FO.tone = function (kind) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var seq = { right: [660, 880], wrong: [240, 190], badge: [523, 659, 784, 1047], tap: [520] }[kind] || [600];
      seq.forEach(function (f, i) { var o = actx.createOscillator(), g = actx.createGain(); o.type = kind === 'wrong' ? 'triangle' : 'sine'; o.frequency.value = f; var t = actx.currentTime + i * .09; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.1, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .18); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .2); });
    } catch (e) {}
  };

  /* ---------- number line (football field) ---------- */
  FO.fieldSVG = function (min, max) {
    var narrow = (window.innerWidth || 800) < 600;
    var W = narrow ? 480 : 800, pad = narrow ? 26 : 40, FH = narrow ? 120 : 90, H = FH + 64, step = (W - 2 * pad) / (max - min), s = '';
    var fs = narrow ? 19 : 24, cy = 10 + FH / 2;
    s += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Number line from ' + min + ' to ' + max + ' drawn as a football field">';
    s += '<rect x="0" y="10" width="' + W + '" height="' + FH + '" rx="10" fill="#1E6B3A"/>';
    for (var v = min; v < max; v++) { var x = pad + (v - min) * step; if (v % 2 === 0) s += '<rect x="' + x + '" y="10" width="' + step + '" height="' + FH + '" fill="#26834A"/>'; }
    for (v = min; v <= max; v++) {
      x = pad + (v - min) * step;
      var zero = v === 0;
      s += '<line x1="' + x + '" y1="10" x2="' + x + '" y2="' + (10 + FH) + '" stroke="' + (zero ? '#C9A84C' : '#fff') + '" stroke-width="' + (zero ? 4 : (v % 5 === 0 ? 2.2 : 1)) + '" opacity="' + (zero ? 1 : .85) + '"/>';
      if (!narrow || v % 2 === 0) s += '<text x="' + x + '" y="' + (FH + 36) + '" text-anchor="middle" font-family="Arial" font-size="' + fs + '" font-weight="' + (zero ? 'bold' : 'normal') + '" fill="#0A1F3D">' + (v < 0 ? '−' + (-v) : v) + '</text>';
    }
    s += '<text x="' + (pad + (0 - min) * step) + '" y="' + (FH + 58) + '" text-anchor="middle" font-family="Arial" font-size="15" fill="#5A6275">line of scrimmage</text>';
    s += '<text x="' + (pad + 4) + '" y="32" font-family="Arial" font-size="16" font-weight="bold" fill="#fff" opacity=".85">◀ LOSS</text>';
    s += '<text x="' + (W - pad - 4) + '" y="32" text-anchor="end" font-family="Arial" font-size="16" font-weight="bold" fill="#fff" opacity=".85">GAIN ▶</text>';
    s += '<g class="ball" style="display:none"><ellipse cx="0" cy="' + cy + '" rx="15" ry="9" fill="#8B4A1F" stroke="#5C2E10" stroke-width="2"/><path d="M-6 ' + cy + ' H6 M-3 ' + (cy - 3) + ' V' + (cy + 3) + ' M0 ' + (cy - 3) + ' V' + (cy + 3) + ' M3 ' + (cy - 3) + ' V' + (cy + 3) + '" stroke="#fff" stroke-width="1.5"/></g>';
    s += '<rect class="hit" x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent" style="cursor:pointer"/></svg>';
    return { svg: s, cy: cy, x: function (val) { return pad + (val - min) * step; }, val: function (px) { return Math.max(min, Math.min(max, Math.round((px - pad) / step + min))); } };
  };
  function svgX(svg, evt) { var pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()).x; }
  function placeBall(svg, f, val) { var b = svg.querySelector('.ball'); b.style.display = ''; b.setAttribute('transform', 'translate(' + f.x(val) + ' 0)'); }
  FO.placeBall = placeBall;

  /* ---------- items ---------- */
  function norm(s) { return String(s).toLowerCase().replace(/[−–—]/g, '-').replace(/[’']/g, "'").replace(/\s+/g, ' ').replace(/^[\s"]+|[\s".!?]+$/g, ''); }
  function num(s) { s = String(s).replace(/[−–—]/g, '-').replace(/[$,\s]/g, '').replace(/^\+/, '').replace(/yards?|yds?$/i, ''); if (!/^-?\d*\.?\d+$/.test(s)) return NaN; return parseFloat(s); }
  FO.fmt = function (v) { return v < 0 ? '−' + (-v) : String(v); };

  /* Render one item. opts: {mode:'lesson'|'practice', onDone(res)} — res: {first:boolean, given:string} */
  FO.item = function (it, mount, opts) {
    opts = opts || {};
    var tries = 0, done = false, firstGiven = '', state = {};
    var max = 3;
    var box = document.createElement('div'); box.className = 'item';
    var h = '<p class="stem">' + it.q + '</p>';
    if (it.pre) h += it.pre;
    if (it.t === 'mc' || it.t === 'multi') {
      state.order = it.keep ? it.o.map(function (_, i) { return i; }) : shuffle(it.o.map(function (_, i) { return i; }));
      h += (it.t === 'multi' ? '<p style="font-size:14px;color:var(--muted);margin:-4px 0 8px">Choose ' + it.a.length + '.</p>' : '') + '<div class="opts">' + state.order.map(function (oi, n) { return '<button type="button" class="opt" data-i="' + oi + '"><span class="k">' + 'ABCDEFG'[n] + '</span><span>' + it.o[oi] + '</span></button>'; }).join('') + '</div>';
    } else if (it.t === 'num' || it.t === 'text') {
      h += '<div class="inrow"><input type="text" inputmode="' + (it.t === 'num' ? 'text' : 'text') + '" autocomplete="off" aria-label="Your answer" class="' + (it.t === 'text' ? 'wide' : '') + '" placeholder="' + (it.ph || 'Type your answer') + '">' + (it.unit ? '<span>' + it.unit + '</span>' : '') + '</div>';
    } else if (it.t === 'order') {
      state.pick = [];
      state.items = shuffle(it.items.map(function (_, i) { return i; }));
      h += '<div class="slots" aria-label="Your order"></div><div class="chips">' + state.items.map(function (i) { return '<button type="button" class="chipbtn" data-i="' + i + '">' + it.items[i] + '</button>'; }).join('') + '</div><button type="button" class="btn ghost clear" style="padding:6px 12px;font-size:13px">Clear</button>';
    } else if (it.t === 'sort') {
      state.place = {};
      state.items = shuffle(it.items.map(function (_, i) { return i; }));
      h += '<p style="font-size:14px;color:var(--muted);margin:-4px 0 8px">Tap an item, then tap the box it belongs in.</p><div class="chips pool">' + state.items.map(function (i) { return '<button type="button" class="chipbtn" data-i="' + i + '">' + it.items[i][0] + '</button>'; }).join('') + '</div><div class="bins">' + it.bins.map(function (b, bi) { return '<div class="bin" data-b="' + bi + '" role="button" tabindex="0"><h4>' + b + '</h4><div class="in"></div></div>'; }).join('') + '</div>';
    } else if (it.t === 'nl') {
      state.f = FO.fieldSVG(it.min, it.max);
      h += '<div class="nl-wrap">' + state.f.svg + '</div><div class="nudge"><button type="button" class="nl-l" aria-label="Move ball left one">◀</button><button type="button" class="nl-r" aria-label="Move ball right one">▶</button><span class="nl-read" style="font-size:14px;color:var(--muted)">Tap the field to place the ball, then use ◀ ▶ to fine-tune.</span></div>';
    }
    h += '<div class="inrow" style="margin-top:10px"><button type="button" class="btn navy check">Check</button><span class="tries"></span></div><div class="fb" role="status"></div>';
    box.innerHTML = h; mount.appendChild(box);
    var fb = $('.fb', box), btn = $('.check', box), triesEl = $('.tries', box);

    /* wiring */
    if (it.t === 'mc') $$('.opt', box).forEach(function (b) { b.addEventListener('click', function () { if (done) return; $$('.opt', box).forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); FO.tone('tap'); }); });
    if (it.t === 'multi') $$('.opt', box).forEach(function (b) { b.addEventListener('click', function () { if (done) return; b.classList.toggle('sel'); FO.tone('tap'); }); });
    if (it.t === 'num' || it.t === 'text') $('input', box).addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
    if (it.t === 'order') {
      var slots = $('.slots', box);
      $$('.chips .chipbtn', box).forEach(function (b) { b.addEventListener('click', function () { if (done || b.classList.contains('used')) return; state.pick.push(+b.dataset.i); b.classList.add('used'); slots.insertAdjacentHTML('beforeend', '<span class="chipbtn sel">' + it.items[+b.dataset.i] + '</span>'); FO.tone('tap'); }); });
      $('.clear', box).addEventListener('click', function () { if (done) return; resetOrder(); });
    }
    function resetOrder() { state.pick = []; $('.slots', box).innerHTML = ''; $$('.chips .chipbtn', box).forEach(function (b) { b.classList.remove('used'); }); }
    if (it.t === 'sort') {
      var cur = null;
      function selChip(b) { $$('.chipbtn', box).forEach(function (x) { x.classList.remove('sel'); }); if (cur === b) { cur = null; return; } cur = b; b.classList.add('sel'); FO.tone('tap'); }
      function drop(bin) { if (done || !cur) return; $('.in', bin).appendChild(cur); state.place[cur.dataset.i] = +bin.dataset.b; cur.classList.remove('sel'); cur = null; FO.tone('tap'); }
      box.addEventListener('click', function (e) {
        if (done) return;
        var chip = e.target.closest('.chipbtn'), bin = e.target.closest('.bin');
        if (chip && !chip.closest('.pool') && !bin) return;
        if (bin && cur && chip !== cur) { drop(bin); return; }
        if (chip) selChip(chip);
      });
      $$('.bin', box).forEach(function (bin) { bin.addEventListener('keydown', function (e) { if (e.target !== bin) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(bin); } }); });
    }
    function resetSort() { var pool = $('.pool', box); state.items.forEach(function (i) { var b = $('.chipbtn[data-i="' + i + '"]', box); b.classList.remove('sel'); pool.appendChild(b); }); state.place = {}; cur = null; }
    if (it.t === 'nl') {
      var svg = $('svg', box);
      function setV(v) { v = Math.max(it.min, Math.min(it.max, v)); state.v = v; placeBall(svg, state.f, v); $('.nl-read', box).textContent = 'Ball placed at ' + (v > 0 ? '+' : '') + FO.fmt(v) + '.'; FO.tone('tap'); }
      $('.hit', box).addEventListener('click', function (e) { if (done) return; setV(state.f.val(svgX(svg, e))); });
      $('.nl-l', box).addEventListener('click', function () { if (done) return; setV(state.v === undefined ? 0 : state.v - 1); });
      $('.nl-r', box).addEventListener('click', function () { if (done) return; setV(state.v === undefined ? 0 : state.v + 1); });
    }

    function response() {
      if (it.t === 'mc') { var s = $('.opt.sel', box); return s ? { ok: +s.dataset.i === it.a, txt: s.textContent.slice(1) } : null; }
      if (it.t === 'multi') { var sel = $$('.opt.sel', box).map(function (x) { return +x.dataset.i; }).sort(); if (!sel.length) return null; var a = it.a.slice().sort(); return { ok: sel.join() === a.join(), txt: sel.map(function (i) { return it.o[i]; }).join(' | ') }; }
      if (it.t === 'num') { var v = $('input', box).value.trim(); if (!v) return null; var n = num(v); if (isNaN(n)) return { bad: 'Type a number (use - for negative).' }; var ans = [].concat(it.a); return { ok: ans.some(function (x) { return Math.abs(x - n) < 1e-9; }), txt: v }; }
      if (it.t === 'text') { var t = $('input', box).value; if (!t.trim()) return null; var nt = norm(t); return { ok: it.a.some(function (x) { return norm(x) === nt; }), txt: t.trim() }; }
      if (it.t === 'order') { if (state.pick.length < it.items.length) return null; return { ok: state.pick.every(function (v, i) { return v === i; }), txt: state.pick.map(function (i) { return it.items[i]; }).join(', ') }; }
      if (it.t === 'sort') { if (Object.keys(state.place).length < it.items.length) return null; var okk = it.items.every(function (x, i) { return state.place[i] === x[1]; }); return { ok: okk, txt: it.items.map(function (x, i) { return x[0] + '→' + it.bins[state.place[i]]; }).join('; ') }; }
      if (it.t === 'nl') { if (state.v === undefined) return null; return { ok: state.v === it.a, txt: FO.fmt(state.v) }; }
    }
    function lock() { done = true; btn.disabled = true; $$('button.opt,.chipbtn,.clear,.nudge button', box).forEach(function (b) { b.disabled = true; }); var inp = $('input', box); if (inp) inp.disabled = true; }
    function showAnswer() {
      if (it.t === 'mc' || it.t === 'multi') { $$('.opt', box).forEach(function (b) { var i = +b.dataset.i; if ((it.t === 'mc' && i === it.a) || (it.t === 'multi' && it.a.indexOf(i) >= 0)) b.classList.add('right'); }); }
      if (it.t === 'nl') { placeBall($('svg', box), state.f, it.a); }
    }
    function ansText() {
      if (it.t === 'mc') return it.o[it.a];
      if (it.t === 'multi') return it.a.map(function (i) { return it.o[i]; }).join(' | ');
      if (it.t === 'num') return it.show || FO.fmt([].concat(it.a)[0]);
      if (it.t === 'text') return it.a[0];
      if (it.t === 'order') return it.items.join(', ');
      if (it.t === 'sort') return it.bins.map(function (b, bi) { return b + ': ' + it.items.filter(function (x) { return x[1] === bi; }).map(function (x) { return x[0]; }).join(', '); }).join(' · ');
      if (it.t === 'nl') return FO.fmt(it.a);
    }
    btn.addEventListener('click', function () {
      if (done) return;
      var r = response();
      if (!r) { fb.className = 'fb show info'; fb.textContent = it.t === 'order' ? 'Place every item first.' : it.t === 'sort' ? 'Put every item in a box first.' : 'Answer first, then check.'; return; }
      if (r.bad) { fb.className = 'fb show info'; fb.textContent = r.bad; return; }
      tries++; if (tries === 1) firstGiven = r.txt;
      if (r.ok) {
        lock(); showAnswer(); FO.tone('right');
        $$('.opt.sel', box).forEach(function (b) { b.classList.add('right'); });
        fb.className = 'fb show ok'; fb.innerHTML = '<b>' + (tries === 1 ? pick(['Touchdown!', 'Money.', 'Clean read.', 'That’s the play.', 'Locked in.']) : 'Got it.') + '</b> ' + (it.why || '');
        if (tries === 1 && opts.mode !== 'practice' && opts.key) { var dn = get('done', {}); if (!dn[opts.key]) { dn[opts.key] = 1; set('done', dn); FO.addXP(10); } }
        triesEl.textContent = '';
        if (opts.onDone) opts.onDone({ first: tries === 1, given: firstGiven, answer: ansText(), q: it.q });
        return;
      }
      FO.tone('wrong');
      if (tries >= max) {
        lock(); showAnswer();
        fb.className = 'fb show no'; fb.innerHTML = '<b>Answer: ' + esc(ansText()) + '.</b> ' + (it.why || '');
        triesEl.textContent = '';
        if (opts.onDone) opts.onDone({ first: false, given: firstGiven, answer: ansText(), q: it.q });
        return;
      }
      fb.className = 'fb show no'; fb.innerHTML = '<b>Not yet.</b> ' + (it.hint && tries === 2 ? esc(it.hint) : 'Run it back and try again.');
      triesEl.textContent = (max - tries) + (max - tries === 1 ? ' try' : ' tries') + ' left';
      if (it.t === 'mc' || it.t === 'multi') $$('.opt', box).forEach(function (b) { b.classList.remove('sel'); });
      if (it.t === 'num' || it.t === 'text') { var inp = $('input', box); inp.value = ''; inp.focus(); }
      if (it.t === 'order') resetOrder();
      if (it.t === 'sort') resetSort();
      if (it.t === 'nl') { state.v = undefined; $('svg .ball', box).style.display = 'none'; $('.nl-read', box).textContent = 'Tap the field to place the ball, then use ◀ ▶ to fine-tune.'; }
    });
    return box;
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- lesson deck ---------- */
  FO.deck = function (cfg) {
    var root = $('#deck'), slides = cfg.slides, i = 0;
    root.innerHTML = slides.map(function (s, n) { return '<section class="slide" data-n="' + n + '">' + s.html + '</section>'; }).join('');
    slides.forEach(function (s, n) {
      var sec = root.children[n];
      $$('[data-item]', sec).forEach(function (m) { var it = cfg.items[m.dataset.item]; if (it) FO.item(it, m, { mode: 'lesson', key: cfg.id + ':' + m.dataset.item, onDone: function (r) { if (it.badge && r) FO.award(it.badge); } }); });
      if (s.init) s.init(sec);
    });
    var nav = document.createElement('div'); nav.className = 'deck-nav';
    nav.innerHTML = '<div class="deck-nav-in"><button class="btn ghost prev" type="button">◀ Back</button><div class="deck-prog"><i></i></div><span class="deck-count"></span><button class="btn gold next" type="button">Next ▶</button></div>';
    document.body.appendChild(nav); document.body.classList.add('has-nav');
    var pk = 'pos_' + cfg.id + '_' + slides.length, saved = get(pk, 0);
    function show(n) {
      i = Math.max(0, Math.min(slides.length - 1, n));
      $$('.slide', root).forEach(function (s, k) { s.classList.toggle('on', k === i); });
      $('.deck-prog i', nav).style.width = ((i + 1) / slides.length * 100) + '%';
      $('.deck-count', nav).textContent = (i + 1) + ' / ' + slides.length;
      $('.prev', nav).disabled = i === 0;
      $('.next', nav).textContent = i === slides.length - 1 ? 'Done ✓' : 'Next ▶';
      set(pk, i); window.scrollTo({ top: 0 });
      if (slides[i].onShow) slides[i].onShow(root.children[i]);
    }
    $('.prev', nav).addEventListener('click', function () { show(i - 1); });
    $('.next', nav).addEventListener('click', function () { if (i === slides.length - 1) { location.href = cfg.home || 'index.html'; return; } show(i + 1); });
    document.addEventListener('keydown', function (e) { if (e.target.closest('input')) return; if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
    show(saved);
    FO.go = show;
  };

  /* ---------- franchise builder ---------- */
  FO.builder = function (mount, onSave) {
    var p = FO.profile();
    mount.innerHTML = '<div class="callout blue" style="margin-top:0"><b>You’re the GM.</b> GM is short for <b>general manager</b>, the boss who runs a football team. The GM picks the players, signs the contracts and decides how the team spends its money. In Game Plan, that’s your job.</div><div class="builder"><div>' +
      '<div class="field-row"><label for="b-gm">Your name or nickname</label><input id="b-gm" maxlength="40" value="' + esc(p.gm) + '" placeholder="Like Dre or Coach K"></div>' +
      '<div class="grid2"><div class="field-row"><label for="b-city">Home city</label><input id="b-city" maxlength="22" value="' + esc(p.city) + '" placeholder="Make one up or pick a real city"></div>' +
      '<div class="field-row"><label for="b-team">Team name</label><input id="b-team" maxlength="18" value="' + esc(p.team) + '" placeholder="Like the Storm or the Gators"></div></div>' +
      '<div class="field-row"><label>Primary color</label><div class="swatches" data-k="c1">' + FO.COLORS.map(function (c) { return '<button type="button" class="sw' + (c === p.c1 ? ' sel' : '') + '" style="background:' + c + '" data-c="' + c + '" aria-label="Color ' + c + '"></button>'; }).join('') + '</div></div>' +
      '<div class="field-row"><label>Trim color</label><div class="swatches" data-k="c2">' + FO.COLORS.concat(['#FFFFFF']).map(function (c) { return '<button type="button" class="sw' + (c === p.c2 ? ' sel' : '') + '" style="background:' + c + '" data-c="' + c + '" aria-label="Color ' + c + '"></button>'; }).join('') + '</div></div>' +
      '<div class="field-row"><label>Logo shape</label><div class="shapes">' + FO.SHAPES.map(function (s) { return '<button type="button" class="shapebtn' + (s === p.shape ? ' sel' : '') + '" data-s="' + s + '" aria-label="' + s + '">' + FO.logo({ team: p.team || 'F', c1: '#0A1F3D', c2: '#C9A84C', shape: s }, 44) + '</button>'; }).join('') + '</div></div>' +
      '<button type="button" class="btn gold save">Save my team</button><span class="saved" style="margin-left:10px;font-size:14px;color:var(--ok)"></span>' +
      '</div><div class="logo-card"><div class="lg"></div><div class="tn"></div><div class="gm"></div></div></div>';
    function read() { return { gm: $('#b-gm', mount).value.trim(), city: $('#b-city', mount).value.trim(), team: $('#b-team', mount).value.trim(), c1: p.c1, c2: p.c2, shape: p.shape }; }
    function preview() { var q = read(); $('.lg', mount).innerHTML = FO.logo(q, 150); $('.tn', mount).textContent = (q.city ? q.city + ' ' : '') + (q.team || 'Your Team'); $('.gm', mount).textContent = q.gm ? FO.gmLabel(q.gm) : 'General Manager'; }
    function autosave() { var q = read(); if (q.gm && q.team && q.c1 !== q.c2) { set('profile', q); } }
    $$('input', mount).forEach(function (x) { x.addEventListener('input', function () { preview(); autosave(); }); });
    $$('.swatches', mount).forEach(function (row) { row.addEventListener('click', function (e) { var b = e.target.closest('.sw'); if (!b) return; $$('.sw', row).forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); p[row.dataset.k] = b.dataset.c; preview(); autosave(); FO.tone('tap'); }); });
    $('.shapes', mount).addEventListener('click', function (e) { var b = e.target.closest('.shapebtn'); if (!b) return; $$('.shapebtn', mount).forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); p.shape = b.dataset.s; preview(); autosave(); FO.tone('tap'); });
    $('.save', mount).addEventListener('click', function () {
      var q = read(); if (!q.gm || !q.team) { $('.saved', mount).style.color = 'var(--bad)'; $('.saved', mount).textContent = 'Add your name and a team name first.'; return; }
      if (q.c1 === q.c2) { $('.saved', mount).style.color = 'var(--bad)'; $('.saved', mount).textContent = 'Pick two different colors so the logo pops.'; return; }
      FO.saveProfile(q); $('.saved', mount).style.color = 'var(--ok)'; $('.saved', mount).textContent = 'Team saved. You won’t need to do this again.'; FO.award('founder'); if (onSave) onSave(q);
    });
    preview();
  };

  /* ---------- Practice Here runner ---------- */
  FO.practice = function (cfg) {
    var root = $('#practice');
    var attempts = get('pattempt_' + cfg.week, 0);
    var setKey = cfg.sets[attempts % 2 === 0 ? 'A' : 'B'] ? (attempts % 2 === 0 ? 'A' : 'B') : 'A';
    var items = cfg.sets[setKey], idx = 0, firsts = 0, log = [], start = Date.now();
    function gate() {
      var p = FO.profile();
      root.innerHTML = '<div class="slide on"><div class="eyebrow">Practice Here · Week ' + cfg.week + '</div><h2>' + esc(cfg.title) + '</h2>' +
        '<p>' + items.length + ' plays. Only your <b>first try</b> counts toward your score, but you get three tries on every question, and if you miss three times, we’ll show you the answer and why. Score ' + FO.MASTERY + ' or more to put a <b>W</b> in your season record. Your results go to your KCE teacher.</p>' +
        '<div class="field-row" style="max-width:420px"><label for="p-name">Your first and last name</label><input id="p-name" value="' + esc(get('student', '')) + '" maxlength="40" placeholder="First and last name"></div><p class="err" style="color:var(--bad);font-size:14px;min-height:20px;margin:0"></p>' +
        '<button class="btn gold go" type="button">Start practice ▶</button>' + (attempts ? '<p style="font-size:14px;color:var(--muted);margin-top:10px">This is try ' + (attempts + 1) + ', so you get a fresh set of questions.</p>' : '') + '</div>';
      $('.go', root).addEventListener('click', function () {
        var n = $('#p-name', root).value.trim(); if (n.split(/\s+/).length < 2) { $('.err', root).textContent = 'Type your first and last name.'; return; }
        cfg.name = n; set('student', n);
        start = Date.now(); next();
      });
    }
    function next() {
      if (idx >= items.length) return finish();
      var it = items[idx];
      root.innerHTML = '<div class="slide on"><div class="p-top"><span class="pill ' + (it.s === 'Math' ? 'm' : it.s === 'ELA' ? 'e' : 'f') + '">' + it.s + '</span><span class="p-count">Play ' + (idx + 1) + ' of ' + items.length + '</span><span class="p-score">' + firsts + ' first-try ✓</span></div><div class="deck-prog" style="margin-bottom:12px"><i style="width:' + (idx / items.length * 100) + '%"></i></div>' + (it.passage ? cfg.passages[setKey] : '') + '<div class="mnt"></div><div class="inrow" style="margin-top:6px"><button class="btn gold nx" type="button" style="display:none">' + (idx === items.length - 1 ? 'See my results ▶' : 'Next play ▶') + '</button></div></div>';
      FO.item(it, $('.mnt', root), { mode: 'practice', onDone: function (r) { if (r.first) firsts++; else log.push({ n: idx + 1, s: it.s, q: plain(it.q), given: r.given, answer: r.answer }); $('.nx', root).style.display = ''; $('.nx', root).focus(); } });
      $('.nx', root).addEventListener('click', function () { idx++; next(); });
      window.scrollTo({ top: 0 });
    }
    function finish() {
      var score = Math.round(firsts / items.length * 100), wl = FO.setResult(cfg.week, score);
      set('pattempt_' + cfg.week, attempts + 1); FO.addXP(firsts * 10);
      if (wl === 'W' && cfg.winBadge) FO.award(cfg.winBadge);
      var bySub = {}; items.forEach(function (it) { bySub[it.s] = bySub[it.s] || [0, 0]; bySub[it.s][1]++; });
      items.forEach(function (it, k) { if (!log.some(function (l) { return l.n === k + 1; })) bySub[it.s][0]++; });
      var subTxt = Object.keys(bySub).map(function (k) { return k + ' ' + bySub[k][0] + '/' + bySub[k][1]; }).join(' · ');
      root.innerHTML = '<div class="slide on result"><div class="eyebrow">Final score · Week ' + cfg.week + '</div><div class="big">' + score + '</div>' +
        '<div class="wl ' + wl + '" style="background:' + (wl === 'W' ? '#E8F5EC;color:#1E7B3A' : '#FDECEC;color:#C0262B') + '">' + (wl === 'W' ? 'W · Win in the books' : 'L · Run it back') + '</div>' +
        '<p>' + firsts + ' of ' + items.length + ' right on the first try. ' + subTxt + '.</p>' +
        (wl === 'W' ? '<p>That’s a win for ' + esc(FO.teamName()) + '. Season record: <b>' + FO.wl() + '</b>.</p>' : '<p>Review the plays below, then run it back. Your next try is a brand-new set of questions.</p>') +
        '<div class="inrow" style="justify-content:center;margin:8px 0"><button class="btn navy again" type="button">Run it back (new set)</button><a class="btn ghost" href="' + (cfg.home || 'index.html') + '">Home</a></div>' +
        (log.length ? '<ol class="missed">' + log.map(function (l) { return '<li><b>' + esc(l.s) + ':</b> ' + esc(l.q) + '<br><span style="color:var(--muted)">You first said: ' + esc(l.given) + ' · Answer: ' + esc(l.answer) + '</span></li>'; }).join('') + '</ol>' : '') +
        '<p class="sendst" style="font-size:14px;color:var(--muted)">Sending your results to your KCE teacher…</p></div>';
      $('.again', root).addEventListener('click', function () { location.reload(); });
      if (wl === 'W') FO.confetti();
      var payload = {
        _subject: 'Game Plan: ' + cfg.name + ' Week ' + cfg.week + ' practice ' + score + ' (' + wl + ')',
        program: 'KCE Game Plan', student: cfg.name, team: FO.teamName(), module: 'game-plan-week' + cfg.week + '-practice',
        lesson: 'Week ' + cfg.week + ': ' + cfg.title, set: setKey, attempt: attempts + 1, score: score, mastered: wl === 'W' ? 'yes' : 'no',
        correct_first_try: firsts + ' of ' + items.length, by_subject: subTxt, season_record: FO.wl(),
        missed: log.length ? log.map(function (l) { return 'Play ' + l.n + ' (' + l.s + '): ' + l.q + ' | first try: ' + l.given + ' | answer: ' + l.answer; }).join('\n') : 'none',
        minutes: Math.max(1, Math.round((Date.now() - start) / 60000)), timestamp: new Date().toISOString()
      };
      fetch(FO.FORM, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { $('.sendst', root).textContent = r.ok ? '✓ Results sent to KCE.' : 'Your results did not send. Tell your KCE teacher your score: ' + score + '.'; })
        .catch(function () { $('.sendst', root).textContent = 'Your results did not send. Tell your KCE teacher your score: ' + score + '.'; });
    }
    function plain(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); }
    gate();
  };


  /* ---------- teacher mode and date unlocks ---------- */
  FO.TPIN = '9110';
  FO.teacher = function () { try { return localStorage.getItem('kce_fo_teacher') === '1'; } catch (e) { return false; } };
  FO.today = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  FO.isOpen = function (iso) { return FO.teacher() || FO.today() >= iso; };
  FO.teacherToggle = function (mount) {
    var on = FO.teacher();
    mount.innerHTML = '<button type="button" class="tbtn">' + (on ? 'Teacher mode is on: every lesson is open on this device (tap to turn off)' : 'Teacher: open every lesson on this device') + '</button>';
    mount.querySelector('button').addEventListener('click', function () {
      if (FO.teacher()) { try { localStorage.removeItem('kce_fo_teacher'); } catch (e) {} location.reload(); return; }
      var v = prompt('Teacher code'); if (v === null) return;
      if (v === FO.TPIN) { try { localStorage.setItem('kce_fo_teacher', '1'); } catch (e) {} location.reload(); } else alert('That code is not right.');
    });
  };
  FO.gate = function (iso, label, root) {
    if (FO.isOpen(iso)) return true;
    var p = iso.split('-'), M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    root.innerHTML = '<div class="slide on" style="text-align:center;max-width:520px;margin:30px auto"><div style="font-size:44px">🔒</div><h2>' + esc(label) + ' opens Thu, ' + M[+p[1] - 1] + ' ' + (+p[2]) + '</h2><p style="margin:0 auto 14px">Check back on lesson day.</p>' +
      '<div class="inrow" style="justify-content:center"><a class="btn navy" href="index.html">Home</a></div>' +
      '<p style="font-size:13px;color:var(--muted);margin:20px auto 0">Teacher code: <input id="tpin" type="password" inputmode="numeric" style="width:100px;font:inherit;padding:6px 8px;border:2px solid var(--line);border-radius:8px"> <button type="button" class="btn ghost" id="tok" style="padding:6px 12px;font-size:13px">Open</button></p><p id="tmsg" style="font-size:13px;color:var(--bad);margin:6px auto 0"></p></div>';
    root.querySelector('#tok').addEventListener('click', function () {
      if (root.querySelector('#tpin').value === FO.TPIN) { try { localStorage.setItem('kce_fo_teacher', '1'); } catch (e) {} location.reload(); }
      else root.querySelector('#tmsg').textContent = 'That code is not right.';
    });
    return false;
  };
  document.addEventListener('DOMContentLoaded', FO.renderBar);
})();

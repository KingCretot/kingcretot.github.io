/* KCE GED Prep course engine — KingCretot Experience.
   One page: Intro, Diagnostic, Weeks 1-10. Each subject lesson: Teaching Lesson (slide deck with instructor notes),
   Student Lesson (screens with checks), Practice (Set A/B), Exit Check (Form A/B), Study Sheet, instructor Answer Key.
   Results go to Formspree with every question, the answer chosen and the correct answer. */
(function(){
'use strict';
var FORM = 'https://formspree.io/f/xkjjweje';
var SUBJ = {
  math:{name:'Mathematical Reasoning', short:'Math', min:115},
  rla:{name:'Reasoning Through Language Arts', short:'Language Arts', min:150},
  ss:{name:'Social Studies', short:'Social Studies', min:70},
  sci:{name:'Science', short:'Science', min:90}
};
var ORDER = ['math','rla','ss','sci'];
var MAP = [null,
 {math:'Number Sense',rla:'Main Idea & Details',ss:'Foundations of Democracy',sci:'Science Practices'},
 {math:'Ratios, Rates & Percents',rla:'Inference & Evidence',ss:'The Constitution',sci:'Working with Data'},
 {math:'Exponents, Roots & Scientific Notation',rla:'Structure, Purpose & Point of View',ss:'Rights & Amendments',sci:'Cells & Energy'},
 {math:'Data, Statistics & Probability',rla:'Word Meaning, Tone & Figurative Language',ss:'Elections & Public Policy',sci:'Human Body & Health'},
 {math:'Geometry I: Area & Pythagorean Theorem',rla:'Analyzing Arguments',ss:'U.S. History I',sci:'Genetics & Heredity'},
 {math:'Geometry II: Volume & Surface Area',rla:'Comparing Two Texts',ss:'U.S. History II',sci:'Evolution & Ecosystems'},
 {math:'Algebraic Expressions & Polynomials',rla:'Grammar I: Sentence Structure',ss:'Economics',sci:'Chemistry'},
 {math:'Equations & Inequalities',rla:'Grammar II: Usage & Mechanics',ss:'Economics & Geography',sci:'Physics: Motion & Forces'},
 {math:'Graphs & Functions',rla:'Extended Response I',ss:'Social Studies Practices',sci:'Energy & Waves'},
 {math:'Quadratics & Review',rla:'Extended Response II & Review',ss:'Integrated Review',sci:'Earth & Space; Review'}
];
var $ = function(s,r){return (r||document).querySelector(s)}, $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var app = $('#app');

/* ---------- storage (always guarded) ---------- */
function sget(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function sset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function sdel(k){try{localStorage.removeItem(k)}catch(e){}}
var PROG_KEY='kce_ged_progress_v1';
function prog(){return sget(PROG_KEY,{})}
function setProg(key,val){var p=prog();p[key]=val;sset(PROG_KEY,p);}

/* ---------- data ---------- */
var cache={};
function load(name){
  if (cache[name]) return Promise.resolve(cache[name]);
  return fetch('data/'+name+'.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){cache[name]=d;return d});
}
function pad(n){return (n<10?'0':'')+n}
function esc(s){return String(s==null?'':s).replace(/<\/?(em|strong|i|b|sub|sup)>/gi,'').replace(/&(?!(?:[a-z]+|#\d+);)|[<>"]/gi,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function txt(html){var d=document.createElement('div');d.innerHTML=String(html||'').replace(/<br\s*\/?>/g,' ').replace(/<\/(p|li|tr|h3|h4|div)>/g,' $& ');return d.textContent.replace(/\s+/g,' ').trim()}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shuffled(n,seed){var a=[];for(var i=0;i<n;i++)a.push(i);var x=hash(seed)||1;for(var j=n-1;j>0;j--){x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;var k=x%(j+1);var t=a[j];a[j]=a[k];a[k]=t}return a}
var LET='ABCDEF';

/* ---------- nav ---------- */
function renderNav(active, crumbs){
  var nav=$('#cnav');
  if (active==='home'){nav.innerHTML='';nav.style.display='none';return}
  nav.style.display='';
  if (!crumbs){ var m=/^week-(\d+)$/.exec(active||''); crumbs=active==='intro'?[['#intro','Start Here']]:active==='diagnostic'?[['#diagnostic','Diagnostic']]:m?[['#week-'+m[1],'Week '+m[1]]]:[]; }
  var h='<div class="wrap crumbs"><a href="#home" class="home">← All Weeks</a>';
  crumbs.forEach(function(c,i){h+='<span class="sep">›</span>'+(i===crumbs.length-1?'<span class="cur">'+esc(c[1])+'</span>':'<a href="'+c[0]+'">'+esc(c[1])+'</a>')});
  nav.innerHTML=h+'</div>';
}

/* ---------- router ---------- */
var stopRunner=null;
function route(){
  if (stopRunner){stopRunner();stopRunner=null}
  closeCalc(); document.body.classList.remove('testing');
  var h=(location.hash||'#home').slice(1).split('/');
  document.body.classList.toggle('inner',!(h[0]==='home'||h[0]===''||h[0]==='intro'));
  window.scrollTo(0,0);
  if (h[0]==='home'||h[0]===''){renderNav('home');return renderHome()}
  if (h[0]==='intro'){renderNav('intro');app.innerHTML=$('#tpl-intro').innerHTML;return}
  if (h[0]==='diagnostic'){renderNav('diagnostic');return h[1]==='take'?runTest('diagnostic'):diagHub()}
  var m=h[0].match(/^week-(\d+)$/);
  if (m){var w=+m[1]; if(w<1||w>10){location.hash='#home';return}
    if (h[1]==='exam'){renderNav('week-'+w,[['#week-'+w,'Week '+w],['#week-'+w+'/exam','Practice GED']]); return h[2]&&SUBJ[h[2]]?runTest('exam'+pad(w)+'-'+h[2],w):examHub(w);}
    if (!h[1]) return weekPage(w);
    if (!SUBJ[h[1]]){location.hash='#week-'+w;return}
    var s=h[1], v=h[2]||'';
    if (v==='teach') return deckView(w,s);
    if (v==='presenter') return presenterView(w,s);
    if (v==='learn') return learnView(w,s);
    if (v==='practice'||v==='exit') return quizView(w,s,v);
    if (v==='notes') return notesView(w,s);
    if (v==='key') return keyView(w,s);
    if (v){location.hash='#week-'+w+'/'+s;return}
    return subjHub(w,s);
  }
  location.hash='#home';
}
window.addEventListener('hashchange',route);


/* ---------- course home: one page, one card per week ---------- */
function renderHome(){
  var p=prog(), sent=0, h='';
  for (var w=1;w<=10;w++) ORDER.forEach(function(s){ if(p['exam'+pad(w)+'-'+s]) sent++ });
  h+='<div class="hstrip"><div><b>10 weeks</b> · all four GED subjects every week</div><div><b>40 timed tests</b> · '+sent+' sent</div><div><b>Your pace</b> · work in order, any days you choose</div></div>';
  h+='<section class="hblock"><div class="fl"></div><h2>Start here</h2><p>Read how the GED works, then take the Diagnostic before Week 1.</p></section><div class="hgrid">';
  h+='<article class="hcard"><div class="wk">Step 1</div><h3>The GED and This Course</h3><p class="hsub">The four tests, how they are timed and scored, question types, the calculator and test-day tips.</p><div class="tags"><span class="tag t-lesson">Read first</span></div><div class="links"><a class="hbtn" href="#intro">Open Start Here</a></div></article>';
  var d=p.diagnostic;
  h+='<article class="hcard milestone"><div class="wk">Step 2</div><h3>Diagnostic</h3><p class="hsub">50 questions across all four subjects plus a short writing sample. Not timed. Your answers go to your instructor.</p><div class="tags"><span class="tag t-diag">Diagnostic</span></div>'+(d?'<div class="hdone">✓ Sent '+esc(d.when)+'</div>':'')+'<div class="links"><a class="hbtn" href="#diagnostic">'+(d?'Open the Diagnostic':'Start the Diagnostic')+'</a></div></article></div>';
  h+='<section class="hblock"><div class="fl"></div><h2>Your 10 weeks</h2><p>Each week has its own card: four subject lessons and a timed Practice GED. A check mark means that lesson&rsquo;s Exit Check is passed.</p></section><div class="wgrid">';
  for (var w2=1;w2<=10;w2++){ (function(w){
    var t=MAP[w], n=ORDER.filter(function(s){return p['exam'+pad(w)+'-'+s]}).length;
    h+='<article class="wcard"><div class="whead"><div class="wk">Week '+w+' of 10</div><h3>Week '+w+'</h3></div><ul class="wsubs">';
    ORDER.forEach(function(s){
      var X=p['exit-'+lkey(w,s)];
      h+='<li><a href="#week-'+w+'/'+s+'"><span class="ws">'+SUBJ[s].short+'</span><span class="wt">'+esc(t[s])+'</span><span class="wgo">'+(X&&X.passed?'<i class="ok" title="Exit Check passed">✓</i>':'')+'Open →</span></a></li>';
    });
    h+='</ul><a class="wexam" href="#week-'+w+'/exam"><span><b>Week '+w+' Practice GED</b><small>Four timed tests · '+(n?n+' of 4 sent':'Math, Language Arts, Social Studies, Science')+'</small></span><span class="wgo">Open →</span></a></article>';
  })(w2) }
  h+='</div>';
  app.innerHTML=h;
}

/* open <details> for printing so answers print */
var openedForPrint=[];
window.addEventListener('beforeprint',function(){openedForPrint=$$('details:not([open])');openedForPrint.forEach(function(d){d.open=true})});
window.addEventListener('afterprint',function(){openedForPrint.forEach(function(d){d.open=false});openedForPrint=[]});

/* ---------- figures ---------- */
var NS='http://www.w3.org/2000/svg';
function figureHTML(f, opts){
  if (!f) return '';
  if (f.type==='svg') return '<div class="figure" role="img" aria-label="'+esc(f.alt||'figure')+'">'+sanitizeSVG(f.svg)+'</div>';
  if (f.type==='bar'||f.type==='line') return '<div class="figure">'+chartSVG(f)+'</div>';
  if (f.type==='plane') return '<div class="figure">'+planeSVG(f,opts)+'</div>';
  if (f.type==='pie') return '<div class="figure">'+pieSVG(f)+'</div>';
  return '';
}
function sanitizeSVG(s){return String(s).replace(/<(script|foreignObject|image|a)\b[\s\S]*?<\/\1>/gi,'').replace(/\son\w+=("[^"]*"|'[^']*')/gi,'')}
var PALETTE=['#0A1F3D','#C9A84C','#0047BA','#DB2F30','#1E7A46'];
function chartSVG(f){
  var W=560,H=320,L=60,R=20,T=f.title?34:14,B=f.xLabel?62:44;
  var vals=[];f.series.forEach(function(s){vals=vals.concat(s.values)});
  var max=Math.max.apply(null,vals.concat([0])),min=Math.min.apply(null,vals.concat([0]));
  var step=niceStep((max-min)/5||1); var top=Math.ceil(max/step)*step, bot=Math.floor(min/step)*step; if(top===bot)top=bot+step;
  var pw=W-L-R, ph=H-T-B, n=f.labels.length;
  function y(v){return T+ph-(v-bot)/(top-bot)*ph}
  var s='<svg viewBox="0 0 '+W+' '+H+'" xmlns="'+NS+'" font-family="Arial" font-size="13" role="img" aria-label="'+esc(f.title||'chart')+'">';
  if (f.title) s+='<text x="'+(W/2)+'" y="20" text-anchor="middle" font-weight="bold" fill="#0A1F3D" font-size="15">'+esc(f.title)+'</text>';
  for (var v=bot; v<=top+1e-9; v+=step){var yy=y(v);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="#E2DDD0"/><text x="'+(L-6)+'" y="'+(yy+4)+'" text-anchor="end" fill="#333">'+fmt(v)+'</text>'}
  s+='<line x1="'+L+'" x2="'+L+'" y1="'+T+'" y2="'+(T+ph)+'" stroke="#0A1F3D"/><line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(Math.max(bot,0))+'" y2="'+y(Math.max(bot,0))+'" stroke="#0A1F3D"/>';
  var bw=pw/n;
  f.labels.forEach(function(lb,i){var cx=L+bw*i+bw/2; s+='<text x="'+cx+'" y="'+(T+ph+18)+'" text-anchor="middle" fill="#333">'+esc(lb)+'</text>'});
  if (f.type==='bar'){
    var k=f.series.length, gw=bw*0.72, w1=gw/k;
    f.series.forEach(function(se,j){se.values.forEach(function(v,i){var x=L+bw*i+(bw-gw)/2+w1*j, y0=y(Math.max(bot,0)), y1=y(v); s+='<rect x="'+x+'" y="'+Math.min(y0,y1)+'" width="'+(w1-2)+'" height="'+Math.abs(y0-y1)+'" fill="'+PALETTE[j%5]+'"/>'; if(k===1) s+='<text x="'+(x+w1/2-1)+'" y="'+(Math.min(y0,y1)-4)+'" text-anchor="middle" font-size="12" fill="#0A1F3D">'+fmt(v)+'</text>'})});
  } else {
    f.series.forEach(function(se,j){var pts=se.values.map(function(v,i){return (L+bw*i+bw/2)+','+y(v)}).join(' ');s+='<polyline points="'+pts+'" fill="none" stroke="'+PALETTE[j%5]+'" stroke-width="2.5"/>';se.values.forEach(function(v,i){s+='<circle cx="'+(L+bw*i+bw/2)+'" cy="'+y(v)+'" r="3.5" fill="'+PALETTE[j%5]+'"/>';if(f.series.length===1&&f.pointLabels!==false)s+='<text x="'+(L+bw*i+bw/2)+'" y="'+(y(v)-8)+'" text-anchor="middle" font-size="12" fill="#0A1F3D">'+fmt(v)+'</text>'})});
  }
  if (f.xLabel) s+='<text x="'+(L+pw/2)+'" y="'+(H-12)+'" text-anchor="middle" fill="#0A1F3D" font-weight="bold">'+esc(f.xLabel)+'</text>';
  if (f.yLabel) s+='<text transform="translate(14,'+(T+ph/2)+') rotate(-90)" text-anchor="middle" fill="#0A1F3D" font-weight="bold">'+esc(f.yLabel)+'</text>';
  if (f.series.length>1){var lx=L+6;f.series.forEach(function(se,j){s+='<rect x="'+lx+'" y="'+(T+2)+'" width="12" height="12" fill="'+PALETTE[j%5]+'"/><text x="'+(lx+16)+'" y="'+(T+12)+'" fill="#333">'+esc(se.name)+'</text>';lx+=26+String(se.name).length*7})}
  return s+'</svg>';
}
function pieSVG(f){
  var tot=f.values.reduce(function(a,b){return a+b},0)||1, W=560, H=f.title?330:300, cx=160, cy=(f.title?40:16)+140, r=130, a0=-Math.PI/2;
  var s='<svg viewBox="0 0 '+W+' '+H+'" xmlns="'+NS+'" font-family="Arial" font-size="13" role="img" aria-label="'+esc(f.title||'circle graph')+'">';
  if (f.title) s+='<text x="'+(W/2)+'" y="20" text-anchor="middle" font-weight="bold" fill="#0A1F3D" font-size="15">'+esc(f.title)+'</text>';
  var PC=['#0A1F3D','#C9A84C','#0047BA','#DB2F30','#1E7A46','#7A6418','#5B6475','#9FB7E8'];
  f.values.forEach(function(v,i){var a1=a0+v/tot*2*Math.PI, big=(a1-a0)>Math.PI?1:0;
    if (f.values.length===1) s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+PC[0]+'"/>';
    else s+='<path d="M'+cx+','+cy+' L'+(cx+r*Math.cos(a0))+','+(cy+r*Math.sin(a0))+' A'+r+','+r+' 0 '+big+' 1 '+(cx+r*Math.cos(a1))+','+(cy+r*Math.sin(a1))+' Z" fill="'+PC[i%8]+'" stroke="#fff" stroke-width="2"/>';
    var ly=(f.title?44:20)+i*24; s+='<rect x="320" y="'+(ly-11)+'" width="14" height="14" fill="'+PC[i%8]+'"/><text x="340" y="'+ly+'" fill="#1A2433">'+esc(f.labels[i])+(f.showValues===false?'':': '+fmt(v)+(f.unit||''))+'</text>';
    a0=a1});
  return s+'</svg>';
}
function niceStep(raw){var p=Math.pow(10,Math.floor(Math.log10(raw)));var m=raw/p;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p}
function fmt(v){return Math.abs(v)>=1000?v.toLocaleString('en-US'):String(Math.round(v*1000)/1000)}
function planeSVG(f, opts){
  opts=opts||{};
  var nx=f.xmax-f.xmin, ny=f.ymax-f.ymin, cell=Math.max(18,Math.min(34,Math.floor(420/Math.max(nx,ny)))), pad=24;
  var W=nx*cell+pad*2, H=ny*cell+pad*2;
  function X(x){return pad+(x-f.xmin)*cell} function Y(y){return pad+(f.ymax-y)*cell}
  var s='<svg viewBox="0 0 '+W+' '+H+'" xmlns="'+NS+'" font-family="Arial" font-size="11" class="plane" role="img" aria-label="coordinate plane">';
  for (var x=f.xmin;x<=f.xmax;x++) s+='<line x1="'+X(x)+'" x2="'+X(x)+'" y1="'+Y(f.ymin)+'" y2="'+Y(f.ymax)+'" stroke="'+(x===0?'#0A1F3D':'#E2DDD0')+'" stroke-width="'+(x===0?1.6:1)+'"/>';
  for (var y=f.ymin;y<=f.ymax;y++) s+='<line x1="'+X(f.xmin)+'" x2="'+X(f.xmax)+'" y1="'+Y(y)+'" y2="'+Y(y)+'" stroke="'+(y===0?'#0A1F3D':'#E2DDD0')+'" stroke-width="'+(y===0?1.6:1)+'"/>';
  var lab=Math.max(1,Math.ceil(Math.max(nx,ny)/12));
  if (f.ymin<=0&&f.ymax>=0) for (x=f.xmin;x<=f.xmax;x++) if(x!==0&&x%lab===0) s+='<text x="'+X(x)+'" y="'+(Y(0)+13)+'" text-anchor="middle" fill="#555">'+x+'</text>';
  if (f.xmin<=0&&f.xmax>=0) for (y=f.ymin;y<=f.ymax;y++) if(y!==0&&y%lab===0) s+='<text x="'+(X(0)-5)+'" y="'+(Y(y)+4)+'" text-anchor="end" fill="#555">'+y+'</text>';
  s+='<defs><clipPath id="pc'+(planeSVG.n=(planeSVG.n||0)+1)+'"><rect x="'+X(f.xmin)+'" y="'+Y(f.ymax)+'" width="'+(nx*cell)+'" height="'+(ny*cell)+'"/></clipPath></defs><g clip-path="url(#pc'+planeSVG.n+')">';
  (f.lines||[]).forEach(function(l,i){var c=PALETTE[(i+2)%5];s+='<line x1="'+X(f.xmin)+'" y1="'+Y(l.m*f.xmin+l.b)+'" x2="'+X(f.xmax)+'" y2="'+Y(l.m*f.xmax+l.b)+'" stroke="'+c+'" stroke-width="2.5"/>'});
  (f.parabolas||[]).forEach(function(p,i){var pts=[];for(var t=f.xmin;t<=f.xmax+1e-9;t+=nx/200){pts.push(X(t)+','+Y(p.a*(t-p.h)*(t-p.h)+p.k))}s+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+PALETTE[(i+3)%5]+'" stroke-width="2.5"/>'});
  (f.segments||[]).forEach(function(g){s+='<line x1="'+X(g[0][0])+'" y1="'+Y(g[0][1])+'" x2="'+X(g[1][0])+'" y2="'+Y(g[1][1])+'" stroke="#0A1F3D" stroke-width="2.5"/>'});
  s+='</g>';
  (f.lines||[]).forEach(function(l,i){if(!l.label)return;var xx=f.xmax-1,yy=l.m*xx+l.b; if(yy>f.ymax-1){xx=(f.ymax-1-l.b)/l.m;yy=f.ymax-1} if(yy<f.ymin+1){xx=(f.ymin+1-l.b)/l.m;yy=f.ymin+1} s+='<text x="'+(X(xx)-4)+'" y="'+(Y(yy)-6)+'" text-anchor="end" font-size="13" font-weight="bold" fill="'+PALETTE[(i+2)%5]+'">'+esc(l.label)+'</text>'});
  (f.points||[]).forEach(function(p){s+='<circle cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="4.5" fill="#DB2F30"/>'+(p[2]?'<text x="'+(X(p[0])+7)+'" y="'+(Y(p[1])-7)+'" font-size="13" font-weight="bold" fill="#0A1F3D">'+esc(p[2])+'</text>':'')});
  if (opts.clickable){ for (x=f.xmin;x<=f.xmax;x++) for (y=f.ymin;y<=f.ymax;y++) s+='<circle class="hp" data-x="'+x+'" data-y="'+y+'" cx="'+X(x)+'" cy="'+Y(y)+'" r="'+Math.max(6,cell*0.32)+'" fill="transparent" style="cursor:pointer"/>';
    if (opts.sel) s+='<circle cx="'+X(opts.sel[0])+'" cy="'+Y(opts.sel[1])+'" r="7" fill="#0047BA" stroke="#fff" stroke-width="2" pointer-events="none"/>';
    if (opts.right) s+='<circle cx="'+X(opts.right[0])+'" cy="'+Y(opts.right[1])+'" r="9" fill="none" stroke="#1E7A46" stroke-width="3" pointer-events="none"/>';
  }
  return s+'</svg>';
}

/* ---------- item rendering (shared by practice, exams, review) ---------- */
function ddOrder(it,i){var o=it.blanks[i].options,idx=o.map(function(_,j){return j});
  if (it.noShuffle) return idx;
  var nums=o.map(function(x){return parseFloat(txt(x).replace(/[$,%]/g,'').replace(/[\u2212]/g,'-'))});
  if (nums.every(function(n){return !isNaN(n)})&&o.every(function(x){return /^[\s$\u2212\-]*[\d.,]+\s*[%a-z]*$/i.test(txt(x))})) return idx.sort(function(a,b){return nums[a]-nums[b]});
  return shuffled(o.length,'dd:'+it.id+':'+i);}
function optOrder(it){return (it.type==='mc'||it.type==='multi')&&!it.noShuffle?shuffled(it.options.length,'ged:'+it.id):it.options.map(function(_,i){return i})}
function renderItem(it, val, opts){
  // returns HTML; opts.name unique, opts.review (show right/wrong), opts.num
  opts=opts||{}; var nm=opts.name||it.id, h='', ord;
  var prompt=it.prompt;
  if (it.type==='dropdown'){
    prompt=prompt.replace(/\{\{(\d+)\}\}/g,function(_,i){i=+i;var b=it.blanks[i]||{options:[]};var cur=val&&val[i]!=null?val[i]:'';
      var cls=''; if(opts.review){cls=(val&&val[i]===b.answer)?' style="border-color:#1E7A46"':' style="border-color:#DB2F30"'}
      return '<select class="dd" data-b="'+i+'"'+cls+(opts.review?' disabled':'')+' aria-label="Choose an answer"><option value="">Select…</option>'+ddOrder(it,i).map(function(j){var o=b.options[j];return '<option value="'+j+'"'+(String(cur)===String(j)?' selected':'')+'>'+esc(txt(o))+'</option>'}).join('')+'</select>'+(opts.review&&!(val&&val[i]===b.answer)?' <span class="tag" style="color:#1E7A46">'+esc(txt(b.options[b.answer]))+'</span>':'')});
  }
  h+='<div class="prompt">'+prompt+'</div>'+figureHTML(it.figure);
  if (it.type==='mc'||it.type==='multi'){
    ord=optOrder(it); var multi=it.type==='multi';
    h+='<div class="opts">'+ord.map(function(oi,pos){
      var on=multi?(val||[]).indexOf(oi)>=0:val===oi, cls='opt'+(on?' sel':'');
      if (opts.review){var good=multi?it.answer.indexOf(oi)>=0:it.answer===oi; if(good)cls+=' right'; else if(on)cls+=' wrong'}
      return '<label class="'+cls+'"><input type="'+(multi?'checkbox':'radio')+'" name="'+esc(nm)+'" value="'+oi+'"'+(on?' checked':'')+(opts.review?' disabled':'')+'><span class="L">'+LET[pos]+'</span><span>'+it.options[oi]+'</span></label>'}).join('')+'</div>';
  } else if (it.type==='fill'){
    h+='<p><input class="fill" type="text" inputmode="text" autocomplete="off" aria-label="Your answer" value="'+esc(val||'')+'"'+(opts.review?' disabled':'')+'> '+(it.suffix?esc(it.suffix):'')+'</p>';
    if (opts.review&&!scoreItem(it,val)) h+='<p class="tag" style="display:inline-block;color:#1E7A46">Correct answer: '+esc(it.answer[0])+'</p>';
  } else if (it.type==='drag'){
    var place=val||it.choices.map(function(){return null});
    var dord=it.noShuffle?it.choices.map(function(_,i){return i}):shuffled(it.choices.length,'drag:'+it.id);
    h+='<div class="drag"><div class="chips" data-bin="-1" aria-label="Items to place">'+dord.map(function(i){var c=it.choices[i];return place[i]==null?'<span class="chip" data-c="'+i+'" tabindex="0">'+c+'</span>':''}).join('')+'</div><div class="bins">'+it.bins.map(function(b,bi){
      return '<div class="bin" data-bin="'+bi+'" tabindex="0"><h5>'+b+'</h5>'+it.choices.map(function(c,i){if(place[i]!==bi)return '';var mark='';if(opts.review)mark=it.answer[i]===bi?' style="border-color:#1E7A46;background:#ECF6F0"':' style="border-color:#DB2F30;background:#FDEEEE"';return '<span class="chip" data-c="'+i+'" tabindex="0"'+mark+'>'+c+'</span>'}).join('')+'</div>'}).join('')+'</div>'+(opts.review?'<p class="plane-hint">Correct placement: '+it.choices.map(function(c,i){return esc(txt(c))+' → '+esc(txt(it.bins[it.answer[i]]))}).join('; ')+'</p>':'<p class="plane-hint">Tap an item, then tap the box where it belongs. Tap a placed item to send it back.</p>')+'</div>';
  } else if (it.type==='hotspot'){
    if (it.plane){
      var f=Object.assign({},it.figure&&it.figure.type==='plane'?it.figure:{},it.plane);
      h=h.replace(figureHTML(it.figure),'');
      h+='<div class="figure hot">'+planeSVG(f,{clickable:!opts.review,sel:val,right:opts.review?it.answer:null})+'</div><p class="plane-hint">'+(opts.review?'Green ring = correct point.':'Click a point on the grid. Selected: <strong class="selpt">'+(val?'('+val[0]+', '+val[1]+')':'none')+'</strong>')+'</p>';
    } else {
      h+='<div class="spans stim">'+it.spans.map(function(s,i){var cls='s'+(val===i?' sel':''); if(opts.review){if(i===it.answer)cls+=' right';else if(val===i)cls+=' wrong'} return '<span class="'+cls+'" data-i="'+i+'" tabindex="0">'+s+'</span>'}).join(' ')+'</div><p class="plane-hint">'+(opts.review?'Green = correct sentence.':'Click the sentence that answers the question.')+'</p>';
    }
  }
  return h;
}
function bindItem(root, it, getVal, setVal){
  // wire inputs inside root to update value
  if (it.type==='mc') $$('input',root).forEach(function(inp){inp.onchange=function(){setVal(+inp.value);$$('.opt',root).forEach(function(l){l.classList.toggle('sel',$('input',l).checked)})}});
  if (it.type==='multi'){ var need=it.answer.length;
    $$('input',root).forEach(function(inp){inp.onchange=function(){var cur=$$('input:checked',root).map(function(x){return +x.value}); if(cur.length>need){inp.checked=false;cur=$$('input:checked',root).map(function(x){return +x.value})} setVal(cur);$$('.opt',root).forEach(function(l){l.classList.toggle('sel',$('input',l).checked)})}})}
  if (it.type==='dropdown') $$('select.dd',root).forEach(function(sel){sel.onchange=function(){var v=(getVal()||it.blanks.map(function(){return null})).slice();v[+sel.dataset.b]=sel.value===''?null:+sel.value;setVal(v)}});
  if (it.type==='fill'){var inp=$('input.fill',root);if(inp)inp.oninput=function(){setVal(inp.value)}}
  if (it.type==='drag'){
    var picked=null;
    root.onclick=function(e){
      var chip=e.target.closest('.chip'), bin=e.target.closest('.bin,.chips');
      if (chip&&root.contains(chip)){
        var ci=+chip.dataset.c; var v=(getVal()||it.choices.map(function(){return null})).slice();
        if (v[ci]!=null&&chip.closest('.bin')){ if(picked!=null&&picked!==ci){v[picked]=+chip.closest('.bin').dataset.bin;picked=null;setVal(v);rerender();return} v[ci]=null;setVal(v);picked=null;rerender();return}
        picked=ci;$$('.chip',root).forEach(function(c){c.classList.toggle('picked',+c.dataset.c===ci)});$$('.bin',root).forEach(function(b){b.classList.add('ready')});return;
      }
      if (bin&&picked!=null&&bin.classList.contains('bin')){var v2=(getVal()||it.choices.map(function(){return null})).slice();v2[picked]=+bin.dataset.bin;picked=null;setVal(v2);rerender()}
    };
    function rerender(){var wrap=$('.drag',root);var tmp=document.createElement('div');tmp.innerHTML=renderItem(it,getVal(),{});wrap.outerHTML=$('.drag',tmp).outerHTML}
  }
  if (it.type==='hotspot'){
    if (it.plane) root.onclick=function(e){var c=e.target.closest('.hp');if(!c)return;setVal([+c.dataset.x,+c.dataset.y]);var f=Object.assign({},it.figure&&it.figure.type==='plane'?it.figure:{},it.plane);$('.figure.hot',root).innerHTML=planeSVG(f,{clickable:true,sel:getVal()});var sp=$('.selpt',root);if(sp)sp.textContent='('+getVal()[0]+', '+getVal()[1]+')'};
    else root.onclick=function(e){var s=e.target.closest('.spans .s');if(!s)return;setVal(+s.dataset.i);$$('.spans .s',root).forEach(function(x){x.classList.toggle('sel',x===s)})};
  }
}
/* ---------- scoring ---------- */
function normFill(s){return String(s==null?'':s).toLowerCase().replace(/[\u2212\u2013]/g,'-').trim().replace(/(\d)\s+(\d+\/\d+)/g,'$1_$2').replace(/\s+/g,'').replace(/[$,]/g,'').replace(/(dollars?|units?|feet|ft|inches|in|cm|meters|m|percent|%|degrees|°)$/,'')}
function parseNum(raw){var mm=String(raw).trim().replace(/[\u2212\u2013]/g,'-').match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(mm){var v0=+mm[2]+mm[3]/mm[4];return mm[1]?-v0:v0}var s=normFill(raw);if(/^-?\d+\/\d+$/.test(s)){var p=s.split('/');return p[0]/p[1]}if(/^-?\d+\s*\d+\/\d+$/.test(s))return NaN;var v=Number(s.replace('−','-'));return s===''?NaN:v}
function scoreItem(it,val){
  if (val==null||val==='') return false;
  switch(it.type){
    case 'mc': return val===it.answer;
    case 'multi': return Array.isArray(val)&&val.length===it.answer.length&&it.answer.every(function(a){return val.indexOf(a)>=0});
    case 'dropdown': return Array.isArray(val)&&it.blanks.every(function(b,i){return val[i]===b.answer});
    case 'fill': if (it.expr) return exprMatch(val,it.expr,it.var||'x'); var n=normFill(val); if(it.answer.some(function(a){return normFill(a)===n}))return true; if(typeof it.value==='number'){var v=parseNum(val);return !isNaN(v)&&Math.abs(v-it.value)<=(it.tol||1e-9)+1e-9}return false;
    case 'drag': return Array.isArray(val)&&it.answer.every(function(a,i){return val[i]===a});
    case 'hotspot': return it.plane?Array.isArray(val)&&val[0]===it.answer[0]&&val[1]===it.answer[1]:val===it.answer;
  }
  return false;
}
/* algebraic expression equivalence for fill items with "expr" (e.g., "5x-7") */
function exprEval(src,v,xv){
  var s=String(src).toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/×|\*/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3'),i=0;
  if (!s||/[^0-9a-z.+\-*/^()]/.test(s)) throw 0;
  var letters=s.replace(/[^a-z]/g,''); if (letters&&letters.split('').some(function(c){return c!==v})) throw 0;
  function peek(){return s[i]}
  function prim(){var c=s[i];
    if (c==='('){i++;var r=expr();if(s[i]!==')')throw 0;i++;return r}
    if (c===v){i++;return xv}
    var m=s.slice(i).match(/^(\d+\.?\d*|\.\d+)/); if(!m) throw 0; i+=m[0].length; return parseFloat(m[0])}
  function pow(){var b=prim(); if(s[i]==='^'){i++; var neg=false; if(s[i]==='-'){neg=true;i++} var e=pow(); return Math.pow(b,neg?-e:e)} return b}
  function unary(){if(s[i]==='-'){i++;return -unary()} if(s[i]==='+'){i++;return unary()} return pow()}
  function term(){var r=unary(); for(;;){var c=s[i]; if(c==='*'){i++;r*=unary()} else if(c==='/'){i++;r/=unary()} else if(c==='('||c===v||/[0-9.]/.test(c||'')){r*=pow()} else return r}}
  function expr(){var r=term(); for(;;){if(s[i]==='+'){i++;r+=term()} else if(s[i]==='-'){i++;r-=term()} else return r}}
  var out=expr(); if(i<s.length) throw 0; return out;
}
function exprTerms(src){var s=String(src).replace(/\s+/g,'').replace(/[\u2212\u2013]/g,'-'),d=0,n=1;for(var i=0;i<s.length;i++){var c=s[i];if(c==='(')d++;else if(c===')')d--;else if((c==='+'||c==='-')&&d===0&&i>0&&!/[+\-*\/^(]/.test(s[i-1]))n++}return n}
function exprGroups(x){return /\([^()]*[^(\s+\-\u2212][\s]*[+\-\u2212]/.test(String(x))}
function exprMatch(a,b,v){return exprEq(a,b,v)&&exprTerms(a)===exprTerms(b)&&exprGroups(a)===exprGroups(b)}
function exprEq(a,b,v){try{return [-2.5,-1.3,0.7,1.9,3.2].every(function(x){var p=exprEval(a,v,x),q=exprEval(b,v,x);return isFinite(p)&&Math.abs(p-q)<1e-7*Math.max(1,Math.abs(q))})}catch(e){return false}}
function answered(it,val){if(val==null||val==='')return false;if(it.type==='drag'||it.type==='dropdown')return Array.isArray(val)&&val.every(function(x){return x!=null});if(it.type==='multi')return Array.isArray(val)&&val.length===it.answer.length;return true}
function ansText(it,val){
  if (val==null||val===''||(Array.isArray(val)&&!val.some(function(x){return x!=null}))) return '(no answer)';
  switch(it.type){
    case 'mc': return letterOf(it,val)+'. '+txt(it.options[val]);
    case 'multi': return val.map(function(v){return letterOf(it,v)+'. '+txt(it.options[v])}).join(' + ');
    case 'dropdown': return val.map(function(v,i){return v==null?'(blank)':txt(it.blanks[i].options[v])}).join(' | ');
    case 'fill': return String(val);
    case 'drag': return it.choices.map(function(c,i){return txt(c)+' → '+(val[i]==null?'(not placed)':txt(it.bins[val[i]]))}).join('; ');
    case 'hotspot': return it.plane?'('+val[0]+', '+val[1]+')':'"'+txt(it.spans[val])+'"';
  }
  return String(val);
}
function letterOf(it,oi){var ord=optOrder(it);return LET[ord.indexOf(oi)]}
function correctText(it){
  switch(it.type){
    case 'mc': return letterOf(it,it.answer)+'. '+txt(it.options[it.answer]);
    case 'multi': return it.answer.map(function(v){return letterOf(it,v)+'. '+txt(it.options[v])}).join(' + ');
    case 'dropdown': return it.blanks.map(function(b){return txt(b.options[b.answer])}).join(' | ');
    case 'fill': return it.answer[0];
    case 'drag': return it.choices.map(function(c,i){return txt(c)+' → '+txt(it.bins[it.answer[i]])}).join('; ');
    case 'hotspot': return it.plane?'('+it.answer[0]+', '+it.answer[1]+')':'"'+txt(it.spans[it.answer])+'"';
  }
}
function stimHTML(st){if(!st)return '';return '<div class="stim">'+(st.title?'<h4>'+esc(st.title)+'</h4>':'')+(st.html||'')+figureHTML(st.figure)+(st.source?'<div class="src">'+esc(st.source)+'</div>':'')+'</div>'}

/* ---------- lessons (v2): subject page, teaching deck, student lesson, practice, exit check, study sheet, answer key ---------- */
var STEPS=[
 ['teach','Teaching Lesson','The live lesson your instructor teaches on Zoom, one slide at a time.','Live lesson'],
 ['learn','Student Lesson','Step by step, one screen at a time, with a check on every new skill.','Self-paced'],
 ['practice','Practice','30 GED-style questions in two sets of 15. Three tries per question, with the reason behind every wrong answer.','Practice'],
 ['exit','Exit Check','8 GED-style questions that close out the topic. Pass with 6 of 8.','Mastery check'],
 ['notes','Study Sheet','Vocabulary and a one-page study sheet you can print.','Print']];
var KIND={title:'Today’s Lesson',warmup:'Warm-Up',teach:'Learn',example:'Worked Example',wedo:'We Do Together',youdo:'Your Turn',gedq:'GED-Style Question',strategy:'Test Strategy',recap:'Recap'};
function lkey(w,s){return 'w'+pad(w)+'-'+s}
function isTeacher(){return sget('kce_ged_teacher',false)===true}
function teacherGate(cb){
  if (isTeacher()) return cb();
  var m=modal('<h3>Instructor code</h3><p>Enter the instructor code to open the teaching notes and answer key.</p><p><input class="fill" id="tcode" inputmode="numeric" autocomplete="off" style="width:100%" aria-label="Instructor code"></p><p id="tmsg" style="color:#DB2F30;margin:0"></p>',[{t:'Cancel',ghost:true}]);
  var b=document.createElement('button');b.className='btn';b.type='button';b.textContent='Open';$('.mb',m).appendChild(b);
  var inp=$('#tcode',m);inp.focus();
  function go(){if(inp.value.trim()==='9110'){sset('kce_ged_teacher',true);m.remove();cb()}else $('#tmsg',m).textContent='That code is not correct.'}
  b.onclick=go; inp.onkeydown=function(e){if(e.key==='Enter')go()};
}
function lessonMissing(w,s){app.innerHTML='<div class="card content"><h3>'+esc(MAP[w][s])+'</h3><p>This lesson is being finalized and will appear here soon.</p><p><a class="btn ghost" href="#week-'+w+'">Back to Week '+w+'</a></p></div>'}
function isV2(d){return d&&d.version===2}
function needMsg(it){return 'Answer the question first'+(it.type==='multi'?' (select '+it.answer.length+')':it.type==='drag'?' (place every item)':it.type==='dropdown'?' (choose from every menu)':'')+'.'}
function whyFor(it,val){
  if (val==null||val==='') return '';
  switch(it.type){
    case 'mc': return (it.why&&it.why[val])||'';
    case 'multi': return (val||[]).filter(function(v){return it.answer.indexOf(v)<0}).map(function(v){return it.why&&it.why[v]?'<span class="wopt">'+esc(txt(it.options[v]))+':</span> '+it.why[v]:''}).filter(Boolean).join('<br>');
    case 'dropdown': return it.blanks.map(function(b,i){return val[i]!=null&&val[i]!==b.answer&&b.why&&b.why[val[i]]?'<span class="wopt">'+esc(txt(b.options[val[i]]))+':</span> '+b.why[val[i]]:''}).filter(Boolean).join('<br>');
    case 'fill':
      var n=normFill(val), v=parseNum(val);
      var m=(it.mistakes||[]).filter(function(mm){return (mm.answer||[]).some(function(a){if(it.expr) return exprEq(val,a,it.var||'x'); var av=parseNum(a);return normFill(a)===n||(!isNaN(v)&&!isNaN(av)&&Math.abs(av-v)<1e-9)})})[0];
      return m?m.why:'';
    case 'drag': case 'hotspot': return it.why||'';
  }
  return '';
}
/* one question with up to `tries` attempts; wrong attempt clears the answer and shows that answer's logic */
function askItem(root,it,cfg){
  var rec=cfg.get(it.id)||{tries:0}, val=null, maxT=cfg.tries||3;
  root.innerHTML='<div class="body"></div><div class="qbtns"><button class="btn small chk" type="button">Check answer</button>'+(it.hint?'<button class="btn ghost small hnt" type="button">Hint</button>':'')+'<span class="tries"></span></div><div class="fb" aria-live="polite"></div>';
  var body=$('.body',root), fb=$('.fb',root);
  function draw(review){body.innerHTML=renderItem(it,review?rec.val:val,{name:(cfg.name||'q')+it.id,review:review}); if(!review) bindItem(body,it,function(){return val},function(v){val=v})}
  function triesTxt(){var t=$('.tries',root); t.textContent=rec.done?'':(maxT-rec.tries)+(maxT-rec.tries===1?' try left':' tries left')}
  function showDone(why){
    draw(true); $('.chk',root).style.display='none'; var hb=$('.hnt',root); if(hb) hb.style.display='none';
    fb.className='fb show '+(rec.ok?'ok':'no');
    fb.innerHTML=(why?'<div class="whyline"><strong>Why that answer is not right:</strong> '+why+'</div>':'')+'<strong>'+(rec.ok?(rec.first?'Correct on the first try!':'Correct!'):'The correct answer: '+esc(correctText(it)))+'</strong><div class="content expl">'+it.explain+'</div>';
    triesTxt();
  }
  if (rec.done) showDone(rec.ok?'':whyFor(it,rec.val)); else {draw(false);triesTxt()}
  $('.chk',root).onclick=function(){
    if (!answered(it,val)){fb.className='fb show info';fb.innerHTML=needMsg(it);return}
    if (rec.tries===0) rec.firstVal=val;
    if (scoreItem(it,val)){rec.ok=true;rec.done=true;rec.first=rec.tries===0;rec.val=val;cfg.save(it.id,rec);showDone('');cfg.onDone&&cfg.onDone(rec);return}
    rec.tries++; var why=whyFor(it,val);
    if (rec.tries>=maxT){rec.done=true;rec.ok=false;rec.first=false;rec.val=val;cfg.save(it.id,rec);showDone(why);cfg.onDone&&cfg.onDone(rec);return}
    cfg.save(it.id,rec);
    fb.className='fb show no';
    fb.innerHTML='<strong>Not quite.</strong> '+(why||'Look at your work again.')+(it.hint?'<div class="hintline"><strong>Hint:</strong> '+it.hint+'</div>':'')+'<div class="again">Your answer was cleared. Try again.</div>';
    val=null; draw(false); triesTxt();
  };
  var hb=$('.hnt',root); if(hb) hb.onclick=function(){fb.className='fb show info';fb.innerHTML='<strong>Hint:</strong> '+it.hint};
}
function toolBtns(s){return (s==='math'?'<button type="button" class="tbtn" id="xcalc">Calculator</button><button type="button" class="tbtn" id="xform">Formula Sheet</button>':(s==='sci'||s==='ss')?'<button type="button" class="tbtn" id="xcalc">Calculator</button>':'')}
function wireToolBtns(s){calcEnabled=(s==='math'||s==='sci'||s==='ss');var c=$('#xcalc');if(c)c.onclick=function(){$('#calc').classList.contains('on')?closeCalc():openCalc()};var f=$('#xform');if(f)f.onclick=function(){modal(FORMULAS)}}

/* ---------- week page ---------- */
function weekPage(w){
  renderNav('week-'+w,[['#week-'+w,'Week '+w]]);
  var p=prog(), t=MAP[w];
  var h='<div class="pagehead card"><div class="eyebrow">Week '+w+' of 10</div><h2>Week '+w+'</h2><p>Work through each subject in order: the teaching lesson, the student lesson, practice and the exit check. Finish the week with the Practice GED.</p></div><div class="hgrid">';
  ORDER.forEach(function(s){var k=lkey(w,s), X=p['exit-'+k];
    h+='<article class="hcard"><div class="wk">Week '+w+' · '+SUBJ[s].short+'</div><h3>'+esc(t[s])+'</h3><p class="hsub">Teaching lesson, student lesson, 30 practice questions and an exit check.</p>'+(X&&X.passed?'<div class="hdone">✓ Exit Check passed</div>':'')+'<div class="links"><a class="hbtn" href="#week-'+w+'/'+s+'">Open '+SUBJ[s].short+'</a></div></article>'});
  var n=ORDER.filter(function(s){return p['exam'+pad(w)+'-'+s]}).length;
  h+='<article class="hcard milestone"><div class="wk">Week '+w+' Practice GED</div><h3>Full-Length Practice GED</h3><p class="hsub">Four timed tests on the real GED clocks.</p>'+(n?'<div class="hdone">✓ '+n+' of 4 sent</div>':'')+'<div class="links"><a class="hbtn" href="#week-'+w+'/exam">Open Practice GED</a></div></article></div>';
  app.innerHTML=h;
}

/* ---------- subject page: the five steps of one lesson ---------- */
function subjHub(w,s){
  renderNav('week-'+w,[['#week-'+w,'Week '+w],['#week-'+w+'/'+s,SUBJ[s].short]]);
  var k=lkey(w,s);
  app.innerHTML='<div class="card"><p>Loading…</p></div>';
  load(k).then(function(d){
    if (!isV2(d)) return lessonMissing(w,s);
    var p=prog(), L=p['learn-'+k], P=p['prac-'+k]||{}, X=p['exit-'+k]||{};
    var stat={teach:'',learn:L?'✓ Finished'+(L.of?' · '+L.first+' of '+L.of+' checks right on the first try':''):'',
      practice:(P.A||P.B)?['A','B'].filter(function(x){return P[x]}).map(function(x){return 'Set '+x+': '+P[x].score+' ('+P[x].pct+'%)'}).join(' · '):'',
      exit:X.passed?'✓ Passed'+(X.best?' · '+X.best:''):(X.last?'Last try: '+X.last+' · not passed yet':''),notes:''};
    var meta={teach:d.deck.slides.length+' slides · about '+(d.deck.minutes||60)+' minutes',learn:d.learn.screens.length+' screens · '+d.learn.screens.filter(function(x){return x.check}).length+' checks',practice:'Set A and Set B · 15 questions each',exit:'Form A and Form B · 8 questions each',notes:(d.vocab||[]).length+' vocabulary words · printable'};
    var h='<div class="pagehead card"><div class="eyebrow">Week '+w+' · '+SUBJ[s].name+'</div><h2>'+esc(d.title)+'</h2><div class="objectives"><h4>In this lesson</h4><ul>'+d.objectives.map(function(o){return '<li>'+o+'</li>'}).join('')+'</ul></div></div>';
    h+='<div class="stepgrid">'+STEPS.map(function(x,i){
      return '<article class="hcard step'+(x[0]==='teach'?' milestone':'')+'"><div class="wk">Step '+(i+1)+' · '+x[3]+'</div><h3>'+x[1]+'</h3><p class="hsub">'+x[2]+'</p><div class="smeta">'+meta[x[0]]+'</div>'+(stat[x[0]]?'<div class="hdone">'+stat[x[0]]+'</div>':'')+'<div class="links"><a class="hbtn" href="#week-'+w+'/'+s+'/'+x[0]+'">'+(x[0]==='teach'?'Open the slides':x[0]==='notes'?'Open the study sheet':'Start '+x[1])+'</a></div></article>'}).join('')+'</div>';
    var i=ORDER.indexOf(s), nx=i<3?['#week-'+w+'/'+ORDER[i+1],'Next: Week '+w+' '+SUBJ[ORDER[i+1]].short+' →']:['#week-'+w+'/exam','Next: Week '+w+' Practice GED →'];
    h+='<div class="lnav"><a class="btn ghost" href="#week-'+w+'">← Week '+w+'</a><a class="btn" href="'+nx[0]+'">'+nx[1]+'</a></div>';
    h+='<p class="tlink"><a href="#week-'+w+'/'+s+'/key">Instructor answer key</a></p>';
    app.innerHTML=h;
  }).catch(function(){lessonMissing(w,s)});
}

/* ---------- teaching deck (presented by the instructor on Zoom) ---------- */
function deckPos(k){return sget('kce_ged_deck_'+k,{i:0,r:0})}
function deckView(w,s){
  var k=lkey(w,s);
  document.body.classList.add('testing');
  app.innerHTML='<div class="card"><p>Loading…</p></div>';
  load(k).then(function(d){
    if (!isV2(d)) {document.body.classList.remove('testing');return lessonMissing(w,s)}
    var S=d.deck.slides, pos=deckPos(k), notesOn=false;
    if (pos.i>=S.length) pos={i:0,r:0};
    function nsteps(i){return (S[i].steps||[]).length}
    function next(){if(pos.r<nsteps(pos.i))pos.r++;else if(pos.i<S.length-1){pos.i++;pos.r=0}draw()}
    function prev(){if(pos.r>0)pos.r--;else if(pos.i>0){pos.i--;pos.r=nsteps(pos.i)}draw()}
    function go(i){pos.i=Math.max(0,Math.min(S.length-1,i));pos.r=0;draw()}
    function draw(){
      var sl=S[pos.i], st=sl.steps||[], more=pos.r<st.length;
      sset('kce_ged_deck_'+k,pos); sset('kce_ged_deckbc',{k:k,i:pos.i,r:pos.r,t:Date.now()});
      var h='<div class="xbar"><div class="in"><div class="tt">Week '+w+' · '+SUBJ[s].short+' · Teaching Lesson<small>'+esc(d.title)+' · Slide '+(pos.i+1)+' of '+S.length+'</small></div>'+toolBtns(s)+'<button type="button" id="dnotes">'+(notesOn?'Hide notes':'Instructor notes')+'</button><button type="button" id="dwin">Notes window</button><button type="button" id="dfull">Full screen</button><a class="xlink" href="#week-'+w+'/'+s+'">Exit</a></div></div>';
      h+='<div class="deckwrap"><div class="slide k-'+sl.kind+'"><div class="skind">'+KIND[sl.kind]+'</div><h2>'+esc(sl.title)+'</h2><div class="board content">'+sl.board+'</div>'+figureHTML(sl.figure)+(st.length?'<div class="dsteps">'+st.slice(0,pos.r).map(function(x,j){return '<div class="dstep"><span class="sn">'+(j+1)+'</span><div class="content">'+x+'</div></div>'}).join('')+'</div>':'')+'</div>';
      h+='<div class="dfoot"><button class="btn ghost" id="dprev" type="button"'+(pos.i===0&&pos.r===0?' disabled':'')+'>← Back</button><div class="dots">'+S.map(function(x,j){return '<button type="button" data-j="'+j+'" class="'+(j===pos.i?'on':'')+'" aria-label="Slide '+(j+1)+'"></button>'}).join('')+'</div><button class="btn'+(more?' gold':'')+'" id="dnext" type="button"'+(!more&&pos.i===S.length-1?' disabled':'')+'>'+(more?'Reveal step '+(pos.r+1)+' of '+st.length:'Next slide →')+'</button></div>';
      if (notesOn) h+='<div class="dnotes">'+notesHTML(sl)+'</div>';
      h+='</div>';
      app.innerHTML=h;
      $('#dnext').onclick=next; $('#dprev').onclick=prev;
      $$('.dots button').forEach(function(b){b.onclick=function(){go(+b.dataset.j)}});
      $('#dnotes').onclick=function(){if(notesOn){notesOn=false;draw()}else teacherGate(function(){notesOn=true;draw()})};
      $('#dwin').onclick=function(){teacherGate(function(){window.open(location.href.split('#')[0]+'#week-'+w+'/'+s+'/presenter','kcenotes','width=760,height=860')})};
      $('#dfull').onclick=function(){var el=document.documentElement;try{if(!document.fullscreenElement)(el.requestFullscreen||el.webkitRequestFullscreen).call(el);else document.exitFullscreen()}catch(e){}};
      wireToolBtns(s);
    }
    function key(e){if(/input|textarea|select/i.test((document.activeElement||{}).tagName||''))return;if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();next()}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev()}}
    function cmd(e){if(e.key!=='kce_ged_deckcmd'||!e.newValue)return;try{var c=JSON.parse(e.newValue);if(c.k!==k)return;if(c.c==='next')next();else if(c.c==='prev')prev();else if(c.c==='go')go(c.i)}catch(x){}}
    document.addEventListener('keydown',key); window.addEventListener('storage',cmd);
    stopRunner=function(){document.removeEventListener('keydown',key);window.removeEventListener('storage',cmd);document.body.classList.remove('testing');closeCalc()};
    draw();
  }).catch(function(){document.body.classList.remove('testing');lessonMissing(w,s)});
}
function notesHTML(sl){
  var n=sl.notes||{};
  return '<div class="nh">Instructor notes · '+KIND[sl.kind]+'</div>'+
    '<div class="nsec"><h5>Say</h5><div class="content">'+(n.say||'')+'</div></div>'+
    (n.ask&&n.ask.length?'<div class="nsec"><h5>Ask</h5><ul>'+n.ask.map(function(a){return '<li>'+a+'</li>'}).join('')+'</ul></div>':'')+
    (n.answer?'<div class="nsec ans"><h5>Answer key</h5><div class="content">'+n.answer+'</div></div>':'')+
    (n.watch?'<div class="nsec watch"><h5>Watch for</h5><div class="content">'+n.watch+'</div></div>':'');
}
/* separate presenter window: follows the slides and can drive them */
function presenterView(w,s){
  var k=lkey(w,s); document.body.classList.add('testing');
  teacherGate(function(){
    load(k).then(function(d){
      var S=d.deck.slides;
      function draw(){
        var p=deckPos(k), sl=S[Math.min(p.i,S.length-1)], st=sl.steps||[];
        app.innerHTML='<div class="xbar"><div class="in"><div class="tt">Instructor notes · Week '+w+' '+SUBJ[s].short+'<small>Slide '+(p.i+1)+' of '+S.length+' · '+esc(sl.title)+' · step '+p.r+' of '+st.length+' shown</small></div><button type="button" id="pp">← Back</button><button type="button" id="pn">Next →</button></div></div><div class="xwrap"><div class="dnotes solo">'+notesHTML(sl)+(st.length?'<div class="nsec"><h5>Steps on this slide</h5><ol>'+st.map(function(x,j){return '<li class="'+(j<p.r?'shown':'')+'">'+x+'</li>'}).join('')+'</ol></div>':'')+(S[p.i+1]?'<div class="nsec nextup"><h5>Next slide</h5><p>'+esc(KIND[S[p.i+1].kind])+': '+esc(S[p.i+1].title)+'</p></div>':'')+'</div></div>';
        $('#pp').onclick=function(){sset('kce_ged_deckcmd',{k:k,c:'prev',t:Date.now()})};
        $('#pn').onclick=function(){sset('kce_ged_deckcmd',{k:k,c:'next',t:Date.now()})};
      }
      function onS(e){if(e.key==='kce_ged_deckbc'||e.key==='kce_ged_deck_'+k)draw()}
      window.addEventListener('storage',onS);
      stopRunner=function(){window.removeEventListener('storage',onS);document.body.classList.remove('testing')};
      draw();
    }).catch(function(){lessonMissing(w,s)});
  });
}

/* ---------- student lesson: one screen at a time ---------- */
function learnView(w,s){
  var k=lkey(w,s);
  renderNav('week-'+w,[['#week-'+w,'Week '+w],['#week-'+w+'/'+s,SUBJ[s].short],['#week-'+w+'/'+s+'/learn','Student Lesson']]);
  app.innerHTML='<div class="card"><p>Loading…</p></div>';
  load(k).then(function(d){
    if (!isV2(d)) return lessonMissing(w,s);
    var Sc=d.learn.screens, sk='kce_ged_learn_'+k, st=sget(sk,{i:0,res:{}});
    if (st.i>=Sc.length) st.i=0;
    function save(){sset(sk,st)}
    function draw(){
      var sc=Sc[st.i], last=st.i===Sc.length-1, ck=sc.check, done=!ck||(st.res[ck.id]&&st.res[ck.id].done);
      var h='<div class="lhead card"><div class="lrow"><span class="eyebrow">Student Lesson · Week '+w+' '+SUBJ[s].short+'</span><span class="lcount">Screen '+(st.i+1)+' of '+Sc.length+'</span>'+toolBtns(s)+'</div><div class="pbar"><i style="width:'+Math.round((st.i+1)/Sc.length*100)+'%"></i></div></div>';
      h+='<div class="card lscreen"><h2>'+esc(sc.title)+'</h2><div class="content">'+sc.html+'</div>'+figureHTML(sc.figure);
      if (sc.example){h+='<div class="lex"><div class="lexh">Worked example</div><div class="content">'+sc.example.prompt+'</div>'+figureHTML(sc.example.figure)+'<div class="lexsteps"></div><button class="btn ghost small" type="button" id="exnext">Show the first step</button></div>'}
      if (ck){h+='<div class="q lcheck"><div class="qh"><span class="qn">Check your understanding</span><span class="tag">'+esc(ck.skill||'')+'</span></div><div id="ckbox"></div></div>'}
      h+='</div><div class="lnav"><button class="btn ghost" id="lprev" type="button"'+(st.i===0?' disabled':'')+'>← Back</button><span class="lhint" id="lhint">'+(done?'':'Answer the check to continue.')+'</span><button class="btn'+(last?' gold':'')+'" id="lnext" type="button"'+(done?'':' disabled')+'>'+(last?'Finish and go to Practice →':'Next →')+'</button></div>';
      app.innerHTML=h; window.scrollTo(0,0); wireToolBtns(s);
      if (sc.example){var exn=0,ex=sc.example,box=$('.lexsteps'),b=$('#exnext');
        b.onclick=function(){if(exn<ex.steps.length){box.insertAdjacentHTML('beforeend','<div class="dstep"><span class="sn">'+(exn+1)+'</span><div class="content">'+ex.steps[exn]+'</div></div>');exn++;b.textContent=exn<ex.steps.length?'Show the next step':'Show the answer'}else{box.insertAdjacentHTML('beforeend','<div class="lexans"><strong>Answer:</strong> '+ex.answer+'</div>');b.remove()}}}
      if (ck) askItem($('#ckbox'),ck,{name:'l'+k,tries:3,get:function(id){return st.res[id]},save:function(id,r){st.res[id]=r;save()},onDone:function(){$('#lnext').disabled=false;$('#lhint').textContent=''}});
      $('#lprev').onclick=function(){if(st.i>0){st.i--;save();draw()}};
      $('#lnext').onclick=function(){
        if (!last){st.i++;save();draw();return}
        var checks=Sc.filter(function(x){return x.check}), first=checks.filter(function(x){var r=st.res[x.check.id];return r&&r.first}).length;
        setProg('learn-'+k,{when:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}),first:first,of:checks.length});
        location.hash='#week-'+w+'/'+s+'/practice';
      };
    }
    draw();
  }).catch(function(){lessonMissing(w,s)});
}

/* ---------- practice and exit check: one question per screen ---------- */
function quizView(w,s,mode){
  var k=lkey(w,s), isX=mode==='exit', label=isX?'Exit Check':'Practice';
  renderNav('week-'+w,[['#week-'+w,'Week '+w],['#week-'+w+'/'+s,SUBJ[s].short],['#week-'+w+'/'+s+'/'+mode,label]]);
  app.innerHTML='<div class="card"><p>Loading…</p></div>';
  load(k).then(function(d){
    if (!isV2(d)) return lessonMissing(w,s);
    var B=isX?d.exit:d.practice, stims={}; (B.stimuli||[]).forEach(function(x){stims[x.id]=x});
    var pk=(isX?'exit-':'prac-')+k, rk='kce_ged_'+(isX?'x_':'p_')+k;
    var run=sget(rk,null);
    if (!run) return pick();
    show();
    function pick(){
      var p=prog()[pk]||{};
      var suggest=isX?(p.A&&!p.passed?'B':'A'):(p.A&&p.A.pct<80&&!p.B?'B':'A');
      var h='<div class="pagehead card"><div class="eyebrow">Week '+w+' · '+SUBJ[s].short+' · '+label+'</div><h2>'+esc(d.title)+'</h2>'+(isX?'<p>8 GED-style questions on everything in this lesson. One try per question; you see your results and the reasons behind each answer at the end. Pass with 6 of 8. Your results go to your instructor.</p>':'<p>15 GED-style questions per set, one at a time. You get three tries on each question. If an answer is wrong, you see why, and the question resets. Only your first try counts toward your score. Score 80% or higher to master this practice; if you score lower, take Set B, which has different questions on the same skills. Your results go to your instructor.</p>')+'</div><div class="hgrid">';
      ['A','B'].forEach(function(x){var r=p[x];
        h+='<article class="hcard'+(x===suggest?' sg':'')+'">'+(x===suggest?'<span class="upnext">Up next</span>':'')+'<div class="wk">'+(isX?'Form ':'Set ')+x+'</div><h3>'+label+' '+(isX?'Form ':'Set ')+x+'</h3><p class="hsub">'+(isX?'8':'15')+' questions'+(x==='B'?(isX?' · use if Form A is not passed':' · different questions, same skills'):'')+'.</p>'+(r?'<div class="hdone">Last result: '+r.score+' ('+r.pct+'%)'+(r.when?' · '+r.when:'')+'</div>':'')+'<div class="links"><button class="hbtn" type="button" data-set="'+x+'">'+(r?'Take again':'Start')+'</button></div></article>'});
      h+='</div><div class="lnav"><a class="btn ghost" href="#week-'+w+'/'+s+'">← Back to '+SUBJ[s].short+'</a></div>';
      app.innerHTML=h;
      $$('[data-set]').forEach(function(b){b.onclick=function(){var set=b.dataset.set;studentName(function(name){run={set:set,i:0,res:{},ans:{},name:name,start:Date.now()};sset(rk,run);show()})}});
    }
    function items(){return B.items.filter(function(x){return x.set===run.set})}
    function show(){
      var I=items(); if (run.i>=I.length) return finish();
      var it=I[run.i], st=it.stim?stims[it.stim]:null, last=run.i===I.length-1;
      var rec=run.res[it.id], done=isX?answered(it,run.ans[it.id]):(rec&&rec.done);
      var h='<div class="lhead card"><div class="lrow"><span class="eyebrow">'+label+' '+(isX?'Form ':'Set ')+run.set+' · Week '+w+' '+SUBJ[s].short+'</span><span class="lcount">Question '+(run.i+1)+' of '+I.length+'</span>'+toolBtns(s)+'</div><div class="pbar"><i style="width:'+Math.round((run.i+1)/I.length*100)+'%"></i></div></div>';
      h+='<div class="xsplit'+(st?'':' solo')+'">'+(st?'<div class="left">'+stimHTML(st)+'</div>':'')+'<div><div class="q"><div class="qh"><span class="qn">Question '+(run.i+1)+'</span><span class="tag">'+esc(it.skill||'')+'</span></div><div id="qbox"></div></div>';
      h+='<div class="lnav"><button class="btn ghost" id="qprev" type="button"'+(run.i===0?' disabled':'')+'>← Back</button><span class="lhint" id="lhint"></span><button class="btn'+(last?' gold':'')+'" id="qnext" type="button"'+(done?'':' disabled')+'>'+(last?(isX?'Submit the Exit Check':'See my results'):'Next →')+'</button></div></div></div>';
      app.innerHTML=h; window.scrollTo(0,0); wireToolBtns(s);
      if (isX){
        var box=$('#qbox'); box.innerHTML='<div class="body"></div>'; var body=$('.body',box);
        body.innerHTML=renderItem(it,run.ans[it.id],{name:'x'+k+it.id});
        bindItem(body,it,function(){return run.ans[it.id]},function(v){run.ans[it.id]=v;sset(rk,run);$('#qnext').disabled=!answered(it,v)});
        $('#lhint').textContent='One try. Answers are reviewed at the end.';
      } else {
        askItem($('#qbox'),it,{name:'p'+k,tries:3,get:function(id){return run.res[id]},save:function(id,r){run.res[id]=r;sset(rk,run)},onDone:function(){$('#qnext').disabled=false}});
      }
      $('#qprev').onclick=function(){if(run.i>0){run.i--;sset(rk,run);show()}};
      $('#qnext').onclick=function(){
        if (!last){run.i++;sset(rk,run);show();return}
        if (isX) confirmBox('Submit the Exit Check?','Your answers will be scored and sent to your instructor.','Submit',function(){run.i=I.length;sset(rk,run);finish()});
        else {run.i=I.length;sset(rk,run);finish()}
      };
    }
    function finish(){
      var I=items(), right=0, lines=[], missed=[];
      I.forEach(function(it,n){
        var v=isX?run.ans[it.id]:(run.res[it.id]||{}).firstVal, ok=isX?scoreItem(it,v):!!(run.res[it.id]&&run.res[it.id].first);
        if (ok) right++;
        var line=(n+1)+'. ['+it.skill+'] '+(ok?'✓ '+(isX?'CORRECT':'CORRECT ON FIRST TRY'):'✗ '+(isX?'WRONG':'MISSED FIRST TRY'))+' | Student'+(isX?'':' (first try)')+': '+ansText(it,v)+' | Correct: '+correctText(it);
        lines.push(line); if(!ok) missed.push(line);
      });
      var pct=Math.round(right/I.length*100), pass=isX?right>=6:pct>=80;
      var when=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
      var p=prog()[pk]||{}; p[run.set]={score:right+' of '+I.length,pct:pct,when:when};
      if (isX){p.last=right+' of 8';if(pass){p.passed=true;p.best=right+' of 8'}}
      setProg(pk,p);
      var payload=null;
      if (!run.sent){
        payload={_subject:'GED Week '+w+' '+label+' '+(isX?'Form ':'Set ')+run.set+' — '+SUBJ[s].short+' — '+run.name+' — '+right+'/'+I.length+' ('+pct+'%)',
          student:run.name,test:'Week '+w+' '+SUBJ[s].name+' — '+label+' '+(isX?'Form ':'Set ')+run.set+' ('+d.title+')',score:right+' of '+I.length,percent:pct+'%',
          result:isX?(pass?'Passed (6 of 8 needed)':'Not passed yet (6 of 8 needed)'):(pass?'Mastered (80% or higher on first tries)':'Below 80% on first tries'),
          scoring:isX?'One try per question.':'Only the first try counts. Students get three tries per question.',
          missed_count:String(missed.length),missed_questions:missed.join('\n')||'None — every question right'+(isX?'.':' on the first try.'),all_questions:lines.join('\n')};
        run.sent=true; sset(rk,run);
      }
      var h='<div class="card res"><div class="eyebrow">Week '+w+' · '+SUBJ[s].short+' · '+label+' '+(isX?'Form ':'Set ')+run.set+' · Results</div><h2>'+esc(d.title)+'</h2><div class="big">'+right+' / '+I.length+' &nbsp;·&nbsp; '+pct+'%</div>';
      h+='<p><strong>'+(isX?(pass?'Passed. You have mastered this lesson.':'Not passed yet. You need 6 of 8.'):(pass?'Mastered. 80% or higher on first tries.':'Keep practicing. You need 80% on first tries.'))+'</strong>'+(isX?'':' Only first tries count.')+'</p>';
      if (payload) h+='<div id="sendmsg" class="sendmsg"></div>';
      var other=run.set==='A'?'B':'A';
      h+='<div class="lnav wrap">'+(pass?'':'<button class="btn gold" type="button" id="again">'+(isX?'Take Form ':'Practice with Set ')+other+'</button>')+(!isX&&pass?'<a class="btn gold" href="#week-'+w+'/'+s+'/exit">Go to the Exit Check →</a>':'')+(isX&&pass?'<a class="btn gold" href="'+(ORDER.indexOf(s)<3?'#week-'+w+'/'+ORDER[ORDER.indexOf(s)+1]:'#week-'+w+'/exam')+'">'+(ORDER.indexOf(s)<3?'Next: Week '+w+' '+SUBJ[ORDER[ORDER.indexOf(s)+1]].short:'Next: Week '+w+' Practice GED')+' →</a>':'')+'<a class="btn ghost" href="#week-'+w+'/'+s+'">Back to '+SUBJ[s].short+'</a></div></div>';
      h+='<h3 class="revh">Review every question</h3><div class="review">';
      var last=null;
      I.forEach(function(it,n){
        var r=run.res[it.id]||{}, v=isX?run.ans[it.id]:(r.first?r.val:r.firstVal), ok=isX?scoreItem(it,v):!!r.first;
        if (it.stim&&it.stim!==last) h+=stimHTML(stims[it.stim]); last=it.stim||last;
        var why=ok?'':whyFor(it,v);
        h+='<div class="q '+(ok?'right':'wrong')+'"><div class="qh"><span class="qn">Question '+(n+1)+' · '+(ok?'<span class="okc">Correct'+(isX?'':' on the first try')+'</span>':'<span class="noc">'+(isX?'Incorrect':'Missed on the first try')+'</span>')+'</span><span class="tag">'+esc(it.skill||'')+'</span></div>'+renderItem(it,v,{name:'rv'+k+it.id,review:true})+'<div class="fb show '+(ok?'ok':'no')+'">'+(why?'<div class="whyline"><strong>Why '+(isX?'your':'your first')+' answer is not right:</strong> '+why+'</div>':'')+'<strong>Correct answer: '+esc(correctText(it))+'</strong><div class="content expl">'+it.explain+'</div></div></div>';
      });
      h+='</div>';
      app.innerHTML=h; window.scrollTo(0,0);
      if (payload) send(payload,$('#sendmsg'),pk+'-'+run.set);
      var ag=$('#again'); if(ag) ag.onclick=function(){var name=run.name;run={set:other,i:0,res:{},ans:{},name:name,start:Date.now()};sset(rk,run);show()};
      // finished runs restart from the set picker next time
      var keep=run; sdel(rk); run=keep;
    }
  }).catch(function(){lessonMissing(w,s)});
}

/* ---------- study sheet ---------- */
function notesView(w,s){
  var k=lkey(w,s);
  renderNav('week-'+w,[['#week-'+w,'Week '+w],['#week-'+w+'/'+s,SUBJ[s].short],['#week-'+w+'/'+s+'/notes','Study Sheet']]);
  load(k).then(function(d){
    if (!isV2(d)) return lessonMissing(w,s);
    var ph='<div class="printhead"><div class="pb">KingCretot Experience<small>KCE GED PREP · EDUCATE. EMPOWER. EXCEL.</small></div><div class="pt">Week '+w+' · '+SUBJ[s].short+'<br>Study Sheet</div></div>';
    app.innerHTML='<div class="card">'+ph+'<div class="toolrow"><span class="who">Study Sheet · '+esc(d.title)+'</span><button class="btn ghost small noprint" id="printbtn" type="button">Print this page</button></div><div class="content notesprint">'+(/^\s*<h3/i.test(d.notes)?'':'<h3>Study Notes</h3>')+d.notes+'</div><div class="content"><h3>Vocabulary</h3></div><div class="vocab">'+(d.vocab||[]).map(function(v){return '<div class="v"><div class="t">'+esc(v.term)+'</div><div class="d">'+v.def+(v.example?'<br><em>Example: '+v.example+'</em>':'')+'</div></div>'}).join('')+'</div></div><div class="lnav noprint"><a class="btn ghost" href="#week-'+w+'/'+s+'">← Back to '+SUBJ[s].short+'</a></div>';
    $('#printbtn').onclick=function(){window.print()};
  }).catch(function(){lessonMissing(w,s)});
}

/* ---------- instructor answer key ---------- */
function keyItem(it,stims,tag){
  var h='<div class="kitem"><div class="kh"><span class="kid">'+esc(tag)+'</span><span class="tag">'+esc(it.skill||'')+'</span>'+(it.difficulty?'<span class="tag">Level '+it.difficulty+'</span>':'')+'</div>';
  if (it.stim&&stims[it.stim]) h+='<p class="kstim">Uses: '+esc(stims[it.stim].title||it.stim)+'</p>';
  h+='<div class="content">'+renderItem(it,null,{name:'k'+it.id,review:true}).replace(/<input /g,'<input disabled ').replace(/<select /g,'<select disabled ')+'</div>';
  h+='<p class="kans"><strong>Answer:</strong> '+esc(correctText(it))+'</p>';
  var wl='';
  if ((it.type==='mc'||it.type==='multi')&&it.why){var ord=optOrder(it);ord.forEach(function(oi,pos){if(it.why[oi])wl+='<li><strong>'+LET[pos]+'. '+esc(txt(it.options[oi]))+'</strong> — '+it.why[oi]+'</li>'})}
  if (it.type==='dropdown') it.blanks.forEach(function(b,bi){(b.why||[]).forEach(function(x,i){if(x)wl+='<li><strong>Blank '+(bi+1)+': '+esc(txt(b.options[i]))+'</strong> — '+x+'</li>'})});
  if (it.type==='fill') (it.mistakes||[]).forEach(function(m){wl+='<li><strong>'+esc(m.answer.join(' / '))+'</strong> — '+m.why+'</li>'});
  if ((it.type==='drag'||it.type==='hotspot')&&it.why) wl+='<li>'+it.why+'</li>';
  if (wl) h+='<div class="kwhy"><h5>Wrong-answer logic</h5><ul>'+wl+'</ul></div>';
  h+='<div class="kexp"><h5>Explanation</h5><div class="content">'+it.explain+'</div></div></div>';
  return h;
}
function keyView(w,s){
  var k=lkey(w,s);
  renderNav('week-'+w,[['#week-'+w,'Week '+w],['#week-'+w+'/'+s,SUBJ[s].short],['#week-'+w+'/'+s+'/key','Answer Key']]);
  teacherGate(function(){
    load(k).then(function(d){
      if (!isV2(d)) return lessonMissing(w,s);
      var ps={},xs={};(d.practice.stimuli||[]).forEach(function(x){ps[x.id]=x});(d.exit.stimuli||[]).forEach(function(x){xs[x.id]=x});
      var ph='<div class="printhead"><div class="pb">KingCretot Experience<small>KCE GED PREP · INSTRUCTOR ANSWER KEY</small></div><div class="pt">Week '+w+' · '+SUBJ[s].short+'<br>'+esc(d.title)+'</div></div>';
      var h='<div class="card key">'+ph+'<div class="toolrow"><span class="who">Instructor Answer Key · Week '+w+' '+SUBJ[s].short+' · '+esc(d.title)+'</span><button class="btn ghost small noprint" id="printbtn" type="button">Print</button></div>';
      h+='<div class="keytoc noprint"><a href="#" data-k="kt">Teaching Lesson</a><a href="#" data-k="kl">Student Lesson checks</a><a href="#" data-k="kpa">Practice Set A</a><a href="#" data-k="kpb">Practice Set B</a><a href="#" data-k="kxa">Exit Form A</a><a href="#" data-k="kxb">Exit Form B</a></div>';
      h+='<h3 id="kt">Teaching Lesson answers</h3>'+d.deck.slides.map(function(sl,i){var n=sl.notes||{};if(!n.answer&&!(sl.steps&&sl.steps.length&&sl.kind!=='teach'))return '';return '<div class="kitem"><div class="kh"><span class="kid">Slide '+(i+1)+'</span><span class="tag">'+KIND[sl.kind]+'</span><strong>'+esc(sl.title)+'</strong></div>'+(n.answer?'<div class="content">'+n.answer+'</div>':'<ol class="content">'+(sl.steps||[]).map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol>')+(n.watch?'<p class="kwatch"><strong>Watch for:</strong> '+n.watch+'</p>':'')+'</div>'}).join('');
      h+='<h3 id="kl">Student Lesson checks</h3>'+d.learn.screens.map(function(sc,i){return sc.check?keyItem(sc.check,{},'Screen '+(i+1)+': '+txt(sc.title)):''}).join('');
      [['A','kpa','Practice Set A'],['B','kpb','Practice Set B']].forEach(function(x){h+='<h3 id="'+x[1]+'">'+x[2]+'</h3>'+d.practice.items.filter(function(it){return it.set===x[0]}).map(function(it,n){return keyItem(it,ps,x[2]+' · Q'+(n+1))}).join('')});
      [['A','kxa','Exit Form A'],['B','kxb','Exit Form B']].forEach(function(x){h+='<h3 id="'+x[1]+'">'+x[2]+'</h3>'+d.exit.items.filter(function(it){return it.set===x[0]}).map(function(it,n){return keyItem(it,xs,x[2]+' · Q'+(n+1))}).join('')});
      app.innerHTML=h+'</div>';
      $('#printbtn').onclick=function(){window.print()};
      $$('.keytoc a').forEach(function(a){a.onclick=function(e){e.preventDefault();var t=document.getElementById(a.dataset.k);if(t)t.scrollIntoView({behavior:'smooth'})}});
    }).catch(function(){lessonMissing(w,s)});
  });
}

/* ---------- modal ---------- */
function modal(html, buttons){
  var m=document.createElement('div');m.className='modal';m.innerHTML='<div class="mc" role="dialog" aria-modal="true">'+html+'<div class="mb"></div></div>';
  var mb=$('.mb',m);(buttons||[{t:'Close'}]).forEach(function(b){var x=document.createElement('button');x.type='button';x.className='btn'+(b.ghost?' ghost':'');x.textContent=b.t;x.onclick=function(){m.remove();b.fn&&b.fn()};mb.appendChild(x)});
  document.body.appendChild(m); return m;
}
function confirmBox(title,msg,ok,fn){modal('<h3>'+esc(title)+'</h3><p>'+msg+'</p>',[{t:'Cancel',ghost:true},{t:ok,fn:fn}])}
var FORMULAS='<h3>Mathematics Formula Sheet</h3><div class="fs"><table>'+
 '<tr><th colspan="2">Area of a</th></tr><tr><td>square</td><td>A = s<sup>2</sup></td></tr><tr><td>rectangle</td><td>A = lw</td></tr><tr><td>parallelogram</td><td>A = bh</td></tr><tr><td>triangle</td><td>A = &frac12;bh</td></tr><tr><td>trapezoid</td><td>A = &frac12;h(b<sub>1</sub> + b<sub>2</sub>)</td></tr><tr><td>circle</td><td>A = &pi;r<sup>2</sup></td></tr>'+
 '<tr><th colspan="2">Perimeter of a</th></tr><tr><td>square</td><td>P = 4s</td></tr><tr><td>rectangle</td><td>P = 2l + 2w</td></tr><tr><td>triangle</td><td>P = s<sub>1</sub> + s<sub>2</sub> + s<sub>3</sub></td></tr>'+
 '<tr><th colspan="2">Circumference of a circle</th></tr><tr><td colspan="2">C = 2&pi;r &nbsp;or&nbsp; C = &pi;d; &nbsp;&pi; &asymp; 3.14</td></tr>'+
 '<tr><th colspan="2">Surface Area and Volume of a</th></tr><tr><td>rectangular prism</td><td>SA = 2lw + 2lh + 2wh &nbsp;&nbsp; V = lwh</td></tr><tr><td>right prism</td><td>SA = ph + 2B &nbsp;&nbsp; V = Bh</td></tr><tr><td>cylinder</td><td>SA = 2&pi;rh + 2&pi;r<sup>2</sup> &nbsp;&nbsp; V = &pi;r<sup>2</sup>h</td></tr><tr><td>pyramid</td><td>SA = &frac12;ps + B &nbsp;&nbsp; V = &#8531;Bh</td></tr><tr><td>cone</td><td>SA = &pi;rs + &pi;r<sup>2</sup> &nbsp;&nbsp; V = &#8531;&pi;r<sup>2</sup>h</td></tr><tr><td>sphere</td><td>SA = 4&pi;r<sup>2</sup> &nbsp;&nbsp; V = &#8532;&pi;r<sup>3</sup></td></tr><tr><td colspan="2"><em>(p = perimeter of base B; &pi; &asymp; 3.14)</em></td></tr>'+
 '<tr><th colspan="2">Data</th></tr><tr><td>mean</td><td>equal to the total of the values of a data set, divided by the number of elements in the data set</td></tr><tr><td>median</td><td>middle value in an odd number of ordered values of a data set, or the mean of the two middle values in an even number of ordered values in a data set</td></tr>'+
 '<tr><th colspan="2">Algebra</th></tr><tr><td>slope of a line</td><td>m = (y<sub>2</sub> &minus; y<sub>1</sub>) / (x<sub>2</sub> &minus; x<sub>1</sub>)</td></tr><tr><td>slope-intercept form of the equation of a line</td><td>y = mx + b</td></tr><tr><td>point-slope form of the equation of a line</td><td>y &minus; y<sub>1</sub> = m(x &minus; x<sub>1</sub>)</td></tr><tr><td>standard form of a quadratic equation</td><td>y = ax<sup>2</sup> + bx + c</td></tr><tr><td>quadratic formula</td><td>x = (&minus;b &plusmn; &radic;(b<sup>2</sup> &minus; 4ac)) / 2a</td></tr><tr><td>Pythagorean theorem</td><td>a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></td></tr><tr><td>simple interest</td><td>I = prt &nbsp;(I = interest, p = principal, r = rate, t = time)</td></tr>'+
 '<tr><th colspan="2">Other</th></tr><tr><td>distance formula</td><td>d = rt</td></tr><tr><td>total cost</td><td>total cost = (number of units) &times; (price per unit)</td></tr></table></div>';

/* ---------- calculator (scientific, TI-30XS-style entry) ---------- */
var calcExpr='', calcAns=0, calcJustEval=false, calcEnabled=false;
var KEYS=[['x²','fn','^2'],['^','fn','^'],['√(','fn','√('],['π','fn','π'],['(−)','fn','neg'],
 ['(','fn','('],[')','fn',')'],['EE','fn','E'],['%','fn','%'],['÷','op','÷'],
 ['7','',7],['8','',8],['9','',9],['DEL','fn','del'],['×','op','×'],
 ['4','',4],['5','',5],['6','',6],['ANS','fn','ans'],['−','op','−'],
 ['1','',1],['2','',2],['3','',3],['CLEAR','clr','clr'],['+','op','+'],
 ['0','',0],['.','','.'],['x⁻¹','fn','^(−1)'],['ENTER','ent','=']];
(function initCalc(){
  var k=$('#calckeys');
  k.innerHTML=KEYS.map(function(x,i){return '<button type="button" class="'+x[1]+'" data-i="'+i+'"'+(x[2]==='='?' style="grid-column:span 2"':'')+'>'+x[0]+'</button>'}).join('');
  k.onclick=function(e){var b=e.target.closest('button');if(!b)return;calcPress(KEYS[+b.dataset.i][2])};
  $('#calcx').onclick=closeCalc;
  var drag=$('#calcdrag'),c=$('#calc'),sx,sy,ox,oy;
  drag.onpointerdown=function(e){if(e.target.closest('button'))return;sx=e.clientX;sy=e.clientY;var r=c.getBoundingClientRect();ox=r.left;oy=r.top;drag.setPointerCapture(e.pointerId);drag.onpointermove=function(ev){c.style.left=(ox+ev.clientX-sx)+'px';c.style.top=(oy+ev.clientY-sy)+'px';c.style.right='auto';c.style.bottom='auto'};drag.onpointerup=function(){drag.onpointermove=null}};
  document.addEventListener('keydown',function(e){if(!$('#calc').classList.contains('on')||/input|textarea|select/i.test((document.activeElement||{}).tagName||''))return;var m={'Enter':'=','Backspace':'del','Escape':'clr','*':'×','/':'÷','-':'−','+':'+','(':'(',')':')','.':'.','^':'^'};if(/^\d$/.test(e.key))calcPress(+e.key);else if(m[e.key]){e.preventDefault();calcPress(m[e.key])}});
})();
function calcPress(k){
  if (k==='clr'){calcExpr='';calcShow('0');return}
  if (k==='del'){calcExpr=calcExpr.replace(/(√\(|ANS|\^\(−1\)|.)$/,'');calcJustEval=false;calcShow();return}
  if (k==='='){try{var v=calcEval(calcExpr||'0');calcAns=v;calcShow(fmtCalc(v));calcJustEval=true}catch(err){calcShow('Error')}return}
  var s=k==='ans'?'ANS':k==='neg'?'−':String(k);
  if (calcJustEval){ if(/^[+−×÷^%]|^\^/.test(s)) calcExpr='ANS'; else calcExpr=''; calcJustEval=false }
  if (k==='neg') s='(−)';
  calcExpr+=s; calcShow();
}
function calcShow(r){$('#calce').textContent=calcExpr;if(r!=null)$('#calcr').textContent=r}
function fmtCalc(v){if(!isFinite(v))return 'Error';if(v!==0&&(Math.abs(v)>=1e10||Math.abs(v)<1e-6)){var e=v.toExponential(6).replace(/\.?0+e/,'e');return e.replace('e+','E').replace('e','E')}return String(parseFloat(v.toPrecision(10)))}
function calcEval(src){
  var s=src.replace(/\(−\)/g,'~').replace(/ANS/g,'('+calcAns+')').replace(/π/g,'(π)'),i=0;
  function peek(){return s[i]} function eat(c){if(s[i]===c){i++;return true}return false}
  function num(){var m=s.slice(i).match(/^(\d+\.?\d*|\.\d+)(E~?\d+|E-?\d+)?/);if(!m)throw 0;i+=m[0].length;return parseFloat(m[0].replace('~','-'))}
  function prim(){
    if (eat('~')) return -pow();
    if (eat('(')){var v=expr();eat(')');return post(v)}
    if (s.slice(i,i+2)==='√('){i+=2;var r=expr();eat(')');return post(Math.sqrt(r))}
    if (eat('π')) return post(Math.PI);
    return post(num());
  }
  function post(v){while(eat('%'))v=v/100;return v}
  function pow(){var b=prim();if(eat('^')){var e;if(peek()==='('){i++;e=expr();eat(')')}else e=pow();return Math.pow(b,e)}return b}
  function implicit(){var v=pow();while(i<s.length&&/[\d(√π~.]/.test(s[i])){v*=pow()}return v}
  function term(){var v=implicit();for(;;){if(eat('×'))v*=implicit();else if(eat('÷'))v/=implicit();else return v}}
  function expr(){var v=term();for(;;){if(eat('+'))v+=term();else if(eat('−'))v-=term();else return v}}
  s=s.replace(/\^\(−1\)/g,'^(~1)');
  var out=expr(); if(i<s.length) throw 0; return out;
}
function openCalc(){if(!calcEnabled)return;$('#calc').classList.add('on');document.body.classList.add('calc-open')}
function closeCalc(){var c=$('#calc');if(c)c.classList.remove('on');document.body.classList.remove('calc-open')}

/* ---------- diagnostic hub ---------- */
function diagHub(){
  var p=prog().diagnostic, run=sget('kce_ged_run_diagnostic',null);
  var h='<div class="pagehead card"><div class="eyebrow">Step 2</div><h2>Diagnostic</h2><p>A baseline across all four GED subjects. It is not timed and it does not count against you. Your instructor uses your answers to plan your lessons.</p></div>';
  h+='<div class="card content"><h3>What to Expect</h3><ul><li>50 questions: 15 Math, 15 Language Arts, 10 Social Studies, 10 Science.</li><li>A short Writing Sample: read two short articles and write a response.</li><li>No time limit. The page keeps track of how long you take. Plan for about 2 hours; you can pause and come back on the same device.</li><li>The calculator and formula sheet are available on the Math section.</li><li>Answer every question, even if you have to guess. A blank tells us less than a guess.</li><li>When you submit, every question and your answer are sent to your instructor.</li></ul>';
  if (p) h+='<p class="done" style="color:#1E7A46;font-weight:bold">✓ Diagnostic sent to your instructor '+esc(p.when)+'</p>';
  h+='<p style="margin-top:14px"><a class="btn gold" href="#diagnostic/take">'+(run&&!run.done?'Continue the Diagnostic →':p?'Retake the Diagnostic →':'Begin the Diagnostic →')+'</a></p></div>';
  app.innerHTML=h;
}
/* ---------- exam hub ---------- */
function examHub(w){
  var p=prog();
  var h='<div class="pagehead card"><div class="eyebrow">Week '+w+' · Practice GED (Form '+w+')</div><h2>Week '+w+' Practice GED</h2><p>A full-length replica of all four GED tests. Take each subject test in one sitting.</p></div>';
  
  h+='<div class="rules"><strong>Read before you start: these are timed like the real GED.</strong><ul><li>Each test has the same time limit as the real GED. The timer starts when you press Start.</li><li><strong>When time runs out, the test ends and submits automatically</strong> with the answers you have given. Unanswered questions are marked wrong.</li><li>Refreshing, closing the page or going to another page does <strong>not</strong> stop the clock.</li><li>Math: Part 1 has no calculator, and once you move to Part 2 you cannot go back. Language Arts: each part has its own clock, with a 10-minute break before Part 3.</li><li>Your results, every question and your answers are sent to your instructor when the test ends.</li></ul></div>';
  h+='<div class="examgrid">'+ORDER.map(function(s){var key='exam'+pad(w)+'-'+s, r=p[key], run=sget('kce_ged_run_'+key,null);
    return '<div class="ecard"><h4>'+SUBJ[s].name+'</h4><div class="meta">'+SUBJ[s].min+' minutes'+(s==='math'?' · 46 questions · calculator after Part 1':s==='rla'?' · 46 questions + essay':s==='ss'?' · 35 questions':' · 34 questions')+'</div>'+(r?'<div class="done">✓ Sent '+esc(r.when)+' · '+r.pct+'%</div>':'')+'<div style="margin-top:auto"><a class="btn '+(run&&!run.done?'gold':'')+' small" href="#week-'+w+'/exam/'+s+'">'+(run&&!run.done?'Resume (timer running)':r?'Review or retake':'Start')+'</a></div></div>'}).join('')+'</div>';
  app.innerHTML=h;
}

/* ---------- test runner (diagnostic + exams) ---------- */
function studentName(cb){
  var n=sget('kce_ged_name','');
  if (n) return cb(n);
  var m=modal('<h3>Your name</h3><p>Your name goes on your results so your instructor knows they are yours.</p><p><input class="fill" id="sname" style="width:100%" autocomplete="name" placeholder="First and last name"></p>',[]);
  var b=document.createElement('button');b.className='btn';b.textContent='Continue';b.type='button';$('.mb',m).appendChild(b);
  var inp=$('#sname',m); inp.focus();
  b.onclick=function(){var v=inp.value.trim();if(v.length<2){inp.style.borderColor='#DB2F30';return}sset('kce_ged_name',v);m.remove();cb(v)};
  inp.onkeydown=function(e){if(e.key==='Enter')b.onclick()};
}
function runTest(key, week){
  var isDiag=key==='diagnostic', subj=isDiag?null:key.split('-')[1];
  app.innerHTML='<div class="card"><p>Loading…</p></div>';
  load(key).then(function(D){
    var prior=prog()[key], run=sget('kce_ged_run_'+key,null);
    if (run&&run.done) run=null;
    if (!run){
      // intro screen
      var info=isDiag?'<p>50 questions and a writing sample. No time limit.</p>':'<p><strong>'+D.minutes+' minutes.</strong> The timer starts when you press Start and cannot be paused. When time runs out the test submits automatically.</p>'+(subj==='rla'?'<p>Part 1: 35 minutes · Part 2 (essay): 45 minutes · 10-minute break · Part 3: 60 minutes.</p>':'')+(subj==='math'?'<p>Part 1 (5 questions): no calculator. Part 2: on-screen calculator. Formula sheet available throughout.</p>':'');
      app.innerHTML='<div class="pagehead card"><div class="eyebrow">'+(isDiag?'Diagnostic':'Week '+week+' Practice GED')+'</div><h2>'+esc(D.title)+'</h2>'+info+(prior?(isDiag?'<p style="color:#1E7A46;font-weight:bold">You already sent the Diagnostic. Starting again sends a new set of answers.</p>':'<p style="color:#1E7A46;font-weight:bold">You already sent this test ('+prior.pct+'%). '+(prior.review?'<a href="#" id="seerev">Review your answers</a>':'')+' Starting again sends a new set of results.</p>'):'')+'<p><button class="btn gold" id="startx" type="button">'+(isDiag?'Begin':'Start the timer')+'</button> <a class="btn ghost" href="'+(isDiag?'#diagnostic':'#week-'+week+'/exam')+'">Back</a></p></div>';
      $('#startx').onclick=function(){studentName(function(name){
        var now=Date.now(); run={start:now,part:0,q:0,ans:{},flags:{},essay:'',name:name,phase:'part'};
        if (!isDiag){ if (subj==='rla') run.partEnd=now+D.parts[0].minutes*60000; else run.end=now+D.minutes*60000; }
        sset('kce_ged_run_'+key,run); go();
      })};
      var sr=$('#seerev'); if(sr) sr.onclick=function(e){e.preventDefault();showResults(D,prior.review,key,week,true)};
      return;
    }
    go();
    function go(){ document.body.classList.add('testing'); runner(D,run,key,week,isDiag,subj); }
  }).catch(function(){app.innerHTML='<div class="card content"><h3>Not available yet</h3><p>This test is being finalized and will appear here soon.</p><p><a class="btn ghost" href="'+(isDiag?'#diagnostic':'#week-'+week+'/exam')+'">Back</a></p></div>'});
}
function runner(D, run, key, week, isDiag, subj){
  var stims={};(D.stimuli||[]).forEach(function(s){stims[s.id]=s});
  var tick=null, ended=false;
  function save(){sset('kce_ged_run_'+key,run)}
  function part(){return D.parts[run.part]}
  function deadline(){ if (isDiag) return null; if (run.phase==='break') return run.breakEnd; return subj==='rla'?run.partEnd:run.end; }
  stopRunner=function(){clearInterval(tick);closeCalc();document.body.classList.remove('testing')};
  calcEnabled=false;
  function header(){
    var P=part(), title=isDiag?'Diagnostic':'Practice GED Form '+week+' · '+SUBJ[subj].short;
    var off=0,tot=0;D.parts.forEach(function(x,i){if(i<run.part)off+=(x.items||[]).length;tot+=(x.items||[]).length});
    var sub=run.phase==='break'?'Break':P.name+(P.items?' · Question '+(off+run.q+1)+' of '+tot:'');
    var mathPart2=subj==='math'&&P.calculator, diagMath=isDiag&&P.subject==='math';
    calcEnabled=mathPart2||diagMath||(!isDiag&&(subj==='sci'||subj==='ss'));
    var tools=(calcEnabled&&run.phase!=='break'?'<button type="button" id="xcalc">Calculator</button>':'')+((subj==='math'||diagMath)&&run.phase!=='break'?'<button type="button" id="xform">Formula Sheet</button>':'')+(P.items&&run.phase!=='break'?'<button type="button" id="xflag" class="flagbtn'+(run.flags[P.items[run.q].id]?' on':'')+'">'+(run.flags[P.items[run.q].id]?'Flagged':'Flag for review')+'</button>':'');
    return '<div class="xbar"><div class="in"><div class="tt">'+esc(title)+'<small>'+esc(sub)+'</small></div>'+tools+'<span class="timer" id="xtimer">--:--</span></div></div>';
  }
  function render(){
    if (ended) return;
    var P=part();
    if (run.phase==='break'){
      app.innerHTML=header()+'<div class="xwrap"><div class="card center"><h2>10-Minute Break</h2><p>Part 3 starts automatically when the break ends. You can start early.</p><div class="bigtime" id="bigt"></div><button class="btn gold" id="endbreak" type="button">Start Part 3 now</button></div></div>';
      $('#endbreak').onclick=startPart3; wireTools(); return;
    }
    if (P.essay){
      var es=P.essay;
      app.innerHTML=header()+'<div class="xwrap"><div class="xsplit"><div class="left">'+es.stims.map(function(s){return stimHTML(stims[s])}).join('')+'</div><div><div class="card"><div class="prompt content">'+es.prompt+'</div><textarea class="essay" id="essay" spellcheck="false" placeholder="Type your response here.">'+esc(run.essay||'')+'</textarea><div class="wc" id="wc"></div></div><div class="xfoot"><span></span><button class="btn gold" id="nextpart" type="button">'+(run.part===D.parts.length-1?(isDiag?'Submit the Diagnostic':'Submit test'):'Finish Part 2')+'</button></div></div></div></div>';
      var ta=$('#essay'); function wc(){var n=(ta.value.trim().match(/\S+/g)||[]).length;$('#wc').textContent=n+' words'} wc();
      ta.oninput=function(){run.essay=ta.value;save();wc()};
      $('#nextpart').onclick=function(){confirmBox(run.part===D.parts.length-1?'Submit?':'Finish Part 2?',run.part===D.parts.length-1?'This sends your answers to your instructor.':'You cannot come back to your essay after you continue.','Continue',endPart)};
      wireTools(); return;
    }
    var it=P.items[run.q], st=it.stim?stims[it.stim]:null, off=0;
    for (var pi=0;pi<run.part;pi++) off+=(D.parts[pi].items||[]).length;
    var nav='<div class="navgrid">'+P.items.map(function(x,i){return '<button type="button" data-q="'+i+'" class="'+(answered(x,run.ans[x.id])?'ans ':'')+(i===run.q?'cur ':'')+(run.flags[x.id]?'flag':'')+'" aria-label="Question '+(off+i+1)+'">'+(off+i+1)+'</button>'}).join('')+'</div>';
    var qhtml='<div class="q"><div class="qh"><span class="qn">Question '+(off+run.q+1)+'</span>'+(isDiag?'<span class="tag">'+esc(P.name)+'</span>':'')+'</div><div class="body" id="qbody">'+renderItem(it,run.ans[it.id],{name:'x'+it.id})+'</div></div>';
    var last=run.q===P.items.length-1;
    var foot='<div class="xfoot"><button class="btn ghost" id="prevq" type="button"'+(run.q===0?' disabled':'')+'>← Previous</button><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="revq" type="button">Review this part</button><button class="btn" id="nextq" type="button">'+(last?'End this part':'Next →')+'</button></div></div>';
    app.innerHTML=header()+'<div class="xwrap">'+nav+'<div class="xsplit'+(st?'':' solo')+'">'+(st?'<div class="left">'+stimHTML(st)+'</div>':'')+'<div>'+qhtml+foot+'</div></div></div>';
    bindItem($('#qbody'),it,function(){return run.ans[it.id]},function(v){run.ans[it.id]=v;save();var b=$('.navgrid button[data-q="'+run.q+'"]');if(b)b.classList.toggle('ans',answered(it,v))});
    $$('.navgrid button').forEach(function(b){b.onclick=function(){run.q=+b.dataset.q;save();render()}});
    $('#prevq').onclick=function(){if(run.q>0){run.q--;save();render()}};
    $('#nextq').onclick=function(){if(!last){run.q++;save();render()}else reviewPart()};
    $('#revq').onclick=reviewPart;
    wireTools(); updTimer();
  }
  function wireTools(){
    var c=$('#xcalc');if(c)c.onclick=function(){$('#calc').classList.contains('on')?closeCalc():openCalc()};
    var f=$('#xform');if(f)f.onclick=function(){modal(FORMULAS)};
    var fl=$('#xflag');if(fl)fl.onclick=function(){var id=part().items[run.q].id;run.flags[id]=!run.flags[id];save();render()};
    if (!calcEnabled) closeCalc();
    updTimer();
  }
  function reviewPart(){
    var P=part(), un=P.items.filter(function(x){return !answered(x,run.ans[x.id])}).length, fl=P.items.filter(function(x){return run.flags[x.id]}).length;
    var lastPart=run.part===D.parts.length-1, roff=0; for(var pi=0;pi<run.part;pi++) roff+=(D.parts[pi].items||[]).length;
    var warn=(subj==='math'&&run.part===0)?'<p><strong>You cannot return to Part 1 after you continue, and the calculator becomes available in Part 2.</strong></p>':(!lastPart?'<p>You cannot return to this part after you continue.</p>':'<p>This ends the test and sends your answers to your instructor.</p>');
    modal('<h3>Review: '+esc(P.name)+'</h3><p>'+(P.items.length-un)+' of '+P.items.length+' answered'+(un?' · <strong style="color:#DB2F30">'+un+' unanswered</strong>':'')+(fl?' · '+fl+' flagged':'')+'.</p>'+warn+'<div class="navgrid">'+P.items.map(function(x,i){return '<button type="button" data-q="'+i+'" class="'+(answered(x,run.ans[x.id])?'ans ':'')+(run.flags[x.id]?'flag':'')+'">'+(roff+i+1)+'</button>'}).join('')+'</div>',[{t:'Keep working',ghost:true},{t:lastPart?(isDiag?'Submit the Diagnostic':'Submit test'):'Continue to next part',fn:endPart}]);
    $$('.modal .navgrid button').forEach(function(b){b.onclick=function(){$('.modal').remove();run.q=+b.dataset.q;save();render()}});
  }
  function endPart(timedOut){
    closeCalc();
    if (timedOut) run.timedOut=true;
    if (run.part>=D.parts.length-1) return finish();
    run.part++; run.q=0;
    if (subj==='rla'){
      if (run.part===2){ run.phase='break'; run.breakEnd=Date.now()+10*60000; }
      else run.partEnd=Date.now()+D.parts[run.part].minutes*60000;
    }
    save(); render();
  }
  function startPart3(){ run.phase='part'; run.partEnd=Date.now()+D.parts[2].minutes*60000; save(); render(); }
  function updTimer(){
    var t=$('#xtimer'); if(!t) return;
    if (isDiag){var e=Math.floor((Date.now()-run.start)/1000);t.textContent='Time used '+Math.floor(e/3600)+':'+pad(Math.floor(e/60)%60)+':'+pad(e%60);return}
    var left=Math.max(0,Math.round((deadline()-Date.now())/1000));
    var s=Math.floor(left/3600)+':'+pad(Math.floor(left/60)%60)+':'+pad(left%60);
    t.textContent=s; t.classList.toggle('warn',left<=300&&run.phase!=='break');
    var bt=$('#bigt'); if(bt) bt.textContent=pad(Math.floor(left/60))+':'+pad(left%60);
    if (left<=0){
      if (run.phase==='break'){startPart3();return}
      if (subj==='rla'&&run.part<D.parts.length-1){ $$('.modal').forEach(function(m){m.remove()}); modal('<h3>Time is up for '+esc(part().name)+'</h3><p>This part has ended. Your answers were saved. The next part starts now.</p>',[{t:'Continue'}]); endPart(true); return; }
      $$('.modal').forEach(function(m){m.remove()}); endPart(true); finish(true);
    }
  }
  function finish(timedOut){
    if (ended) return; ended=true; clearInterval(tick); closeCalc();
    if (timedOut) run.timedOut=true;
    run.done=true; run.endAt=Date.now(); save();
    // score
    var items=[];D.parts.forEach(function(P,pi){(P.items||[]).forEach(function(it){items.push({it:it,part:P,pi:pi})})});
    var right=0, lines=[], missed=[], skills={};
    items.forEach(function(o,n){var it=o.it,v=run.ans[it.id],ok=scoreItem(it,v);if(ok)right++;
      var sk=(o.part.subject?SUBJ[o.part.subject].short+': ':'')+it.skill; skills[sk]=skills[sk]||[0,0]; skills[sk][1]++; if(ok)skills[sk][0]++;
      var line=(n+1)+'. ['+(o.part.subject?SUBJ[o.part.subject].short+' · ':'')+it.skill+'] '+(ok?'✓ CORRECT':'✗ WRONG')+' | Student: '+ansText(it,v)+' | Correct: '+correctText(it)+' | Q: '+clip(txt((it.stim&&stims[it.stim]&&!/editing|memo|letter|draft/i.test(stims[it.stim].title||'')?'':'')+it.prompt.replace(/\{\{\d+\}\}/g,'___')),220);
      lines.push(line); if(!ok) missed.push(line); });
    var pct=items.length?Math.round(right/items.length*100):0;
    var band=pct>=65?'Likely ready (KCE estimate)':pct>=55?'Almost there (KCE estimate)':'Keep practicing (KCE estimate)';
    var usedMs=run.endAt-run.start, used=Math.floor(usedMs/60000)+' min '+pad(Math.floor(usedMs/1000)%60)+' s';
    var testName=isDiag?'KCE GED Diagnostic':'Practice GED Form '+week+' — '+SUBJ[subj].name;
    var skillLines=Object.keys(skills).map(function(k){return k+': '+skills[k][0]+'/'+skills[k][1]}).join('\n');
    var payload={_subject:(isDiag?'GED Diagnostic':'GED Week '+week+' Exam — '+SUBJ[subj].short)+' — '+run.name+' — '+right+'/'+items.length+' ('+pct+'%)',
      student:run.name, test:testName, score:right+' of '+items.length, percent:pct+'%', estimated_band:band,
      time_used:used, ended_by:run.timedOut?'Time ran out (auto-submitted)':'Student submitted',
      skills_breakdown:skillLines, missed_count:String(missed.length), missed_questions:missed.join('\n')||'None — every question correct.',
      all_questions:lines.join('\n')};
    if (D.parts.some(function(P){return P.essay})){ var es=(run.essay||'').trim(); payload.essay_word_count=String((es.match(/\S+/g)||[]).length); payload.essay=es||'(no essay written)'; payload.essay_note='Score with the GED Extended Response rubric: Trait 1 Argument & Evidence (0–2), Trait 2 Development & Organization (0–2), Trait 3 Clarity & Standard English (0–2).'; }
    var review={ans:run.ans,essay:run.essay,right:right,total:items.length,pct:pct,band:band,used:used,timedOut:!!run.timedOut};
    var when=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
    setProg(key,{when:when,pct:pct,score:right+'/'+items.length,review:review});
    renderNav(isDiag?'diagnostic':'week-'+week);
    document.body.classList.remove('testing');
    showResults(D,review,key,week,false,payload);
  }
  tick=setInterval(updTimer,500);
  // if the deadline passed while away
  if (!isDiag && deadline() && Date.now()>=deadline()) { render(); updTimer(); } else render();
}
function clip(s,n){return s.length>n?s.slice(0,n-1)+'…':s}
function send(payload, el, key){
  el.className='sendmsg wait'; el.textContent='Sending your results to your instructor…';
  fetch(FORM,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
  .then(function(r){if(!r.ok)throw new Error(r.status);el.className='sendmsg ok';el.textContent='✓ Sent to your instructor.';sdel('kce_ged_pending_'+key)})
  .catch(function(){sset('kce_ged_pending_'+key,payload);el.className='sendmsg err';el.innerHTML='Not sent yet. Check your internet connection, then <button class="btn small" type="button" id="resend">Send again</button>';$('#resend').onclick=function(){send(payload,el,key)}});
}
function showResults(D, R, key, week, reviewOnly, payload){
  var isDiag=key==='diagnostic';
  if (isDiag){
    app.innerHTML='<div class="card res center"><div class="eyebrow">Diagnostic</div><h2>Thank you. Your Diagnostic is complete.</h2><p>Your answers'+(D.parts.some(function(P){return P.essay})?' and your writing sample':'')+' go to your instructor, who will use them to plan your lessons. You do not need to do anything else.</p>'+(payload?'<div id="sendmsg" class="sendmsg"></div>':'')+'<p><a class="btn gold" href="#week-1">Go to Week 1 →</a> <a class="btn ghost" href="#home">All weeks</a></p></div>';
    window.scrollTo(0,0); if (payload) send(payload,$('#sendmsg'),key); return;
  }
  var stims={};(D.stimuli||[]).forEach(function(s){stims[s.id]=s});
  var items=[];D.parts.forEach(function(P){(P.items||[]).forEach(function(it){items.push({it:it,part:P})})});
  var skills={};items.forEach(function(o){var k=(o.part.subject?SUBJ[o.part.subject].short+': ':'')+o.it.skill;skills[k]=skills[k]||[0,0];skills[k][1]++;if(scoreItem(o.it,R.ans[o.it.id]))skills[k][0]++});
  var h='<div class="card res"><div class="eyebrow">'+(isDiag?'Diagnostic':'Week '+week+' Practice GED')+' · Results</div><h2>'+esc(D.title)+'</h2><div class="big">'+R.right+' / '+R.total+' &nbsp;·&nbsp; '+R.pct+'%</div><p><strong>'+esc(R.band)+'.</strong> Time used: '+esc(R.used)+(R.timedOut?' · Time ran out, so the test submitted automatically.':'')+'</p><p style="color:#5B6475;font-size:14px">The estimate compares your percent correct with what is usually needed to pass. Official GED scores (100–200) are calculated differently.</p>'+(reviewOnly?'':'<div id="sendmsg" class="sendmsg"></div>')+
    (D.parts.some(function(P){return P.essay})?'<p>Your essay ('+((R.essay||'').trim().match(/\S+/g)||[]).length+' words) was sent to your instructor for scoring with the official GED essay rubric.</p>':'')+
    '<table class="skilltbl"><thead><tr><th>Skill</th><th>Correct</th><th style="width:30%"></th></tr></thead><tbody>'+Object.keys(skills).map(function(k){var s=skills[k];return '<tr><td>'+esc(k)+'</td><td>'+s[0]+' / '+s[1]+'</td><td><div class="meter"><i style="width:'+Math.round(s[0]/s[1]*100)+'%"></i></div></td></tr>'}).join('')+'</tbody></table>'+
    '<p><a class="btn ghost" href="'+(isDiag?'#home':'#week-'+week+'/exam')+'">'+(isDiag?'Back to all weeks →':'Back to this week\'s Practice GED')+'</a> <button class="btn" type="button" id="showrev">Review every question</button></p></div><div id="rev" class="review"></div>';
  app.innerHTML=h; window.scrollTo(0,0);
  if (payload) send(payload,$('#sendmsg'),key);
  $('#showrev').onclick=function(){
    var last=null,out='';
    items.forEach(function(o,n){var it=o.it,v=R.ans[it.id],ok=scoreItem(it,v);
      if (it.stim&&it.stim!==last) out+=stimHTML(stims[it.stim]); last=it.stim||last;
      out+='<div class="q '+(ok?'right':'wrong')+'"><div class="qh"><span class="qn">Question '+(n+1)+' · '+(ok?'<span style="color:#1E7A46">Correct</span>':'<span style="color:#DB2F30">Incorrect</span>')+'</span><span class="tag">'+esc(it.skill)+'</span></div>'+renderItem(it,v,{name:'r'+it.id,review:true})+'<div class="fb show '+(ok?'ok':'no')+'">'+(!ok&&whyFor(it,v)?'<div class="whyline"><strong>Why your answer is not right:</strong> '+whyFor(it,v)+'</div>':'')+'<strong>Correct answer: '+esc(correctText(it))+'</strong><div class="content" style="margin-top:6px">'+it.explain+'</div></div></div>'});
    $('#rev').innerHTML=out; this.disabled=true;
  };
}
// resend anything that failed earlier
(function(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('kce_ged_pending_')===0){var p=sget(k,null);if(p)fetch(FORM,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(p)}).then(function(kk){return function(r){if(r.ok)sdel(kk)}}(k)).catch(function(){})}}}catch(e){}})();

route();
})();

/* KCE GED Prep course engine — KingCretot Experience.
   One page: Intro, Diagnostic, Weeks 1-10 (Teaching Lesson, Student Lesson, Post Lesson, Practice,
   Vocabulary & Notes per subject) and a timed Practice GED (4 subject tests) at the end of each week.
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
var TABS = [['teach','Teaching Lesson'],['student','Student Lesson'],['post','Post Lesson'],['practice','Practice'],['vocab','Vocabulary & Notes']];
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
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function txt(html){var d=document.createElement('div');d.innerHTML=String(html||'').replace(/<br\s*\/?>/g,' ').replace(/<\/(p|li|tr|h3|h4|div)>/g,' $& ');return d.textContent.replace(/\s+/g,' ').trim()}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shuffled(n,seed){var a=[];for(var i=0;i<n;i++)a.push(i);var x=hash(seed)||1;for(var j=n-1;j>0;j--){x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;var k=x%(j+1);var t=a[j];a[j]=a[k];a[k]=t}return a}
var LET='ABCDEF';

/* ---------- nav ---------- */
function renderNav(active){
  var p=prog(), h='<div class="wrap">';
  h+='<a href="#intro" class="'+(active==='intro'?'on':'')+'">Start Here</a>';
  h+='<a href="#diagnostic" class="'+(active==='diagnostic'?'on':'')+'">Diagnostic'+(p.diagnostic?' <span class="ck">✓</span>':'')+'</a>';
  for (var w=1;w<=10;w++){
    var done=ORDER.every(function(s){return p['exam'+pad(w)+'-'+s]});
    h+='<a href="#week-'+w+'" class="'+(active==='week-'+w?'on':'')+'">Week '+w+(done?' <span class="ck">✓</span>':'')+'</a>';
  }
  $('#cnav').innerHTML=h+'</div>';
}

/* ---------- router ---------- */
var stopRunner=null;
function route(){
  if (stopRunner){stopRunner();stopRunner=null}
  closeCalc(); document.body.classList.remove('testing');
  var h=(location.hash||'#intro').slice(1).split('/');
  window.scrollTo(0,0);
  if (h[0]==='intro'||h[0]===''){renderNav('intro');app.innerHTML=$('#tpl-intro').innerHTML;return}
  if (h[0]==='diagnostic'){renderNav('diagnostic');return h[1]==='take'?runTest('diagnostic'):diagHub()}
  var m=h[0].match(/^week-(\d+)$/);
  if (m){var w=+m[1]; if(w<1||w>10){location.hash='#intro';return}
    renderNav('week-'+w);
    if (h[1]==='exam') return h[2]&&SUBJ[h[2]]?runTest('exam'+pad(w)+'-'+h[2],w):examHub(w);
    return weekView(w, SUBJ[h[1]]?h[1]:'math', h[2]||'student');
  }
  location.hash='#intro';
}
window.addEventListener('hashchange',route);

/* ---------- week view ---------- */
function weekView(w, subj, tab){
  var t=MAP[w];
  var h='<div class="pagehead card"><div class="eyebrow">Week '+w+' of 10</div><h2>Week '+w+'</h2><p>'+ORDER.map(function(s){return '<strong>'+SUBJ[s].short+':</strong> '+esc(t[s])}).join(' &nbsp;·&nbsp; ')+'</p></div>';
  h+='<div class="pills subj">'+ORDER.map(function(s){return '<a class="pill'+(s===subj?' on':'')+'" href="#week-'+w+'/'+s+'/'+tab+'">'+SUBJ[s].short+'</a>'}).join('')+'<a class="pill exam" href="#week-'+w+'/exam">Week '+w+' Practice GED</a></div>';
  h+='<div class="pills tabs">'+TABS.map(function(x){return '<a class="pill'+(x[0]===tab?' on':'')+'" href="#week-'+w+'/'+subj+'/'+x[0]+'">'+x[1]+'</a>'}).join('')+'</div>';
  h+='<div class="card" id="panel"><p>Loading…</p></div>';
  app.innerHTML=h;
  var panel=$('#panel');
  load('w'+pad(w)+'-'+subj).then(function(d){
    var label=TABS.filter(function(x){return x[0]===tab})[0]; label=label?label[1]:'';
    var ph='<div class="printhead"><div class="pb">KingCretot Experience<small>KCE GED PREP · EDUCATE. EMPOWER. EXCEL.</small></div><div class="pt">Week '+w+' · '+SUBJ[subj].short+'<br>'+esc(label)+'</div></div>';
    var tool='<div class="toolrow"><span class="who">'+(tab==='teach'?'For the instructor':tab==='practice'?'Practice · two tries per question':'For the student')+'</span>'+(tab!=='practice'?'<button class="btn ghost small noprint" id="printbtn" type="button">Print this page</button>':'')+'</div>';
    var title='<h3>'+esc(d.title)+'</h3>';
    var body='';
    if (tab==='teach'||tab==='student'){
      body=(tab==='student'?'':'')+'<div class="objectives"><h4>Objectives</h4><ul>'+(d.objectives||[]).map(function(o){return '<li>'+o+'</li>'}).join('')+'</ul></div>'+'<div class="content">'+d[tab]+'</div>';
    } else if (tab==='post'){ body='<div class="content">'+d.post+'</div>'; }
    else if (tab==='vocab'){
      body='<div class="content"><h3>Vocabulary</h3></div><div class="vocab">'+(d.vocab||[]).map(function(v){return '<div class="v"><div class="t">'+esc(v.term)+'</div><div class="d">'+v.def+(v.example?'<br><em>Example: '+v.example+'</em>':'')+'</div></div>'}).join('')+'</div><div class="content notesprint">'+(/^\s*<h3/i.test(d.notes)?'':'<h3>Study Notes</h3>')+d.notes+'</div>';
    } else if (tab==='practice'){ body='<div id="practice"></div>'; }
    panel.innerHTML=ph+tool+'<div class="content">'+title+'</div>'+body;
    if (tab==='practice') renderPractice($('#practice'), d.practice, 'w'+pad(w)+subj);
    var pb=$('#printbtn'); if(pb) pb.onclick=function(){window.print()};
  }).catch(function(){
    panel.innerHTML='<div class="content"><h3>'+esc(MAP[w][subj])+'</h3><p>This lesson is being finalized and will appear here soon.</p></div>';
  });
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
    f.series.forEach(function(se,j){var pts=se.values.map(function(v,i){return (L+bw*i+bw/2)+','+y(v)}).join(' ');s+='<polyline points="'+pts+'" fill="none" stroke="'+PALETTE[j%5]+'" stroke-width="2.5"/>';se.values.forEach(function(v,i){s+='<circle cx="'+(L+bw*i+bw/2)+'" cy="'+y(v)+'" r="3.5" fill="'+PALETTE[j%5]+'"/>'})});
  }
  if (f.xLabel) s+='<text x="'+(L+pw/2)+'" y="'+(H-12)+'" text-anchor="middle" fill="#0A1F3D" font-weight="bold">'+esc(f.xLabel)+'</text>';
  if (f.yLabel) s+='<text transform="translate(14,'+(T+ph/2)+') rotate(-90)" text-anchor="middle" fill="#0A1F3D" font-weight="bold">'+esc(f.yLabel)+'</text>';
  if (f.series.length>1){var lx=L+6;f.series.forEach(function(se,j){s+='<rect x="'+lx+'" y="'+(T+2)+'" width="12" height="12" fill="'+PALETTE[j%5]+'"/><text x="'+(lx+16)+'" y="'+(T+12)+'" fill="#333">'+esc(se.name)+'</text>';lx+=26+String(se.name).length*7})}
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
    h+='<div class="drag"><div class="chips" data-bin="-1" aria-label="Items to place">'+it.choices.map(function(c,i){return place[i]==null?'<span class="chip" data-c="'+i+'" tabindex="0">'+c+'</span>':''}).join('')+'</div><div class="bins">'+it.bins.map(function(b,bi){
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
        if (v[ci]!=null&&chip.closest('.bin')){v[ci]=null;setVal(v);picked=null;rerender();return}
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
function normFill(s){return String(s==null?'':s).toLowerCase().replace(/[\u2212\u2013]/g,'-').replace(/\s+/g,'').replace(/[$,]/g,'').replace(/(dollars?|units?|feet|ft|inches|in|cm|meters|m|percent|%|degrees|°)$/,'')}
function parseNum(raw){var mm=String(raw).trim().replace(/[\u2212\u2013]/g,'-').match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(mm){var v0=+mm[2]+mm[3]/mm[4];return mm[1]?-v0:v0}var s=normFill(raw);if(/^-?\d+\/\d+$/.test(s)){var p=s.split('/');return p[0]/p[1]}if(/^-?\d+\s*\d+\/\d+$/.test(s))return NaN;var v=Number(s.replace('−','-'));return s===''?NaN:v}
function scoreItem(it,val){
  if (val==null||val==='') return false;
  switch(it.type){
    case 'mc': return val===it.answer;
    case 'multi': return Array.isArray(val)&&val.length===it.answer.length&&it.answer.every(function(a){return val.indexOf(a)>=0});
    case 'dropdown': return Array.isArray(val)&&it.blanks.every(function(b,i){return val[i]===b.answer});
    case 'fill': var n=normFill(val); if(it.answer.some(function(a){return normFill(a)===n}))return true; if(typeof it.value==='number'){var v=parseNum(val);return !isNaN(v)&&Math.abs(v-it.value)<=(it.tol||1e-9)+1e-9}return false;
    case 'drag': return Array.isArray(val)&&it.answer.every(function(a,i){return val[i]===a});
    case 'hotspot': return it.plane?Array.isArray(val)&&val[0]===it.answer[0]&&val[1]===it.answer[1]:val===it.answer;
  }
  return false;
}
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

/* ---------- practice ---------- */
function renderPractice(root, P, key){
  var stims={};(P.stimuli||[]).forEach(function(s){stims[s.id]=s});
  var store=sget('kce_ged_prac_'+key,{}), lastStim=null;
  var h='<div class="scorebar card" style="padding:12px 16px"><strong>Your practice score:</strong> <span id="pscore"></span><button class="btn ghost small" id="preset" type="button">Start over</button></div>';
  P.items.forEach(function(it,i){
    if (it.stim&&it.stim!==lastStim){h+=stimHTML(stims[it.stim]);} lastStim=it.stim||lastStim;
    h+='<div class="q" id="pq-'+i+'"><div class="qh"><span class="qn">Question '+(i+1)+'</span><span class="tag">'+esc(it.skill)+'</span></div><div class="body"></div><div class="qbtns"><button class="btn small chk" type="button">Check answer</button>'+(it.hint?'<button class="btn ghost small hnt" type="button">Hint</button>':'')+'</div><div class="fb"></div></div>';
  });
  root.innerHTML=h;
  function upd(){var done=0,right=0;P.items.forEach(function(it){var s=store[it.id];if(s&&s.done){done++;if(s.ok)right++}});$('#pscore').textContent=right+' correct out of '+done+' finished ('+P.items.length+' questions)'}
  P.items.forEach(function(it,i){
    var q=$('#pq-'+i), body=$('.body',q), fb=$('.fb',q), st=store[it.id]||{tries:0}, val=st.val;
    function draw(review){body.innerHTML=renderItem(it,val,{name:'p'+key+i,review:review}); if(!review) bindItem(body,it,function(){return val},function(v){val=v})}
    function finish(ok){st.done=true;st.ok=ok;st.val=val;store[it.id]=st;sset('kce_ged_prac_'+key,store);draw(true);fb.className='fb show '+(ok?'ok':'no');fb.innerHTML='<strong>'+(ok?'Correct!':'The correct answer: '+esc(correctText(it)))+'</strong><div class="content" style="margin-top:6px">'+it.explain+'</div>';$('.chk',q).disabled=true;var hb=$('.hnt',q);if(hb)hb.disabled=true;upd()}
    if (st.done){draw(true);fb.className='fb show '+(st.ok?'ok':'no');fb.innerHTML='<strong>'+(st.ok?'Correct!':'The correct answer: '+esc(correctText(it)))+'</strong><div class="content" style="margin-top:6px">'+it.explain+'</div>';$('.chk',q).disabled=true;var hb0=$('.hnt',q);if(hb0)hb0.disabled=true}
    else draw(false);
    $('.chk',q).onclick=function(){
      if (!answered(it,val)){fb.className='fb show info';fb.innerHTML='Answer the question first'+(it.type==='multi'?' (select '+it.answer.length+')':it.type==='drag'?' (place every item)':it.type==='dropdown'?' (choose from every menu)':'')+'.';return}
      if (scoreItem(it,val)) return finish(true);
      st.tries=(st.tries||0)+1; store[it.id]=st; sset('kce_ged_prac_'+key,store);
      if (st.tries>=2) return finish(false);
      fb.className='fb show no';fb.innerHTML='<strong>Not quite. Try once more.</strong>'+(it.hint?' Hint: '+it.hint:'');
    };
    var hb=$('.hnt',q); if(hb) hb.onclick=function(){fb.className='fb show info';fb.innerHTML='<strong>Hint:</strong> '+it.hint};
  });
  $('#preset').onclick=function(){confirmBox('Start this practice over?','Your answers on this practice set will be cleared.','Start over',function(){sdel('kce_ged_prac_'+key);renderPractice(root,P,key)})};
  upd();
}

/* ---------- modal ---------- */
function modal(html, buttons){
  var m=document.createElement('div');m.className='modal';m.innerHTML='<div class="mc" role="dialog" aria-modal="true">'+html+'<div class="mb"></div></div>';
  var mb=$('.mb',m);(buttons||[{t:'Close'}]).forEach(function(b){var x=document.createElement('button');x.type='button';x.className='btn'+(b.ghost?' ghost':'');x.textContent=b.t;x.onclick=function(){m.remove();b.fn&&b.fn()};mb.appendChild(x)});
  document.body.appendChild(m); return m;
}
function confirmBox(title,msg,ok,fn){modal('<h3>'+esc(title)+'</h3><p>'+msg+'</p>',[{t:'Cancel',ghost:true},{t:ok,fn:fn}])}
var FORMULAS='<h3>Mathematics Formula Sheet</h3><div class="fs"><table><tr><th colspan="2">Area of a</th></tr><tr><td>parallelogram</td><td>A = bh</td></tr><tr><td>trapezoid</td><td>A = &frac12;h(b<sub>1</sub> + b<sub>2</sub>)</td></tr>'+
 '<tr><th colspan="2">Surface Area and Volume of a</th></tr><tr><td>rectangular/right prism</td><td>SA = ph + 2B &nbsp;&nbsp; V = Bh</td></tr><tr><td>cylinder</td><td>SA = 2&pi;rh + 2&pi;r<sup>2</sup> &nbsp;&nbsp; V = &pi;r<sup>2</sup>h</td></tr><tr><td>pyramid</td><td>SA = &frac12;ps + B &nbsp;&nbsp; V = &#8531;Bh</td></tr><tr><td>cone</td><td>SA = &pi;rs + &pi;r<sup>2</sup> &nbsp;&nbsp; V = &#8531;&pi;r<sup>2</sup>h</td></tr><tr><td>sphere</td><td>SA = 4&pi;r<sup>2</sup> &nbsp;&nbsp; V = &#8532;&pi;r<sup>3</sup></td></tr><tr><td colspan="2"><em>(p = perimeter of base with area B; &pi; &asymp; 3.14)</em></td></tr>'+
 '<tr><th colspan="2">Algebra</th></tr><tr><td>slope of a line</td><td>m = (y<sub>2</sub> &minus; y<sub>1</sub>) / (x<sub>2</sub> &minus; x<sub>1</sub>)</td></tr><tr><td>slope-intercept form</td><td>y = mx + b</td></tr><tr><td>point-slope form</td><td>y &minus; y<sub>1</sub> = m(x &minus; x<sub>1</sub>)</td></tr><tr><td>standard form of a quadratic</td><td>y = ax<sup>2</sup> + bx + c</td></tr><tr><td>quadratic formula</td><td>x = (&minus;b &plusmn; &radic;(b<sup>2</sup> &minus; 4ac)) / 2a</td></tr><tr><td>Pythagorean theorem</td><td>a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></td></tr><tr><td>simple interest</td><td>I = prt &nbsp;(I = interest, p = principal, r = rate, t = time)</td></tr>'+
 '<tr><th colspan="2">Other</th></tr><tr><td>distance</td><td>d = rt &nbsp;(d = distance, r = rate, t = time)</td></tr><tr><td>total cost</td><td>total cost = (number of units) &times; (price per unit)</td></tr></table></div>';

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
  if (p) h+='<p class="done" style="color:#1E7A46;font-weight:bold">✓ Diagnostic sent '+esc(p.when)+(p.pct!=null?' · '+p.pct+'% correct':'')+'</p>';
  h+='<p style="margin-top:14px"><a class="btn gold" href="#diagnostic/take">'+(run&&!run.done?'Continue the Diagnostic →':p?'Retake the Diagnostic →':'Begin the Diagnostic →')+'</a></p></div>';
  app.innerHTML=h;
}
/* ---------- exam hub ---------- */
function examHub(w){
  var p=prog();
  var h='<div class="pagehead card"><div class="eyebrow">Week '+w+' · Practice GED (Form '+w+')</div><h2>Week '+w+' Practice GED</h2><p>A full-length replica of all four GED tests. Take each subject test in one sitting.</p></div>';
  h+='<div class="pills subj">'+ORDER.map(function(s){return '<a class="pill" href="#week-'+w+'/'+s+'/student">'+SUBJ[s].short+'</a>'}).join('')+'<a class="pill exam on" href="#week-'+w+'/exam">Week '+w+' Practice GED</a></div>';
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
      app.innerHTML='<div class="pagehead card"><div class="eyebrow">'+(isDiag?'Diagnostic':'Week '+week+' Practice GED')+'</div><h2>'+esc(D.title)+'</h2>'+info+(prior?'<p style="color:#1E7A46;font-weight:bold">You already sent this test ('+prior.pct+'%). '+(prior.review?'<a href="#" id="seerev">Review your answers</a>':'')+' Starting again sends a new set of results.</p>':'')+'<p><button class="btn gold" id="startx" type="button">'+(isDiag?'Begin':'Start the timer')+'</button> <a class="btn ghost" href="'+(isDiag?'#diagnostic':'#week-'+week+'/exam')+'">Back</a></p></div>';
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
  var stims={};(D.stimuli||[]).forEach(function(s){stims[s.id]=s});
  var items=[];D.parts.forEach(function(P){(P.items||[]).forEach(function(it){items.push({it:it,part:P})})});
  var skills={};items.forEach(function(o){var k=(o.part.subject?SUBJ[o.part.subject].short+': ':'')+o.it.skill;skills[k]=skills[k]||[0,0];skills[k][1]++;if(scoreItem(o.it,R.ans[o.it.id]))skills[k][0]++});
  var h='<div class="card res"><div class="eyebrow">'+(isDiag?'Diagnostic':'Week '+week+' Practice GED')+' · Results</div><h2>'+esc(D.title)+'</h2><div class="big">'+R.right+' / '+R.total+' &nbsp;·&nbsp; '+R.pct+'%</div><p><strong>'+esc(R.band)+'.</strong> Time used: '+esc(R.used)+(R.timedOut?' · Time ran out, so the test submitted automatically.':'')+'</p><p style="color:#5B6475;font-size:14px">The estimate compares your percent correct with what is usually needed to pass. Official GED scores (100–200) are calculated differently.</p>'+(reviewOnly?'':'<div id="sendmsg" class="sendmsg"></div>')+
    (D.parts.some(function(P){return P.essay})?'<p>Your essay ('+((R.essay||'').trim().match(/\S+/g)||[]).length+' words) was sent to your instructor for scoring with the official GED essay rubric.</p>':'')+
    '<table class="skilltbl"><thead><tr><th>Skill</th><th>Correct</th><th style="width:30%"></th></tr></thead><tbody>'+Object.keys(skills).map(function(k){var s=skills[k];return '<tr><td>'+esc(k)+'</td><td>'+s[0]+' / '+s[1]+'</td><td><div class="meter"><i style="width:'+Math.round(s[0]/s[1]*100)+'%"></i></div></td></tr>'}).join('')+'</tbody></table>'+
    '<p><a class="btn ghost" href="'+(isDiag?'#week-1':'#week-'+week+'/exam')+'">'+(isDiag?'Go to Week 1 →':'Back to this week\'s Practice GED')+'</a> <button class="btn" type="button" id="showrev">Review every question</button></p></div><div id="rev" class="review"></div>';
  app.innerHTML=h; window.scrollTo(0,0);
  if (payload) send(payload,$('#sendmsg'),key);
  $('#showrev').onclick=function(){
    var last=null,out='';
    items.forEach(function(o,n){var it=o.it,v=R.ans[it.id],ok=scoreItem(it,v);
      if (it.stim&&it.stim!==last) out+=stimHTML(stims[it.stim]); last=it.stim||last;
      out+='<div class="q '+(ok?'right':'wrong')+'"><div class="qh"><span class="qn">Question '+(n+1)+' · '+(ok?'<span style="color:#1E7A46">Correct</span>':'<span style="color:#DB2F30">Incorrect</span>')+'</span><span class="tag">'+esc(it.skill)+'</span></div>'+renderItem(it,v,{name:'r'+it.id,review:true})+'<div class="fb show '+(ok?'ok':'no')+'"><strong>Correct answer: '+esc(correctText(it))+'</strong><div class="content" style="margin-top:6px">'+it.explain+'</div></div></div>'});
    $('#rev').innerHTML=out; this.disabled=true;
  };
}
// resend anything that failed earlier
(function(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('kce_ged_pending_')===0){var p=sget(k,null);if(p)fetch(FORM,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(p)}).then(function(kk){return function(r){if(r.ok)sdel(kk)}}(k)).catch(function(){})}}}catch(e){}})();

route();
})();

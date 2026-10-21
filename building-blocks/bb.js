/* KCE Building Blocks runtime: lessons, practice sets, course page, teacher lock */
(function(){
var FORM='https://formspree.io/f/maeqzabe', TPIN='9110', PKEY='kce_bb_progress', UKEY='kce_bb_unlocked', AKEY='kce_bb_attempts';
function rd(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return {}}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function html(s){return String(s==null?'':s)}
function post(o){try{fetch(FORM,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(o)}).catch(function(){})}catch(e){}}
function passed(id){var p=rd(PKEY)[id];return !!(p&&p.passed)}
function unlocked(id){return !!rd(UKEY)[id]}
function teacher(){try{return localStorage.getItem('kce_bb_teacher')==='1'}catch(e){return false}}
function letters(i){return 'ABCDEFGH'[i]}
function prettyDate(iso){var d=new Date(iso+'T12:00:00');return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}

/* ---------- visuals ---------- */
function rep(s,n){var o='';for(var i=0;i<n;i++)o+=s;return o}
function gcls(n){return n>9?' grp-xl':(n>6?' grp-l':'')}
function vis(v){
  if(!v) return '';
  var k=v.kind, e=v.emoji||'●';
  if(k==='groups'){var o='<div class="vis">';for(var g=0;g<v.groups;g++)o+='<div class="grp'+gcls(v.each)+'">'+rep('<span>'+e+'</span>',v.each)+'</div>';return o+'</div>'+(v.label?'<p style="text-align:center;margin:0;font-family:Fredoka,sans-serif">'+esc(v.label)+'</p>':'');}
  if(k==='compare'){return '<div class="cmp">'+v.sets.map(function(st){return '<div class="cmpset"><div class="cmpl">'+esc(st.label)+'</div><div class="vis">'+st.groups.map(function(n){return '<div class="grp'+gcls(n)+'">'+rep('<span>'+(st.emoji||e)+'</span>',n)+'</div>'}).join('')+'</div></div>'}).join('')+'</div>';}
  if(k==='uneven'){var o2='<div class="vis">';v.sets.forEach(function(n){o2+='<div class="grp'+gcls(n)+'">'+rep('<span>'+e+'</span>',n)+'</div>'});return o2+'</div>';}
  if(k==='array'&&v.split){var a1='<div class="arr" style="grid-template-columns:repeat('+v.cols+',auto)">',a2=a1;return '<div class="vis" style="flex-direction:column;align-items:center;gap:14px">'+a1+rep('<span>'+e+'</span>',v.split*v.cols)+'</div>'+a2+rep('<span>'+(v.emoji2||e)+'</span>',(v.rows-v.split)*v.cols)+'</div></div>'+(v.label?'<p style="text-align:center;margin:0;font-family:Fredoka,sans-serif">'+esc(v.label)+'</p>':'');}
  if(k==='array'){return '<div class="vis"><div class="arr" style="grid-template-columns:repeat('+v.cols+',auto)">'+rep('<span>'+e+'</span>',v.rows*v.cols)+'</div></div>'+(v.label?'<p style="text-align:center;margin:0;font-family:Fredoka,sans-serif">'+esc(v.label)+'</p>':'');}
  if(k==='numberline'){var j=v.jump,n=v.jumps,end=(v.start||0)+j*n,W=Math.max(520,n*70),s='<div class="nl"><svg viewBox="0 0 '+(W+40)+' 110" width="100%" style="max-width:'+(W+40)+'px;display:block;margin:auto"><line x1="20" y1="80" x2="'+(W+20)+'" y2="80" stroke="#0A1F3D" stroke-width="3"/>';
    for(var t=0;t<=n;t++){var x=20+t*W/n;s+='<line x1="'+x+'" y1="72" x2="'+x+'" y2="88" stroke="#0A1F3D" stroke-width="3"/><text x="'+x+'" y="106" text-anchor="middle" font-size="16" font-family="Fredoka,sans-serif">'+((v.start||0)+t*j)+'</text>';
      if(t<n){var x2=20+(t+1)*W/n;s+='<path d="M'+x+' 72 Q'+((x+x2)/2)+' 20 '+x2+' 72" fill="none" stroke="'+(v.color||'#2E86DE')+'" stroke-width="3"/><text x="'+((x+x2)/2)+'" y="34" text-anchor="middle" font-size="14" fill="#2E86DE" font-family="Fredoka,sans-serif">+'+j+'</text>';}}
    return s+'</svg></div>';}
  if(k==='triangle'){return '<div class="vis"><svg viewBox="0 0 240 200" width="240"><polygon points="120,12 228,188 12,188" fill="#F3F8FF" stroke="#2E86DE" stroke-width="5" stroke-linejoin="round"/><text x="120" y="78" text-anchor="middle" font-size="34" font-family="Fredoka,sans-serif" fill="#DB2F30">'+esc(v.c)+'</text><text x="62" y="170" text-anchor="middle" font-size="30" font-family="Fredoka,sans-serif" fill="#0A1F3D">'+esc(v.a)+'</text><text x="178" y="170" text-anchor="middle" font-size="30" font-family="Fredoka,sans-serif" fill="#0A1F3D">'+esc(v.b)+'</text><text x="120" y="172" text-anchor="middle" font-size="22" fill="#5b6578">×  ÷</text></svg></div>';}
  if(k==='area'){var cols=v.split,o3='<table class="area"><tr><th></th>';cols.forEach(function(c){o3+='<th>'+c+'</th>'});o3+='</tr><tr><th>'+v.b+'</th>';cols.forEach(function(c){o3+='<td>'+(v.show?c+' × '+v.b+'<br><b>'+(c*v.b).toLocaleString('en-US')+'</b>':'?')+'</td>'});return o3+'</tr></table>'+(v.show?'<p style="text-align:center;font-family:Fredoka,sans-serif;font-size:22px;margin:4px 0">'+cols.map(function(c){return (c*v.b).toLocaleString('en-US')}).join(' + ')+' = <b>'+cols.reduce(function(a,c){return a+c*v.b},0).toLocaleString('en-US')+'</b></p>':'');}
  if(k==='longdiv'){return '<div class="vis"><div class="ld">'+esc(v.text)+'</div></div>';}
  if(k==='placevalue'){var d=String(v.n).split(''),names=['Thousands','Hundreds','Tens','Ones'].slice(4-d.length),o4='<table class="pv"><tr>';names.forEach(function(x){o4+='<th>'+x+'</th>'});o4+='</tr><tr>';d.forEach(function(x){o4+='<td>'+x+'</td>'});return o4+'</tr></table>';}
  if(k==='contraction'){return '<div class="bigword">'+esc(v.a)+' '+v.b.split('').map(function(ch,i){return (v.drop&&v.drop.indexOf(i)>-1)?'<span class="strike">'+esc(ch)+'</span>':esc(ch)}).join('')+'</div><div class="big" style="font-size:40px">⬇️</div><div class="bigword" style="color:#DB2F30">'+esc(v.result)+'</div>';}
  if(k==='bigtext'){return '<div class="bigword">'+html(v.text)+'</div>'+(v.sub?'<p style="text-align:center;color:#5b6578;margin:4px 0">'+esc(v.sub)+'</p>':'');}
  if(k==='emoji'){return '<div class="big">'+esc(v.text)+'</div>';}
  if(k==='passage'){return '<div class="passage">'+html(v.text)+'</div>';}
  if(k==='svg'){return '<div class="vis">'+v.svg+'</div>';}
  return '';
}
window.BBvis=vis;

/* ---------- multiple choice widget ---------- */
function norm0(x){return String(x==null?'':x).toLowerCase().replace(/[’‘'`"“”]/g,'').replace(/[×*✕]/g,'x').replace(/[,!?;:$]/g,'').replace(/\.(?!\d)/g,'').replace(/\s+/g,'').replace(/[−–—]/g,'-').replace(/([a-z])-(?=[a-z])/g,'$1')}
function norm(x){var n=norm0(x);if(/^-?\d*\.?\d+$/.test(n)){var v=parseFloat(n);if(!isNaN(v))return String(v)}return n}
function strip(x){var d=document.createElement('div');d.innerHTML=x;return d.textContent}
function answerText(q){return q.type==='fill'?q.answers[0]:q.choices[q.a]}
/* ask(): one question, up to 3 tries. Wrong tries reset everything (nothing stays marked).
   After the 3rd wrong try: explanation + answer. onDone(firstTry, gotIt, firstResponse) */
function ask(box,q,opts){
  var tries=opts.tries||3, used=0, done=false, first=null;
  var head='<div class="q">'+html(q.q)+'</div>'+vis(q.visual);
  function finishQ(ok){done=true;opts.onDone&&opts.onDone(ok&&used===1,ok,first)}
  function wrongMsg(extra){return '❌ '+html(extra||'Not yet.')+' <b>Try again'+(tries-used===1?' (last try)':'')+'!</b>'}
  if(q.type==='fill'){
    box.innerHTML=head+'<div class="fillrow"><input class="fillin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+esc(q.placeholder||'Type your answer')+'"><button class="btn2 fillgo">Check</button></div><div class="fb"></div>';
    var inp=box.querySelector('.fillin'),go=box.querySelector('.fillgo'),fb=box.querySelector('.fb');
    function submit(){if(done)return;var v=norm(inp.value);if(!v){fb.className='fb show no';fb.innerHTML='Type an answer first.';return}
      used++;if(first===null)first=inp.value;
      if(q.answers.some(function(a){var n=norm(a);return n===v||(/^\d+$/.test(n)&&new RegExp('^'+n+'[a-z]{3,}$').test(v))})){inp.classList.add('ok');inp.disabled=true;go.disabled=true;fb.className='fb show ok';fb.innerHTML='✅ <b>Yes!</b> '+html(q.why||'');finishQ(true);return}
      if(used>=tries){inp.disabled=true;go.disabled=true;fb.className='fb show no';fb.innerHTML='The answer is <b>'+html(q.answers[0])+'</b>. '+html(q.why||'');finishQ(false);return}
      fb.className='fb show no';fb.innerHTML=wrongMsg(used===2&&q.hint?q.hint:(q.no||'Not yet. Think about what you learned.'));inp.value='';inp.focus();}
    go.onclick=submit;inp.onkeydown=function(e){if(e.key==='Enter')submit()};
    return;
  }
  var h=head+'<div class="choices">';q.choices.forEach(function(c,i){h+='<button class="ch" data-i="'+i+'">'+html(c)+'</button>'});
  box.innerHTML=h+'</div><div class="fb"></div>';
  var fb2=box.querySelector('.fb'),bs=box.querySelectorAll('.ch');
  bs.forEach(function(b){b.onclick=function(){
    if(done)return;var i=+b.dataset.i;used++;if(first===null)first=strip(q.choices[i]);
    if(i===q.a){b.classList.add('right');bs.forEach(function(x){x.disabled=true});fb2.className='fb show ok';fb2.innerHTML='✅ <b>Yes!</b> '+html(q.why||'');finishQ(true);return}
    if(used>=tries){bs.forEach(function(x){x.disabled=true});bs[q.a].classList.add('right');fb2.className='fb show no';fb2.innerHTML='The answer is <b>'+html(q.choices[q.a])+'</b>. '+html(q.why||'');finishQ(false);return}
    var why=(q.no&&q.no[i])||'Not yet.';
    b.classList.add('wrong');setTimeout(function(){bs.forEach(function(x){x.classList.remove('wrong')})},700);
    fb2.className='fb show no';fb2.innerHTML=wrongMsg(why);
  }});
}
/* ---------- lock overlay ---------- */
function lockScreen(msg,id,label,onOpen,student){
  var ov=document.createElement('div');ov.className='lockov';
  ov.innerHTML='<div class="lockbox"><div class="big">🔒</div><h2 class="fred" style="color:#0A1F3D;margin:4px 0">Not open yet</h2><p>'+msg+'</p>'+
  '<p><a class="btn2" href="index.html" style="text-decoration:none;display:inline-block">Back to my lessons</a></p>'+
  '<p style="font-size:13px;color:#8a93a3;margin-top:18px">Teacher code: <input id="bbpin" type="password" inputmode="numeric" style="width:90px"> <button class="btn2" id="bbok" style="padding:6px 12px;font-size:13px">Open</button></p><div class="m" id="bbm"></div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#bbok').onclick=function(){var v=ov.querySelector('#bbpin').value;
    if(v===TPIN){var u=rd(UKEY);u[id]=true;wr(UKEY,u);ov.remove();onOpen&&onOpen();}
    else ov.querySelector('#bbm').textContent='That code is not right.';};
}

/* ---------- lesson player ---------- */
window.BBLesson=function(L){
  document.documentElement.style.setProperty('--acc',L.color||'#2E86DE');
  var id=L.id, prev=L.prev;
  if(L.teacherView){var tok=false;try{tok=sessionStorage.getItem('kce_bb_t')==='1'||teacher()}catch(e){}
    if(!tok){var ov=document.createElement('div');ov.className='lockov';ov.innerHTML='<div class="lockbox"><div class="big">🔒</div><h2 class="fred" style="color:#0A1F3D">Class lesson: teacher only</h2><p>Type the teacher code.</p><input id="tp" type="password" inputmode="numeric"> <button class="btn2" id="to">Open</button><div class="m" id="tm"></div><p><a href="index.html">Back</a></p></div>';document.body.appendChild(ov);
      ov.querySelector('#to').onclick=function(){if(ov.querySelector('#tp').value===TPIN){try{sessionStorage.setItem('kce_bb_t','1')}catch(e){}ov.remove()}else ov.querySelector('#tm').textContent='That code is not right.'};}}
  else if(prev&&!passed(prev)&&!unlocked(id)&&!teacher()){lockScreen('First pass <b>'+esc(L.prevTitle)+'</b> with '+L.mastery+' or more. Then this lesson opens.',id,L.label,null,L.studentName);}
  var slides=L.slides.slice(), stage=document.getElementById('stage'), cur=0, stars=0, checkState=null;
  slides.push({type:'done'});
  var name=''; try{name=localStorage.getItem('kce_bb_name_'+L.student)||''}catch(e){}
  function star(n){stars+=n;document.getElementById('stars').textContent='⭐ '+stars}
  function render(){
    var s=slides[cur];document.getElementById('pi').style.width=(100*cur/(slides.length-1))+'%';
    var box=document.createElement('div');box.className='slide';
    var head=(s.kick?'<span class="kick">'+esc(s.kick)+'</span>':'')+(s.title?'<h2>'+html(s.title)+'</h2>':'');
    var T=s.type;
    if(T==='hello'){box.innerHTML='<span class="kick">'+esc(prettyDate(L.date))+'</span><h2>'+html(s.title||L.title)+'</h2>'+vis(s.visual)+'<div class="say">'+html(s.text||'')+'</div><div class="goal">🎯 '+html(L.goal)+'</div>';}
    else if(T==='learn'){box.innerHTML=head+'<div class="say">'+html(s.text||'')+'</div>'+vis(s.visual)+(s.steps?'<div class="steps">'+s.steps.map(function(x,i){return '<div class="st'+(i===0?' on':'')+'">'+html(x.text)+vis(x.visual)+'</div>'}).join('')+'</div><button class="btn2" id="more">Show me the next step ➜</button>':'')+(s.tip?'<div class="tip">💡 '+html(s.tip)+'</div>':'');
      setTimeout(function(){var m=document.getElementById('more');if(m){var k=1,st=box.querySelectorAll('.st');if(st.length<2)m.remove();m.onclick=function(){if(k<st.length){st[k].classList.add('on');k++;}if(k>=st.length)m.remove();}}},0);}
    else if(T==='vocab'){box.innerHTML=head+'<div class="say">'+html(s.text||'Tap each card to flip it. Say the word out loud.')+'</div><div class="vocab">'+s.words.map(function(w){return '<div class="vc"><div class="in"><div class="f"><div class="e">'+esc(w.emoji||'📘')+'</div><div class="w">'+esc(w.word)+'</div><div style="font-size:14px;opacity:.85">'+esc(w.pos||'')+'</div></div><div class="b"><div class="m">'+html(w.meaning)+'</div><div><i>'+html(w.example)+'</i></div></div></div></div>'}).join('')+'</div>';
      setTimeout(function(){box.querySelectorAll('.vc').forEach(function(c){c.onclick=function(){c.classList.toggle('flip')}})},0);}
    else if(T==='tap'||T==='recall'){box.innerHTML=head+(s.text?'<div class="say">'+html(s.text)+'</div>':'')+(s.items?vis(s.visual):'');
      var qs=s.items||[s], wrap=document.createElement('div');box.appendChild(wrap);
      qs.forEach(function(q,qi){var d=document.createElement('div');d.style.marginTop=qi?'22px':'0';wrap.appendChild(d);ask(d,q,{onDone:function(ok){if(ok)star(1)}});});}
    else if(T==='sort'){box.innerHTML=head+'<div class="say">'+html(s.text||'Tap a card, then tap the box where it belongs.')+'</div><div id="pool"></div><div class="buckets">'+s.buckets.map(function(b,i){return '<div class="bucket" data-b="'+i+'"><h4>'+html(b)+'</h4></div>'}).join('')+'</div><div class="fb"></div>';
      setTimeout(function(){var pool=box.querySelector('#pool'),sel=null,fb=box.querySelector('.fb'),left=s.items.length;
        s.items.forEach(function(it,i){var c=document.createElement('span');c.className='chip';c.innerHTML=html(it.text);c.onclick=function(){if(c.classList.contains('done'))return;pool.querySelectorAll('.chip').forEach(function(x){x.classList.remove('sel')});c.classList.add('sel');sel={c:c,it:it}};pool.appendChild(c)});
        box.querySelectorAll('.bucket').forEach(function(bk){bk.onclick=function(){if(!sel)return;var b=+bk.dataset.b;
          if(b===sel.it.b){sel.c.classList.remove('sel');sel.c.classList.add('done');bk.appendChild(sel.c);fb.className='fb show ok';fb.innerHTML='✅ '+html(sel.it.why||'Yes!');star(1);sel=null;left--;if(!left){fb.innerHTML='🎉 All sorted! '+html(s.done||'')}}
          else{fb.className='fb show no';fb.innerHTML='❌ '+html(sel.it.hint||'Not that box. Read it again.')}}});},0);}
    else if(T==='order'){var mix=s.steps.map(function(x,i){return {t:x,i:i}});for(var m=mix.length-1;m>0;m--){var r=Math.floor(Math.random()*(m+1));var tt=mix[m];mix[m]=mix[r];mix[r]=tt}
      if(mix.every(function(x,i){return x.i===i})&&mix.length>1){var t0=mix[0];mix[0]=mix[1];mix[1]=t0}
      box.innerHTML=head+'<div class="say">'+html(s.text||'Tap the steps in the right order.')+'</div><div class="ord" id="src"></div><h3 class="fred" style="margin:14px 0 4px;color:#0A1F3D">My order:</h3><div class="ord" id="dst"></div><div class="fb"></div><button class="btn2 gold" id="rs">Start over</button>';
      setTimeout(function(){var src=box.querySelector('#src'),dst=box.querySelector('#dst'),fb=box.querySelector('.fb'),need=0;
        function build(){src.innerHTML='';dst.innerHTML='';need=0;fb.className='fb';mix.forEach(function(x){var c=document.createElement('span');c.className='chip';c.innerHTML=html(x.t);c.onclick=function(){
          if(x.i===need){c.classList.add('done');dst.appendChild(c);need++;if(need===mix.length){fb.className='fb show ok';fb.innerHTML='✅ '+html(s.why||'Right order!');star(2)}}
          else{fb.className='fb show no';fb.innerHTML='❌ '+html(s.hint||'Not that one yet. What comes first?')}};src.appendChild(c)})}
        build();box.querySelector('#rs').onclick=build;},0);}
    else if(T==='build'){var g=0,e2=0,bt=0,bdone=false;box.innerHTML=head+'<div class="say">'+html(s.text)+'</div><div class="counter">Groups <button id="gm">−</button><span id="gv">0</span><button id="gp">+</button></div><div class="counter">In each group <button id="em">−</button><span id="ev">0</span><button id="ep">+</button></div><div id="bv"></div><p id="bl" style="text-align:center;font-family:Fredoka,sans-serif;font-size:20px;margin:6px 0"></p><button class="btn2" id="bc">Check</button><div class="fb"></div>';
      setTimeout(function(){var fb=box.querySelector('.fb'),bc=box.querySelector('#bc');function up(){box.querySelector('#gv').textContent=g;box.querySelector('#ev').textContent=e2;box.querySelector('#bv').innerHTML=g&&e2?vis({kind:'groups',groups:g,each:e2,emoji:s.emoji}):'';box.querySelector('#bl').innerHTML=g&&e2?g+' group'+(g>1?'s':'')+' of '+e2:'';if(!bdone){fb.className='fb'}}
        function chg(f){return function(){if(bdone)return;f();up()}}
        box.querySelector('#gp').onclick=chg(function(){if(g<10)g++});box.querySelector('#gm').onclick=chg(function(){if(g>0)g--});box.querySelector('#ep').onclick=chg(function(){if(e2<10)e2++});box.querySelector('#em').onclick=chg(function(){if(e2>0)e2--});
        bc.onclick=function(){if(bdone)return;if(!g||!e2){fb.className='fb show no';fb.innerHTML='Use the + buttons to make the groups first.';return}
          if(g===s.groups&&e2===s.each){bdone=true;bc.disabled=true;fb.className='fb show ok';fb.innerHTML='✅ <b>Yes!</b> '+html(s.why);star(bt?1:2);return}
          bt++;var wh=(g!==s.groups&&e2!==s.each)?'Both numbers need to change.':(g!==s.groups?'Your <b>Groups</b> number is not right yet.':'Your <b>In each group</b> number is not right yet.');if(bt<3){fb.className='fb show no';fb.innerHTML='❌ Not yet. '+wh+' '+html(s.hint||'Read the problem again.')+' <i>('+(3-bt)+(3-bt===1?' try':' tries')+' left)</i>'}
          else{bdone=true;bc.disabled=true;g=s.groups;e2=s.each;box.querySelector('#gv').textContent=g;box.querySelector('#ev').textContent=e2;box.querySelector('#bv').innerHTML=vis({kind:'groups',groups:g,each:e2,emoji:s.emoji});box.querySelector('#bl').innerHTML=g+' groups of '+e2;fb.className='fb show no';fb.innerHTML='Here is how it looks. '+html(s.why)}};},0);}
    else if(T==='talk'){box.innerHTML=head+(s.text?'<div class="say">'+html(s.text)+'</div>':'')+vis(s.visual)+s.prompts.map(function(p){return '<div class="talkp">🗣️ '+html(p)+'</div>'}).join('')+(s.starters?'<div class="starters">Start with: '+s.starters.map(function(x){return '<span>'+html(x)+'</span>'}).join('')+'</div>':'')+(L.teacherView?'<button class="btn2 gold" id="tk">Teacher: great answer +1 ⭐</button>':'');
      setTimeout(function(){var tk=box.querySelector('#tk');if(tk)tk.onclick=function(){star(1)}},0);}
    else if(T==='check'){var sets=s.sets||[s.questions];checkState=checkState||{i:0,right:0,missed:[],done:false,attempt:(rd(AKEY)[id]||1)};var cs=checkState;var QS=sets[(cs.attempt-1)%sets.length];cs.n=QS.length;
      if(cs.done){box.innerHTML=result();}
      else{box.innerHTML='<span class="kick">⭐ Show What You Know · '+(cs.i+1)+' of '+QS.length+(sets.length>1?' · Set '+(((cs.attempt-1)%sets.length)+1):'')+'</span><h2>'+html(s.title||'Show What You Know')+'</h2><p style="font-size:16px;color:#5b6578">You get 3 tries. Only your <b>first try</b> counts for your score. You need '+L.mastery+' to open the next lesson.</p><div id="cq"></div>';
        setTimeout(function(){var q=QS[cs.i];ask(box.querySelector('#cq'),q,{tries:3,onDone:function(ok,got,firstResp){if(ok){cs.right++;star(1)}else cs.missed.push({q:strip(q.q),first_try:strip(firstResp),answer:strip(answerText(q)),v:q.visual||null});
          var nb=document.createElement('button');nb.className='btn2';nb.textContent=cs.i+1<QS.length?'Next question ➜':'See my score ➜';box.appendChild(nb);
          nb.onclick=function(){cs.i++;if(cs.i>=QS.length){cs.done=true;finish()}render()}}})},0);}}
    else if(T==='done'){box.innerHTML=result(true);}
    if(L.teacherView&&s.notes){var n=s.notes,t='<div class="tnote">🧑‍🏫 ';['do','say','ask','listen'].forEach(function(k){if(n[k])t+='<div><b>'+{do:'Do',say:'Say',ask:'Ask',listen:'Listen for'}[k]+':</b> '+html(n[k])+'</div>'});box.insertAdjacentHTML('beforeend',t+'</div>')}
    stage.innerHTML='';stage.appendChild(box);window.scrollTo(0,0);
    document.getElementById('back').disabled=cur===0;
    document.getElementById('next').textContent=cur===slides.length-1?'All done ✔':'Next ➜';
    document.getElementById('next').disabled=cur===slides.length-1;
    if(T==='check'&&checkState&&!checkState.done){document.getElementById('back').disabled=true;document.getElementById('next').disabled=true;}
    var r=box.querySelector('#again');if(r)r.onclick=function(){checkState={i:0,right:0,missed:[],done:false,attempt:(checkState?checkState.attempt+1:1)};cur=slides.findIndex(function(x){return x.type==='check'});render()};
  }
  function finish(){var cs=checkState,score=Math.round(100*cs.right/cs.n),ok=score>=L.mastery;cs.score=score;cs.ok=ok;
    var p=rd(PKEY),old=p[id]||{};p[id]={best:Math.max(old.best||0,score),passed:!!(old.passed||ok),last:score};wr(PKEY,p);var at=rd(AKEY);at[id]=cs.attempt+1;wr(AKEY,at);
    post({program:'KCE Building Blocks',part:'Lesson check',student:L.studentName,lesson:L.label,lesson_title:L.title,lesson_date:L.date,score:score,correct:cs.right,total:cs.n,question_set:((cs.attempt-1)%((slides.find(function(x){return x.type==='check'})||{sets:[1]}).sets||[1]).length)+1,mastered:ok?'yes':'no',mastery_needed:L.mastery,attempt:cs.attempt,stars:stars,missed:cs.missed.map(function(m){return {q:m.q,first_try:m.first_try,answer:m.answer}}),timestamp:new Date().toISOString(),_subject:'Building Blocks: '+L.studentName+' '+L.label+' check '+score+(ok?' (mastered)':' (not yet)')});
    if(ok&&window.confetti)window.confetti();}
  function result(fromDone){var cs=checkState;
    if(L.teacherView) return '<div class="res"><div class="big">🧱</div><h2>Class lesson done!</h2><p>Next: '+esc(L.studentName||'The student')+' does the <b>after-class lesson</b> independently and finishes with Show What You Know.</p><p><a href="index.html">Back to the course page</a></p></div>';
    if(!cs||!cs.done) return '<div class="res"><div class="big">🧱</div><h2>Great work today!</h2><p>Go back and finish <b>Show What You Know</b> so your score is saved.</p></div>';
    return '<div class="res"><div class="big">'+(cs.ok?'🏆':'💪')+'</div><div class="score">'+cs.score+'</div><h2>'+(cs.ok?'You did it! Next lesson is open.':(cs.score>=L.mastery-15?'Almost! You need '+L.mastery+'.':'Not yet. You need '+L.mastery+'. You can do this!'))+'</h2><p>'+(cs.ok?html(L.win||'Your score was sent to KCE.'):'Look at the ones you missed. When you try again, you get brand-new questions.')+'</p>'+
      (cs.missed.length?'<div style="text-align:left;background:#FFF3C9;border-radius:16px;padding:10px 14px;font-size:16px"><b>Look again at:</b><ul>'+cs.missed.map(function(m){return '<li>'+esc(m.q)+(m.v?vis(m.v):'')+' <br><b>Right answer:</b> '+esc(m.answer)+'</li>'}).join('')+'</ul></div>':'')+
      (cs.ok?'':'<button class="btn2" id="again">Try again</button>')+'<p><a href="index.html">Back to my lessons</a></p><p style="font-size:15px;color:#5b6578">⭐ Stars today: '+stars+'</p></div>';}
  document.getElementById('back').onclick=function(){if(cur>0){cur--;render()}};
  document.getElementById('next').onclick=function(){if(cur<slides.length-1){cur++;render()}};
  render();
};

/* ---------- practice set ---------- */
window.BBPractice=function(P){
  document.documentElement.style.setProperty('--acc',P.color||'#2E86DE');
  var st=document.getElementById('stage'),i=0,right=0,missed=[],sets=P.sets||[P.questions],pk='practice-'+P.id,pa=rd(AKEY)[pk]||1,setNo=((pa-1)%sets.length)+1,qs=sets[setNo-1];
  function show(){document.getElementById('pi').style.width=(100*i/qs.length)+'%';
    if(i>=qs.length){var score=Math.round(100*right/qs.length);
      var at=rd(AKEY);at[pk]=pa+1;wr(AKEY,at);post({program:'KCE Building Blocks',part:'Practice set',student:P.studentName,lesson:P.label,lesson_title:P.title,question_set:setNo,score:score,correct:right,total:qs.length,missed:missed,timestamp:new Date().toISOString(),_subject:'Building Blocks: '+P.studentName+' '+P.label+' practice '+score});
      st.innerHTML='<div class="slide res"><div class="big">'+(score>=P.mastery?'🌟':'💪')+'</div><div class="score">'+score+'</div><h2>'+(score>=P.mastery?'Great practice!':'Good effort! Practice again tomorrow.')+'</h2><p>Only first tries count. Your score was sent to KCE.'+(sets.length>1?' Practice again for a new set of questions.':'')+'</p><button class="btn2" onclick="location.reload()">Practice again</button><p><a href="index.html">Back to my lessons</a></p></div>';if(score>=P.mastery&&window.confetti)window.confetti();return;}
    var box=document.createElement('div');box.className='slide';box.innerHTML='<span class="kick">Practice · '+(i+1)+' of '+qs.length+(sets.length>1?' · Set '+setNo:'')+'</span><div id="pq"></div>';st.innerHTML='';st.appendChild(box);window.scrollTo(0,0);
    var q=qs[i];ask(box.querySelector('#pq'),q,{tries:3,onDone:function(ok,got,firstResp){if(ok)right++;else missed.push({q:strip(q.q),first_try:strip(firstResp),answer:strip(answerText(q))});
      var nb=document.createElement('button');nb.className='btn2';nb.textContent='Next ➜';box.appendChild(nb);nb.onclick=function(){i++;show()}}});}
  show();
};

/* ---------- teacher lock ---------- */
window.BBTeacher=function(){
  var ok=false;try{ok=sessionStorage.getItem('kce_bb_t')==='1'||teacher()}catch(e){}
  var body=document.getElementById('tbody');
  if(ok){body.style.display='block';return;}
  var ov=document.createElement('div');ov.className='lockov';
  ov.innerHTML='<div class="lockbox"><div class="big">🔒</div><h2 class="fred" style="color:#0A1F3D">Teacher only</h2><p>Type the teacher code.</p><input id="tp" type="password" inputmode="numeric"> <button class="btn2" id="to">Open</button><div class="m" id="tm"></div><p><a href="index.html">Back</a></p></div>';
  document.body.appendChild(ov);
  ov.querySelector('#to').onclick=function(){if(ov.querySelector('#tp').value===TPIN){try{sessionStorage.setItem('kce_bb_t','1')}catch(e){}ov.remove();body.style.display='block'}else ov.querySelector('#tm').textContent='That code is not right.'};
};

/* ---------- course page ---------- */
window.BBCourse=function(C){
  var cards=document.querySelectorAll('[data-lesson]');
  cards.forEach(function(card){var id=card.dataset.lesson,prev=card.dataset.prev,btn=card.querySelector('.go-lesson');
    var p=rd(PKEY)[id];if(p){var t=card.querySelector('.status');t.innerHTML=p.passed?'✅ Mastered · best '+p.best:'Best so far: '+p.best+' (need '+C.mastery+')';t.style.display='inline-block'}
    if(prev&&!passed(prev)&&!unlocked(id)&&!teacher()){card.classList.add('locked');btn.dataset.locked='1';}
    var tl=card.querySelectorAll('.task input');var done=rd('kce_bb_tasks');tl.forEach(function(cb){cb.checked=!!done[cb.id];cb.onchange=function(){var d=rd('kce_bb_tasks');d[cb.id]=cb.checked;wr('kce_bb_tasks',d)}});
  });
  document.querySelectorAll('.go-lesson').forEach(function(a){a.onclick=function(ev){if(a.dataset.locked==='1'){ev.preventDefault();var card=a.closest('[data-lesson]');lockScreen('First pass the lesson before this one with '+C.mastery+' or more.',card.dataset.lesson,card.dataset.label,function(){location.href=a.href},C.studentName);}}});
  var tb=document.getElementById('tmode');if(tb){tb.textContent=teacher()?'Teacher mode is on (tap to turn off)':'Teacher: open everything on this device';tb.onclick=function(){if(teacher()){try{localStorage.removeItem('kce_bb_teacher')}catch(e){}location.reload();return}var v=prompt('Teacher code');if(v===TPIN){try{localStorage.setItem('kce_bb_teacher','1')}catch(e){}location.reload()}}}
  var today=new Date().toISOString().slice(0,10),next=null;cards.forEach(function(c){if(!next&&c.dataset.date>=today)next=c});if(next){next.classList.add('today');}
};

/* ---------- confetti ---------- */
window.confetti=function(){var c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:60';document.body.appendChild(c);c.width=innerWidth;c.height=innerHeight;var x=c.getContext('2d'),P=[],col=['#0047BA','#C9A84C','#DB2F30','#18A058','#E84393','#2E86DE'];for(var i=0;i<160;i++)P.push({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,v:2+Math.random()*4,r:Math.random()*6.28,s:6+Math.random()*7,c:col[i%6]});var t=0;(function f(){x.clearRect(0,0,c.width,c.height);P.forEach(function(p){p.y+=p.v;p.r+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++t<200)requestAnimationFrame(f);else c.remove()})()};
})();

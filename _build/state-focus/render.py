#!/usr/bin/env python3
"""Render the KCE State Focus repository: one self-contained HTML file with all 50 states.
Usage: python3 render.py [out.html]   (reads data/*.json next to this script)"""
import json, glob, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/kgh/state-focus/index.html"
PW = "https://kingcretot.github.io/KCE_Pathways_Curriculum/"
LIVE = {  # states that already have built State Focus lessons
  "FL": [("Grades 2–3", "grade3"), ("Grades 4–5", "grade4-5")],
}

states = []
for f in sorted(glob.glob(os.path.join(HERE, "data", "*.json"))):
    d = json.load(open(f))
    states.append(d)
states.sort(key=lambda d: d["state"])
if LIVE:
    for d in states:
        if d["postal"] in LIVE:
            links = []
            for band, folder in LIVE[d["postal"]]:
                for subj, key in (("Social Studies", "socialstudies"), ("Science", "science")):
                    for u in (1, 2, 3):
                        links.append({"band": band, "label": f"{subj} Unit {u}", "url": f"{PW}{folder}/florida/{key}-u{u}.html"})
            d["live"] = links

DATA = json.dumps(states, ensure_ascii=False).replace("</", "<\\/")

PAGE = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>KCE State Focus | KingCretot Experience</title>
<style>
:root{--navy:#0A1F3D;--gold:#C9A84C;--blue:#0047BA;--red:#DB2F30;--ink:#1d2533;--mute:#5b6578;--line:#E7E0CF;--cream:#FBF8F1}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--cream);font-size:16px;line-height:1.55}
h1,h2,h3,h4{font-family:Georgia,'Times New Roman',serif;color:var(--navy);margin:0}
a{color:var(--blue)}
.top{background:var(--navy);color:#fff;padding:22px 16px 18px;border-bottom:5px solid var(--gold)}
.top .in{max-width:1100px;margin:0 auto}
.brand{font-family:Georgia,serif;color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-size:13px}
.top h1{color:#fff;font-size:34px;margin:4px 0 6px}
.top p{margin:0;color:#d7deea;max-width:820px}
.wrap{max-width:1100px;margin:0 auto;padding:18px 16px 40px}
.how{background:#fff;border:1px solid var(--line);border-left:5px solid var(--gold);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:15px}
.how ol{margin:6px 0 0 18px;padding:0}
.ctrl{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px}
.ctrl input,.ctrl select{font:inherit;padding:9px 12px;border:2px solid var(--line);border-radius:10px;background:#fff}
.ctrl input{flex:1;min-width:200px}
.chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-bottom:22px}
.chip{border:2px solid var(--line);background:#fff;border-radius:10px;padding:8px 10px;cursor:pointer;text-align:left;font:inherit;color:var(--navy)}
.chip b{font-family:Georgia,serif;display:block}.chip small{color:var(--mute);font-size:12px}
.chip:hover{border-color:var(--gold)}.chip.on{background:var(--navy);color:#fff;border-color:var(--navy)}.chip.on small{color:#d7deea}
.chip .live{display:inline-block;background:var(--red);color:#fff;border-radius:99px;font-size:10px;padding:0 6px;margin-left:4px;vertical-align:middle;letter-spacing:.5px}
#empty{color:var(--mute);text-align:center;padding:30px}
.state{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px 22px 10px}
.shead{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:flex-start;border-bottom:3px solid var(--gold);padding-bottom:10px;margin-bottom:14px}
.shead h2{font-size:32px}.shead .sub{color:var(--mute)}
.btn{font:inherit;background:var(--navy);color:#fff;border:none;border-radius:10px;padding:9px 14px;cursor:pointer;text-decoration:none;display:inline-block}
.btn.alt{background:#fff;color:var(--navy);border:2px solid var(--gold)}
.sec{margin:18px 0}.sec h3{font-size:22px;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.sec h3:before{content:"";width:6px;height:22px;background:var(--gold);border-radius:3px;display:inline-block}
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.fact{background:var(--cream);border:1px solid var(--line);border-radius:10px;padding:8px 11px}
.fact .k{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--mute)}
.list{margin:0;padding-left:20px}.list li{margin:5px 0}
.tl{border-left:3px solid var(--blue);margin:0;padding:0 0 0 14px;list-style:none}
.tl li{margin:0 0 9px;position:relative}.tl li:before{content:"";position:absolute;left:-21px;top:7px;width:11px;height:11px;border-radius:50%;background:#fff;border:3px solid var(--blue)}
.tl .y{font-weight:bold;color:var(--navy)}
.people{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.person{border:1px solid var(--line);border-top:4px solid var(--blue);border-radius:10px;padding:10px 12px}
.person h4{font-size:18px}.person .meta{font-size:13px;color:var(--mute);margin-bottom:4px}
.units{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.ubox{border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:#FFFCF4}
.ubox h4{font-size:17px;margin-bottom:4px}.ubox ol{margin:0;padding-left:18px}.ubox li{margin:6px 0}.ubox li span{color:var(--mute);font-size:14px;display:block}
.live{background:#FFF3F3;border:1px solid #F3C7C7;border-radius:10px;padding:10px 12px}
.src{font-size:13px;columns:2;column-gap:24px}.src li{break-inside:avoid;margin:3px 0}
.quote{border-left:4px solid var(--gold);background:var(--cream);padding:8px 12px;border-radius:0 10px 10px 0;font-style:italic}
.foot{background:var(--navy);color:#cdd6e4;text-align:center;font-size:13px;padding:16px;margin-top:30px}
.foot b{color:var(--gold);font-weight:normal}
@media(max-width:640px){.top h1{font-size:27px}.shead h2{font-size:26px}.src{columns:1}.state{padding:16px 14px 6px}}
@media print{.top,.how,.ctrl,.chips,.noprint,.foot{display:none!important}body{background:#fff;font-size:12px}.state{border:none;padding:0}.sec{break-inside:avoid-page}a{color:var(--ink);text-decoration:none}}
</style></head><body>
<header class="top"><div class="in"><div class="brand">KingCretot Experience · Social Studies and Science</div>
<h1>State Focus: All 50 States</h1>
<p>A verified content bank for every U.S. state. When a student joins from a new state, pull that state from here to build their State Focus lessons, the same way Florida Focus works for our Florida students.</p></div></header>
<main class="wrap">
<div class="how"><b>How to use it</b><ol>
<li>Pick the student's state below (or search for it).</li>
<li>Use the four ready-to-build unit plans (Grades 2–3 and Grades 4–5, Social Studies and Science) and the facts, nations, timeline and trailblazers to build the lessons.</li>
<li>Add the finished lessons to the student's Building Blocks course as optional, self-paced State Focus lessons. Check the sources before teaching anything new.</li>
</ol></div>
<div class="ctrl"><input id="q" type="search" placeholder="Search a state, nation, person or place…" aria-label="Search">
<select id="reg" aria-label="Region"><option value="">All regions</option><option>Northeast</option><option>Midwest</option><option>South</option><option>West</option></select>
<span id="count" style="color:var(--mute);font-size:14px"></span></div>
<div class="chips" id="chips"></div>
<div id="view"><p id="empty">Pick a state to open its State Focus.</p></div>
</main>
<footer class="foot">© KingCretot Experience, LLC · PO Box 2322, Arcadia, FL 34265 · For KCE teaching use.<br><b>Step Up For Students · Arizona ESA · West Virginia Hope Scholarship</b></footer>
<script>
var S = __DATA__;
function e(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function by(p){for(var i=0;i<S.length;i++)if(S[i].postal===p)return S[i];return null;}
function hay(d){return JSON.stringify(d).toLowerCase();}
var H = S.map(hay);
function chips(){
  var q=document.getElementById('q').value.trim().toLowerCase(), r=document.getElementById('reg').value, cur=(location.hash||'').slice(1).toUpperCase(), n=0, out='';
  S.forEach(function(d,i){ if(r&&d.region!==r)return; if(q&&H[i].indexOf(q)<0)return; n++;
    out+='<button class="chip'+(d.postal===cur?' on':'')+'" data-p="'+d.postal+'"><b>'+e(d.state)+(d.live?'<span class="live">LIVE</span>':'')+'</b><small>'+e(d.postal)+' · '+e(d.region)+'</small></button>'; });
  document.getElementById('chips').innerHTML=out||'<p style="color:var(--mute)">No state matches that search.</p>';
  document.getElementById('count').textContent=n+' of '+S.length+' states';
}
function F(k,v){return v?'<div class="fact"><div class="k">'+e(k)+'</div>'+e(v)+'</div>':'';}
function render(p){
  var d=by(p), v=document.getElementById('view');
  if(!d){v.innerHTML='<p id="empty">Pick a state to open its State Focus.</p>';return;}
  var f=d.facts,g=d.government,fp=d.first_peoples,sc=d.science,geo=d.geography,u=d.units,h='';
  h+='<article class="state"><div class="shead"><div><h2>'+e(d.state)+' Focus</h2><div class="sub">'+e(d.region)+' · '+e(f.nickname)+'</div></div>'+
     '<div class="noprint"><button class="btn" onclick="window.print()">🖨 Print this state</button></div></div>';
  if(d.live){h+='<div class="sec live"><h3>Live KCE lessons for this state</h3><ul class="list">'+d.live.map(function(l){return '<li>'+e(l.band)+': <a href="'+e(l.url)+'" target="_blank">'+e(l.label)+'</a></li>';}).join('')+'</ul></div>';}
  h+='<div class="sec"><h3>Quick facts</h3><div class="facts">'+F('Capital',f.capital)+F('Largest city',f.largest_city)+F('Statehood',f.statehood+' · state #'+f.order+(f.statehood_note?' ('+f.statehood_note+')':''))+
     F('Nickname',f.nickname)+F('Motto',f.motto)+F('Borders',(f.borders||[]).join(', '))+F('Name',f.name_origin)+
     (f.symbols||[]).map(function(s){return F(s.type,s.name);}).join('')+'</div></div>';
  h+='<div class="sec"><h3>Government</h3><div class="facts">'+F('Legislature',g.legislature)+F('Chambers',g.chambers)+F('Executive',g.executive)+F('Courts',g.courts)+F('Local government',g.local)+F('Constitution',g.constitution)+'</div>'+
     (g.kid_line?'<p class="quote">'+e(g.kid_line)+'</p>':'')+'</div>';
  h+='<div class="sec"><h3>First Peoples</h3><h4 style="font-size:17px">Long ago</h4><ul class="list">'+(fp.long_ago||[]).map(function(x){return '<li><b>'+e(x.nation)+'.</b> '+e(x.about)+'</li>';}).join('')+'</ul>'+
     '<h4 style="font-size:17px;margin-top:8px">Today</h4>'+((fp.today||[]).length?'<ul class="list">'+fp.today.map(function(x){return '<li><b>'+e(x.nation)+'.</b> '+e(x.about)+'</li>';}).join('')+'</ul>':'')+
     (fp.today_note?'<p>'+e(fp.today_note)+'</p>':'')+((fp.sites||[]).length?'<p><b>Places to see:</b> '+fp.sites.map(e).join(' · ')+'</p>':'')+'</div>';
  h+='<div class="sec"><h3>History: before 1492 to 1877</h3><ul class="tl">'+d.history.map(function(x){return '<li><span class="y">'+e(x.year)+'</span> · '+e(x.event)+'</li>';}).join('')+'</ul></div>';
  h+='<div class="sec"><h3>Trailblazers</h3><div class="people">'+d.trailblazers.map(function(x){return '<div class="person"><h4>'+e(x.name)+'</h4><div class="meta">'+e(x.years)+' · '+e(x.group)+'</div>'+e(x.text)+'</div>';}).join('')+'</div></div>';
  h+='<div class="sec"><h3>Geography</h3><div class="facts">'+F('Landforms',(geo.landforms||[]).join(', '))+F('Waters',(geo.waters||[]).join(', '))+F('Regions',geo.regions)+'</div></div>';
  h+='<div class="sec"><h3>Science</h3><ul class="list">'+(sc.ecosystems||[]).map(function(x){return '<li><b>'+e(x.name)+'.</b> '+e(x.about)+'</li>';}).join('')+'</ul><div class="facts">'+F('Weather and hazards',sc.weather)+F('Resources',sc.resources)+F('Science highlight',sc.highlight)+'</div></div>';
  function U(t,a){return '<div class="ubox"><h4>'+t+'</h4><ol>'+a.map(function(x){return '<li><b>'+e(x.title)+'</b><span>'+e(x.plan)+'</span></li>';}).join('')+'</ol></div>';}
  h+='<div class="sec"><h3>Ready-to-build State Focus units</h3><div class="units">'+U('Grades 2–3 Social Studies',u.g3_ss)+U('Grades 4–5 Social Studies',u.g45_ss)+U('Grades 2–3 Science',u.g3_sci)+U('Grades 4–5 Science',u.g45_sci)+'</div></div>';
  h+='<div class="sec"><h3>Sources</h3><ul class="src">'+d.sources.map(function(s){return '<li><a href="'+e(s.url)+'" target="_blank" rel="noopener">'+e(s.title)+'</a></li>';}).join('')+'</ul></div></article>';
  v.innerHTML=h; document.title=d.state+' Focus | KCE State Focus';
}
function go(){chips();render((location.hash||'').slice(1).toUpperCase());}
document.getElementById('chips').addEventListener('click',function(ev){var b=ev.target.closest('.chip');if(!b)return;location.hash=b.getAttribute('data-p').toLowerCase();});
document.getElementById('q').addEventListener('input',chips);document.getElementById('reg').addEventListener('change',chips);
window.addEventListener('hashchange',function(){go();var v=document.getElementById('view');if(v.firstChild&&v.firstChild.className==='state')v.scrollIntoView({behavior:'smooth'});});
go();
if(location.hash){var v0=document.getElementById('view');if(v0.firstChild&&v0.firstChild.className==='state')setTimeout(function(){v0.scrollIntoView();},50);}
</script></body></html>"""

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w").write(PAGE.replace("__DATA__", DATA))
print(f"wrote {OUT}: {len(states)} states, {os.path.getsize(OUT)//1024} KB")

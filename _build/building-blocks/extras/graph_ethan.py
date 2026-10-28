import math
SQ=0.4  # inches per square
def grid(cols,rows):
    w=cols*SQ; h=rows*SQ; u=40  # svg units per square
    lines="".join(f'<line x1="{i*u}" y1="0" x2="{i*u}" y2="{rows*u}"/>' for i in range(1,cols))+"".join(f'<line x1="0" y1="{j*u}" x2="{cols*u}" y2="{j*u}"/>' for j in range(1,rows))
    return (f'<svg class="grid" width="{w}in" height="{h}in" viewBox="0 0 {cols*u} {rows*u}" preserveAspectRatio="none"><g stroke="#8FA9D1" stroke-width="1.2">{lines}</g><rect x="0" y="0" width="{cols*u}" height="{rows*u}" fill="none" stroke="#0A1F3D" stroke-width="3"/></svg>')
def hdr(title,sub):
    return f'''<div class="mast"><div class="kc"><div>KC</div></div><div><div class="wm">KingCretot Experience</div><div class="tag"><span style="color:#0047BA">EDUCATE.</span> <span style="color:#C9A84C">EMPOWER.</span> <span style="color:#DB2F30">EXCEL.</span></div></div><div class="pt">Building Blocks · Lesson 1</div></div>
<div class="band"><i style="background:#0047BA"></i><i style="background:#C9A84C"></i><i style="background:#DB2F30"></i></div>
<div class="nd"><span>Name: <b class="ln"></b></span><span>Date: <b class="ln sm"></b> / <b class="ln xs"></b> / <b class="ln xs"></b></span></div>
<h1>{title}</h1><p class="sub">{sub}</p>'''
probs=[("57 × 34","60 × 30"),("83 × 46","80 × 50"),("124 × 23","120 × 20")]
p1=hdr("Graph Paper Practice · Page 1","Friday. Work each problem on the grid: <b>one digit in each square</b>. Estimate first. Then multiply with partial products, add them, and compare with your estimate.")
for i,(pr,est) in enumerate(probs,1):
    p1+=f'''<div class="prob"><div class="pl"><div class="q"><span class="num">{i}</span> {pr}</div>
<div class="est">My estimate: <b class="box"></b><div class="hint">Round, then multiply: {est.split(" × ")[0]} × {est.split(" × ")[1]}</div></div>
<div class="est">Close to my estimate? <span class="yn">Yes · No</span></div></div>{grid(9,6)}</div>'''
p2=hdr("Graph Paper Practice · Page 2","Sunday. Redo page 2 of your Lesson 1 Packet here. Copy each problem, then work it with <b>one digit in each square</b> so every column lines up.")
p2+=f'<div style="margin-top:6px">{grid(18,19)}</div>'
CSS=f'''@page{{size:letter;margin:0}}*{{box-sizing:border-box}}body{{margin:0;background:#EFEDE6;font-family:Arial,Helvetica,sans-serif;color:#1D2433}}
.page{{width:8.5in;height:11in;margin:14px auto;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.12);padding:0 0 .3in;overflow:hidden;position:relative}}
.mast{{background:#0A1F3D;padding:8px .5in;display:flex;align-items:center;gap:12px}}
.kc{{border-top:2px solid #C9A84C;border-bottom:2px solid #C9A84C;padding:2px}}.kc div{{border-top:1px solid #C9A84C;border-bottom:1px solid #C9A84C;color:#C9A84C;font-family:Georgia,serif;font-weight:bold;font-size:14px;letter-spacing:3px;padding:2px 7px}}
.wm{{font-family:Georgia,serif;color:#C9A84C;font-size:16px}}.tag{{font-size:8px;font-weight:bold;letter-spacing:2.5px;margin-top:3px}}.pt{{margin-left:auto;color:#cdd6e4;font-size:10pt}}
.band{{display:flex;height:5px}}.band i{{flex:1}}
.nd{{display:flex;justify-content:space-between;padding:.18in .5in 0;font-size:12pt}}.ln{{display:inline-block;width:2.6in;border-bottom:1.5px solid #1D2433;height:16px}}.ln.sm{{width:.5in}}.ln.xs{{width:.45in}}
h1{{font-family:Georgia,serif;color:#0A1F3D;font-size:18pt;margin:.12in .5in 0}}.sub{{margin:.04in .5in .1in;font-size:11pt;line-height:1.35}}
.prob{{display:flex;gap:.25in;align-items:flex-start;margin:.12in .5in 0;padding-top:.08in;border-top:1px solid #E2DDD0}}
.pl{{width:2.6in}}.q{{font-family:Georgia,serif;font-size:20pt;color:#0A1F3D;font-weight:bold}}.num{{display:inline-block;width:30px;height:30px;line-height:30px;border-radius:50%;background:#C9A84C;color:#0A1F3D;text-align:center;font:bold 15px Arial}}
.est{{font-size:11pt;margin-top:.1in}}.box{{display:inline-block;width:1.1in;height:.36in;border:1.5px solid #1D2433;vertical-align:middle;margin-left:4px}}.hint{{font-size:9.5pt;color:#5b6578;margin-top:3px}}.yn{{font-weight:bold;color:#0A1F3D}}
.grid{{display:block;flex:none}}
.page>div[style]{{margin-left:.5in}}
.foot{{position:absolute;bottom:0;left:0;right:0;background:#0A1F3D;color:#C9A84C;text-align:center;font-size:8.5pt;padding:5px}}
@media print{{body{{background:#fff}}.page{{margin:0;box-shadow:none;page-break-after:always}}}}'''
foot='<div class="foot">&copy; 2026 KingCretot Experience. All rights reserved. Licensed for KCE students only. Do not copy, share or distribute.</div>'
html=f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Graph Paper Practice · Ethan · Lesson 1</title><style>{CSS}</style></head><body>
<div class="page">{p1}{foot}</div><div class="page">{p2}{foot}</div></body></html>'''
open('/home/claude/kgh/building-blocks/ethan/graph-paper-01.html','w').write(html)

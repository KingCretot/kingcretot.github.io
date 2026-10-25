"""Add the KCE noindex tag and copyright notice to built course pages (idempotent).
Usage: python3 protect.py <dir-or-file> ...   or   import protect; protect.run(paths)"""
import os, re, sys
META = '<meta name="robots" content="noindex, nofollow">'
NOTE = ('<div id="kce-legal" style="display:block;clear:both;box-sizing:border-box;width:100%;margin:0;'
        'padding:10px 16px;background:#0A1F3D;color:#C9A84C;font:12px/1.4 Arial,sans-serif;text-align:center">'
        '&copy; 2026 KingCretot Experience. All rights reserved. Licensed for KCE students only. '
        'Do not copy, share or distribute.</div>')
JS = ('<script>(function(){var e=document.getElementById("kce-legal");if(!e)return;'
 'function place(){var r=document.documentElement,b=document.body,t=null,best=0,a=b?b.getElementsByTagName("*"):[];'
 'for(var i=0;i<a.length;i++){var x=a[i];if(x===e||e.contains(x))continue;if(x.scrollHeight>x.clientHeight+20&&x.clientHeight>innerHeight*0.5&&x.clientWidth>innerWidth*0.5){var o=getComputedStyle(x).overflowY;if((o==="auto"||o==="scroll")&&x.clientHeight*x.clientWidth>best){best=x.clientHeight*x.clientWidth;t=x}}}'
 'if(!t&&b){var bs=getComputedStyle(b),hs=getComputedStyle(r);if(/(hidden|clip)/.test(hs.overflowY)||(/(auto|scroll)/.test(bs.overflowY)&&b.scrollHeight>b.clientHeight+1))t=b;else t=r}'
 'if(t&&e.parentNode!==t)t.appendChild(e);var h=0;for(var j=0;j<a.length;j++){var s=getComputedStyle(a[j]);'
 'if(s.position==="fixed"&&s.display!=="none"&&s.visibility!=="hidden"&&!e.contains(a[j])){var q=a[j].getBoundingClientRect();'
 'if(q.height>0&&q.height<200&&q.bottom>=innerHeight-2&&q.width>innerWidth*0.5)h=Math.max(h,q.height)}}e.style.marginBottom=h?h+"px":"0"}'
 'if(document.readyState==="complete")setTimeout(place,50);else addEventListener("load",function(){setTimeout(place,50)})})();</script>')
def fix(path):
    s = open(path, encoding="utf-8", errors="surrogateescape").read(); o = s
    if not re.search(r'name=["\']robots["\']', s, re.I):
        m = re.search(r'<head\b[^>]*>', s, re.I)
        if m: s = s[:m.end()] + "\n" + META + s[m.end():]
    if 'id="kce-legal"' not in s:
        i = s.lower().rfind("</body>")
        if i < 0: s = s + "\n" + NOTE + JS + "\n</body></html>"
        else: s = s[:i] + NOTE + JS + "\n" + s[i:]
    if re.search(r'height:\s*11in', s) and 'id="kce-legal-print"' not in s:
        i = s.lower().find("</head>")
        if i >= 0: s = s[:i] + '<style id="kce-legal-print">@media print{#kce-legal{display:none!important}}</style>' + s[i:]
    if s != o: open(path, "w", encoding="utf-8", errors="surrogateescape").write(s)
    return s != o
def run(paths):
    n = 0
    for p in paths:
        fs = [p] if p.endswith(".html") else [os.path.join(dp, f) for dp, dn, fn in os.walk(p) if ".git" not in dp for f in fn if f.endswith(".html")]
        for f in fs: n += fix(f)
    return n
if __name__ == "__main__":
    print("protected", run(sys.argv[1:]))

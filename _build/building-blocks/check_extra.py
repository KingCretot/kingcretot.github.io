import json, sys, glob, os, re
def kinds(o, acc):
    if isinstance(o, dict):
        if 'kind' in o: acc.add(o['kind'])
        for v in o.values(): kinds(v, acc)
    elif isinstance(o, list):
        for v in o: kinds(v, acc)
    return acc
def norm(t, q=None): return (json.dumps(q.get('choices')) if isinstance(q,dict) and q.get('choices') else '') + (json.dumps(q.get('visual'),sort_keys=True) if isinstance(q,dict) and q.get('visual') else '') +  re.sub(r'\W+', ' ', re.sub('<[^>]+>', '', str(t))).strip().lower()
bad = 0
for f in sorted(glob.glob('/home/claude/bb_build/data/practice_extra/*.json')):
    who_n = os.path.basename(f)[:-5]
    L = json.load(open(f'/home/claude/bb_build/data/{who_n}.json'))
    base = L['practice']['questions']
    vk = kinds(L, set())
    seen = {norm(q.get('q'), q) for q in base}
    for s in L['slides']:
        for st in s.get('sets', []) or []:
            if isinstance(st, list):
                for q in st:
                    if isinstance(q, dict): seen.add(norm(q.get('q'), q))
    sets = json.load(open(f))['sets']
    P = []
    if len(sets) != 2: P.append(f'{len(sets)} sets')
    for si, st in enumerate(sets, 2):
        if len(st) != len(base): P.append(f'set{si} has {len(st)} not {len(base)}')
        for qi, q in enumerate(st, 1):
            tag = f'set{si} q{qi}'
            if not q.get('q'): P.append(tag + ' no q')
            if norm(q.get('q'), q) in seen: P.append(tag + ' duplicate text')
            seen.add(norm(q.get('q'), q))
            t = q.get('type')
            if t == 'fill':
                if not q.get('answers'): P.append(tag + ' no answers')
            elif t is None:
                ch = q.get('choices') or []
                a = q.get('a')
                if not (isinstance(a, int) and 0 <= a < len(ch)): P.append(tag + ' bad a')
                no = q.get('no')
                if not (isinstance(no, list) and len(no) == len(ch) and no[a] is None): P.append(tag + ' bad no')
            bt = {x.get('type') for x in base}
            if t not in bt: P.append(tag + f' type {t} not in set1')
            for k in kinds(q, set()):
                if k not in vk: P.append(tag + f' visual kind {k} not in lesson')
    print(('OK  ' if not P else 'BAD ') + who_n, P[:8])
    bad += bool(P)
sys.exit(1 if bad else 0)

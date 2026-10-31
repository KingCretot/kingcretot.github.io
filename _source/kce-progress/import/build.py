import re, json, datetime
from rows import ROWS
out = {'kind': 'kce-past-scores', 'version': 1, 'source': 'Weekly Score Logs (Building Blocks rows only), copied Oct 31 2026', 'courses': {}}
for course, rows in ROWS.items():
    evs, items, attempts = [], {}, {}
    for (d, t, mod, score, mast, att, notes) in rows:
        m = re.match(r'Lesson (\d+) — (.+) \((Show What You Know|Practice)\)$', mod); assert m, mod
        n, title, kind = int(m.group(1)), m.group(2), m.group(3)
        hh, mm, ap = re.match(r'(\d+):(\d+) (AM|PM)', t).groups(); hh = int(hh) % 12 + (12 if ap == 'PM' else 0)
        at = f'{d}T{hh:02d}:{mm}:00-04:00'
        cr = re.search(r'(?:, |— )(\d+)/(\d+)\b', notes); qs = re.search(r'[Ss]et (\d+)', notes)
        mi = notes.split('Missed: ', 1)[1] if 'Missed: ' in notes else ''
        check = kind == 'Show What You Know'
        a = int(re.search(r'\d+', att).group()) if check and re.search(r'\d+', att) else 1
        ev = {'id': f'imp-{course}-{d.replace("-","")}-{hh:02d}{mm}', 'part': 'Lesson check' if check else 'Practice set',
              'lesson': f'Lesson {n}', 'lessonTitle': title, 'score': int(score), 'correct': int(cr.group(1)), 'total': int(cr.group(2)),
              'mastered': check and mast == 'Yes', 'attempt': a, 'questionSet': int(qs.group(1)) if qs else 1, 'missed': mi, 'at': at, 'note': notes}
        evs.append(ev)
        if check:
            k = f'{course}-L{n:02d}'; x = items.get(k, {'best': 0, 'passed': False, 'last': None})
            items[k] = {'best': max(x['best'], int(score)), 'passed': x['passed'] or mast == 'Yes', 'last': int(score)}
            attempts[k] = max(attempts.get(k, 0), a + 1)  # engine stores the NEXT attempt number
    ids = [e['id'] for e in evs]; assert len(ids) == len(set(ids)), course
    out['courses'][course] = {'events': evs, 'items': items, 'attempts': attempts}
json.dump(out, open('KCE_past_scores_2026-10-31.json', 'w'), ensure_ascii=False, indent=1)
for c, v in out['courses'].items(): print(c, len(v['events']), 'scores;', {k: (i['best'], i['passed']) for k, i in v['items'].items()}, v['attempts'])

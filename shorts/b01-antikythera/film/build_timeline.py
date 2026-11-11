"""voice/durations.json + voice/words.json -> film/timeline.js (window.TL) and the caption groups. Run with any python."""
import os, json, re
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
dur = json.load(open(os.path.join(EP, 'voice', 'durations.json')))
words = json.load(open(os.path.join(EP, 'voice', 'words.json')))
LEAD = 0.12; TAIL = 0.8
GAP = dict(zip([l[0] for l in lines], [round(g * .85, 3) for g in [.55, .55, .65, .55, .6, .6, .7, .8, .85, .55, .55, .5, 0]]))
KEY = {'l01': ['eclipses', 'laughed'], 'l02': ['gods'], 'l03': ['head'], 'l04': ['nothing'], 'l05': ['forty'], 'l06': ['harder', 'vanish'],
       'l07': ['dark'], 'l08': ['laughed'], 'l09': ['name'], 'l10': ['1901', 'shipwreck'], 'l11': ['thirty', '19-year', '223-month', 'eclipses'],
       'l12': ['two', 'thousand'], 'l13': ['machine', 'man']}
t = LEAD; TLines = {}; groups = []; allw = []
for lid, text in lines:
    TLines[lid] = {'start': round(t, 3), 'dur': dur[lid]}
    sw = text.split()
    ww = []
    for w, a, b in words[lid]:
        if w.startswith('-') and ww: ww[-1][2] = b
        else: ww.append([w, a, b])
    assert len(ww) == len(sw), (lid, sw, ww)
    for s, (w, a, b) in zip(sw, ww):
        clean = re.sub(r"[.,:;!?]", "", s)
        low = clean.lower()
        allw.append({'line': lid, 'raw': s, 'text': clean.replace('-', ' ').upper(), 'key': low in KEY[lid], 't0': round(t + a, 3), 't1': round(t + b, 3), 'punct': bool(re.search(r"[.,:;!?]$", s))})
    t += dur[lid] + GAP[lid]
TOTAL = round(t - GAP['l13'] + TAIL, 3)
# caption groups: one or two words, never across punctuation
i = 0
while i < len(allw):
    w = allw[i]; g = [w]
    if i + 1 < len(allw) and not w['punct'] and allw[i + 1]['line'] == w['line'] and len(w['text']) + len(allw[i + 1]['text']) <= 12 and not (w['key'] and allw[i + 1]['key']):
        if not (len(w['text']) >= 7 and len(allw[i + 1]['text']) >= 5): g.append(allw[i + 1])
    groups.append(g); i += len(g)
caps = []
for k, g in enumerate(groups):
    t0 = g[0]['t0']; t1 = g[-1]['t1']
    nxt = groups[k + 1][0]['t0'] if k + 1 < len(groups) else TOTAL
    end = nxt if nxt - t1 < 0.3 else t1 + 0.12
    caps.append({'t0': t0, 't1': round(min(end, TOTAL), 3), 'w': [{'t': x['text'], 'k': x['key']} for x in g]})
def W(line, raw, k='t0'):
    for w in allw:
        if w['line'] == line and w['raw'].strip('.,:;') == raw: return w[k]
    raise KeyError((line, raw))
h6 = W('l01', 'laughed') - .04
cuts = {'h2': W('l01', 'king') - .05, 'h3': W('l01', 'of') - .03, 'h4': W('l01', 'eclipses') - .05, 'h5': W('l01', 'and') - .05, 'h6': h6,
        'h7': max(h6 + .5, TLines['l02']['start'] - .09 - .65), 'h8': TLines['l03']['start'] - .1, 'h9': W('l03', 'be') - .22, 'slap': h6 + .06,
        'dark': W('l07', 'dark'), 'x_30': W('l11', 'thirty'), 'x_19': W('l11', '19-year'), 'x_223': W('l11', '223-month'), 'x_one': W('l11', 'One'), 'x_roman': W('l10', 'Roman'), 'nobody_laughed': W('l08', 'laughed'), 'be': W('l03', 'be'), 'lose': W('l03', 'lose')}
cuts = {k: round(v, 3) for k, v in cuts.items()}
TL = {'total': TOTAL, 'lines': TLines, 'caps': caps, 'cuts': cuts}
open(os.path.join(EP, 'film', 'timeline.js'), 'w').write('window.TL=' + json.dumps(TL) + ';\n')
json.dump({'lines': TLines, 'total': TOTAL, 'words': allw, 'caps': caps, 'cuts': cuts}, open(os.path.join(EP, 'film', 'timeline.json'), 'w'), indent=0)
print('total', TOTAL, 'caps', len(caps)); 
for l, v in TLines.items(): print(l, v)

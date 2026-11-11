"""voice/durations.json + voice/words.json -> film/timeline.js (window.TL) + film/timeline.json. Run with any python.
Segments (narration.json ids) are placed one after another with the gaps below; captions are 1-2 words, never across punctuation or segments;
TL.cuts holds every shot start and the sound cue times so the picture and the mix use the same numbers."""
import os, json, re, difflib
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
dur = json.load(open(os.path.join(EP, 'voice', 'durations.json')))
words = json.load(open(os.path.join(EP, 'voice', 'words.json')))
LEAD, TAIL = 0.10, 0.14            # hard cut right after "years"
GAP = {'l01': .45, 'l02': .45, 'l03': .5, 'l04': .45, 'l05': .45, 'l06a': .22, 'l06b': .3, 'l06c': .62, 'l07': .45, 'l08': .45, 'l09': .5, 'l10': .6,
       'l11': .55, 'l12': .45, 'l13': .45, 'l14': .6, 'l15a': .25, 'l15b': 0}
KEYS = {'l01': [['ruined'], ['boil']], 'l02': [['screamed']], 'l06a': [['sloppy']], 'l06c': [['give', 'it', 'time']], 'l09': [['never', 'got', 'wet']], 'l10': [['sealed']],
        'l11': [['made', 'up']], 'l12': [['2023']], 'l14': [['never', 'closed']], 'l15a': [['give', 'it', 'time']], 'l15b': [['two', 'thousand', 'years']]}
def clean(s): return re.sub(r"[.,:;!?\"]", "", s)
t = LEAD; TLines = {}; allw = []
for e in lines:
    lid, text = e[0], e[1]
    TLines[lid] = {'start': round(t, 3), 'dur': dur[lid]}
    sw = text.split(); ws = words[lid]
    # merge ASR fragments ("-year", "'s") into the previous token
    ww = []
    for w, a, b in ws:
        if ww and (w.startswith('-') or w.startswith("'")): ww[-1][2] = b; ww[-1][0] += w
        else: ww.append([w, a, b])
    if len(ww) != len(sw):          # fall back: spread the script words over the spoken span by letter count
        a0, b0 = (ww[0][1], ww[-1][2]) if ww else (0, dur[lid]); L = [len(clean(x)) + 1 for x in sw]; tot = sum(L); acc = 0; ww = []
        for x, l in zip(sw, L): ww.append([x, a0 + (b0 - a0) * acc / tot, a0 + (b0 - a0) * (acc + l) / tot]); acc += l
        print('aligned by length:', lid)
    low = [clean(x).lower() for x in sw]; keyidx = set()
    for ph in KEYS.get(lid, []):
        for i in range(len(low) - len(ph) + 1):
            if low[i:i + len(ph)] == ph: keyidx.update(range(i, i + len(ph)))
    for i, (s, (w, a, b)) in enumerate(zip(sw, ww)):
        allw.append({'line': lid, 'raw': s, 'text': clean(s).replace('-', ' ').upper(), 'key': i in keyidx, 't0': round(t + a, 3), 't1': round(t + b, 3), 'punct': bool(re.search(r"[.,:;!?\"]$", s))})
    t += dur[lid] + GAP[lid]
TOTAL = round(t - GAP[lines[-1][0]] + TAIL, 3)
groups = []; i = 0
while i < len(allw):
    w = allw[i]; g = [w]
    if i + 1 < len(allw) and not w['punct'] and allw[i + 1]['line'] == w['line'] and len(w['text']) + len(allw[i + 1]['text']) <= 12 and w['key'] == allw[i + 1]['key']:
        if not (len(w['text']) >= 7 and len(allw[i + 1]['text']) >= 5): g.append(allw[i + 1])
    groups.append(g); i += len(g)
caps = []
for k, g in enumerate(groups):
    t0 = g[0]['t0']; t1 = g[-1]['t1']; nxt = groups[k + 1][0]['t0'] if k + 1 < len(groups) else TOTAL
    end = nxt if nxt - t1 < 0.3 else t1 + 0.12
    caps.append({'t0': t0, 't1': round(min(end, TOTAL), 3), 'w': [{'t': x['text'], 'k': x['key']} for x in g]})
def W(line, raw, k='t0', n=0):
    hits = [w for w in allw if w['line'] == line and clean(w['raw']).lower() == raw.lower()]
    return hits[n][k]
S = lambda lid: TLines[lid]['start']
cuts = {'s1a': 0, 's1b': W('l01', 'on') - .03, 's1c': W('l01', 'boil') - .05, 's2': S('l02') - .08, 's3': S('l03') - .08, 's4a': S('l04') - .08, 's4b': W('l04', 'He') - .05,
        's5': S('l05') - .08, 's6a': S('l06a') - .08, 's6b': W('l06b', 'The') - .05, 's7': S('l07') - .08, 's8': S('l08') - .08, 's9': S('l09') - .08, 's10': S('l10') - .08,
        's11': S('l11') - .08, 's12': S('l12') - .08, 's13': S('l13') - .08, 's14': S('l14') - .08, 's15a': S('l15a') - .08, 's15b': W('l15b', 'had') - .05,
        # cue times
        'ruined': W('l01', 'ruined'), 'boil': W('l01', 'boil'), 'screamed': W('l02', 'screamed'), 'flood': W('l03', 'flood'), 'soaked': W('l04', 'soaked'), 'threw': W('l04', 'threw'),
        'lumps': W('l05', 'lumps'), 'sloppy': W('l06a', 'Sloppy'), 'shrugged': W('l06b', 'shrugged'), 'give6': W('l06c', 'Give'), 'storm': W('l07', 'storm'), 'cracked7': W('l07', 'cracked'),
        'hit': W('l08', 'hit'), 'never': W('l09', 'never'), 'dissolved': W('l09', 'dissolved'), 'hardened': W('l09', 'hardened'), 'sealed': W('l10', 'sealed'), 'madeup': W('l11', 'made'),
        'lumps11': W('l11', 'lumps'), 'cracked12': W('l12', 'cracked'), 'two13': W('l13', 'Two'), 'stopped': W('l13', 'stopped'), 'never14': W('l14', 'never'), 'years': W('l15b', 'years')}
cuts = {k: round(v, 3) for k, v in cuts.items()}
TL = {'total': TOTAL, 'lines': TLines, 'caps': caps, 'cuts': cuts}
open(os.path.join(EP, 'film', 'timeline.js'), 'w').write('window.TL=' + json.dumps(TL) + ';\n')
json.dump({'lines': TLines, 'total': TOTAL, 'words': allw, 'caps': caps, 'cuts': cuts}, open(os.path.join(EP, 'film', 'timeline.json'), 'w'), indent=0)
print('total', TOTAL, 'caps', len(caps)); print(cuts)

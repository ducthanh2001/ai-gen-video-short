import json, numpy as np, soundfile as sf, re
sr = 24000
lines = json.load(open('narr/narration.json', encoding='utf-8'))
dur = json.load(open('narr/voice/durations.json'))
ids = [i for i, _ in lines]
# gap after each sentence (seconds)
def gap(i, nxt):
    line = i.split('_')[0]; nline = nxt.split('_')[0] if nxt else None
    if nxt is None: return 0
    base = 0.30 if line != nline else 0.30
    if line[0] == 'h': base = 0.22 if line == nline else 0.35
    if line != nline: base = max(base, 0.50)
    if i == 'a10_1': return 1.9
    if i == 'h5_2': return 0.7
    if i == 'a9_1': return 0.65
    if i in ('d8_2', 'c12_4', 'b13_3', 'a10_1', 'e12_1', 'd14_1'): return 0.9
    if i in ('d9_1',): return 0.9
    if i in ('c10_3',): return 0.8
    if i in ('b6_4', 'b3_1', 'h1_2', 'h2_2'): return 0.45
    if line == 'b3': return 0.2
    if line == 'e11' and nline == 'e11': return 0.35
    return base
t = 0.2; sent = []; parts = [np.zeros(int(0.2 * sr), dtype=np.float32)]
for k, (i, text) in enumerate(lines):
    a, r = sf.read(f'narr/voice/{i}.wav'); assert r == sr
    sent.append({'id': i, 's': round(t, 3), 'e': round(t + len(a) / sr, 3), 'text': text})
    parts.append(a.astype(np.float32)); t += len(a) / sr
    g = gap(i, ids[k + 1] if k + 1 < len(ids) else None)
    parts.append(np.zeros(int(g * sr), dtype=np.float32)); t += g
END_CARD = 9.0
parts.append(np.zeros(int(END_CARD * sr), dtype=np.float32)); t += END_CARD
sf.write('narration.wav', np.concatenate(parts), sr)
S = {s['id']: s for s in sent}
chap = [('a1_1', 'I · THE FIRST RULER OF THE SKY'), ('b1_1', 'II · THE STONE'), ('c1_1', 'III · THE TEN-YEAR WAR'), ('d1_1', 'IV · THE MONSTER'), ('d9_1', 'V · THE JAR IN MUNICH'), ('e1_1', 'VI · WHY ZEUS SWALLOWED METIS'), ('f4_1', '')]
js = 'window.SENT=' + json.dumps(sent, ensure_ascii=False) + ';window.END=' + str(round(t, 2)) + ';window.CHAPTERS=' + json.dumps([{'t': S[i]['s'], 'label': l} for i, l in chap]) + ';'
open('timing.js', 'w', encoding='utf-8').write(js)
print(len(sent), 'sentences, END', round(t, 1), 's =', round(t / 60, 2), 'min')
for i, l in chap: print(l, round(S[i]['s'] / 60, 3), S[i]['s'])

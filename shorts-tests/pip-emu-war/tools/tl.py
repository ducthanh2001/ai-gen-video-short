"""Timeline: places each voice line, then splits its caption into chunks of up to 3 words timed by character count.
Writes film/tl.json: {total, L:{id:[start,end]}, caps:[[t0,t1,[[word,hl],...]]]}"""
import json, os, re
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.load(open(os.path.join(P, 'narration.json'), encoding='utf-8'))
durs = json.load(open(os.path.join(P, 'voice', 'durations.json')))
GAP_BEFORE = {'L01': .45, 'L02': .22, 'L03': .55, 'L04': .4, 'L05': .35, 'L06': .5, 'L07': .45, 'L08': .35, 'L09': .4, 'L10': .6, 'L11': .35}
TAIL = 1.7
t = 0; L = {}; caps = []
for lid, cap, say in lines:
    t += GAP_BEFORE[lid]; d = durs[lid]; L[lid] = [round(t, 3), round(t + d, 3)]
    if '|' in cap: chunks = [seg.split() for seg in cap.split('|') if seg.strip()]
    else:
        chunks, cur = [], []
        for w in cap.split():
            cur.append(w)
            if len(cur) == 3 or re.search(r'[.,:?!]$', w): chunks.append(cur); cur = []
        if cur: chunks.append(cur)
    tot = sum(len(' '.join(c)) for c in chunks); u = t
    for c in chunks:
        dd = d * len(' '.join(c)) / tot
        caps.append([round(u - .05, 3), round(u + dd, 3), [[w.upper().rstrip('.'), bool(re.search(r'[0-9]', w) or (w.strip('.,:?!\'').isupper() and len(w.strip('.,:?!\'')) > 1))] for w in c]])
        u += dd
    t += d
total = round(t + TAIL, 3)
json.dump({'total': total, 'L': L, 'caps': caps}, open(os.path.join(P, 'film', 'tl.json'), 'w'), indent=1)
print('total', total, 's;', len(caps), 'caption chunks'); [print(k, v) for k, v in L.items()]

"""One Whisper pass per narration segment: ASR round-trip check against the script (ratio per line) + word timings -> voice/words.json.
Run with the anime venv python."""
import os, re, json, difflib, truststore
truststore.inject_into_ssl()
import numpy as np, soundfile as sf, soxr
from faster_whisper import WhisperModel
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
m = WhisperModel('small.en', device='cpu', compute_type='int8')
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def w2(n): return ONES[n] if n < 20 else TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
def num(n):
    n = int(n)
    if 2000 <= n <= 2099: return 'twenty ' + w2(n % 100) if n % 100 else 'two thousand'
    if n >= 1000: return (num(n // 1000) + ' thousand ' + (num(n % 1000) if n % 1000 else '')).strip()
    if n >= 100: return ONES[n // 100] + ' hundred ' + (w2(n % 100) if n % 100 else '')
    return w2(n)
def norm(s):
    s = s.lower().replace('-', ' ').replace(',', '').replace("builder's", 'builders').replace('m.i.t.', 'mit').replace('m i t', 'mit')
    s = s.replace('harbour', 'harbor'); s = re.sub(r'(\d)\s+(\d{3})\b', r'\1\2', s)
    s = re.sub(r'\d+', lambda k: num(k.group(0)), s)
    return re.sub(r'[^a-z ]', ' ', s).split()
out, bad = {}, 0
for e in lines:
    lid, text = e[0], e[1]
    a, sr = sf.read(os.path.join(EP, 'voice', lid + '.wav'), dtype='float32'); a = soxr.resample(a, sr, 16000).astype(np.float32)
    segs, _ = m.transcribe(a, beam_size=5, language='en', word_timestamps=True, initial_prompt='Roman concrete, quicklime, MIT.')
    ws = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words]
    hyp = ' '.join(w[0] for w in ws); R, Hh = norm(text), norm(hyp); sm = difflib.SequenceMatcher(a=R, b=Hh)
    diffs = [(' '.join(R[i1:i2]), ' '.join(Hh[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    bad += sm.ratio() < 1; out[lid] = ws
    print(f'{lid} {sm.ratio():.3f}', diffs[:4], flush=True)
json.dump(out, open(os.path.join(EP, 'voice', 'words.json'), 'w'), indent=0)
print('lines not exact:', bad)

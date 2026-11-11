"""ASR on the final mix vs the script (B02) + caption start vs spoken word start. Run with the anime venv python."""
import os, re, json, difflib, truststore
truststore.inject_into_ssl()
import numpy as np, soundfile as sf, soxr
from faster_whisper import WhisperModel
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def w2(n): return ONES[n] if n < 20 else TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
def num(n):
    n = int(n)
    if 2000 <= n <= 2099: return ('twenty ' + w2(n % 100)) if n % 100 else 'two thousand'
    if n >= 1000: return (num(n // 1000) + ' thousand ' + (num(n % 1000) if n % 1000 else '')).strip()
    if n >= 100: return ONES[n // 100] + ' hundred ' + (w2(n % 100) if n % 100 else '')
    return w2(n)
def norm(s):
    s = s.lower().replace('-', ' ').replace(',', '').replace("builder's", 'builders').replace('m.i.t.', 'mit').replace('m i t', 'mit').replace('harbour', 'harbor')
    s = re.sub(r'(\d)\s+(\d{3})\b', r'\1\2', s); s = re.sub(r'\d+', lambda k: num(k.group(0)), s)
    return re.sub(r'[^a-z ]', ' ', s).split()
a, sr = sf.read(os.path.join(EP, 'audio_mix.wav'), dtype='float32'); a = a.mean(1) if a.ndim > 1 else a; a = soxr.resample(a, sr, 16000).astype(np.float32)
m = WhisperModel('small.en', device='cpu', compute_type='int8'); segs, _ = m.transcribe(a, beam_size=5, language='en', word_timestamps=True, initial_prompt='Roman concrete, quicklime, MIT.')
Wd = [(w.word.strip(), w.start) for s in segs for w in s.words]
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
ref = norm(' '.join(w['raw'] for w in TL['words'])); hyp = norm(' '.join(w[0] for w in Wd))
sm = difflib.SequenceMatcher(a=ref, b=hyp); print('transcript match ratio', round(sm.ratio(), 3)); print([(' '.join(ref[i1:i2]), ' '.join(hyp[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal'])
tokw = []
for wi, w in enumerate(TL['words']): tokw += [wi] * len(norm(w['raw']))
asr_t = []
for t, s in Wd: asr_t += [s] * max(1, len(norm(t)))
d = [TL['words'][tokw[ri]]['t0'] - asr_t[hi] for op, i1, i2, j1, j2 in sm.get_opcodes() if op == 'equal' for ri, hi in zip(range(i1, i2), range(j1, j2)) if hi < len(asr_t)]
d = np.array(d); print('caption start minus spoken start (s): median %.3f, p5 %.3f, p95 %.3f' % (np.median(d), np.percentile(d, 5), np.percentile(d, 95)))

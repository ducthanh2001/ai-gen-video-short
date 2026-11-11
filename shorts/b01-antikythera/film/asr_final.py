"""ASR on the final mix: transcript vs script, and caption start vs spoken word start"""
import os, re, json, truststore
truststore.inject_into_ssl()
import numpy as np, soundfile as sf, soxr
from faster_whisper import WhisperModel
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a, sr = sf.read(os.path.join(EP, 'audio_mix.wav'), dtype='float32'); a = a.mean(1) if a.ndim > 1 else a; a = soxr.resample(a, sr, 16000).astype(np.float32)
m = WhisperModel('small.en', device='cpu', compute_type='int8'); segs, _ = m.transcribe(a, beam_size=5, language='en', word_timestamps=True)
W = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
def norm(s):
    s = s.lower().replace('-', ' ').replace(',000', ' thousand'); s = re.sub(r'\b1901\b', 'nineteen oh one', s); s = re.sub(r'\b30\b', 'thirty', s); s = re.sub(r'\b40\b', 'forty', s); s = re.sub(r'\b19\b', 'nineteen', s); s = re.sub(r'\b223\b', 'two hundred twenty three', s); s = re.sub(r'\b2\b', 'two', s)
    return re.sub(r'[^a-z ]', ' ', s).split()
hyp = norm(' '.join(w[0] for w in W)); ref = norm(' '.join(w['raw'] for w in TL['words']))
import difflib; sm = difflib.SequenceMatcher(a=ref, b=hyp); print('transcript match ratio', round(sm.ratio(), 3)); print([(' '.join(ref[i1:i2]), ' '.join(hyp[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal'])
# caption timing: for each script word find the ASR word via opcodes mapping
pairs = []
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal': pairs += list(zip(range(i1, i2), range(j1, j2)))
# map ref tokens back to caption words (ref tokens may be split from words); use first token index per word
tokw = []; 
for wi, w in enumerate(TL['words']): tokw += [wi] * len(norm(w['raw']))
# ASR tokens index -> time: asr words may be digits; approximate by token index among W
asr_tok = []
for wi, (t, s, e) in enumerate(W): asr_tok += [(s, e)] * max(1, len(norm(t)))
d = []
for ri, hi in pairs:
    if hi < len(asr_tok): d.append(TL['words'][tokw[ri]]['t0'] - asr_tok[hi][0])
d = np.array(d); print('caption start minus spoken start (s): median %.3f, p5 %.3f, p95 %.3f, max abs %.3f' % (np.median(d), np.percentile(d, 5), np.percentile(d, 95), np.abs(d).max()))

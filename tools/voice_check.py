"""Whisper check of the audition samples: word accuracy vs the script, per voice."""
import os, re, truststore
truststore.inject_into_ssl()
from faster_whisper import WhisperModel
D = r'C:/Users/PC/kenh-youtube/ep01-price-of-light/voice-samples'
REF = ("you just turned on a light it cost you about two tenths of a second of work in eighteen hundred the same amount of light cost five and a half hours "
       "in ancient babylon more than a full working week this is one of the biggest price collapses in human history "
       "and for almost two hundred years the people whose job was to measure prices mostly missed it").split()
NUM = {'1800': 'eighteen hundred', '200': 'two hundred', '5': 'five', '2': 'two'}
m = WhisperModel('base.en', device='cpu', compute_type='int8')
def norm(s):
    s = s.lower().replace('-', ' ')
    for k, v in NUM.items(): s = re.sub(rf'\b{k}\b', v, s)
    return re.sub(r'[^a-z ]', ' ', s).split()
import difflib
for f in sorted(os.listdir(D)):
    if not f.endswith('.wav') or f.startswith('all'): continue
    import soundfile as sf, soxr, numpy as np
    a, sr = sf.read(os.path.join(D, f), dtype='float32'); a = soxr.resample(a, sr, 16000).astype(np.float32)
    segs, _ = m.transcribe(a, beam_size=5, language='en')
    hyp = norm(' '.join(s.text for s in segs))
    sm = difflib.SequenceMatcher(a=REF, b=hyp); acc = sm.ratio()
    diffs = [(' '.join(REF[i1:i2]), ' '.join(hyp[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    print(f'{f[:-4]:12s} match {acc:.3f}', diffs[:4])

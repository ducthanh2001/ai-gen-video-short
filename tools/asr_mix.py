"""Whisper the finished mix (voice + music + foley) and compare with the whole narration: is the voice still clear over the music?
usage: python asr_mix.py <ep_dir>"""
import os, re, sys, json, difflib, truststore
truststore.inject_into_ssl()
import numpy as np, soundfile as sf, soxr
from faster_whisper import WhisperModel
EP = sys.argv[1]
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
a, sr = sf.read(os.path.join(EP, 'audio', 'mix.wav'), dtype='float32'); a = soxr.resample(a.mean(1), sr, 16000).astype(np.float32)
m = WhisperModel('small.en', device='cpu', compute_type='int8')
segs, _ = m.transcribe(a, beam_size=5, language='en')
hyp = ' '.join(s.text for s in segs)
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def w2(n): return ONES[n] if n < 20 else TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
def words(n):
    n = int(n)
    if 1100 <= n <= 1999 and n % 100 == 0: return w2(n // 100) + ' hundred'
    if 1000 < n < 2100 and n % 100: return w2(n // 100) + ' ' + (('oh ' + ONES[n % 100]) if n % 100 < 10 else w2(n % 100))
    if n >= 1000: return (words(n // 1000) + ' thousand ' + (words(n % 1000) if n % 1000 else '')).strip()
    if n >= 100: return ONES[n // 100] + ' hundred ' + (w2(n % 100) if n % 100 else '')
    return w2(n)
def norm(s):
    s = s.lower().replace('-', ' ').replace(',', '')
    s = re.sub(r'(\d+)s\b', lambda k: words(k.group(1)) + 's', s)
    s = re.sub(r'\d+', lambda k: words(k.group(0)), s)
    s = s.replace('b.c.', 'bc').replace('b c', 'bc')
    return re.sub(r'[^a-z ]', ' ', s).split()
R, H = norm(' '.join(t for _, t in lines)), norm(hyp)
sm = difflib.SequenceMatcher(a=R, b=H, autojunk=False)
print(f'whole-film match {sm.ratio():.3f}  ({len(R)} words in script, {len(H)} heard)')
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op != 'equal': print(f'  {op}: "{" ".join(R[i1:i2])}" → "{" ".join(H[j1:j2])}"')

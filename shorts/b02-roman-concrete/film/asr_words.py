"""word timings per line: voice/words.json {id: [[word, t0, t1], ...]} (relative to line wav start)"""
import os, sys, json, truststore
truststore.inject_into_ssl()
import numpy as np, soundfile as sf, soxr
from faster_whisper import WhisperModel
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
m = WhisperModel('small.en', device='cpu', compute_type='int8')
out = {}
for lid, text in lines:
    a, sr = sf.read(os.path.join(EP, 'voice', lid + '.wav'), dtype='float32'); a = soxr.resample(a, sr, 16000).astype(np.float32)
    segs, _ = m.transcribe(a, beam_size=5, language='en', word_timestamps=True)
    ws = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words]
    out[lid] = ws; print(lid, ws, flush=True)
json.dump(out, open(os.path.join(EP, 'voice', 'words.json'), 'w'), indent=0)

"""Narration with Kokoro: <ep>/narration.json [[id, text], ...] → <ep>/voice/<id>.wav (24 kHz mono) + voice/durations.json
usage: python narrate.py <ep_dir> [voice=af_heart] [speed=.95] [ids...]"""
import os, sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
EP = sys.argv[1]; VOICE = sys.argv[2] if len(sys.argv) > 2 else 'af_heart'; SPEED = float(sys.argv[3]) if len(sys.argv) > 3 else .95
ONLY = set(sys.argv[4:])
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
OUT = os.path.join(EP, 'voice'); os.makedirs(OUT, exist_ok=True)
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
dpath = os.path.join(OUT, 'durations.json')
durs = json.load(open(dpath)) if os.path.exists(dpath) else {}
for lid, text in lines:
    if ONLY and lid not in ONLY: continue
    a, sr = k.create(text, voice=VOICE, speed=SPEED, lang='en-us')
    a = a.astype(np.float32)   # native 24 kHz; the mixer resamples
    # trim silence at both ends (keep 40 ms), so the edit decides the pauses
    env = np.abs(a) > .01; i0 = max(0, np.argmax(env) - sr // 25); i1 = min(len(a), len(a) - np.argmax(env[::-1]) + sr // 25)
    a = a[i0:i1]
    sf.write(os.path.join(OUT, lid + '.wav'), a, sr)
    durs[lid] = round(len(a) / sr, 3); print(lid, durs[lid], flush=True)
json.dump(durs, open(dpath, 'w'), indent=1)
print('total', round(sum(durs.values()), 1), 's')

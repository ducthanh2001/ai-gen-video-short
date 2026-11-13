"""Kokoro narration for the Emu War Short. usage: python narrate.py <voice> <speed> [ids...]
Writes voice/<id>.wav (trimmed) and voice/durations.json."""
import os, sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = sys.argv[1]; SPEED = float(sys.argv[2]); ONLY = set(sys.argv[3:])
lines = json.load(open(os.path.join(P, 'narration.json'), encoding='utf-8'))
OUT = os.path.join(P, 'voice'); os.makedirs(OUT, exist_ok=True)
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
dp = os.path.join(OUT, 'durations.json'); durs = json.load(open(dp)) if os.path.exists(dp) else {}
for lid, cap, say in lines:
    if ONLY and lid not in ONLY: continue
    a, sr = k.create(say, voice=VOICE, speed=SPEED, lang='en-us'); a = a.astype(np.float32)
    env = np.abs(a) > .01; i0 = max(0, np.argmax(env) - sr // 25); i1 = min(len(a), len(a) - np.argmax(env[::-1]) + sr // 25); a = a[i0:i1]
    sf.write(os.path.join(OUT, lid + '.wav'), a, sr); durs[lid] = round(len(a) / sr, 3); print(lid, durs[lid], flush=True)
json.dump(durs, open(dp, 'w'), indent=1); print('total speech', round(sum(durs.values()), 2), 's')

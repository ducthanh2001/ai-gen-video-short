"""Kokoro narration for B01: same as tools/narrate.py plus a pronunciation map (film/pronounce.json), because Kokoro's text front end reads
"1901" as "nineteen hundred one". The script wording and the captions stay "1901"; only the text sent to the TTS says "nineteen oh one".
usage: python narrate_b01.py <voice> <speed> [ids...]"""
import os, sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = sys.argv[1]; SPEED = float(sys.argv[2]); ONLY = set(sys.argv[3:])
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
pron = json.load(open(os.path.join(EP, 'film', 'pronounce.json'), encoding='utf-8'))
OUT = os.path.join(EP, 'voice'); os.makedirs(OUT, exist_ok=True)
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
dpath = os.path.join(OUT, 'durations.json'); durs = json.load(open(dpath)) if os.path.exists(dpath) else {}
for lid, text in lines:
    if ONLY and lid not in ONLY: continue
    say = text
    for a, b in pron.items(): say = say.replace(a, b)
    a, sr = k.create(say, voice=VOICE, speed=SPEED, lang='en-us'); a = a.astype(np.float32)
    env = np.abs(a) > .01; i0 = max(0, np.argmax(env) - sr // 25); i1 = min(len(a), len(a) - np.argmax(env[::-1]) + sr // 25); a = a[i0:i1]   # 40 ms edge trim
    sf.write(os.path.join(OUT, lid + '.wav'), a, sr); durs[lid] = round(len(a) / sr, 3); print(lid, durs[lid], flush=True)
json.dump(durs, open(dpath, 'w'), indent=1); print('total', round(sum(durs.values()), 1), 's')

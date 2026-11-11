"""Kokoro narration for B02. narration.json entries: [id, text] (narrator voice) or [id, text, voice, speed] (dialogue).
"MASTER" as a voice name means the master builder's voice chosen in film/voices.json. film/pronounce.json maps caption spellings to TTS text.
usage: python narrate_b02.py <narrator_voice> <speed> [ids...]"""
import os, sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = sys.argv[1]; SPEED = float(sys.argv[2]); ONLY = set(sys.argv[3:])
lines = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
pron = json.load(open(os.path.join(EP, 'film', 'pronounce.json'), encoding='utf-8'))
vj = json.load(open(os.path.join(EP, 'film', 'voices.json'))) if os.path.exists(os.path.join(EP, 'film', 'voices.json')) else {}
OUT = os.path.join(EP, 'voice'); os.makedirs(OUT, exist_ok=True)
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
dpath = os.path.join(OUT, 'durations.json'); durs = json.load(open(dpath)) if os.path.exists(dpath) else {}
for e in lines:
    lid, text = e[0], e[1]
    if ONLY and lid not in ONLY: continue
    voice = e[2] if len(e) > 2 else VOICE; speed = e[3] if len(e) > 3 else SPEED
    if voice == 'MASTER': voice = vj.get('master', 'bm_george')
    say = text
    for a, b in pron.items(): say = say.replace(a, b)
    a, sr = k.create(say, voice=voice, speed=speed, lang='en-us'); a = a.astype(np.float32)
    env = np.abs(a) > .01; i0 = max(0, np.argmax(env) - sr // 25); i1 = min(len(a), len(a) - np.argmax(env[::-1]) + sr // 25); a = a[i0:i1]   # 40 ms edge trim
    sf.write(os.path.join(OUT, lid + '.wav'), a, sr); durs[lid] = round(len(a) / sr, 3); print(lid, voice, speed, durs[lid], flush=True)
json.dump(durs, open(dpath, 'w'), indent=1); print('total', round(sum(durs.values()), 1), 's')

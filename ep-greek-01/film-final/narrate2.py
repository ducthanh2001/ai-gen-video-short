"""Split ../narration.json into sentences (narr/narration.json) and synthesise each with Kokoro.
TTS-only respellings fix names the voice misreads; captions keep the real spelling.
usage: python narrate2.py [voice=af_heart] [speed=0.85] [outdir=narr/voice]"""
import os, re, sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'af_heart'; SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 0.85
OUT = os.path.join(HERE, sys.argv[3] if len(sys.argv) > 3 else 'narr/voice')
RESPELL = [(r'\bHestia\b', 'Hestya'), (r'\bHera\b', 'Hayra'), (r'\bRhea\b', 'Ria')]   # checked with Whisper
src = json.load(open(os.path.join(HERE, '..', 'narration.json'), encoding='utf-8'))
sent = []
for lid, text in src:
    t = text.replace('B.C.', 'B_C_')
    for i, p in enumerate(re.split(r'(?<=[.?!])\s+(?=[A-Z"])', t), 1): sent.append([f'{lid}_{i}', p.replace('B_C_', 'B.C.')])
json.dump(sent, open(os.path.join(HERE, 'narr', 'narration.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.remove(os.path.join(OUT, f))
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
durs = {}
for lid, text in sent:
    say = text
    for a, b in RESPELL: say = re.sub(a, b, say)
    a, sr = k.create(say, voice=VOICE, speed=SPEED, lang='en-gb' if VOICE[0] == 'b' else 'en-us'); a = a.astype(np.float32)
    env = np.abs(a) > .01; i0 = max(0, np.argmax(env) - sr // 25); i1 = min(len(a), len(a) - np.argmax(env[::-1]) + sr // 25); a = a[i0:i1]
    sf.write(os.path.join(OUT, lid + '.wav'), a, sr); durs[lid] = round(len(a) / sr, 3)
json.dump(durs, open(os.path.join(OUT, 'durations.json'), 'w'), indent=1)
print(len(sent), 'sentences', round(sum(durs.values()), 1), 's speech')

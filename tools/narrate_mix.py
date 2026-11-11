"""Channel narration (Clay & Myth): split <ep>/narration.json into sentences -> <ep>/narr/narration.json,
synthesise each with Kokoro using the channel voice (a mix of voice styles), TTS-only respellings for names.
usage: python narrate_mix.py <ep_dir> [voice=mix:am_onyx:0.6,am_michael:0.4] [speed=0.88] [lang=en-us]"""
import os, re, sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
EP = sys.argv[1]
VSPEC = sys.argv[2] if len(sys.argv) > 2 else 'mix:am_onyx:0.6,am_michael:0.4'
SPEED = float(sys.argv[3]) if len(sys.argv) > 3 else 0.88
LANG = sys.argv[4] if len(sys.argv) > 4 else 'en-us'
RESPELL = [(r'\bHestia\b', 'Hestya'), (r'\bHera\b', 'Hayra'), (r'\bRhea\b', 'Ria')]   # Whisper-checked; extend per episode
extra = os.path.join(EP, 'respell.json')
if os.path.exists(extra): RESPELL += [(r'\b' + a + r'\b', b) for a, b in json.load(open(extra, encoding='utf-8')).items()]
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
if VSPEC.startswith('mix:'):
    voice = sum(float(w) * k.get_voice_style(n) for n, w in (p.split(':') for p in VSPEC[4:].split(',')))
else: voice = VSPEC
src = json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8'))
sent = []
for lid, text in src:
    t = text.replace('B.C.', 'B_C_')
    for i, p in enumerate(re.split(r'(?<=[.?!])\s+(?=[A-Z"])', t), 1): sent.append([f'{lid}_{i}', p.replace('B_C_', 'B.C.')])
os.makedirs(os.path.join(EP, 'narr', 'voice'), exist_ok=True)
json.dump(sent, open(os.path.join(EP, 'narr', 'narration.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
OUT = os.path.join(EP, 'narr', 'voice')
for f in os.listdir(OUT): os.remove(os.path.join(OUT, f))
durs = {}
for lid, text in sent:
    say = text
    for a, b in RESPELL: say = re.sub(a, b, say)
    a, sr = k.create(say, voice=voice, speed=SPEED, lang=LANG); a = a.astype(np.float32)
    env = np.abs(a) > .01; i0 = max(0, np.argmax(env) - sr // 25); i1 = min(len(a), len(a) - np.argmax(env[::-1]) + sr // 25); a = a[i0:i1]
    sf.write(os.path.join(OUT, lid + '.wav'), a, sr); durs[lid] = round(len(a) / sr, 3)
json.dump(durs, open(os.path.join(OUT, 'durations.json'), 'w'), indent=1)
print(len(sent), 'sentences', round(sum(durs.values()), 1), 's speech')

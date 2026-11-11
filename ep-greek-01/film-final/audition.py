"""Read the opening (h1-h5) in several Kokoro voices -> auditions/<voice>.wav, for the owner to pick a channel voice."""
import os, re, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'auditions'); os.makedirs(OUT, exist_ok=True)
RESPELL = [(r'\bHestia\b', 'Hestya'), (r'\bHera\b', 'Hayra'), (r'\bRhea\b', 'Ria')]
sent = [s for s in json.load(open(os.path.join(HERE, 'narr', 'narration.json'), encoding='utf-8')) if s[0][0] == 'h']
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
for v in ['af_heart', 'am_michael', 'bm_george', 'am_onyx', 'bf_emma']:
    parts = []
    for lid, text in sent:
        say = text
        for a, b in RESPELL: say = re.sub(a, b, say)
        a, sr = k.create(say, voice=v, speed=0.85, lang='en-us' if v[0] == 'a' else 'en-gb')
        parts += [a.astype(np.float32), np.zeros(int(sr * (0.35 if lid[:2] != lid[:2] else 0.3)), np.float32)]
    sf.write(os.path.join(OUT, v + '.wav'), np.concatenate(parts), sr); print(v, flush=True)

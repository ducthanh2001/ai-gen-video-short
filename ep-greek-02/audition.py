"""Voice auditions for the channel: the ep02 opening read by deep, warm Kokoro voices, mixes and processed variants.
Writes auditions/raw/<name>.wav (24 kHz). Post-processing is done with ffmpeg afterwards."""
import os, re, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'auditions', 'raw'); os.makedirs(OUT, exist_ok=True)
lines = [t for i, t in json.load(open(os.path.join(HERE, 'narration.json'), encoding='utf-8')) if i[0] == 'h']
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
V = lambda n: k.get_voice_style(n)
CAST = {
  'am_onyx': ('am_onyx', 'en-us'), 'am_michael': ('am_michael', 'en-us'), 'am_fenrir': ('am_fenrir', 'en-us'), 'am_eric': ('am_eric', 'en-us'),
  'bm_lewis': ('bm_lewis', 'en-gb'), 'bm_daniel': ('bm_daniel', 'en-gb'), 'bm_fable': ('bm_fable', 'en-gb'),
  'mix_onyx_michael': (0.6 * V('am_onyx') + 0.4 * V('am_michael'), 'en-us'),
  'mix_lewis_onyx': (0.55 * V('bm_lewis') + 0.45 * V('am_onyx'), 'en-gb'),
}
SPEED = 0.88
for name, (voice, lang) in CAST.items():
    parts = []
    for t in lines:
        a, sr = k.create(t, voice=voice, speed=SPEED, lang=lang); parts += [a.astype(np.float32), np.zeros(int(sr * 0.45), np.float32)]
    sf.write(os.path.join(OUT, name + '.wav'), np.concatenate(parts), sr); print(name, flush=True)

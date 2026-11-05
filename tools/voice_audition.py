"""Kokoro voice audition: the Ep 01 cold open read by several narrator candidates → voice-samples/<voice>.wav + all_voices.wav"""
import os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
OUT = r'C:/Users/PC/kenh-youtube/ep01-price-of-light/voice-samples'
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
TEXT = ("You just turned on a light. It cost you about two-tenths of a second of work. "
        "In eighteen hundred, the same amount of light cost five and a half hours. "
        "In ancient Babylon, more than a full working week. "
        "This is one of the biggest price collapses in human history. "
        "And for almost two hundred years, the people whose job was to measure prices… mostly missed it.")
VOICES = [('af_heart', 'en-us'), ('af_bella', 'en-us'), ('am_michael', 'en-us'), ('am_fenrir', 'en-us'), ('am_puck', 'en-us'),
          ('bm_george', 'en-gb'), ('bm_fable', 'en-gb'), ('bf_emma', 'en-gb')]
os.makedirs(OUT, exist_ok=True)
allv, SR = [], None
for v, lang in VOICES:
    a, sr = k.create(TEXT, voice=v, speed=.95, lang=lang); SR = sr
    a = a / max(1e-6, np.abs(a).max()) * .9
    sf.write(os.path.join(OUT, f'{v}.wav'), a, sr)
    t = np.arange(int(.18 * sr)) / sr; beep = np.sin(2 * np.pi * 880 * t) * np.exp(-t / .05) * .25
    allv += [beep, np.zeros(int(.5 * sr)), a, np.zeros(int(1.2 * sr))]
    print(v, round(len(a) / sr, 1), 's')
sf.write(os.path.join(OUT, 'all_voices.wav'), np.concatenate(allv), SR)
print('all_voices.wav')
